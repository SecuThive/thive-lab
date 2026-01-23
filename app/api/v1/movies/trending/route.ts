import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ratelimit } from "@/lib/rate-limit";
import { simpleRateLimit } from "@/lib/simple-rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    // Rate limiting
    let rateLimitHeaders = {};
    let rateLimitSuccess = true;
    
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      rateLimitHeaders = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      };
      
      rateLimitSuccess = success;
    } catch (rateLimitError) {
      console.warn("Upstash not configured, using simple rate limiter");
      const { success, limit, reset, remaining } = simpleRateLimit(ip, 10, 10000);
      
      rateLimitHeaders = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      };
      
      rateLimitSuccess = success;
    }
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit_param = parseInt(searchParams.get("limit") || "50");
    const min_rating = parseFloat(searchParams.get("min_rating") || "6.0");
    const limit_value = Math.min(Math.max(1, limit_param), 100);

    // Get recent movies with good ratings and popularity
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Last 3 months
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .gte("release_date", cutoffDateStr)
      .gte("rating", min_rating)
      .limit(limit_value);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data", message: error.message },
        { status: 500, headers: rateLimitHeaders }
      );
    }

    // Calculate trending score: (rating * 10) + (popularity / 10) + recency_bonus
    const now = new Date();
    const rankedData = (data || []).map(movie => {
      const releaseDate = new Date(movie.release_date);
      const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Newer movies get higher bonus (max 30 days = 30 points, decays linearly)
      const recencyBonus = Math.max(0, 30 - (daysSinceRelease / 3));
      
      const trendingScore = 
        (movie.rating || 0) * 10 + 
        (movie.popularity || 0) / 10 + 
        recencyBonus;
      
      return {
        ...movie,
        trending_score: Math.round(trendingScore * 10) / 10,
      };
    }).sort((a, b) => b.trending_score - a.trending_score);

    return NextResponse.json(
      {
        success: true,
        data: rankedData,
        meta: {
          count: rankedData.length,
          limit: limit_value,
          filters: {
            min_rating,
            months_back: 3,
          },
          description: "Trending movies based on recency, rating, and popularity",
          note: "trending_score = (rating × 10) + (popularity / 10) + recency_bonus",
        },
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

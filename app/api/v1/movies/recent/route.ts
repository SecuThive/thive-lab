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
    const min_rating = parseFloat(searchParams.get("min_rating") || "0");
    const months_back = parseInt(searchParams.get("months_back") || "6");
    const limit_value = Math.min(Math.max(1, limit_param), 100);

    // Calculate cutoff date (6 months ago by default)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months_back);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // Get recent releases
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .gte("release_date", cutoffDateStr)
      .gte("rating", min_rating)
      .order("release_date", { ascending: false })
      .limit(limit_value);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data", message: error.message },
        { status: 500, headers: rateLimitHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        meta: {
          count: data?.length || 0,
          limit: limit_value,
          filters: {
            min_rating,
            months_back,
            cutoff_date: cutoffDateStr,
          },
          description: "Recently released movies sorted by release date",
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

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
    const max_price = parseFloat(searchParams.get("max_price") || "20");
    const limit_value = Math.min(Math.max(1, limit_param), 100);

    // Get games with good price-to-quality ratio
    // Best value = high metacritic score + high discount + low final price
    const { data, error } = await supabase
      .from("steam_deals")
      .select("*")
      .not("metacritic_score", "is", null)
      .gte("metacritic_score", 70)
      .gte("discount_percent", 50)
      .lte("final_price", max_price)
      .limit(limit_value);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data", message: error.message },
        { status: 500, headers: rateLimitHeaders }
      );
    }

    // Calculate value score: (metacritic_score * discount_percent) / final_price
    // Higher score = better value
    const rankedData = (data || []).map(game => {
      const valueScore = game.metacritic_score && game.final_price > 0
        ? (game.metacritic_score * game.discount_percent) / Math.max(game.final_price, 1)
        : 0;
      
      return {
        ...game,
        value_score: Math.round(valueScore),
      };
    }).sort((a, b) => b.value_score - a.value_score);

    return NextResponse.json(
      {
        success: true,
        data: rankedData,
        meta: {
          count: rankedData.length,
          limit: limit_value,
          filters: {
            max_price,
            min_metacritic: 70,
            min_discount: 50,
          },
          description: "Best value games - high quality, deep discounts, low prices",
          note: "value_score = (metacritic_score × discount_percent) / final_price",
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

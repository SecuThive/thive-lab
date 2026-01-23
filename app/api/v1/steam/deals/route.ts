import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ratelimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (optional - only if Upstash is configured)
    let rateLimitHeaders = {};
    try {
      const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      rateLimitHeaders = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      };

      if (!success) {
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
    } catch (rateLimitError) {
      console.warn("Rate limiting not configured:", rateLimitError);
      // Continue without rate limiting if Upstash is not configured
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit_param = parseInt(searchParams.get("limit") || "50");
    const steam_deck = searchParams.get("steam_deck") === "true";
    const min_discount = parseInt(searchParams.get("min_discount") || "0");

    // Validate parameters
    const limit_value = Math.min(Math.max(1, limit_param), 100); // Clamp between 1-100

    // Build query
    let query = supabase
      .from("steam_deals")
      .select("*")
      .gte("discount_percent", min_discount)
      .order("discount_percent", { ascending: false })
      .limit(limit_value);

    // Add steam_deck filter if requested
    if (steam_deck) {
      query = query.eq("steam_deck_compatible", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch data", message: error.message },
        { status: 500 }
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
            steam_deck,
            min_discount,
          },
        },
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

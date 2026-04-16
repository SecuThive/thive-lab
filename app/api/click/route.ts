import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { slug, category, position } = await req.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const { error } = await supabase.rpc("log_affiliate_click", {
      p_slug: slug,
      p_category: category ?? null,
      p_position: position ?? null,
    });

    if (error) {
      console.error("[click] rpc error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[click] unexpected:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

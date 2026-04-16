import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    // SECURITY DEFINER RPC → RLS 우회, anon key로 호출 가능
    const { error } = await supabase.rpc("increment_view_count", {
      post_slug: slug,
    });

    if (error) {
      console.error("[view] rpc error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[view] unexpected:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

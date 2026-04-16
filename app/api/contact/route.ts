import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VALID_TYPES = ["상품 추천 요청", "제휴/협업", "버그 신고", "기타"];

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해주세요." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "문의 내용을 10자 이상 입력해주세요." }, { status: 400 });
    }

    const { error } = await supabase.from("contact_messages").insert({
      name:    name.trim().slice(0, 50),
      email:   email.trim().slice(0, 100),
      type:    VALID_TYPES.includes(type) ? type : "기타",
      message: message.trim().slice(0, 2000),
    });

    if (error) {
      console.error("[contact] insert error:", error.message);
      return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] unexpected:", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("waitlist")
      .insert([{ email: email.toLowerCase().trim() }])
      .select()
      .single();

    if (error) {
      // 중복 이메일 처리
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, message: "This email is already on the waitlist." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

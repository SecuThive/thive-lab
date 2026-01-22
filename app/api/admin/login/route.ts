import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { success: false, message: "서버 설정 오류" },
        { status: 500 }
      );
    }

    if (username === adminUsername && password === adminPassword) {
      // 성공 시 토큰 생성 (간단한 랜덤 문자열)
      const token = Buffer.from(
        `${username}:${Date.now()}:${Math.random()}`
      ).toString("base64");

      return NextResponse.json({
        success: true,
        token,
      });
    }

    return NextResponse.json(
      { success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

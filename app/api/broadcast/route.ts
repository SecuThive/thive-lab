import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, projectPreference, notifyOnLaunch } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const preference =
      typeof projectPreference === "string" && projectPreference.length > 0
        ? projectPreference
        : "all";
    const shouldNotify = Boolean(notifyOnLaunch);

    const payload = {
      email: email.toLowerCase().trim(),
      project_preference: preference,
      notify_on_launch: shouldNotify,
    };

    const { data, error } = await supabase
      .from("broadcast_subscribers")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: true,
            message: "You are already set to receive these launch updates.",
            data: null,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Failed to save broadcast subscription." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription saved. Stay tuned for launch-day emails.",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

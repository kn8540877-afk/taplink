import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";


const EVENT_TYPES = [
  "profile_view",
  "qr_scan",
  "contact_click",
  "social_click",
] as const;

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const expectedOrigin = request.nextUrl.origin;

    if (!origin || origin !== expectedOrigin) {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }

    if (request.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";

    if (
      !userAgent ||
      /bot|crawler|spider|slurp|headless|preview|facebookexternalhit|whatsapp/i.test(userAgent)
    ) {
      return NextResponse.json({ success: true, recorded: false });
    }

    const ip =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    if (!ip) {
      return NextResponse.json({ error: "Unable to identify visitor." }, { status: 400 });
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const slug = data.slug;
    const eventType = data.eventType;
    const target = data.target ?? null;

    if (
      typeof slug !== "string" ||
      !/^[a-z0-9-]{1,100}$/.test(slug) ||
      typeof eventType !== "string" ||
      !EVENT_TYPES.includes(eventType as (typeof EVENT_TYPES)[number]) ||
      (target !== null && (typeof target !== "string" || target.length > 80))
    ) {
      return NextResponse.json({ error: "Invalid event data." }, { status: 400 });
    }

    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!secret) {
      throw new Error("Missing analytics server secret.");
    }

    const visitorHash = createHmac("sha256", secret)
      .update(`${ip}|${userAgent}`)
      .digest("hex");

    const supabase = createAdminClient();

    const { data: recorded, error } = await supabase.rpc(
      "record_profile_analytics_event",
      {
        p_profile_slug: slug,
        p_event_type: eventType,
        p_event_target: target,
        p_visitor_hash: visitorHash,
      }
    );

    if (error) {
      console.error("Analytics recording failed:", error.message);
      return NextResponse.json({ error: "Unable to record event." }, { status: 500 });
    }

    return NextResponse.json({ success: true, recorded });
  } catch {
    return NextResponse.json({ error: "Invalid analytics request." }, { status: 400 });
  }
}

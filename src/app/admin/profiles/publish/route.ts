import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_taplink_admin"
  );

  if (adminError || isAdmin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { profileId?: string; publishStatus?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    typeof body.profileId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.profileId) ||
    typeof body.publishStatus !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc(
    "taplink_admin_set_profile_published",
    {
      target_profile_id: body.profileId,
      publish_status: body.publishStatus,
    }
  );

  if (error || data !== true) {
    return NextResponse.json(
      { error: "Unable to update profile status" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

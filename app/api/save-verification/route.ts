// force redeploy 2
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { landlordId, phone, address, email, website } = await req.json();

  if (!landlordId || !phone || !address || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: `Env vars missing: url=${!!url} key=${!!key}` }, { status: 500 });
  }

  const supabase = createClient(url, key);

  const { error } = await supabase
    .from("landlords")
    .update({
      contact_info: phone,
      address: address,
      business_email: email,
      website: website ?? "",
    })
    .eq("id", landlordId);

  if (error) {
    console.error("Save verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

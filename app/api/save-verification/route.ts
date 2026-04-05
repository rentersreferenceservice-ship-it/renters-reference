import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { landlordId, phone, address, email, website } = await req.json();

  if (!landlordId || !phone || !address || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

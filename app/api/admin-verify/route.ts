import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function isAuthorized(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return !!user;
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { landlordId, unverify } = await req.json();

  if (!landlordId) {
    return NextResponse.json({ error: "Missing landlordId" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const res = await fetch(
    `${url}/rest/v1/landlords?id=eq.${parseInt(landlordId, 10)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": key!,
        "Authorization": `Bearer ${key!}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ verified: unverify ? false : true }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

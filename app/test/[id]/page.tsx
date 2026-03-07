"use client";
import { createClient } from "@supabase/supabase-js";
import { use, useState } from "react";
import Link from "next/link";
type Landlord = {
  id: number;
  name: string;
  city: string;
  state: string;
};

export default async function LandlordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: landlord, error } = await supabase
    .from("landlords")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !landlord) {
    return (
      <main style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            maxWidth: "600px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h1>Landlord not found</h1>
          <p>ID: {id}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "600px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1>{(landlord as Landlord).name}</h1>

        <p>
          {(landlord as Landlord).city}, {(landlord as Landlord).state}
        </p>

        <hr style={{ margin: "20px 0" }} />

      <p>No reports yet.</p>

<Link
  href={`/test/${id}/report`}
  style={{
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "8px",
    background: "#0070f3",
    color: "white",
    textDecoration: "none",
  }}
>
  Add Report
</Link> 
      </div>
    </main>
  );
}
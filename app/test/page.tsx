"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Landlord = {
  id: number;
  name: string;
  city: string;
  state: string;
};

export default function TestPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [status, setStatus] = useState("Loading...");
  const [errorText, setErrorText] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from("landlords")
          .select("id,name,city,state")
          .order("name", { ascending: true })
          .limit(50);

        if (error) {
          setStatus("Supabase returned an error");
          setErrorText(JSON.stringify(error, null, 2));
          return;
        }

        setLandlords(data ?? []);
        setStatus(`Loaded ${data?.length ?? 0} landlords`);
      } catch (err: any) {
        setStatus("Code crashed");
        setErrorText(err?.message ?? String(err));
      }
    };

    run();
  }, []);
const filteredLandlords = landlords.filter((l) => {
  const term = search.toLowerCase();

  return (
    l.name.toLowerCase().includes(term) ||
    l.city.toLowerCase().includes(term) ||
    l.state.toLowerCase().includes(term)
  );
});
  return (
    <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h1>Supabase Landlord Test</h1>

      <p>{status}</p>
      <p>Search text: {search}</p>
<p>Filtered count: {filteredLandlords.length}</p>
     

      {errorText ? (
        <pre
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {errorText}
        </pre>
      ) : null}

      <div
  style={{
    marginTop: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  }}
>

  <input
  type="text"
  placeholder="Search by state, city, or landlord..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "12px",
    marginBottom: "16px"
  }}
/>
        {filteredLandlords.map((l) => (
          <div key={l.id} style={{ marginBottom: "8px" }}>
           <Link
  href={`/test/${l.id}`}
  style={{ color: "#0070f3", textDecoration: "none", fontWeight: 600 }}
>
  {l.name}
</Link>{" "}
— {l.city}, {l.state}
          </div>
        ))}
      </div>
    </main>
  );
}
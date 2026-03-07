"use client";

import { use, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
 const [rating, setRating] = useState("5");
  const [reportText, setReportText] = useState("");
  const [status, setStatus] = useState("");
  const [repairSpeed, setRepairSpeed] = useState("OK");
const [depositReturned, setDepositReturned] = useState("NOT SURE");
const [shortNote, setShortNote] = useState("");
const [confirmRented, setConfirmRented] = useState(false);
  const [landlord, setLandlord] = useState<any>(null);

 const { id } = use(params);
const landlordId = Number(id);
useState(() => {
  const run = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from("landlords")
      .select("id,name,city,state")
      .eq("id", landlordId)
      .single();

    setLandlord(data);
  };

  run();
});
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmRented) {
  setStatus("Please confirm you rented from this landlord.");
  return;
}
    setStatus("Submitting...");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from("reports").insert({
      landlord_id: landlordId,
      rating: Number(rating),
      report_text: shortNote,
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
      return;
    }

    setStatus("Report submitted successfully.");
    setRating("");
    setReportText("");
    setShortNote("");
    setConfirmRented(false);
  }

  return (
    <main style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "700px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        }}
      >
      <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Add a report</h1>,
      <p style={{ marginTop: "6px", color: "#444" }}>Your report will be anonymous.</p>
       <p style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
Submit reports after your tenancy has ended and focus on factual experiences.
</p>
      
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#444" }}>
Reports are anonymous and publicly visible. Do not include unit numbers,
exact dates, or identifying details. Submit reports after your tenancy
has ended and focus on factual experiences.
</p>

        {landlord ? (
  <>

    <p style={{ fontWeight: 600, fontSize: "18px" }}>{landlord.name}</p>
   <p style={{ marginTop: "4px", color: "#555" }}>
  {landlord.city}, {landlord.state}
</p>
   
  </>
) : (
  <p>Loading landlord details...</p>
)}
        <hr style={{ margin: "20px 0" }} />
        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
          
        <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}> 
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
If this involved delays, disputes, partial returns, or court action, please explain below.
</p>    
             Overall rating
            </label>
           <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
5 = excellent experience, 1 = very poor experience
</p> 
            <input
              id="rating"
              name="rating"
              type="range"
              min="1"
              max="5"
              value={rating}
              aria-label="Overall rating"
              onChange={(e) => setRating(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="reportText" style={{ display: "block", marginBottom: "6px",marginTop: "16px", }}>
             Short note (1–2 sentences) 
            </label>
           <label style={{ display: "block", marginBottom: "6px" }}>
Optional context (max 250 characters)
</label>

<p style={{ fontSize: "13px", color: "#555" }}>
Reports are anonymous and publicly visible. Do not include unit numbers,
exact dates, or identifying details.
</p>
            <textarea
              id="reportText"
              name="reportText"
             value={shortNote}
            onChange={(e) => setShortNote(e.target.value)}
             rows={4}
             maxLength={250}
             placeholder="Optional context (max 250 characters)"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            />
          </div>
<div style={{ marginBottom: "16px" }}>
  <label style={{ display: "block", marginBottom: "6px" }}>
    I confirm I rented from this landlord.
  </label>
  <input
    type="checkbox"
    checked={confirmRented}
    onChange={(e) => setConfirmRented(e.target.checked)}
    />
      </div>
          <button
            type="submit"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
             background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save report
          </button>
          <button
  type="button"
  onClick={() => window.history.back()}
  style={{
    marginLeft: "10px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#f5f5f5",
    cursor: "pointer",
  }}
>
  Cancel
</button>
        </form>

        {status ? <p style={{ marginTop: "16px" }}>{status}</p> : null}
      </div>
    </main>
  );
}
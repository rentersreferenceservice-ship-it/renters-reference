"use client";
// force production refresh


import { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "@/components/StarRating";
import { createClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";

type Landlord = {
  id: string;
  name: string;
  country: string;   // "US" for now
  state: string;
  city: string;
 landlordType: "PRIVATE" | "MANAGEMENT" | "AIRBNB" | "OTHER";
  createdAt: string;
  verified: boolean;
  contactInfo: string;
  website: string;
  address: string;
  businessEmail: string;
};

type Report = {
  id: string;
  landlordId: string;
  // tenancy dates will exist later but we won't collect/show them yet
  overallRating: number;
  confirmedRented: boolean;
  status: "PENDING" | "VERIFIED";
 repairSpeed: "FAST" | "OK" | "SLOW";
  depositReturn: "YES" | "NO" | "NOT_SURE";
  allowsPets: boolean;
  heatIncluded: boolean;
  utilitiesIncluded: boolean;
  note: string;
  createdAt: string; // submission date (tenant-visible later)
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const LS_LANDLORDS = "rr_landlords_v1";
const LS_REPORTS = "rr_reports_v1";

function getOverallRatingForLandlord(reports: Report[], landlordId: string) {
  const nums = reports
    .filter((r) => r.landlordId === landlordId)
    .map((r) => Number(r.overallRating))
    .filter((n) => Number.isFinite(n));

  if (nums.length === 0) return null;

  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.round(avg * 10) / 10;
}

function stars(rating: number) {
  const r = Math.max(0, Math.min(5, Math.round(rating || 0)));

  return (
    <>
      <span className="text-yellow-500">{"★★★★★".slice(0, r)}</span>
      <span className="text-zinc-400">{"★★★★★".slice(0, 5 - r)}</span>
    </>
  );
}
const STATE_NAME_TO_CODE: Record<string, string> = {
  "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
  "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
  "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA",
  "kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD",
  "massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO",
  "montana":"MT","nebraska":"NE","nevada":"NV","new hampshire":"NH","new jersey":"NJ",
  "new mexico":"NM","new york":"NY","north carolina":"NC","north dakota":"ND","ohio":"OH",
  "oklahoma":"OK","oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC",
  "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
  "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY",
};

function normalizeState(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return STATE_NAME_TO_CODE[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

export default function Home() {
    
  // data
  
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLandlord, setFilterLandlord] = useState("");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSearch, setClaimSearch] = useState("");
  const [verifyModalLandlordId, setVerifyModalLandlordId] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [pendingVerification, setPendingVerification] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("rr_pending_verify") ?? "[]")); } catch { return new Set(); }
  });
  const [vBizName, setVBizName] = useState("");
  const [vAddress, setVAddress] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vWebsite, setVWebsite] = useState("");
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // UI
  const [view, setView] = useState<"list" | "addLandlord" | "addReport">("list");
  const [selectedLandlordId, setSelectedLandlordId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"list" | "details">("list");
  const detailTopRef = useRef<HTMLDivElement | null>(null);
const rightPanelRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  if (!selectedLandlordId) return;

  requestAnimationFrame(() => {
    detailTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}, [selectedLandlordId]);
  // form fields
  const [landlordName, setLandlordName] = useState("");
  const [landlordCity, setLandlordCity] = useState("");
const [landlordState, setLandlordState] = useState("");
const [landlordType, setLandlordType] = useState<Landlord["landlordType"]>("PRIVATE");
  const [reportLandlordId, setReportLandlordId] = useState("");
 const [overallRating, setOverallRating] = useState<number>(5);
  const [repairSpeed, setRepairSpeed] = useState<Report["repairSpeed"]>("OK");
  const [depositReturn, setDepositReturn] =
    useState<Report["depositReturn"]>("NOT_SURE");
  const [allowsPets, setAllowsPets] = useState(false);
  const [heatIncluded, setHeatIncluded] = useState(false);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [note, setNote] = useState("");
const [confirmedRented, setConfirmedRented] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      
    } catch {
      // ignore
    }
  }, []);
  // load from Supabase
useEffect(() => {
  async function run() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      let allLandlords: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("landlords")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);
        if (error || !data || data.length === 0) break;
        allLandlords = allLandlords.concat(data);
        if (data.length < batchSize) break;
        from += batchSize;
      }

      if (allLandlords.length > 0) {
        setLandlords(
          allLandlords.map((l: any) => ({
            id: l.id,
            name: l.name,
            country: "US",
            state: normalizeState(l.state),
            city: l.city,
            landlordType: "PRIVATE",
            createdAt: l.created_at ?? new Date().toISOString(),
            verified: l.verified ?? false,
            contactInfo: (console.log("contact_info raw:", l.contact_info, "for", l.name), l.contact_info ?? ""),
            website: l.website ?? "",
            address: l.address ?? "",
            businessEmail: l.business_email ?? "",
          })) as any
        );
      }

      const reportsRes = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20000);

      console.log("FETCH REPORTS RESULT", reportsRes);
      console.log("FETCH REPORTS DATA", reportsRes.data);

      if (!reportsRes.error && reportsRes.data) {
        setReports(
          reportsRes.data.map((r: any) => ({
            id: r.id,
            landlordId: r.landlord_id,
            overallRating: r.overall_rating ?? r.rating ?? 0,
            note: r.note ?? r.report_text ?? "",
            createdAt: r.created_at,
            confirmedRented: r.confirmed_rented ?? true,
            status: r.status ?? "PENDING",
            repairSpeed: r.repair_speed ?? "OK",
            depositReturn: r.deposit_return ?? "NOT_SURE",
            allowsPets: r.allows_pets ?? false,
            heatIncluded: r.heat_included ?? false,
            utilitiesIncluded: r.utilities_included ?? false,
          })) as any
        );
      } else {
        console.log("REPORTS ERROR:", reportsRes.error);
      }
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  run();
}, []);
// load from localStorage
  // persist to localStorage
  useEffect(() => {
   
  }, [landlords]);
  useEffect(() => {

  }, [reports]);

  const selectedLandlord = useMemo(() => {
    if (!selectedLandlordId) return null;
    return landlords.find((l) => l.id === selectedLandlordId) ?? null;
  }, [selectedLandlordId, landlords]);
const filteredLandlords = useMemo(() => {
  const stateQuery = filterState.trim().toUpperCase();
  const c = filterCity.trim().toLowerCase();
  const q = filterLandlord.trim().toLowerCase();

  return landlords
    .filter((l) => {
      const matchesState = !stateQuery || (l.state ?? "").toUpperCase().trim() === stateQuery;
      const matchesCity = !c || (l.city ?? "").toLowerCase().includes(c);
      const matchesName = !q || (l.name ?? "").toLowerCase().includes(q);
      return matchesState && matchesCity && matchesName;
    })
    .sort((a, b) => {
      const aHasReports = reports.some((r) => r.landlordId === a.id) ? 1 : 0;
      const bHasReports = reports.some((r) => r.landlordId === b.id) ? 1 : 0;
      return bHasReports - aHasReports;
    });
}, [landlords, reports, filterState, filterCity, filterLandlord]);

  const selectedReports = useMemo(() => {
    if (!selectedLandlordId) return [];
    return reports.filter((r) => r.landlordId === selectedLandlordId);
  }, [reports, selectedLandlordId]);
    function resetForms() {
  setLandlordName("");
  setLandlordCity("");
  setLandlordState("");
  setLandlordType("PRIVATE");
  setReportLandlordId("");
  setRepairSpeed("OK");
  setDepositReturn("NOT_SURE");
  setAllowsPets(false);
  setHeatIncluded(false);
  setUtilitiesIncluded(false);
  setNote("");
  setConfirmedRented(false);
}

  async function saveLandlord() {
  const name = landlordName.trim();
  const city = landlordCity.trim();
  const state = landlordState.trim().toUpperCase();

  if (!name) return alert("Please enter a landlord name.");
  if (!city) return alert("Please enter a city.");
  if (!state) return alert("Please enter a state.");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

 const payload = {
  name,
  city,
  state,
};
  console.log("SAVE LANDLORD PAYLOAD", payload);
  console.log("SUPABASE URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase
    .from("landlords")
    .insert([payload])
    .select("*");

  console.log("SAVE LANDLORD RESPONSE", { data, error });

  if (error) {
    console.error("Save landlord error:", error);
    alert(`Could not save landlord: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    alert("Insert returned no row. Check RLS or table schema.");
    return;
  }

  const row = data[0];

 const newLandlord: Landlord = {
  id: row.id,
  name: row.name,
  country: "US",
  state: row.state,
  city: row.city,
  landlordType: "PRIVATE",
  createdAt: row.created_at ?? new Date().toISOString(),
  verified: false,
  contactInfo: "",
  website: "",
  address: "",
  businessEmail: "",
};

  setLandlords((prev) => [newLandlord, ...prev]);
  resetForms();
  setSelectedLandlordId(newLandlord.id);
  setReportLandlordId(newLandlord.id);
  setView("list");
  alert(`Saved landlord: ${newLandlord.name}`);
}

 async function removeLandlord(id: string | number) {
  const ok = confirm("Delete this landlord and all associated reports?");
  if (!ok) return;

  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    alert("This landlord has an old local-only ID and is not stored in the database. Refresh the page to clear it.");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const reportsDelete = await supabase
    .from("reports")
    .delete()
    .eq("landlord_id", numericId);

  if (reportsDelete.error) {
    console.error("Delete reports error:", reportsDelete.error);
    alert(`Could not delete associated reports: ${reportsDelete.error.message}`);
    return;
  }

  const landlordDelete = await supabase
    .from("landlords")
    .delete()
    .eq("id", numericId);

  if (landlordDelete.error) {
    console.error("Delete landlord error:", landlordDelete.error);
    alert(`Could not delete landlord: ${landlordDelete.error.message}`);
    return;
  }

 
  setLandlords((prev) => prev.filter((l) => Number(l.id) !== numericId));
 setReports((prev) => prev.filter((r) => Number(r.landlordId) !== numericId));
 if (selectedLandlordId !== null && Number(selectedLandlordId) === numericId) {
  setSelectedLandlordId(null);
}
 }
  async function saveReport() {
    const landlordId = reportLandlordId || selectedLandlordId || "";
    if (!landlordId) return alert("Please choose a landlord first.");
    // if (!note.trim()) return alert("Please add a short note (1–2 sentences).");


        const newReport: Report = {
      id: uid(),
      landlordId,
      overallRating,
      confirmedRented,
      status: "PENDING",
      repairSpeed,
      depositReturn,
      allowsPets,
      heatIncluded,
      utilitiesIncluded,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const { error } = await supabase
  .from("reports")
  .insert({
    landlord_id: landlordId,
    rating: overallRating,
    report_text: note.trim(),
  });

if (error) {
  console.error("Supabase insert error:", error);
}
 setReports((prev) => [newReport, ...prev]);

resetForms();
setOverallRating(0); // or whatever your “empty” rating should be

setSelectedLandlordId(landlordId);
setView("list");
   
  }
  
function verifyReport(reportId: string) {
  setReports((prev) =>
    prev.map((r) => (r.id === reportId ? { ...r, status: "VERIFIED" } : r))
  );
}

 async function removeReport(reportId: string) {
  const ok = confirm("Delete this report?");
  if (!ok) return;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);

  if (error) {
    console.error("Delete report error:", error);
    alert(`Could not delete report: ${error.message}`);
    return;
  }

  setReports((prev) => prev.filter((r) => r.id !== reportId));
}

async function submitVerification(landlordId: string) {
  if (!vBizName.trim() || !vAddress.trim() || !vPhone.trim() || !vEmail.trim()) {
    alert("Please fill in all required fields.");
    return;
  }

  const res = await fetch("/api/save-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landlordId, phone: vPhone, address: vAddress, email: vEmail, website: vWebsite ?? "" }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(`Could not save your information: ${data.error ?? res.status}`);
    return;
  }

  const next = new Set(pendingVerification);
  next.add(landlordId);
  setPendingVerification(next);
  localStorage.setItem("rr_pending_verify", JSON.stringify([...next]));
  setVerifyModalLandlordId(null);
  setVerifyStep(1);
  setVBizName(""); setVAddress(""); setVPhone(""); setVEmail(""); setVWebsite("");
  const url = new URL("https://buy.stripe.com/3cI4gr56A5gifNxgPe5Vu00");
  url.searchParams.set("prefilled_email", vEmail);
  url.searchParams.set("client_reference_id", landlordId);
  window.location.href = url.toString();
}

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center" style={{ padding: "60px" }}>
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center" style={{ width: "360px", height: "320px" }}>
        <svg width="72" height="72" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 4L4 18V40H16V28H28V40H40V18L22 4Z" stroke="#18181b" strokeWidth="2.5" strokeLinejoin="round" fill="white"/>
          <rect x="13" y="18" width="18" height="18" rx="1" stroke="#18181b" strokeWidth="2" fill="white"/>
          <text x="22" y="32" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="13" fill="#18181b">R</text>
        </svg>
        <div className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">Renters Reference</div>
        <div className="mt-3 text-sm text-zinc-400">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Renters Reference
              
             
            </h1>
            
          </div>

          <div className="flex flex-col items-end gap-2">
            {isLoggedIn ? (
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                onClick={async () => { const s = getSupabase(); await s.auth.signOut(); setIsLoggedIn(false); }}
              >
                Log Out
              </button>
            ) : (
              <div className="flex gap-2">
                <a href="/login" className="rounded-xl border px-4 py-2 text-sm">Log In</a>
                <a href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-800" style={{ backgroundColor: "#F5D87A" }}>Create Account</a>
              </div>
            )}
            <button
              className="rounded-xl px-4 py-2 text-sm text-zinc-800" style={{ backgroundColor: "#F5D87A" }}
              onClick={() => { setClaimModalOpen(true); setClaimSearch(""); }}
            >
              Landlords: Claim Your Profile
            </button>
          </div>
        </div>

        {/* CLAIM MODAL */}
        {claimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Claim Your Profile</h2>
                <button className="text-zinc-400 hover:text-zinc-700 text-xl leading-none" onClick={() => setClaimModalOpen(false)}>✕</button>
              </div>

              <input
                className="w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Search your business name..."
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                autoFocus
              />

              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {claimSearch.trim() === "" ? (
                  <p className="text-sm text-zinc-400">Start typing to find your profile.</p>
                ) : (() => {
                  const results = landlords.filter(l =>
                    l.name.toLowerCase().includes(claimSearch.trim().toLowerCase())
                  );
                  if (results.length === 0) return (
                    <div className="text-center py-4">
                      <p className="text-sm text-zinc-500 mb-3">No profiles found for "{claimSearch}".</p>
                      <button
                        className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                        onClick={() => {
                          setClaimModalOpen(false);
                          resetForms();
                          setView("addLandlord");
                        }}
                      >
                        Add Your Landlord Profile
                      </button>
                    </div>
                  );
                  return results.map(l => (
                    <div key={l.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">{l.name}</div>
                        <div className="text-xs text-zinc-500">{l.city}, {l.state}</div>
                      </div>
                      {l.verified ? (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#4a7c59", color: "#ffffff" }}>✓ Verified</span>
                      ) : pendingVerification.has(l.id) ? (
                        <span className="rounded-xl bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">Verification In Process</span>
                      ) : (
                        <button
                          className="rounded-xl px-3 py-1.5 text-xs text-zinc-800" style={{ backgroundColor: "#F5D87A" }}
                          onClick={() => { setClaimModalOpen(false); setVerifyModalLandlordId(l.id); setVBizName(l.name); }}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        

        {/* VERIFICATION MODAL */}
        {verifyModalLandlordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Verify Your Business</h2>
                <button className="text-zinc-400 hover:text-zinc-700 text-xl leading-none" onClick={() => { setVerifyModalLandlordId(null); setVerifyStep(1); }}>✕</button>
              </div>
              <div className="text-xs text-zinc-400 mb-4">Step {verifyStep} of 2</div>

              {verifyStep === 1 ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Business Name *</label>
                      <input className="w-full rounded-xl border px-4 py-2 text-sm" value={vBizName} onChange={e => setVBizName(e.target.value)} placeholder="Your business name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Business Address *</label>
                      <input className="w-full rounded-xl border px-4 py-2 text-sm" value={vAddress} onChange={e => setVAddress(e.target.value)} placeholder="123 Main St, City, State" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number *</label>
                      <input className="w-full rounded-xl border px-4 py-2 text-sm" type="tel" value={vPhone} onChange={e => setVPhone(e.target.value)} placeholder="(555) 555-5555" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address *</label>
                      <input className="w-full rounded-xl border px-4 py-2 text-sm" type="email" value={vEmail} onChange={e => setVEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website URL</label>
                      <input className="w-full rounded-xl border px-4 py-2 text-sm" type="url" value={vWebsite} onChange={e => setVWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button
                      className="flex-1 rounded-xl px-4 py-2 text-sm text-white"
                      style={{ backgroundColor: "#F5D87A" }}
                      onClick={() => {
                        if (!vBizName.trim() || !vAddress.trim() || !vPhone.trim() || !vEmail.trim()) {
                          alert("Please fill in all required fields.");
                          return;
                        }
                        setVerifyStep(2);
                      }}
                    >
                      Next: Review &amp; Pay →
                    </button>
                    <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => { setVerifyModalLandlordId(null); setVerifyStep(1); }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border bg-zinc-50 p-4 space-y-1 text-sm text-zinc-700">
                    <div><span className="font-medium">Business:</span> {vBizName}</div>
                    <div><span className="font-medium">Address:</span> {vAddress}</div>
                    <div><span className="font-medium">Phone:</span> {vPhone}</div>
                    <div><span className="font-medium">Email:</span> {vEmail}</div>
                    {vWebsite && <div><span className="font-medium">Website:</span> {vWebsite}</div>}
                  </div>

                  <div className="mt-4 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4">
                    <div className="text-sm font-medium text-zinc-700 mb-1">Verification Fee</div>
                    <div className="text-xs text-zinc-500 mb-2">An annual fee is required to verify your business listing. Your verified badge and contact info will appear on your profile immediately after payment.</div>
                    <div className="text-lg font-bold text-zinc-800">$29.99 <span className="text-xs font-normal text-zinc-500">/ year</span></div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => setVerifyStep(1)}>← Back</button>
                    <button
                      className="flex-1 rounded-xl px-4 py-2 text-sm text-white"
                      style={{ backgroundColor: "#F5D87A" }}
                      onClick={() => submitVerification(verifyModalLandlordId)}
                    >
                      Pay $29.99 &amp; Verify
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* MAIN */}
        <div className="mb-4 flex gap-2 md:hidden">
  <button
    className={`flex-1 rounded-xl border px-4 py-2 text-sm ${
      mobilePanel === "list" ? "bg-black text-white" : ""
    }`}
    onClick={() => setMobilePanel("list")}
  >
    Landlords
  </button>

  <button
    className={`flex-1 rounded-xl border px-4 py-2 text-sm ${
      mobilePanel === "details" ? "bg-black text-white" : ""
    }`}
    onClick={() => setMobilePanel("details")}
  >
   Dashboard
  </button>
</div>
       <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-[1fr_1fr_200px]">
          {/* LEFT: list */}
          <div className={mobilePanel === "list" ? "block" : "hidden md:block"}>
           <div className="flex items-center justify-between">
  <h2 className="text-lg font-medium">Search landlords</h2>

  <button
  className="rounded-xl border px-3 py-1 text-sm"
  onClick={() => window.location.href = "mailto:rentersreferenceservice@gmail.com"}
>
  Contact Us
</button>
</div>

<div className="mt-3 grid gap-2">
  <select
    className="w-full rounded-xl border px-4 py-3 text-sm"
    value={filterState}
    onChange={(e) => setFilterState(e.target.value)}
  >
    <option value="">All States</option>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    <option value="AR">Arkansas</option>
    <option value="CA">California</option>
    <option value="CO">Colorado</option>
    <option value="CT">Connecticut</option>
    <option value="DE">Delaware</option>
    <option value="FL">Florida</option>
    <option value="GA">Georgia</option>
    <option value="HI">Hawaii</option>
    <option value="ID">Idaho</option>
    <option value="IL">Illinois</option>
    <option value="IN">Indiana</option>
    <option value="IA">Iowa</option>
    <option value="KS">Kansas</option>
    <option value="KY">Kentucky</option>
    <option value="LA">Louisiana</option>
    <option value="ME">Maine</option>
    <option value="MD">Maryland</option>
    <option value="MA">Massachusetts</option>
    <option value="MI">Michigan</option>
    <option value="MN">Minnesota</option>
    <option value="MS">Mississippi</option>
    <option value="MO">Missouri</option>
    <option value="MT">Montana</option>
    <option value="NE">Nebraska</option>
    <option value="NV">Nevada</option>
    <option value="NH">New Hampshire</option>
    <option value="NJ">New Jersey</option>
    <option value="NM">New Mexico</option>
    <option value="NY">New York</option>
    <option value="NC">North Carolina</option>
    <option value="ND">North Dakota</option>
    <option value="OH">Ohio</option>
    <option value="OK">Oklahoma</option>
    <option value="OR">Oregon</option>
    <option value="PA">Pennsylvania</option>
    <option value="RI">Rhode Island</option>
    <option value="SC">South Carolina</option>
    <option value="SD">South Dakota</option>
    <option value="TN">Tennessee</option>
    <option value="TX">Texas</option>
    <option value="UT">Utah</option>
    <option value="VT">Vermont</option>
    <option value="VA">Virginia</option>
    <option value="WA">Washington</option>
    <option value="WV">West Virginia</option>
    <option value="WI">Wisconsin</option>
    <option value="WY">Wyoming</option>
  </select>

  <input
    className="w-full rounded-xl border px-4 py-3 text-sm"
    value={filterCity}
    onChange={(e) => setFilterCity(e.target.value)}
    placeholder="Filter by city"
  />

  <input
    className="w-full rounded-xl border px-4 py-3 text-sm"
    value={filterLandlord}
    onChange={(e) => setFilterLandlord(e.target.value)}
    placeholder="Filter by landlord name (e.g., Hamilton)"
  />
</div>


{landlords.length === 0 ? (
              <p className="mt-2 text-zinc-600">No landlords yet.</p>
        ) : filteredLandlords.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No landlords found for that search.</p>
        ) : (
    <>

    <ul className="mt-4 space-y-3">
  {filteredLandlords.map((l) => {
    const landlordReports = reports.filter((r) => r.landlordId === l.id);
    const allReports = reports.filter((r) => r.landlordId === l.id);
const totalCount = reports.filter((r) => r.landlordId === l.id).length;
    const verifiedReports = allReports.filter((r) => r.status === "VERIFIED");
const count = landlordReports.length;
const totalPoints = reports
  .filter((r) => r.landlordId === l.id)
  .reduce((sum, r) => sum + (r.overallRating ?? 0), 0);
const verifiedCount = reports.filter(
  (r) => r.landlordId === l.id && r.status === "VERIFIED"
).length;
const overall =
  totalCount === 0 ? null : Math.round((totalPoints / totalCount) * 10) / 10;


return (
      <li
  key={l.id}
  className="rounded-xl border p-4 cursor-pointer"
  onClick={() => {
    setSelectedLandlordId(l.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>

                      <button
                        className="w-full text-left"
                       onClick={() => {
  setSelectedLandlordId(l.id);
  setMobilePanel("details");
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
                      >
                        <div className="flex items-start justify-between gap-4">
                         <div>
  <div className="font-medium">
    {l.name} — {l.city}, {l.state}
    
{overall !== null && (
  <div className="text-sm text-zinc-700">
   Overall rating: {overall} / 5 ({verifiedCount} verified of {totalCount})
  </div>
)}
  </div>
 
<div className="mt-2"></div>

  
<div className="mt-1 text-sm text-zinc-600">
  {count === 0 ? (
    "No reports yet."
  ) : (
    <>
  <span className="font-semibold text-yellow-500">
    stars(overall!)
  </span>{" "}
  ({overall}/5) • {count} {count === 1 ? "report" : "reports"}
</>
  )}
</div>
</div>
    {/* <div className="text-sm text-zinc-600">
  {count} report{count === 1 ? "" : "s"}
</div> */}
                                                          
                        </div>
                      </button>

                      <div className="mt-3 flex flex-wrap gap-3 items-center">
                        {isLoggedIn ? (
                          <button
                            className="text-sm underline"
                            onClick={() => {
                              setSelectedLandlordId(l.id);
                              resetForms();
                              setView("addReport");
                              setReportLandlordId(l.id);
                            }}
                          >
                            Add report
                          </button>
                        ) : (
                          <a href="/login" className="text-sm underline text-zinc-500">
                            Log in to add a report
                          </a>
                        )}

                        {l.verified ? (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#4a7c59", color: "#ffffff" }}>
                            ✓ Verified Business
                          </span>
                        ) : pendingVerification.has(l.id) ? (
                          <span className="rounded-xl bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                            Verification In Process
                          </span>
                        ) : (
                          <button
                            className="rounded-xl px-3 py-1 text-xs text-zinc-800" style={{ backgroundColor: "#F5D87A" }}
                            onClick={(e) => { e.stopPropagation(); setVerifyModalLandlordId(l.id); setVBizName(l.name); }}
                          >
                            Claim &amp; Verify Your Business
                          </button>
                        )}

                        {l.verified && (
                          <div className="mt-2 space-y-1">
                            {l.contactInfo && <div className="text-xs text-zinc-600">📞 {l.contactInfo}</div>}
                            {l.address && <div className="text-xs text-zinc-600">📍 {l.address}</div>}
                            {l.businessEmail && <a href={`mailto:${l.businessEmail}`} className="text-xs text-zinc-600 underline block">✉️ {l.businessEmail}</a>}
                            {l.website && <a href={l.website} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 underline block">🌐 {l.website}</a>}
                          </div>
                        )}

                        <button
                          className="text-sm underline text-red-600"
                          onClick={() => removeLandlord(l.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              </>
            )}
          </div>
          {/* RIGHT: details / forms */}
          <div className={mobilePanel === "details" ? "block" : "hidden md:block"}>
            {view === "addLandlord" && (
              <div className="rounded-2xl border p-5">
                
               <h2 className="text-lg font-medium">Add a landlord</h2>

                <label className="mt-4 block text-sm font-medium">
                  Landlord name
                 </label>
                <input
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="Example: Jordan Smith / Maple Properties"
                />

               <label className="mt-4 block text-sm font-medium">State</label>
<select
  className="w-full rounded-xl border px-4 py-3 text-sm"
  value={landlordState}
onChange={(e) => setLandlordState(e.target.value)}
>
  <option value="">All States</option>
  <option value="AL">Alabama</option>
  <option value="AK">Alaska</option>
  <option value="AZ">Arizona</option>
  <option value="AR">Arkansas</option>
  <option value="CA">California</option>
  <option value="CO">Colorado</option>
  <option value="CT">Connecticut</option>
  <option value="DE">Delaware</option>
  <option value="FL">Florida</option>
  <option value="GA">Georgia</option>
  <option value="HI">Hawaii</option>
  <option value="ID">Idaho</option>
  <option value="IL">Illinois</option>
  <option value="IN">Indiana</option>
  <option value="IA">Iowa</option>
  <option value="KS">Kansas</option>
  <option value="KY">Kentucky</option>
  <option value="LA">Louisiana</option>
  <option value="ME">Maine</option>
  <option value="MD">Maryland</option>
  <option value="MA">Massachusetts</option>
  <option value="MI">Michigan</option>
  <option value="MN">Minnesota</option>
  <option value="MS">Mississippi</option>
  <option value="MO">Missouri</option>
  <option value="MT">Montana</option>
  <option value="NE">Nebraska</option>
  <option value="NV">Nevada</option>
  <option value="NH">New Hampshire</option>
  <option value="NJ">New Jersey</option>
  <option value="NM">New Mexico</option>
  <option value="NY">New York</option>
  <option value="NC">North Carolina</option>
  <option value="ND">North Dakota</option>
  <option value="OH">Ohio</option>
  <option value="OK">Oklahoma</option>
  <option value="OR">Oregon</option>
  <option value="PA">Pennsylvania</option>
  <option value="RI">Rhode Island</option>
  <option value="SC">South Carolina</option>
  <option value="SD">South Dakota</option>
  <option value="TN">Tennessee</option>
  <option value="TX">Texas</option>
  <option value="UT">Utah</option>
  <option value="VT">Vermont</option>
  <option value="VA">Virginia</option>
  <option value="WA">Washington</option>
  <option value="WV">West Virginia</option>
  <option value="WI">Wisconsin</option>
  <option value="WY">Wyoming</option>
</select>

<label className="mt-4 block text-sm font-medium">City</label>
<input
  className="w-full rounded-xl border px-4 py-3 text-sm"
  value={landlordCity}
  onChange={(e) => setLandlordCity(e.target.value)}
  placeholder="e.g., Boston"
/>

                <div className="mt-5 flex gap-3">
                  <button
                    className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                    onClick={saveLandlord}
                  >
                    Save landlord
                  </button>
                  <button
                    className="rounded-xl border px-4 py-2 text-sm"
                    onClick={() => {
                      resetForms();
                      setView("list");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {view === "addReport" && (
              <div className="rounded-2xl border p-5">
                <h2 className="text-lg font-medium">Add a report</h2>
<label className="mt-4 block text-sm font-medium">
  Choose landlord
</label>

<select
  className="mt-2 w-full rounded-xl border px-4 py-3"
  value={selectedLandlordId ?? ""}
  onChange={(e) => setSelectedLandlordId(e.target.value || null)}
>
 <option value="">Select...</option>
 {filteredLandlords.map((l) => (
 

    <option key={l.id} value={l.id}>
      {l.name} — {l.city}, {l.state}

    </option>
  ))}
</select>
<label className="mt-4 block text-sm font-medium">
  Overall rating
</label>

<select
  className="mt-2 w-full rounded-xl border px-4 py-3"
  value={overallRating}
  onChange={(e) => setOverallRating(Number(e.target.value))}
>
  <option value={0}>No rating</option>
  <option value={1}>1</option>
  <option value={2}>2</option>
  <option value={3}>3</option>
  <option value={4}>4</option>
  <option value={5}>5</option>
</select>
               
                <label className="mt-4 block text-sm font-medium">
                  Repair speed
                </label>
                <select
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  value={repairSpeed}
                  onChange={(e) =>
                    setRepairSpeed(e.target.value as Report["repairSpeed"])
                  }
                >
                  <option value="FAST">FAST</option>
                  <option value="OK">OK</option>
                  <option value="SLOW">SLOW</option>
                </select>

                <label className="mt-4 block text-sm font-medium">
                  Deposit returned?
                </label>
<p className="mt-1 text-xs text-zinc-500">
  If this involved delays, disputes, partial returns, or court action, please explain below.
</p>

                <select
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  value={depositReturn}
                  onChange={(e) =>
                    setDepositReturn(
                      e.target.value as Report["depositReturn"]
                    )
                  }
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                  <option value="NOT_SURE">NOT SURE</option>
                </select>

                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={allowsPets} onChange={(e) => setAllowsPets(e.target.checked)} />
                    Allows pets
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={heatIncluded} onChange={(e) => setHeatIncluded(e.target.checked)} />
                    Heat included
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" checked={utilitiesIncluded} onChange={(e) => setUtilitiesIncluded(e.target.checked)} />
                    Utilities included
                  </label>
                </div>

                <label className="mt-4 block text-sm font-medium">
                  Short note (1–2 sentences)
                </label>
               <div className="text-xs text-zinc-500">
  Reports are anonymous and publicly visible. Do not include unit numbers, exact dates, or identifying details. Submit reports after your tenancy has ended and focus on factual experiences.
</div> 
<div className="text-xs text-zinc-500">
  Reports are anonymous and publicly visible. Do not include unit numbers, exact dates, or identifying details. Submit reports after your tenancy has ended and focus on factual experiences.
</div>
             <textarea
  className="mt-2 w-full rounded-xl border px-4 py-3"
  rows={4}
  maxLength={250}
  value={note}
  onChange={(e) => setNote(e.target.value)}
  placeholder="Optional context (max 250 characters)"
/>
<label className="mt-4 flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    className="h-4 w-4"
    checked={confirmedRented}
    onChange={(e) => setConfirmedRented(e.target.checked)}
  />
  I confirm I rented from this landlord.
</label>
   
<div className="mt-1 text-xs text-zinc-500 text-right">
  {note.length} / 250
</div>
                <div className="mt-5 flex gap-3">
                  <button
                    className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                    onClick={saveReport}
                  >
                    Save report
                  </button>
                  <button
                    className="rounded-xl border px-4 py-2 text-sm"
                    onClick={() => {
                      resetForms();
                      setView("list");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

        {view === "list" && (
  <>
    {/* ACTION CARD */}
    <div className="rounded-2xl border p-5 mb-4 space-y-3">
      <button
        className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white"
        onClick={() => {
          resetForms();
          setView("addLandlord");
        }}
      >
        Add landlord
      </button>

      {isLoggedIn ? (
        <button
          className="w-full rounded-xl border px-4 py-2 text-sm"
          onClick={() => {
            resetForms();
            setView("addReport");
          }}
        >
          Add report
        </button>
      ) : (
        <a href="/login" className="block w-full rounded-xl border px-4 py-2 text-sm text-center text-zinc-500">
          Log in to add a report
        </a>
      )}
    </div>

    {/* LANDLORD CARD */}
    <div ref={rightPanelRef} className="rounded-2xl border p-5 mb-4">
      {!selectedLandlord ? (
        <p className="text-sm text-zinc-500">
          Select a landlord to view details.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold" style={selectedLandlord.verified ? { color: "#c9a227" } : {}}>{selectedLandlord.name}</div>
            {selectedLandlord.verified && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
                ✓ Verified Business
              </span>
            )}
          </div>

          <div className="text-sm text-zinc-600">
            {selectedLandlord.city}, {selectedLandlord.state}
          </div>

          {selectedLandlord.verified ? (
            <div className="mt-3 space-y-1">
              {selectedLandlord.address && (
                <div className="text-sm text-zinc-700">📍 {selectedLandlord.address}</div>
              )}
              {selectedLandlord.contactInfo && (
                <div className="text-sm text-zinc-700">📞 {selectedLandlord.contactInfo}</div>
              )}
              {selectedLandlord.businessEmail && (
                <a href={`mailto:${selectedLandlord.businessEmail}`} className="text-sm text-zinc-700 underline block">
                  ✉️ {selectedLandlord.businessEmail}
                </a>
              )}
              {selectedLandlord.website && (
                <a
                  href={selectedLandlord.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline block"
                >
                  🌐 {selectedLandlord.website}
                </a>
              )}
            </div>
          ) : pendingVerification.has(selectedLandlord.id) ? (
            <div className="mt-3 rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-700 font-medium">
              ⏳ Verification In Process — we'll be in touch soon.
            </div>
          ) : (
            <button
              className="mt-3 rounded-xl px-4 py-2 text-sm text-zinc-800" style={{ backgroundColor: "#F5D87A" }}
              onClick={() => { setVerifyModalLandlordId(selectedLandlord.id); setVBizName(selectedLandlord.name); }}
            >
              Claim &amp; Verify Your Business
            </button>
          )}
        </>
      )}
    </div>


    {/* REPORTS CARD */}
<div className="rounded-2xl border p-5 min-h-0">
  {selectedReports.length === 0 ? (
    <p className="mt-2 text-zinc-600">No reports yet.</p>
  ) : (
    <ul className="mt-3 space-y-3">
      {selectedReports.map((r) => (
        <li key={r.id} className="rounded-xl border p-4">
          <div className="text-sm text-zinc-600">
            Repairs: {r.repairSpeed} • Deposit returned:{" "}
            {r.depositReturn === "YES"
              ? "Yes"
              : r.depositReturn === "NO"
              ? "No"
              : "Not sure"}{" "}
            • Allows pets: {r.allowsPets ? "Yes" : "No"}{" "}
            • Heat included: {r.heatIncluded ? "Yes" : "No"}{" "}
            • Utilities included: {r.utilitiesIncluded ? "Yes" : "No"}
          </div>

          <div className="mt-1 text-sm text-zinc-600">
            Overall rating:{" "}
            <span aria-label={`Overall rating ${r.overallRating} out of 5`}>
              {stars(r.overallRating)} ({r.overallRating}/5)
            </span>
          </div>

          {r.note && <p className="mt-2">{r.note}</p>}

          <div className="mt-1 text-xs text-zinc-500">
            Reporter: {r.confirmedRented ? "confirmed renter" : "not confirmed"}
          </div>

          <div className="text-xs text-zinc-500">
            Admin: {r.status === "VERIFIED" ? "verified" : "pending"}
          </div>

          <div className="mt-3 flex gap-4">
            <button
              type="button"
              className="text-sm underline"
              disabled={r.status === "VERIFIED"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                verifyReport(r.id);
              }}
            >
              {r.status === "VERIFIED" ? "Verified" : "Mark verified"}
            </button>

            <button
              type="button"
              className="text-sm underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeReport(r.id);
              }}
            >
              Remove report
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
     </>
)}
          </div>

          {/* RIGHT: ads column */}
          <div className="hidden md:flex flex-col gap-4">
            {filterState && (
              <>
                <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                  <div className="font-medium text-zinc-600">Your Ad Here</div>
                  <div className="mt-1 text-xs">Reach Renters in {Object.entries(STATE_NAME_TO_CODE).find(([, code]) => code === filterState)?.[0].replace(/\b\w/g, c => c.toUpperCase()) ?? filterState}</div>
                  <a href="mailto:rentersreferenceservice@gmail.com" className="mt-2 block text-xs underline text-zinc-400 break-all">
                    rentersreferenceservice@gmail.com
                  </a>
                </div>

                <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                  <div className="font-medium text-zinc-600">Your Ad Here</div>
                  <div className="mt-1 text-xs">Reach Renters in {Object.entries(STATE_NAME_TO_CODE).find(([, code]) => code === filterState)?.[0].replace(/\b\w/g, c => c.toUpperCase()) ?? filterState}</div>
                  <a href="mailto:rentersreferenceservice@gmail.com" className="mt-2 block text-xs underline text-zinc-400 break-all">
                    rentersreferenceservice@gmail.com
                  </a>
                </div>

                <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                  <div className="font-medium text-zinc-600">Your Ad Here</div>
                  <div className="mt-1 text-xs">Reach Renters in {Object.entries(STATE_NAME_TO_CODE).find(([, code]) => code === filterState)?.[0].replace(/\b\w/g, c => c.toUpperCase()) ?? filterState}</div>
                  <a href="mailto:rentersreferenceservice@gmail.com" className="mt-2 block text-xs underline text-zinc-400 break-all">
                    rentersreferenceservice@gmail.com
                  </a>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
"use client";
// force production refresh


import { useEffect, useMemo, useRef, useState } from "react";
import StarRating from "@/components/StarRating";
import { createClient } from "@supabase/supabase-js";

type Landlord = {
  id: string;
  name: string;
  country: string;   // "US" for now
  state: string;
  city: string;
 landlordType: "PRIVATE" | "MANAGEMENT" | "AIRBNB" | "OTHER";
  createdAt: string;
};
<option value="AIRBNB">Airbnb / Short-term</option>

type Report = {
  id: string;
  landlordId: string;
  // tenancy dates will exist later but we won't collect/show them yet
  overallRating: number;
  confirmedRented: boolean;
  status: "PENDING" | "VERIFIED";
 repairSpeed: "FAST" | "OK" | "SLOW";
  depositReturn: "YES" | "NO" | "NOT_SURE";
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
export default function Home() {
    
  // data
  
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterLandlord, setFilterLandlord] = useState("");
  
  const [reports, setReports] = useState<Report[]>([]);

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

      const landlordsRes = await supabase
        .from("landlords")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20000);

      console.log("FETCH LANDLORDS RESULT", landlordsRes);
      console.log("FETCH LANDLORDS DATA", landlordsRes.data);

      if (!landlordsRes.error && landlordsRes.data) {
        setLandlords(
          landlordsRes.data.map((l: any) => ({
            id: l.id,
            name: l.name,
            country: "US",
            state: l.state,
            city: l.city,
            landlordType: "PRIVATE",
            createdAt: l.created_at ?? new Date().toISOString(),
          })) as any
        );
      } else {
        console.log("LANDLORDS ERROR:", landlordsRes.error);
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
          })) as any
        );
      } else {
        console.log("REPORTS ERROR:", reportsRes.error);
      }
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
    }
  }

  run();
}, []);
  // load from Supabase (seeded landlords + reports)
useEffect(() => {
  const run = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: dbLandlords, error: landlordsError } = await supabase
  .from("landlords")
  .select("*")
  .order("name", { ascending: true })
  .range(0, 5000);
console.log("DB LANDLORD STATES:", dbLandlords?.map(l => l.state));
console.log("FIRST 50 STATES:", dbLandlords?.slice(0,50).map(l => l.state));
console.log("LANDLORDS COUNT:", dbLandlords?.length);

        const { data: dbReports, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

    if (!reportsError && dbReports) {
  setReports(
    dbReports.map((r: any) => ({
      id: r.id,
      landlordId: r.landlord_id,
      overallRating: r.rating,
      note: r.report_text,
      createdAt: r.created_at,
      confirmedRented: true,
      status: "PENDING",
      repairSpeed: "OK",
      depositReturn: "NOT_SURE",
    }))
  );
}
console.log("DB REPORTS:", dbReports);
      
    
    } catch {}
  };

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
 const s = filterState.trim().toUpperCase();
const stateQuery = s;
  const c = filterCity.trim().toLowerCase();
 const q = filterLandlord.trim().toLowerCase();

  return landlords.filter((l) => {
   const matchesState = !stateQuery || l.state?.toUpperCase().trim() === stateQuery;
    if (stateQuery === "MA") console.log("STATE CHECK", l.name, l.state, matchesState);
    const matchesCity = !c || l.city.toLowerCase().includes(c);
    const matchesName = !q || l.name.toLowerCase().includes(q);
   if (filterState === "MA") return matchesState && matchesCity && matchesName;
    return matchesState && matchesCity && matchesName;
  });
}, [landlords, filterState, filterCity, filterLandlord]);

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

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Renters Reference
              
             
            </h1>
            
          </div>

          <a
            href="/login"
            className="rounded-xl border px-4 py-2 text-sm"
            title="Login (we'll connect this to roles next)"
          >
            Login
          </a>
        </div>

        

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
       <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
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

 <input
  className="w-full rounded-xl border px-4 py-3 text-sm"
  value={filterLandlord}
  onChange={(e) => setFilterLandlord(e.target.value)}
  placeholder="Filter by landlord name (e.g., Hamilton)"
/>
  
</div>

            {landlords.length === 0 ? (
              <p className="mt-2 text-zinc-600">No landlords yet.</p>
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

                      <div className="mt-3 flex gap-3">
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

                <label className="mt-4 block text-sm font-medium">City</label>
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
<label className="mt-4 block text-sm font-medium">State</label>
<input
  className="mt-2 w-full rounded-xl border px-4 py-3"
  value={landlordState}
  onChange={(e) => setLandlordState(e.target.value)}
  placeholder="Example: VT"
  />

<label className="mt-4 block text-sm font-medium">Landlord type</label>
<select
  className="mt-2 w-full rounded-xl border px-4 py-3"
  value={landlordType}
  onChange={(e) => setLandlordType(e.target.value as Landlord["landlordType"])}
>
  <option value="PRIVATE">Private owner</option>
  <option value="MANAGEMENT">Management company</option>
  <option value="OTHER">Other / Not sure</option>
  <option value="SHORT_TERM">Short-term rental (Airbnb / Vrbo)</option>
</select>

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

      <button
        className="w-full rounded-xl border px-4 py-2 text-sm"
        onClick={() => {
          resetForms();
          setView("addReport");
        }}
      >
        Add report
      </button>
    </div>

    {/* LANDLORD CARD */}
    <div ref={rightPanelRef} className="rounded-2xl border p-5 mb-4">
      {!selectedLandlord ? (
        <p className="text-sm text-zinc-500">
          Select a landlord to view details.
        </p>
      ) : (
        <>
          <div className="text-lg font-semibold">
            {selectedLandlord.name}
          </div>

          <div className="text-sm text-zinc-600">
            {selectedLandlord.city}, {selectedLandlord.state}
          </div>
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
              : "Not sure"}
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
        </div>
      </div>
    </div>
  );
}
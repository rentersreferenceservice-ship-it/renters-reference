"use client";

import { useEffect, useMemo, useState } from "react";

type Landlord = {
  id: string;
  name: string;
  location: string;
  createdAt: string; // shown to tenants later, hidden to landlords later
};

type Report = {
  id: string;
  landlordId: string;
  // tenancy dates will exist later but we won't collect/show them yet
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

export default function Home() {
  // data
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // UI
  const [view, setView] = useState<"list" | "addLandlord" | "addReport">("list");
  const [selectedLandlordId, setSelectedLandlordId] = useState<string | null>(
    null
  );

  // form fields
  const [landlordName, setLandlordName] = useState("");
  const [landlordLocation, setLandlordLocation] = useState("");

  const [reportLandlordId, setReportLandlordId] = useState("");
  const [repairSpeed, setRepairSpeed] = useState<Report["repairSpeed"]>("OK");
  const [depositReturn, setDepositReturn] =
    useState<Report["depositReturn"]>("NOT_SURE");
  const [note, setNote] = useState("");

  // load from localStorage
  useEffect(() => {
    try {
      const savedLandlords = localStorage.getItem(LS_LANDLORDS);
      const savedReports = localStorage.getItem(LS_REPORTS);
      if (savedLandlords) setLandlords(JSON.parse(savedLandlords));
      if (savedReports) setReports(JSON.parse(savedReports));
    } catch {
      // ignore
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem(LS_LANDLORDS, JSON.stringify(landlords));
  }, [landlords]);

  useEffect(() => {
    localStorage.setItem(LS_REPORTS, JSON.stringify(reports));
  }, [reports]);

  const selectedLandlord = useMemo(() => {
    if (!selectedLandlordId) return null;
    return landlords.find((l) => l.id === selectedLandlordId) ?? null;
  }, [selectedLandlordId, landlords]);

  const selectedReports = useMemo(() => {
    if (!selectedLandlordId) return [];
    return reports.filter((r) => r.landlordId === selectedLandlordId);
  }, [reports, selectedLandlordId]);

  function resetForms() {
    setLandlordName("");
    setLandlordLocation("");
    setReportLandlordId("");
    setRepairSpeed("OK");
    setDepositReturn("NOT_SURE");
    setNote("");
  }

  function saveLandlord() {
    const name = landlordName.trim();
    const location = landlordLocation.trim();

    if (!name) return alert("Please enter a landlord name.");
    if (!location) return alert("Please enter a location.");

    const newLandlord: Landlord = {
      id: uid(),
      name,
      location,
      createdAt: new Date().toISOString(),
    };

    setLandlords((prev) => [newLandlord, ...prev]);
    resetForms();
    setView("list");
  }

  function removeLandlord(id: string) {
    const ok = confirm("Delete this landlord and all associated reports?");
    if (!ok) return;

    setLandlords((prev) => prev.filter((l) => l.id !== id));
    setReports((prev) => prev.filter((r) => r.landlordId !== id));
    if (selectedLandlordId === id) setSelectedLandlordId(null);
  }

  function saveReport() {
    const landlordId = reportLandlordId || selectedLandlordId || "";
    if (!landlordId) return alert("Please choose a landlord first.");
    if (!note.trim()) return alert("Please add a short note (1–2 sentences).");

    const newReport: Report = {
      id: uid(),
      landlordId,
      repairSpeed,
      depositReturn,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    resetForms();
    setView("list");
    setSelectedLandlordId(landlordId);
  }

  function removeReport(reportId: string) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Renters Reference
            </h1>
            <p className="mt-2 text-zinc-600">
              Add landlords and attach renter experience reports. (Stored locally
              in your browser for now.)
            </p>
          </div>

          <a
            href="/login"
            className="rounded-xl border px-4 py-2 text-sm"
            title="Login (we'll connect this to roles next)"
          >
            Login
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
            onClick={() => {
              resetForms();
              setView("addLandlord");
            }}
          >
            Add landlord
          </button>

          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={() => {
              resetForms();
              setView("addReport");
              if (selectedLandlordId) setReportLandlordId(selectedLandlordId);
            }}
            disabled={landlords.length === 0}
            title={landlords.length === 0 ? "Add a landlord first" : ""}
          >
            Add report
          </button>
        </div>

        {/* MAIN */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* LEFT: list */}
          <div>
            <h2 className="text-lg font-medium">Landlords</h2>

            {landlords.length === 0 ? (
              <p className="mt-2 text-zinc-600">No landlords yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {landlords.map((l) => {
                  const count = reports.filter((r) => r.landlordId === l.id)
                    .length;
                  const isSelected = selectedLandlordId === l.id;

                  return (
                    <li
                      key={l.id}
                      className={`rounded-xl border p-4 ${
                        isSelected ? "border-black" : ""
                      }`}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => setSelectedLandlordId(l.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">{l.name}</div>
                            <div className="text-sm text-zinc-600">
                              {l.location}
                            </div>
                          </div>
                          <div className="text-sm text-zinc-600">
                            {count} report{count === 1 ? "" : "s"}
                          </div>
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
            )}
          </div>

          {/* RIGHT: details / forms */}
          <div>
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

                <label className="mt-4 block text-sm font-medium">
                  Location (city + state)
                </label>
                <input
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  value={landlordLocation}
                  onChange={(e) => setLandlordLocation(e.target.value)}
                  placeholder="Example: Burlington, VT"
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
                  value={reportLandlordId}
                  onChange={(e) => setReportLandlordId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {landlords.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.location}
                    </option>
                  ))}
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
               <textarea
  className="mt-2 w-full rounded-xl border px-4 py-3"
  rows={4}
  maxLength={250}
  value={note}
  onChange={(e) => setNote(e.target.value)}
  placeholder="Optional context (max 250 characters)"
/>
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
              <div className="rounded-2xl border p-5">
                <h2 className="text-lg font-medium">Details</h2>

                {!selectedLandlord ? (
                  <p className="mt-2 text-zinc-600">
                    Select a landlord to view reports.
                  </p>
                ) : (
                  <>
                    <div className="mt-2">
                      <div className="text-lg font-semibold">
                        {selectedLandlord.name}
                      </div>
                      <div className="text-sm text-zinc-600">
                        {selectedLandlord.location}
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-medium text-zinc-700">
  Reports
</h3>
<p className="mt-3 text-sm text-zinc-500">
  Reports reflect individual renter experiences and may not represent every tenancy.
</p>


                      {selectedReports.length === 0 ? (
                        <p className="mt-2 text-zinc-600">No reports yet.</p>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {selectedReports.map((r) => (
                            <li key={r.id} className="rounded-xl border p-4">
                              <div className="text-sm text-zinc-600">
                                Repairs: {r.repairSpeed} • 
 • Deposit returned:{" "}
{r.depositReturn === "YES"
  ? "Yes"
  : r.depositReturn === "NO"
  ? "No"
  : "Not sure"}
                             </div>
                              <p className="mt-2">{r.note}</p>
                              <button
                                className="mt-3 text-sm underline"
                                onClick={() => removeReport(r.id)}
                              >
                                Remove report
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-sm text-zinc-500">
          Next: connect this to Supabase so it’s shared across users + add roles
          (tenant/landlord/mod) and privacy rules.
        </div>
      </div>
    </div>
  );
}

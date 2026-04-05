"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const PASSWORD = "Manual Verification";

type Landlord = {
  id: string;
  name: string;
  city: string;
  state: string;
  verified: boolean;
  contact_info: string;
  address: string;
  business_email: string;
  website: string;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (authed) fetchLandlords();
  }, [authed]);

  async function fetchLandlords() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    setLoading(true);
    const { data, error } = await supabase
      .from("landlords")
      .select("*")
      .order("name");
    if (error) setMessage(`Error: ${error.message}`);
    setLandlords(data ?? []);
    setLoading(false);
  }

  async function verify(id: string) {
    const res = await fetch("/api/admin-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landlordId: id }),
    });
    if (res.ok) {
      setMessage("Verified!");
      setLandlords(prev => prev.map(l => l.id === id ? { ...l, verified: true } : l));
    } else {
      setMessage("Error verifying landlord.");
    }
    setTimeout(() => setMessage(""), 3000);
  }

  async function unverify(id: string) {
    const res = await fetch("/api/admin-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landlordId: id, unverify: true }),
    });
    if (res.ok) {
      setMessage("Unverified.");
      setLandlords(prev => prev.map(l => l.id === id ? { ...l, verified: false } : l));
    } else {
      setMessage("Error.");
    }
    setTimeout(() => setMessage(""), 3000);
  }

  const hasPendingInfo = (l: Landlord) =>
    !!(l.contact_info || l.address || l.business_email || l.website);

  const filtered = landlords
    .filter(l => showAll || hasPendingInfo(l))
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = landlords.filter(l => hasPendingInfo(l) && !l.verified).length;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="bg-white rounded-2xl p-8 w-80 shadow-xl">
          <h1 className="text-xl font-bold mb-4 text-zinc-900">Admin Access</h1>
          <input
            type="password"
            className="w-full border rounded-xl px-4 py-2 text-sm mb-3"
            placeholder="Password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && input === PASSWORD && setAuthed(true)}
          />
          <button
            className="w-full rounded-xl py-2 text-sm font-medium text-zinc-800"
            style={{ backgroundColor: "#F5D87A" }}
            onClick={() => input === PASSWORD ? setAuthed(true) : setMessage("Wrong password")}
          >
            Enter
          </button>
          {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">Verification Admin</h1>
        {pendingCount > 0 && (
          <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 border rounded-xl px-4 py-2 text-sm"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="rounded-xl px-4 py-2 text-sm font-medium border bg-white text-zinc-700"
          onClick={() => setShowAll(v => !v)}
        >
          {showAll ? "Show Pending Only" : "Show All"}
        </button>
      </div>

      {message && <div className="mb-4 text-green-700 font-medium">{message}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-500">No landlords found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(l => (
            <div key={l.id} className="bg-white rounded-2xl p-5 shadow flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-900">{l.name}</span>
                  <span className="ml-2 text-sm text-zinc-500">{l.city}, {l.state}</span>
                  {l.verified && <span className="ml-2 text-xs font-semibold text-yellow-600">✅ Verified</span>}
                </div>
                {l.verified ? (
                  <button
                    onClick={() => unverify(l.id)}
                    className="rounded-xl px-4 py-1.5 text-sm font-medium bg-zinc-200 text-zinc-700"
                  >
                    Unverify
                  </button>
                ) : (
                  <button
                    onClick={() => verify(l.id)}
                    className="rounded-xl px-4 py-1.5 text-sm font-medium text-zinc-800"
                    style={{ backgroundColor: "#F5D87A" }}
                  >
                    Approve
                  </button>
                )}
              </div>
              {l.contact_info && <div className="text-sm text-zinc-600">📞 {l.contact_info}</div>}
              {l.address && <div className="text-sm text-zinc-600">📍 {l.address}</div>}
              {l.business_email && <div className="text-sm text-zinc-600">✉️ {l.business_email}</div>}
              {l.website && <div className="text-sm text-zinc-600">🌐 {l.website}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

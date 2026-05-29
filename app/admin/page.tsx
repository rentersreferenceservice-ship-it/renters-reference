"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWebsite, setEditWebsite] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/admin");
        return;
      }
      setAuthed(true);
      fetchLandlords();
    }
    init();
  }, []);

  function startEdit(l: Landlord) {
    setEditingId(l.id);
    setEditPhone(l.contact_info ?? "");
    setEditAddress(l.address ?? "");
    setEditEmail(l.business_email ?? "");
    setEditWebsite(l.website ?? "");
  }

  async function saveEdit(id: string) {
    const res = await fetch("/api/admin-update-landlord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landlordId: id, phone: editPhone, address: editAddress, email: editEmail, website: editWebsite }),
    });
    if (res.ok) {
      setLandlords(prev => prev.map(l => l.id === id ? { ...l, contact_info: editPhone, address: editAddress, business_email: editEmail, website: editWebsite } : l));
      setEditingId(null);
      setMessage("Info saved!");
    } else {
      setMessage("Error saving info.");
    }
    setTimeout(() => setMessage(""), 3000);
  }

  async function fetchLandlords() {
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
      const data = await res.json().catch(() => ({}));
      setMessage(`Error: ${data.error ?? res.status}`);
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

  if (!authed) return null;

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
              {editingId === l.id ? (
                <div className="flex flex-col gap-2 mt-1">
                  <input className="border rounded-xl px-3 py-2 text-sm" placeholder="📞 Phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  <input className="border rounded-xl px-3 py-2 text-sm" placeholder="📍 Address" value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                  <input className="border rounded-xl px-3 py-2 text-sm" placeholder="✉️ Business Email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  <input className="border rounded-xl px-3 py-2 text-sm" placeholder="🌐 Website" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveEdit(l.id)} className="rounded-xl px-4 py-1.5 text-sm font-medium text-zinc-800" style={{ backgroundColor: "#F5D87A" }}>Save</button>
                    <button onClick={() => setEditingId(null)} className="rounded-xl px-4 py-1.5 text-sm font-medium bg-zinc-200 text-zinc-700">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {l.contact_info && <div className="text-sm text-zinc-600">📞 {l.contact_info}</div>}
                  {l.address && <div className="text-sm text-zinc-600">📍 {l.address}</div>}
                  {l.business_email && <div className="text-sm text-zinc-600">✉️ {l.business_email}</div>}
                  {l.website && <div className="text-sm text-zinc-600">🌐 {l.website}</div>}
                  <button onClick={() => startEdit(l)} className="self-start mt-1 rounded-xl px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 border">Edit Info</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

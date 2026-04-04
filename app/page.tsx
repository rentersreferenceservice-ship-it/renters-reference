"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="text-xl font-semibold tracking-tight">Renters Reference</div>
        <div className="flex gap-3">
          <a href="/login" className="rounded-xl border px-4 py-2 text-sm">Log In</a>
          <a href="/login" className="rounded-xl px-4 py-2 text-sm text-zinc-800" style={{ backgroundColor: "#F5D87A" }}>Create Account</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-16 bg-white">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 max-w-2xl leading-tight">
          The Honest Landlord Review Platform
        </h1>
        <p className="mt-4 text-lg text-zinc-500 max-w-xl">
          Real reviews from real tenants. Search landlords before you sign. Verified profiles for landlords who want to stand out.
        </p>
        <button
          className="mt-8 rounded-xl px-8 py-3 text-base font-medium text-zinc-800"
          style={{ backgroundColor: "#F5D87A" }}
          onClick={() => router.push("/search")}
        >
          Search Landlords
        </button>
      </section>

      {/* TWO COLUMNS */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">

        {/* FOR TENANTS */}
        <div className="flex flex-col justify-center px-10 py-14 bg-zinc-50 border-t md:border-r">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">For Tenants</div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Know before you sign.</h2>
          <ul className="space-y-3 text-zinc-600 text-sm">
            <li>🔍 <span className="font-medium">Search by state</span> — find landlords in your area instantly</li>
            <li>⭐ <span className="font-medium">Read honest reviews</span> — repair responsiveness, deposit returns, and overall experience from past tenants</li>
            <li>📋 <span className="font-medium">Make informed decisions</span> — before you sign a lease, know who you're renting from</li>
            <li>🔒 <span className="font-medium">Anonymous & safe</span> — all reports are anonymous so you can be honest without worry</li>
            <li>✅ <span className="font-medium">Free for tenants</span> — no fees, no sign-up required to search or submit a report</li>
          </ul>
          <button
            className="mt-8 self-start rounded-xl px-6 py-2.5 text-sm font-medium text-zinc-800"
            style={{ backgroundColor: "#F5D87A" }}
            onClick={() => router.push("/search")}
          >
            Search Landlords →
          </button>
        </div>

        {/* FOR LANDLORDS */}
        <div className="flex flex-col justify-center px-10 py-14 bg-white border-t">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">For Landlords</div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Show tenants why you're the best.</h2>
          <ul className="space-y-3 text-zinc-600 text-sm">
            <li>🏅 <span className="font-medium">Claim your verified profile</span> — stand out with a trusted badge that tenants recognize</li>
            <li>⭐ <span className="font-medium">Showcase your ratings</span> — let your 5-star reputation attract quality tenants</li>
            <li>📞 <span className="font-medium">Display your contact info</span> — phone, email, and website visible directly on your profile</li>
            <li>🌐 <span className="font-medium">Link your website</span> — drive traffic from renters actively looking in your area</li>
          </ul>
          <button
            className="mt-8 self-start rounded-xl px-6 py-2.5 text-sm font-medium text-zinc-800"
            style={{ backgroundColor: "#F5D87A" }}
            onClick={() => router.push("/search")}
          >
            Claim Your Profile →
          </button>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-xs text-zinc-400 border-t bg-white">
        © {new Date().getFullYear()} Renters Reference ·{" "}
        <a href="mailto:rentersreferenceservice@gmail.com" className="underline">Contact Us</a>
      </footer>
    </div>
  );
}

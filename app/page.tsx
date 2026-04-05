"use client";
// force redeploy 2
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4L4 18V40H16V28H28V40H40V18L22 4Z" stroke="#18181b" strokeWidth="2.5" strokeLinejoin="round" fill="white"/>
            <rect x="13" y="18" width="18" height="18" rx="1" stroke="#18181b" strokeWidth="2" fill="white"/>
            <text x="22" y="32" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="13" fill="#18181b">R</text>
          </svg>
          <span className="text-lg font-bold tracking-tight text-zinc-900">Renters Reference</span>
        </div>
        <div className="flex gap-3">
          <a href="/login" className="rounded-xl border bg-white px-4 py-1.5 text-sm">Log In</a>
          <a href="/login" className="rounded-xl px-4 py-1.5 text-sm font-medium text-zinc-800" style={{ backgroundColor: "#F5D87A" }}>Create Account</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-8 bg-white/80 backdrop-blur border-b flex-shrink-0">
        <div className="flex gap-1 mb-3">
          {[1,2,3,4,5].map(i => (
            <span key={i} className="text-2xl" style={{ color: "#F5D87A" }}>★</span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          Tenants: Rent with Confidence.<br/>Landlords: Protect Your Investment.
        </h1>

        <div className="mt-5 flex gap-3 flex-wrap justify-center">
          <button className="rounded-xl px-7 py-2.5 text-sm font-medium text-zinc-800 shadow-md" style={{ backgroundColor: "#F5D87A" }} onClick={() => router.push("/search")}>
            Search Landlords
          </button>
          <button className="rounded-xl px-7 py-2.5 text-sm font-medium text-zinc-800 bg-white border shadow-md" onClick={() => router.push("/search")}>
            Claim Your Profile
          </button>
        </div>
        <div className="mt-5 flex gap-3 flex-wrap justify-center">
          <div className="rounded-full bg-white border px-4 py-1.5 text-xs text-zinc-600 shadow-sm">🏠 1,000+ Landlords Listed</div>
          <div className="rounded-full bg-white border px-4 py-1.5 text-xs text-zinc-600 shadow-sm">🔒 100% Anonymous Reports</div>
          <div className="rounded-full bg-white border px-4 py-1.5 text-xs text-zinc-600 shadow-sm">✅ Free for Tenants</div>
        </div>
      </section>

      {/* TWO COLUMNS */}
      <section className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">

        {/* FOR TENANTS */}
        <div className="flex flex-col justify-center px-10 py-8 bg-zinc-900 md:border-r border-t overflow-hidden">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 shadow-sm" style={{ backgroundColor: "#F5D87A" }}>🔍</div>
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">For Tenants</div>
          <h2 className="text-xl font-bold text-white mb-4">Tenants: Rent with Confidence.</h2>
          <div className="space-y-3">
            {[
              { icon: "⭐", title: "Honest Reviews", desc: "Repair responsiveness, deposit returns, and overall experience from past tenants" },
              { icon: "🔍", title: "Search by State", desc: "Find landlords in your area and filter by city or name" },
              { icon: "🔒", title: "Anonymous & Safe", desc: "All reports are completely anonymous — be honest without worry" },
              { icon: "✅", title: "Free for Tenants", desc: "No fees, no sign-up required to search or submit a report" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: "#F5D87A" }}>{icon}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 self-start rounded-xl px-5 py-2 text-sm font-medium text-zinc-800 shadow-sm" style={{ backgroundColor: "#F5D87A" }} onClick={() => router.push("/search")}>
            Search Landlords →
          </button>
        </div>

        {/* FOR LANDLORDS */}
        <div className="flex flex-col justify-center px-10 py-8 bg-zinc-900 border-t overflow-hidden">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 shadow-sm" style={{ backgroundColor: "#F5D87A" }}>🏅</div>
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">For Landlords</div>
          <h2 className="text-xl font-bold text-white mb-4">Landlords: Protect Your Investment.</h2>
          <div className="space-y-3">
            {[
              { icon: "✓", title: "Verified Badge", desc: "Stand out with a trusted verified badge that quality tenants look for" },
              { icon: "⭐", title: "Showcase Ratings", desc: "Let your 5-star reputation attract the tenants you want" },
              { icon: "📞", title: "Display Contact Info", desc: "Phone, email, and website visible directly on your profile" },
              { icon: "🌐", title: "Link Your Website", desc: "Drive traffic from renters actively searching in your area" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 font-bold" style={{ backgroundColor: "#F5D87A", color: "#18181b" }}>{icon}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 self-start rounded-xl px-5 py-2 text-sm font-medium text-zinc-800 shadow-sm" style={{ backgroundColor: "#F5D87A" }} onClick={() => router.push("/search")}>
            Claim Your Profile →
          </button>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-2.5 text-xs text-zinc-400 border-t bg-white/90 backdrop-blur flex-shrink-0">
        © {new Date().getFullYear()} Renters Reference ·{" "}
        <a href="mailto:rentersreferenceservice@gmail.com" className="underline">Contact Us</a>
      </footer>
    </div>
  );
}

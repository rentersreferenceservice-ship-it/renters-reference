// deploy bump
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
{/* analytics test */}
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Renters Reference",
  description: "Renters Reference",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en">   
 <body className="min-h-screen">
  {/* BACKGROUND LAYER */}
<div
 className="fixed inset-0 -z-10 pointer-events-none"
  style={{
    backgroundImage: "url('/backgrounds/apt-pattern.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "700px",
    backgroundPosition: "top left",
  }}
></div>
  {/* MISSION BANNER */}
  <div className="mission-banner relative z-20 w-full text-center px-4 py-2" style={{ backgroundColor: "#F5D87A" }}>
    <p className="text-sm font-bold text-zinc-800">🏠 Landlords — turn your subscription into a donation.</p>
    <p className="text-xs text-zinc-700">A for-profit social enterprise · 75% of proceeds support homeless and housing initiatives in your state.</p>
  </div>

  {/* APP CONTENT */}
<div className="min-h-screen relative z-10 bg-transparent">
  {/* force redeploy */}
  {children}
</div>

<Analytics />

</body>
</html>
);
}

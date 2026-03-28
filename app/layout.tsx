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

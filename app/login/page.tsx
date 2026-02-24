"use client";

export default function Home() {
  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Renters Reference</h1>
      <p>Welcome. This is the home page.</p>

      <p style={{ marginTop: 12 }}>
        <a href="/login">Go to Login</a>
      </p>
    </div>
  );
}

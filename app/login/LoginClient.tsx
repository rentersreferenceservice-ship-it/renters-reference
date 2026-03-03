"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function LoginClient() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleForgotPassword() {
    setMsg(null);

    const supabase = getSupabase();
    const cleanEmail = (email || "").trim();

    if (!cleanEmail) {
      setMsg("Please enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: "https://rentersreference.org/reset-password",
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Check your email for a password reset link.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const supabase = getSupabase();
      const cleanEmail = (email || "").trim();

      if (!cleanEmail) {
        setMsg("Please enter your email.");
        return;
      }
      if (!pw) {
        setMsg("Please enter your password.");
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pw,
        });
        if (error) {
          setMsg(error.message);
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pw,
        });
        if (error) {
          setMsg(error.message);
          return;
        }
      }

      setMsg("Success.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-3">
          {mode === "login" ? "Log in" : "Sign up"}
        </h1>

        {msg && <p className="mb-3 text-sm">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          <input
            className="w-full border p-2 rounded"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full border p-2 rounded"
          >
            {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-xs"></p>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="underline"
          >
            Forgot your password?
          </button>

          <button
            type="button"
            className="underline"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          >
            Switch to {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
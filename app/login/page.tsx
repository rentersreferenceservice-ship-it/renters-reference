"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !pw) {
      setMsg("Please enter email and password.");
      return;
    }

    if (mode === "signup" && pw !== pw2) {
      setMsg("Passwords do not match.");
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

      window.location.href = "/";
      return;
    }

    // signup
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pw,
    });

    if (error) {
      // common case: they already signed up earlier
      if (error.message.toLowerCase().includes("already registered")) {
        setMsg("You already have an account. Switch to Log in.");
        setMode("login");
        return;
      }

      setMsg(error.message);
      return;
    }

    // Depending on your Supabase auth settings, they may need email confirmation.
    setMsg("Account created. If email confirmation is enabled, check your inbox.");
    // Optional: send them back to login mode
    setMode("login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Renters Reference
          </h1>

          <a href="/" className="text-sm underline">
            Back to app
          </a>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`rounded-xl border px-3 py-1 text-sm ${
              mode === "login" ? "bg-black text-white" : ""
            }`}
            onClick={() => {
              setMode("login");
              setMsg("");
            }}
          >
            Log in
          </button>

          <button
            type="button"
            className={`rounded-xl border px-3 py-1 text-sm ${
              mode === "signup" ? "bg-black text-white" : ""
            }`}
            onClick={() => {
              setMode("signup");
              setMsg("");
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        {msg && <div className="mt-4 text-sm text-zinc-600">{msg}</div>}

        <p className="mt-6 text-xs text-zinc-500">
          Auth is powered by Supabase. If email confirmation is enabled in your
          Supabase project, you may need to confirm before logging in.
        </p>
      </div>
    </div>
  );
}
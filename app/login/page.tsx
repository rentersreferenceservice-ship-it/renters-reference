"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [statusMsg, setStatusMsg] = useState("");
const [errorMsg, setErrorMsg] = useState("");
const [mode, setMode] = useState<"login" | "signup">("login");
const [email, setEmail] = useState("");
const [pw, setPw] = useState("");
const [loading, setLoading] = useState(false);
const [msg, setMsg] = useState<string | null>(null);

const supabase = getSupabase();
 const handleForgotPassword = async () => {
  setMsg(null);
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

 setMsg( "Check your email for a password reset link.");
};


  setStatusMsg("Check your email for a password reset link.");
}; 
<button
  type="button"
  onClick={handleForgotPassword}
  className="text-sm underline"
>
  Forgot your password?
</button>
  const [statusMsg, setStatusMsg] = useState("");
  const supabase = getSupabase();
const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
async function handleForgotPassword() {
  setMsg(null);

  const cleanEmail = email.trim();
  if (!cleanEmail) {
    setMsg("Enter your email first.");
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
  try {
    setLoading(true);
    

    setMsg("Password reset email sent. Check your inbox/spam.");
  } finally {
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !pw) {
      setMsg("Enter email and password.");
      return;
    }

    setLoading(true);
    try {

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pw,
        });
        if (error) setMsg(error.message);
        else setMsg("Logged in!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pw,
        });
        if (error) setMsg(error.message);
        else setMsg("Check your email to confirm sign-up.");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  
return (
  <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Renters Reference
        </h1>

        <button
          type="button"
          className="text-sm underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Create account" : "Have an account?"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-zinc-700">Email</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-700">Password</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        <button
          className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm underline"
        >
          Forgot your password?
        </button>

        {msg && <div className="text-sm text-zinc-700">{msg}</div>}
      </form>
    </div>
  </div>
);
} 
 

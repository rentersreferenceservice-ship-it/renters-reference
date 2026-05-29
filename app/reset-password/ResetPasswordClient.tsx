"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    const supabase = getSupabase();

    // PKCE flow — code comes in as a URL query param
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setLinkError("This reset link has expired or is invalid. Please request a new one.");
        } else {
          setReady(true);
        }
      });
      return;
    }

    // Implicit flow — token comes in the URL hash, Supabase fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // If neither, the link is bad
    const timer = setTimeout(() => {
      if (!ready) setLinkError("Invalid reset link. Please request a new one from the login page.");
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleReset() {
    if (!password) {
      setMsg("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setMsg("Password updated successfully! Redirecting to login...");
    setTimeout(() => router.replace("/login"), 1500);
  }

  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow text-center">
          <p className="text-sm text-red-600 mb-4">{linkError}</p>
          <a href="/login" className="underline text-sm text-zinc-700">Back to Login</a>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-zinc-500">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-3">Set New Password</h1>
        {msg && <p className="mb-3 text-sm text-zinc-700">{msg}</p>}
        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-xl py-2 text-sm font-medium text-zinc-800"
          style={{ backgroundColor: "#F5D87A" }}
        >
          Set New Password
        </button>
        <div className="mt-3 text-center">
          <a href="/login" className="text-xs text-zinc-500 underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
}

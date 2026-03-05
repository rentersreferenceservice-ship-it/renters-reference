"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function ResetPasswordClient() {
  const router = useRouter();
  const supabase = getSupabase();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleReset() {
    if (!password) {
      setMsg("Please enter a new password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMsg("Error: " + error.message);
      return;
    }

    setMsg("Password updated successfully. Redirecting to login...");
    setTimeout(() => router.replace("/login"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-xl font-semibold mb-3">Reset Password</h1>

        {msg && <p className="mb-3 text-sm">{msg}</p>}

        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="button" onClick={handleReset} className="w-full border p-2 rounded">
          Set New Password
        </button>
      </div>
    </div>
  );
}
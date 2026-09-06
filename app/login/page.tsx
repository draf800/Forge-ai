"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/builder` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-forge-bg text-forge-paper">
      <div className="w-full max-w-sm rounded-sm border border-forge-line bg-forge-panel p-8">
        <h1 className="font-display text-2xl">Sign in</h1>
        <p className="mt-2 text-sm text-forge-mute">
          No password — we'll email you a one-time link.
        </p>

        {sent ? (
          <p className="mt-6 text-sm text-forge-brass">Check your inbox for the link.</p>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-forge-line bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-ember"
            />
            <button
              type="submit"
              className="w-full rounded-sm bg-forge-ember px-3 py-2 text-sm font-medium text-forge-bg hover:brightness-110"
            >
              Send link
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}

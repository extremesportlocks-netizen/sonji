"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-gray-900">
            sonji<span className="text-violet-500">.</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">This site is password protected</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              autoFocus
              className={`w-full px-4 py-3 text-sm text-center border rounded-xl focus:outline-none focus:ring-2 transition ${
                error
                  ? "border-red-300 focus:ring-red-500/20 bg-red-50/50"
                  : "border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-300"
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 text-center mt-2">Incorrect password</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.ok) {
      router.push("/profile");
    } else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-[#070707] rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Login</h1>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <label className="block text-sm text-zinc-700 dark:text-zinc-300">Username</label>
        <input
          className="mt-1 mb-3 w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm text-zinc-700 dark:text-zinc-300">Password</label>
        <input
          type="password"
          className="mt-1 mb-4 w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <button className="rounded bg-zinc-800 text-white px-4 py-2 text-sm">Sign in</button>
          <div className="text-xs text-zinc-500">Demo credentials: Nasran2002 / Nasran2002</div>
        </div>
      </form>
    </div>
  );
}

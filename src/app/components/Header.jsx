"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";

// Header component — shows site title on the left and auth controls on the right.
// The header is a client component because it consumes `useAuth()` which
// persists auth state in localStorage.
export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Simple logout helper: clear state and navigate home
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="w-full border-b border-gray-100 dark:border-zinc-800 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* site title (links home) */}
          <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Nasran Salaeh</Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Hi, {user.name}</span>
                <button onClick={handleLogout} className="text-sm rounded px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Logout</button>
              </>
            ) : (
              <Link href="/login" className="text-sm rounded px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

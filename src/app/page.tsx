import Link from "next/link";

// === Landing Page ===
// หน้าแรกของเว็บไซต์ - แสดง welcome message และลิงก์ไป Register/Login
export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-primary)]/10">
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
          Welcome to Portfolio Platform
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create your own portfolio website in minutes. Showcase your work, share your story, and connect with clients.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-transparent border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-lg transition transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 text-gray-600">
          <p className="text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
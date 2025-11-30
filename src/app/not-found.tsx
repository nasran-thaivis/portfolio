import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-primary)]/10">
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
          404
        </h1>
        
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-transparent border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-lg transition transform hover:scale-105"
          >
            Create Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}


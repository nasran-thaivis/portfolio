import Image from "next/image";
import Container from "./components/Container";

export default function Home() {
  return (
    <Container title="Home">
      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">Welcome</h2>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          This is a starter home section. Use the navigation to visit About, Profile, Review and Contact.
        </p>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-4">
          <a className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]" href="/profile">View Profile</a>
          <a className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]" href="/about">About</a>
        </div>
      </div>
    </Container>
  );
}

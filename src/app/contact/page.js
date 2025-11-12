export const metadata = {
  title: "Contact",
  description: "Contact information for Nasran Salaeh",
};

import { SOCIAL } from "../../data/socialLinks";
import Container from "../components/Container";

export default function ContactPage() {
  return (
    <Container title="Contact">
      <section className="mt-2 text-zinc-700 dark:text-zinc-300">
        <p className="mb-2"><strong>Phone:</strong> <a className="text-emerald-600 hover:underline" href="tel:0622095297">062-209-5297</a></p>
        <p className="mb-2"><strong>Email:</strong> <a className="text-emerald-600 hover:underline" href="mailto:Nasransalaeh39@gmail.com">Nasransalaeh39@gmail.com</a></p>
        <p className="mb-2"><strong>Address:</strong> 61/16 Fah Mai Mansion, Soi Nawarak, Rassada, Mueang, Phuket 83000</p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Social</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Connect on social media — links below open in a new tab.</p>

        <div className="mt-4 flex items-center gap-3">
          {SOCIAL.facebook ? (
            <a href={SOCIAL.facebook} title="Facebook" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/></svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Facebook</span>
            </a>
          ) : null}

          {SOCIAL.instagram ? (
            <a href={SOCIAL.instagram} title="Instagram" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm6.6-1.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"/></svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Instagram</span>
            </a>
          ) : null}

          {SOCIAL.line ? (
            <a href={SOCIAL.line} title="Line" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5a3.5 3.5 0 0 0-3.5-3.5H6.5A3.5 3.5 0 0 0 3 6.5v7A3.5 3.5 0 0 0 6.5 17H8v3l3.5-3H17.5A3.5 3.5 0 0 0 21 13.5v-7z"/></svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Line</span>
            </a>
          ) : null}

          {SOCIAL.tiktok ? (
            <a href={SOCIAL.tiktok} title="TikTok" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3h3v2h-1.5C17.12 5 16 6.12 16 7.5V13a4 4 0 1 1-4-4V5a2 2 0 0 0 2 2h1V3z"/></svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">TikTok</span>
            </a>
          ) : null}
        </div>
      </section>
    </Container>
  );
}

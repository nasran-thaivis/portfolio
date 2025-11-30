import { SOCIAL } from "../../data/socialLinks";
import Container from "../../components/Container";
import ContactForm from "./ContactForm";
import { notFound } from "next/navigation";

// Helper to get base URL for API calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[ContactPage] Fetching user: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error(`[ContactPage] User not found: ${username}, status: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    
    // Handle both success:false and success:true formats
    if (data.success === false) {
      console.error(`[ContactPage] User not found: ${username}`);
      return null;
    }
    
    if (data.success && data.user) {
      console.log(`[ContactPage] User found: ${username}`, data.user.username);
      return data.user;
    }
    
    // Fallback: if data has user properties directly
    if (data.username || data.email) {
      return data;
    }
    
    console.error(`[ContactPage] Invalid response format for user: ${username}`, data);
    return null;
  } catch (error) {
    console.error(`[ContactPage] Error loading user ${username}:`, error);
    return null;
  }
}

export default async function ContactPage({ params }) {
  const { username } = await params;

  // ตรวจสอบว่า user มีอยู่จริง
  const user = await getUserByUsername(username);
  
  // ถ้าไม่พบ user ให้แสดง 404
  if (!user) {
    console.warn(`[ContactPage] User ${username} not found, showing 404`);
    notFound();
  }
  
  // Use user email
  const displayEmail = user?.email || `${username}@example.com`;

  return (
    <Container title="Contact">
      <div className="space-y-8">
        {/* Contact Info Section */}
        <section className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border-2 border-zinc-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-semibold text-gray-200">Phone</p>
                <a className="text-[var(--color-primary)] hover:underline" href="tel:0622095297">
                  062-209-5297
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold text-gray-200">Email</p>
                <a
                  className="text-[var(--color-secondary)] hover:underline break-all"
                  href={`mailto:${displayEmail}`}
                >
                  {displayEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold text-gray-200">Address</p>
                <p className="text-sm">61/16 Fah Mai Mansion, Soi Nawarak, Rassada, Mueang, Phuket 83000</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Send a Message</h2>
            <p className="text-sm text-gray-400">Fill out the form below and we&apos;ll get back to you soon!</p>
          </div>
          <ContactForm username={username} />
        </section>

        {/* Social Media Section */}
        <section className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border-2 border-zinc-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            Connect on Social Media
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {SOCIAL?.facebook && (
              <a
                href={SOCIAL.facebook}
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all transform hover:scale-105 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                </svg>
                <span className="font-semibold">Facebook</span>
              </a>
            )}

            {SOCIAL?.instagram && (
              <a
                href={SOCIAL.instagram}
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-2 border-pink-500/30 hover:border-pink-500/50 transition-all transform hover:scale-105 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm6.6-1.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z" />
                </svg>
                <span className="font-semibold">Instagram</span>
              </a>
            )}

            {SOCIAL?.tiktok && (
              <a
                href={SOCIAL.tiktok}
                title="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 border-2 border-gray-500/30 hover:border-gray-500/50 transition-all transform hover:scale-105 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 3h3v2h-1.5C17.12 5 16 6.12 16 7.5V13a4 4 0 1 1-4-4V5a2 2 0 0 0 2 2h1V3z" />
                </svg>
                <span className="font-semibold">TikTok</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}


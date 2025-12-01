// === Root Layout สำหรับแอพพลิเคชัน ===
// กำหนดโครงสร้าง HTML หลักและ Font สำหรับทั้งเว็บไซต์
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata = {
  title: "Portfolio Platform",
  description: "Create your own portfolio website in minutes. Showcase your work, share your story, and connect with clients.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased bg-[var(--color-bg)] text-[var(--color-text)]`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
              {/* Header: แสดง Navigation และ Logo */}
              <Header />
              
              {/* Main Content: เนื้อหาหลักของแต่ละหน้า */}
              <main className="flex-1 w-full">
                {children}
              </main>

              {/* Footer: แสดงข้อมูลติดต่อและ Social Media */}
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ApiSandbox from "@/components/ApiSandbox";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudentHub | Platform Marketplace Project Mahasiswa Indonesia #1",
  description: "Wadah kreativitas mahasiswa Indonesia. Jual project hasil karyamu, beli project berkualitas, atau ajukan project baru dalam ekosistem digital futuristik.",
  keywords: ["StudentHub", "Marketplace Project Mahasiswa", "Beli Project Coding", "Web Dev Mahasiswa", "AI ML Project", "IoT Project"],
  authors: [{ name: "StudentHub Team" }],
  openGraph: {
    title: "StudentHub | Wadah Kreativitas Mahasiswa Indonesia",
    description: "Jual project hasil karyamu, beli project berkualitas, atau ajukan project baru dalam ekosistem digital futuristik.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${spaceGrotesk.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased flex flex-col font-sans">
        <AuthProvider>
          <div className="relative w-full min-h-screen overflow-hidden">
            {/* Ambient Decorative Glows */}
            <div className="ambient-glow-1"></div>
            <div className="ambient-glow-2"></div>
            <div className="ambient-glow-3"></div>
            
            {/* Main content wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
            <ApiSandbox />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

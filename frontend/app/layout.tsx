import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "EchoHire AI — The Interview Coach That Listens Like a Human",
  description: "Real-time full-duplex voice interview coach powered by Rime TTS & LiveKit. Stops instantly when interrupted and continues conversation naturally without replaying stale responses.",
  keywords: ["Rime TTS", "Voice AI", "LiveKit", "AI Interview Coach", "Full Duplex", "Mock Interview", "Deepgram STT"],
  authors: [{ name: "EchoHire AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

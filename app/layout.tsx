import type { Metadata, Viewport } from "next";
import { Syne, DM_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import "./mobile.css";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PWARegistration } from "@/components/PWARegistration";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "VigIA - Vigilância contínua. Decisão sua.",
  description: "A cirurgia dura horas. O pós-operatório dura semanas. A VigIA está lá do começo ao fim. Monitoramento pós-operatório inteligente com IA.",
  applicationName: "VigIA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VigIA",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/vigia-logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0E14", // VigIA midnight
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${syne.variable} ${dmMono.variable} ${cormorant.variable} antialiased`}
      >
        <AuthProvider>
          <TutorialProvider>
            <PWARegistration />
            <OfflineIndicator />
            <InstallPrompt />
            {children}
            <Toaster />
          </TutorialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

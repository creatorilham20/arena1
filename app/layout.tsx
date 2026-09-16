import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Sidebar from "@/components/sidebar";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { getSetting } from "@/lib/db";
import { getNotifications } from "@/lib/notifications";
import { isPinEnabled, PIN_COOKIE } from "@/lib/pin";
import Splash from "@/components/splash";
import PWARegister from "@/components/pwa-register";
import PinScreen from "@/components/pin-screen";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ilham Business Manager",
  description: "Satu aplikasi untuk mengontrol seluruh bisnis Ilham: Premium Apps, Jasa Editing, Frame Custom, dan Dokumentasi Acara.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "IBM" },
  icons: {
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  other: { "theme-color": "#4f46e5", "mobile-web-app-capable": "yes" },
};

export const dynamic = "force-dynamic";

async function safeSettings() {
  try {
    const [businessName, notifications, pinEnabled] = await Promise.all([
      getSetting("business_name"),
      getNotifications(),
      isPinEnabled(),
    ]);
    return { businessName, notifications, pinEnabled: !!pinEnabled };
  } catch {
    return { businessName: null, notifications: [], pinEnabled: false };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { businessName, notifications, pinEnabled } = await safeSettings();
  const store = await cookies();
  const locked = pinEnabled && store.get(PIN_COOKIE)?.value !== "1";

  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <ThemeProvider>
          {locked ? (
            <PinScreen businessName={businessName ?? "Ilham Business Manager"} />
          ) : (
            <>
              <Splash businessName={businessName ?? "Ilham Business Manager"} />
              <PWARegister />
              <Sidebar businessName={businessName ?? "Ilham Business Manager"} notifications={notifications} pinEnabled={pinEnabled} />
              <main className="lg:pl-60">
                <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-10">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </main>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
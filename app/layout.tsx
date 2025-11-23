import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/auth/SessionProvider";
// import Script from "next/script"; // COMMENT THIS OUT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chefini - Turn Leftovers into Magic",
  description: "Smart culinary companion that reduces food waste by turning random leftovers into gourmet meals",
  icons: '/favicon.png',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* COMMENT OUT THIS ENTIRE SCRIPT BLOCK */}
        {/*
        <Script id="disable-context-menu" strategy="afterInteractive">
          {`
            // Disable right-click
            document.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              return false;
            });

            // Disable common keyboard shortcuts for copying
            document.addEventListener('keydown', (e) => {
              // Disable Ctrl+C, Ctrl+U (view source), F12 (devtools)
              if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'u')) ||
                e.key === 'F12'
              ) {
                e.preventDefault();
                return false;
              }
            });

            // Disable text selection on images
            document.addEventListener('selectstart', (e) => {
              if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
              }
            });
          `}
        </Script>
        */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
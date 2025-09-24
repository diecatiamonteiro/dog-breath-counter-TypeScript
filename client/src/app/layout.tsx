/**
 * @file client/src/app/layout.tsx
 * @description Root layout for the Paw Pulse app.
 *              Sets up:
 *                - Global font (Nunito)
 *                - Metadata and favicons
 *                - Global providers (Axios, Google, App context)
 *                - Responsive navigation (desktop sidebar, mobile nav)
 *                - Toast notifications (react-toastify)
 *              Wraps all pages via Next.js App Router.
 */

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/Context";
import { AxiosProvider } from "../components/AxiosProvider";
import GoogleProvider from "../components/GoogleProvider";
import Container from "@/components/Container";
import NavigationDesktop from "@/components/navigation/NavigationDesktop";
import NavigationMobile from "@/components/navigation/NavigationMobile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "optional", // font will load in the bg without blocking rendering
});

export const metadata: Metadata = {
  title: "Paw Pulse | Pet Breath Counter",
  description: "An app to count the number of breaths a pet takes per minute.",

  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/favicon/site.webmanifest",
      },
    ],
  },
};

// Root Layout (main layout for the whole app)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <AxiosProvider>
          <GoogleProvider>
            <AppProvider>
              {/* Responsive Layout: render children once to avoid duplicate IDs */}
              <div className="flex h-screen">
                {/* Sidebar only on desktop */}
                <div className="hidden lg:block">
                  <NavigationDesktop />
                </div>
                {/* Content area scroll container */}
                <div className="flex-1 overflow-auto">
                  {/* Mobile nav only on small screens */}
                  <div className="block lg:hidden">
                    <NavigationMobile />
                  </div>
                  <Container>{children}</Container>
                </div>
              </div>

              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </AppProvider>
          </GoogleProvider>
        </AxiosProvider>
      </body>
    </html>
  );
}

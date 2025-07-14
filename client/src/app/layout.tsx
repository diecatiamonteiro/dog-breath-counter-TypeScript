import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/Context";
import { AxiosProvider } from "../components/AxiosProvider";
import GoogleProvider from "../components/GoogleProvider";
import Container from "@/components/Container";
import NavigationDesktop from "@/components/navigation/desktop/NavigationDesktop";
import NavigationMobile from "@/components/navigation/mobile/NavigationMobile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Font
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "optional", // font will load in the bg without blocking rendering
});

// Metadata
export const metadata: Metadata = {
  title: "Paw Pulse | Pet Breath Counter",
  description: "An app to count the number of breaths a pet takes per minute.",

  // Favicon
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
              {/* Desktop Layout with Sidebar */}
              <div className="hidden lg:flex h-screen">
                <NavigationDesktop />
                <div className="flex-1 overflow-auto">
                  <Container>{children}</Container>
                </div>
              </div>

              {/* Mobile Layout with Top Bar and Bottom Navigation */}
              <div className="block lg:hidden">
                <NavigationMobile />
                <Container>{children}</Container>
              </div>
              
              {/* Toast Notifications */}
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

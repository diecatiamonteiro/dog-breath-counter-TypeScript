import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from '../context/Context';
import { AxiosProvider } from '../components/AxiosProvider';

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Pet Breath Counter",
  description: "A simple app to count the number of breaths a pet takes per minute.",
};

// Root Layout (main layout for the whole app)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AxiosProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AxiosProvider>
      </body>
    </html>
  );
}

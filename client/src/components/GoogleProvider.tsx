/**
 * @file GoogleProvider.tsx
 * @description Google OAuth provider for Google login
 *              Wraps the app in the GoogleOAuthProvider (@react-oauth/google)
 *              Is used in the app/layout.tsx file to wrap the app in the GoogleOAuthProvider component
 *              Allows login UI to be used in the app (in the AuthForm component)
 */

"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

interface GoogleProviderProps {
  children: React.ReactNode;
}

export default function GoogleProvider({ children }: GoogleProviderProps) {
  // Use a safe fallback so hooks don't throw during build/prerender in CI
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "DUMMY_GOOGLE_CLIENT_ID";
  if (googleClientId === "DUMMY_GOOGLE_CLIENT_ID") {
    console.warn("Google Client ID not found. Google login will not work.");
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

/**
 * @file client/src/app/(auth)/auth/page.tsx
 * @description Renders the authentication page.
 *              Uses query param `mode` (`login` | `register`) to decide which AuthForm mode to show.
 */

"use client";
import AuthForm from "@/components/auth/AuthForm";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const params = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";

  return <AuthForm defaultMode={mode} />;
}

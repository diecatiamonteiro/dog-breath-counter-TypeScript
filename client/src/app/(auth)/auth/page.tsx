"use client";
import AuthForm from "@/components/auth/AuthForm";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const params = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";

  return <AuthForm defaultMode={mode} />;
}

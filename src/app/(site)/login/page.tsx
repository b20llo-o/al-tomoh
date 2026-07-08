import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Al-Tomoh account, create a new account, or recover your password.",
};

export default function LoginPage() {
  return (
    <div className="container-page flex flex-col items-center py-14 sm:py-20">
      <LogoMark className="mb-6 h-14 w-14 animate-scale-in" />
      <div className="w-full max-w-md animate-fade-up">
        <Suspense>
          <AuthPanel />
        </Suspense>
      </div>
    </div>
  );
}

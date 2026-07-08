import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Al-Tomoh account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="container-page flex flex-col items-center py-14 sm:py-20">
      <LogoMark className="mb-6 h-14 w-14 animate-scale-in" />
      <div className="w-full max-w-md animate-fade-up">
        <ResetPasswordForm />
      </div>
    </div>
  );
}

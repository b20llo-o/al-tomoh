"use client";

import { Printer } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export function PrintButton() {
  const { t } = useLocale();
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary h-9 px-4 text-xs">
      <Printer className="h-4 w-4" strokeWidth={1.75} />
      {t("inv.print")}
    </button>
  );
}

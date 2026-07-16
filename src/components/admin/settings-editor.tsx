"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { saveStoreSetting } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import type { StoreSettingsMap } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SettingsEditor({
  currency,
  shipping,
  tax,
}: {
  currency: StoreSettingsMap["currency"];
  shipping: StoreSettingsMap["shipping"];
  tax: StoreSettingsMap["tax"];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CurrencyCard initial={currency} />
      <ShippingCard initial={shipping} />
      <TaxCard initial={tax} />
    </div>
  );
}

function useSaver() {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  async function run(fn: () => Promise<{ success: boolean; message: string }>) {
    setSaving(true);
    setStatus(null);
    const result = await fn();
    setStatus({ ok: result.success, msg: result.message });
    setSaving(false);
  }
  return { status, saving, run };
}

function Card({
  title,
  description,
  onSubmit,
  children,
  saving,
  status,
}: {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  saving: boolean;
  status: { ok: boolean; msg: string } | null;
}) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="card-surface p-6">
      <h2 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
        {title}
      </h2>
      <p className="mb-5 mt-0.5 text-sm text-muted">{description}</p>
      <div className="space-y-4">{children}</div>
      <div className="mt-5 flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {saving ? t("common.saving") : t("adm.save")}
        </button>
        {status && (
          <p className={cn("text-sm", status.ok ? "text-brand-600 dark:text-brand-400" : "text-red-600 dark:text-red-400")}>
            {status.msg}
          </p>
        )}
      </div>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label-field">{label}</span>
      <input
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-field"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm text-navy-900/80 dark:text-parchment-100/80">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[#ee7124]"
      />
    </label>
  );
}

function CurrencyCard({ initial }: { initial: StoreSettingsMap["currency"] }) {
  const { t } = useLocale();
  const [data, setData] = useState(initial);
  const { status, saving, run } = useSaver();
  return (
    <Card
      title={t("adm.currency")}
      description={t("adm.currencyDesc")}
      saving={saving}
      status={status}
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveStoreSetting("currency", data));
      }}
    >
      <NumberField
        label={t("adm.exchangeRate")}
        step="0.01"
        value={data.try_per_usd}
        onChange={(v) => setData({ try_per_usd: v })}
        hint={t("adm.exchangeHint")}
      />
    </Card>
  );
}

function ShippingCard({ initial }: { initial: StoreSettingsMap["shipping"] }) {
  const { t } = useLocale();
  const [data, setData] = useState(initial);
  const { status, saving, run } = useSaver();
  return (
    <Card
      title={t("adm.shipping")}
      description={t("adm.shippingDesc")}
      saving={saving}
      status={status}
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveStoreSetting("shipping", data));
      }}
    >
      <NumberField
        label={t("adm.domesticRate")}
        value={data.domestic_flat_try}
        onChange={(v) => setData({ ...data, domestic_flat_try: v })}
      />
      <NumberField
        label={t("adm.intlRate")}
        value={data.international_flat_usd}
        onChange={(v) => setData({ ...data, international_flat_usd: v })}
      />
      <NumberField
        label={t("adm.freeOver")}
        value={data.free_shipping_threshold_try}
        onChange={(v) => setData({ ...data, free_shipping_threshold_try: v })}
      />
    </Card>
  );
}

function TaxCard({ initial }: { initial: StoreSettingsMap["tax"] }) {
  const { t } = useLocale();
  const [data, setData] = useState(initial);
  const { status, saving, run } = useSaver();
  return (
    <Card
      title={t("adm.tax")}
      description={t("adm.taxDesc")}
      saving={saving}
      status={status}
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveStoreSetting("tax", data));
      }}
    >
      <NumberField
        label={t("adm.vatPercent")}
        step="0.1"
        value={data.vat_percent}
        onChange={(v) => setData({ ...data, vat_percent: v })}
      />
      <CheckField
        label={t("adm.pricesIncludeTax")}
        checked={data.prices_include_tax}
        onChange={(v) => setData({ ...data, prices_include_tax: v })}
      />
    </Card>
  );
}


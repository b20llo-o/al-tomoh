"use client";

import { useActionState, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import {
  deleteAddress,
  saveAddress,
  type AccountResult,
} from "@/app/actions/account";
import { EmptyState } from "@/components/store/empty-state";
import { useLocale } from "@/components/providers/locale-provider";
import type { Address } from "@/lib/types";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setShowForm(true);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
          {t("acc.savedAddresses")}
        </h2>
        {!showForm && (
          <button type="button" onClick={openNew} className="btn-primary h-9 px-4 text-xs">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            {t("acc.addAddress")}
          </button>
        )}
      </div>

      {showForm && (
        <AddressForm
          address={editing}
          onDone={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && addresses.length === 0 && <EmptyState message={t("acc.addressesEmpty")} />}

      {!showForm && addresses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="card-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-950 dark:text-parchment-100">
                  <MapPin className="h-4 w-4 text-brand-500" strokeWidth={1.75} />
                  {address.label}
                </span>
                {address.is_default && (
                  <span className="badge bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Star className="h-3 w-3" strokeWidth={2} fill="currentColor" />
                    {t("acc.default")}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {address.full_name}
                <br />
                {address.address_line}
                <br />
                {[address.district, address.city, address.postal_code]
                  .filter(Boolean)
                  .join(", ")}
                <br />
                {address.country} · <span className="force-ltr">{address.phone}</span>
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="btn-ghost h-8 px-3 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t("common.edit")}
                </button>
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <button
                    type="submit"
                    className="btn-ghost h-8 px-3 text-xs text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {t("common.remove")}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressForm({
  address,
  onDone,
  onCancel,
}: {
  address: Address | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { t, locale } = useLocale();
  const [state, formAction, pending] = useActionState<AccountResult | null, FormData>(
    async (prev, formData) => {
      const result = await saveAddress(prev, formData);
      if (result.success) onDone();
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="card-surface mb-5 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
          {address ? t("acc.editAddress") : t("acc.newAddress")}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t("common.cancel")}
          className="text-navy-900/40 hover:text-navy-950 dark:text-parchment-100/40"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("acc.label")}>
          <input name="label" defaultValue={address?.label ?? "Home"} className="input-field" />
        </Field>
        <Field label={t("co.fullName")} required>
          <input name="full_name" defaultValue={address?.full_name ?? ""} required className="input-field" />
        </Field>
        <Field label={t("co.phone")} required>
          <input name="phone" defaultValue={address?.phone ?? ""} required className="input-field force-ltr" />
        </Field>
        <Field label={t("co.country")} required>
          <input
            name="country"
            defaultValue={address?.country ?? (locale === "ar" ? "تركيا" : "Türkiye")}
            required
            className="input-field"
          />
        </Field>
        <Field label={t("co.city")} required>
          <input name="city" defaultValue={address?.city ?? ""} required className="input-field" />
        </Field>
        <Field label={t("co.district")}>
          <input name="district" defaultValue={address?.district ?? ""} className="input-field" />
        </Field>
        <Field label={t("co.postalCode")}>
          <input name="postal_code" defaultValue={address?.postal_code ?? ""} className="input-field" />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t("co.address")} required>
            <textarea
              name="address_line"
              defaultValue={address?.address_line ?? ""}
              required
              rows={2}
              className="input-field resize-y"
            />
          </Field>
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-navy-900/80 dark:text-parchment-100/80">
        <input
          type="checkbox"
          name="is_default"
          defaultChecked={address?.is_default ?? false}
          className="h-4 w-4 rounded accent-[#ee7124]"
        />
        {t("acc.makeDefault")}
      </label>
      <div className="mt-5 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? t("common.saving") : t("acc.saveAddress")}
        </button>
        {state && !state.success && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-field">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

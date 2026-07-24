"use client";

import { Check, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { useToast } from "@/components/orbit/toast";
import {
  PAYMENT_METHODS,
  type PaymentLogoMark,
} from "@/components/shared/payment-marks";
import { withMediaCacheBust } from "@/lib/media-cache";

type LogoState = Record<
  string,
  { src: string; assetId: string | null; version: number }
>;

function toState(marks: PaymentLogoMark[]): LogoState {
  const next: LogoState = {};
  for (const mark of marks) {
    next[mark.key] = {
      src: mark.src,
      assetId: mark.assetId ?? null,
      version: mark.version ?? 1,
    };
  }
  return next;
}

export function PaymentMethodsEditor({
  initialMarks,
}: {
  initialMarks: PaymentLogoMark[];
}) {
  const { push } = useToast();
  const defaults = useMemo(() => toState(initialMarks), [initialMarks]);
  const [logos, setLogos] = useState(defaults);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(
    key: string,
    next: { src: string; assetId: string | null; version?: number }
  ) {
    setLogos((current) => ({
      ...current,
      [key]: {
        src: next.src,
        assetId: next.assetId,
        version: next.version ?? Date.now(),
      },
    }));
    setDirty(true);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "site-settings",
          key: "payment-methods",
          title: "Payment Methods",
          status: "PUBLISHED",
          data: { logos },
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        const message = result.error || "Save failed";
        setError(message);
        push(message, "error");
        return;
      }

      await Promise.all(
        PAYMENT_METHODS.map(async (method) => {
          const logo = logos[method.key];
          if (!logo?.assetId) return;
          await fetch("/api/orbit/media/placements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: `brand.payment.${method.key}`,
              label: `Payment — ${method.label}`,
              assetId: logo.assetId,
              mediaType: "IMAGE",
              alt: method.label,
            }),
          }).catch(() => undefined);
        })
      );

      setDirty(false);
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      const message = "Network Error — could not save payment logos.";
      setError(message);
      push(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Website Settings
          </p>
          <h2 className="font-display text-3xl font-semibold text-[#10251e]">
            Payment Methods
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#62716b]">
            Upload official brand logos for the footer. PNG, JPG, WEBP or SVG —
            max 20 MB. Save publishes to the live website immediately.
          </p>
        </div>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
        >
          {saving ? (
            "Saving…"
          ) : dirty ? (
            <>
              <Save className="size-4" /> Save & Publish
            </>
          ) : (
            <>
              <Check className="size-4" /> Saved
            </>
          )}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {PAYMENT_METHODS.map((method) => {
          const logo = logos[method.key];
          const preview = withMediaCacheBust(
            logo?.src || method.defaultSrc,
            logo?.version
          );
          return (
            <article
              key={method.key}
              className="orbit-panel space-y-4 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl text-[#10251e]">
                  {method.label}
                </h3>
                {logo?.src && logo.src !== method.defaultSrc ? (
                  <button
                    type="button"
                    onClick={() =>
                      update(method.key, {
                        src: method.defaultSrc,
                        assetId: null,
                        version: Date.now(),
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-red-700 uppercase"
                  >
                    <Trash2 className="size-3.5" /> Delete Logo
                  </button>
                ) : null}
              </div>

              <div className="flex h-16 items-center justify-center rounded-[10px] border border-[#17362b]/10 bg-[#f7f8f5] px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={method.label}
                  className="h-[86%] w-[88%] object-contain"
                />
              </div>

              <MediaField
                label="Replace / Upload Logo"
                kind="IMAGE"
                folder="payments"
                help="PNG, JPG, WEBP or SVG · max 20 MB"
                value={{
                  assetId: logo?.assetId,
                  url: logo?.src || null,
                  alt: method.label,
                  kind: "IMAGE",
                }}
                onChange={(next) =>
                  update(method.key, {
                    src: next.url,
                    assetId: next.assetId,
                    version: Date.now(),
                  })
                }
                onClear={() =>
                  update(method.key, {
                    src: method.defaultSrc,
                    assetId: null,
                    version: Date.now(),
                  })
                }
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}

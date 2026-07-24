"use client";

import { useState } from "react";
import { ContentManager } from "@/components/orbit/content-manager";
import { PaymentMethodsEditor } from "@/components/orbit/payment-methods-editor";
import type { PaymentLogoMark } from "@/components/shared/payment-marks";
import type { OrbitModule } from "@/lib/orbit/modules";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  module: string;
  key: string;
  title: string;
  slug: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  data: Record<string, unknown>;
  seo: Record<string, unknown> | null;
  scheduledAt: string | null;
  updatedAt: string;
};

export function SiteSettingsStudio({
  module,
  initialEntries,
  paymentMarks,
}: {
  module: OrbitModule;
  initialEntries: Entry[];
  paymentMarks: PaymentLogoMark[];
}) {
  const [tab, setTab] = useState<"payment" | "general">("payment");

  return (
    <div>
      <div className="border-b border-[#17362b]/10 px-6 pt-8 sm:px-10">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
          Orbit
        </p>
        <h1 className="font-display text-4xl font-semibold text-[#10251e]">
          Website Settings
        </h1>
        <div className="mt-5 flex flex-wrap gap-2 pb-4">
          {(
            [
              { id: "payment", label: "Payment Methods" },
              { id: "general", label: "Brand & Contact" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition",
                tab === item.id
                  ? "bg-[#17362b] text-white"
                  : "bg-[#edf0ec] text-[#4e6258] hover:bg-[#e2e8e3]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "payment" ? (
        <div className="p-6 sm:p-10">
          <PaymentMethodsEditor initialMarks={paymentMarks} />
        </div>
      ) : (
        <ContentManager module={module} initialEntries={initialEntries} />
      )}
    </div>
  );
}

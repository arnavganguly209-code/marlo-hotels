"use client";

import {
  Check,
  Clock,
  Eye,
  EyeOff,
  ImageIcon,
  MapPin,
  Save,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { useToast } from "@/components/orbit/toast";
import type { ContactPageContent } from "@/lib/contact-content";
import { withMediaCacheBust } from "@/lib/media-cache";
import { cn } from "@/lib/utils";

type SectionKey = "cover" | "details" | "form" | "map" | "seo";

const SECTIONS: {
  key: SectionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "cover",
    label: "Cover Banner",
    description: "Hero image, headline and introduction.",
  },
  {
    key: "details",
    label: "Contact Details",
    description: "Hotel name, phones, emails and hours.",
  },
  {
    key: "form",
    label: "Contact Form",
    description: "Form copy, success and error messages.",
  },
  {
    key: "map",
    label: "Google Map",
    description: "Coordinates, zoom and map preview.",
  },
  {
    key: "seo",
    label: "SEO",
    description: "Meta title and description.",
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="min-h-28 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm text-[#243c32] outline-none focus:border-[#c4943c]/50"
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#243c32] outline-none focus:border-[#c4943c]/50"
        />
      )}
    </label>
  );
}

function MediaPreviewCard({
  label,
  src,
  alt,
  assetId,
  onChange,
  onClear,
  folder = "contact",
}: {
  label: string;
  src: string;
  alt: string;
  assetId?: string | null;
  onChange: (next: {
    src: string;
    alt: string;
    assetId: string | null;
  }) => void;
  onClear: () => void;
  folder?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-[#17362b]/10 bg-[#f7f8f5] p-5">
      <p className="text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label}
      </p>
      <div className="relative aspect-[21/9] overflow-hidden rounded-[10px] border border-[#17362b]/10 bg-gradient-to-br from-[#e8ece7] to-[#d5ddd6]">
        {src ? (
          <Image
            key={src}
            src={src}
            alt={alt || label}
            fill
            className="object-cover"
            sizes="900px"
            unoptimized={src.startsWith("/media/")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#6d7c74]">
            <ImageIcon className="size-10 opacity-60" />
            <p className="text-sm font-medium">No image yet</p>
            <p className="text-xs">Upload a cover to preview it here</p>
          </div>
        )}
      </div>
      <MediaField
        label="Replace / Upload"
        kind="IMAGE"
        folder={folder}
        value={{ assetId, url: src || null, alt, kind: "IMAGE" }}
        onChange={(next) =>
          onChange({
            src: withMediaCacheBust(next.url),
            alt: next.alt || alt,
            assetId: next.assetId,
          })
        }
        onClear={onClear}
      />
    </div>
  );
}

export function ContactStudioEditor({
  initialContent,
}: {
  initialContent: ContactPageContent;
}) {
  const { push } = useToast();
  const [content, setContent] = useState(() => clone(initialContent));
  const [saved, setSaved] = useState(() => clone(initialContent));
  const [active, setActive] = useState<SectionKey>("cover");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeMeta = useMemo(
    () => SECTIONS.find((item) => item.key === active)!,
    [active]
  );

  function patch<K extends keyof ContactPageContent>(
    key: K,
    next: ContactPageContent[K]
  ) {
    setContent((current) => ({ ...current, [key]: next }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "contact",
          key: "page-content",
          title: "Contact Page",
          status: "PUBLISHED",
          data: content,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        push(result.error || "Save failed", "error");
        return;
      }

      if (content.cover.image.assetId) {
        await fetch("/api/orbit/media/placements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "page.contact.hero",
            label: "Contact Page Hero",
            assetId: content.cover.image.assetId,
            mediaType: "IMAGE",
            alt: content.cover.image.alt,
          }),
        }).catch(() => undefined);
      }

      setSaved(clone(content));
      setDirty(false);
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      push("Network Error — could not save contact page.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col">
      <header className="flex flex-col gap-4 border-b border-[#17362b]/10 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between xl:px-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Orbit · Website
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#10251e] xl:text-4xl">
            Contact
          </h1>
          <p className="mt-1 text-sm text-[#62716b]">
            Visual editor matching the live Contact page. Edit one section at a
            time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contact"
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            Live preview
          </Link>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => {
              setContent(clone(saved));
              setDirty(false);
            }}
            className="h-11 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-40"
          >
            Discard
          </button>
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
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="orbit-scrollbar space-y-3 overflow-y-auto border-b border-[#17362b]/10 bg-[#f6f7f4] p-4 lg:border-r lg:border-b-0 lg:p-5">
          {SECTIONS.map((section) => {
            const isActive = active === section.key;
            const thumb =
              section.key === "cover"
                ? content.cover.image.src
                : section.key === "map"
                  ? content.map.previewImage.src
                  : "";
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActive(section.key)}
                className={cn(
                  "w-full overflow-hidden rounded-2xl border text-left transition",
                  isActive
                    ? "border-[#123429] bg-[#123429] text-[#f0d999] shadow-lg"
                    : "border-transparent bg-white text-[#294138] hover:border-[#c4943c]/35"
                )}
              >
                <div className="relative aspect-[16/9] bg-[#dfe5e0]">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "grid h-full place-items-center",
                        isActive ? "text-[#e4c784]/50" : "text-[#8b9892]"
                      )}
                    >
                      {section.key === "details" ? (
                        <MapPin className="size-7" />
                      ) : section.key === "form" ? (
                        <Clock className="size-7" />
                      ) : (
                        <ImageIcon className="size-7" />
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{section.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-[11px] leading-snug",
                      isActive ? "text-[#e4c784]/75" : "text-[#7b8982]"
                    )}
                  >
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 bg-[#fbfbf8] px-4 py-8 sm:px-8 xl:px-12">
          <div className="mx-auto w-full max-w-4xl space-y-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#10251e] xl:text-4xl">
                {activeMeta.label}
              </h2>
              <p className="mt-1 text-sm text-[#62716b]">
                {activeMeta.description}
              </p>
            </div>

            {active === "cover" ? (
              <div className="space-y-6">
                <MediaPreviewCard
                  label="Current Cover Image"
                  src={content.cover.image.src}
                  alt={content.cover.image.alt}
                  assetId={content.cover.image.assetId}
                  onChange={(next) =>
                    patch("cover", {
                      ...content.cover,
                      image: {
                        ...content.cover.image,
                        src: next.src,
                        alt: next.alt,
                        assetId: next.assetId,
                      },
                    })
                  }
                  onClear={() =>
                    patch("cover", {
                      ...content.cover,
                      image: {
                        ...content.cover.image,
                        src: "",
                        assetId: null,
                      },
                    })
                  }
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Eyebrow"
                    value={content.cover.eyebrow}
                    onChange={(eyebrow) =>
                      patch("cover", { ...content.cover, eyebrow })
                    }
                  />
                  <Field
                    label="Button Text"
                    value={content.cover.buttonText}
                    onChange={(buttonText) =>
                      patch("cover", { ...content.cover, buttonText })
                    }
                  />
                </div>
                <Field
                  label="Headline"
                  value={content.cover.headline}
                  onChange={(headline) =>
                    patch("cover", { ...content.cover, headline })
                  }
                />
                <Field
                  label="Sub Heading"
                  value={content.cover.subheading}
                  onChange={(subheading) =>
                    patch("cover", { ...content.cover, subheading })
                  }
                />
                <Field
                  label="Description"
                  multiline
                  value={content.cover.description}
                  onChange={(description) =>
                    patch("cover", { ...content.cover, description })
                  }
                />
                <Field
                  label="Button Link"
                  value={content.cover.buttonLink}
                  onChange={(buttonLink) =>
                    patch("cover", { ...content.cover, buttonLink })
                  }
                />
              </div>
            ) : null}

            {active === "details" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Hotel Name"
                  value={content.details.hotelName}
                  onChange={(hotelName) =>
                    patch("details", { ...content.details, hotelName })
                  }
                />
                <Field
                  label="Phone"
                  value={content.details.phone}
                  onChange={(phone) =>
                    patch("details", { ...content.details, phone })
                  }
                />
                <Field
                  label="Reservations Phone"
                  value={content.details.reservationsPhone}
                  onChange={(reservationsPhone) =>
                    patch("details", { ...content.details, reservationsPhone })
                  }
                />
                <Field
                  label="WhatsApp"
                  value={content.details.whatsapp}
                  onChange={(whatsapp) =>
                    patch("details", { ...content.details, whatsapp })
                  }
                />
                <Field
                  label="Reservation Email"
                  value={content.details.reservationsEmail}
                  onChange={(reservationsEmail) =>
                    patch("details", { ...content.details, reservationsEmail })
                  }
                />
                <Field
                  label="General Email"
                  value={content.details.generalEmail}
                  onChange={(generalEmail) =>
                    patch("details", { ...content.details, generalEmail })
                  }
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Address"
                    multiline
                    value={content.details.address}
                    onChange={(address) =>
                      patch("details", { ...content.details, address })
                    }
                  />
                </div>
                <Field
                  label="Front Desk Hours"
                  value={content.details.frontDeskHours}
                  onChange={(frontDeskHours) =>
                    patch("details", { ...content.details, frontDeskHours })
                  }
                />
                <Field
                  label="Concierge Hours"
                  value={content.details.conciergeHours}
                  onChange={(conciergeHours) =>
                    patch("details", { ...content.details, conciergeHours })
                  }
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Business Hours (display)"
                    multiline
                    value={content.details.businessHours}
                    onChange={(businessHours) =>
                      patch("details", { ...content.details, businessHours })
                    }
                  />
                </div>
              </div>
            ) : null}

            {active === "form" ? (
              <div className="space-y-5">
                <Field
                  label="Eyebrow"
                  value={content.form.eyebrow}
                  onChange={(eyebrow) =>
                    patch("form", { ...content.form, eyebrow })
                  }
                />
                <Field
                  label="Heading"
                  value={content.form.heading}
                  onChange={(heading) =>
                    patch("form", { ...content.form, heading })
                  }
                />
                <Field
                  label="Description"
                  multiline
                  value={content.form.description}
                  onChange={(description) =>
                    patch("form", { ...content.form, description })
                  }
                />
                <Field
                  label="Button Text"
                  value={content.form.buttonText}
                  onChange={(buttonText) =>
                    patch("form", { ...content.form, buttonText })
                  }
                />
                <Field
                  label="Success Title"
                  value={content.form.successTitle}
                  onChange={(successTitle) =>
                    patch("form", { ...content.form, successTitle })
                  }
                />
                <Field
                  label="Success Message"
                  multiline
                  value={content.form.successMessage}
                  onChange={(successMessage) =>
                    patch("form", { ...content.form, successMessage })
                  }
                />
                <Field
                  label="Error Message"
                  multiline
                  value={content.form.errorMessage}
                  onChange={(errorMessage) =>
                    patch("form", { ...content.form, errorMessage })
                  }
                />
              </div>
            ) : null}

            {active === "map" ? (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-sm">
                  <iframe
                    title="Map preview"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${content.map.lng - 0.02 / content.map.zoom}%2C${content.map.lat - 0.014 / content.map.zoom}%2C${content.map.lng + 0.02 / content.map.zoom}%2C${content.map.lat + 0.014 / content.map.zoom}&layer=mapnik&marker=${content.map.lat}%2C${content.map.lng}`}
                    className="aspect-[16/10] w-full border-0"
                  />
                </div>
                <MediaPreviewCard
                  label="Optional Map Preview Image"
                  src={content.map.previewImage.src}
                  alt={content.map.previewImage.alt}
                  assetId={content.map.previewImage.assetId}
                  folder="contact"
                  onChange={(next) =>
                    patch("map", {
                      ...content.map,
                      previewImage: {
                        ...content.map.previewImage,
                        src: next.src,
                        alt: next.alt,
                        assetId: next.assetId,
                      },
                    })
                  }
                  onClear={() =>
                    patch("map", {
                      ...content.map,
                      previewImage: {
                        ...content.map.previewImage,
                        src: "",
                        assetId: null,
                      },
                    })
                  }
                />
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field
                    label="Latitude"
                    type="number"
                    value={content.map.lat}
                    onChange={(lat) =>
                      patch("map", {
                        ...content.map,
                        lat: Number(lat) || content.map.lat,
                      })
                    }
                  />
                  <Field
                    label="Longitude"
                    type="number"
                    value={content.map.lng}
                    onChange={(lng) =>
                      patch("map", {
                        ...content.map,
                        lng: Number(lng) || content.map.lng,
                      })
                    }
                  />
                  <Field
                    label="Zoom"
                    type="number"
                    value={content.map.zoom}
                    onChange={(zoom) =>
                      patch("map", {
                        ...content.map,
                        zoom: Number(zoom) || content.map.zoom,
                      })
                    }
                  />
                </div>
                <Field
                  label="Open in Maps URL"
                  value={content.map.mapUrl}
                  onChange={(mapUrl) =>
                    patch("map", { ...content.map, mapUrl })
                  }
                />
              </div>
            ) : null}

            {active === "seo" ? (
              <div className="space-y-5">
                <Field
                  label="Meta Title"
                  value={content.seo.title}
                  onChange={(title) => patch("seo", { ...content.seo, title })}
                />
                <Field
                  label="Meta Description"
                  multiline
                  value={content.seo.description}
                  onChange={(description) =>
                    patch("seo", { ...content.seo, description })
                  }
                />
                <div className="rounded-xl border border-[#17362b]/10 bg-white p-5 text-sm text-[#53675e]">
                  <p className="flex items-center gap-2 font-semibold text-[#243c32]">
                    {dirty ? (
                      <EyeOff className="size-4 text-amber-600" />
                    ) : (
                      <Eye className="size-4 text-emerald-700" />
                    )}
                    {dirty
                      ? "Unsaved SEO changes"
                      : "Published SEO is live on /contact"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

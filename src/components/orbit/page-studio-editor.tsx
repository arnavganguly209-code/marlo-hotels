"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  ImagePlus,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MediaField, MediaPicker } from "@/components/orbit/media-picker";
import { useToast } from "@/components/orbit/toast";
import { withMediaCacheBust } from "@/lib/media-cache";
import {
  emptyStudioSection,
  type PageSectionDef,
  type StudioImage,
  type StudioSectionData,
} from "@/lib/orbit/page-studio";
import { cn } from "@/lib/utils";

type PreviewMode = "desktop" | "tablet" | "mobile" | "landscape";

function normalizeSection(
  partial?: Partial<StudioSectionData> | null,
  label = ""
): StudioSectionData {
  const base = emptyStudioSection(label);
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    image: {
      ...base.image,
      ...(partial.image || {}),
      src: partial.image?.src || "",
      alt: partial.image?.alt || "",
    },
    gallery: Array.isArray(partial.gallery)
      ? partial.gallery.filter((item) => item && typeof item === "object")
      : [],
    videoUrl: partial.videoUrl || "",
    videoAssetId: partial.videoAssetId ?? null,
    hours: partial.hours || "",
    features: partial.features || "",
    faq: partial.faq || "",
    items: partial.items || "",
  };
}

export function PageStudioEditor({
  moduleSlug,
  moduleLabel,
  sections,
  publicPath,
  initialDocument,
}: {
  moduleSlug: string;
  moduleLabel: string;
  sections: PageSectionDef[];
  publicPath: string;
  initialDocument?: Record<string, Partial<StudioSectionData>> | null;
}) {
  const { push } = useToast();
  const defaults = useMemo(() => {
    const doc: Record<string, StudioSectionData> = {};
    for (const section of sections) {
      doc[section.key] = normalizeSection(
        initialDocument?.[section.key],
        section.label
      );
    }
    return doc;
  }, [sections, initialDocument]);

  const [doc, setDoc] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [active, setActive] = useState(sections[0]?.key || "hero");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    setDoc(defaults);
    setSaved(defaults);
  }, [defaults]);

  const activeMeta = sections.find((item) => item.key === active) || sections[0];
  const value = doc[active] || emptyStudioSection();
  const fields = new Set(activeMeta?.fields || ["image"]);

  function update(next: Partial<StudioSectionData>) {
    setDoc((current) => ({
      ...current,
      [active]: { ...current[active], ...next },
    }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: moduleSlug,
          key: "page-studio",
          title: `${moduleLabel} Page`,
          status: "PUBLISHED",
          data: doc,
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
      setSaved(structuredClone(doc));
      setDirty(false);
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      push("Network Error", "error");
    } finally {
      setSaving(false);
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const next = [...value.gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ gallery: next });
  }

  const previewWidth =
    previewMode === "mobile"
      ? "max-w-[390px]"
      : previewMode === "tablet"
        ? "max-w-[768px]"
        : previewMode === "landscape"
          ? "max-w-[920px]"
          : "max-w-5xl";

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[720px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--orbit-border)] bg-white px-5 py-4 xl:px-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Page Studio
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#10251e] xl:text-3xl">
            {moduleLabel}
          </h1>
          <p className="mt-1 text-sm text-[#62716b]">
            {dirty
              ? "Unsaved changes — Save publishes to the live website."
              : "Edit sections that match the public page layout."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={publicPath}
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-xl border border-[var(--orbit-border)] bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            <ExternalLink className="size-4" /> View live page
          </Link>
          {moduleSlug === "rooms" ||
          moduleSlug === "offers" ||
          moduleSlug === "dining" ||
          moduleSlug === "experiences" ? (
            <Link
              href={`/orbit/${moduleSlug}?inventory=1`}
              className="flex h-11 items-center rounded-xl border border-dashed border-[var(--orbit-border)] px-4 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#a67a30]"
            >
              Open inventory →
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              update(normalizeSection(saved[active], activeMeta?.label));
              push("Section reset", "info");
            }}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-[var(--orbit-border)] px-4 text-[10px] font-semibold tracking-[0.12em] uppercase"
          >
            <RotateCcw className="size-3.5" /> Reset
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

      <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="orbit-scrollbar max-h-[36vh] space-y-1 overflow-y-auto border-b border-[var(--orbit-border)] bg-[#f7f8f5] p-3 lg:max-h-none lg:border-r lg:border-b-0 lg:p-4">
          <p className="mb-2 px-2 text-[9px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
            Sections
          </p>
          {sections.map((section) => {
            const isActive = active === section.key;
            const enabled = doc[section.key]?.enabled !== false;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActive(section.key)}
                className={cn(
                  "w-full rounded-2xl px-4 py-3.5 text-left transition",
                  isActive
                    ? "bg-[#123429] text-[#f0d999]"
                    : "bg-white text-[#3d5248] hover:bg-white"
                )}
              >
                <span className="block text-sm font-semibold">
                  {section.label}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-[11px] leading-snug",
                    isActive ? "text-[#e4c784]/75" : "text-[#7b8982]"
                  )}
                >
                  {section.description}
                </span>
                <span
                  className={cn(
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-[0.12em] uppercase",
                    enabled
                      ? isActive
                        ? "bg-[#e4c784]/15 text-[#f0d999]"
                        : "bg-emerald-50 text-emerald-800"
                      : "bg-[#eceeea] text-[#8a968f]"
                  )}
                >
                  {enabled ? "Visible" : "Hidden"}
                </span>
              </button>
            );
          })}
        </aside>

        <section className="orbit-scrollbar overflow-y-auto bg-[var(--orbit-bg)] p-4 sm:p-6 xl:p-10">
          <div className="mx-auto grid max-w-[1400px] gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="orbit-panel space-y-6 rounded-2xl p-6 sm:p-8 xl:p-10">
              <div>
                <h2 className="font-display text-3xl font-semibold text-[#10251e]">
                  {activeMeta?.label}
                </h2>
                <p className="mt-1 text-sm text-[#62716b]">
                  {activeMeta?.description}
                </p>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-[var(--orbit-border)] bg-white px-4 py-3">
                <span className="text-sm font-semibold">Visible on website</span>
                <input
                  type="checkbox"
                  checked={value.enabled}
                  onChange={(event) =>
                    update({ enabled: event.target.checked })
                  }
                />
              </label>

              {(
                [
                  ["eyebrow", "Eyebrow"],
                  ["heading", "Heading"],
                  ["description", "Description"],
                  ["buttonText", "Button text"],
                  ["buttonLink", "Button link"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    {label}
                  </span>
                  {key === "description" ? (
                    <textarea
                      rows={6}
                      value={value[key]}
                      onChange={(event) =>
                        update({ [key]: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#c4943c]/50"
                    />
                  ) : (
                    <input
                      value={value[key]}
                      onChange={(event) =>
                        update({ [key]: event.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm outline-none focus:border-[#c4943c]/50"
                    />
                  )}
                </label>
              ))}

              {fields.has("image") ? (
                <div className="space-y-2">
                  <MediaField
                    label="Cover / Section Image"
                    value={{
                      assetId: value.image.assetId,
                      url: value.image.src || null,
                      alt: value.image.alt,
                      kind: "IMAGE",
                    }}
                    onChange={(next) =>
                      update({
                        image: {
                          assetId: next.assetId,
                          src: withMediaCacheBust(next.url),
                          alt: next.alt || value.heading || moduleLabel,
                        },
                      })
                    }
                  />
                  {value.image.src ? (
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          image: { assetId: null, src: "", alt: "" },
                        })
                      }
                      className="text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                    >
                      Delete image
                    </button>
                  ) : null}
                </div>
              ) : null}

              {fields.has("video") ? (
                <div className="space-y-2">
                  <MediaField
                    label="Hero Video (optional)"
                    kind="VIDEO"
                    value={{
                      assetId: value.videoAssetId,
                      url: value.videoUrl || null,
                      alt: value.heading,
                      kind: "VIDEO",
                    }}
                    onChange={(next) =>
                      update({
                        videoUrl: withMediaCacheBust(next.url),
                        videoAssetId: next.assetId,
                      })
                    }
                  />
                  {value.videoUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        update({ videoUrl: "", videoAssetId: null })
                      }
                      className="text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                    >
                      Delete video
                    </button>
                  ) : null}
                </div>
              ) : null}

              {fields.has("gallery") ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                      Gallery Images
                    </p>
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#17362b]/12 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
                    >
                      <Plus className="size-3.5" /> Add image
                    </button>
                  </div>
                  <div className="space-y-2">
                    {value.gallery.map((item, index) => (
                      <div
                        key={`${item.src}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-[#17362b]/10 bg-white p-2"
                      >
                        <div className="relative size-16 overflow-hidden rounded-lg bg-[#edf0ec]">
                          {item.src ? (
                            <Image
                              src={item.src}
                              alt={item.alt}
                              fill
                              className="object-cover"
                              unoptimized={item.src.startsWith("/media/")}
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-[#a8b0ac]">
                              <ImagePlus className="size-4" />
                            </div>
                          )}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-xs text-[#53675e]">
                          {item.src || "Empty slot"}
                        </p>
                        <button
                          type="button"
                          onClick={() => moveGallery(index, -1)}
                          className="grid size-8 place-items-center rounded-lg hover:bg-[#edf2ee]"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGallery(index, 1)}
                          className="grid size-8 place-items-center rounded-lg hover:bg-[#edf2ee]"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              gallery: value.gallery.filter(
                                (_, i) => i !== index
                              ),
                            })
                          }
                          className="grid size-8 place-items-center rounded-lg text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {!value.gallery.length ? (
                      <p className="rounded-xl border border-dashed border-[#17362b]/15 px-4 py-8 text-center text-sm text-[#7b8982]">
                        No gallery images. Upload when ready — slots stay empty
                        by default.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {fields.has("hours") ? (
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    Opening Hours (one per line)
                  </span>
                  <textarea
                    rows={4}
                    value={value.hours}
                    onChange={(event) => update({ hours: event.target.value })}
                    placeholder="Breakfast | 7:00 AM – 10:30 AM"
                    className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#c4943c]/50"
                  />
                </label>
              ) : null}

              {fields.has("features") ? (
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    Features (one per line)
                  </span>
                  <textarea
                    rows={5}
                    value={value.features}
                    onChange={(event) =>
                      update({ features: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#c4943c]/50"
                  />
                </label>
              ) : null}

              {fields.has("items") ? (
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    Cards / Items (Title | Description per line)
                  </span>
                  <textarea
                    rows={8}
                    value={value.items}
                    onChange={(event) => update({ items: event.target.value })}
                    placeholder="Signature Massage | Deep relaxation without published pricing"
                    className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#c4943c]/50"
                  />
                </label>
              ) : null}

              {fields.has("faq") ? (
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    FAQ (Question | Answer per line)
                  </span>
                  <textarea
                    rows={6}
                    value={value.faq}
                    onChange={(event) => update({ faq: event.target.value })}
                    className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm outline-none focus:border-[#c4943c]/50"
                  />
                </label>
              ) : null}

              {fields.has("seo") || active === "seo" ? (
                <div className="space-y-4 border-t border-[var(--orbit-border)] pt-6">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                      SEO Title
                    </span>
                    <input
                      value={value.seoTitle}
                      onChange={(event) =>
                        update({ seoTitle: event.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                      SEO Description
                    </span>
                    <textarea
                      rows={3}
                      value={value.seoDescription}
                      onChange={(event) =>
                        update({ seoDescription: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["desktop", Monitor, "Desktop"],
                    ["tablet", Tablet, "Tablet"],
                    ["mobile", Smartphone, "Mobile"],
                    ["landscape", Tablet, "Landscape"],
                  ] as const
                ).map(([mode, Icon, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[10px] font-semibold tracking-[0.12em] uppercase",
                      previewMode === mode
                        ? "border-[#123429] bg-[#123429] text-[#f0d999]"
                        : "border-[var(--orbit-border)] bg-white"
                    )}
                  >
                    <Icon className="size-3.5" /> {label}
                  </button>
                ))}
              </div>
              <div
                className={cn(
                  "orbit-panel mx-auto overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[#0f241c]",
                  previewWidth
                )}
              >
                <div className="relative aspect-[16/10] bg-forest-950">
                  {value.videoUrl ? (
                    <video
                      src={value.videoUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      autoPlay
                      loop
                    />
                  ) : value.image.src ? (
                    <Image
                      src={value.image.src}
                      alt={value.image.alt || value.heading}
                      fill
                      className="object-cover"
                      unoptimized={value.image.src.startsWith("/media/")}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-cream-200/50">
                      Empty media placeholder
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                    <p className="text-[9px] tracking-[0.28em] text-gold-400 uppercase">
                      {value.eyebrow || moduleLabel}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-medium">
                      {value.heading || activeMeta?.label}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm font-light text-cream-200/75">
                      {value.description || "Add description in the editor."}
                    </p>
                  </div>
                </div>
                {value.gallery.length ? (
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1">
                    {value.gallery.slice(0, 3).map((item, index) => (
                      <div
                        key={`${item.src}-${index}`}
                        className="relative aspect-square bg-[#17362b]"
                      >
                        {item.src ? (
                          <Image
                            src={item.src}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={item.src.startsWith("/media/")}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="text-center text-xs text-[#7b8982]">
                Live preview of the active section — Save to update the website.
              </p>
            </div>
          </div>
        </section>
      </div>

      <MediaPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        kind="IMAGE"
        title="Add gallery image"
        onSelect={(asset) => {
          const next: StudioImage = {
            assetId: asset.id,
            src: withMediaCacheBust(asset.url),
            alt: asset.alt || value.heading || moduleLabel,
          };
          update({ gallery: [...value.gallery, next] });
          setGalleryOpen(false);
        }}
      />
    </div>
  );
}

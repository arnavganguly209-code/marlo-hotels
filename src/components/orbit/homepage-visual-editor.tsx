"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Eye,
  GripVertical,
  ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { ImageCropper } from "@/components/orbit/image-cropper";
import { useToast } from "@/components/orbit/toast";
import type { EditableImage, HomepageContent } from "@/lib/homepage-content";
import { withMediaCacheBust } from "@/lib/media-cache";
import {
  HOMEPAGE_SECTIONS,
  type HomepageSectionKey,
} from "@/lib/homepage-schema";
import { cn } from "@/lib/utils";

type JsonObject = Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isImage(value: unknown): value is EditableImage {
  return Boolean(
    value &&
      typeof value === "object" &&
      "src" in value &&
      "alt" in value
  );
}

function labelFor(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase());
}

export function HomepageVisualEditor({
  initialContent,
  initialSection = "hero",
  initialPersisted = true,
}: {
  initialContent: HomepageContent;
  initialSection?: HomepageSectionKey;
  initialPersisted?: boolean;
}) {
  const { push } = useToast();
  const [content, setContent] = useState(() => clone(initialContent));
  const [savedContent, setSavedContent] = useState(() => clone(initialContent));
  const [active, setActive] = useState<HomepageSectionKey>(initialSection);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile" | "landscape" | "portrait"
  >("desktop");
  const [sectionQuery, setSectionQuery] = useState("");
  const bootstrapStarted = useRef(initialPersisted);

  useEffect(() => {
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;
    void (async () => {
      push("Importing current production content…", "info");
      try {
        const response = await fetch("/api/orbit/homepage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: initialContent }),
        });
        const result = (await response.json()) as {
          content?: HomepageContent;
          error?: string;
        };
        if (!response.ok || !result.content) {
          push(result.error || "Unable to import current content", "error");
          return;
        }
        setContent(clone(result.content));
        setSavedContent(clone(result.content));
        push("Current production content imported", "success");
      } catch {
        push("Network Error", "error");
      }
    })();
  }, [initialContent, push]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateSection(next: HomepageContent[HomepageSectionKey]) {
    setContent((current) => ({ ...current, [active]: next }) as HomepageContent);
    setDirty(true);
  }

  function selectSection(section: HomepageSectionKey) {
    setActive(section);
    const url = new URL(window.location.href);
    url.searchParams.set("section", section);
    window.history.replaceState({}, "", url);
  }

  function resetSection() {
    setContent((current) => ({
      ...current,
      [active]: clone(savedContent[active]),
    }) as HomepageContent);
    setDirty(true);
    push("Section reset to last published content", "info");
  }

  function cancelChanges() {
    if (dirty && !window.confirm("Discard all unsaved homepage changes?")) return;
    setContent(clone(savedContent));
    setDirty(false);
    push("Unsaved changes cancelled", "info");
  }

  async function save() {
    const invalidSection = HOMEPAGE_SECTIONS.find((section) => {
      const value = content[section.key] as unknown as JsonObject;
      if (value.enabled === false) return false;
      if ("heading" in value && !String(value.heading || "").trim()) return true;
      if (
        section.key === "hero" &&
        value.mediaType === "VIDEO" &&
        !String(value.videoUrl || "").trim()
      ) {
        return true;
      }
      if (
        (section.key === "about" || section.key === "wellness") &&
        (!Array.isArray(value.images) || value.images.length < 2)
      ) {
        return true;
      }
      if (
        [
          "rooms",
          "featuredSuites",
          "dining",
          "events",
          "experiences",
          "attractions",
          "journal",
        ].includes(section.key) &&
        Array.isArray(value.items) &&
        (value.items as JsonObject[]).some(
          (item) => {
            const image = isImage(item.image)
              ? item.image
              : Array.isArray(item.images) && isImage(item.images[0])
                ? item.images[0]
                : null;
            return !image?.src.trim() || !image.alt.trim();
          }
        )
      ) {
        return true;
      }
      if (
        section.key === "journal" &&
        Array.isArray(value.items) &&
        (value.items as JsonObject[]).some(
          (item) =>
            typeof item.date !== "string" ||
            Number.isNaN(Date.parse(item.date))
        )
      ) {
        return true;
      }
      if (
        section.key === "testimonials" &&
        Array.isArray(value.items) &&
        (value.items as JsonObject[]).some(
          (item) =>
            typeof item.rating !== "number" ||
            item.rating < 1 ||
            item.rating > 5
        )
      ) {
        return true;
      }
      return collectClientImages(value).some(
        (item) => !item.src.trim() || !item.alt.trim()
      );
    });
    if (invalidSection) {
      setActive(invalidSection.key);
      push(
        `Validation Error: complete the heading, image and alt text in ${invalidSection.label}.`,
        "error"
      );
      return;
    }
    setSaving(true);
    push("Saving…", "info");
    try {
      const response = await fetch("/api/orbit/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = (await response.json()) as {
        content?: HomepageContent;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.content) {
        push(result.error || "Server Error", "error");
        return;
      }
      setContent(clone(result.content));
      setSavedContent(clone(result.content));
      setDirty(false);
      push(result.message || "Saved Successfully", "success");
    } catch {
      push("Network Error", "error");
    } finally {
      setSaving(false);
    }
  }

  const activeMeta = HOMEPAGE_SECTIONS.find((item) => item.key === active)!;
  const filteredSections = HOMEPAGE_SECTIONS.filter((section) => {
    if (!sectionQuery.trim()) return true;
    const q = sectionQuery.trim().toLowerCase();
    return (
      section.label.toLowerCase().includes(q) ||
      section.key.toLowerCase().includes(q) ||
      section.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Visual CMS
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold text-[#10251e]">
            Home Page
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#62716b]">
            Edit every homepage section like a premium website builder. Changes
            go live instantly when you Save & Publish.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            <ExternalLink className="size-4" /> Open website
          </Link>
          <button
            type="button"
            onClick={cancelChanges}
            disabled={!dirty || saving}
            className="h-11 rounded-xl border border-[#17362b]/12 bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save & Publish"}
          </button>
        </div>
      </div>

      {dirty ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <span className="size-2 rounded-full bg-amber-500" />
          Unsaved changes — the public website is unchanged until Save & Publish.
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <Check className="size-4" />
          Showing the content currently used by the website.
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)_minmax(380px,0.95fr)]">
        <nav className="orbit-panel h-fit rounded-2xl p-3 xl:sticky xl:top-24">
          <label className="relative mb-3 block">
            <span className="sr-only">Search sections</span>
            <input
              value={sectionQuery}
              onChange={(event) => setSectionQuery(event.target.value)}
              placeholder="Search sections…"
              className="h-10 w-full rounded-xl border border-[#17362b]/10 bg-white px-3 text-xs outline-none focus:border-[#c4943c]/50"
            />
          </label>
          <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
            {filteredSections.map((section, index) => {
              const enabled =
                (content[section.key] as { enabled?: boolean }).enabled !==
                false;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => selectSection(section.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                    active === section.key
                      ? "bg-[#123429] text-[#f0d999]"
                      : "text-[#42574e] hover:bg-[#eef1ed]"
                  )}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-current/15 text-[10px]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {section.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      enabled ? "bg-emerald-500" : "bg-[#a8b0ac]"
                    )}
                  />
                </button>
              );
            })}
            {filteredSections.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-[#7a8781]">
                No sections match “{sectionQuery}”
              </p>
            ) : null}
          </div>
        </nav>

        <section className="orbit-panel min-w-0 rounded-2xl p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-[#17362b]/8 pb-5">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
                Section editor
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
                {activeMeta.label}
              </h2>
              <p className="mt-1 text-xs text-[#7a8781]">
                {activeMeta.description}
              </p>
            </div>
            <button
              type="button"
              onClick={resetSection}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#17362b]/10 px-3 text-[9px] font-semibold tracking-[0.12em] text-[#52665c] uppercase"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>

          <div className="mt-6">
            <SectionForm
              sectionKey={active}
              value={content[active] as JsonObject}
              onChange={(value) =>
                updateSection(value as HomepageContent[HomepageSectionKey])
              }
            />
          </div>
        </section>

        <aside className="h-fit xl:sticky xl:top-24">
          <div className="orbit-panel overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#17362b]/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-[#a67a30]" />
                <span className="text-[10px] font-semibold tracking-[0.16em] text-[#40554c] uppercase">
                  Live Preview
                </span>
              </div>
              <div className="flex flex-wrap rounded-lg bg-[#edf0ec] p-1">
                {(
                  [
                    "desktop",
                    "tablet",
                    "mobile",
                    "landscape",
                    "portrait",
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      "rounded-md px-2 py-1 text-[8px] font-semibold uppercase",
                      previewMode === mode
                        ? "bg-white text-[#a67a30] shadow-sm"
                        : "text-[#7a8781]"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto bg-[#e9ece8] p-4">
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-xl bg-white shadow-xl transition-all",
                  previewMode === "desktop" && "w-full",
                  previewMode === "tablet" && "w-[82%]",
                  previewMode === "mobile" && "w-[48%] min-w-[260px]",
                  previewMode === "landscape" && "w-full max-w-[640px]",
                  previewMode === "portrait" && "w-[42%] min-w-[280px]"
                )}
              >
                <SectionPreview
                  sectionKey={active}
                  value={content[active] as JsonObject}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionForm({
  sectionKey,
  value,
  onChange,
}: {
  sectionKey: HomepageSectionKey;
  value: JsonObject;
  onChange: (value: JsonObject) => void;
}) {
  function set(key: string, next: unknown) {
    onChange({ ...value, [key]: next });
  }

  const commonKeys = [
    "enabled",
    "eyebrow",
    "heading",
    "highlightedText",
    "description",
    "subheading",
    "buttonText",
    "buttonLink",
  ];

  return (
    <div className="space-y-5">
      {"enabled" in value ? (
        <ToggleField
          label="Visible on website"
          checked={value.enabled !== false}
          onChange={(checked) => set("enabled", checked)}
        />
      ) : null}

      {sectionKey !== "hero"
        ? commonKeys.map((key) =>
            key in value ? (
              <PrimitiveField
                key={key}
                fieldKey={key}
                value={value[key]}
                onChange={(next) => set(key, next)}
              />
            ) : null
          )
        : null}

      {sectionKey === "hero" ? (
        <HeroExtraFields value={value} set={set} />
      ) : null}

      {sectionKey === "about" ? (
        <>
          <PrimitiveField fieldKey="badgeValue" value={value.badgeValue} onChange={(next) => set("badgeValue", next)} />
          <PrimitiveField fieldKey="badgeLabel" value={value.badgeLabel} onChange={(next) => set("badgeLabel", next)} />
        </>
      ) : null}

      {sectionKey === "pool" && isImage(value.image) ? (
        <>
          <ImageEditor
            label="Background Image"
            value={value.image}
            onChange={(next) => set("image", next)}
          />
          <SelectField
            label="Overlay"
            value={String(value.overlay || "Balanced")}
            options={["Light", "Balanced", "Dark"]}
            onChange={(next) => set("overlay", next)}
          />
        </>
      ) : null}

      {sectionKey === "footer" && isImage(value.logo) ? (
        <>
          {[
            "hotelHeading",
            "discoverHeading",
            "findUsHeading",
            "address",
            "phone",
            "email",
            "checkIn",
            "checkOut",
            "copyrightText",
            "developerLabel",
            "developerName",
            "developerUrl",
          ].map((key) => (
            <PrimitiveField
              key={key}
              fieldKey={key}
              value={value[key]}
              onChange={(next) => set(key, next)}
            />
          ))}
          <ImageEditor
            label="Footer Logo"
            value={value.logo}
            onChange={(next) => set("logo", next)}
          />
          {[
            ["Hotel Links", "hotelLinks"],
            ["Discover Links", "discoverLinks"],
            ["Social Links", "socialLinks"],
          ].map(([label, key]) =>
            Array.isArray(value[key]) ? (
              <CollectionEditor
                key={key}
                label={label}
                items={value[key] as JsonObject[]}
                onChange={(next) => set(key, next)}
              />
            ) : null
          )}
        </>
      ) : null}

      {sectionKey === "instagram" ? (
        <>
          <PrimitiveField fieldKey="handle" value={value.handle} onChange={(next) => set("handle", next)} />
          <PrimitiveField fieldKey="link" value={value.link} onChange={(next) => set("link", next)} />
        </>
      ) : null}

      {Object.entries(value)
        .filter(
          ([key, entry]) =>
            !commonKeys.includes(key) &&
            key !== "enabled" &&
            key !== "items" &&
            key !== "image" &&
            key !== "logo" &&
            key !== "images" &&
            key !== "poster" &&
            sectionKey !== "hero" &&
            sectionKey !== "about" &&
            sectionKey !== "footer" &&
            sectionKey !== "instagram" &&
            (typeof entry === "string" ||
              typeof entry === "number" ||
              typeof entry === "boolean")
        )
        .map(([key, entry]) => (
          <PrimitiveField
            key={key}
            fieldKey={key}
            value={entry}
            onChange={(next) => set(key, next)}
          />
        ))}

      {Array.isArray(value.paragraphs) ? (
        <StringListEditor
          label={
            sectionKey === "about" ? "Additional Paragraphs" : "Paragraphs"
          }
          values={
            sectionKey === "about"
              ? (value.paragraphs as string[]).slice(1)
              : (value.paragraphs as string[])
          }
          onChange={(next) =>
            set(
              "paragraphs",
              sectionKey === "about"
                ? [String(value.description || ""), ...next]
                : next
            )
          }
        />
      ) : null}

      {value.labels && typeof value.labels === "object" ? (
        <div className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
          <FieldLabel>Card Labels</FieldLabel>
          <ObjectFields
            value={value.labels as JsonObject}
            onChange={(next) => set("labels", next)}
          />
        </div>
      ) : null}

      {Array.isArray(value.stats) ? (
        <CollectionEditor
          label="Statistics"
          items={value.stats as JsonObject[]}
          onChange={(next) => set("stats", next)}
        />
      ) : null}

      {Array.isArray(value.images) ? (
        <ImageListEditor
          label={sectionKey === "gallery" ? "Gallery Images" : "Section Images"}
          images={value.images as EditableImage[]}
          onChange={(next) => set("images", next)}
        />
      ) : null}

      {Array.isArray(value.treatments) ? (
        <CollectionEditor
          label="Featured Treatments"
          items={value.treatments as JsonObject[]}
          onChange={(next) => set("treatments", next)}
        />
      ) : null}

      {Array.isArray(value.items) ? (
        sectionKey === "gallery" ? (
          <ImageListEditor
            label="Gallery Images"
            images={(value.items as JsonObject[]).map((item) => ({
              ...item,
              src: String(item.src || ""),
              alt: String(item.alt || ""),
            }))}
            onChange={(next) => set("items", next)}
          />
        ) : (
          <CollectionEditor
            label={`${HOMEPAGE_SECTIONS.find((item) => item.key === sectionKey)?.itemLabel || "Item"}s`}
            items={value.items as JsonObject[]}
            onChange={(next) => set("items", next)}
          />
        )
      ) : null}
    </div>
  );
}

function HeroExtraFields({
  value,
  set,
}: {
  value: JsonObject;
  set: (key: string, value: unknown) => void;
}) {
  const mediaType = String(value.mediaType || "IMAGE") as "IMAGE" | "VIDEO";
  const videoUrl = String(value.videoUrl || "");
  const mobileVideoUrl = String(value.mobileVideoUrl || "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterBusy, setPosterBusy] = useState(false);
  const { push } = useToast();

  async function generatePosterFromVideo(sourceUrl: string) {
    if (!sourceUrl || posterBusy) return;
    setPosterBusy(true);
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = sourceUrl.split("?")[0];
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Unable to load video frame"));
      });
      video.currentTime = Math.min(0.35, (video.duration || 1) * 0.05);
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Poster capture failed");
      const body = new FormData();
      body.set(
        "file",
        new File([blob], `hero-poster-${Date.now()}.jpg`, {
          type: "image/jpeg",
        })
      );
      body.set("folder", "hero");
      body.set("alt", "Hero video poster");
      const response = await fetch("/api/orbit/media", { method: "POST", body });
      const result = (await response.json()) as {
        asset?: { id: string; url: string; alt?: string };
        error?: string;
      };
      if (!response.ok || !result.asset) {
        throw new Error(result.error || "Poster upload failed");
      }
      set("poster", {
        assetId: result.asset.id,
        src: withMediaCacheBust(result.asset.url),
        alt: result.asset.alt || "Hero video poster",
        title: "Hero Video Poster",
        focalX: 50,
        focalY: 50,
      });
      push("Poster generated automatically", "success");
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Poster generation failed",
        "error"
      );
    } finally {
      setPosterBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <details open className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
        <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
          Hero Content
        </summary>
        <div className="mt-4 space-y-4">
          <PrimitiveField fieldKey="eyebrow" value={value.eyebrow} onChange={(next) => set("eyebrow", next)} />
          <PrimitiveField fieldKey="heading" value={value.heading} onChange={(next) => set("heading", next)} />
          <PrimitiveField fieldKey="highlightedText" value={value.highlightedText} onChange={(next) => set("highlightedText", next)} />
          <PrimitiveField fieldKey="subheading" value={value.subheading} onChange={(next) => set("subheading", next)} />
          <PrimitiveField fieldKey="description" value={value.description} onChange={(next) => set("description", next)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PrimitiveField fieldKey="buttonText" value={value.buttonText} onChange={(next) => set("buttonText", next)} />
            <PrimitiveField fieldKey="buttonLink" value={value.buttonLink} onChange={(next) => set("buttonLink", next)} />
            <PrimitiveField fieldKey="secondaryButtonText" value={value.secondaryButtonText} onChange={(next) => set("secondaryButtonText", next)} />
            <PrimitiveField fieldKey="secondaryButtonLink" value={value.secondaryButtonLink} onChange={(next) => set("secondaryButtonLink", next)} />
          </div>
          <PrimitiveField fieldKey="scrollLabel" value={value.scrollLabel} onChange={(next) => set("scrollLabel", next)} />
        </div>
      </details>

      <details open className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
        <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
          Background Type
        </summary>
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            {(["IMAGE", "VIDEO"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => set("mediaType", option)}
                className={cn(
                  "h-11 flex-1 rounded-xl border text-[10px] font-semibold tracking-[0.16em] uppercase transition",
                  mediaType === option
                    ? "border-[#123429] bg-[#123429] text-[#f0d999]"
                    : "border-[#17362b]/12 bg-white text-[#42574e]"
                )}
              >
                {option === "IMAGE" ? "○ Image" : "○ Video"}
              </button>
            ))}
          </div>

          {mediaType === "VIDEO" ? (
            <div className="space-y-4">
              <MediaField
                label="Desktop / Primary Video"
                kind="VIDEO"
                value={{
                  assetId: String(value.videoAssetId || ""),
                  url: videoUrl,
                  kind: "VIDEO",
                }}
                onChange={(next) => {
                  const busted = withMediaCacheBust(next.url);
                  set("videoUrl", busted);
                  set("videoAssetId", next.assetId);
                  set("videoSizeBytes", next.size ?? null);
                  set("videoWidth", next.width ?? null);
                  set("videoHeight", next.height ?? null);
                  set("videoDurationMs", next.durationMs ?? null);
                  const hasPoster =
                    isImage(value.poster) && Boolean(value.poster.src);
                  if (!hasPoster) {
                    if (isImage(value.image) && value.image.src) {
                      set("poster", {
                        ...value.image,
                        title: "Hero Video Poster",
                      });
                    }
                    void generatePosterFromVideo(busted);
                  }
                }}
              />
              {videoUrl ? (
                <div className="overflow-hidden rounded-xl border border-[#17362b]/10 bg-black">
                  <video
                    ref={videoRef}
                    key={videoUrl}
                    src={videoUrl}
                    className="aspect-video h-auto w-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-[#10251e] p-3 text-[10px] text-[#ead39f] sm:grid-cols-4">
                    <span>Status: Ready</span>
                    <span>
                      Size:{" "}
                      {value.videoSizeBytes
                        ? formatBytes(Number(value.videoSizeBytes))
                        : "—"}
                    </span>
                    <span>
                      Dims:{" "}
                      {value.videoWidth && value.videoHeight
                        ? `${value.videoWidth}×${value.videoHeight}`
                        : "16:9"}
                    </span>
                    <span>
                      Duration:{" "}
                      {value.videoDurationMs
                        ? `${Math.round(Number(value.videoDurationMs) / 1000)}s`
                        : "—"}
                    </span>
                  </div>
                </div>
              ) : null}
              <MediaField
                label="Mobile Video (optional)"
                kind="VIDEO"
                value={{
                  assetId: String(value.mobileVideoAssetId || ""),
                  url: mobileVideoUrl,
                  kind: "VIDEO",
                }}
                onChange={(next) => {
                  set(
                    "mobileVideoUrl",
                    next.url ? withMediaCacheBust(next.url) : ""
                  );
                  set("mobileVideoAssetId", next.assetId);
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    set("videoUrl", "");
                    set("videoAssetId", null);
                    set("mobileVideoUrl", "");
                    set("mobileVideoAssetId", null);
                  }}
                  className="text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                >
                  Delete Video
                </button>
                {videoUrl ? (
                  <button
                    type="button"
                    disabled={posterBusy}
                    onClick={() => void generatePosterFromVideo(videoUrl)}
                    className="text-[10px] font-semibold tracking-[0.14em] text-[#a67a30] uppercase disabled:opacity-50"
                  >
                    {posterBusy ? "Generating Poster…" : "Generate Poster"}
                  </button>
                ) : null}
              </div>
              {isImage(value.poster) ? (
                <ImageEditor
                  label="Poster Image"
                  value={value.poster}
                  onChange={(next) => set("poster", next)}
                />
              ) : (
                <MediaField
                  label="Poster Image"
                  kind="IMAGE"
                  onChange={(next) =>
                    set("poster", {
                      assetId: next.assetId,
                      src: withMediaCacheBust(next.url),
                      alt: next.alt || "Hero video poster",
                    })
                  }
                />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["videoAutoplay", "Autoplay"],
                  ["videoLoop", "Loop"],
                  ["videoMuted", "Muted"],
                  ["videoPlaysInline", "Plays Inline"],
                ].map(([key, label]) => (
                  <ToggleField
                    key={key}
                    label={label}
                    checked={value[key] !== false}
                    onChange={(next) => set(key, next)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isImage(value.image) ? (
                <ImageEditor
                  label="Hero Image"
                  value={value.image}
                  onChange={(next) =>
                    set("image", {
                      ...next,
                      src: next.src ? withMediaCacheBust(next.src) : next.src,
                    })
                  }
                />
              ) : null}
            </div>
          )}
        </div>
      </details>

      <details className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
        <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
          Layout & Overlay
        </summary>
        <div className="mt-4 space-y-4">
          <SelectField
            label="Overlay Style"
            value={String(value.overlay || "Balanced")}
            options={["Light", "Balanced", "Dark"]}
            onChange={(next) => set("overlay", next)}
          />
          <PrimitiveField
            fieldKey="overlayOpacity"
            value={value.overlayOpacity ?? 70}
            onChange={(next) => set("overlayOpacity", next)}
          />
          <SelectField
            label="Content Alignment"
            value={String(value.contentAlignment || "Left")}
            options={["Left", "Center", "Right"]}
            onChange={(next) => set("contentAlignment", next)}
          />
          <SelectField
            label="Desktop Height"
            value={String(value.desktopHeight || "Viewport")}
            options={["Viewport", "Tall", "Medium"]}
            onChange={(next) => set("desktopHeight", next)}
          />
          <SelectField
            label="Mobile Height"
            value={String(value.mobileHeight || "Viewport")}
            options={["Viewport", "Tall", "Medium"]}
            onChange={(next) => set("mobileHeight", next)}
          />
          <SelectField
            label="Animation"
            value={String(value.animation || "KenBurns")}
            options={["KenBurns", "Subtle", "None"]}
            onChange={(next) => set("animation", next)}
          />
          <ToggleField
            label="Show Search / Booking Box"
            checked={value.bookingWidget !== false}
            onChange={(next) => set("bookingWidget", next)}
          />
        </div>
      </details>

      <details className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
        <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
          Logo Controls
        </summary>
        <div className="mt-4 space-y-4">
          {isImage(value.logo) ? (
            <ImageEditor
              label="Current Logo"
              value={value.logo}
              onChange={(next) => set("logo", next)}
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "logoDesktopWidth",
              "logoTabletWidth",
              "logoMobileWidth",
              "logoLeftMargin",
              "logoTopMargin",
              "logoOpacity",
            ].map((key) => (
              <PrimitiveField
                key={key}
                fieldKey={key}
                value={value[key]}
                onChange={(next) => set(key, next)}
              />
            ))}
          </div>
        </div>
      </details>

      {value.booking && typeof value.booking === "object" ? (
        <details className="rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] p-4">
          <summary className="cursor-pointer text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
            Search Box Labels
          </summary>
          <div className="mt-4">
            <ObjectFields
              value={value.booking as JsonObject}
              onChange={(next) => set("booking", next)}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}

function PrimitiveField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <ToggleField
        label={labelFor(fieldKey)}
        checked={value}
        onChange={onChange}
      />
    );
  }
  const multiline =
    fieldKey.toLowerCase().includes("description") ||
    fieldKey.toLowerCase().includes("bio") ||
    fieldKey.toLowerCase().includes("quote");
  const type = typeof value === "number" ? "number" : "text";
  const numberRange: { min?: number; max?: number } =
    fieldKey === "rating"
      ? { min: 1, max: 5 }
      : fieldKey.includes("Width")
        ? { min: 40, max: 600 }
        : fieldKey === "logoOpacity" || fieldKey === "overlayOpacity"
          ? { min: 0, max: 100 }
          : fieldKey.includes("Margin")
            ? { min: -500, max: 500 }
            : {};
  return (
    <label className="block">
      <FieldLabel>{labelFor(fieldKey)}</FieldLabel>
      {multiline ? (
        <textarea
          value={String(value ?? "")}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm leading-relaxed text-[#203b30] outline-none focus:border-[#c4943c]/50"
        />
      ) : (
        <input
          type={type}
          min={numberRange.min}
          max={numberRange.max}
          value={typeof value === "number" ? value : String(value ?? "")}
          onChange={(event) =>
            onChange(
              type === "number"
                ? Math.min(
                    numberRange.max ?? Number.POSITIVE_INFINITY,
                    Math.max(
                      numberRange.min ?? Number.NEGATIVE_INFINITY,
                      Number(event.target.value)
                    )
                  )
                : event.target.value
            )
          }
          className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50"
        />
      )}
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#17362b]/10 bg-white px-4 py-3">
      <span className="text-sm font-semibold text-[#294138]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 rounded-full transition",
          checked ? "bg-[#1d5a46]" : "bg-[#ccd2ce]"
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1"
          )}
        />
      </button>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ImageEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: EditableImage;
  onChange: (value: EditableImage) => void;
}) {
  const [dimensions, setDimensions] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [cropping, setCropping] = useState(false);
  useEffect(() => {
    if (!value.assetId) {
      setFileSize(value.src.startsWith("http") ? "Remote source" : "Original file");
      return;
    }
    let active = true;
    void fetch(`/api/orbit/media/${value.assetId}`)
      .then((response) => response.json())
      .then((result: { asset?: { size?: number; width?: number; height?: number } }) => {
        if (!active || !result.asset) return;
        if (result.asset.size) {
          setFileSize(formatBytes(result.asset.size));
        }
        if (result.asset.width && result.asset.height) {
          setDimensions(`${result.asset.width} × ${result.asset.height}`);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [value.assetId, value.src]);
  return (
    <div className="rounded-xl border border-[#17362b]/10 bg-[#f4f4ef] p-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="mb-4 overflow-hidden rounded-xl bg-[#dfe5e0]">
        <div className="relative aspect-video">
          {value.src ? (
            <Image
              key={value.src}
              src={value.src}
              alt={value.alt}
              fill
              sizes="600px"
              className="object-cover"
              style={{
                objectPosition: `${value.focalX ?? 50}% ${value.focalY ?? 50}%`,
              }}
              unoptimized={value.src.startsWith("/media/")}
              onLoad={(event) => {
                const target = event.currentTarget;
                setDimensions(`${target.naturalWidth} × ${target.naturalHeight}`);
              }}
            />
          ) : (
            <div className="grid h-full place-items-center">
              <ImageIcon className="size-8 text-[#8b9892]" />
            </div>
          )}
        </div>
      </div>
      <div className="mb-3 text-[10px] text-[#6e7b75]">
        <p className="truncate"><strong>Current:</strong> {value.title || value.src.split("/").at(-1) || "Image"}</p>
        <p><strong>Resolution:</strong> {dimensions || "Loading…"}</p>
        <p><strong>File size:</strong> {fileSize || "Loading…"}</p>
        <p className="truncate"><strong>URL:</strong> {value.src}</p>
      </div>
      <MediaField
        label="Replace or upload"
        kind="IMAGE"
        value={{
          assetId: value.assetId,
          url: value.src,
          alt: value.alt,
          kind: "IMAGE",
        }}
        onChange={(next) =>
          onChange({
            ...value,
            assetId: next.assetId,
            src: withMediaCacheBust(next.url),
            alt: next.alt,
            title: next.url.split("/").at(-1),
          })
        }
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PrimitiveField
          fieldKey="alt"
          value={value.alt}
          onChange={(next) => onChange({ ...value, alt: String(next) })}
        />
        <PrimitiveField
          fieldKey="title"
          value={value.title || ""}
          onChange={(next) => onChange({ ...value, title: String(next) })}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-[9px] font-semibold tracking-[0.15em] text-[#52665c] uppercase">
          Focal X ({value.focalX ?? 50}%)
          <input
            type="range"
            min={0}
            max={100}
            value={value.focalX ?? 50}
            onChange={(event) =>
              onChange({ ...value, focalX: Number(event.target.value) })
            }
            className="mt-2 w-full"
          />
        </label>
        <label className="text-[9px] font-semibold tracking-[0.15em] text-[#52665c] uppercase">
          Focal Y ({value.focalY ?? 50}%)
          <input
            type="range"
            min={0}
            max={100}
            value={value.focalY ?? 50}
            onChange={(event) =>
              onChange({ ...value, focalY: Number(event.target.value) })
            }
            className="mt-2 w-full"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!value.assetId}
          onClick={() => setCropping(true)}
          className="rounded-lg border border-[#17362b]/10 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase disabled:opacity-40"
        >
          Crop · Zoom · Rotate
        </button>
        <Link
          href={
            value.assetId
              ? `/orbit/media-library?asset=${value.assetId}&action=edit`
              : "/orbit/media-library?trash=1"
          }
          className="rounded-lg border border-[#17362b]/10 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
        >
          Restore Previous
        </Link>
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, assetId: null, src: "", title: "" })
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold tracking-[0.12em] text-red-600 uppercase"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...value, focalX: 50, focalY: 50 })}
          className="rounded-lg border border-[#17362b]/10 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
        >
          Reset focal point
        </button>
      </div>
      {cropping && value.assetId && value.src ? (
        <ImageCropper
          assetId={value.assetId}
          src={value.src}
          onClose={() => setCropping(false)}
          onSaved={() => {
            setCropping(false);
            void fetch(`/api/orbit/media/${value.assetId}`)
              .then((response) => response.json())
              .then((result: { asset?: { url?: string; id?: string } }) => {
                if (!result.asset?.url) return;
                onChange({
                  ...value,
                  assetId: result.asset.id || value.assetId,
                  src: withMediaCacheBust(result.asset.url),
                });
              })
              .catch(() => undefined);
          }}
        />
      ) : null}
    </div>
  );
}

function ImageListEditor({
  label,
  images,
  onChange,
}: {
  label: string;
  images: EditableImage[];
  onChange: (images: EditableImage[]) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...images,
              {
                src: "",
                alt: "New image",
                title: "New image",
                focalX: 50,
                focalY: 50,
                ...(images[0] && "category" in images[0]
                  ? { category: "Architecture" }
                  : {}),
              },
            ])
          }
          className="flex items-center gap-1 rounded-lg border border-[#17362b]/10 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
        >
          <Plus className="size-3" /> Upload More
        </button>
      </div>
      <div className="space-y-4">
        {images.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            draggable
            onDragStart={() => {
              dragIndex.current = index;
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              const from = dragIndex.current;
              if (from === null || from === index) return;
              const next = [...images];
              const [moved] = next.splice(from, 1);
              next.splice(index, 0, moved);
              onChange(next);
              dragIndex.current = null;
            }}
            className="relative"
          >
            <div className="absolute top-3 left-3 z-10 grid size-8 cursor-grab place-items-center rounded-lg bg-black/55 text-white">
              <GripVertical className="size-4" />
            </div>
            <ImageEditor
              label={`${label} ${index + 1}`}
              value={item}
              onChange={(nextItem) =>
                onChange(
                  images.map((imageItem, itemIndex) =>
                    itemIndex === index ? nextItem : imageItem
                  )
                )
              }
            />
            {"category" in item ? (
              <div className="mt-3">
                <SelectField
                  label="Category"
                  value={String(
                    (item as EditableImage & { category?: string }).category ||
                      "Architecture"
                  )}
                  options={[
                    "Rooms",
                    "Dining",
                    "Wellness",
                    "Architecture",
                    "Events",
                  ]}
                  onChange={(category) =>
                    onChange(
                      images.map((imageItem, itemIndex) =>
                        itemIndex === index
                          ? ({ ...imageItem, category } as EditableImage)
                          : imageItem
                      )
                    )
                  }
                />
              </div>
            ) : null}
            <div className="mt-2 flex justify-end gap-2">
              <MoveButtons
                index={index}
                length={images.length}
                onMove={(to) => {
                  const next = [...images];
                  const [moved] = next.splice(index, 1);
                  next.splice(to, 0, moved);
                  onChange(next);
                }}
              />
              <button
                type="button"
                disabled={images.length <= 1}
                onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}
                className="grid size-9 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Delete image"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: JsonObject[];
  onChange: (items: JsonObject[]) => void;
}) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <button
          type="button"
          onClick={() => {
            const template = items[0] ? blankLike(items[0]) : { title: "New item" };
            onChange([...items, template]);
            setOpenIndex(items.length);
          }}
          className="flex items-center gap-1 rounded-lg border border-[#17362b]/10 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
        >
          <Plus className="size-3" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
          const name =
            String(item.name || item.title || item.heading || item.alt || "") ||
            `${label} ${index + 1}`;
          return (
            <div
              key={`${name}-${index}`}
              className="overflow-hidden rounded-xl border border-[#17362b]/10 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <GripVertical className="size-4 text-[#8b9892]" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#294138]">
                  {name}
                </span>
                <span className="text-[9px] text-[#8b9892] uppercase">
                  {openIndex === index ? "Close" : "Edit"}
                </span>
              </button>
              {openIndex === index ? (
                <div className="space-y-4 border-t border-[#17362b]/8 bg-[#fafaf7] p-4">
                  <ObjectFields
                    value={item}
                    onChange={(next) =>
                      onChange(
                        items.map((current, itemIndex) =>
                          itemIndex === index ? next : current
                        )
                      )
                    }
                  />
                  <div className="flex justify-end gap-2 border-t border-[#17362b]/8 pt-3">
                    <MoveButtons
                      index={index}
                      length={items.length}
                      onMove={(to) => {
                        const next = [...items];
                        const [moved] = next.splice(index, 1);
                        next.splice(to, 0, moved);
                        onChange(next);
                        setOpenIndex(to);
                      }}
                    />
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() =>
                        onChange(items.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-[9px] font-semibold tracking-[0.12em] text-red-600 uppercase disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ObjectFields({
  value,
  onChange,
}: {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
}) {
  function set(key: string, next: unknown) {
    onChange({ ...value, [key]: next });
  }
  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, entry]) => {
        if (isImage(entry)) {
          return (
            <ImageEditor
              key={key}
              label={labelFor(key)}
              value={entry}
              onChange={(next) => set(key, next)}
            />
          );
        }
        if (Array.isArray(entry)) {
          if (entry.every((item) => typeof item === "string")) {
            return (
              <StringListEditor
                key={key}
                label={labelFor(key)}
                values={entry as string[]}
                onChange={(next) => set(key, next)}
              />
            );
          }
          if (entry.every((item) => isImage(item))) {
            return (
              <ImageListEditor
                key={key}
                label={labelFor(key)}
                images={entry as EditableImage[]}
                onChange={(next) => set(key, next)}
              />
            );
          }
          return null;
        }
        if (entry && typeof entry === "object") {
          return (
            <div key={key} className="rounded-xl border border-[#17362b]/8 p-3">
              <FieldLabel>{labelFor(key)}</FieldLabel>
              <ObjectFields
                value={entry as JsonObject}
                onChange={(next) => set(key, next)}
              />
            </div>
          );
        }
        return (
          <PrimitiveField
            key={key}
            fieldKey={key}
            value={entry}
            onChange={(next) => set(key, next)}
          />
        );
      })}
    </div>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={values.join("\n")}
        rows={Math.max(3, Math.min(8, values.length + 1))}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
        className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm leading-relaxed text-[#203b30]"
      />
      <span className="mt-1 block text-[10px] text-[#89938e]">One item per line</span>
    </label>
  );
}

function MoveButtons({
  index,
  length,
  onMove,
}: {
  index: number;
  length: number;
  onMove: (index: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className="grid size-9 place-items-center rounded-lg border border-[#17362b]/10 bg-white disabled:opacity-30"
        aria-label="Move up"
      >
        <ArrowUp className="size-4" />
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(index + 1)}
        className="grid size-9 place-items-center rounded-lg border border-[#17362b]/10 bg-white disabled:opacity-30"
        aria-label="Move down"
      >
        <ArrowDown className="size-4" />
      </button>
    </>
  );
}

function blankLike(value: JsonObject): JsonObject {
  const result: JsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      result[key] =
        key === "slug"
          ? `new-${Date.now()}`
          : key === "date"
            ? new Date().toISOString().slice(0, 10)
            : "";
    } else if (typeof entry === "number") {
      result[key] = key === "rating" ? 5 : 0;
    } else if (typeof entry === "boolean") {
      result[key] = entry;
    } else if (Array.isArray(entry)) {
      result[key] = [];
    } else if (isImage(entry)) {
      result[key] = { src: "", alt: "", title: "", focalX: 50, focalY: 50 };
    } else if (entry && typeof entry === "object") {
      result[key] = blankLike(entry as JsonObject);
    }
  }
  return result;
}

function SectionPreview({
  sectionKey,
  value,
}: {
  sectionKey: HomepageSectionKey;
  value: JsonObject;
}) {
  const isVideo =
    sectionKey === "hero" && String(value.mediaType || "") === "VIDEO";
  const videoUrl = String(value.videoUrl || "");
  const imageValue = isImage(value.image)
    ? value.image
    : Array.isArray(value.images) && isImage(value.images[0])
      ? value.images[0]
      : Array.isArray(value.items)
        ? firstImage(value.items as unknown[])
        : undefined;
  const dark = ["hero", "featuredSuites", "gallery", "testimonials"].includes(
    sectionKey
  );
  return (
    <div
      className={cn(
        "relative min-h-[560px]",
        dark ? "bg-[#10251e] text-white" : "bg-[#fbfaf5] text-[#10251e]"
      )}
    >
      {sectionKey === "hero" &&
      isImage(value.logo) &&
      value.logo.src.trim() ? (
        <div className="absolute z-10 p-5">
          <div
            className="relative"
            style={{
              width: `${Math.min(180, Number(value.logoDesktopWidth || 180))}px`,
              height: "64px",
              marginLeft: `${Number(value.logoLeftMargin || 0)}px`,
              marginTop: `${Number(value.logoTopMargin || 0)}px`,
              opacity: Number(value.logoOpacity ?? 100) / 100,
            }}
          >
            <Image
              src={value.logo.src}
              alt={value.logo.alt}
              fill
              className="object-contain object-left"
              unoptimized={value.logo.src.startsWith("/media/")}
            />
          </div>
        </div>
      ) : null}
      {isVideo && videoUrl ? (
        <div className="relative h-[22rem] overflow-hidden bg-black">
          <video
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay={value.videoAutoplay !== false}
            muted={value.videoMuted !== false}
            loop={value.videoLoop !== false}
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-[8px] tracking-[0.22em] text-[#e2be72] uppercase">
              {String(value.eyebrow || "")}
            </p>
            <h3 className="mt-2 font-serif text-3xl">
              {String(value.heading || "")}
            </h3>
            <p className="mt-3 max-w-md text-xs text-white/75">
              {String(value.subheading || value.description || "")}
            </p>
            {value.bookingWidget !== false ? (
              <div className="mt-5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[9px] tracking-[0.14em] text-[#ead39f] uppercase backdrop-blur">
                Search box · Check availability
              </div>
            ) : null}
          </div>
        </div>
      ) : imageValue?.src ? (
        <div className={cn("relative", sectionKey === "hero" ? "h-[22rem]" : "h-52")}>
          <Image
            key={imageValue.src}
            src={imageValue.src}
            alt={imageValue.alt}
            fill
            className="object-cover"
            style={{
              objectPosition: `${imageValue.focalX ?? 50}% ${imageValue.focalY ?? 50}%`,
            }}
            unoptimized={imageValue.src.startsWith("/media/")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[8px] tracking-[0.22em] text-[#e2be72] uppercase">
              {String(value.eyebrow || "")}
            </p>
            <h3 className="mt-2 font-serif text-2xl">
              {String(value.heading || value.handle || "")}
            </h3>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <p className="text-[8px] tracking-[0.22em] text-[#b58a3d] uppercase">
            {String(value.eyebrow || "")}
          </p>
          <h3 className="mt-2 font-serif text-2xl">
            {String(value.heading || value.handle || "")}
          </h3>
        </div>
      )}
      <div className="p-5">
        <p className={cn("text-xs leading-relaxed", dark ? "text-white/70" : "text-[#52665c]")}>
          {String(value.description || value.subheading || "")}
        </p>
        {Array.isArray(value.items) ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(value.items as JsonObject[]).slice(0, 6).map((item, index) => {
              const itemImage = firstImage([item]);
              return (
                <div key={index} className={cn("overflow-hidden rounded-lg", dark ? "bg-white/8" : "bg-white shadow-sm")}>
                  {itemImage?.src ? (
                    <div className="relative h-20">
                      <Image
                        src={itemImage.src}
                        alt={itemImage.alt}
                        fill
                        className="object-cover"
                        unoptimized={itemImage.src.startsWith("/media/")}
                      />
                    </div>
                  ) : null}
                  <p className="truncate p-2 text-[10px] font-semibold">
                    {String(item.name || item.title || item.alt || `Item ${index + 1}`)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {value.buttonText ? (
            <span className="mt-0 inline-block rounded-md border border-[#c4943c] px-3 py-2 text-[8px] font-semibold tracking-[0.14em] text-[#c4943c] uppercase">
              {String(value.buttonText)}
            </span>
          ) : null}
          {value.secondaryButtonText ? (
            <span className="inline-block rounded-md border border-current/30 px-3 py-2 text-[8px] font-semibold tracking-[0.14em] uppercase opacity-80">
              {String(value.secondaryButtonText)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function firstImage(items: unknown[]): EditableImage | undefined {
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as JsonObject;
    if (isImage(item.image)) return item.image;
    if (Array.isArray(item.images) && isImage(item.images[0])) return item.images[0];
    if (typeof item.src === "string" && typeof item.alt === "string") {
      return item as EditableImage;
    }
  }
  return undefined;
}

function collectClientImages(value: unknown): EditableImage[] {
  if (isImage(value)) return [value];
  if (Array.isArray(value)) return value.flatMap(collectClientImages);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectClientImages);
  }
  return [];
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
      {children}
    </span>
  );
}

"use client";

import {
  Archive,
  Calendar,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  FolderOpen,
  ImageIcon,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { MediaField, MediaPicker } from "@/components/orbit/media-picker";
import { RichTextEditor } from "@/components/orbit/rich-text-editor";
import { useToast } from "@/components/orbit/toast";
import { withMediaCacheBust } from "@/lib/media-cache";
import { cn } from "@/lib/utils";

export type BlogEntry = {
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

type GalleryItem = { url: string; alt: string; assetId?: string | null };

type PostForm = {
  id?: string;
  title: string;
  slug: string;
  status: BlogEntry["status"];
  scheduledAt: string;
  subtitle: string;
  excerpt: string;
  html: string;
  rawNote: string;
  category: string;
  tags: string;
  authorName: string;
  authorRole: string;
  readingTime: string;
  relatedPostSlugs: string;
  publishDate: string;
  coverUrl: string;
  coverAlt: string;
  coverCaption: string;
  coverAssetId: string | null;
  gallery: GalleryItem[];
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  mediaAssetId: string | null;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  schemaJson: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: string;
  noindex: boolean;
};

type BlogSettings = {
  id?: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogImageAssetId: string | null;
  canonicalUrl: string;
  noindex: boolean;
  categories: string[];
};

type DashboardTab = "posts" | "categories" | "tags" | "media" | "seo";

const RESERVED_KEYS = new Set(["blog-settings", "page-studio"]);

const DEFAULT_CATEGORIES = [
  "Destination",
  "Design",
  "Dining",
  "Wellness",
  "Events",
  "Journal",
];

const TWITTER_CARDS = ["summary", "summary_large_image", "player", "app"];

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseGallery(data: Record<string, unknown>): GalleryItem[] {
  if (!Array.isArray(data.gallery)) return [];
  return data.gallery
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        url: text(row.url || row.src),
        alt: text(row.alt),
        assetId: typeof row.assetId === "string" ? row.assetId : null,
      };
    })
    .filter((item) => item.url);
}

function entryToForm(entry: BlogEntry): PostForm {
  const data = entry.data || {};
  const seo = entry.seo || {};
  const html =
    text(data.html) ||
    text(data.content) ||
    (Array.isArray(data.content)
      ? (data.content as { paragraphs?: string[] }[])
          .flatMap((s) => s.paragraphs || [])
          .map((p) => `<p>${p}</p>`)
          .join("")
      : "");

  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug ?? entry.key,
    status: entry.status,
    scheduledAt: entry.scheduledAt?.slice(0, 16) ?? "",
    subtitle: text(data.subtitle),
    excerpt: text(data.excerpt),
    html,
    rawNote: text(data.rawNote || data.markdownNote),
    category: text(data.category, "Journal"),
    tags: Array.isArray(data.tags)
      ? (data.tags as string[]).join(", ")
      : text(data.tags),
    authorName: text(data.authorName || data.author, "Marlo Hotels"),
    authorRole: text(data.authorRole, "Contributor"),
    readingTime: text(data.readingTime, "5 min read"),
    relatedPostSlugs: Array.isArray(data.relatedPostSlugs)
      ? (data.relatedPostSlugs as string[]).join(", ")
      : text(data.relatedPostSlugs),
    publishDate: text(
      data.publishDate,
      entry.scheduledAt?.slice(0, 10) ??
        entry.updatedAt.slice(0, 10)
    ),
    coverUrl: text(data.coverUrl || data.imageUrl),
    coverAlt: text(data.coverAlt || data.imageAlt, entry.title),
    coverCaption: text(data.coverCaption || data.imageCaption),
    coverAssetId:
      typeof data.coverAssetId === "string"
        ? data.coverAssetId
        : typeof data.mediaAssetId === "string"
          ? data.mediaAssetId
          : null,
    gallery: parseGallery(data),
    imageUrl: text(data.imageUrl || data.coverUrl),
    imageAlt: text(data.imageAlt || data.coverAlt, entry.title),
    imageCaption: text(data.imageCaption || data.coverCaption),
    mediaAssetId:
      typeof data.mediaAssetId === "string"
        ? data.mediaAssetId
        : typeof data.coverAssetId === "string"
          ? data.coverAssetId
          : null,
    metaTitle: text(seo.metaTitle || data.metaTitle, entry.title),
    metaDescription: text(seo.metaDescription || data.metaDescription),
    focusKeyword: text(seo.focusKeyword || data.focusKeyword),
    canonicalUrl: text(seo.canonicalUrl || data.canonicalUrl),
    schemaJson: text(seo.schemaJson || data.schemaJson),
    ogTitle: text(seo.ogTitle || data.ogTitle, entry.title),
    ogDescription: text(seo.ogDescription || data.ogDescription),
    ogImageUrl: text(seo.ogImageUrl || data.ogImageUrl || data.imageUrl),
    twitterCard: text(seo.twitterCard || data.twitterCard, "summary_large_image"),
    noindex: seo.noindex === true || data.noindex === true,
  };
}

function emptyPostForm(): PostForm {
  return {
    title: "",
    slug: "",
    status: "DRAFT",
    scheduledAt: "",
    subtitle: "",
    excerpt: "",
    html: "",
    rawNote: "",
    category: "Journal",
    tags: "",
    authorName: "Marlo Hotels",
    authorRole: "Contributor",
    readingTime: "5 min read",
    relatedPostSlugs: "",
    publishDate: new Date().toISOString().slice(0, 10),
    coverUrl: "",
    coverAlt: "",
    coverCaption: "",
    coverAssetId: null,
    gallery: [],
    imageUrl: "",
    imageAlt: "",
    imageCaption: "",
    mediaAssetId: null,
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    canonicalUrl: "",
    schemaJson: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    noindex: false,
  };
}

function formToPayload(form: PostForm) {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const relatedPostSlugs = form.relatedPostSlugs
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  return {
    module: "blog" as const,
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    status: form.status,
    scheduledAt: form.scheduledAt
      ? new Date(form.scheduledAt).toISOString()
      : null,
    data: {
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      html: form.html,
      content: form.html,
      rawNote: form.rawNote,
      category: form.category,
      tags: tags.join(", "),
      authorName: form.authorName,
      authorRole: form.authorRole,
      author: form.authorName,
      readingTime: form.readingTime,
      relatedPostSlugs,
      publishDate: form.publishDate,
      coverUrl: form.coverUrl,
      coverAlt: form.coverAlt,
      coverCaption: form.coverCaption,
      coverAssetId: form.coverAssetId,
      imageUrl: form.coverUrl || form.imageUrl,
      imageAlt: form.coverAlt || form.imageAlt,
      imageCaption: form.coverCaption || form.imageCaption,
      mediaAssetId: form.coverAssetId || form.mediaAssetId,
      gallery: form.gallery,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      focusKeyword: form.focusKeyword,
      canonicalUrl: form.canonicalUrl,
      schemaJson: form.schemaJson,
      ogTitle: form.ogTitle,
      ogDescription: form.ogDescription,
      ogImageUrl: form.ogImageUrl,
      twitterCard: form.twitterCard,
      noindex: form.noindex,
    },
    seo: {
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      focusKeyword: form.focusKeyword,
      canonicalUrl: form.canonicalUrl,
      schemaJson: form.schemaJson,
      ogTitle: form.ogTitle,
      ogDescription: form.ogDescription,
      ogImageUrl: form.ogImageUrl,
      twitterCard: form.twitterCard,
      noindex: form.noindex,
    },
  };
}

function computeSeoScore(form: PostForm): number {
  let score = 0;
  if (form.metaTitle.trim()) score += 15;
  if (form.metaDescription.trim().length >= 80) score += 20;
  else if (form.metaDescription.trim()) score += 10;
  if (
    form.focusKeyword.trim() &&
    form.title.toLowerCase().includes(form.focusKeyword.toLowerCase())
  ) {
    score += 15;
  } else if (form.focusKeyword.trim()) score += 5;
  if (form.excerpt.trim()) score += 10;
  if (form.ogTitle.trim()) score += 10;
  if (form.ogDescription.trim()) score += 10;
  if (form.ogImageUrl.trim() || form.coverUrl.trim()) score += 10;
  if (form.canonicalUrl.trim()) score += 5;
  if (!form.noindex) score += 5;
  return Math.min(100, score);
}

function parseSettings(entry?: BlogEntry): BlogSettings {
  const data = entry?.data || {};
  const seo = entry?.seo || {};
  const categories = Array.isArray(data.categories)
    ? (data.categories as string[]).filter(Boolean)
    : DEFAULT_CATEGORIES;

  return {
    id: entry?.id,
    metaTitle: text(seo.metaTitle || data.metaTitle, "The Journal | Marlo Hotels"),
    metaDescription: text(
      seo.metaDescription || data.metaDescription,
      "Dispatches from Marlo Hotels — itineraries, craft, kitchens and rituals."
    ),
    ogTitle: text(seo.ogTitle || data.ogTitle, "The Journal"),
    ogDescription: text(seo.ogDescription || data.ogDescription),
    ogImageUrl: text(seo.ogImageUrl || data.ogImageUrl),
    ogImageAssetId:
      typeof data.ogImageAssetId === "string" ? data.ogImageAssetId : null,
    canonicalUrl: text(seo.canonicalUrl || data.canonicalUrl, "/blog"),
    noindex: seo.noindex === true || data.noindex === true,
    categories,
  };
}

export function BlogStudioEditor({
  initialEntries,
}: {
  initialEntries: BlogEntry[];
}) {
  const { push } = useToast();
  const settingsEntry = initialEntries.find((e) => e.key === "blog-settings");
  const postEntries = initialEntries.filter(
    (e) => !RESERVED_KEYS.has(e.key)
  );

  const [entries, setEntries] = useState(postEntries);
  const [settings, setSettings] = useState(() => parseSettings(settingsEntry));
  const [savedSettings, setSavedSettings] = useState(() =>
    parseSettings(settingsEntry)
  );
  const [tab, setTab] = useState<DashboardTab>("posts");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED"
  >("ALL");
  const [form, setForm] = useState<PostForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const filteredPosts = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (statusFilter === "ALL" || entry.status === statusFilter) &&
          (entry.title.toLowerCase().includes(query.toLowerCase()) ||
            entry.slug?.toLowerCase().includes(query.toLowerCase()))
      ),
    [entries, query, statusFilter]
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const entry of entries) {
      const raw = entry.data?.tags;
      const list = Array.isArray(raw)
        ? (raw as string[])
        : text(raw)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      list.forEach((tag) => tags.add(tag));
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const mediaAssets = useMemo(() => {
    const seen = new Set<string>();
    const items: GalleryItem[] = [];
    for (const entry of entries) {
      const data = entry.data || {};
      const cover = text(data.coverUrl || data.imageUrl);
      if (cover && !seen.has(cover)) {
        seen.add(cover);
        items.push({
          url: cover,
          alt: text(data.coverAlt || data.imageAlt, entry.title),
        });
      }
      for (const item of parseGallery(data)) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          items.push(item);
        }
      }
    }
    return items;
  }, [entries]);

  const seoScore = form ? computeSeoScore(form) : 0;

  const patchForm = useCallback((partial: Partial<PostForm>) => {
    setForm((current) => (current ? { ...current, ...partial } : current));
    setDirty(true);
  }, []);

  async function savePost(
    targetStatus?: BlogEntry["status"],
    overrides?: Partial<PostForm>
  ) {
    if (!form) return;
    const current = { ...form, ...overrides };
    if (!current.title.trim()) {
      push("Title is required", "error");
      return;
    }
    setSaving(true);
    const payload = formToPayload(current);
    if (targetStatus) payload.status = targetStatus;

    const response = await fetch(
      current.id ? `/api/orbit/content/${current.id}` : "/api/orbit/content",
      {
        method: current.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          key: payload.slug,
        }),
      }
    );
    const result = (await response.json()) as {
      entry?: BlogEntry;
      error?: string;
    };
    setSaving(false);

    if (!response.ok || !result.entry) {
      push(result.error ?? "Save failed", "error");
      return;
    }

    setEntries((list) =>
      current.id
        ? list.map((e) => (e.id === result.entry!.id ? result.entry! : e))
        : [result.entry!, ...list]
    );
    setDirty(false);
    setForm(null);
    push(
      targetStatus === "PUBLISHED"
        ? "Published"
        : targetStatus === "DRAFT"
          ? "Saved as draft"
          : "Changes saved",
      "success"
    );
  }

  async function saveSettings() {
    setSettingsSaving(true);
    const response = await fetch("/api/orbit/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: "blog",
        key: "blog-settings",
        title: "Blog Settings",
        status: "PUBLISHED",
        data: {
          ...settings,
          categories: settings.categories,
        },
        seo: {
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          ogTitle: settings.ogTitle,
          ogDescription: settings.ogDescription,
          ogImageUrl: settings.ogImageUrl,
          canonicalUrl: settings.canonicalUrl,
          noindex: settings.noindex,
        },
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSettingsSaving(false);
    if (!response.ok) {
      push(result.error ?? "Settings save failed", "error");
      return;
    }
    setSavedSettings(structuredClone(settings));
    setSettingsDirty(false);
    push("Blog settings saved", "success");
  }

  async function remove(entry: BlogEntry) {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`))
      return;
    const response = await fetch(`/api/orbit/content/${entry.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setEntries((current) => current.filter((e) => e.id !== entry.id));
      push("Post deleted", "success");
    }
  }

  async function duplicate(entry: BlogEntry) {
    const response = await fetch(`/api/orbit/content/${entry.id}`, {
      method: "POST",
    });
    const result = (await response.json()) as { entry?: BlogEntry };
    if (response.ok && result.entry) {
      setEntries((current) => [result.entry!, ...current]);
      push("Post duplicated", "success");
    }
  }

  function openEditor(entry?: BlogEntry) {
    setForm(entry ? entryToForm(entry) : emptyPostForm());
    setDirty(false);
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name || settings.categories.includes(name)) return;
    setSettings((s) => ({ ...s, categories: [...s.categories, name] }));
    setNewCategory("");
    setSettingsDirty(true);
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Content management
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[#10251e]">
            Blog Studio
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#62716b]">
            Enterprise journal CMS — posts, categories, tags, media and SEO for
            the Marlo Hotels blog.
          </p>
        </div>
        {tab === "posts" ? (
          <button
            type="button"
            onClick={() => openEditor()}
            className="orbit-gold-button flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
          >
            <Plus className="size-4" /> New post
          </button>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            { id: "posts", label: "Blog Posts" },
            { id: "categories", label: "Categories" },
            { id: "tags", label: "Tags" },
            { id: "media", label: "Media" },
            { id: "seo", label: "SEO" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase transition",
              tab === item.id
                ? "bg-[#123429] text-[#e4c784]"
                : "bg-[#f2f3ef] text-[#64736c] hover:text-[#a67a30]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        <section className="orbit-panel mt-7 overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-[#17362b]/8 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#52665c]/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] pr-4 pl-10 text-xs text-[#1b342a] outline-none focus:border-[#c4943c]/45"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatusFilter(option)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] transition",
                      statusFilter === option
                        ? "bg-[#123429] text-[#e4c784]"
                        : "bg-[#f2f3ef] text-[#64736c] hover:text-[#a67a30]"
                    )}
                  >
                    {option === "ALL" ? "All" : option.charAt(0) + option.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredPosts.length ? (
            <div className="divide-y divide-[#17362b]/7">
              {filteredPosts.map((entry) => (
                <article
                  key={entry.id}
                  className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-[#fafaf7] sm:flex-row sm:items-center"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#edf2ee]">
                    {text(entry.data?.coverUrl || entry.data?.imageUrl) ? (
                      <Image
                        src={text(entry.data?.coverUrl || entry.data?.imageUrl)}
                        alt={entry.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#a67a30]">
                        <FilePlus2 className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#1b342a]">
                        {entry.title}
                      </h3>
                      <StatusPill status={entry.status} />
                      {text(entry.data?.category) ? (
                        <span className="rounded-full bg-[#edf2ee] px-2 py-0.5 text-[8px] font-medium text-[#5e7168]">
                          {text(entry.data?.category)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-[#7a8781]">
                      /blog/{entry.slug ?? entry.key} · Updated{" "}
                      {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.slug ? (
                      <Link
                        href={`/blog/${entry.slug}`}
                        target="_blank"
                        aria-label={`Preview ${entry.title}`}
                        className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => duplicate(entry)}
                      aria-label={`Duplicate ${entry.title}`}
                      className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditor(entry)}
                      aria-label={`Edit ${entry.title}`}
                      className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(entry)}
                      aria-label={`Delete ${entry.title}`}
                      className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <FilePlus2 className="mx-auto size-8 text-[#aab2ae]" />
              <h3 className="font-display mt-4 text-xl font-semibold text-[#243b32]">
                No posts found
              </h3>
              <p className="mt-2 text-sm text-[#7a8781]">
                {entries.length
                  ? "Adjust the search or status filter."
                  : "Create your first blog post to begin."}
              </p>
            </div>
          )}
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="orbit-panel mt-7 rounded-2xl p-6 sm:p-8">
          <h3 className="font-display text-2xl font-semibold text-[#10251e]">
            Categories
          </h3>
          <p className="mt-2 text-sm text-[#62716b]">
            Manage journal categories used when assigning posts.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {settings.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-2 rounded-full border border-[#17362b]/12 bg-white px-4 py-2 text-xs font-medium text-[#294138]"
              >
                <FolderOpen className="size-3.5 text-[#a67a30]" />
                {cat}
                <button
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({
                      ...s,
                      categories: s.categories.filter((c) => c !== cat),
                    }));
                    setSettingsDirty(true);
                  }}
                  className="text-[#7a8781] hover:text-red-600"
                  aria-label={`Remove ${cat}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="h-12 min-w-[220px] flex-1 rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm outline-none focus:border-[#c4943c]/50"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <button
              type="button"
              onClick={addCategory}
              className="orbit-gold-button h-12 rounded-xl px-6 text-[10px] font-semibold tracking-[0.16em] uppercase"
            >
              Add category
            </button>
          </div>
          {settingsDirty ? (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={settingsSaving}
                className="orbit-gold-button flex h-12 items-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-50"
              >
                <Save className="size-4" />
                {settingsSaving ? "Saving…" : "Save categories"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "tags" ? (
        <section className="orbit-panel mt-7 rounded-2xl p-6 sm:p-8">
          <h3 className="font-display text-2xl font-semibold text-[#10251e]">
            Tags
          </h3>
          <p className="mt-2 text-sm text-[#62716b]">
            All tags currently used across published and draft posts.
          </p>
          {allTags.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-[#17362b]/12 bg-white px-4 py-2 text-xs font-medium text-[#294138]"
                >
                  <Tag className="size-3.5 text-[#a67a30]" />
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-[#7a8781]">
              No tags yet — add tags when editing a post.
            </p>
          )}
        </section>
      ) : null}

      {tab === "media" ? (
        <section className="orbit-panel mt-7 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#10251e]">
                Blog Media
              </h3>
              <p className="mt-2 text-sm text-[#62716b]">
                Images used in blog posts. Upload via the media library or when
                editing a post.
              </p>
            </div>
            <Link
              href="/orbit/media-library"
              className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 px-5 text-[10px] font-semibold tracking-[0.14em] text-[#4f645a] uppercase hover:border-[#c4943c]/40 hover:text-[#a67a30]"
            >
              <ImageIcon className="size-4" /> Open Media Library
            </Link>
          </div>
          {mediaAssets.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {mediaAssets.map((item) => (
                <div
                  key={item.url}
                  className="overflow-hidden rounded-xl border border-[#17362b]/10 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-[#edf0ec]">
                    <Image
                      src={item.url}
                      alt={item.alt || "Blog media"}
                      fill
                      className="object-cover"
                      sizes="240px"
                      unoptimized={item.url.startsWith("/media/")}
                    />
                  </div>
                  <p className="truncate p-3 text-xs text-[#52665c]">
                    {item.alt || "Untitled"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-dashed border-[#17362b]/15 bg-[#fafaf7] px-6 py-16 text-center">
              <ImageIcon className="mx-auto size-10 text-[#a8b0ac]" />
              <p className="mt-3 text-sm text-[#7a8781]">
                No blog media yet. Add cover images when editing posts.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {tab === "seo" ? (
        <section className="orbit-panel mt-7 space-y-6 rounded-2xl p-6 sm:p-8">
          <div>
            <h3 className="font-display text-2xl font-semibold text-[#10251e]">
              Blog Index SEO
            </h3>
            <p className="mt-2 text-sm text-[#62716b]">
              Page-level SEO for the blog listing at /blog.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <OrbitInput
              label="Meta title"
              value={settings.metaTitle}
              onChange={(v) => {
                setSettings((s) => ({ ...s, metaTitle: v }));
                setSettingsDirty(true);
              }}
            />
            <OrbitInput
              label="Canonical URL"
              value={settings.canonicalUrl}
              onChange={(v) => {
                setSettings((s) => ({ ...s, canonicalUrl: v }));
                setSettingsDirty(true);
              }}
            />
          </div>
          <OrbitTextarea
            label="Meta description"
            value={settings.metaDescription}
            onChange={(v) => {
              setSettings((s) => ({ ...s, metaDescription: v }));
              setSettingsDirty(true);
            }}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <OrbitInput
              label="OG title"
              value={settings.ogTitle}
              onChange={(v) => {
                setSettings((s) => ({ ...s, ogTitle: v }));
                setSettingsDirty(true);
              }}
            />
            <OrbitInput
              label="OG description"
              value={settings.ogDescription}
              onChange={(v) => {
                setSettings((s) => ({ ...s, ogDescription: v }));
                setSettingsDirty(true);
              }}
            />
          </div>
          <MediaField
            label="OG image"
            folder="blog"
            value={{
              assetId: settings.ogImageAssetId,
              url: settings.ogImageUrl || null,
              alt: settings.ogTitle,
              kind: "IMAGE",
            }}
            onChange={(next) => {
              setSettings((s) => ({
                ...s,
                ogImageUrl: withMediaCacheBust(next.url),
                ogImageAssetId: next.assetId,
              }));
              setSettingsDirty(true);
            }}
            onClear={() => {
              setSettings((s) => ({
                ...s,
                ogImageUrl: "",
                ogImageAssetId: null,
              }));
              setSettingsDirty(true);
            }}
          />
          <ToggleField
            label="Noindex blog index"
            help="When enabled, search engines are asked not to index /blog."
            checked={settings.noindex}
            onChange={(checked) => {
              setSettings((s) => ({ ...s, noindex: checked }));
              setSettingsDirty(true);
            }}
          />
          <div className="flex justify-end gap-3 border-t border-[#17362b]/8 pt-6">
            <button
              type="button"
              onClick={() => {
                setSettings(structuredClone(savedSettings));
                setSettingsDirty(false);
              }}
              className="h-12 rounded-xl border border-[#17362b]/12 px-6 text-[10px] font-semibold tracking-[0.16em] uppercase"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={settingsSaving || !settingsDirty}
              className="orbit-gold-button flex h-12 items-center gap-2 rounded-xl px-7 text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-50"
            >
              <Save className="size-4" />
              {settingsSaving ? "Saving…" : "Save SEO settings"}
            </button>
          </div>
        </section>
      ) : null}

      {form ? (
        <div className="fixed inset-0 z-[70] flex justify-end bg-[#06100c]/55 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close editor"
            onClick={() => {
              if (
                dirty &&
                !window.confirm("You have unsaved changes. Discard them?")
              )
                return;
              setForm(null);
              setDirty(false);
            }}
            className="absolute inset-0"
          />
          <aside className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden bg-[#f8f7f2] shadow-2xl">
            <div className="shrink-0 border-b border-[#17362b]/9 bg-[#f8f7f2]/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-6 py-5 sm:px-8">
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.25em] text-[#a67a30] uppercase">
                    {form.id ? "Edit post" : "New post"}
                    {dirty ? " · Unsaved" : ""}
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
                    {form.title || "Untitled post"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      dirty &&
                      !window.confirm("You have unsaved changes. Discard them?")
                    )
                      return;
                    setForm(null);
                    setDirty(false);
                  }}
                  className="grid size-10 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e] hover:border-[#c4943c]/40 hover:text-[#a67a30]"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="space-y-8">
                <CoverPreview
                  form={form}
                  onChange={(partial) => patchForm(partial)}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <OrbitInput
                    label="Title"
                    required
                    value={form.title}
                    onChange={(v) =>
                      patchForm({
                        title: v,
                        slug: form.slug || slugify(v),
                        metaTitle: form.metaTitle || v,
                        ogTitle: form.ogTitle || v,
                      })
                    }
                  />
                  <OrbitInput
                    label="Subtitle"
                    value={form.subtitle}
                    onChange={(v) => patchForm({ subtitle: v })}
                  />
                  <OrbitInput
                    label="Slug"
                    value={form.slug}
                    onChange={(v) => patchForm({ slug: slugify(v) })}
                  />
                  <OrbitInput
                    label="Excerpt"
                    value={form.excerpt}
                    onChange={(v) => patchForm({ excerpt: v })}
                  />
                </div>

                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                    Body
                  </span>
                  <RichTextEditor
                    value={form.html}
                    onChange={(html) => patchForm({ html })}
                  />
                </label>

                <OrbitTextarea
                  label="Raw HTML / markdown note"
                  help="Internal reference or paste raw HTML. Not rendered on the public site unless synced to Body above."
                  value={form.rawNote}
                  onChange={(v) => patchForm({ rawNote: v })}
                  rows={5}
                />

                <GallerySection
                  gallery={form.gallery}
                  onChange={(gallery) => patchForm({ gallery })}
                  onAdd={() => setGalleryPickerOpen(true)}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <OrbitInput
                    label="Featured image alt"
                    value={form.coverAlt}
                    onChange={(v) =>
                      patchForm({ coverAlt: v, imageAlt: v })
                    }
                  />
                  <OrbitInput
                    label="Featured image caption"
                    value={form.coverCaption}
                    onChange={(v) =>
                      patchForm({ coverCaption: v, imageCaption: v })
                    }
                  />
                  <OrbitInput
                    label="Author name"
                    value={form.authorName}
                    onChange={(v) => patchForm({ authorName: v })}
                  />
                  <OrbitInput
                    label="Author role"
                    value={form.authorRole}
                    onChange={(v) => patchForm({ authorRole: v })}
                  />
                  <label>
                    <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                      Category
                    </span>
                    <select
                      value={form.category}
                      onChange={(e) => patchForm({ category: e.target.value })}
                      className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50"
                    >
                      {settings.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>
                  <OrbitInput
                    label="Tags (comma separated)"
                    value={form.tags}
                    onChange={(v) => patchForm({ tags: v })}
                  />
                  <OrbitInput
                    label="Related post slugs"
                    value={form.relatedPostSlugs}
                    onChange={(v) => patchForm({ relatedPostSlugs: v })}
                  />
                  <OrbitInput
                    label="Reading time"
                    value={form.readingTime}
                    onChange={(v) => patchForm({ readingTime: v })}
                  />
                  <OrbitInput
                    label="Publish date"
                    type="date"
                    value={form.publishDate}
                    onChange={(v) => patchForm({ publishDate: v })}
                  />
                  <label>
                    <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                      Status
                    </span>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        patchForm({
                          status: e.target.value as BlogEntry["status"],
                        })
                      }
                      className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </label>
                  {form.status === "SCHEDULED" ? (
                    <OrbitInput
                      label="Schedule publish at"
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(v) => patchForm({ scheduledAt: v })}
                    />
                  ) : null}
                </div>

                <div className="rounded-2xl border border-[#17362b]/10 bg-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
                        SEO
                      </p>
                      <h3 className="font-display mt-1 text-xl font-semibold text-[#10251e]">
                        Search & social
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                        SEO score
                      </p>
                      <p
                        className={cn(
                          "font-display text-3xl font-semibold",
                          seoScore >= 70
                            ? "text-emerald-700"
                            : seoScore >= 40
                              ? "text-[#a67a30]"
                              : "text-red-600"
                        )}
                      >
                        {seoScore}
                        <span className="text-base text-[#7a8781]">/100</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <OrbitInput
                      label="Meta title"
                      value={form.metaTitle}
                      onChange={(v) => patchForm({ metaTitle: v })}
                    />
                    <OrbitInput
                      label="Focus keyword"
                      value={form.focusKeyword}
                      onChange={(v) => patchForm({ focusKeyword: v })}
                    />
                    <div className="sm:col-span-2">
                      <OrbitTextarea
                        label="Meta description"
                        value={form.metaDescription}
                        onChange={(v) => patchForm({ metaDescription: v })}
                        rows={3}
                      />
                    </div>
                    <OrbitInput
                      label="Canonical URL"
                      value={form.canonicalUrl}
                      onChange={(v) => patchForm({ canonicalUrl: v })}
                    />
                    <OrbitInput
                      label="OG title"
                      value={form.ogTitle}
                      onChange={(v) => patchForm({ ogTitle: v })}
                    />
                    <OrbitInput
                      label="OG description"
                      value={form.ogDescription}
                      onChange={(v) => patchForm({ ogDescription: v })}
                    />
                    <MediaField
                      label="OG image"
                      folder="blog"
                      value={{
                        url: form.ogImageUrl || form.coverUrl || null,
                        alt: form.ogTitle,
                        kind: "IMAGE",
                      }}
                      onChange={(next) =>
                        patchForm({ ogImageUrl: withMediaCacheBust(next.url) })
                      }
                      onClear={() => patchForm({ ogImageUrl: "" })}
                    />
                    <label>
                      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                        Twitter card
                      </span>
                      <select
                        value={form.twitterCard}
                        onChange={(e) =>
                          patchForm({ twitterCard: e.target.value })
                        }
                        className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm outline-none focus:border-[#c4943c]/50"
                      >
                        {TWITTER_CARDS.map((card) => (
                          <option key={card} value={card}>
                            {card}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="sm:col-span-2">
                      <OrbitTextarea
                        label="Schema JSON-LD"
                        help="Optional structured data override for this post."
                        value={form.schemaJson}
                        onChange={(v) => patchForm({ schemaJson: v })}
                        rows={4}
                      />
                    </div>
                    <ToggleField
                      label="Noindex this post"
                      checked={form.noindex}
                      onChange={(checked) => patchForm({ noindex: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#17362b]/9 bg-[#f8f7f2]/95 px-6 py-5 sm:px-8">
              <div className="flex flex-wrap justify-end gap-2">
                {form.slug ? (
                  <Link
                    href={`/blog/${form.slug}`}
                    target="_blank"
                    className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
                  >
                    <ExternalLink className="size-3.5" /> Preview
                  </Link>
                ) : null}
                {form.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const entry = entries.find((e) => e.id === form.id);
                      if (entry) void duplicate(entry);
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
                  >
                    <Copy className="size-3.5" /> Duplicate
                  </button>
                ) : null}
                {form.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const entry = entries.find((e) => e.id === form.id);
                      if (entry) void remove(entry);
                      setForm(null);
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void savePost("DRAFT")}
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
                >
                  <Archive className="size-3.5" /> Save draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date();
                    next.setDate(next.getDate() + 1);
                    void savePost("SCHEDULED", {
                      status: "SCHEDULED",
                      scheduledAt:
                        form.scheduledAt || next.toISOString().slice(0, 16),
                    });
                  }}
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
                >
                  <Calendar className="size-3.5" /> Schedule
                </button>
                <button
                  type="button"
                  onClick={() => void savePost("PUBLISHED")}
                  disabled={saving}
                  className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-50"
                >
                  <Save className="size-3.5" />
                  {saving ? "Saving…" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => void savePost()}
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#123429] px-5 text-[10px] font-semibold tracking-[0.16em] text-[#e4c784] uppercase disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </aside>

          <MediaPicker
            open={galleryPickerOpen}
            onClose={() => setGalleryPickerOpen(false)}
            kind="IMAGE"
            folder="blog"
            title="Add gallery image"
            onSelect={(asset) => {
              patchForm({
                gallery: [
                  ...form.gallery,
                  {
                    url: withMediaCacheBust(asset.url),
                    alt: asset.alt || asset.originalName,
                    assetId: asset.id,
                  },
                ],
              });
              setGalleryPickerOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function CoverPreview({
  form,
  onChange,
}: {
  form: PostForm;
  onChange: (partial: Partial<PostForm>) => void;
}) {
  const src = form.coverUrl || form.imageUrl;
  return (
    <div className="space-y-4 rounded-2xl border border-[#17362b]/10 bg-[#f7f8f5] p-5">
      <p className="text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        Cover image
      </p>
      <div className="relative aspect-[21/9] overflow-hidden rounded-[10px] border border-[#17362b]/10 bg-gradient-to-br from-[#e8ece7] to-[#d5ddd6]">
        {src ? (
          <Image
            key={src}
            src={src}
            alt={form.coverAlt || form.title || "Cover"}
            fill
            className="object-cover"
            sizes="900px"
            unoptimized={src.startsWith("/media/")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#6d7c74]">
            <ImageIcon className="size-10 opacity-60" />
            <p className="text-sm font-medium">No cover image</p>
          </div>
        )}
      </div>
      <MediaField
        label="Replace / Upload cover"
        folder="blog"
        value={{
          assetId: form.coverAssetId,
          url: src || null,
          alt: form.coverAlt,
          kind: "IMAGE",
        }}
        onChange={(next) =>
          onChange({
            coverUrl: withMediaCacheBust(next.url),
            coverAlt: next.alt || form.coverAlt,
            coverAssetId: next.assetId,
            imageUrl: withMediaCacheBust(next.url),
            imageAlt: next.alt || form.coverAlt,
            mediaAssetId: next.assetId,
            ogImageUrl: form.ogImageUrl || withMediaCacheBust(next.url),
          })
        }
        onClear={() =>
          onChange({
            coverUrl: "",
            coverAssetId: null,
            imageUrl: "",
            mediaAssetId: null,
          })
        }
      />
    </div>
  );
}

function GallerySection({
  gallery,
  onChange,
  onAdd,
}: {
  gallery: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#17362b]/10 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
            Gallery
          </p>
          <p className="mt-1 text-xs text-[#7a8781]">
            Additional images for the post body or carousel.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-10 items-center gap-2 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
        >
          <Plus className="size-3.5" /> Add image
        </button>
      </div>
      {gallery.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {gallery.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="overflow-hidden rounded-xl border border-[#17362b]/10"
            >
              <div className="relative aspect-[16/10] bg-[#edf0ec]">
                <Image
                  src={item.url}
                  alt={item.alt || "Gallery"}
                  fill
                  className="object-cover"
                  sizes="320px"
                  unoptimized={item.url.startsWith("/media/")}
                />
              </div>
              <div className="space-y-2 p-3">
                <input
                  value={item.alt}
                  onChange={(e) => {
                    const next = [...gallery];
                    next[index] = { ...item, alt: e.target.value };
                    onChange(next);
                  }}
                  placeholder="Alt text"
                  className="h-9 w-full rounded-lg border border-[#17362b]/10 px-3 text-xs outline-none focus:border-[#c4943c]/50"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange(gallery.filter((_, i) => i !== index))
                  }
                  className="text-[10px] font-semibold tracking-[0.12em] text-red-700 uppercase"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[#7a8781]">No gallery images yet.</p>
      )}
    </div>
  );
}

function OrbitInput({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label} {required ? <span className="text-[#a67a30]">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50"
      />
    </label>
  );
}

function OrbitTextarea({
  label,
  value,
  onChange,
  help,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label}
      </span>
      {help ? <p className="mb-2 text-xs text-[#7b8982]">{help}</p> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm leading-relaxed text-[#203b30] outline-none focus:border-[#c4943c]/50"
      />
    </label>
  );
}

function ToggleField({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#17362b]/10 bg-[#fafaf7] px-5 py-4">
      <span>
        <span className="block text-sm font-semibold text-[#294138]">
          {label}
        </span>
        {help ? (
          <span className="mt-1 block text-xs text-[#7b8982]">{help}</span>
        ) : null}
      </span>
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

function StatusPill({ status }: { status: BlogEntry["status"] }) {
  const classes = {
    DRAFT: "bg-[#eef0ed] text-[#62716b]",
    SCHEDULED: "bg-blue-50 text-blue-700",
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    ARCHIVED: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[8px] font-semibold tracking-[0.13em]",
        classes[status]
      )}
    >
      {status}
    </span>
  );
}

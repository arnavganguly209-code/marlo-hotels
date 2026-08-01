"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MediaField, MediaPicker } from "@/components/orbit/media-picker";
import {
  PageCoverEditor,
  syncPageCoverPlacement,
  type PageCoverValue,
} from "@/components/orbit/page-cover-editor";
import { useToast } from "@/components/orbit/toast";
import type {
  GalleryImageEntry,
  GalleryPageContent,
} from "@/lib/gallery-content";
import { withMediaCacheBust } from "@/lib/media-cache";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

/** Ensure All leads the list and names are unique (case-insensitive). */
function normalizeCategories(list: string[]): string[] {
  const seen = new Set<string>();
  const rest: string[] = [];
  for (const raw of list) {
    const name = normalizeCategoryName(raw);
    if (!name) continue;
    const key = name.toLowerCase();
    if (key === "all" || seen.has(key)) continue;
    seen.add(key);
    rest.push(name);
  }
  return ["All", ...rest];
}

export function GalleryStudioEditor({
  initialContent,
}: {
  initialContent: GalleryPageContent;
}) {
  const { push } = useToast();
  const [content, setContent] = useState(() =>
    clone({
      ...initialContent,
      categories: normalizeCategories(initialContent.categories),
    })
  );
  const [saved, setSaved] = useState(() =>
    clone({
      ...initialContent,
      categories: normalizeCategories(initialContent.categories),
    })
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const categoryOptions = useMemo(
    () => content.categories.filter((item) => item !== "All"),
    [content.categories]
  );

  function patchContent(
    updater: (current: GalleryPageContent) => GalleryPageContent
  ) {
    setContent((current) => updater(current));
    setDirty(true);
  }

  function updateCover(next: PageCoverValue) {
    patchContent((current) => ({
      ...current,
      cover: {
        ...current.cover,
        src: next.src,
        alt: next.alt,
        assetId: next.assetId ?? null,
        eyebrow: next.eyebrow || "",
        title: next.title || "",
        description: next.description || "",
      },
    }));
  }

  function updateImage(id: string, patch: Partial<GalleryImageEntry>) {
    patchContent((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.id === id ? { ...image, ...patch } : image
      ),
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    patchContent((current) => {
      const next = [...current.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, images: next };
    });
  }

  function addCategory() {
    const name = normalizeCategoryName(newCategory);
    if (!name) {
      push("Enter a category name.", "warning");
      return;
    }
    if (name.toLowerCase() === "all") {
      push('"All" is reserved for the public filter.', "warning");
      return;
    }
    if (
      content.categories.some((item) => item.toLowerCase() === name.toLowerCase())
    ) {
      push("That category already exists.", "warning");
      return;
    }
    patchContent((current) => ({
      ...current,
      categories: normalizeCategories([...current.categories, name]),
    }));
    setNewCategory("");
    push(`Category “${name}” added — Save & Publish to go live.`, "success");
  }

  function startEditCategory(category: string) {
    if (category === "All") return;
    setEditingCategory(category);
    setEditDraft(category);
  }

  function commitEditCategory() {
    if (!editingCategory) return;
    const nextName = normalizeCategoryName(editDraft);
    if (!nextName) {
      push("Category name cannot be empty.", "warning");
      return;
    }
    if (nextName.toLowerCase() === "all") {
      push('"All" is reserved.', "warning");
      return;
    }
    const clash = content.categories.some(
      (item) =>
        item !== editingCategory &&
        item.toLowerCase() === nextName.toLowerCase()
    );
    if (clash) {
      push("That category already exists.", "warning");
      return;
    }

    const from = editingCategory;
    patchContent((current) => ({
      ...current,
      categories: normalizeCategories(
        current.categories.map((item) => (item === from ? nextName : item))
      ),
      images: current.images.map((image) =>
        image.category === from ? { ...image, category: nextName } : image
      ),
    }));
    setEditingCategory(null);
    setEditDraft("");
  }

  function removeCategory(category: string) {
    if (category === "All") return;
    const inUse = content.images.filter(
      (image) => image.category === category
    ).length;
    const fallback =
      categoryOptions.find((item) => item !== category) || "Rooms";
    const message =
      inUse > 0
        ? `Remove “${category}”? ${inUse} image${inUse === 1 ? "" : "s"} will move to “${fallback}".`
        : `Remove category “${category}”?`;
    if (!window.confirm(message)) return;

    patchContent((current) => ({
      ...current,
      categories: normalizeCategories(
        current.categories.filter((item) => item !== category)
      ),
      images: current.images.map((image) =>
        image.category === category ? { ...image, category: fallback } : image
      ),
    }));
  }

  function moveCategory(category: string, direction: -1 | 1) {
    if (category === "All") return;
    patchContent((current) => {
      const rest = current.categories.filter((item) => item !== "All");
      const index = rest.indexOf(category);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= rest.length) return current;
      [rest[index], rest[target]] = [rest[target], rest[index]];
      return {
        ...current,
        categories: normalizeCategories(["All", ...rest]),
      };
    });
  }

  async function deleteImage(image: GalleryImageEntry) {
    if (!window.confirm("Delete this image permanently?")) return;
    setDeletingId(image.id);
    patchContent((current) => ({
      ...current,
      images: current.images.filter((item) => item.id !== image.id),
    }));
    if (image.assetId) {
      await fetch(`/api/orbit/media/${image.assetId}?hard=1`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => undefined);
    }
    setDeletingId(null);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...content,
        categories: normalizeCategories(content.categories),
      };
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "gallery",
          key: "page-content",
          title: "Gallery Page",
          status: "PUBLISHED",
          data: payload,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        if (response.status === 401) {
          push("Session expired — please sign in again.", "error");
          window.setTimeout(() => {
            window.location.href =
              "/orbit?reason=session-expired&next=/orbit/gallery";
          }, 600);
          return;
        }
        push(result.error || "Save failed", "error");
        return;
      }
      await syncPageCoverPlacement({
        key: "page.gallery.hero",
        label: "Gallery Page Hero",
        cover: {
          src: payload.cover.src,
          alt: payload.cover.alt,
          assetId: payload.cover.assetId,
        },
      });
      setContent(payload);
      setSaved(clone(payload));
      setDirty(false);
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      push("Network Error — could not save the gallery page.", "error");
    } finally {
      setSaving(false);
    }
  }

  const coverValue: PageCoverValue = {
    src: content.cover.src,
    alt: content.cover.alt,
    assetId: content.cover.assetId,
    eyebrow: content.cover.eyebrow,
    title: content.cover.title,
    description: content.cover.description,
  };

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col bg-[#f6f7f4]">
      <header className="flex flex-col gap-4 border-b border-[#17362b]/10 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between xl:px-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Orbit · Website
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#10251e] xl:text-4xl">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-[#62716b]">
            Full-page visual editor for the public Gallery — cover, categories
            and every image.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/gallery"
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
              setEditingCategory(null);
              setNewCategory("");
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

      <div className="orbit-scrollbar flex-1 overflow-y-auto px-4 py-8 sm:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-6xl space-y-10">
          <PageCoverEditor
            label="Gallery Cover"
            value={coverValue}
            onChange={updateCover}
          />

          <section className="overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-sm">
            <div className="border-b border-[#17362b]/8 px-5 py-4">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
                Categories
              </p>
              <p className="mt-1 text-sm text-[#62716b]">
                Create, rename, reorder or remove filter pills on the public
                gallery. “All” is always first and cannot be removed.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCategory();
                    }
                  }}
                  placeholder="New category name (e.g. Spa, Pool)"
                  className="h-11 flex-1 rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm outline-none focus:border-[#c9a24a]"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="orbit-gold-button flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase"
                >
                  <Plus className="size-4" /> Add Category
                </button>
              </div>

              <ul className="divide-y divide-[#17362b]/8 rounded-xl border border-[#17362b]/10">
                {content.categories.map((category, index) => {
                  const isAll = category === "All";
                  const isEditing = editingCategory === category;
                  const restIndex = index - 1;
                  const restCount = categoryOptions.length;
                  const imageCount = content.images.filter(
                    (image) => image.category === category
                  ).length;

                  return (
                    <li
                      key={category}
                      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                              value={editDraft}
                              autoFocus
                              onChange={(event) =>
                                setEditDraft(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitEditCategory();
                                }
                                if (event.key === "Escape") {
                                  setEditingCategory(null);
                                  setEditDraft("");
                                }
                              }}
                              className="h-10 w-full max-w-sm rounded-xl border border-[#17362b]/12 px-3 text-sm outline-none focus:border-[#c9a24a]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={commitEditCategory}
                                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#17362b] px-3 text-[10px] font-semibold tracking-[0.12em] text-white uppercase"
                              >
                                <Check className="size-3.5" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(null);
                                  setEditDraft("");
                                }}
                                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#17362b]/12 px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
                              >
                                <X className="size-3.5" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="rounded-full border border-[#17362b]/12 bg-[#f6f7f4] px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#294138] uppercase">
                              {category}
                            </span>
                            {isAll ? (
                              <span className="text-[11px] text-[#8a9690]">
                                System filter · always shown
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#8a9690]">
                                {imageCount} image{imageCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isAll && !isEditing ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Move ${category} up`}
                            disabled={restIndex <= 0}
                            onClick={() => moveCategory(category, -1)}
                            className="grid size-9 place-items-center rounded-lg border border-[#17362b]/12 disabled:opacity-30"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${category} down`}
                            disabled={restIndex >= restCount - 1}
                            onClick={() => moveCategory(category, 1)}
                            className="grid size-9 place-items-center rounded-lg border border-[#17362b]/12 disabled:opacity-30"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditCategory(category)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#17362b]/12 px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
                          >
                            <Pencil className="size-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-semibold tracking-[0.12em] text-red-700 uppercase"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#10251e]">
                  Gallery Images
                </h2>
                <p className="mt-1 text-sm text-[#62716b]">
                  {content.images.length} image
                  {content.images.length === 1 ? "" : "s"} · Replace,
                  recategorize, reorder or delete.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase"
              >
                <Plus className="size-4" /> Add New Image
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.images.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-[#e8ebe6]">
                    {image.src ? (
                      <Image
                        key={image.src}
                        src={image.src}
                        alt={image.alt || "Gallery image"}
                        fill
                        sizes="480px"
                        className="object-cover"
                        unoptimized={image.src.startsWith("/media/")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#7d8c84]">
                        <ImagePlus className="size-8" />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <MediaField
                      label="Replace image"
                      kind="IMAGE"
                      folder="gallery"
                      value={{
                        assetId: image.assetId,
                        url: image.src,
                        alt: image.alt,
                        kind: "IMAGE",
                      }}
                      onChange={(next) =>
                        updateImage(image.id, {
                          assetId: next.assetId,
                          src: withMediaCacheBust(next.url),
                          alt: next.alt || image.alt,
                        })
                      }
                    />
                    <label className="block">
                      <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                        Category
                      </span>
                      <select
                        value={
                          categoryOptions.includes(image.category)
                            ? image.category
                            : categoryOptions[0] || ""
                        }
                        onChange={(event) =>
                          updateImage(image.id, {
                            category: event.target.value,
                          })
                        }
                        className="h-10 w-full rounded-xl border border-[#17362b]/12 bg-white px-3 text-sm"
                      >
                        {categoryOptions.length ? (
                          categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))
                        ) : (
                          <option value="">Add a category first</option>
                        )}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                        Alt text
                      </span>
                      <input
                        value={image.alt}
                        onChange={(event) =>
                          updateImage(image.id, { alt: event.target.value })
                        }
                        className="h-10 w-full rounded-xl border border-[#17362b]/12 bg-white px-3 text-sm"
                      />
                    </label>
                    <div className="flex items-center justify-between gap-2 border-t border-[#17362b]/8 pt-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          className="grid size-9 place-items-center rounded-lg border border-[#17362b]/12 disabled:opacity-30"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === content.images.length - 1}
                          className="grid size-9 place-items-center rounded-lg border border-[#17362b]/12 disabled:opacity-30"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={deletingId === image.id}
                        onClick={() => void deleteImage(image)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[10px] font-semibold tracking-[0.12em] text-red-700 uppercase disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />
                        {deletingId === image.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!content.images.length ? (
                <div className="col-span-full rounded-2xl border border-dashed border-[#17362b]/15 bg-white px-6 py-16 text-center text-sm text-[#7b8982]">
                  No gallery images yet. Add one to get started.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        kind="IMAGE"
        title="Add gallery image"
        folder="gallery"
        onSelect={(asset) => {
          if (!categoryOptions.length) {
            push(
              "Add at least one category before uploading images.",
              "warning"
            );
            return;
          }
          const entry: GalleryImageEntry = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            src: withMediaCacheBust(asset.url),
            alt: asset.alt || asset.originalName,
            category: categoryOptions[0],
            assetId: asset.id,
          };
          patchContent((current) => ({
            ...current,
            images: [...current.images, entry],
          }));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

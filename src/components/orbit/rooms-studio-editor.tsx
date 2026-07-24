"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MediaField, MediaPicker } from "@/components/orbit/media-picker";
import {
  ROOM_CATALOG,
  type RoomCatalogData,
} from "@/lib/orbit/room-defaults";
import { cn, formatCurrency } from "@/lib/utils";

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

type GalleryItem = { src: string; alt: string; assetId?: string | null };

function asData(entry: Entry): RoomCatalogData {
  const seed = ROOM_CATALOG.find(
    (item) => item.key === entry.key || item.slug === entry.slug
  );
  const base = seed?.data;
  const data = entry.data || {};
  const number = (key: keyof RoomCatalogData, fallback: number) => {
    const value = data[key];
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : fallback;
  };
  const text = (key: keyof RoomCatalogData, fallback: string) => {
    const value = data[key];
    return typeof value === "string" ? value : fallback;
  };
  const gallery = Array.isArray(data.gallery)
    ? (data.gallery as GalleryItem[]).filter((item) => item?.src)
    : base?.gallery || [];

  return {
    roomType: (text("roomType", base?.roomType || "Room") as "Room" | "Suite"),
    subheading: text("subheading", base?.subheading || ""),
    shortDescription: text("shortDescription", base?.shortDescription || ""),
    description: text("description", base?.description || ""),
    price: number("price", base?.price ?? 0),
    currency: text("currency", base?.currency || "USD"),
    breakfastPrice: number("breakfastPrice", base?.breakfastPrice ?? 5),
    inventory: number("inventory", base?.inventory ?? 0),
    includedAdults: number("includedAdults", base?.includedAdults ?? 2),
    includedChildren: number("includedChildren", base?.includedChildren ?? 0),
    extraAdultPrice: number("extraAdultPrice", base?.extraAdultPrice ?? 5),
    extraChildPrice: number("extraChildPrice", base?.extraChildPrice ?? 5),
    available: data.available !== false,
    featured: data.featured === true,
    sortOrder: number("sortOrder", base?.sortOrder ?? 100),
    maxGuests: number("maxGuests", base?.maxGuests ?? 4),
    beds: text("beds", base?.beds || ""),
    floorSize: text("floorSize", base?.floorSize || ""),
    floor: text("floor", base?.floor || ""),
    view: text("view", base?.view || ""),
    amenities: text("amenities", base?.amenities || ""),
    facilities: text("facilities", base?.facilities || ""),
    policies: text("policies", base?.policies || ""),
    cancellationPolicy: text(
      "cancellationPolicy",
      base?.cancellationPolicy || ""
    ),
    checkIn: text("checkIn", base?.checkIn || "2:00 PM"),
    checkOut: text("checkOut", base?.checkOut || "12:00 PM"),
    buttonText: text("buttonText", base?.buttonText || "Book Now"),
    buttonLink: text(
      "buttonLink",
      base?.buttonLink || `/rooms/${entry.slug || entry.key}`
    ),
    imageUrl: text("imageUrl", base?.imageUrl || ""),
    imageAlt: text("imageAlt", base?.imageAlt || entry.title),
    mediaAssetId:
      typeof data.mediaAssetId === "string" ? data.mediaAssetId : null,
    gallery,
    metaTitle: text("metaTitle", base?.metaTitle || entry.title),
    metaDescription: text(
      "metaDescription",
      base?.metaDescription || ""
    ),
  };
}

export function RoomsStudioEditor({
  initialEntries,
}: {
  initialEntries: Entry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [selectedId, setSelectedId] = useState(initialEntries[0]?.id || "");
  const selected = entries.find((entry) => entry.id === selectedId) || entries[0];
  const [title, setTitle] = useState(selected?.title || "");
  const [slug, setSlug] = useState(selected?.slug || "");
  const [status, setStatus] = useState<Entry["status"]>(
    selected?.status || "PUBLISHED"
  );
  const [data, setData] = useState<RoomCatalogData>(
    selected ? asData(selected) : ROOM_CATALOG[0].data
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title);
    setSlug(selected.slug || "");
    setStatus(selected.status);
    setData(asData(selected));
    setSaved(false);
    setError(null);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        const orderA = Number((a.data as { sortOrder?: number }).sortOrder ?? 100);
        const orderB = Number((b.data as { sortOrder?: number }).sortOrder ?? 100);
        return orderA - orderB || a.title.localeCompare(b.title);
      }),
    [entries]
  );

  function patchData(partial: Partial<RoomCatalogData>) {
    setData((current) => ({ ...current, ...partial }));
    setSaved(false);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/orbit/content/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || selected.title,
          slug: slug.trim() || selected.slug,
          status,
          data: {
            ...data,
            available: status === "PUBLISHED" ? data.available : false,
            buttonLink: `/rooms/${slug.trim() || selected.slug}`,
          },
          seo: {
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
          },
        }),
      });
      const result = (await response.json()) as { entry?: Entry; error?: string };
      if (!response.ok || !result.entry) {
        setError(result.error || "Save failed");
        setSaving(false);
        return;
      }
      setEntries((current) =>
        current.map((entry) =>
          entry.id === result.entry!.id
            ? {
                ...entry,
                ...result.entry!,
                data: result.entry!.data as Record<string, unknown>,
              }
            : entry
        )
      );
      setSaved(true);
    } catch {
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  async function createRoom() {
    const key = `room-${Date.now()}`;
    const response = await fetch("/api/orbit/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: "rooms",
        key,
        title: "New Room",
        slug: key,
        status: "DRAFT",
        data: {
          ...ROOM_CATALOG[0].data,
          sortOrder: 999,
          available: false,
          buttonLink: `/rooms/${key}`,
          metaTitle: "New Room",
        },
      }),
    });
    const result = (await response.json()) as { entry?: Entry };
    if (response.ok && result.entry) {
      setEntries((current) => [...current, result.entry!]);
      setSelectedId(result.entry.id);
    }
  }

  async function duplicateRoom() {
    if (!selected) return;
    const response = await fetch(`/api/orbit/content/${selected.id}`, {
      method: "POST",
    });
    const result = (await response.json()) as { entry?: Entry };
    if (response.ok && result.entry) {
      setEntries((current) => [...current, result.entry!]);
      setSelectedId(result.entry.id);
    }
  }

  async function deleteRoom() {
    if (!selected) return;
    if (!window.confirm(`Delete “${selected.title}”? This cannot be undone.`)) {
      return;
    }
    const response = await fetch(`/api/orbit/content/${selected.id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setEntries((current) => {
      const next = current.filter((entry) => entry.id !== selected.id);
      setSelectedId(next[0]?.id || "");
      return next;
    });
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const next = [...data.gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    patchData({ gallery: next });
  }

  if (!selected) {
    return (
      <div className="p-8">
        <p className="text-sm text-[#62716b]">No rooms yet.</p>
        <button
          type="button"
          onClick={() => void createRoom()}
          className="orbit-gold-button mt-4 h-11 rounded-xl px-5 text-[10px] font-semibold tracking-[0.16em] uppercase"
        >
          Create first room
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[640px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--orbit-border)] bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Rooms CMS
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#10251e]">
            Room Inventory
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void createRoom()}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[#17362b]/12 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
          >
            <Plus className="size-3.5" /> New
          </button>
          <button
            type="button"
            onClick={() => void duplicateRoom()}
            className="flex h-10 items-center rounded-xl border border-[#17362b]/12 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => void deleteRoom()}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] text-red-700 uppercase"
          >
            <Trash2 className="size-3.5" /> Delete
          </button>
          <Link
            href={`/rooms/${slug || selected.slug}`}
            target="_blank"
            className="flex h-10 items-center rounded-xl border border-[#17362b]/12 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
          >
            Preview
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="orbit-gold-button flex h-10 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : saved ? (
              <Check className="size-3.5" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saving ? "Saving…" : saved ? "Saved" : "Save & Publish"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="orbit-scrollbar overflow-y-auto border-r border-[var(--orbit-border)] bg-[#f7f8f5]">
          <div className="p-3">
            {sorted.map((entry) => {
              const preview = asData(entry);
              const active = entry.id === selected.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={cn(
                    "mb-2 flex w-full gap-3 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-[#123429] bg-[#123429] text-[#f0d999]"
                      : "border-transparent bg-white text-[#294138] hover:border-[#c4943c]/40"
                  )}
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#e8ebe6]">
                    {preview.imageUrl ? (
                      <Image
                        src={preview.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={preview.imageUrl.startsWith("/media/")}
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#a8b0ac]">
                        <ImagePlus className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{entry.title}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px] tracking-[0.12em] uppercase",
                        active ? "text-[#e4c784]/80" : "text-[#7b8982]"
                      )}
                    >
                      {formatCurrency(preview.price, preview.currency)} ·{" "}
                      {entry.status}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px]",
                        active ? "text-[#e4c784]/70" : "text-[#8a968f]"
                      )}
                    >
                      Inv {preview.inventory} · {preview.includedAdults}A /{" "}
                      {preview.includedChildren}C
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="orbit-scrollbar overflow-y-auto bg-[var(--orbit-bg)] p-5 sm:p-8">
          {error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mx-auto max-w-4xl space-y-8">
            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">Identity</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Room Name">
                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setSaved(false);
                    }}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setSaved(false);
                    }}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value as Entry["status"]);
                      setSaved(false);
                    }}
                    className={fieldClass}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft / Hidden</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field>
                <Field label="Room Type">
                  <select
                    value={data.roomType}
                    onChange={(event) =>
                      patchData({
                        roomType: event.target.value as "Room" | "Suite",
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="Room">Room</option>
                    <option value="Suite">Suite</option>
                  </select>
                </Field>
              </div>
              <label className="flex items-center justify-between rounded-xl border border-[#17362b]/10 bg-white px-4 py-3 text-sm">
                Featured on homepage suites
                <input
                  type="checkbox"
                  checked={data.featured}
                  onChange={(event) =>
                    patchData({ featured: event.target.checked })
                  }
                />
              </label>
            </div>

            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">Media</h2>
              <MediaField
                label="Cover Image"
                value={{
                  assetId: data.mediaAssetId,
                  url: data.imageUrl || null,
                  alt: data.imageAlt,
                  kind: "IMAGE",
                }}
                onChange={(next) =>
                  patchData({
                    imageUrl: next.url,
                    imageAlt: next.alt || title,
                    mediaAssetId: next.assetId,
                  })
                }
              />
              {data.imageUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    patchData({ imageUrl: "", mediaAssetId: null })
                  }
                  className="text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                >
                  Delete cover image
                </button>
              ) : null}

              <div className="pt-2">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    Gallery Images
                  </p>
                  <button
                    type="button"
                    onClick={() => setGalleryPickerOpen(true)}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-[#17362b]/12 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
                  >
                    <Plus className="size-3.5" /> Add image
                  </button>
                </div>
                <div className="space-y-2">
                  {data.gallery.map((item, index) => (
                    <div
                      key={`${item.src}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-[#17362b]/10 bg-white p-2"
                    >
                      <div className="relative size-16 overflow-hidden rounded-lg bg-[#edf0ec]">
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover"
                          unoptimized={item.src.startsWith("/media/")}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-[#53675e]">
                          {item.src}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => moveGallery(index, -1)}
                        className="grid size-8 place-items-center rounded-lg hover:bg-[#edf2ee]"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(index, 1)}
                        className="grid size-8 place-items-center rounded-lg hover:bg-[#edf2ee]"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchData({
                            gallery: data.gallery.filter((_, i) => i !== index),
                          })
                        }
                        className="grid size-8 place-items-center rounded-lg text-red-700 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {!data.gallery.length ? (
                    <p className="rounded-xl border border-dashed border-[#17362b]/15 px-4 py-8 text-center text-sm text-[#7b8982]">
                      No gallery images yet. Add from the Media Library.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">Copy</h2>
              <Field label="Tagline">
                <input
                  value={data.subheading}
                  onChange={(event) =>
                    patchData({ subheading: event.target.value })
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label="Short Description">
                <textarea
                  rows={3}
                  value={data.shortDescription}
                  onChange={(event) =>
                    patchData({ shortDescription: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
              <Field label="Room Description">
                <textarea
                  rows={6}
                  value={data.description}
                  onChange={(event) =>
                    patchData({ description: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Amenities (one per line)">
                  <textarea
                    rows={5}
                    value={data.amenities}
                    onChange={(event) =>
                      patchData({ amenities: event.target.value })
                    }
                    className={textareaClass}
                  />
                </Field>
                <Field label="Facilities (one per line)">
                  <textarea
                    rows={5}
                    value={data.facilities}
                    onChange={(event) =>
                      patchData({ facilities: event.target.value })
                    }
                    className={textareaClass}
                  />
                </Field>
              </div>
            </div>

            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">
                Pricing & Occupancy
              </h2>
              <p className="text-sm text-[#62716b]">
                Base price already includes the adults and children below. Extra
                guests are charged only when occupancy is exceeded.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Base Price (Without Breakfast)">
                  <input
                    type="number"
                    value={data.price}
                    onChange={(event) =>
                      patchData({ price: Number(event.target.value) || 0 })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Currency">
                  <input
                    value={data.currency}
                    onChange={(event) =>
                      patchData({ currency: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Inventory (available rooms)">
                  <input
                    type="number"
                    value={data.inventory}
                    onChange={(event) =>
                      patchData({ inventory: Number(event.target.value) || 0 })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Adults Included">
                  <input
                    type="number"
                    value={data.includedAdults}
                    onChange={(event) =>
                      patchData({
                        includedAdults: Number(event.target.value) || 0,
                      })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Children Included">
                  <input
                    type="number"
                    value={data.includedChildren}
                    onChange={(event) =>
                      patchData({
                        includedChildren: Number(event.target.value) || 0,
                      })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Breakfast / person / night">
                  <input
                    type="number"
                    value={data.breakfastPrice}
                    onChange={(event) =>
                      patchData({
                        breakfastPrice: Number(event.target.value) || 0,
                      })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Extra Adult Price / night">
                  <input
                    type="number"
                    value={data.extraAdultPrice}
                    onChange={(event) =>
                      patchData({
                        extraAdultPrice: Number(event.target.value) || 0,
                      })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Extra Child Price / night">
                  <input
                    type="number"
                    value={data.extraChildPrice}
                    onChange={(event) =>
                      patchData({
                        extraChildPrice: Number(event.target.value) || 0,
                      })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Sort Order">
                  <input
                    type="number"
                    value={data.sortOrder}
                    onChange={(event) =>
                      patchData({ sortOrder: Number(event.target.value) || 0 })
                    }
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>

            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Room Size">
                  <input
                    value={data.floorSize}
                    onChange={(event) =>
                      patchData({ floorSize: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Bed Type">
                  <input
                    value={data.beds}
                    onChange={(event) => patchData({ beds: event.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="View">
                  <input
                    value={data.view}
                    onChange={(event) => patchData({ view: event.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Floor">
                  <input
                    value={data.floor}
                    onChange={(event) =>
                      patchData({ floor: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Check-in">
                  <input
                    value={data.checkIn}
                    onChange={(event) =>
                      patchData({ checkIn: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Check-out">
                  <input
                    value={data.checkOut}
                    onChange={(event) =>
                      patchData({ checkOut: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Button Text">
                  <input
                    value={data.buttonText}
                    onChange={(event) =>
                      patchData({ buttonText: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Button Link">
                  <input
                    value={data.buttonLink}
                    onChange={(event) =>
                      patchData({ buttonLink: event.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
              </div>
              <Field label="Policies (one per line)">
                <textarea
                  rows={4}
                  value={data.policies}
                  onChange={(event) =>
                    patchData({ policies: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
              <Field label="Cancellation Policy">
                <textarea
                  rows={3}
                  value={data.cancellationPolicy}
                  onChange={(event) =>
                    patchData({ cancellationPolicy: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="orbit-panel space-y-4 rounded-2xl p-6">
              <h2 className="font-display text-xl text-[#10251e]">SEO</h2>
              <Field label="Meta Title">
                <input
                  value={data.metaTitle}
                  onChange={(event) =>
                    patchData({ metaTitle: event.target.value })
                  }
                  className={fieldClass}
                />
              </Field>
              <Field label="Meta Description">
                <textarea
                  rows={3}
                  value={data.metaDescription}
                  onChange={(event) =>
                    patchData({ metaDescription: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>
        </section>
      </div>

      <MediaPicker
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        kind="IMAGE"
        title="Add gallery image"
        onSelect={(asset) => {
          patchData({
            gallery: [
              ...data.gallery,
              {
                src: asset.url,
                alt: asset.alt || title,
                assetId: asset.id,
              },
            ],
          });
          setGalleryPickerOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-3.5 text-sm text-[#1b342a] outline-none focus:border-[#c4943c]/55";
const textareaClass =
  "mt-1.5 w-full rounded-xl border border-[#17362b]/12 bg-white px-3.5 py-2.5 text-sm text-[#1b342a] outline-none focus:border-[#c4943c]/55";

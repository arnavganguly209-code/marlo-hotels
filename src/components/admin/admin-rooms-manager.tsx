"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { normalizeRoomCatalogData, type RoomCatalogData } from "@/lib/orbit/room-defaults";

export type AdminRoomEntry = {
  id: string; module: string; key: string; title: string; slug: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | string;
  data: Record<string, unknown>; seo: Record<string, unknown> | null;
  scheduledAt: string | null; updatedAt: string;
};
type GalleryItem = { src: string; alt: string; assetId?: string | null };
type Form = { title: string; slug: string; status: string; data: RoomCatalogData; seo: Record<string, unknown> | null };
const labels: Record<string, string> = {
  basics: "Basics", pricing: "Pricing", occupancy: "Occupancy", details: "Details",
  features: "Features", media: "Images", booking: "Booking", seo: "SEO",
};
const sections = Object.keys(labels);

function dataFor(entry?: AdminRoomEntry): RoomCatalogData {
  return normalizeRoomCatalogData(entry?.data as Partial<RoomCatalogData>);
}
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function formFor(entry?: AdminRoomEntry): Form {
  const data = dataFor(entry);
  return { title: entry?.title || "", slug: entry?.slug || "", status: entry?.status || "DRAFT", data, seo: entry?.seo || null };
}
async function compress(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }) : file;
}

export function AdminRoomsManager({ initialEntries }: { initialEntries: AdminRoomEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = entries.find((entry) => entry.id === selectedId);
  const [form, setForm] = useState<Form>(() => formFor());
  const [tab, setTab] = useState("basics");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setForm(formFor(selected)); setTab("basics"); setError(""); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = useMemo(() => [...entries].sort((a, b) => Number(a.data.sortOrder ?? 100) - Number(b.data.sortOrder ?? 100)), [entries]);
  const patch = (value: Partial<RoomCatalogData>) => setForm((current) => ({ ...current, data: { ...current.data, ...value } }));
  const field = (key: keyof RoomCatalogData, label: string, type = "text") => {
    const raw = form.data[key];
    const value =
      raw === null || raw === undefined
        ? ""
        : typeof raw === "boolean"
          ? String(raw)
          : String(raw);
    return (
      <label className="grid gap-1 text-xs text-cream-200/70">
        <span>{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) =>
            patch({
              [key]:
                type === "number"
                  ? e.target.value === ""
                    ? null
                    : Number(e.target.value)
                  : e.target.value,
            } as Partial<RoomCatalogData>)
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory outline-none focus:border-[#D9B46B]"
        />
      </label>
    );
  };
  const toggle = (key: keyof RoomCatalogData, label: string) => (
    <label className="flex items-center gap-2 text-sm text-cream-200/80"><input type="checkbox" checked={Boolean(form.data[key])} onChange={(e) => patch({ [key]: e.target.checked } as Partial<RoomCatalogData>)} />{label}</label>
  );
  const move = (items: string[], index: number, direction: -1 | 1, key: "facilities" | "amenities" | "services") => {
    const next = [...items]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; patch({ [key]: next.join("\n") } as Partial<RoomCatalogData>);
  };
  const listEditor = (key: "facilities" | "amenities" | "services", title: string) => {
    const items = (form.data[key] || "").split("\n").map((item) => item.trim()).filter(Boolean);
    return <div className="rounded-xl border border-white/10 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-ivory">{title}</h3><button onClick={() => patch({ [key]: [...items, "New item"].join("\n") } as Partial<RoomCatalogData>)} className="text-xs text-[#D9B46B]">+ Add</button></div>
      <div className="space-y-2">{items.map((item, index) => <div key={`${item}-${index}`} className="flex gap-2"><input value={item} onChange={(e) => { const next = [...items]; next[index] = e.target.value; patch({ [key]: next.join("\n") } as Partial<RoomCatalogData>); }} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory" /><button onClick={() => move(items, index, -1, key)} aria-label="Move up"><ArrowUp size={15}/></button><button onClick={() => move(items, index, 1, key)} aria-label="Move down"><ArrowDown size={15}/></button><button onClick={() => patch({ [key]: items.filter((_, i) => i !== index).join("\n") } as Partial<RoomCatalogData>)} aria-label="Delete"><Trash2 size={15}/></button></div>)}</div>
    </div>;
  };
  async function upload(file: File) {
    const image = await compress(file); const body = new FormData(); body.append("file", image); body.append("alt", form.title);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || "Upload failed");
    return result.asset as { id: string; url: string; alt: string };
  }
  async function imageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    gallery = false,
    replaceIndex?: number
  ) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      if (gallery && replaceIndex === undefined) {
        const uploaded: GalleryItem[] = [];
        for (const file of files) {
          const asset = await upload(file);
          uploaded.push({ src: asset.url, alt: asset.alt, assetId: asset.id });
        }
        patch({ gallery: [...form.data.gallery, ...uploaded] });
      } else {
        const asset = await upload(files[0]);
        if (gallery) {
          const item = { src: asset.url, alt: asset.alt, assetId: asset.id };
          const next = [...form.data.gallery];
          if (replaceIndex === undefined) next.push(item);
          else next.splice(replaceIndex, 1, item);
          patch({ gallery: next });
        } else {
          patch({
            imageUrl: asset.url,
            imageAlt: asset.alt,
            mediaAssetId: asset.id,
          });
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      event.target.value = "";
    }
  }
  async function save(publish = false) {
    setSaving(true); setError("");
    try {
      if (!form.title.trim()) throw new Error("Room name is required");
      const roomStatus = publish
        ? "available"
        : form.data.roomStatus || "hidden";
      const slug = form.slug.trim() || slugify(form.title) || `room-${Date.now()}`;
      const payload = {
        title: form.title.trim(),
        slug,
        status: publish ? "PUBLISHED" : "DRAFT",
        seo: {
          ...(form.seo || {}),
          metaTitle: form.data.metaTitle,
          metaDescription: form.data.metaDescription,
          keywords: form.data.keywords,
          ogImage: form.data.ogImage,
        },
        data: {
          ...form.data,
          roomStatus,
          available: roomStatus === "available",
          buttonLink: `/rooms/${slug}`,
        },
      };
      const isNew = !selected;
      const response = await fetch(
        isNew ? "/api/admin/rooms" : `/api/admin/rooms/${selected.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save room");
      const entry = result.entry as AdminRoomEntry;
      setEntries((current) =>
        isNew
          ? [...current, entry]
          : current.map((item) => (item.id === entry.id ? entry : item))
      );
      setSelectedId(entry.id);
      setForm(formFor(entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save room");
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (!selected || !confirm(`Delete ${selected.title}?`)) return;
    const response = await fetch(`/api/admin/rooms/${selected.id}`, { method: "DELETE" });
    if (!response.ok) return setError("Could not delete room");
    setEntries((current) => current.filter((entry) => entry.id !== selected.id)); setSelectedId(null);
  }
  const gallery = form.data.gallery || [];
  return <div className="space-y-6">
    <div className="flex justify-end"><button onClick={() => setSelectedId("new")} className="inline-flex items-center gap-2 rounded-lg bg-[#D9B46B] px-4 py-2 text-sm font-semibold text-[#0B1713]"><Plus size={16}/> Create Room</button></div>
    <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="min-w-full text-left text-sm"><thead className="bg-white/[.04] text-[10px] tracking-[.18em] text-[#D9B46B] uppercase"><tr><th className="p-3">Room</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead><tbody className="divide-y divide-white/10">{sorted.map((entry) => { const data = dataFor(entry); return <tr key={entry.id} className="text-cream-200/80"><td className="p-3"><div className="flex items-center gap-3">{data.imageUrl ? <img src={data.imageUrl} alt="" className="h-10 w-14 rounded object-cover"/> : <div className="h-10 w-14 rounded bg-white/10"/>}<span>{entry.title}{data.featured && <em className="ml-2 rounded bg-[#D9B46B]/20 px-1.5 py-0.5 text-[10px] not-italic text-[#D9B46B]">Featured</em>}</span></div></td><td className="p-3">{data.roomType}</td><td className="p-3">{data.currency} {data.price}</td><td className="p-3 capitalize">{data.roomStatus}</td><td className="p-3"><button onClick={() => setSelectedId(entry.id)} className="rounded border border-[#D9B46B]/50 px-3 py-1 text-xs text-[#D9B46B]">Edit</button></td></tr>; })}</tbody></table></div>
    {selectedId && <div className="rounded-2xl border border-[#D9B46B]/30 bg-[#0B1713] shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs tracking-[.2em] text-[#D9B46B] uppercase">{selected ? "Edit room" : "New room"}</p><h2 className="mt-1 text-xl font-semibold text-ivory">{form.title || "Untitled room"}</h2></div><button onClick={() => setSelectedId(null)}><X className="text-cream-200/70"/></button></div>
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">{sections.map((section) => <button key={section} onClick={() => setTab(section)} className={`rounded px-3 py-1.5 text-xs ${tab === section ? "bg-[#D9B46B] text-[#0B1713]" : "text-cream-200/70"}`}>{labels[section]}</button>)}</div>
      <div className="p-5">{error && <p className="mb-4 rounded bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
        {tab === "basics" && <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-xs text-cream-200/70">Name<input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value, slug: v.slug || slugify(e.target.value) }))} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory"/></label><label className="grid gap-1 text-xs text-cream-200/70">Category<select value={form.data.roomType} onChange={(e) => patch({ roomType: e.target.value as "Room" | "Suite" })} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory"><option>Room</option><option>Suite</option></select></label>{field("subheading","Subtitle")}<label className="grid gap-1 text-xs text-cream-200/70">Status<select value={form.data.roomStatus} onChange={(e) => patch({ roomStatus: e.target.value as RoomCatalogData["roomStatus"] })} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory"><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="hidden">Hidden</option></select></label><label className="grid gap-1 text-xs text-cream-200/70 md:col-span-2">Short description<textarea value={form.data.shortDescription} onChange={(e) => patch({ shortDescription: e.target.value })} className="min-h-20 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-ivory"/></label><label className="grid gap-1 text-xs text-cream-200/70 md:col-span-2">Description<textarea value={form.data.description} onChange={(e) => patch({ description: e.target.value })} className="min-h-32 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-ivory"/></label>{field("sortOrder","Display order","number")}{toggle("featured","Feature this room")}</div>}
        {tab === "pricing" && <div className="grid gap-4 md:grid-cols-3">{field("price","Base price","number")}{field("discountPrice","Discount price","number")}{field("currency","Currency")}{field("weekdayPrice","Weekday price","number")}{field("weekendPrice","Weekend price","number")}{field("holidayPrice","Holiday price","number")}{field("breakfastPrice","Breakfast price","number")}</div>}
        {tab === "occupancy" && <div className="grid gap-4 md:grid-cols-3">{field("maxAdults","Maximum adults","number")}{field("maxChildren","Maximum children","number")}{field("maxGuests","Maximum guests","number")}{field("includedAdults","Included adults","number")}{field("includedChildren","Included children","number")}{field("inventory","Inventory","number")}{field("extraAdultPrice","Extra adult charge","number")}{field("extraChildPrice","Extra child charge","number")}</div>}
        {tab === "details" && <div className="grid gap-4 md:grid-cols-2">{field("floorSize","Size")}{field("beds","Bed")}{field("bathroom","Bathroom")}{field("floor","Floor")}{field("view","View")}</div>}
        {tab === "features" && <div className="grid gap-4 md:grid-cols-2">{listEditor("facilities","Features / facilities")}{listEditor("amenities","Amenities")}{listEditor("services","Services")}</div>}
        {tab === "media" && <div className="space-y-5"><div><p className="mb-2 text-sm font-semibold text-ivory">Featured image</p>{form.data.imageUrl && <div className="relative mb-2 h-48 max-w-md"><img src={form.data.imageUrl} alt={form.data.imageAlt} className="h-full w-full rounded-lg object-cover"/><button onClick={() => patch({ imageUrl: "", mediaAssetId: null })} className="absolute right-2 top-2 rounded bg-black/70 p-2"><Trash2 size={14}/></button></div>}<label className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#D9B46B]/60 px-3 py-2 text-sm text-[#D9B46B]"><Upload size={15}/> Upload<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => imageChange(e)} className="hidden"/></label></div><div><p className="mb-2 text-sm font-semibold text-ivory">Gallery</p><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{gallery.map((item,index) => <div key={`${item.src}-${index}`} className="relative"><img src={item.src} alt={item.alt} className="aspect-[3/2] w-full rounded object-cover"/><div className="absolute inset-x-1 bottom-1 flex flex-wrap justify-between gap-1"><button type="button" title="Move up" onClick={() => { const next=[...gallery]; if(index){[next[index-1],next[index]]=[next[index],next[index-1]];patch({gallery:next});}}} className="rounded bg-black/70 p-1"><ArrowUp size={14}/></button><button type="button" title="Set featured" onClick={() => patch({ imageUrl: item.src, imageAlt: item.alt || form.title, mediaAssetId: item.assetId || null })} className="rounded bg-black/70 px-1.5 text-[9px] tracking-wide text-[#D9B46B] uppercase">Featured</button><label className="cursor-pointer rounded bg-black/70 p-1"><Upload size={14}/><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(e)=>imageChange(e,true,index)} className="hidden"/></label><button type="button" title="Delete" onClick={() => patch({gallery:gallery.filter((_,i)=>i!==index)})} className="rounded bg-black/70 p-1"><Trash2 size={14}/></button><button type="button" title="Move down" onClick={() => { const next=[...gallery]; if(index<next.length-1){[next[index+1],next[index]]=[next[index],next[index+1]];patch({gallery:next});}}} className="rounded bg-black/70 p-1"><ArrowDown size={14}/></button></div></div>)}</div><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded border border-[#D9B46B]/60 px-3 py-2 text-sm text-[#D9B46B]"><Plus size={15}/> Add gallery images<input type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(e) => imageChange(e,true)} className="hidden"/></label></div></div>}
        {tab === "booking" && <div className="grid gap-4 md:grid-cols-3">{field("minStay","Minimum stay","number")}{field("maxStay","Maximum stay","number")}{toggle("bookingEnabled","Enable bookings")}</div>}
        {tab === "seo" && <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-xs text-cream-200/70">Slug<input value={form.slug} onChange={(e)=>setForm((v)=>({...v,slug:slugify(e.target.value)}))} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory"/></label>{field("metaTitle","Meta title")}<label className="grid gap-1 text-xs text-cream-200/70 md:col-span-2">Meta description<textarea value={form.data.metaDescription} onChange={(e)=>patch({metaDescription:e.target.value})} className="min-h-20 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-ivory"/></label>{field("keywords","Keywords")}<label className="grid gap-1 text-xs text-cream-200/70">OG image URL<input value={form.data.ogImage || ""} onChange={(e)=>patch({ogImage:e.target.value})} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-ivory"/></label></div>}
      </div><div className="flex flex-wrap items-center gap-3 border-t border-white/10 p-5"><button onClick={()=>save(false)} disabled={saving} className="inline-flex items-center gap-2 rounded border border-white/20 px-4 py-2 text-sm text-ivory"><Save size={16}/> Save Draft</button><button onClick={()=>save(true)} disabled={saving} className="inline-flex items-center gap-2 rounded bg-[#D9B46B] px-4 py-2 text-sm font-semibold text-[#0B1713]">{saving?<Loader2 className="animate-spin" size={16}/>:<Save size={16}/>} Publish</button>{form.slug && <Link href={`/rooms/${form.slug}`} target="_blank" className="text-sm text-[#D9B46B]">Preview</Link>}<button onClick={()=>setSelectedId(null)} className="text-sm text-cream-200/70">Cancel</button>{selected && <button onClick={remove} className="ml-auto inline-flex items-center gap-1 text-sm text-red-300"><Trash2 size={15}/> Delete</button>}</div>
    </div>}
  </div>;
}

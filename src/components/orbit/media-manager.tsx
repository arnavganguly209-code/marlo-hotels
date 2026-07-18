"use client";

import {
  Check,
  Copy,
  Folder,
  ImagePlus,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  folder: string;
  createdAt: string;
};

export function MediaManager({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const folders = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.folder))).sort(),
    [assets]
  );
  const filtered = useMemo(
    () =>
      assets.filter(
        (asset) =>
          (folder === "all" || asset.folder === folder) &&
          [asset.originalName, asset.alt, asset.caption]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(query.toLowerCase())
            )
      ),
    [assets, folder, query]
  );

  async function remove(ids: string[]) {
    if (!ids.length || !window.confirm(`Delete ${ids.length} media asset${ids.length === 1 ? "" : "s"}?`)) return;
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/orbit/media/${id}`, { method: "DELETE" }).then((response) => ({
          id,
          ok: response.ok,
        }))
      )
    );
    const removed = new Set(results.filter((result) => result.ok).map((result) => result.id));
    setAssets((current) => current.filter((asset) => !removed.has(asset.id)));
    setSelected([]);
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Asset management
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[#10251e]">
            Media Library
          </h2>
          <p className="mt-2 text-sm text-[#62716b]">
            Optimized, searchable hotel imagery with complete accessibility metadata.
          </p>
        </div>
        <button type="button" onClick={() => setUploadOpen(true)} className="orbit-gold-button flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.2em] uppercase">
          <UploadCloud className="size-4" /> Upload images
        </button>
      </div>

      <section className="orbit-panel mt-8 rounded-2xl p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#52665c]/40" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filename, alt text or caption…" className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] pr-4 pl-10 text-xs text-[#1b342a] outline-none focus:border-[#c4943c]/45" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFolder("all")} className={cn("rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase", folder === "all" ? "bg-[#123429] text-[#e4c784]" : "bg-[#f2f3ef] text-[#64736c]")}>
              All
            </button>
            {folders.map((name) => (
              <button key={name} type="button" onClick={() => setFolder(name)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase", folder === name ? "bg-[#123429] text-[#e4c784]" : "bg-[#f2f3ef] text-[#64736c]")}>
                <Folder className="size-3" /> {name}
              </button>
            ))}
            {selected.length ? (
              <button type="button" onClick={() => remove(selected)} className="ml-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[9px] font-semibold tracking-[0.13em] text-red-600 uppercase">
                <Trash2 className="size-3" /> Delete {selected.length}
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((asset) => {
              const checked = selected.includes(asset.id);
              return (
                <article key={asset.id} className={cn("group overflow-hidden rounded-xl border bg-white transition", checked ? "border-[#c4943c] ring-2 ring-[#c4943c]/20" : "border-[#17362b]/9 hover:border-[#c4943c]/35")}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#edf0ec]">
                    <Image src={asset.url} alt={asset.alt || asset.originalName} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <button type="button" aria-label={checked ? "Deselect asset" : "Select asset"} onClick={() => setSelected((current) => checked ? current.filter((id) => id !== asset.id) : [...current, asset.id])} className={cn("absolute top-3 left-3 grid size-7 place-items-center rounded-lg border backdrop-blur-md transition", checked ? "border-[#d0a654] bg-[#d0a654] text-[#10251e]" : "border-white/50 bg-black/25 text-transparent hover:text-white")}>
                      <Check className="size-4" />
                    </button>
                    <div className="absolute right-3 bottom-3 flex translate-y-2 gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <button type="button" onClick={() => navigator.clipboard.writeText(asset.url)} aria-label="Copy image URL" className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]">
                        <Copy className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditing(asset)} aria-label="Edit media metadata" className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]">
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => remove([asset.id])} aria-label="Delete media" className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-red-300">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-xs font-semibold text-[#243c32]">{asset.originalName}</p>
                    <p className="mt-1 truncate text-[10px] text-[#7d8983]">{asset.alt || "Alt text required"}</p>
                    <p className="mt-3 text-[9px] font-medium tracking-[0.1em] text-[#9a7a3d] uppercase">
                      {asset.width}×{asset.height} · {(asset.size / 1024).toFixed(0)} KB · {asset.folder}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <ImagePlus className="mx-auto size-10 text-[#a8b0ac]" />
            <h3 className="font-display mt-4 text-xl font-semibold text-[#243b32]">No media assets found</h3>
            <p className="mt-2 text-sm text-[#7a8781]">Upload an image or adjust the current filters.</p>
          </div>
        )}
      </section>

      {uploadOpen ? (
        <UploadDialog
          onClose={() => setUploadOpen(false)}
          onUploaded={(asset) => {
            setAssets((current) => [asset, ...current]);
            setUploadOpen(false);
          }}
        />
      ) : null}
      {editing ? (
        <MetadataDialog
          asset={editing}
          onClose={() => setEditing(null)}
          onSaved={(asset) => {
            setAssets((current) => current.map((item) => item.id === asset.id ? asset : item));
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function UploadDialog({ onClose, onUploaded }: { onClose: () => void; onUploaded: (asset: Asset) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState("general");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [crop, setCrop] = useState("original");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file || !alt.trim()) {
      setError("Choose an image and provide meaningful alt text.");
      return;
    }
    setPending(true);
    const body = new FormData();
    body.set("file", file);
    body.set("folder", folder);
    body.set("alt", alt);
    body.set("caption", caption);
    body.set("crop", crop);
    const response = await fetch("/api/orbit/media", { method: "POST", body });
    const result = (await response.json()) as { asset?: Asset; error?: string };
    setPending(false);
    if (!response.ok || !result.asset) {
      setError(result.error ?? "Upload failed.");
      return;
    }
    onUploaded(result.asset);
  }

  return (
    <Dialog title="Upload image" subtitle="Images are compressed, resized and converted to WebP." onClose={onClose}>
      <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#b7a06d] bg-[#faf8f1] text-center transition hover:bg-[#f5f0e3]">
        <UploadCloud className="size-8 text-[#a67a30]" />
        <span className="mt-3 text-sm font-semibold text-[#294138]">{file ? file.name : "Choose JPG, PNG, WebP or AVIF"}</span>
        <span className="mt-1 text-xs text-[#7a8781]">Maximum 15 MB</span>
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InputField label="Folder" value={folder} onChange={setFolder} />
        <label>
          <FieldLabel>Crop</FieldLabel>
          <select value={crop} onChange={(event) => setCrop(event.target.value)} className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none">
            <option value="original">Original ratio</option>
            <option value="1:1">Square 1:1</option>
            <option value="4:3">Landscape 4:3</option>
            <option value="16:9">Wide 16:9</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <InputField label="Alt text" value={alt} onChange={setAlt} required />
      </div>
      <div className="mt-4">
        <InputField label="Caption" value={caption} onChange={setCaption} />
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <DialogActions onClose={onClose} onSave={upload} pending={pending} saveLabel="Upload & optimize" />
    </Dialog>
  );
}

function MetadataDialog({ asset, onClose, onSaved }: { asset: Asset; onClose: () => void; onSaved: (asset: Asset) => void }) {
  const replaceRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(asset.alt);
  const [caption, setCaption] = useState(asset.caption ?? "");
  const [folder, setFolder] = useState(asset.folder);
  const [pending, setPending] = useState(false);
  const [replacement, setReplacement] = useState<File | null>(null);
  async function save() {
    setPending(true);
    let response: Response;
    if (replacement) {
      const body = new FormData();
      body.set("file", replacement);
      body.set("replaceId", asset.id);
      body.set("folder", folder);
      body.set("alt", alt);
      body.set("caption", caption);
      body.set("crop", "original");
      response = await fetch("/api/orbit/media", { method: "POST", body });
    } else {
      response = await fetch(`/api/orbit/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt, caption: caption || null, folder }),
      });
    }
    const result = (await response.json()) as { asset?: Asset };
    setPending(false);
    if (response.ok && result.asset) onSaved(result.asset);
  }
  return (
    <Dialog title="Media details" subtitle={asset.originalName} onClose={onClose}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#edf0ec]">
        <Image src={asset.url} alt={alt || asset.originalName} fill className="object-contain" />
      </div>
      <button type="button" onClick={() => replaceRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b7a06d] bg-[#faf8f1] px-4 py-3 text-xs font-semibold text-[#725a2c]">
        <UploadCloud className="size-4" />
        {replacement ? `Replace with ${replacement.name}` : "Replace image file"}
      </button>
      <input ref={replaceRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(event) => setReplacement(event.target.files?.[0] ?? null)} />
      <div className="mt-5 space-y-4">
        <InputField label="Alt text" value={alt} onChange={setAlt} required />
        <InputField label="Caption" value={caption} onChange={setCaption} />
        <InputField label="Folder" value={folder} onChange={setFolder} />
      </div>
      <DialogActions onClose={onClose} onSave={save} pending={pending} saveLabel="Save metadata" />
    </Dialog>
  );
}

function Dialog({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#06100c]/60 p-5 backdrop-blur-sm">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0" />
      <div className="relative my-auto w-full max-w-xl rounded-2xl bg-[#f8f7f2] p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e]">
          <X className="size-4" />
        </button>
        <p className="text-[9px] font-semibold tracking-[0.25em] text-[#a67a30] uppercase">Media Library</p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">{title}</h2>
        <p className="mt-1 mb-6 text-xs text-[#7a8781]">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function DialogActions({ onClose, onSave, pending, saveLabel }: { onClose: () => void; onSave: () => void; pending: boolean; saveLabel: string }) {
  return (
    <div className="mt-7 flex justify-end gap-3 border-t border-[#17362b]/8 pt-6">
      <button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#17362b]/12 px-5 text-[10px] font-semibold tracking-[0.15em] text-[#4f645a] uppercase">Cancel</button>
      <button type="button" onClick={onSave} disabled={pending} className="orbit-gold-button h-11 rounded-xl px-6 text-[10px] font-semibold tracking-[0.15em] uppercase disabled:opacity-50">{pending ? "Processing…" : saveLabel}</button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">{children}</span>;
}

function InputField({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <FieldLabel>{label}{required ? " *" : ""}</FieldLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50" />
    </label>
  );
}

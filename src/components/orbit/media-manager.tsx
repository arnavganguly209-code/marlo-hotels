"use client";

import {
  Check,
  Copy,
  Crop,
  Folder,
  ImagePlus,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageCropper } from "@/components/orbit/image-cropper";
import { useToast } from "@/components/orbit/toast";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  kind: "IMAGE" | "VIDEO";
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  title: string | null;
  caption: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  folder: string;
  checksum: string;
  focalX: number;
  focalY: number;
  posterUrl: string | null;
  currentVersion: number;
  deletedAt: string | null;
  createdAt: string;
  usageCount?: number;
  usedOn?: string[];
};

type UploadJob = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "done" | "error" | "cancelled";
  error?: string;
  preview?: string;
  xhr?: XMLHttpRequest;
};

export function MediaManager({ initialAssets }: { initialAssets: Asset[] }) {
  const { push } = useToast();
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [kind, setKind] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [unused, setUnused] = useState(false);
  const [trash, setTrash] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [folders, setFolders] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [cropping, setCropping] = useState<Asset | null>(null);
  const [heroOpen, setHeroOpen] = useState(false);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "48",
      sort,
    });
    if (folder !== "all") params.set("folder", folder);
    if (kind !== "ALL") params.set("kind", kind);
    if (query.trim()) params.set("query", query.trim());
    if (unused) params.set("unused", "1");
    if (trash) params.set("trash", "1");
    const response = await fetch(`/api/orbit/media?${params}`);
    if (!response.ok) {
      push("Server Error", "error");
      return;
    }
    const result = (await response.json()) as {
      assets: Asset[];
      folders: string[];
      totalPages: number;
      duplicateChecksums: string[];
    };
    setAssets(result.assets);
    setFolders(result.folders);
    setTotalPages(result.totalPages);
    setDuplicates(result.duplicateChecksums || []);
  }, [folder, kind, page, query, sort, trash, unused, push]);

  useEffect(() => {
    void load();
  }, [load]);

  function enqueueFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      const job: UploadJob = {
        id,
        file,
        progress: 0,
        status: "uploading",
        preview,
      };
      setJobs((current) => [job, ...current]);
      push("Uploading…", "info");
      const body = new FormData();
      body.set("file", file);
      body.set("folder", file.type.startsWith("video/") ? "video" : "general");
      body.set(
        "alt",
        file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 200)
      );
      const xhr = new XMLHttpRequest();
      job.xhr = xhr;
      xhr.open("POST", "/api/orbit/media");
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        setJobs((current) =>
          current.map((item) =>
            item.id === id ? { ...item, progress } : item
          )
        );
      };
      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText) as {
            asset?: Asset;
            error?: string;
            duplicate?: { originalName: string } | null;
            message?: string;
          };
          if (xhr.status >= 200 && xhr.status < 300 && result.asset) {
            setJobs((current) =>
              current.map((item) =>
                item.id === id
                  ? { ...item, progress: 100, status: "done" }
                  : item
              )
            );
            setAssets((current) => [result.asset!, ...current]);
            push(result.message || "Upload Successful", "success");
            if (result.duplicate) {
              push(
                `Duplicate detection: similar to “${result.duplicate.originalName}”`,
                "warning"
              );
            }
          } else {
            setJobs((current) =>
              current.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      status: "error",
                      error: result.error || "Upload Failed",
                    }
                  : item
              )
            );
            push(result.error || "Upload Failed", "error");
          }
        } catch {
          setJobs((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, status: "error", error: "Server Error" }
                : item
            )
          );
          push("Server Error", "error");
        }
      };
      xhr.onerror = () => {
        setJobs((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: "error", error: "Network Error" }
              : item
          )
        );
        push("Network Error", "error");
      };
      xhr.send(body);
    }
  }

  async function remove(ids: string[], hard = false) {
    if (!ids.length) return;
    if (
      !window.confirm(
        hard
          ? `Permanently delete ${ids.length} asset(s)?`
          : `Move ${ids.length} asset(s) to trash?`
      )
    ) {
      return;
    }
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`/api/orbit/media/${id}${hard ? "?hard=1" : ""}`, {
          method: "DELETE",
        }).then(async (response) => ({
          id,
          ok: response.ok,
          body: (await response.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
          },
        }))
      )
    );
    const removed = results.filter((item) => item.ok);
    if (removed.length) {
      push(removed[0]?.body.message || "Deleted Successfully", "success");
      setAssets((current) =>
        current.filter((asset) => !removed.some((item) => item.id === asset.id))
      );
      setSelected([]);
    }
    const failed = results.find((item) => !item.ok);
    if (failed) push(failed.body.error || "Server Error", "error");
  }

  async function restore(id: string) {
    const response = await fetch(`/api/orbit/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    const result = (await response.json()) as {
      asset?: Asset;
      error?: string;
      message?: string;
    };
    if (!response.ok || !result.asset) {
      push(result.error || "Server Error", "error");
      return;
    }
    push(result.message || "Restored Successfully", "success");
    setAssets((current) => current.filter((asset) => asset.id !== id));
  }

  async function setAsHero(asset: Asset) {
    const response = await fetch("/api/orbit/media/placements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "home.hero",
        label: "Homepage Hero",
        assetId: asset.id,
        mediaType: asset.kind,
        alt: asset.alt || "Marlo Hotels lobby and reception",
        focalX: asset.focalX ?? 50,
        focalY: asset.focalY ?? 45,
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      message?: string;
    };
    if (!response.ok) {
      push(result.error || "Server Error", "error");
      return;
    }
    push(result.message || "Changes Saved", "success");
    setHeroOpen(false);
  }

  const duplicateSet = useMemo(() => new Set(duplicates), [duplicates]);

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
            Original-quality uploads, folders, usage tracking, crop versions and
            instant site placements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHeroOpen(true)}
            className="h-12 rounded-xl border border-[#17362b]/12 bg-white px-5 text-[10px] font-semibold tracking-[0.16em] uppercase"
          >
            Set homepage hero
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="orbit-gold-button flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
          >
            <UploadCloud className="size-4" /> Upload media
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
        onChange={(event) => {
          if (event.target.files?.length) enqueueFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <section
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files?.length) {
            enqueueFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "orbit-panel mt-8 rounded-2xl p-5 transition",
          dragOver && "ring-2 ring-[#c4943c]/50"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#52665c]/40" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search filename, alt, title or caption…"
              className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] pr-4 pl-10 text-xs text-[#1b342a] outline-none focus:border-[#c4943c]/45"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={kind}
              onChange={(event) => {
                setPage(1);
                setKind(event.target.value);
              }}
              className="h-10 rounded-lg border border-[#17362b]/10 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
            >
              <option value="ALL">All types</option>
              <option value="IMAGE">Images</option>
              <option value="VIDEO">Videos</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-lg border border-[#17362b]/10 bg-white px-3 text-[10px] font-semibold tracking-[0.12em] uppercase"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setUnused((value) => !value);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase",
                unused ? "bg-[#123429] text-[#e4c784]" : "bg-[#f2f3ef] text-[#64736c]"
              )}
            >
              Unused
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setTrash((value) => !value);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase",
                trash ? "bg-red-700 text-white" : "bg-[#f2f3ef] text-[#64736c]"
              )}
            >
              Trash
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setFolder("all");
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase",
                folder === "all"
                  ? "bg-[#123429] text-[#e4c784]"
                  : "bg-[#f2f3ef] text-[#64736c]"
              )}
            >
              All folders
            </button>
            {folders.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setPage(1);
                  setFolder(name);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] uppercase",
                  folder === name
                    ? "bg-[#123429] text-[#e4c784]"
                    : "bg-[#f2f3ef] text-[#64736c]"
                )}
              >
                <Folder className="size-3" /> {name}
              </button>
            ))}
            {selected.length ? (
              <button
                type="button"
                onClick={() => remove(selected, trash)}
                className="ml-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[9px] font-semibold tracking-[0.13em] text-red-600 uppercase"
              >
                <Trash2 className="size-3" /> Delete {selected.length}
              </button>
            ) : null}
          </div>
        </div>

        {jobs.length ? (
          <div className="mt-5 space-y-2">
            {jobs.slice(0, 6).map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 rounded-xl border border-[#17362b]/8 bg-white px-3 py-2"
              >
                {job.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.preview}
                    alt=""
                    className="size-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid size-10 place-items-center rounded-lg bg-[#edf0ec] text-[#a67a30]">
                    <Video className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#243c32]">
                    {job.file.name}
                  </p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e8ebe7]">
                    <div
                      className="h-full bg-[#c4943c] transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[#7a8781]">
                    {job.status === "uploading"
                      ? `${job.progress}%`
                      : job.status === "done"
                        ? "Upload Successful"
                        : job.error || job.status}
                  </p>
                </div>
                {job.status === "uploading" ? (
                  <button
                    type="button"
                    onClick={() => {
                      job.xhr?.abort();
                      setJobs((current) =>
                        current.map((item) =>
                          item.id === job.id
                            ? { ...item, status: "cancelled" }
                            : item
                        )
                      );
                    }}
                    className="text-[10px] font-semibold tracking-[0.12em] text-[#7a8781] uppercase"
                  >
                    Cancel
                  </button>
                ) : null}
                {job.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => enqueueFiles([job.file])}
                    className="text-[10px] font-semibold tracking-[0.12em] text-[#a67a30] uppercase"
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {assets.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {assets.map((asset) => {
              const checked = selected.includes(asset.id);
              const isDuplicate = duplicateSet.has(asset.checksum);
              return (
                <article
                  key={asset.id}
                  className={cn(
                    "group overflow-hidden rounded-xl border bg-white transition",
                    checked
                      ? "border-[#c4943c] ring-2 ring-[#c4943c]/20"
                      : "border-[#17362b]/9 hover:border-[#c4943c]/35"
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#edf0ec]">
                    {asset.kind === "VIDEO" ? (
                      <video
                        src={asset.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={asset.url}
                        alt={asset.alt || asset.originalName}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        unoptimized={asset.url.startsWith("/media/")}
                      />
                    )}
                    <button
                      type="button"
                      aria-label={checked ? "Deselect asset" : "Select asset"}
                      onClick={() =>
                        setSelected((current) =>
                          checked
                            ? current.filter((id) => id !== asset.id)
                            : [...current, asset.id]
                        )
                      }
                      className={cn(
                        "absolute top-3 left-3 grid size-7 place-items-center rounded-lg border backdrop-blur-md transition",
                        checked
                          ? "border-[#d0a654] bg-[#d0a654] text-[#10251e]"
                          : "border-white/50 bg-black/25 text-transparent hover:text-white"
                      )}
                    >
                      <Check className="size-4" />
                    </button>
                    {isDuplicate ? (
                      <span className="absolute top-3 right-3 rounded-md bg-amber-500 px-2 py-1 text-[9px] font-semibold text-white uppercase">
                        Duplicate
                      </span>
                    ) : null}
                    <div className="absolute right-3 bottom-3 flex translate-y-2 gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            `${window.location.origin}${asset.url}`
                          );
                          push("URL copied", "success");
                        }}
                        aria-label="Copy image URL"
                        className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      {asset.kind === "IMAGE" && !trash ? (
                        <button
                          type="button"
                          onClick={() => setCropping(asset)}
                          aria-label="Crop image"
                          className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]"
                        >
                          <Crop className="size-3.5" />
                        </button>
                      ) : null}
                      {trash ? (
                        <button
                          type="button"
                          onClick={() => restore(asset.id)}
                          aria-label="Restore media"
                          className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]"
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditing(asset)}
                          aria-label="Edit media metadata"
                          className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-[#e1bd71]"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove([asset.id], trash)}
                        aria-label="Delete media"
                        className="grid size-8 place-items-center rounded-lg bg-[#0a1813]/80 text-white backdrop-blur-md hover:text-red-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-xs font-semibold text-[#243c32]">
                      {asset.originalName}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-[#7d8983]">
                      {asset.alt || "Alt text required"}
                    </p>
                    <p className="mt-3 text-[9px] font-medium tracking-[0.1em] text-[#9a7a3d] uppercase">
                      {asset.width || "—"}×{asset.height || "—"} ·{" "}
                      {(asset.size / 1024).toFixed(0)} KB ·{" "}
                      {asset.usageCount ?? 0} uses · {asset.folder}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <ImagePlus className="mx-auto size-10 text-[#a8b0ac]" />
            <h3 className="font-display mt-4 text-xl font-semibold text-[#243b32]">
              No media assets found
            </h3>
            <p className="mt-2 text-sm text-[#7a8781]">
              Drag & drop files here or upload to begin.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-[#7a8781]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-[#17362b]/10 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-[#17362b]/10 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {editing ? (
        <MetadataDialog
          asset={editing}
          onClose={() => setEditing(null)}
          onSaved={(asset) => {
            setAssets((current) =>
              current.map((item) => (item.id === asset.id ? asset : item))
            );
            setEditing(null);
            push("Changes Saved", "success");
          }}
          onSetHero={() => setAsHero(editing)}
        />
      ) : null}
      {cropping ? (
        <ImageCropper
          assetId={cropping.id}
          src={cropping.url}
          onClose={() => setCropping(null)}
          onSaved={() => void load()}
        />
      ) : null}
      {heroOpen ? (
        <HeroPicker
          assets={assets.filter((asset) => !asset.deletedAt)}
          onClose={() => setHeroOpen(false)}
          onSelect={setAsHero}
        />
      ) : null}
    </div>
  );
}

function HeroPicker({
  assets,
  onClose,
  onSelect,
}: {
  assets: Asset[];
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}) {
  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-[#06100c]/60 p-5 backdrop-blur-sm">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f8f7f2] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
              Homepage
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#10251e]">
              Set Hero media
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full border border-[#17362b]/10"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className="overflow-hidden rounded-xl border border-[#17362b]/10 bg-white text-left hover:border-[#c4943c]/50"
            >
              <div className="relative aspect-video bg-[#edf0ec]">
                {asset.kind === "VIDEO" ? (
                  <video src={asset.url} className="h-full w-full object-cover" muted />
                ) : (
                  <Image
                    src={asset.url}
                    alt={asset.alt || asset.originalName}
                    fill
                    className="object-cover"
                    unoptimized={asset.url.startsWith("/media/")}
                  />
                )}
              </div>
              <p className="truncate p-3 text-xs font-semibold">{asset.originalName}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetadataDialog({
  asset,
  onClose,
  onSaved,
  onSetHero,
}: {
  asset: Asset;
  onClose: () => void;
  onSaved: (asset: Asset) => void;
  onSetHero: () => void;
}) {
  const { push } = useToast();
  const replaceRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState(asset.alt);
  const [title, setTitle] = useState(asset.title ?? "");
  const [caption, setCaption] = useState(asset.caption ?? "");
  const [seoTitle, setSeoTitle] = useState(asset.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    asset.seoDescription ?? ""
  );
  const [folder, setFolder] = useState(asset.folder);
  const [focalX, setFocalX] = useState(asset.focalX ?? 50);
  const [focalY, setFocalY] = useState(asset.focalY ?? 50);
  const [pending, setPending] = useState(false);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [dirty, setDirty] = useState(false);

  async function save() {
    setPending(true);
    let response: Response;
    if (replacement) {
      push("Uploading…", "info");
      const body = new FormData();
      body.set("file", replacement);
      body.set("replaceId", asset.id);
      body.set("folder", folder);
      body.set("alt", alt);
      body.set("title", title);
      body.set("caption", caption);
      body.set("focalX", String(focalX));
      body.set("focalY", String(focalY));
      response = await fetch("/api/orbit/media", { method: "POST", body });
    } else {
      response = await fetch(`/api/orbit/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt,
          title: title || null,
          caption: caption || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          folder,
          focalX,
          focalY,
        }),
      });
    }
    const result = (await response.json()) as {
      asset?: Asset;
      error?: string;
      message?: string;
    };
    setPending(false);
    if (response.ok && result.asset) {
      push(result.message || "Changes Saved", "success");
      onSaved(result.asset);
    } else {
      push(result.error || "Server Error", "error");
    }
  }

  function requestClose() {
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) {
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#06100c]/60 p-5 backdrop-blur-sm">
      <button type="button" aria-label="Close dialog" onClick={requestClose} className="absolute inset-0" />
      <div className="relative my-auto w-full max-w-xl rounded-2xl bg-[#f8f7f2] p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={requestClose}
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e]"
        >
          <X className="size-4" />
        </button>
        <p className="text-[9px] font-semibold tracking-[0.25em] text-[#a67a30] uppercase">
          Media Library
        </p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
          Media details
        </h2>
        <p className="mt-1 mb-6 text-xs text-[#7a8781]">{asset.originalName}</p>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#edf0ec]">
          {asset.kind === "VIDEO" ? (
            <video
              src={asset.url}
              controls
              className="h-full w-full object-contain"
              poster={asset.posterUrl || undefined}
            />
          ) : (
            <Image
              src={asset.url}
              alt={alt || asset.originalName}
              fill
              className="object-contain"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
              unoptimized={asset.url.startsWith("/media/")}
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => replaceRef.current?.click()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b7a06d] bg-[#faf8f1] px-4 py-3 text-xs font-semibold text-[#725a2c]"
        >
          <UploadCloud className="size-4" />
          {replacement
            ? `Replace with ${replacement.name}`
            : "Replace media file"}
        </button>
        <input
          ref={replaceRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          hidden
          onChange={(event) => {
            setReplacement(event.target.files?.[0] ?? null);
            setDirty(true);
          }}
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Alt text"
            value={alt}
            onChange={(value) => {
              setAlt(value);
              setDirty(true);
            }}
          />
          <Field
            label="Title"
            value={title}
            onChange={(value) => {
              setTitle(value);
              setDirty(true);
            }}
          />
          <Field
            label="Caption"
            value={caption}
            onChange={(value) => {
              setCaption(value);
              setDirty(true);
            }}
          />
          <Field
            label="Folder"
            value={folder}
            onChange={(value) => {
              setFolder(value);
              setDirty(true);
            }}
          />
          <Field
            label="SEO title"
            value={seoTitle}
            onChange={(value) => {
              setSeoTitle(value);
              setDirty(true);
            }}
          />
          <Field
            label="SEO description"
            value={seoDescription}
            onChange={(value) => {
              setSeoDescription(value);
              setDirty(true);
            }}
          />
          <label className="block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
            Focal X ({focalX}%)
            <input
              type="range"
              min={0}
              max={100}
              value={focalX}
              onChange={(event) => {
                setFocalX(Number(event.target.value));
                setDirty(true);
              }}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
            Focal Y ({focalY}%)
            <input
              type="range"
              min={0}
              max={100}
              value={focalY}
              onChange={(event) => {
                setFocalY(Number(event.target.value));
                setDirty(true);
              }}
              className="mt-2 w-full"
            />
          </label>
        </div>
        <div className="mt-4 rounded-xl bg-[#edf2ee] px-4 py-3 text-xs text-[#52665c]">
          <p>
            <strong>File:</strong> {asset.filename}
          </p>
          <p>
            <strong>Dimensions:</strong> {asset.width || "—"}×{asset.height || "—"}
          </p>
          <p>
            <strong>Size:</strong> {(asset.size / 1024).toFixed(1)} KB
          </p>
          <p>
            <strong>Uploaded:</strong>{" "}
            {new Date(asset.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Used on:</strong>{" "}
            {asset.usedOn?.length ? asset.usedOn.join(", ") : "Unused"}
          </p>
          <p>
            <strong>Version:</strong> {asset.currentVersion}
          </p>
        </div>
        <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-[#17362b]/8 pt-6">
          <button
            type="button"
            onClick={onSetHero}
            className="h-11 rounded-xl border border-[#17362b]/12 px-5 text-[10px] font-semibold tracking-[0.15em] text-[#4f645a] uppercase"
          >
            Use as Hero
          </button>
          <button
            type="button"
            onClick={requestClose}
            className="h-11 rounded-xl border border-[#17362b]/12 px-5 text-[10px] font-semibold tracking-[0.15em] text-[#4f645a] uppercase"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="orbit-gold-button h-11 rounded-xl px-6 text-[10px] font-semibold tracking-[0.15em] uppercase disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50"
      />
    </label>
  );
}

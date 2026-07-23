"use client";

import {
  Check,
  ImagePlus,
  Search,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/orbit/toast";
import { cn } from "@/lib/utils";

export type PickerAsset = {
  id: string;
  url: string;
  originalName: string;
  alt: string;
  title: string | null;
  mimeType: string;
  kind: "IMAGE" | "VIDEO";
  width: number | null;
  height: number | null;
  size: number;
  durationMs?: number | null;
  folder: string;
  focalX?: number;
  focalY?: number;
  posterUrl?: string | null;
};

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: PickerAsset) => void;
  kind?: "IMAGE" | "VIDEO" | "ALL";
  title?: string;
};

export function MediaPicker({
  open,
  onClose,
  onSelect,
  kind = "ALL",
  title = "Select media",
}: MediaPickerProps) {
  const { push } = useToast();
  const [assets, setAssets] = useState<PickerAsset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      pageSize: "60",
      sort: "newest",
    });
    if (kind !== "ALL") params.set("kind", kind);
    if (query.trim()) params.set("query", query.trim());
    const response = await fetch(`/api/orbit/media?${params}`);
    const result = (await response.json()) as { assets?: PickerAsset[] };
    setAssets(result.assets ?? []);
    setLoading(false);
  }, [kind, query]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  function upload(file: File) {
    setUploading(true);
    setProgress(0);
    push("Uploading…", "info");
    const body = new FormData();
    body.set("file", file);
    body.set("folder", kind === "VIDEO" ? "video" : "general");
    body.set("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "/api/orbit/media");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      setUploading(false);
      xhrRef.current = null;
      try {
        const result = JSON.parse(xhr.responseText) as {
          asset?: PickerAsset;
          error?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && result.asset) {
          push(result.error ? "Upload Successful" : "Upload Successful", "success");
          setAssets((current) => [result.asset!, ...current]);
          onSelect(result.asset);
          onClose();
        } else {
          push(result.error || "Upload Failed", "error");
        }
      } catch {
        push("Server Error", "error");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      xhrRef.current = null;
      push("Network Error", "error");
    };
    xhr.send(body);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#06100c]/65 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Close picker" className="absolute inset-0" onClick={onClose} />
      <div className="relative flex h-[min(88vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#f8f7f2] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#17362b]/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
              Media Library
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#10251e]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[#17362b]/8 px-5 py-4 sm:px-6">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7a8781]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search media…"
              className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-white pr-4 pl-10 text-sm outline-none focus:border-[#c4943c]/50"
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-50"
          >
            <UploadCloud className="size-4" />
            {uploading ? `Uploading ${progress}%` : "Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={
              kind === "VIDEO"
                ? "video/mp4,video/webm"
                : kind === "IMAGE"
                  ? "image/jpeg,image/png,image/webp,image/avif"
                  : "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            }
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
              event.target.value = "";
            }}
          />
          {uploading ? (
            <button
              type="button"
              onClick={() => {
                xhrRef.current?.abort();
                setUploading(false);
                push("Upload cancelled", "warning");
              }}
              className="h-11 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
            >
              Cancel upload
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <p className="py-20 text-center text-sm text-[#7a8781]">Loading media…</p>
          ) : assets.length ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-xl border border-[#17362b]/10 bg-white text-left transition hover:border-[#c4943c]/50"
                >
                  <div className="relative aspect-[4/3] bg-[#edf0ec]">
                    {asset.kind === "VIDEO" ? (
                      <div className="grid h-full place-items-center text-[#a67a30]">
                        <Video className="size-8" />
                      </div>
                    ) : (
                      <Image
                        src={asset.url}
                        alt={asset.alt || asset.originalName}
                        fill
                        sizes="200px"
                        className="object-cover"
                        unoptimized={asset.url.startsWith("/media/")}
                      />
                    )}
                    <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-[#0a1813]/70 text-white opacity-0 transition group-hover:opacity-100">
                      <Check className="size-4" />
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-[#243c32]">
                      {asset.originalName}
                    </p>
                    <p className="mt-1 text-[10px] text-[#7d8983]">
                      {asset.kind} · {(asset.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <ImagePlus className="mx-auto size-10 text-[#a8b0ac]" />
              <p className="mt-3 text-sm text-[#7a8781]">No media found. Upload a file to continue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaField({
  label,
  value,
  onChange,
  kind = "IMAGE",
  required,
  help,
}: {
  label: string;
  value?: {
    assetId?: string | null;
    url?: string | null;
    alt?: string | null;
    kind?: "IMAGE" | "VIDEO";
  };
  onChange: (next: {
    assetId: string;
    url: string;
    alt: string;
    kind: "IMAGE" | "VIDEO";
    size?: number;
    width?: number | null;
    height?: number | null;
    durationMs?: number | null;
  }) => void;
  kind?: "IMAGE" | "VIDEO" | "ALL";
  required?: boolean;
  help?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label} {required ? <span className="text-[#a67a30]">*</span> : null}
      </span>
      {help ? <p className="mb-2 text-xs text-[#7b8982]">{help}</p> : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-4 overflow-hidden rounded-xl border border-[#17362b]/12 bg-white p-3 text-left transition hover:border-[#c4943c]/45"
        )}
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#edf0ec]">
          {value?.url ? (
            value.kind === "VIDEO" ? (
              <div className="grid h-full place-items-center text-[#a67a30]">
                <Video className="size-6" />
              </div>
            ) : (
              <Image
                src={value.url}
                alt={value.alt || label}
                fill
                className="object-cover"
                unoptimized={value.url.startsWith("/media/")}
              />
            )
          ) : (
            <div className="grid h-full place-items-center text-[#a8b0ac]">
              <ImagePlus className="size-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#294138]">
            {value?.url ? "Replace media" : "Choose from Media Library"}
          </p>
          <p className="mt-1 truncate text-xs text-[#7a8781]">
            {value?.url || "No media selected"}
          </p>
        </div>
      </button>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        onSelect={(asset) =>
          onChange({
            assetId: asset.id,
            url: asset.url,
            alt: asset.alt || asset.originalName,
            kind: asset.kind,
            size: asset.size,
            width: asset.width,
            height: asset.height,
            durationMs: asset.durationMs ?? null,
          })
        }
      />
    </div>
  );
}

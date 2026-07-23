"use client";

import { Save, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/components/orbit/toast";
import {
  VideoUploadDialog,
  type UploadedVideoAsset,
} from "@/components/orbit/video-upload-dialog";
import { withMediaCacheBust } from "@/lib/media-cache";

type JsonObject = Record<string, unknown>;

/**
 * Minimal Hero editor: one video — upload / replace / delete / preview / save.
 * No alt, focus, crop, poster, SEO, overlay, or multi-device uploads.
 */
export function SimpleHeroVideoPanel({
  value,
  set,
  onSave,
  saving,
  dirty,
}: {
  value: JsonObject;
  set: (key: string, next: unknown) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const { push } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const videoUrl = String(value.videoUrl || "");
  const videoAssetId = String(value.videoAssetId || "");

  async function applyVideo(asset: UploadedVideoAsset) {
    const previousId = videoAssetId;
    const busted = withMediaCacheBust(asset.url);
    set("mediaType", "VIDEO");
    set("videoUrl", busted);
    set("videoAssetId", asset.id);
    set("videoSizeBytes", asset.size ?? null);
    set("videoWidth", asset.width ?? null);
    set("videoHeight", asset.height ?? null);
    set("videoDurationMs", asset.durationMs ?? null);
    set("videoAutoplay", true);
    set("videoLoop", true);
    set("videoMuted", true);
    set("videoPlaysInline", true);
    set("mobileVideoUrl", "");
    set("mobileVideoAssetId", null);
    if (previousId && previousId !== asset.id) {
      void fetch(`/api/orbit/media/${previousId}`, { method: "DELETE" }).catch(
        () => undefined
      );
    }
    push("Video ready — click Save to publish live", "success");
  }

  async function deleteVideo() {
    if (!videoUrl && !videoAssetId) return;
    if (!window.confirm("Permanently delete this Hero video?")) return;
    setDeleting(true);
    const assetId = videoAssetId;
    set("videoUrl", "");
    set("videoAssetId", null);
    set("mobileVideoUrl", "");
    set("mobileVideoAssetId", null);
    set("videoSizeBytes", null);
    if (assetId) {
      try {
        const response = await fetch(`/api/orbit/media/${assetId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          push(body.error || "Delete failed", "error");
          setDeleting(false);
          return;
        }
      } catch {
        push("Delete failed", "error");
        setDeleting(false);
        return;
      }
    }
    setDeleting(false);
    push("Video deleted", "success");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold text-[var(--orbit-ink)]">
          Hero Video
        </h2>
        <p className="mt-2 text-sm text-[var(--orbit-muted)]">
          One MP4 for desktop, tablet and mobile. Upload → Preview → Save → live
          website updates instantly.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-black shadow-sm">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            className="aspect-video h-auto w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="metadata"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#0c1a15] text-[#ead39f] transition hover:bg-[#10251e]"
          >
            <UploadCloud className="size-10 opacity-80" />
            <span className="text-sm font-semibold tracking-[0.16em] uppercase">
              Upload Hero Video
            </span>
            <span className="text-xs text-white/45">MP4 · up to 120 MB</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          event.target.value = "";
          if (!file) return;
          setPendingFile(file);
          setDialogOpen(true);
        }}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-12 items-center gap-2 rounded-xl border border-[var(--orbit-border)] bg-white px-5 text-[11px] font-semibold tracking-[0.14em] uppercase"
        >
          <UploadCloud className="size-4" />
          {videoUrl ? "Replace Video" : "Upload Video"}
        </button>
        {videoUrl ? (
          <button
            type="button"
            disabled={deleting}
            onClick={() => void deleteVideo()}
            className="flex h-12 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-[11px] font-semibold tracking-[0.14em] text-red-700 uppercase disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {deleting ? "Deleting…" : "Delete Video"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="orbit-gold-button flex h-12 items-center gap-2 rounded-xl px-6 text-[11px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <VideoUploadDialog
        open={dialogOpen}
        file={pendingFile}
        folder="hero"
        onClose={() => {
          setDialogOpen(false);
          setPendingFile(null);
        }}
        onSuccess={(asset) => {
          void applyVideo(asset);
          setDialogOpen(false);
          setPendingFile(null);
        }}
      />
    </div>
  );
}

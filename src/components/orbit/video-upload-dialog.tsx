"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type UploadedVideoAsset = {
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
  posterUrl?: string | null;
};

const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const CHUNK_SIZE = 2 * 1024 * 1024;
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

type UploadError = {
  title: string;
  reason: string;
  httpStatus?: number;
  apiResponse?: string;
  technical?: string;
};

type ProgressState = {
  percent: number;
  loaded: number;
  total: number;
  speedBps: number;
  etaSec: number;
};

function formatBytes(value: number) {
  if (value >= 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(value / 1024).toFixed(0)} KB`;
}

function formatEta(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1) return "<1 second";
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s`;
}

function logUpload(scope: string, detail: unknown) {
  const payload = {
    scope,
    at: new Date().toISOString(),
    detail,
  };
  console.info("[Orbit Upload]", payload);
  try {
    const key = "orbit-upload-logs";
    const prev = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown[];
    sessionStorage.setItem(
      key,
      JSON.stringify([payload, ...prev].slice(0, 40))
    );
  } catch {
    // ignore storage failures
  }
}

export function VideoUploadDialog({
  open,
  file,
  folder = "video",
  onClose,
  onSuccess,
}: {
  open: boolean;
  file: File | null;
  folder?: string;
  onClose: () => void;
  onSuccess: (asset: UploadedVideoAsset) => void;
}) {
  const [phase, setPhase] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState<ProgressState>({
    percent: 0,
    loaded: 0,
    total: 0,
    speedBps: 0,
    etaSec: 0,
  });
  const [error, setError] = useState<UploadError | null>(null);
  const [copied, setCopied] = useState(false);
  const cancelledRef = useRef(false);
  const uploadIdRef = useRef<string | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (!open || !file) return;
    cancelledRef.current = false;
    void runUpload(file);
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, file]);

  async function runUpload(target: File) {
    setPhase("uploading");
    setError(null);
    setProgress({
      percent: 0,
      loaded: 0,
      total: target.size,
      speedBps: 0,
      etaSec: 0,
    });
    startedAtRef.current = Date.now();
    logUpload("start", {
      name: target.name,
      size: target.size,
      type: target.type,
    });

    if (target.size > MAX_VIDEO_BYTES) {
      fail({
        title: "Upload Failed",
        reason: "Maximum upload size exceeded",
        technical: `File is ${formatBytes(target.size)}; limit is 120 MB.`,
      });
      return;
    }

    const mime = target.type || "video/mp4";
    const allowed =
      mime === "video/mp4" ||
      mime === "video/webm" ||
      mime === "video/quicktime" ||
      /\.(mp4|webm|mov)$/i.test(target.name);
    if (!allowed) {
      fail({
        title: "Upload Failed",
        reason: "Unsupported video format",
        technical: `Received type “${mime || "unknown"}”. Use MP4, WebM, or MOV.`,
      });
      return;
    }

    try {
      const initBody = new FormData();
      initBody.set("phase", "init");
      initBody.set("originalName", target.name);
      initBody.set("mimeType", mime === "video/quicktime" ? "video/mp4" : mime);
      initBody.set("totalSize", String(target.size));
      initBody.set("folder", folder);
      initBody.set(
        "alt",
        target.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
      );

      logUpload("api.init.request", { size: target.size, mime });
      const initResponse = await fetch("/api/orbit/media/chunk", {
        method: "POST",
        body: initBody,
      });
      const initText = await initResponse.text();
      let initResult: { uploadId?: string; error?: string; code?: string } = {};
      try {
        initResult = JSON.parse(initText) as typeof initResult;
      } catch {
        initResult = {};
      }
      logUpload("api.init.response", {
        status: initResponse.status,
        body: initText.slice(0, 2000),
      });

      if (!initResponse.ok || !initResult.uploadId) {
        fail({
          title: "Upload Failed",
          reason: initResult.error || "Media API error",
          httpStatus: initResponse.status,
          apiResponse: initText.slice(0, 4000),
          technical: initResult.code || "INIT_FAILED",
        });
        return;
      }

      const uploadId = initResult.uploadId;
      uploadIdRef.current = uploadId;
      let offset = 0;

      while (offset < target.size) {
        if (cancelledRef.current) {
          await cancelSession(uploadId);
          return;
        }
        const end = Math.min(offset + CHUNK_SIZE, target.size);
        const chunk = target.slice(offset, end);
        const appendBody = new FormData();
        appendBody.set("phase", "append");
        appendBody.set("uploadId", uploadId);
        appendBody.set("chunk", chunk, `chunk-${offset}`);

        const appendResponse = await fetch("/api/orbit/media/chunk", {
          method: "POST",
          body: appendBody,
        });
        const appendText = await appendResponse.text();
        let appendResult: {
          received?: number;
          error?: string;
          code?: string;
        } = {};
        try {
          appendResult = JSON.parse(appendText) as typeof appendResult;
        } catch {
          appendResult = {};
        }

        if (!appendResponse.ok) {
          logUpload("api.append.error", {
            status: appendResponse.status,
            body: appendText.slice(0, 2000),
          });
          fail({
            title: "Upload Failed",
            reason: appendResult.error || "Storage write failed",
            httpStatus: appendResponse.status,
            apiResponse: appendText.slice(0, 4000),
            technical: appendResult.code || "APPEND_FAILED",
          });
          return;
        }

        offset = end;
        const elapsed = Math.max(0.001, (Date.now() - startedAtRef.current) / 1000);
        const speedBps = offset / elapsed;
        const remaining = target.size - offset;
        setProgress({
          percent: Math.round((offset / target.size) * 100),
          loaded: offset,
          total: target.size,
          speedBps,
          etaSec: remaining / Math.max(speedBps, 1),
        });
      }

      if (cancelledRef.current) {
        await cancelSession(uploadId);
        return;
      }

      const completeBody = new FormData();
      completeBody.set("phase", "complete");
      completeBody.set("uploadId", uploadId);
      logUpload("api.complete.request", { uploadId });
      const completeResponse = await fetch("/api/orbit/media/chunk", {
        method: "POST",
        body: completeBody,
      });
      const completeText = await completeResponse.text();
      let completeResult: {
        asset?: UploadedVideoAsset;
        error?: string;
        code?: string;
        message?: string;
      } = {};
      try {
        completeResult = JSON.parse(completeText) as typeof completeResult;
      } catch {
        completeResult = {};
      }
      logUpload("api.complete.response", {
        status: completeResponse.status,
        body: completeText.slice(0, 2000),
      });

      if (!completeResponse.ok || !completeResult.asset) {
        fail({
          title: "Upload Failed",
          reason:
            completeResult.error ||
            (completeResponse.status >= 500
              ? "500 Internal Server Error"
              : "Database update failed"),
          httpStatus: completeResponse.status,
          apiResponse: completeText.slice(0, 4000),
          technical: completeResult.code || "COMPLETE_FAILED",
        });
        return;
      }

      setProgress({
        percent: 100,
        loaded: target.size,
        total: target.size,
        speedBps: target.size / Math.max(0.001, (Date.now() - startedAtRef.current) / 1000),
        etaSec: 0,
      });
      setPhase("success");
      logUpload("success", { assetId: completeResult.asset.id });
      window.setTimeout(() => {
        onSuccess(completeResult.asset!);
      }, 900);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logUpload("exception", { message });
      fail({
        title: "Upload Failed",
        reason:
          message.includes("timeout") || message.includes("Timeout")
            ? "Server timeout"
            : "Network Error",
        technical: message,
      });
    }
  }

  async function cancelSession(uploadId: string) {
    const body = new FormData();
    body.set("phase", "cancel");
    body.set("uploadId", uploadId);
    await fetch("/api/orbit/media/chunk", { method: "POST", body }).catch(
      () => undefined
    );
    logUpload("cancelled", { uploadId });
  }

  function fail(next: UploadError) {
    setPhase("error");
    setError(next);
    logUpload("failure", next);
  }

  async function copyError() {
    if (!error) return;
    const text = [
      error.title,
      `Reason: ${error.reason}`,
      error.httpStatus ? `HTTP: ${error.httpStatus}` : "",
      error.technical ? `Technical: ${error.technical}` : "",
      error.apiResponse ? `API Response:\n${error.apiResponse}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#06100c]/72 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#17362b]/12 bg-[#f8f7f2] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#17362b]/10 px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
              Hero Video Upload
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
              {phase === "success"
                ? "Upload Successful"
                : phase === "error"
                  ? "Upload Failed"
                  : "Uploading Hero Video…"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              cancelledRef.current = true;
              if (uploadIdRef.current) {
                void cancelSession(uploadIdRef.current);
              }
              onClose();
            }}
            className="grid size-10 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e]"
            aria-label="Close upload dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-xl border border-[#17362b]/10 bg-white px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#203b30]">
              {file.name}
            </p>
            <p className="mt-1 text-xs text-[#7a8781]">
              {formatBytes(file.size)} · Max 120 MB · MP4 / WebM / MOV
            </p>
          </div>

          {phase === "uploading" || phase === "idle" ? (
            <div className="space-y-3">
              <div className="h-3 overflow-hidden rounded-full bg-[#e8ebe7]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#b98634] via-[#e1bd71] to-[#c2933e] transition-all duration-200"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-[#42574e] sm:grid-cols-4">
                <p>
                  <span className="block text-[9px] tracking-[0.14em] text-[#a67a30] uppercase">
                    Progress
                  </span>
                  {progress.percent}%
                </p>
                <p>
                  <span className="block text-[9px] tracking-[0.14em] text-[#a67a30] uppercase">
                    Uploaded
                  </span>
                  {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
                </p>
                <p>
                  <span className="block text-[9px] tracking-[0.14em] text-[#a67a30] uppercase">
                    Remaining
                  </span>
                  {formatBytes(Math.max(0, progress.total - progress.loaded))}
                </p>
                <p>
                  <span className="block text-[9px] tracking-[0.14em] text-[#a67a30] uppercase">
                    Speed
                  </span>
                  {progress.speedBps
                    ? `${formatBytes(progress.speedBps)}/s`
                    : "—"}
                </p>
              </div>
              <p className="flex items-center gap-2 text-xs text-[#62716b]">
                <Loader2 className="size-3.5 animate-spin text-[#a67a30]" />
                Estimated: {formatEta(progress.etaSec)}
              </p>
            </div>
          ) : null}

          {phase === "success" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">✓ Upload Successful</p>
                  <p className="mt-1 text-sm">
                    Hero video saved successfully.
                  </p>
                  <p className="mt-2 text-xs text-emerald-800/80">
                    Refreshing preview…
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {phase === "error" && error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-5 text-red-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{error.title}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Reason:</span> {error.reason}
                  </p>
                  {error.httpStatus ? (
                    <p className="mt-2 text-xs">
                      <span className="font-semibold">HTTP Status Code:</span>{" "}
                      {error.httpStatus}
                    </p>
                  ) : null}
                  {error.technical ? (
                    <p className="mt-2 text-xs break-words">
                      <span className="font-semibold">Technical Details:</span>{" "}
                      {error.technical}
                    </p>
                  ) : null}
                  {error.apiResponse ? (
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-white/80 p-3 text-[11px] leading-relaxed break-words whitespace-pre-wrap text-red-900">
                      {error.apiResponse}
                    </pre>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyError()}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-[10px] font-semibold tracking-[0.12em] uppercase"
                    >
                      <Copy className="size-3.5" />
                      {copied ? "Copied" : "Copy Error"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void runUpload(file)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-700 px-4 text-[10px] font-semibold tracking-[0.12em] text-white uppercase"
                    >
                      <RefreshCw className="size-3.5" />
                      Retry Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {phase === "uploading" ? (
          <div className="border-t border-[#17362b]/8 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                cancelledRef.current = true;
                if (uploadIdRef.current) {
                  void cancelSession(uploadIdRef.current);
                }
                onClose();
              }}
              className="h-10 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
            >
              Cancel upload
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function openVideoFilePicker(onPicked: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = VIDEO_ACCEPT;
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) onPicked(file);
  };
  input.click();
}

export function VideoUploadTriggerButton({
  label = "Upload video",
  folder = "video",
  onSuccess,
  className,
}: {
  label?: string;
  folder?: string;
  onSuccess: (asset: UploadedVideoAsset) => void;
  className?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          openVideoFilePicker((picked) => {
            setFile(picked);
            setOpen(true);
          })
        }
        className={cn(
          "orbit-gold-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.16em] uppercase",
          className
        )}
      >
        <UploadCloud className="size-4" />
        {label}
      </button>
      <VideoUploadDialog
        open={open}
        file={file}
        folder={folder}
        onClose={() => {
          setOpen(false);
          setFile(null);
        }}
        onSuccess={(asset) => {
          setOpen(false);
          setFile(null);
          onSuccess(asset);
        }}
      />
    </>
  );
}

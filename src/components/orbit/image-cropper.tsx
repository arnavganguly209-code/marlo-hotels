"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useToast } from "@/components/orbit/toast";

type AspectOption = {
  id: string;
  label: string;
  value: number | undefined;
};

const ASPECTS: AspectOption[] = [
  { id: "free", label: "Free", value: undefined },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "custom", label: "Custom", value: undefined },
];

export function ImageCropper({
  assetId,
  src,
  onClose,
  onSaved,
}: {
  assetId: string;
  src: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [aspectId, setAspectId] = useState("16:9");
  const [customAspect, setCustomAspect] = useState(1.5);
  const [area, setArea] = useState<Area | null>(null);
  const [replace, setReplace] = useState(false);
  const [saving, setSaving] = useState(false);

  const aspect =
    aspectId === "custom"
      ? customAspect
      : ASPECTS.find((item) => item.id === aspectId)?.value;

  const onCropComplete = useCallback((_cropped: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  async function save() {
    if (!area) {
      push("Validation Error", "error");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/orbit/media/crop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        rotate: rotation,
        flipX,
        flipY,
        replace,
      }),
    });
    const result = (await response.json()) as { error?: string; message?: string };
    setSaving(false);
    if (!response.ok) {
      push(result.error || "Server Error", "error");
      return;
    }
    push(result.message || "Image Saved", "success");
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[#06100c]/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#f8f7f2] shadow-2xl">
        <div className="border-b border-[#17362b]/10 px-5 py-4">
          <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
            Image cropper
          </p>
          <h2 className="font-display text-2xl font-semibold text-[#10251e]">
            Crop & focal preview
          </h2>
        </div>
        <div className="relative h-[420px] bg-[#0d1c16]">
          <div
            className="absolute inset-0"
            style={{
              transform: `${flipX ? "scaleX(-1)" : ""} ${flipY ? "scaleY(-1)" : ""}`,
            }}
          >
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAspectId(item.id)}
                className={`rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase ${
                  aspectId === item.id
                    ? "bg-[#123429] text-[#e4c784]"
                    : "bg-[#eef0ed] text-[#62716b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {aspectId === "custom" ? (
            <label className="block text-xs text-[#52665c]">
              Custom aspect (width/height)
              <input
                type="number"
                min={0.2}
                step={0.05}
                value={customAspect}
                onChange={(event) => setCustomAspect(Number(event.target.value) || 1)}
                className="mt-1 h-10 w-full rounded-xl border border-[#17362b]/12 bg-white px-3"
              />
            </label>
          ) : null}
          <label className="block text-xs text-[#52665c]">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-xs text-[#52665c]">
            Rotate
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFlipX((value) => !value)}
              className="rounded-lg bg-[#eef0ed] px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
            >
              Flip X
            </button>
            <button
              type="button"
              onClick={() => setFlipY((value) => !value)}
              className="rounded-lg bg-[#eef0ed] px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
            >
              Flip Y
            </button>
            <button
              type="button"
              onClick={() => {
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setFlipX(false);
                setFlipY(false);
                setAspectId("16:9");
              }}
              className="rounded-lg bg-[#eef0ed] px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase"
            >
              Reset
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-[#52665c]">
              <input
                type="checkbox"
                checked={replace}
                onChange={(event) => setReplace(event.target.checked)}
              />
              Replace current version
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-[#17362b]/8 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-[#17362b]/12 px-5 text-[10px] font-semibold tracking-[0.15em] uppercase"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="orbit-gold-button h-11 rounded-xl px-6 text-[10px] font-semibold tracking-[0.15em] uppercase disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

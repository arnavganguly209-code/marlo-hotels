"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Prints the exact same 1-page A4 PDF used for View/Download.
 * Avoids HTML + site chrome which previously expanded to ~3 pages.
 */
export function BookingPdfPrint({ pdfUrl }: { pdfUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const printed = useRef(false);
  const [status, setStatus] = useState("Preparing A4 booking confirmation…");

  useEffect(() => {
    let objectUrl = "";
    let fallbackTimer = 0;
    let cancelled = false;

    async function prepare() {
      try {
        const response = await fetch(pdfUrl, { credentials: "same-origin" });
        if (!response.ok) {
          throw new Error("PDF unavailable");
        }
        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" })
        );
        const iframe = iframeRef.current;
        if (!iframe) return;

        const triggerPrint = () => {
          if (printed.current || cancelled) return;
          printed.current = true;
          setStatus("Opening print dialog…");
          window.setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch {
              window.open(objectUrl, "_blank", "noopener,noreferrer");
            }
          }, 350);
        };

        iframe.addEventListener("load", triggerPrint);
        iframe.src = objectUrl;
        fallbackTimer = window.setTimeout(triggerPrint, 1600);
      } catch {
        if (!cancelled) {
          setStatus("Could not load PDF. Opening download view…");
          window.location.href = pdfUrl;
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl]);

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#0c1a18",
        color: "#f7f2e8",
        fontFamily: "Georgia, Times New Roman, serif",
      }}
    >
      <p
        style={{
          margin: 0,
          padding: "14px 16px",
          textAlign: "center",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#c9963f",
        }}
      >
        Marlo Hotels · {status}
      </p>
      <iframe
        ref={iframeRef}
        title="Marlo Hotels booking confirmation"
        style={{
          display: "block",
          width: "100%",
          height: "calc(100vh - 48px)",
          border: "none",
          background: "#fff",
        }}
      />
    </div>
  );
}

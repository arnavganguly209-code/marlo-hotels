"use client";

import { ToastProvider } from "@/components/orbit/toast";

export function OrbitShell({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

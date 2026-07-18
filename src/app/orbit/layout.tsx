import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Orbit Administration",
    template: "%s | Marlo Orbit",
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function OrbitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#081310] text-[#f8f2e7]">{children}</div>
  );
}

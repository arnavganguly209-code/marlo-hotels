import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type LogoDisplaySettings = {
  desktopWidth: number;
  tabletWidth: number;
  mobileWidth: number;
  leftMargin: number;
  topMargin: number;
  opacity: number;
};

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  src?: string;
  display?: LogoDisplaySettings;
};

export function LogoMark({
  className,
  src = "/images/brand/logo.png",
  display,
}: {
  className?: string;
  src?: string;
  display?: LogoDisplaySettings;
}) {
  const style = display
    ? ({
        "--logo-desktop-width": `${display.desktopWidth}px`,
        "--logo-tablet-width": `${display.tabletWidth}px`,
        "--logo-mobile-width": `${display.mobileWidth}px`,
        marginLeft: `${display.leftMargin}px`,
        marginTop: `${display.topMargin}px`,
        opacity: display.opacity / 100,
      } as CSSProperties)
    : undefined;
  return (
    <Image
      src={src}
      alt="Marlo Hotels"
      width={918}
      height={330}
      quality={100}
      unoptimized={src.startsWith("/media/")}
      style={style}
      className={cn(
        "bg-transparent object-contain",
        display
          ? "h-auto w-[var(--logo-mobile-width)] md:w-[var(--logo-tablet-width)] lg:w-[var(--logo-desktop-width)]"
          : "h-10 w-auto",
        className
      )}
    />
  );
}

export function Logo({ className, src, display }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Marlo Hotels — Home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <LogoMark
        src={src}
        display={display}
        className={cn(
          "transition-transform duration-500 group-hover:scale-[1.02]",
          display ? "" : "h-12 md:h-14"
        )}
      />
    </Link>
  );
}

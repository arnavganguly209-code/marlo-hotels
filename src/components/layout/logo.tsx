import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  src?: string;
};

export function LogoMark({
  className,
  src = "/images/brand/logo.png",
}: {
  className?: string;
  src?: string;
}) {
  return (
    <Image
      src={src}
      alt="Marlo Hotels"
      width={918}
      height={330}
      className={cn("h-10 w-auto bg-transparent object-contain", className)}
    />
  );
}

export function Logo({ className, src }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Marlo Hotels — Home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <LogoMark
        src={src}
        className="h-12 transition-transform duration-500 group-hover:scale-[1.02] md:h-14"
      />
    </Link>
  );
}

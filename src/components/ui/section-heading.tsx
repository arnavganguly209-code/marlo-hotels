import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        isCenter && "mx-auto text-center",
        className
      )}
    >
      <p className={cn("eyebrow", isCenter && "gold-rule justify-center")}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display mt-6 text-4xl leading-[1.12] font-semibold tracking-[-0.01em] text-balance md:text-5xl md:leading-[1.1] lg:text-[3.35rem]",
          isLight ? "text-ivory" : "text-forest-950"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-7 max-w-xl text-[15.5px] leading-[1.75] font-normal tracking-[0.01em]",
            isCenter && "mx-auto",
            isLight ? "text-cream-200/85" : "text-charcoal-900/70"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

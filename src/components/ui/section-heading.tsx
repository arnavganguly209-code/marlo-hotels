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
          "font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance sm:text-5xl sm:leading-[1.08] lg:text-[3.55rem] lg:leading-[1.06]",
          isLight ? "text-ivory" : "text-forest-950"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-7 max-w-xl text-[15.5px] leading-[1.8] font-normal tracking-[0.014em] sm:text-base sm:leading-[1.82]",
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

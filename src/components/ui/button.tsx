import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 uppercase tracking-[0.22em] font-medium transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        gold: "bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-gold hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border border-ivory/45 text-ivory hover:border-gold-400 hover:text-gold-300 hover:bg-ivory/5",
        "outline-dark":
          "border border-forest-800/40 text-forest-900 hover:border-gold-500 hover:text-gold-600",
        forest:
          "bg-forest-900 text-cream-100 hover:bg-forest-800 shadow-luxury-sm hover:-translate-y-0.5",
        ghost: "text-forest-900 hover:text-gold-600",
      },
      size: {
        sm: "h-10 px-6 text-[10px]",
        md: "h-12 px-8 text-[11px]",
        lg: "h-14 px-10 text-xs",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

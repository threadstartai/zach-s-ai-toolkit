import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** "default" = white surface, 12px radius. "tool" = white, 16px radius, more padding. "muted" = navy-light tint. */
  variant?: "default" | "tool" | "muted";
  hoverable?: boolean;
  padded?: boolean;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable = false, padded = true, ...props }, ref) => {
    const base =
      "border border-[hsl(var(--border))] transition-colors duration-150";
    const radius = variant === "tool" ? "rounded-[16px]" : "rounded-[12px]";
    const surface =
      variant === "muted"
        ? "bg-navy-light/40"
        : "bg-background";
    const padding =
      !padded ? "" : variant === "tool" ? "p-6 sm:p-8" : "p-5 sm:p-6";
    const hover = hoverable ? "hover:border-navy/40" : "";

    return (
      <div
        ref={ref}
        className={cn(base, radius, surface, padding, hover, className)}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export { Card };

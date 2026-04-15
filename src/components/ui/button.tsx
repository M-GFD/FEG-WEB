import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--feg-green-2)]/35 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--feg-green-soft)] text-white hover:brightness-110",
        primary: "bg-[var(--feg-green-2)] text-white hover:brightness-95",
        secondary:
          "border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] text-[var(--feg-ink)] hover:bg-white",
        outline:
          "border border-[var(--feg-green)]/25 bg-transparent text-[var(--feg-ink)] hover:bg-[var(--feg-bg)]",
        ghost: "text-[var(--feg-ink)] hover:bg-[var(--feg-bg)]",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

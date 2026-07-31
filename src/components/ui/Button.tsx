import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white border-transparent hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-900/40",
  secondary: "bg-white/5 text-rose-50 border-white/10 hover:bg-white/10",
  outline: "bg-transparent text-rose-100 border-rose-400/30 hover:bg-rose-500/10",
  ghost: "bg-transparent text-rose-200 border-transparent hover:bg-white/5",
  danger: "bg-transparent text-red-300 border-red-500/30 hover:bg-red-500/10",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
  icon: "p-2 aspect-square",
};

/** Botão base do app: variantes de intenção + tamanhos, sem dependência externa. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border font-medium",
        "transition duration-200 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "disabled:opacity-40 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
});

import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/** Etiqueta pequena para nível, categoria, origem da carta etc. */
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/10",
        "bg-white/5 px-2.5 py-1 text-[11px] font-medium leading-none text-rose-100/80",
        className
      )}
      {...props}
    />
  );
}

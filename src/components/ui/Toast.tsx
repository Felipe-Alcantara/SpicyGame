import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { uid } from "../../lib/random";

type ToastTone = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

const TONES: Record<ToastTone, string> = {
  info: "border-white/15 bg-zinc-900/95",
  success: "border-emerald-400/30 bg-emerald-950/90 text-emerald-100",
  error: "border-red-400/30 bg-red-950/90 text-red-100",
};

/**
 * Avisos discretos no rodapé. Substituem os `alert()` da versão antiga, que
 * travavam a página e quebravam completamente o clima do jogo.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = "info") => {
    const toast: Toast = { id: uid(), message, tone };
    setToasts((t) => [...t, toast]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== toast.id));
    }, 3200);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                "pointer-events-auto rounded-2xl border px-4 py-2.5 text-sm shadow-xl backdrop-blur",
                TONES[t.tone]
              )}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Dispara um aviso. Precisa estar dentro de `<ToastProvider>`. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}

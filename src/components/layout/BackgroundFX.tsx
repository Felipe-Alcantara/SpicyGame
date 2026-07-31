import { useMemo } from "react";

/**
 * Fundo do app: dois halos que respiram e uma chuva lenta de brasas.
 *
 * É puramente decorativo (`aria-hidden`) e fica atrás de tudo. As posições são
 * sorteadas uma única vez por montagem para não recalcular a cada render.
 */
export function BackgroundFX() {
  const embers = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#4c0519_0%,#1c0410_45%,#09090b_100%)]" />
      <div className="spicy-halo absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-600/25 blur-[120px]" />
      <div className="spicy-halo spicy-halo--delayed absolute -bottom-40 right-[-80px] h-[380px] w-[380px] rounded-full bg-orange-500/20 blur-[120px]" />
      {embers.map((e) => (
        <span
          key={e.id}
          className="spicy-ember absolute bottom-[-10%] rounded-full bg-rose-300"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            opacity: e.opacity,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

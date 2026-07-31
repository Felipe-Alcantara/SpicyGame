import { useEffect, useRef, useState } from "react";

/** Cronômetro simples em segundos, usado nos desafios com tempo. */
export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  function toggle() {
    setSeconds(0);
    setRunning((v) => !v);
  }

  function stop() {
    setRunning(false);
    setSeconds(0);
  }

  return { seconds, running, toggle, stop };
}

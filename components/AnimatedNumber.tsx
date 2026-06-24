"use client";
import React, { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  duration?: number; // ms
  decimals?: number;
  className?: string;
};

export default function AnimatedNumber({ value, duration = 600, decimals = 0, className = "" }: AnimatedNumberProps) {
  const prevRef = useRef<number>(value);
  const [display, setDisplay] = useState<number>(value);

  useEffect(() => {
    const from = prevRef.current ?? 0;
    const to = Number(value);
    if (from === to || duration === 0) {
      prevRef.current = to;
      setDisplay(to);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const current = from + (to - from) * t;
      setDisplay(Number(current.toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = to;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, decimals]);

  const formatted = decimals === 0 ? Math.round(display).toLocaleString() : Number(display).toFixed(decimals);

  return <span className={className}>{formatted}</span>;
}
"use client";

import { useMemo } from "react";

function Star({ top, left, size, delay, duration }: {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <span
      className="star"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

export default function Aurora() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        top: (i * 37 + 11) % 100,
        left: (i * 53 + 7) % 100,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        delay: (i * 0.37) % 6,
        duration: 2.5 + ((i * 13) % 40) / 10,
      })),
    []
  );

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_70%_-10%,#2b1055_0%,#0a0a1a_55%,#05060f_100%)]" />

      {/* aurora blobs */}
      <div
        className="aurora-blob h-[45rem] w-[45rem] bg-[#0ea5e9] -top-40 -left-48"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="aurora-blob h-[38rem] w-[38rem] bg-[#a855f7] top-1/4 -right-52"
        style={{ animationDelay: "-9s", opacity: 0.42 }}
      />
      <div
        className="aurora-blob h-[36rem] w-[36rem] bg-[#ec4899] bottom-[-12rem] left-1/4"
        style={{ animationDelay: "-16s", opacity: 0.4 }}
      />
      <div
        className="aurora-blob h-[30rem] w-[30rem] bg-[#f59e0b] -bottom-32 right-1/4"
        style={{ animationDelay: "-23s", opacity: 0.22 }}
      />

      {/* starfield */}
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45))]" />
    </div>
  );
}
import React from "react";

interface LiveDotProps {
  label?: string;
  tone?: "amber" | "muted";
}

/**
 * Small pulsing status dot. Used to mark things that are actually
 * live/current (e.g. the store status, the latest build) — a real
 * signal rather than a decorative flourish.
 */
export const LiveDot: React.FC<LiveDotProps> = ({ label, tone = "amber" }) => {
  const dotColor = tone === "amber" ? "bg-accent-indigo" : "bg-text-secondary";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono">
      <span className="relative w-1.5 h-1.5 shrink-0">
        <span className={`live-dot absolute inset-0 rounded-full ${dotColor}`} />
      </span>
      {label && <span className="text-[10px] uppercase tracking-wider text-text-secondary">{label}</span>}
    </span>
  );
};

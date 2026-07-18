import React from "react";

interface WaveformBarProps {
  seed: string;
  active?: boolean;
}

export const WaveformBar: React.FC<WaveformBarProps> = ({ seed, active = false }) => {
  // Generate a deterministic array of heights between 15% and 85% based on the seed string
  const getHeights = (str: string) => {
    const chars = str.split("");
    const heights: number[] = [];
    const count = 12; // Number of bars in the waveform
    
    for (let i = 0; i < count; i++) {
      const charCode1 = chars[i % chars.length]?.charCodeAt(0) || 100;
      const charCode2 = chars[(i + 3) % chars.length]?.charCodeAt(0) || 80;
      const height = ((charCode1 * charCode2 * (i + 1)) % 70) + 15; // 15 to 85
      heights.push(height);
    }
    return heights;
  };

  const heights = getHeights(seed);

  return (
    <div 
      className="flex items-end gap-[3px] h-6 px-1.5 py-0.5 rounded-sm bg-bg-base/30 border border-bg-surface/50"
      title="Release activity signature"
    >
      {heights.map((h, idx) => (
        <div
          key={idx}
          className={`w-[3px] rounded-full transition-all duration-300 ${
            active 
              ? "bg-accent-rose" 
              : "bg-accent-indigo/60 group-hover:bg-accent-indigo"
          }`}
          style={{ 
            height: `${h}%`,
            // Slight delay staggered effect if active
            animationDelay: `${idx * 75}ms`
          }}
        />
      ))}
    </div>
  );
};

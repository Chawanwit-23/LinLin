"use client";
import { useEffect, useState } from "react";

type AnimType = "fall" | "twinkle" | "drift";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  type: AnimType;
  y?: number; // only for non-fall
}

const FALL   = ["🌸", "🌷", "🌺", "🎀", "🌸", "🌷", "🌸", "🌺"];
const TWINKLE = ["✨", "⭐", "💫", "🌟", "✨", "💫", "⭐", "✨"];
const DRIFT   = ["💖", "💕", "💗", "💝", "💖", "💕"];

export default function FloatingDecorations() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const seed = (n: number, s: number) => ((n * 9301 + 49297 * s) % 233280) / 233280;

    const items: Particle[] = [
      // 🌸 Falling petals — start above viewport, fall to bottom
      ...FALL.map((emoji, i) => ({
        id: i,
        emoji,
        x: 3 + i * 12 + seed(i, 1) * 8,
        size: 15 + seed(i, 2) * 10,
        duration: 10 + seed(i, 3) * 8,
        delay: seed(i, 4) * 10,
        type: "fall" as AnimType,
      })),

      // ✨ Twinkling stars — fixed positions, pulse in/out
      ...TWINKLE.map((emoji, i) => ({
        id: 100 + i,
        emoji,
        x: 5 + seed(i, 5) * 90,
        y: 5 + seed(i, 6) * 85,
        size: 11 + seed(i, 7) * 7,
        duration: 1.8 + seed(i, 8) * 2.5,
        delay: seed(i, 9) * 4,
        type: "twinkle" as AnimType,
      })),

      // 💖 Drifting hearts — gentle side-to-side float
      ...DRIFT.map((emoji, i) => ({
        id: 200 + i,
        emoji,
        x: 8 + seed(i, 10) * 84,
        y: 15 + seed(i, 11) * 70,
        size: 14 + seed(i, 12) * 8,
        duration: 5 + seed(i, 13) * 4,
        delay: seed(i, 14) * 5,
        type: "drift" as AnimType,
      })),
    ];

    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {particles.map((p) => {
        const isFall = p.type === "fall";
        const animName =
          p.type === "fall"    ? "fall-petal"   :
          p.type === "twinkle" ? "twinkle-star"  :
                                 "drift-heart";

        return (
          <div
            key={p.id}
            className="absolute select-none"
            style={{
              left: `${p.x}%`,
              top: isFall ? "-5%" : `${p.y}%`,
              fontSize: `${p.size}px`,
              animation: `${animName} ${p.duration}s ${
                isFall ? "linear" : "ease-in-out"
              } ${p.delay}s infinite`,
              opacity: isFall ? 0 : p.type === "drift" ? 0.12 : 0,
            }}
          >
            {p.emoji}
          </div>
        );
      })}
    </div>
  );
}

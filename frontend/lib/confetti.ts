"use client";

import confetti from "canvas-confetti";

const GOLD = ["#fde047", "#fbbf24", "#f59e0b", "#ffffff"];

export function fireConfetti(accents: string[], emoji?: string) {
  const colors = [...accents, ...GOLD];

  // side cannons
  confetti({
    particleCount: 90,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.75 },
    colors,
    scalar: 1.05,
    ticks: 200,
    gravity: 0.9,
  });
  confetti({
    particleCount: 90,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.75 },
    colors,
    scalar: 1.05,
    ticks: 200,
    gravity: 0.9,
  });

  // center golden burst
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 360,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.55 },
      colors: GOLD,
      gravity: 0.75,
      scalar: 0.95,
    });
  }, 180);

  // star shapes (shapes particle type)
  const star = confetti.shapeFromText({ text: emoji || "✨", scalar: 2.4 });
  setTimeout(() => {
    confetti({
      particleCount: 18,
      spread: 120,
      startVelocity: 28,
      origin: { x: 0.5, y: 0.5 },
      shapes: [star],
      scalar: 2.2,
      ticks: 120,
      gravity: 0.7,
    });
  }, 320);
}
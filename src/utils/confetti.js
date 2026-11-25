import confetti from 'canvas-confetti';

export function triggerStreamersAndConfetti({ streak = 1, isVictory = false, colors = ['#f5c542', '#38bdf8', '#ec4899'] }) {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced && !isVictory) return;

  if (isVictory || streak >= 3) {
    confetti({
      particleCount: 140,
      spread: 110,
      origin: { y: 0.55 },
      colors,
      shapes: ['square', 'circle'],
      scalar: 1.3
    });
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 85,
      origin: { x: 0, y: 1 },
      colors,
      scalar: 1.4,
      drift: 0.25
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 85,
      origin: { x: 1, y: 1 },
      colors,
      scalar: 1.4,
      drift: -0.25
    });
    return;
  }

  let particleCount = 35;
  let spread = 60;
  if (streak === 2) {
    particleCount = 55;
    spread = 75;
  }

  // Serpentinas y confeti escalado según racha
  confetti({
    particleCount: Math.floor(particleCount / 2),
    angle: 60,
    spread,
    origin: { x: 0, y: 1 },
    colors,
    shapes: ['square', 'circle'],
    scalar: 1.3,
    drift: 0.2
  });
  confetti({
    particleCount: Math.floor(particleCount / 2),
    angle: 120,
    spread,
    origin: { x: 1, y: 1 },
    colors,
    shapes: ['square', 'circle'],
    scalar: 1.3,
    drift: -0.2
  });
}

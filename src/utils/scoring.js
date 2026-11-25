export function calcularPuntos({ tiempoRestante, tiempoTotal = 15, racha = 0 }) {
  const base = 100;
  const timeBonus = Math.max(0, Math.floor((tiempoRestante / tiempoTotal) * 50));
  const streakBonus = Math.min(50, racha * 10);
  const total = base + timeBonus + streakBonus;
  return {
    puntos: total,
    base,
    timeBonus,
    streakBonus
  };
}

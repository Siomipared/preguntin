// Lógica pura de gestión de vidas para el modo multijugador local

export function processLifeLoss(player, isLocalMode) {
  if (!isLocalMode) return { player, eliminated: false };
  const currentLives = player.lives !== undefined ? player.lives : 5;
  const newLives = Math.max(0, currentLives - 1);
  const updatedPlayer = { ...player, lives: newLives };
  const eliminated = newLives === 0;
  return { player: updatedPlayer, eliminated };
}

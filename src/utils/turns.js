// Función pura de gestión de turnos y orden circular

export function getNextTurn({ players, currentTurnIndex, gameMode, correct }) {
  if (gameMode === 'solitario') {
    return { nextTurnIndex: 0, nextPlayer: players[0] };
  }

  // Acierto: mantiene el turno en el mismo jugador si sigue activo
  if (correct) {
    const currentPlayer = players[currentTurnIndex];
    if (gameMode === 'local' && currentPlayer.lives === 0) {
      return getNextActiveTurn(players, currentTurnIndex);
    }
    return { nextTurnIndex: currentTurnIndex, nextPlayer: currentPlayer };
  }

  // Fallo o timeout: pasa al siguiente jugador activo en orden circular
  return getNextActiveTurn(players, currentTurnIndex);
}

function getNextActiveTurn(players, currentIndex) {
  const n = players.length;
  let nextIndex = (currentIndex + 1) % n;
  let attempts = 0;

  while (attempts < n) {
    const candidate = players[nextIndex];
    if (candidate.lives === undefined || candidate.lives > 0) {
      return { nextTurnIndex: nextIndex, nextPlayer: candidate };
    }
    nextIndex = (nextIndex + 1) % n;
    attempts++;
  }

  return { nextTurnIndex: (currentIndex + 1) % n, nextPlayer: players[(currentIndex + 1) % n] };
}

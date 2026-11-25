import { getNextTurn } from './turns.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

console.log("=== RUNNING TURNS TESTS ===");

// 1. Solitario
const solPlayer = { id: 1, name: 'Sol' };
const resSol = getNextTurn({ players: [solPlayer], currentTurnIndex: 0, gameMode: 'solitario', correct: false });
assert(resSol.nextTurnIndex === 0, 'Solitario always keeps index 0 on wrong');

// 2. Acierto mantiene turno
const p1 = { id: 1, name: 'A', lives: 5 };
const p2 = { id: 2, name: 'B', lives: 5 };
const resCorrect = getNextTurn({ players: [p1, p2], currentTurnIndex: 0, gameMode: 'local', correct: true });
assert(resCorrect.nextTurnIndex === 0, 'Correct answer keeps current player turn');

// 3. Fallo pasa turno circular
const resWrong = getNextTurn({ players: [p1, p2], currentTurnIndex: 0, gameMode: 'local', correct: false });
assert(resWrong.nextTurnIndex === 1, 'Wrong answer passes to next player index 1');

// 4. Orden circular con 3 jugadores
const p3 = { id: 3, name: 'C', lives: 5 };
const resCircular = getNextTurn({ players: [p1, p2, p3], currentTurnIndex: 2, gameMode: 'local', correct: false });
assert(resCircular.nextTurnIndex === 0, 'Circular order wraps around from index 2 to 0');

// 5. Eliminado salteado
const p2Dead = { id: 2, name: 'B', lives: 0 };
const resSkip = getNextTurn({ players: [p1, p2Dead, p3], currentTurnIndex: 0, gameMode: 'local', correct: false });
assert(resSkip.nextTurnIndex === 2, 'Skips eliminated player at index 1 and goes to index 2');

console.log("=== ALL TURNS TESTS PASSED ===");

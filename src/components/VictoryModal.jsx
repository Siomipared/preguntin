import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Sparkles, Heart, Coins } from 'lucide-react';
import { CATEGORIES } from '../data/characters';
import { GAME_CONFIG } from '../config/gameConfig';

export default function VictoryModal({ winner, onRestart }) {
  useEffect(() => {
    if (!winner.isDefeat) {
      // Lanzar confeti de celebración
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [winner]);

  if (winner.isDefeat) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]">
        <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-lg w-full p-8 text-center shadow-hard relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
          
          <div className="w-20 h-20 bg-red-500 text-white rounded-3xl border-2 border-red-300 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-red-500/30 mb-6 animate-bounce">
            💀
          </div>

          <h1 className="text-4xl font-black text-red-600 dark:text-red-400 mb-2">
            Derrota
          </h1>
          <p className="text-[var(--text-main)] opacity-80 text-sm mb-8">
            {winner.reason || 'Te quedaste sin vidas en tu partida en solitario.'}
          </p>

          <button
            onClick={onRestart}
            className="w-full py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-lg rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  if (winner.isPodium) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]">
        <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-xl w-full p-6 sm:p-8 text-center shadow-hard relative overflow-hidden backdrop-blur-md max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500" />
          
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl border-2 border-amber-300 mx-auto flex items-center justify-center text-3xl shadow-xl mb-3 animate-bounce">
            🏆
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mb-1">
            Partida Finalizada
          </h2>
          <p className="text-xs text-[var(--text-main)] opacity-80 mb-6">
            {winner.reason}
          </p>

          <div className="space-y-3 mb-6">
            {winner.podium.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`p-4 rounded-2xl border-[3px] border-[var(--border-color)] flex items-center justify-between shadow-[3px_3px_0_var(--shadow-color)] ${
                  idx === 0 && !p.isEliminated
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-black'
                    : 'bg-[var(--card-bg)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="text-left">
                    <h4 className="font-black text-base">{p.name}</h4>
                    <span className="text-xs opacity-80 font-bold">
                      {p.characters.length} / {GAME_CONFIG.totalPersonajes} Personajes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{p.lives}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>{p.coins || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="w-full py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-lg rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Jugar de Nuevo / Revancha
          </button>
        </div>
      </div>
    );
  }

  // Instant win by 8 characters
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]">
      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-lg w-full p-8 text-center shadow-hard relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
        
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl border-2 border-amber-300 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-6 animate-bounce">
          🏆
        </div>

        <div className="inline-flex items-center gap-2 bg-[var(--accent-pink)] border border-[var(--border-color)] px-4 py-1.5 rounded-full text-[var(--btn-text)] text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4" />
          ¡Gran Campeón de la Trivia!
        </div>

        <h1 className="text-4xl font-black text-[var(--text-main)] mb-2">
          {winner.name} Gana
        </h1>
        <p className="text-[var(--text-main)] opacity-80 text-sm mb-8">
          {winner.reason || 'Ha coleccionado con éxito los 8 personajes legendarios de la sabiduría.'}
        </p>

        {/* Muestra de los 8 personajes coleccionados */}
        <div className="grid grid-cols-4 gap-2 mb-8 bg-slate-100 dark:bg-[#16161f] p-4 rounded-2xl border-[2px] border-[var(--border-color)] shadow-inner">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center p-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[9px] font-bold text-[var(--text-main)] truncate w-full text-center">{cat.character.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-lg rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Jugar de Nuevo / Revancha
        </button>
      </div>
    </div>
  );
}

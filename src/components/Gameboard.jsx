import React from 'react';
import { CATEGORIES } from '../data/characters';
import { Trophy, Flame, ArrowRight, Sparkles, Heart, Coins, Crown } from 'lucide-react';

const CATEGORY_BG = {
  geografia: 'var(--cat-geografia)',
  arte: 'var(--cat-arte)',
  entretenimiento: 'var(--cat-entretenimiento)',
  programacion: 'var(--cat-programacion)',
  matematicas: 'var(--cat-matematicas)',
  historia: 'var(--cat-historia)',
  deportes: 'var(--cat-deportes)',
  ciencia: 'var(--cat-ciencia)'
};

function LivesDisplay({ lives = 5 }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFilled = i < lives;
        return (
          <Heart
            key={i}
            className={`w-4 h-4 transition-all ${
              isFilled ? 'text-red-500 fill-red-500 scale-100' : 'text-slate-300 fill-slate-200 dark:fill-slate-700 scale-90'
            }`}
          />
        );
      })}
    </div>
  );
}

function StreakDisplay({ streak = 0 }) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFull = streak >= 3;
  return (
    <div className="flex items-center gap-2">
      <Flame className={`w-5 h-5 ${isFull ? 'text-orange-500 fill-orange-500 ' + (!prefersReduced ? 'animate-pulse' : '') : 'text-slate-400'}`} />
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`w-3 h-2 rounded-sm border border-[var(--border-color)] transition-all ${
              seg <= streak ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CharacterCollectionGrid({ characters = [] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 w-full justify-items-center">
      {CATEGORIES.map((cat) => {
        const hasCollected = characters.includes(cat.id);

        return (
          <div
            key={cat.id}
            title={`${cat.character.name} (${cat.name}) - ${hasCollected ? '¡Obtenido!' : 'Faltante'}`}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] w-full ${hasCollected ? '' : 'opacity-40 grayscale'}`}
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[2px] border-[var(--border-color)] flex items-center justify-center overflow-hidden relative mb-1"
              style={{ backgroundColor: CATEGORY_BG[cat.id] || '#cbd5e1' }}
            >
              <img
                src={cat.character.image}
                alt={cat.character.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="text-xl" style={{ display: 'none' }}>{cat.icon}</span>
              {hasCollected && (
                <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-md" />
                </div>
              )}
            </div>

            <span className="text-xs font-black text-[var(--text-main)] text-center truncate w-full">
              {cat.character.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Gameboard({ players, currentTurnIndex, onSpinRoulette }) {
  const currentPlayer = players[currentTurnIndex];
  const isSolo = players.length === 1;

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-fredoka text-[var(--text-main)] flex flex-col items-center">
      {/* Tarjeta del Jugador Actual */}
      <div className="w-full bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-[5px_5px_0_var(--shadow-color)] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col items-center text-center">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--btn-primary-bg)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] flex items-center justify-center text-4xl mb-3 text-[var(--btn-text)]">
            {currentPlayer.avatar}
          </div>
          
          <span className="text-xs font-bold text-[var(--text-main)] opacity-80 uppercase">
            {isSolo ? 'Partida Solitario' : 'Turno Activo'}
          </span>
          
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-main)] mt-1">
            {capitalizeName(currentPlayer.name)}
          </h2>

          <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 border-[2px] border-[var(--border-color)] text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0_var(--shadow-color)]">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{currentPlayer.coins || 0} monedas</span>
            </span>

            <div className="flex items-center gap-1.5 bg-[var(--accent-pink)] border-[2px] border-[var(--border-color)] text-[var(--btn-text)] px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0_var(--shadow-color)]">
              <StreakDisplay streak={currentPlayer.streak || 0} />
            </div>

            {currentPlayer.lives !== undefined && (
              <div className="bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] px-3 py-1 rounded-full shadow-[2px_2px_0_var(--shadow-color)]">
                <LivesDisplay lives={currentPlayer.lives} />
              </div>
            )}
          </div>
        </div>

        {/* Botón Girar Ruleta */}
        <div className="w-full flex justify-center mb-6">
          <button
            data-no-sound
            onClick={onSpinRoulette}
            className="w-full max-w-[480px] py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xl border-[3px] border-[var(--border-color)] shadow-[5px_5px_0_var(--shadow-color)] rounded-2xl active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            <span>Girar Ruleta</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Colección de Personajes */}
        <div className="w-full pt-6 border-t-[2px] border-[var(--border-color)]/25 flex flex-col items-center">
          <h3 className="text-center text-[var(--text-main)] text-sm font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Álbum de Colección ({(currentPlayer.characters || []).length}/8)</span>
          </h3>
          <CharacterCollectionGrid characters={currentPlayer.characters || []} />
        </div>

      </div>

      {/* Multijugador */}
      {!isSolo && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player, idx) => {
            const isCurrent = idx === currentTurnIndex;
            if (isCurrent) return null;

            return (
              <div
                key={player.id}
                className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-[5px_5px_0_var(--shadow-color)] rounded-3xl p-6 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{player.avatar}</span>
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-main)]">{capitalizeName(player.name)}</h3>
                    <div className="flex items-center gap-2 mt-0.5 justify-center flex-wrap">
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-[var(--border-color)] flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{player.coins || 0}</span>
                      </span>
                      <span className="text-xs font-black text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/80 px-2 py-0.5 rounded-full border border-[var(--border-color)] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>Racha {player.streak || 0}</span>
                      </span>
                      <span className="text-xs text-[var(--text-main)] opacity-80 font-bold">
                        {(player.characters || []).length} / 8 Personajes
                      </span>
                    </div>
                    {player.lives !== undefined && (
                      <div className="mt-1 flex justify-center">
                        <LivesDisplay lives={player.lives} />
                      </div>
                    )}
                  </div>
                </div>

                <CharacterCollectionGrid characters={player.characters || []} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

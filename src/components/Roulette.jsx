import React, { useState } from 'react';
import { CATEGORIES } from '../data/characters';
import { Sparkles, Compass, Heart, Crown } from 'lucide-react';
import { playSound } from '../utils/sound';

const CATEGORY_COLORS = {
  geografia: '#3b82f6',
  arte: '#ef4444',
  entretenimiento: '#ec4899',
  programacion: '#f8fafc',
  matematicas: '#a855f7',
  historia: '#FACC15',
  deportes: '#f97316',
  ciencia: '#10b981'
};

export default function Roulette({ currentPlayer, onCategorySelected, isChallenge }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rotation, setRotation] = useState(0);

  const segments = isChallenge
    ? CATEGORIES
    : [
        ...CATEGORIES,
        {
          id: 'corona',
          name: 'Corona',
          color: '#F59E0B',
          isCorona: true
        }
      ];

  const sectorAngle = 360 / segments.length;
  const gradientStops = segments.map((seg, idx) => {
    const start = idx * sectorAngle;
    const end = (idx + 1) * sectorAngle;
    const color = seg.isCorona ? '#F59E0B' : (CATEGORY_COLORS[seg.id] || '#3b82f6');
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  const spinRoulette = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedCategory(null);

    playSound('giro', segments.length);

    const randomIndex = Math.floor(Math.random() * segments.length);
    const chosen = segments[randomIndex];

    const extraSpins = 360 * 5;
    const segmentTarget = (segments.length - randomIndex) * sectorAngle - sectorAngle / 2;
    const currentMod = rotation % 360;
    const newRotation = rotation + extraSpins + ((segmentTarget - currentMod + 360) % 360);

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setSelectedCategory(chosen);
      playSound('revelacion');
    }, 3000);
  };

  const handleConfirm = () => {
    if (selectedCategory) {
      onCategorySelected(selectedCategory);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center animate-fadeIn font-fredoka text-[var(--text-main)]">
      {/* Turno Actual */}
      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-hard rounded-2xl p-4 mb-6 flex items-center justify-center gap-3 backdrop-blur-md">
        <span className="text-3xl">{currentPlayer.avatar}</span>
        <div>
          <span className="text-xs text-[var(--text-main)] opacity-80 uppercase tracking-wider block font-bold">Turno de</span>
          <span className="text-xl font-black text-[var(--text-main)]">{currentPlayer.name}</span>
          {currentPlayer.lives !== undefined && (
            <div className="flex items-center gap-1 justify-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${i < currentPlayer.lives ? 'text-red-500 fill-red-500' : 'text-slate-400 fill-slate-200 dark:fill-slate-800'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-hard rounded-3xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Compass className="w-40 h-40 text-[var(--text-main)]" />
        </div>

        <h2 className="text-2xl font-black mb-2 tracking-tight text-[var(--text-main)]">Gira la Ruleta</h2>
        <p className="text-[var(--text-main)] opacity-80 text-sm mb-8 font-medium">Descubre la categoría de tu próxima pregunta</p>

        {/* Contenedor de la Ruleta Visual */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          {/* Indicador superior (Puntero más marcado) */}
          <div className="absolute -top-6 z-20 w-10 h-10 bg-[var(--btn-primary-bg)] rounded-lg border-[3px] border-[var(--border-color)] shadow-hard flex items-center justify-center text-sm font-black text-[var(--btn-text)] transform rotate-180">
            ▼
          </div>

          {/* Rueda giratoria */}
          <div
            className="w-full h-full rounded-full border-[6px] border-[var(--border-color)] shadow-hard relative overflow-hidden transition-all ease-out"
            style={{
              transitionDuration: spinning ? '3s' : '0s',
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${gradientStops})`
            }}
          >
            {segments.map((seg, idx) => {
              if (!seg.isCorona) return null;
              const midAngle = idx * sectorAngle + sectorAngle / 2;
              return (
                <div
                  key={seg.id || idx}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `rotate(${midAngle}deg)` }}
                >
                  <div
                    className="absolute top-6 flex items-center justify-center"
                    style={{ transform: `rotate(-${midAngle}deg)` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D97706] border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                      <Crown className="w-4 h-4 text-white fill-amber-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centro de la Ruleta */}
          <div className="absolute z-10 w-20 h-20 bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-full flex items-center justify-center shadow-hard">
            <Sparkles className="w-8 h-8 text-[var(--text-main)] animate-spin-slow" />
          </div>
        </div>

        {/* Resultado o Botón de Giro */}
        {selectedCategory ? (
          <div className="animate-bounce-subtle space-y-4">
            {/* Categoría seleccionada */}
            <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard text-lg font-bold bg-[var(--card-bg)] text-[var(--text-main)]">
              {selectedCategory.isCorona ? (
                <div className="w-12 h-12 bg-[#F59E0B] text-white rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center shadow-md">
                  <Crown className="w-7 h-7 text-white fill-amber-300" />
                </div>
              ) : (
                <img
                  src={selectedCategory.character.image}
                  alt={selectedCategory.character.name}
                  className="w-12 h-12 object-cover rounded-xl border-2 border-[var(--border-color)]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span>{selectedCategory.isCorona ? '¡Casilla Corona!' : selectedCategory.name}</span>
            </div>

            {selectedCategory.isCorona && (
              <div className="flex flex-col items-center gap-2 bg-amber-100 dark:bg-amber-950/80 border-2 border-[var(--border-color)] px-4 py-3 rounded-2xl text-amber-800 dark:text-amber-300 font-bold shadow-[2px_2px_0_var(--shadow-color)] animate-pulse">
                <span>🔥 Racha llena al instante (3/3)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className="w-6 h-3.5 rounded-sm border border-[var(--border-color)] bg-orange-500 animate-bounce"
                      style={{ animationDelay: `${seg * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-lg rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {selectedCategory.isCorona ? '¡Iniciar Desafío de Corona!' : '¡Jugar Pregunta!'}
              </button>
            </div>
          </div>
        ) : (
          <button
            data-no-sound
            onClick={spinRoulette}
            disabled={spinning}
            className={`w-full py-4 rounded-2xl font-black text-lg border-[3px] border-[var(--border-color)] shadow-hard transition-all flex items-center justify-center gap-2 ${
              spinning
                ? 'bg-slate-200 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                : 'bg-[var(--btn-primary-bg)] text-[var(--btn-text)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
            }`}
          >
            {spinning ? 'Girando ruleta...' : '¡Girar Ruleta!'}
          </button>
        )}
      </div>
    </div>
  );
}

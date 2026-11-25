import React, { useState } from 'react';
import { CATEGORIES } from '../data/characters';
import { Crown, Sparkles, Play } from 'lucide-react';
import { playSound } from '../utils/sound';

export default function ChallengeModal({ currentPlayer, onSelectCategory }) {
  const [selectedCatId, setSelectedCatId] = useState(null);

  const handleStartChallenge = () => {
    if (!selectedCatId) return;
    playSound('inicio');
    const cat = CATEGORIES.find(c => c.id === selectedCatId);
    onSelectCategory(cat);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]">
      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-xl w-full p-6 sm:p-8 text-center shadow-hard relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500" />
        
        <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl border-2 border-[var(--border-color)] mx-auto flex items-center justify-center text-3xl shadow-lg mb-4 animate-bounce">
          👑
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950/80 border border-[var(--border-color)] px-4 py-1.5 rounded-full text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          ¡Racha de 3 Alcanzada! · ¡Corona!
        </div>

        <h2 className="text-3xl font-black text-[var(--text-main)] mb-2">
          {currentPlayer.name}, elige una Corona
        </h2>
        <p className="text-sm text-[var(--text-main)] opacity-80 mb-6">
          Selecciona el personaje que deseas desafiar. Si aciertas en 20 segundos, ¡te lo llevas sin arriesgar vidas!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {CATEGORIES.map((cat) => {
            const owned = currentPlayer.characters?.includes(cat.id);
            const isSelected = selectedCatId === cat.id;

            return (
              <button
                key={cat.id}
                disabled={owned}
                onClick={() => { playSound('click'); setSelectedCatId(cat.id); }}
                className={`p-3 rounded-2xl border-[3px] flex flex-col items-center transition-all ${
                  owned
                    ? 'opacity-40 grayscale bg-slate-200 dark:bg-slate-800 border-slate-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[var(--card-selected-bg)] border-[var(--border-color)] shadow-hard scale-105 font-black'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:scale-102 shadow-[2px_2px_0_var(--shadow-color)]'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 relative flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                  <img
                    src={cat.character.image}
                    alt={cat.character.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {owned && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold truncate w-full">{cat.character.name}</span>
                <span className="text-[10px] opacity-70 truncate w-full">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <button
          disabled={!selectedCatId}
          onClick={handleStartChallenge}
          className={`w-full py-4 text-xl font-black rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard transition-all flex items-center justify-center gap-2 ${
            selectedCatId
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-text)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          Jugar Desafío
        </button>
      </div>
    </div>
  );
}

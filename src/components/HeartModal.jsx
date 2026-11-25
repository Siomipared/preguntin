import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { GAME_CONFIG } from '../config/gameConfig';
import { playSound } from '../utils/sound';

export default function HeartModal({ currentPlayer, onBuy, onSkip }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]">
      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-hard relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-500 to-pink-500" />

        <div className="w-16 h-16 bg-red-500 text-white rounded-2xl border-2 border-[var(--border-color)] mx-auto flex items-center justify-center text-3xl shadow-lg mb-4 animate-bounce">
          <Heart className="w-8 h-8 fill-white text-white" />
        </div>

        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/80 border border-[var(--border-color)] px-4 py-1.5 rounded-full text-red-800 dark:text-red-300 text-xs font-bold mb-2">
          <ShoppingBag className="w-4 h-4 text-red-500" />
          ¡Oportunidad de Salvavidas!
        </div>

        <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">
          ¿Comprar una vida por {GAME_CONFIG.corazonPrecio} monedas?
        </h2>
        <p className="text-sm text-[var(--text-main)] opacity-80 mb-6">
          {currentPlayer.name}, tienes {currentPlayer.coins || 0} monedas y {currentPlayer.lives} vidas. ¿Deseas recuperar 1 vida?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => { playSound('click'); onSkip(); }}
            className="flex-1 py-3 px-4 rounded-2xl border-[3px] border-[var(--border-color)] font-bold bg-slate-200 dark:bg-slate-700 text-[var(--text-main)] hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-[2px_2px_0_var(--shadow-color)]"
          >
            No, gracias
          </button>
          <button
            onClick={() => { playSound('success'); onBuy(); }}
            className="flex-1 py-3 px-4 rounded-2xl border-[3px] border-[var(--border-color)] font-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Comprar (⭐ {GAME_CONFIG.corazonPrecio})
          </button>
        </div>
      </div>
    </div>
  );
}

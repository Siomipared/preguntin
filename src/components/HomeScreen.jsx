import React from 'react';
import CharacterGrid from './CharacterGrid';
import { Play } from 'lucide-react';
import { playSound } from '../utils/sound';

export default function HomeScreen({ onGoToMenu, savedGame, onResumeGame }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-fredoka text-[var(--text-main)] flex flex-col items-center overflow-x-hidden">
      
      {/* Título "Preguntín" en texto: Fredoka 700, clamp(48px, 10vw, 96px), blanco con contorno tinta grueso, rotado -2°, centrado */}
      <div className="text-center mb-8 flex flex-col items-center">
        <h1 
          className="font-fredoka font-bold text-white select-none leading-none"
          style={{
            fontSize: 'clamp(48px, 10vw, 96px)',
            transform: 'rotate(-2deg)',
            textShadow: '3px 3px 0 var(--border-color), -3px -3px 0 var(--border-color), 3px -3px 0 var(--border-color), -3px 3px 0 var(--border-color), 6px 6px 0 var(--border-color)'
          }}
        >
          Preguntín
        </h1>
      </div>

      {/* Los 8 personajes (grande) */}
      <CharacterGrid size="grande" />

      {/* Botones de acción: Jugar y (opcional) Continuar partida */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {savedGame && (
          <button
            onClick={() => {
              playSound('inicio');
              onResumeGame();
            }}
            className="w-full py-4 bg-[var(--card-bg)] text-[var(--text-main)] font-black text-xl border-[3px] border-[var(--border-color)] shadow-[5px_5px_0_var(--shadow-color)] rounded-2xl active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current text-[var(--text-main)]" />
            <span>Continuar partida</span>
          </button>
        )}

        <button
          onClick={() => {
            playSound('inicio');
            onGoToMenu();
          }}
          className="w-full py-5 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-2xl border-[3px] border-[var(--border-color)] shadow-[5px_5px_0_var(--shadow-color)] rounded-2xl active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7 fill-current text-[var(--btn-text)]" />
          <span>Jugar</span>
        </button>
      </div>

    </div>
  );
}

import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Settings, RotateCcw } from 'lucide-react';

export default function Header({
  screen,
  onGoHome,
  onGoMenu,
  onResetGame,
  isDarkMode,
  setIsDarkMode,
  isMuted,
  toggleMute,
  setIsSettingsOpen
}) {
  return (
    <header className="border-b-[3px] border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] sticky top-0 z-40 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_20px_rgba(61,50,112,0.1)]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
        <div className="w-[48px] h-[48px] rounded-[12px] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
          <img 
            src="/images/icon-512.png" 
            alt="Preguntín Icon" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1 className="font-fredoka font-bold text-[26px] tracking-tight text-[var(--text-main)]">
            Preguntín
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] transition-all flex items-center justify-center font-bold hover:opacity-90"
          title={isDarkMode ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[var(--text-main)]" />}
        </button>

        <button
          onClick={toggleMute}
          data-no-sound
          className="p-2.5 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] transition-all flex items-center justify-center font-bold hover:opacity-90"
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Configuración"
          className="p-2.5 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] transition-all flex items-center justify-center font-bold hover:opacity-90"
          title="Configuración"
        >
          <Settings className="w-4 h-4 text-[var(--text-main)] dark:text-purple-400" />
        </button>

        {screen === 'menu' && (
          <button
            onClick={onGoHome}
            className="text-xs font-bold bg-[var(--card-bg)] hover:opacity-90 text-[var(--text-main)] px-3 py-2.5 rounded-xl border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] transition-all"
          >
            Inicio
          </button>
        )}

        {screen === 'partida' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onResetGame}
              className="text-xs font-bold bg-[var(--card-bg)] hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border-[3px] border-[var(--border-color)] px-3 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-[3px_3px_0_var(--shadow-color)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
            <button
              onClick={onGoMenu}
              className="text-xs font-bold bg-[var(--card-bg)] hover:opacity-90 text-[var(--text-main)] px-3 py-2.5 rounded-xl border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] transition-all"
            >
              Menú
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

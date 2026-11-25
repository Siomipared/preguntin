import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Trash2, RotateCcw, HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onResetGame }) {
  const [successMsg, setSuccessMsg] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm("¿Seguro? Las preguntas podrán repetirse")) {
      try {
        localStorage.removeItem('preguntados_seen_questions');
        setSuccessMsg("¡Historial de preguntas vistas borrado correctamente!");
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFullReset = () => {
    if (window.confirm("¿Estás seguro de reiniciar el progreso y la colección?")) {
      if (window.confirm("¿Confirmas totalmente? Se perderá la partida actual y todos los datos guardados.")) {
        onClose();
        onResetGame();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-fredoka text-[var(--text-main)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-hard relative outline-none max-h-[90vh] overflow-y-auto"
      >
        {/* Botón Cerrar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] border-[2px] border-[var(--border-color)] flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 transition-all shadow-[2px_2px_0_var(--shadow-color)]"
          aria-label="Cerrar configuración"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--btn-primary-bg)] border-[2px] border-[var(--border-color)] flex items-center justify-center text-[var(--btn-text)] shadow-[3px_3px_0_var(--shadow-color)]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
              Configuración
            </h2>
            <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] opacity-80">
              Gestión de datos, reglas e información
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 border-[2px] border-emerald-600 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce-once">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Sección 1: Datos */}
          <div className="bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-[2px_2px_0_var(--shadow-color)]">
            <h3 className="text-base font-black text-[var(--text-main)] mb-3 uppercase tracking-wide flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              1. Datos y Almacenamiento
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleClearHistory}
                className="w-full py-3 px-4 bg-[var(--card-bg)] hover:opacity-90 text-[var(--text-main)] font-bold text-xs sm:text-sm border-[2px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] rounded-xl transition-all flex items-center justify-between"
              >
                <span>Borrar historial de preguntas vistas</span>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

              <button
                onClick={handleFullReset}
                className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm border-[2px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] rounded-xl transition-all flex items-center justify-between"
              >
                <span>Reiniciar progreso y colección</span>
                <RotateCcw className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>

          {/* Sección 2: Cómo Jugar */}
          <div className="bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-[2px_2px_0_var(--shadow-color)]">
            <h3 className="text-base font-black text-[var(--text-main)] mb-3 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              2. Cómo Jugar
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] opacity-90 font-semibold">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-color)]">1</span>
                <span><strong>Modos de juego:</strong> Solitario, Multijugador Local (con vidas) o Creación de Sala (hasta 5 jugadores).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-color)]">2</span>
                <span><strong>Gira la Ruleta:</strong> En tu turno, gira la ruleta para seleccionar la categoría de tu pregunta.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-color)]">3</span>
                <span><strong>Racha y Desafíos:</strong> Cada acierto suma a tu racha. Al llegar a 3, ¡se abre el Desafío de Corona!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-color)]">4</span>
                <span><strong>Colección:</strong> Colecciona los 8 personajes únicos. Quien junte los 8 gana al instante.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--border-color)]">5</span>
                <span><strong>Vidas:</strong> Tienes 5 vidas. Fallar o agotar el tiempo resta 1 vida. Llegar a 0 vidas termina la partida.</span>
              </li>
            </ul>
          </div>

          {/* Sección 3: Acerca de */}
          <div className="bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-[2px_2px_0_var(--shadow-color)]">
            <h3 className="text-base font-black text-[var(--text-main)] mb-2 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              3. Acerca de
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-90 font-semibold mb-1">
              <strong>Versión:</strong> 1.0.0 Oficial
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-90 font-semibold">
              Juego de trivia de personajes y cultura general. ¡Diviértete completando tu álbum!
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-base border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] rounded-2xl active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

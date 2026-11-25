import React from 'react';

export default function CharacterReactionPopup({ category, phrase, correct }) {
  if (!category || !category.character) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 pointer-events-none flex items-end gap-3 animate-bounce-subtle"
    >
      {/* Globo de diálogo */}
      <div className="bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-hard rounded-2xl px-4 py-2.5 max-w-xs text-center relative mb-2">
        <p className="text-sm sm:text-base font-black text-[var(--text-main)]">
          {phrase}
        </p>
        {/* Puntero del globo */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--card-bg)] border-r-[3px] border-b-[3px] border-[var(--border-color)] transform rotate-45" />
      </div>

      {/* Imagen del personaje */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[var(--border-color)] shadow-hard overflow-hidden bg-white flex-shrink-0">
        <img
          src={category.character.image}
          alt={category.character.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}

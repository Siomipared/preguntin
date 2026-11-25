import React from 'react';
import { CATEGORIES } from '../data/characters';

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

const rotations = ['rotate-[-3deg]', 'rotate-[3deg]', 'rotate-[-2deg]', 'rotate-[2deg]', 'rotate-[-3deg]', 'rotate-[3deg]', 'rotate-[-2deg]', 'rotate-[2deg]'];

export default function CharacterGrid({ size = 'grande' }) {
  if (size === 'chico') {
    return (
      <div className="w-full flex justify-center mb-6 overflow-x-hidden">
        <div className="grid grid-cols-4 sm:flex sm:flex-row sm:flex-nowrap justify-center items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {CATEGORIES.map((cat, idx) => {
            const rotClass = rotations[idx % rotations.length];
            return (
              <div
                key={cat.id}
                className={`flex flex-col items-center ${rotClass}`}
              >
                <div
                  className="rounded-full border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] flex items-center justify-center overflow-hidden mb-1.5 bg-white"
                  style={{
                    width: 'clamp(64px, 9vw, 80px)',
                    height: 'clamp(64px, 9vw, 80px)',
                    backgroundColor: CATEGORY_BG[cat.id] || '#cbd5e1'
                  }}
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
                  <span className="text-2xl" style={{ display: 'none' }}>{cat.icon}</span>
                </div>
                <div 
                  className="font-black text-[var(--cat-text)] text-center leading-tight whitespace-nowrap" 
                  style={{ 
                    fontSize: 'clamp(14px, 1.6vw, 16px)'
                  }}
                >
                  {cat.character.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // size === 'grande'
  return (
    <div className="mb-10 w-full flex flex-col items-center">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl justify-items-center">
        {CATEGORIES.map((cat, idx) => {
          const rotClass = rotations[idx % rotations.length];

          return (
            <div
              key={cat.id}
              className={`flex flex-col items-center ${rotClass} animate-bounce-once motion-reduce:animate-none`}
            >
              <div
                className="rounded-full border-[3px] border-[var(--border-color)] shadow-[4px_4px_0_var(--shadow-color)] flex items-center justify-center overflow-hidden mb-2"
                style={{
                  width: 'clamp(100px, 14vw, 150px)',
                  height: 'clamp(100px, 14vw, 150px)',
                  backgroundColor: CATEGORY_BG[cat.id] || '#cbd5e1'
                }}
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
                <span className="text-4xl" style={{ display: 'none' }}>{cat.icon}</span>
              </div>
              <div 
                className="font-black text-[var(--cat-text)] text-center leading-tight" 
                style={{ 
                  fontSize: 'clamp(22px, 2.5vw, 26px)'
                }}
              >
                {cat.character.name}
              </div>
              <div 
                className="font-bold text-[var(--text-main)] opacity-90 text-center" 
                style={{ 
                  fontSize: '14px'
                }}
              >
                {cat.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

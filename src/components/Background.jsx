import React from 'react';

const CONFETTI_ITEMS = [
  { type: 'circle', color: '#3b82f6', top: 12, left: 10, size: 24, rot: 0 },
  { type: 'star', color: '#ef4444', top: 18, left: 85, size: 32, rot: 15 },
  { type: 'diamond', color: '#ec4899', top: 75, left: 8, size: 28, rot: -10 },
  { type: 'circle', color: '#10b981', top: 82, left: 90, size: 20, rot: 0 },
  { type: 'star', color: '#f5c542', top: 40, left: 92, size: 36, rot: 25 },
  { type: 'diamond', color: '#a855f7', top: 35, left: 5, size: 22, rot: -15 },
  { type: 'circle', color: '#22D3EE', top: 88, left: 45, size: 30, rot: 0 },
  { type: 'star', color: '#f97316', top: 8, left: 48, size: 26, rot: 12 },
  { type: 'diamond', color: '#3b82f6', top: 55, left: 3, size: 20, rot: 5 },
  { type: 'circle', color: '#ef4444', top: 60, left: 95, size: 25, rot: 0 },
  { type: 'star', color: '#ec4899', top: 25, left: 20, size: 28, rot: -20 },
  { type: 'diamond', color: '#10b981', top: 90, left: 25, size: 22, rot: 18 },
  { type: 'circle', color: '#f5c542', top: 15, left: 70, size: 26, rot: 0 },
  { type: 'star', color: '#a855f7', top: 70, left: 75, size: 34, rot: -8 },
  { type: 'diamond', color: '#22D3EE', top: 45, left: 85, size: 24, rot: 10 }
];

export default function Background() {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-[var(--bg-base)] transition-colors duration-300">
      <div className="absolute inset-0 opacity-25">
        {CONFETTI_ITEMS.map((item, idx) => {
          const varColor = `var(--confetti-${(idx % 5) + 1})`;
          const style = {
            top: `${item.top}%`,
            left: `${item.left}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            backgroundColor: item.type !== 'star' ? varColor : 'transparent',
            color: varColor,
            transform: `rotate(${item.rot}deg)`,
            borderRadius: item.type === 'circle' ? '50%' : item.type === 'diamond' ? '4px' : '0'
          };

          if (item.type === 'star') {
            return (
              <div key={idx} className="absolute" style={style}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            );
          }
          if (item.type === 'diamond') {
            return (
              <div key={idx} className="absolute rotate-45" style={{ ...style, borderRadius: '4px' }} />
            );
          }
          return (
            <div key={idx} className="absolute" style={style} />
          );
        })}
      </div>
    </div>
  );
}

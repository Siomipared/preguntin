import React from 'react';

export default function TomatoAnimation() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = prefersReduced ? 1 : 6;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden animate-screen-shake">
      {Array.from({ length: count }).map((_, i) => {
        const left = prefersReduced ? 50 : 15 + (i * 14);
        const delay = prefersReduced ? 0 : i * 0.1;
        return (
          <div
            key={i}
            className="absolute -top-16 text-4xl sm:text-5xl animate-tomato-fall"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: prefersReduced ? '0.4s' : '0.8s',
              animationFillMode: 'forwards'
            }}
          >
            🍅
          </div>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import CharacterGrid from './CharacterGrid';
import { PRESET_AVATARS } from '../data/characters';
import { GAME_CONFIG } from '../config/gameConfig';
import { Users, User, Play, Trophy } from 'lucide-react';
import { playSound } from '../utils/sound';

export default function MainMenu({ onStartGame, savedGame, onResumeGame }) {
  const [mode, setMode] = useState('solitario'); // 'solitario' | 'local' | 'sala'
  const [playerNames, setPlayerNames] = useState(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'Jugador 5']);
  const [playerAvatars, setPlayerAvatars] = useState(['🦊', '🐼', '🦁', '🐯', '🦄']);
  const [numPlayers, setNumPlayers] = useState(2);

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleAvatarSelect = (playerIndex, avatar) => {
    const newAvatars = [...playerAvatars];
    newAvatars[playerIndex] = avatar;
    setPlayerAvatars(newAvatars);
  };

  const handleStart = (e) => {
    e.preventDefault();
    playSound('inicio');

    let configuredPlayers = [];

    if (mode === 'solitario') {
      configuredPlayers = [
        { id: 1, name: playerNames[0].trim() || 'Jugador 1', avatar: playerAvatars[0], characters: [], streak: 0, coins: GAME_CONFIG.monedasIniciales, categoryStreaks: {} }
      ];
    } else if (mode === 'local') {
      configuredPlayers = [
        { id: 1, name: playerNames[0].trim() || 'Jugador 1', avatar: playerAvatars[0], characters: [], streak: 0, coins: GAME_CONFIG.monedasIniciales, categoryStreaks: {} },
        { id: 2, name: playerNames[1].trim() || 'Jugador 2', avatar: playerAvatars[1], characters: [], streak: 0, coins: GAME_CONFIG.monedasIniciales, categoryStreaks: {} }
      ];
    } else {
      configuredPlayers = [];
      for (let i = 0; i < numPlayers; i++) {
        configuredPlayers.push({
          id: i + 1,
          name: playerNames[i].trim() || `Jugador ${i + 1}`,
          avatar: playerAvatars[i],
          characters: [],
          streak: 0,
          coins: GAME_CONFIG.monedasIniciales,
          categoryStreaks: {}
        });
      }
    }

    onStartGame({ mode, players: configuredPlayers });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-fredoka text-[#1B1340] dark:text-white flex flex-col items-center overflow-x-hidden">
      
      {/* 1. Título */}
      <div className="text-center mb-4 flex flex-col items-center">
        <h1 
          className="font-black text-white select-none leading-none"
          style={{
            fontSize: 'clamp(52px, 8vw, 88px)',
            transform: 'rotate(-2deg)',
            textShadow: '3px 3px 0 #1B1340, -3px -3px 0 #1B1340, 3px -3px 0 #1B1340, -3px 3px 0 #1B1340, 6px 6px 0 #1B1340'
          }}
        >
          Preguntados
        </h1>
      </div>

      {/* 2. 8 Personajes en versión chica */}
      <CharacterGrid size="chico" />

      {/* 3. Tarjeta Principal (Modos y Jugadores) */}
      <div className="w-full bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-hard rounded-3xl p-6 sm:p-8 flex flex-col items-center mb-16">
        
        {savedGame && (
          <div className="w-full mb-6 p-4 bg-[var(--accent-pink)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-extrabold text-[var(--text-main)] text-base">
                Partida en curso detectada
              </h3>
              <p className="text-sm text-[var(--text-main)] opacity-90 mt-1 font-semibold">
                Modo: <strong className="capitalize">{savedGame.gameMode}</strong> | Jugadores: {savedGame.players.map(p => `${p.avatar} ${p.name}`).join(', ')}
              </p>
            </div>
            <button
              onClick={() => { playSound('inicio'); onResumeGame(); }}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-base border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] rounded-xl active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Continuar Partida
            </button>
          </div>
        )}

        <form onSubmit={handleStart} className="w-full space-y-6 flex flex-col items-center">
          
          {/* Selección de Modo de Juego */}
          <div className="w-full flex flex-col items-center">
            <label className="block text-base font-bold text-[var(--text-main)] mb-3 text-center">
              Selecciona el Modo de Juego
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              
              <button
                type="button"
                onClick={() => setMode('solitario')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-[3px] border-[var(--border-color)] transition-all ${
                  mode === 'solitario'
                    ? 'bg-[var(--card-selected-bg)] text-[var(--text-main)] -translate-y-1 shadow-hard font-black'
                    : 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-[3px_3px_0_var(--shadow-color)] hover:opacity-90'
                }`}
              >
                <User className="w-8 h-8 mb-2 text-[var(--text-main)]" />
                <span className="font-bold text-lg">Solitario</span>
                <span className="text-sm mt-1 text-center font-medium opacity-90">Colecciona los 8 personajes tú solo</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('local')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-[3px] border-[var(--border-color)] transition-all ${
                  mode === 'local'
                    ? 'bg-[var(--card-selected-bg)] text-[var(--text-main)] -translate-y-1 shadow-hard font-black'
                    : 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-[3px_3px_0_var(--shadow-color)] hover:opacity-90'
                }`}
              >
                <Users className="w-8 h-8 mb-2 text-[var(--text-main)]" />
                <span className="font-bold text-lg">Multijugador Local</span>
                <span className="text-sm mt-1 text-center font-medium opacity-90">Multijugador Local · 2 jugadores · 5 vidas cada uno</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('sala')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-[3px] border-[var(--border-color)] transition-all ${
                  mode === 'sala'
                    ? 'bg-[var(--card-selected-bg)] text-[var(--text-main)] -translate-y-1 shadow-hard font-black'
                    : 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-[3px_3px_0_var(--shadow-color)] hover:opacity-90'
                }`}
              >
                <Trophy className="w-8 h-8 mb-2 text-[var(--text-main)]" />
                <span className="font-bold text-lg">Crear Sala</span>
                <span className="text-sm mt-1 text-center font-medium opacity-90">Crear Sala · de 2 a 5 jugadores</span>
              </button>

            </div>
          </div>

          {mode === 'sala' && (
            <div className="w-full bg-[var(--card-bg)] p-4 rounded-2xl border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] flex flex-col items-center">
              <label className="block text-base font-bold text-[var(--text-main)] mb-2 text-center">
                Número de Participantes (2 a 5): <span className="text-[var(--text-main)] font-black">{numPlayers}</span>
              </label>
              <div className="flex gap-3 w-full max-w-xs">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumPlayers(n)}
                    className={`flex-1 py-2.5 rounded-xl font-bold border-[3px] border-[var(--border-color)] transition-all ${
                      numPlayers === n
                        ? 'bg-[var(--card-selected-bg)] text-[var(--text-main)] shadow-[3px_3px_0_var(--shadow-color)] font-black'
                        : 'bg-[var(--card-bg)] text-[var(--text-main)]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Configuración de Jugadores */}
          <div className="w-full flex flex-col items-center space-y-4">
            <label className="block text-base font-bold text-[var(--text-main)] text-center">
              Configuración de Jugadores
            </label>
            
            <div className="w-full max-h-[55vh] overflow-y-auto pr-1 space-y-4 flex flex-col items-center">
              {Array.from({ length: mode === 'solitario' ? 1 : mode === 'local' ? 2 : numPlayers }).map((_, index) => (
                <div key={index} className="w-full max-w-md bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] p-4 rounded-2xl flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-3 w-full">
                    <span className="w-8 h-8 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-text)] border-[2px] border-[var(--border-color)] flex items-center justify-center font-bold text-sm">
                      P{index + 1}
                    </span>
                    <input
                      type="text"
                      maxLength={15}
                      value={playerNames[index]}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Nombre Jugador ${index + 1}`}
                      className="bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-main)] font-bold text-center w-48 shadow-inner"
                    />
                  </div>

                  {/* Selector de Avatar */}
                  <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => handleAvatarSelect(index, av)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border-[2px] border-[var(--border-color)] ${
                          playerAvatars[index] === av
                            ? 'bg-[var(--btn-primary-bg)] scale-110 shadow-[2px_2px_0_var(--shadow-color)] text-[var(--btn-text)] font-black'
                            : 'bg-[var(--card-bg)] hover:opacity-80 text-[var(--text-main)]'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de Inicio CTA Principal (Sticky en celular abajo) */}
          <div className="sticky bottom-4 z-20 w-full max-w-[480px] pt-2 pb-2 bg-[var(--bg-base)]/95 backdrop-blur-sm flex justify-center">
            <button
              data-no-sound
              type="submit"
              className="w-full py-4 bg-[var(--btn-primary-bg)] text-[var(--btn-text)] font-black text-xl border-[3px] border-[var(--border-color)] shadow-hard rounded-2xl active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-current text-[var(--btn-text)]" />
              <span>¡Comenzar Nueva Partida!</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import { GAME_CONFIG } from '../config/gameConfig';
import { Clock, Heart, Bomb } from 'lucide-react';
import { playSuccessSound, playSadTrombone, playSound, tone, getMuteState, stopAll } from '../utils/sound';
import { pickQuestion } from '../utils/pickQuestion';
import { triggerStreamersAndConfetti } from '../utils/confetti';
import { getFrasePorRespuesta } from '../data/frases';
import TomatoAnimation from './TomatoAnimation';
import CharacterReactionPopup from './CharacterReactionPopup';

export default function QuestionScreen({ category, currentPlayer, players, currentTurnIndex, gameMode, isChallenge, isBomb, onAnswerResult, onUpdatePlayer, onSpinAgain }) {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const timeLimit = isChallenge ? GAME_CONFIG.tiempoPreguntaDesafio : isBomb ? GAME_CONFIG.tiempoBomba : GAME_CONFIG.tiempoPreguntaNormal;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [answered, setAnswered] = useState(false);
  const [showTomates, setShowTomates] = useState(false);
  const [reactionPhrase, setReactionPhrase] = useState('');
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [helpUsedThisTurn, setHelpUsedThisTurn] = useState(false);
  const [prizeNotification, setPrizeNotification] = useState('');
  const [showBombAlertModal, setShowBombAlertModal] = useState(isBomb);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [awardedPrizeMsg, setAwardedPrizeMsg] = useState('');

  const handleBombPrize = (player) => {
    const availableRewards = [];
    if (player.lives < GAME_CONFIG.vidasMaximas) {
      availableRewards.push('vida');
    }
    if ((player.inventory?.['girarDeNuevo'] || 0) < GAME_CONFIG.ayudaMaxInventario) {
      availableRewards.push('girarDeNuevo');
    }
    if ((player.inventory?.['5050'] || 0) < GAME_CONFIG.ayudaMaxInventario) {
      availableRewards.push('5050');
    }

    let prizeMsg = '';
    const updated = {
      ...player,
      inventory: { ...(player.inventory || { '5050': 1, cambiarPregunta: 1, tiempoExtra: 1, girarDeNuevo: 1 }) },
      coins: player.coins !== undefined ? player.coins : GAME_CONFIG.monedasIniciales
    };

    if (availableRewards.length > 0) {
      const chosenReward = availableRewards[Math.floor(Math.random() * availableRewards.length)];
      if (chosenReward === 'vida') {
        updated.lives = Math.min(GAME_CONFIG.vidasMaximas, updated.lives + 1);
        prizeMsg = '¡Premio Bomba: +1 Vida! ❤️';
      } else if (chosenReward === 'girarDeNuevo') {
        updated.inventory.girarDeNuevo = Math.min(GAME_CONFIG.ayudaMaxInventario, (updated.inventory.girarDeNuevo || 0) + 1);
        prizeMsg = '¡Premio Bomba: +1 Girar de nuevo! 🎲';
      } else if (chosenReward === '5050') {
        updated.inventory['5050'] = Math.min(GAME_CONFIG.ayudaMaxInventario, (updated.inventory['5050'] || 0) + 1);
        prizeMsg = '¡Premio Bomba: +1 50/50! ✂️';
      }
    } else {
      updated.coins = (updated.coins || 0) + 20;
      prizeMsg = '¡Premio Bomba: +20 Monedas! ⭐';
    }

    return { updatedPlayer: updated, prizeMsg };
  };

  const handleDismissPrizeModal = () => {
    setShowPrizeModal(false);
    onAnswerResult({
      correct: true,
      questionId: question.uniqueId,
      category: category.id,
      isChallenge,
      isBomb,
      prizeAlreadyApplied: true
    });
  };

  useEffect(() => {
    if (isBomb) {
      playSound('bomba');
    }
    return () => {
      stopAll();
    };
  }, [isBomb]);

  useEffect(() => {
    let activeQ = null;
    try {
      const storedActive = localStorage.getItem('preguntados_active_question');
      if (storedActive) {
        const parsed = JSON.parse(storedActive);
        if (parsed && parsed.categoryId === category.id && parsed.playerId === currentPlayer.id) {
          activeQ = parsed;
        }
      }
    } catch (e) {
      console.error('Error leyendo pregunta activa:', e);
    }

    if (activeQ && activeQ.question) {
      setQuestion(activeQ.question);
      const remaining = activeQ.timeLeft !== undefined ? activeQ.timeLeft : timeLimit;
      setTimeLeft(remaining);
      setAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
      if (remaining <= 0) {
        handleAnswer(false, -1);
      }
      return;
    }

    const catQuestions = questionsData[category.id] || [];
    
    let seenIds = [];
    try {
      const stored = localStorage.getItem('preguntados_seen_questions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed[category.id])) {
          seenIds = parsed[category.id];
        }
      }
    } catch (e) {
      console.error('Error leyendo historial de preguntas:', e);
    }

    const { question: chosen, questionId, updatedSeenIds } = pickQuestion(catQuestions, seenIds);

    try {
      let allSeen = {};
      const stored = localStorage.getItem('preguntados_seen_questions');
      if (stored) {
        allSeen = JSON.parse(stored) || {};
      }
      allSeen[category.id] = updatedSeenIds;
      localStorage.setItem('preguntados_seen_questions', JSON.stringify(allSeen));
    } catch (e) {
      console.error('Error guardando historial de preguntas:', e);
    }

    const newQ = {
      ...chosen,
      uniqueId: questionId
    };
    setQuestion(newQ);
    setTimeLeft(timeLimit);
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowTomates(false);
    setReactionPhrase('');
    setHiddenOptions([]);
    setHelpUsedThisTurn(false);

    try {
      localStorage.setItem('preguntados_active_question', JSON.stringify({
        categoryId: category.id,
        playerId: currentPlayer.id,
        question: newQ,
        timeLeft: timeLimit
      }));
    } catch (e) {
      console.error('Error guardando pregunta activa:', e);
    }
  }, [category]);

  // Temporizador
  useEffect(() => {
    if (answered || !question || showBombAlertModal) return;

    if (timeLeft <= 0) {
      handleAnswer(false, -1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (!getMuteState()) {
          if (isBomb && next > 0) {
            playSound('timer', next);
          } else if (!isBomb && next > 0) {
            playSound('tic', next);
          }
        }
        try {
          localStorage.setItem('preguntados_active_question', JSON.stringify({
            categoryId: category.id,
            playerId: currentPlayer.id,
            question,
            timeLeft: next
          }));
        } catch (e) {}
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answered, question, showBombAlertModal, isBomb]);

  const handleUseHelp = (helpKey) => {
    if (helpUsedThisTurn || isChallenge) return;

    const qty = currentPlayer.inventory?.[helpKey] ?? 1;
    const alreadyBought = currentPlayer.compradasHelps?.[helpKey] ?? false;
    const price = GAME_CONFIG.ayudaPrecios[helpKey];

    const updatedPlayer = {
      ...currentPlayer,
      inventory: { ...(currentPlayer.inventory || { '5050': 1, cambiarPregunta: 1, tiempoExtra: 1, girarDeNuevo: 1 }) },
      compradasHelps: { ...(currentPlayer.compradasHelps || {}) },
      coins: currentPlayer.coins !== undefined ? currentPlayer.coins : GAME_CONFIG.monedasIniciales
    };

    if (qty > 0) {
      updatedPlayer.inventory[helpKey] = 0;
    } else {
      if (alreadyBought || updatedPlayer.coins < price) return;
      updatedPlayer.coins -= price;
      updatedPlayer.compradasHelps[helpKey] = true;
    }

    setHelpUsedThisTurn(true);
    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }

    if (helpKey === '5050') {
      const incorrectIndices = question.options
        .map((_, idx) => idx)
        .filter(idx => idx !== question.correct);
      const shuffledIncorrect = [...incorrectIndices].sort(() => Math.random() - 0.5);
      const toHide = shuffledIncorrect.slice(0, 2);
      setHiddenOptions(toHide);
    } else if (helpKey === 'cambiarPregunta') {
      const catQuestions = questionsData[category.id] || [];
      let seenIds = [];
      try {
        const stored = localStorage.getItem('preguntados_seen_questions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed[category.id])) {
            seenIds = parsed[category.id];
          }
        }
      } catch (e) {}

      const { question: chosen, questionId, updatedSeenIds } = pickQuestion(catQuestions, seenIds);
      try {
        let allSeen = {};
        const stored = localStorage.getItem('preguntados_seen_questions');
        if (stored) allSeen = JSON.parse(stored) || {};
        allSeen[category.id] = updatedSeenIds;
        localStorage.setItem('preguntados_seen_questions', JSON.stringify(allSeen));
      } catch (e) {}

      const newQ = { ...chosen, uniqueId: questionId };
      setQuestion(newQ);
      setTimeLeft(timeLimit);
      setHiddenOptions([]);
      try {
        localStorage.setItem('preguntados_active_question', JSON.stringify({
          categoryId: category.id,
          playerId: currentPlayer.id,
          question: newQ,
          timeLeft: timeLimit
        }));
      } catch (e) {}
    } else if (helpKey === 'tiempoExtra') {
      setTimeLeft(prev => prev + 10);
    } else if (helpKey === 'girarDeNuevo') {
      try {
        localStorage.removeItem('preguntados_active_question');
      } catch (e) {}
      if (onSpinAgain) {
        onSpinAgain();
      }
    }
  };

  const handleAnswer = (correct, index) => {
    if (answered || !question) return;
    setAnswered(true);
    stopAll();
    setIsCorrect(correct);
    setSelectedOption(index);

    try {
      localStorage.removeItem('preguntados_active_question');
    } catch (e) {}

    const nextStreak = correct ? (currentPlayer.streak || 0) + 1 : 0;
    const phrase = getFrasePorRespuesta({ correct, streak: nextStreak });
    setReactionPhrase(phrase);

    if (correct) {
      playSuccessSound(false);
      const CATEGORY_CONFETTI_COLORS = {
        geografia: ['#3b82f6', '#93c5fd', '#1d4ed8'],
        arte: ['#ef4444', '#fca5a5', '#b91c1c'],
        entretenimiento: ['#ec4899', '#f472b6', '#be185d'],
        programacion: ['#10b981', '#6ee7b7', '#047857'],
        matematicas: ['#a855f7', '#d8b4fe', '#7e22ce'],
        historia: ['#FACC15', '#fde047', '#a16207'],
        deportes: ['#f97316', '#fdba74', '#c2410c'],
        ciencia: ['#22d3ee', '#67e8f9', '#0e7490']
      };
      const colors = CATEGORY_CONFETTI_COLORS[category.id] || ['#f5c542', '#38bdf8', '#ec4899'];
      triggerStreamersAndConfetti({
        streak: nextStreak,
        colors
      });

      if (isBomb) {
        const { updatedPlayer, prizeMsg } = handleBombPrize(currentPlayer);
        if (onUpdatePlayer) {
          onUpdatePlayer(updatedPlayer);
        }
        setAwardedPrizeMsg(prizeMsg);
        setShowPrizeModal(true);
        return;
      }
    } else {
      playSadTrombone();
      setShowTomates(true);
      setTimeout(() => setShowTomates(false), 1200);
    }

    setTimeout(() => {
      onAnswerResult({
        correct,
        questionId: question.uniqueId,
        category: category.id,
        isChallenge,
        isBomb
      });
    }, 2000);
  };

  if (!question) return null;

  const progressPercentage = (timeLeft / timeLimit) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn font-fredoka text-[var(--text-main)] relative">
      {/* Carta Previa de Alerta de Pregunta Bomba */}
      {showBombAlertModal && isBomb && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card-bg)] border-[4px] border-red-500 shadow-hard rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden animate-bounce-subtle">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bomb className="w-48 h-48 text-red-500" />
            </div>
            <div className="w-20 h-20 bg-red-600 text-white rounded-2xl border-[3px] border-[var(--border-color)] flex items-center justify-center mx-auto mb-6 shadow-hard animate-pulse">
              <Bomb className="w-12 h-12 text-yellow-300 animate-bounce" />
            </div>
            <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mb-3 tracking-tight">
              ¡PREGUNTA BOMBA!
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4 bg-red-50 dark:bg-red-950/40 p-3 rounded-2xl border-2 border-red-300">
              <img
                src={category.character.image}
                alt={category.character.name}
                className="w-12 h-12 object-cover rounded-xl border-2 border-[var(--border-color)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="text-left">
                <span className="text-xs font-bold text-red-500 uppercase block">Categoría</span>
                <span className="text-base font-black text-[var(--text-main)]">{category.name} ({category.character.name})</span>
              </div>
            </div>
            <p className="text-base font-bold text-[var(--text-main)] opacity-90 mb-8 leading-relaxed">
              ¡Cuidado! Tienes solo <span className="text-red-500 font-black">{GAME_CONFIG.tiempoBomba} segundos</span> para responder. Si aciertas, ganarás un premio especial al azar. ¡Mucha suerte!
            </p>
            <button
              onClick={() => {
                playSound('burbuja');
                setShowBombAlertModal(false);
              }}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span>¡Jugar!</span>
              <span className="text-2xl">💣</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Premio de Pregunta Bomba */}
      {showPrizeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--card-bg)] border-[4px] border-amber-500 shadow-hard rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden animate-bounce-subtle">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl">🎁</span>
            </div>
            <div className="w-20 h-20 bg-amber-500 text-white rounded-2xl border-[3px] border-[var(--border-color)] flex items-center justify-center mx-auto mb-6 shadow-hard animate-bounce">
              ⭐
            </div>
            <h2 className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-3 tracking-tight">
              ¡PREMIO OBTENIDO!
            </h2>
            <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-[var(--border-color)] p-4 rounded-2xl mb-8">
              <p className="text-lg font-black text-amber-800 dark:text-amber-300">
                {awardedPrizeMsg}
              </p>
            </div>
            <button
              onClick={() => {
                playSound('inicio');
                handleDismissPrizeModal();
              }}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xl rounded-2xl border-[3px] border-[var(--border-color)] shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <span className="text-xl">👉</span>
            </button>
          </div>
        </div>
      )}

      {showTomates && <TomatoAnimation />}

      {/* Pregunta Bomba Banner */}
      {isBomb && (
        <div className="mb-6 bg-red-600 text-white border-[3px] border-[var(--border-color)] p-4 rounded-2xl shadow-hard flex items-center justify-center gap-3 animate-pulse">
          <Bomb className="w-7 h-7 text-yellow-300 animate-bounce" />
          <span className="text-lg font-black">💣 ¡PREGUNTA BOMBA! ({GAME_CONFIG.tiempoBomba}s)</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] shadow-hard rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={category.character.image}
            alt={category.character.name}
            className="w-12 h-12 object-cover rounded-2xl border-[3px] border-[var(--border-color)]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <span className="text-xs text-[var(--text-main)] opacity-70 uppercase tracking-wider block font-bold">
              {isChallenge ? '¡Desafío de Corona!' : 'Categoría'}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-black text-[var(--text-main)]">{category.name}</span>
              {isChallenge && (
                <span className="bg-amber-500 text-white border-[2px] border-[var(--border-color)] px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                  👑 ¡Corona!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentPlayer.avatar}</span>
          <div className="text-right">
            <span className="text-xs text-[var(--text-main)] opacity-70 uppercase tracking-wider block font-bold">Turno de</span>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                ⭐ {currentPlayer.coins || 0} monedas
              </span>
              <span className="text-sm font-black text-[var(--text-main)]">{currentPlayer.name}</span>
            </div>
            {currentPlayer.lives !== undefined && (
              <div className="flex flex-col items-end gap-1 mt-1">
                <div className="flex items-center gap-1 justify-end">
                  {Array.from({ length: GAME_CONFIG.vidasMaximas }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-3 h-3 ${i < currentPlayer.lives ? 'text-red-500 fill-red-500' : 'text-slate-400 fill-slate-200 dark:fill-slate-800'}`}
                    />
                  ))}
                </div>
                {currentPlayer.lives < GAME_CONFIG.vidasMaximas && !currentPlayer.corazonComprado && (
                  <button
                    disabled={(currentPlayer.coins || 0) < GAME_CONFIG.corazonPrecio}
                    onClick={() => {
                      if ((currentPlayer.coins || 0) >= GAME_CONFIG.corazonPrecio) {
                        const updated = {
                          ...currentPlayer,
                          coins: currentPlayer.coins - GAME_CONFIG.corazonPrecio,
                          lives: currentPlayer.lives + 1,
                          corazonComprado: true
                        };
                        if (onUpdatePlayer) onUpdatePlayer(updated);
                      }
                    }}
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[var(--border-color)] flex items-center gap-1 transition-all ${
                      (currentPlayer.coins || 0) >= GAME_CONFIG.corazonPrecio
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                        : 'bg-slate-700 text-slate-300 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span>❤️ Comprar vida</span>
                    <span>⭐ {GAME_CONFIG.corazonPrecio}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Temporizador */}
      <div className="mb-6 bg-[var(--card-bg)] border-[3px] border-[var(--border-color)] p-3 rounded-2xl shadow-[3px_3px_0_var(--shadow-color)] flex items-center gap-3">
        <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-[var(--text-main)]'}`} />
        <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden border-[2px] border-[var(--border-color)]">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timeLeft <= 5 ? 'bg-red-500' : 'bg-sky-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm font-black w-8 text-right">{timeLeft}s</span>
      </div>

      {/* Botones de Ayuda / Comodines (una sola vez en toda la partida, no en desafío) */}
      {!isChallenge && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: '5050', name: '50/50', icon: '✂️' },
            { key: 'cambiarPregunta', name: 'Cambiar', icon: '🔄' },
            { key: 'tiempoExtra', name: '+10s', icon: '⏱️' },
            { key: 'girarDeNuevo', name: 'Girar', icon: '🎲' }
          ].map((help) => {
            const qty = currentPlayer.inventory?.[help.key] ?? 1;
            const alreadyBought = currentPlayer.compradasHelps?.[help.key] ?? false;
            const price = GAME_CONFIG.ayudaPrecios[help.key];
            const hasEnoughCoins = (currentPlayer.coins || 0) >= price;

            const isFullyUsed = qty === 0 && alreadyBought;
            const canBuyButNoCoins = qty === 0 && !alreadyBought && !hasEnoughCoins;
            const isDisabled = helpUsedThisTurn || isFullyUsed || canBuyButNoCoins;

            let label = `Queda: ${qty}`;
            if (qty === 0 && !alreadyBought) {
              label = `⭐ ${price}`;
            } else if (isFullyUsed) {
              label = 'Usado';
            }

            return (
              <button
                key={help.key}
                disabled={isDisabled}
                onClick={() => handleUseHelp(help.key)}
                className={`p-3 rounded-2xl border-[3px] border-[var(--border-color)] flex flex-col items-center justify-center transition-all shadow-[2px_2px_0_var(--shadow-color)] ${
                  isDisabled
                    ? 'opacity-50 bg-slate-700 text-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-[var(--card-bg)] hover:scale-102 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold'
                }`}
              >
                <span className="text-xl mb-1">{help.icon}</span>
                <span className="text-xs font-black truncate w-full text-center">{help.name}</span>
                <span className="text-[10px] font-bold mt-0.5 flex items-center justify-center gap-1">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tarjeta de Pregunta */}
      <div className={`bg-[var(--card-bg)] border-[3px] ${isBomb ? 'border-red-500 ring-4 ring-red-400/50' : 'border-[var(--border-color)]'} shadow-hard rounded-3xl p-6 sm:p-8 mb-6`}>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-6 text-center leading-relaxed">
          {question.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, index) => {
            if (hiddenOptions.includes(index)) {
              return (
                <div
                  key={index}
                  className="w-full py-4 px-6 rounded-2xl border-[3px] border-slate-300 bg-slate-100 dark:bg-slate-800 opacity-40 text-slate-400 font-bold text-center italic"
                >
                  [Opción eliminada por 50/50]
                </div>
              );
            }

            let btnStyle = "bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-slate-100 dark:hover:bg-slate-800 border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)]";
            
            if (answered) {
              if (index === question.correct) {
                btnStyle = "bg-emerald-500 text-white border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)] animate-bounce-subtle";
              } else if (index === selectedOption) {
                btnStyle = "bg-red-500 text-white border-[3px] border-[var(--border-color)] shadow-[3px_3px_0_var(--shadow-color)]";
              } else {
                btnStyle = "opacity-50 bg-[var(--card-bg)] text-[var(--text-main)] border-[3px] border-[var(--border-color)]";
              }
            }

            return (
              <button
                key={index}
                disabled={answered}
                onClick={() => handleAnswer(index === question.correct, index)}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-left transition-all text-base sm:text-lg flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                <span className="w-8 h-8 rounded-xl bg-[var(--card-bg)] border-[2px] border-[var(--border-color)] flex items-center justify-center font-black text-sm text-[var(--text-main)] flex-shrink-0">
                  {['A', 'B', 'C', 'D'][index]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Explicación */}
      {answered && (
        <div className={`p-6 rounded-3xl border-[3px] border-[var(--border-color)] shadow-hard text-center animate-fadeIn ${
          isCorrect ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200' : 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200'
        }`}>
          <h3 className="text-2xl font-black mb-1">
            {isCorrect ? '¡Correcto! 🎉' : selectedOption === -1 ? '¡Tiempo Agotado! ⏰' : '¡Incorrecto! ❌'}
          </h3>
          <p className="text-sm font-bold opacity-90 mb-2">
            {question.explanation || 'Respuesta procesada correctamente.'}
          </p>
          {prizeNotification && (
            <div className="inline-block mt-2 bg-amber-500 text-white font-black px-4 py-2 rounded-2xl border-2 border-[var(--border-color)] shadow-sm animate-bounce">
              {prizeNotification}
            </div>
          )}
        </div>
      )}

      {/* Personaje que reacciona */}
      {answered && reactionPhrase && (
        <CharacterReactionPopup
          category={category}
          phrase={reactionPhrase}
          correct={isCorrect}
        />
      )}
    </div>
  );
}

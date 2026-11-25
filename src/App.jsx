import React, { useState, useEffect, useSyncExternalStore } from 'react';
import HomeScreen from './components/HomeScreen';
import MainMenu from './components/MainMenu';
import Roulette from './components/Roulette';
import QuestionScreen from './components/QuestionScreen';
import Gameboard from './components/Gameboard';
import VictoryModal from './components/VictoryModal';
import SettingsModal from './components/SettingsModal';
import ChallengeModal from './components/ChallengeModal';
import HeartModal from './components/HeartModal';
import Header from './components/Header';
import Background from './components/Background';
import { CATEGORIES } from './data/characters';
import { GAME_CONFIG } from './config/gameConfig';
import { toggleMute, getMuteState, subscribeMute, startMenuMusic, stopMenuMusic, playSuccessSound } from './utils/sound';
import { getNextTurn } from './utils/turns';
import { processLifeLoss } from './utils/lives';
import { triggerStreamersAndConfetti } from './utils/confetti';

export default function App() {
  const [screen, setScreen] = useState('inicio'); // 'inicio' | 'menu' | 'partida'
  const [gameState, setGameState] = useState('board'); // 'board' | 'challenge_picker' | 'roulette' | 'question' | 'victory'
  const [gameMode, setGameMode] = useState('solitario');
  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [challengeTargetCategory, setChallengeTargetCategory] = useState(null);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isBombActive, setIsBombActive] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [winner, setWinner] = useState(null);
  const [savedGame, setSavedGame] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHeartModalOpen, setIsHeartModalOpen] = useState(false);
  const [pendingLifeLossPlayer, setPendingLifeLossPlayer] = useState(null);
  const isMuted = useSyncExternalStore(subscribeMute, getMuteState);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('preguntados_theme');
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('preguntados_theme', JSON.stringify(isDarkMode));
    } catch (e) {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Gestionar música de fondo del menú principal / inicio
  useEffect(() => {
    if (screen === 'inicio' || screen === 'menu') {
      startMenuMusic();
    } else {
      stopMenuMusic(0.5);
    }
  }, [screen]);

  // Cargar partida guardada de localStorage al montar con validación de formato viejo
  useEffect(() => {
    const saved = localStorage.getItem('preguntados_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const isOldFormat = data.turnCount === undefined || (data.players && data.players.some(p => p.lives === undefined || p.streak === undefined || !p.characters));
        if (isOldFormat) {
          localStorage.removeItem('preguntados_save');
          window.alert("La partida guardada tiene un formato antiguo y ha sido descartada.");
        } else if (data && data.players && data.players.length > 0) {
          setSavedGame(data);
        }
      } catch (e) {
        localStorage.removeItem('preguntados_save');
      }
    }
  }, []);

  // Guardar partida en curso en localStorage ante cualquier cambio
  useEffect(() => {
    if (screen === 'partida' && gameState !== 'victory' && players.length > 0) {
      const stateToSave = {
        gameMode,
        players,
        currentTurnIndex,
        gameState,
        usedQuestionIds,
        turnCount,
        challengeTargetCategory,
        isChallengeActive
      };
      localStorage.setItem('preguntados_save', JSON.stringify(stateToSave));
    } else if (gameState === 'victory') {
      localStorage.removeItem('preguntados_save');
    }
  }, [players, currentTurnIndex, gameState, gameMode, usedQuestionIds, screen, turnCount, challengeTargetCategory, isChallengeActive]);

  const handleGoToMenu = () => {
    setScreen('menu');
  };

  const handleStartGame = ({ mode, players: initialPlayers }) => {
    try {
      localStorage.removeItem('preguntados_active_question');
    } catch (e) {}
    const configuredPlayers = initialPlayers.map(p => ({
      ...p,
      coins: p.coins !== undefined ? p.coins : GAME_CONFIG.monedasIniciales,
      lives: GAME_CONFIG.vidasIniciales,
      streak: 0,
      characters: [],
      playerTurnCount: p.playerTurnCount || 0,
      lastTurnWasBomb: p.lastTurnWasBomb || false,
      correctAnswersCount: p.correctAnswersCount || 0,
      hasPendingBomb: p.hasPendingBomb || false,
      inventory: p.inventory || {
        '5050': 1,
        cambiarPregunta: 1,
        tiempoExtra: 1,
        girarDeNuevo: 1
      },
      achievements: p.achievements || {
        firstStreak3: false,
        generalCorrectCount: 0,
        generalRewarded: false,
        categoryCorrectCounts: {},
        categoryRewarded: {}
      },
      corazonComprado: p.corazonComprado || false
    }));
    setGameMode(mode);
    setPlayers(configuredPlayers);
    setCurrentTurnIndex(0);
    setTurnCount(0);
    setUsedQuestionIds([]);
    setWinner(null);
    setGameState('board');
    setIsChallengeActive(false);
    setChallengeTargetCategory(null);
    setScreen('partida');
  };

  const handleResumeGame = () => {
    if (savedGame) {
      const mode = savedGame.gameMode || 'solitario';
      const resumedPlayers = (savedGame.players || []).map(p => ({
        ...p,
        coins: p.coins !== undefined ? p.coins : GAME_CONFIG.monedasIniciales,
        lives: p.lives !== undefined ? p.lives : GAME_CONFIG.vidasIniciales,
        streak: p.streak !== undefined ? p.streak : 0,
        characters: p.characters || [],
        playerTurnCount: p.playerTurnCount || 0,
        lastTurnWasBomb: p.lastTurnWasBomb || false,
        correctAnswersCount: p.correctAnswersCount || 0,
        hasPendingBomb: p.hasPendingBomb || false,
        inventory: p.inventory || {
          '5050': 1,
          cambiarPregunta: 1,
          tiempoExtra: 1,
          girarDeNuevo: 1
        },
        achievements: p.achievements || {
          firstStreak3: false,
          generalCorrectCount: p.generalCorrectCount || 0,
          generalRewarded: false,
          categoryCorrectCounts: {},
          categoryRewarded: {}
        },
        corazonComprado: p.corazonComprado || false
      }));
      setGameMode(mode);
      setPlayers(resumedPlayers);
      setCurrentTurnIndex(savedGame.currentTurnIndex || 0);
      setTurnCount(savedGame.turnCount || 0);
      setUsedQuestionIds(savedGame.usedQuestionIds || []);
      setGameState(savedGame.gameState || 'board');
      setChallengeTargetCategory(savedGame.challengeTargetCategory || null);
      setIsChallengeActive(savedGame.isChallengeActive || false);
      setScreen('partida');
    }
  };

  const evaluateGameEnd = (reason, customWinner = null) => {
    localStorage.removeItem('preguntados_save');
    if (customWinner) {
      setWinner(customWinner);
    } else if (gameMode === 'solitario') {
      const currentPlayer = players[0];
      setWinner({
        name: currentPlayer.name,
        avatar: currentPlayer.avatar,
        characters: currentPlayer.characters,
        lives: currentPlayer.lives,
        coins: currentPlayer.coins,
        reason: reason || 'Derrota',
        isDefeat: true
      });
    } else {
      const ranked = [...players].map(p => ({
        ...p,
        isEliminated: p.lives === 0
      })).sort((a, b) => {
        if (a.isEliminated && !b.isEliminated) return 1;
        if (!a.isEliminated && b.isEliminated) return -1;
        if (b.characters.length !== a.characters.length) return b.characters.length - a.characters.length;
        if (b.lives !== a.lives) return b.lives - a.lives;
        return (b.coins || 0) - (a.coins || 0);
      });
      setWinner({
        isPodium: true,
        podium: ranked,
        reason: reason || 'Partida Finalizada'
      });
    }
    setGameState('victory');
  };

  // Función reutilizable iniciarDesafio(jugador)
  const iniciarDesafio = (jugador) => {
    setIsChallengeActive(true);
    setGameState('challenge_picker');
  };

  const handleSelectChallengeCategory = (cat) => {
    setChallengeTargetCategory(cat);
    setSelectedCategory(cat);
    setGameState('question');
  };

  const handleSpinRoulette = () => {
    setGameState('roulette');
  };

  const handleCategorySelected = (category) => {
    if (category.isCorona) {
      const updatedPlayers = [...players];
      updatedPlayers[currentTurnIndex] = {
        ...updatedPlayers[currentTurnIndex],
        streak: GAME_CONFIG.rachaObjetivo
      };
      setPlayers(updatedPlayers);
      playSuccessSound(false);
      triggerStreamersAndConfetti({ streak: GAME_CONFIG.rachaObjetivo });
      setSelectedCategory(null);
      setTimeout(() => {
        iniciarDesafio(updatedPlayers[currentTurnIndex]);
      }, 1000);
      return;
    }

    const currentPlayer = players[currentTurnIndex];
    const hasPending = currentPlayer.hasPendingBomb || false;
    const lastWasBomb = currentPlayer.lastTurnWasBomb || false;

    let isBomb = false;
    if (hasPending && !lastWasBomb) {
      isBomb = true;
      currentPlayer.hasPendingBomb = false;
    }
    setIsBombActive(isBomb);

    setSelectedCategory(category);
    setGameState('question');
  };

  const handleAnswerResult = ({ correct, questionId, category, isChallenge, isBomb, prizeAlreadyApplied, onPrize }) => {
    try {
      localStorage.removeItem('preguntados_active_question');
    } catch (e) {}

    setUsedQuestionIds((prev) => [...prev, questionId]);

    const updatedPlayers = [...players];
    let currentPlayer = { ...updatedPlayers[currentTurnIndex] };

    currentPlayer.playerTurnCount = (currentPlayer.playerTurnCount || 0) + 1;
    currentPlayer.lastTurnWasBomb = !!isBomb;

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    if (isChallenge) {
      // Resultado del Desafío de Corona
      if (correct) {
        currentPlayer.streak = 0;
        if (challengeTargetCategory && !currentPlayer.characters.includes(challengeTargetCategory.id)) {
          currentPlayer.characters.push(challengeTargetCategory.id);
          playSuccessSound(true);
          triggerStreamersAndConfetti({ streak: 3, isVictory: true });
        }
        updatedPlayers[currentTurnIndex] = currentPlayer;
        setPlayers(updatedPlayers);
        setIsChallengeActive(false);
        setChallengeTargetCategory(null);

        // Verificar condición de victoria por 8 personajes
        if (currentPlayer.characters.length >= GAME_CONFIG.totalPersonajes) {
          evaluateGameEnd('¡Ha coleccionado con éxito los 8 personajes legendarios!', {
            ...currentPlayer,
            reason: '¡Ha coleccionado con éxito los 8 personajes legendarios!'
          });
          return;
        }

        // Acierta desafío: continúa su turno
        setGameState('board');
      } else {
        // Falla o se acaba el tiempo en desafío: no lo gana, NO pierde vida, racha vuelve a 0, pasa al siguiente jugador
        currentPlayer.streak = 0;
        updatedPlayers[currentTurnIndex] = currentPlayer;
        setPlayers(updatedPlayers);
        setIsChallengeActive(false);
        setChallengeTargetCategory(null);

        const { nextTurnIndex } = getNextTurn({
          players: updatedPlayers,
          currentTurnIndex,
          gameMode,
          correct: false
        });
        setCurrentTurnIndex(nextTurnIndex);
        setGameState('board');
      }
    } else {
      // Pregunta normal o bomba
      if (correct) {
        currentPlayer.correctAnswersCount = (currentPlayer.correctAnswersCount || 0) + 1;
        if (currentPlayer.correctAnswersCount > 0 && currentPlayer.correctAnswersCount % 3 === 0) {
          if (!currentPlayer.lastTurnWasBomb) {
            currentPlayer.hasPendingBomb = true;
          }
        }

        if (isBomb && !prizeAlreadyApplied) {
          const availableRewards = [];
          if (currentPlayer.lives < GAME_CONFIG.vidasMaximas) {
            availableRewards.push('vida');
          }
          if ((currentPlayer.inventory?.['girarDeNuevo'] || 0) < GAME_CONFIG.ayudaMaxInventario) {
            availableRewards.push('girarDeNuevo');
          }
          if ((currentPlayer.inventory?.['5050'] || 0) < GAME_CONFIG.ayudaMaxInventario) {
            availableRewards.push('5050');
          }

          let prizeMsg = '';
          if (availableRewards.length > 0) {
            const chosenReward = availableRewards[Math.floor(Math.random() * availableRewards.length)];
            if (chosenReward === 'vida') {
              currentPlayer.lives = Math.min(GAME_CONFIG.vidasMaximas, currentPlayer.lives + 1);
              prizeMsg = '¡Premio Bomba: +1 Vida! ❤️';
            } else if (chosenReward === 'girarDeNuevo') {
              currentPlayer.inventory = {
                ...(currentPlayer.inventory || {}),
                girarDeNuevo: Math.min(GAME_CONFIG.ayudaMaxInventario, (currentPlayer.inventory?.['girarDeNuevo'] || 0) + 1)
              };
              prizeMsg = '¡Premio Bomba: +1 Girar de nuevo! 🎲';
            } else if (chosenReward === '5050') {
              currentPlayer.inventory = {
                ...(currentPlayer.inventory || {}),
                '5050': Math.min(GAME_CONFIG.ayudaMaxInventario, (currentPlayer.inventory?.['5050'] || 0) + 1)
              };
              prizeMsg = '¡Premio Bomba: +1 50/50! ✂️';
            }
          } else {
            currentPlayer.coins = (currentPlayer.coins || 0) + 20;
            prizeMsg = '¡Premio Bomba: +20 Monedas! ⭐';
          }

          if (onPrize) {
            onPrize(prizeMsg);
          }
        }

        currentPlayer.streak = (currentPlayer.streak || 0) + 1;

        currentPlayer.achievements = currentPlayer.achievements || {
          firstStreak3: false,
          generalCorrectCount: 0,
          generalRewarded: false,
          categoryCorrectCounts: {},
          categoryRewarded: {}
        };

        // 1. Primer racha 3/3
        if (currentPlayer.streak >= GAME_CONFIG.rachaObjetivo && !currentPlayer.achievements.firstStreak3) {
          currentPlayer.achievements.firstStreak3 = true;
          currentPlayer.coins += GAME_CONFIG.recompensaRacha3;
        }

        // 2. 10 general correct questions
        currentPlayer.achievements.generalCorrectCount = (currentPlayer.achievements.generalCorrectCount || 0) + 1;
        if (currentPlayer.achievements.generalCorrectCount >= GAME_CONFIG.metaGenerales && !currentPlayer.achievements.generalRewarded) {
          currentPlayer.achievements.generalRewarded = true;
          currentPlayer.coins += GAME_CONFIG.recompensa10Generales;
        }

        // 3. 8 questions of a category
        const catId = category;
        currentPlayer.achievements.categoryCorrectCounts[catId] = (currentPlayer.achievements.categoryCorrectCounts[catId] || 0) + 1;
        if (currentPlayer.achievements.categoryCorrectCounts[catId] >= GAME_CONFIG.metaCategoria && !currentPlayer.achievements.categoryRewarded[catId]) {
          currentPlayer.achievements.categoryRewarded[catId] = true;
          currentPlayer.coins += GAME_CONFIG.recompensa8Categoria;
        }

        updatedPlayers[currentTurnIndex] = currentPlayer;
        setPlayers(updatedPlayers);

        // Verificar condición de victoria por 8 personajes
        if (currentPlayer.characters.length >= GAME_CONFIG.totalPersonajes) {
          evaluateGameEnd('¡Ha coleccionado con éxito los 8 personajes legendarios!', {
            ...currentPlayer,
            reason: '¡Ha coleccionado con éxito los 8 personajes legendarios!'
          });
          return;
        }

        // Verificar racha objetivo (3) para abrir Desafío
        if (currentPlayer.streak >= GAME_CONFIG.rachaObjetivo) {
          setTimeout(() => {
            iniciarDesafio(currentPlayer);
          }, 1500);
          return;
        }

        // Acierto normal: mantiene turno
        setGameState('board');
      } else {
        // Fallo o timeout normal: racha = 0, -1 vida
        currentPlayer.streak = 0;
        const { player: lPlayer, eliminated } = processLifeLoss(currentPlayer, true);
        currentPlayer = lPlayer;

        updatedPlayers[currentTurnIndex] = currentPlayer;
        setPlayers(updatedPlayers);

        const canBuyHeart = currentPlayer.lives >= 1 &&
          currentPlayer.lives < GAME_CONFIG.vidasMaximas &&
          !currentPlayer.corazonComprado &&
          (currentPlayer.coins || 0) >= GAME_CONFIG.corazonPrecio;

        if (canBuyHeart) {
          setPendingLifeLossPlayer(currentPlayer);
          setIsHeartModalOpen(true);
          return;
        }

        if (eliminated) {
          evaluateGameEnd(`${currentPlayer.name} se quedó sin vidas`);
          return;
        }

        // Verificar fin por turnos totales (60)
        if (newTurnCount >= GAME_CONFIG.maxTurnosTotales) {
          evaluateGameEnd('Se alcanzó el límite máximo de turnos (60)');
          return;
        }

        // Pasa turno
        const { nextTurnIndex } = getNextTurn({
          players: updatedPlayers,
          currentTurnIndex,
          gameMode,
          correct: false
        });
        setCurrentTurnIndex(nextTurnIndex);
        setGameState('board');
      }
    }
  };

  const handleBuyHeart = () => {
    if (!pendingLifeLossPlayer) return;
    const updatedPlayers = [...players];
    let player = { ...updatedPlayers[currentTurnIndex] };

    player.coins = (player.coins || 0) - GAME_CONFIG.corazonPrecio;
    player.lives += 1;
    player.corazonComprado = true;

    updatedPlayers[currentTurnIndex] = player;
    setPlayers(updatedPlayers);
    setIsHeartModalOpen(false);
    setPendingLifeLossPlayer(null);

    const { nextTurnIndex } = getNextTurn({
      players: updatedPlayers,
      currentTurnIndex,
      gameMode,
      correct: false
    });
    setCurrentTurnIndex(nextTurnIndex);
    setGameState('board');
  };

  const handleSkipHeart = () => {
    setIsHeartModalOpen(false);
    const player = pendingLifeLossPlayer || players[currentTurnIndex];
    setPendingLifeLossPlayer(null);

    const eliminated = player.lives === 0;
    if (eliminated) {
      evaluateGameEnd(`${player.name} se quedó sin vidas`);
      return;
    }

    if (turnCount >= GAME_CONFIG.maxTurnosTotales) {
      evaluateGameEnd('Se alcanzó el límite máximo de turnos (60)');
      return;
    }

    const { nextTurnIndex } = getNextTurn({
      players,
      currentTurnIndex,
      gameMode,
      correct: false
    });
    setCurrentTurnIndex(nextTurnIndex);
    setGameState('board');
  };

  const handleUpdatePlayer = (updatedPlayer) => {
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnIndex] = updatedPlayer;
    setPlayers(updatedPlayers);
  };

  const handleSpinAgain = () => {
    setGameState('roulette');
  };

  const handleResetGame = () => {
    try {
      localStorage.removeItem('preguntados_save');
      localStorage.removeItem('preguntados_active_question');
    } catch (e) {}
    setSavedGame(null);
    setScreen('inicio');
    setGameState('board');
    setPlayers([]);
    setCurrentTurnIndex(0);
    setTurnCount(0);
    setWinner(null);
    setIsChallengeActive(false);
    setChallengeTargetCategory(null);
  };

  return (
    <div className="min-h-screen text-[var(--text-main)] flex flex-col selection:bg-[#f5c542] selection:text-[#2e1065] font-fredoka relative">
      <Background />
      <Header
        screen={screen}
        onGoHome={() => setScreen('inicio')}
        onGoMenu={() => setScreen('menu')}
        onResetGame={handleResetGame}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isMuted={isMuted}
        toggleMute={toggleMute}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        {screen === 'inicio' && (
          <HomeScreen
            onGoToMenu={handleGoToMenu}
            savedGame={savedGame}
            onResumeGame={handleResumeGame}
          />
        )}

        {screen === 'menu' && (
          <MainMenu
            onStartGame={handleStartGame}
            savedGame={savedGame}
            onResumeGame={handleResumeGame}
          />
        )}

        {screen === 'partida' && (
          <>
            {gameState === 'board' && players.length > 0 && (
              <Gameboard
                players={players}
                currentTurnIndex={currentTurnIndex}
                onSpinRoulette={handleSpinRoulette}
                onResetGame={handleResetGame}
              />
            )}

            {gameState === 'challenge_picker' && players.length > 0 && (
              <ChallengeModal
                currentPlayer={players[currentTurnIndex]}
                onSelectCategory={handleSelectChallengeCategory}
              />
            )}

            {gameState === 'roulette' && players.length > 0 && (
              <Roulette
                currentPlayer={players[currentTurnIndex]}
                onCategorySelected={handleCategorySelected}
                isChallenge={isChallengeActive}
                challengeCategory={challengeTargetCategory}
              />
            )}

            {gameState === 'question' && selectedCategory && players.length > 0 && (
              <QuestionScreen
                category={selectedCategory}
                currentPlayer={players[currentTurnIndex]}
                players={players}
                currentTurnIndex={currentTurnIndex}
                gameMode={gameMode}
                isChallenge={isChallengeActive}
                isBomb={isBombActive}
                onAnswerResult={handleAnswerResult}
                usedQuestionIds={usedQuestionIds}
                onUpdatePlayer={handleUpdatePlayer}
                onSpinAgain={handleSpinAgain}
              />
            )}

            {gameState === 'victory' && winner && (
              <VictoryModal winner={winner} onRestart={handleResetGame} />
            )}
          </>
        )}
      </main>

      {/* Heart Purchase Modal */}
      {isHeartModalOpen && pendingLifeLossPlayer && (
        <HeartModal
          currentPlayer={pendingLifeLossPlayer}
          onBuy={handleBuyHeart}
          onSkip={handleSkipHeart}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetGame={handleResetGame}
      />
    </div>
  );
}

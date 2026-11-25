// Utilidad de Sonidos con Web Audio API y Arquitectura Robusta de Mute

export const MUSIC_VOLUME = 0.08;
export const SFX_VOLUME = 0.2;

let audioCtx = null;
let masterGain = null;
let isMuted = false;
const activeNodes = new Set();
const activeTimers = new Set();
const subscribers = new Set();

const audioBuffers = {
  'bien-1': null,
  'bien-2': null,
  'bien-3': null,
  'ovacion': null
};
let isPreloading = false;

try {
  const storedMute = localStorage.getItem('preguntados_mute');
  if (storedMute !== null) {
    isMuted = JSON.parse(storedMute);
  }
} catch (e) {
  console.error('Error leyendo estado de silencio:', e);
}

function getAudioContext() {
  if (isMuted) return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function preloadAudioFiles() {
  if (isMuted || isPreloading) return;
  isPreloading = true;
  ['bien-1', 'bien-2', 'bien-3', 'ovacion'].forEach(async (name) => {
    try {
      const res = await fetch(`/audio/${name}.mp3`);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const ctx = getAudioContext();
        if (ctx) {
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          audioBuffers[name] = decoded;
        }
      }
    } catch (e) {}
  });
}

export function subscribeMute(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notifySubscribers() {
  subscribers.forEach(fn => {
    try { fn(); } catch (e) {}
  });
}

export function getMuteState() {
  return isMuted;
}

export function toggleMute() {
  isMuted = !isMuted;
  try {
    localStorage.setItem('preguntados_mute', JSON.stringify(isMuted));
  } catch (e) {
    console.error('Error guardando estado de silencio:', e);
  }

  if (!isMuted && !audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
    }
  }

  if (masterGain && audioCtx) {
    try {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
    } catch (e) {}
  }

  if (isMuted) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    stopAll();
  } else {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    preloadAudioFiles();
    playSound('burbuja');
  }

  notifySubscribers();
  return isMuted;
}

export function stopAll() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  activeNodes.forEach(node => {
    try {
      if (node.stop && typeof node.stop === 'function') node.stop();
      if (node.disconnect && typeof node.disconnect === 'function') node.disconnect();
    } catch (e) {}
  });
  activeNodes.clear();

  activeTimers.forEach(id => {
    clearTimeout(id);
    clearInterval(id);
  });
  activeTimers.clear();

  if (audioCtx && masterGain) {
    try {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
    } catch (e) {}
  }
}

// Manejo de visibilidad y click global (primer gesto)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAll();
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
      }
    } else {
      if (!isMuted && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  });

  const handleFirstGesture = () => {
    if (!isMuted) {
      preloadAudioFiles();
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    }
    document.removeEventListener('click', handleFirstGesture);
    document.removeEventListener('keydown', handleFirstGesture);
  };

  document.addEventListener('click', handleFirstGesture, { passive: true, once: true });
  document.addEventListener('keydown', handleFirstGesture, { passive: true, once: true });

  document.addEventListener('click', (e) => {
    if (isMuted) return;
    const btn = e.target.closest('button');
    if (btn && !btn.hasAttribute('data-no-sound') && !btn.disabled) {
      playSound('burbuja');
    }
  }, { passive: true });
}

let menuMusicTimer = null;
export function startMenuMusic() {
  if (isMuted || menuMusicTimer) return;
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33];
  let idx = 0;
  const playNote = () => {
    if (isMuted) return;
    tone({ type: 'triangle', freq: notes[idx], dur: 0.25, vol: 0.04 });
    idx = (idx + 1) % notes.length;
  };
  playNote();
  menuMusicTimer = setInterval(playNote, 500);
  activeTimers.add(menuMusicTimer);
}

export function stopMenuMusic() {
  if (menuMusicTimer) {
    clearInterval(menuMusicTimer);
    activeTimers.delete(menuMusicTimer);
    menuMusicTimer = null;
  }
}

// Helper unificado tone()
export function tone({ type = 'sine', freq, freqEnd, start = 0, dur = 0.1, vol = SFX_VOLUME }) {
  const ctx = getAudioContext();
  if (!ctx || isMuted || ctx.state !== 'running') return null;

  try {
    const now = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + dur);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur - 0.01);

    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + dur);

    activeNodes.add(osc);
    osc.onended = () => {
      activeNodes.delete(osc);
    };

    return osc;
  } catch (e) {
    return null;
  }
}

// Ruido + filtro para efecto giro (trak)
function playTrak() {
  const ctx = getAudioContext();
  if (!ctx || isMuted || ctx.state !== 'running') return;
  try {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.025; // 25ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(SFX_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(filter);
    filter.connect(gain);
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, now);
      masterGain.connect(ctx.destination);
    }
    gain.connect(masterGain);

    noise.start(now);
    noise.stop(now + 0.025);
    activeNodes.add(noise);
    noise.onended = () => activeNodes.delete(noise);

    tone({ type: 'sine', freq: 180, freqEnd: 90, dur: 0.04, vol: SFX_VOLUME * 0.4 });
  } catch (e) {}
}

export function startSpinSound(getAngleFn, numSegments = 8) {
  let lastAngle = getAngleFn();
  let rafId = null;
  const step = 360 / numSegments;

  const check = () => {
    const currentAngle = getAngleFn();
    if (Math.floor(currentAngle / step) !== Math.floor(lastAngle / step)) {
      playTrak();
    }
    lastAngle = currentAngle;
    rafId = requestAnimationFrame(check);
  };
  rafId = requestAnimationFrame(check);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

function playAudioBufferOrFallback(name, fallbackFn) {
  const ctx = getAudioContext();
  if (!ctx || isMuted || ctx.state !== 'running') return;
  const buffer = audioBuffers[name];
  if (buffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      if (!masterGain) {
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 1, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
      source.connect(masterGain);
      source.start(ctx.currentTime);
      activeNodes.add(source);
      source.onended = () => activeNodes.delete(source);
      return;
    } catch (e) {}
  }
  fallbackFn();
}

function playApplauseNoise() {
  const ctx = getAudioContext();
  if (!ctx || isMuted || ctx.state !== 'running') return;
  try {
    const now = ctx.currentTime;
    const dur = 1.2;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.sin(i / 800));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(1.5, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(SFX_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, now);
      masterGain.connect(ctx.destination);
    }
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + dur);
    activeNodes.add(noise);
    noise.onended = () => activeNodes.delete(noise);
  } catch (e) {}
}

let lastBienKey = null;
export function playSuccessSound(isVictory = false) {
  if (isMuted) return;
  if (isVictory) {
    playAudioBufferOrFallback('ovacion', () => {
      [392, 523, 659, 784, 1046].forEach((f, i) => {
        tone({ type: 'triangle', freq: f, start: i * 0.1, dur: 0.3, vol: SFX_VOLUME * 0.7 });
      });
      playApplauseNoise();
    });
  } else {
    const keys = ['bien-1', 'bien-2', 'bien-3'].filter(k => k !== lastBienKey);
    const chosen = keys[Math.floor(Math.random() * keys.length)];
    lastBienKey = chosen;
    playAudioBufferOrFallback(chosen, () => {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        tone({ type: 'triangle', freq: f, start: i * 0.08, dur: 0.2, vol: SFX_VOLUME * 0.7 });
      });
      playApplauseNoise();
    });
  }
}

export function playSadTrombone() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  try {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(SFX_VOLUME * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1, now);
      masterGain.connect(ctx.destination);
    }
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.15);
    activeNodes.add(noise);
    noise.onended = () => activeNodes.delete(noise);

    const notes = [
      { freq: 294, start: 0.15, dur: 0.3 },
      { freq: 277, start: 0.45, dur: 0.3 },
      { freq: 262, start: 0.75, dur: 0.3 },
      { freq: 247, start: 1.05, dur: 0.5, freqEnd: 190 }
    ];

    notes.forEach(n => {
      const startTime = now + n.start;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const lpf = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, startTime);
      if (n.freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(n.freqEnd, startTime + n.dur);
      }

      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(800, startTime);

      oscGain.gain.setValueAtTime(SFX_VOLUME * 0.6, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + n.dur - 0.02);

      osc.connect(lpf);
      lpf.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + n.dur);
      activeNodes.add(osc);
      osc.onended = () => activeNodes.delete(osc);
    });
  } catch (e) {}
}

export function playSound(type, param) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  if (type === 'inicio') {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      tone({ type: 'triangle', freq: f, start: i * 0.08, dur: 0.15, vol: SFX_VOLUME * 0.5 });
    });
  } else if (type === 'bomba') {
    [220, 160, 120, 80].forEach((f, i) => {
      tone({ type: 'sawtooth', freq: f, start: i * 0.08, dur: 0.25, vol: SFX_VOLUME * 0.8 });
    });
  } else if (type === 'burbuja') {
    tone({ type: 'sine', freq: 300, freqEnd: 900, dur: 0.08, vol: SFX_VOLUME * 0.3 });
  } else if (type === 'tic') {
    const timeLeft = typeof param === 'number' ? param : 15;
    const isUrgent = timeLeft <= 5;
    const freq = isUrgent ? 880 : 440;
    const dur = isUrgent ? 0.05 : 0.03;
    const vol = isUrgent ? SFX_VOLUME * 0.4 : SFX_VOLUME * 0.2;
    tone({ type: isUrgent ? 'triangle' : 'sine', freq, dur, vol });
  } else if (type === 'giro') {
    const duration = typeof param === 'number' ? 3000 : 2800;
    const numSegs = typeof param === 'number' ? param : 8;
    const clicks = numSegs * 2;
    for (let i = 0; i < clicks; i++) {
      const delay = Math.pow(i / (clicks - 1), 2) * (duration / 1000 * 0.9);
      const timerId = setTimeout(() => {
        playTrak();
        activeTimers.delete(timerId);
      }, delay * 1000);
      activeTimers.add(timerId);
    }
  } else if (type === 'timer') {
    // Pregunta bomba (10 s): sonido de tensión más notorio/urgente
    const timeLeft = typeof param === 'number' ? param : 10;
    const isUrgent = timeLeft <= 3;
    const freq = isUrgent ? 1200 : timeLeft <= 5 ? 1000 : 800;
    const vol = isUrgent ? SFX_VOLUME * 0.7 : SFX_VOLUME * 0.4;
    tone({ type: 'sawtooth', freq, freqEnd: freq * 0.7, dur: 0.08, vol });
  } else if (type === 'acierto') {
    playSuccessSound(false);
  } else if (type === 'error') {
    playSadTrombone();
  } else if (type === 'revelacion' || type === 'personaje') {
    // Arpegio corto ascendente de 2-3 notas limpias con toque alegre (~0,25-0,35 s)
    [523.25, 659.25, 783.99].forEach((f, i) => {
      tone({ type: 'triangle', freq: f, start: i * 0.08, dur: 0.18, vol: SFX_VOLUME * 0.6 });
    });
  }
}

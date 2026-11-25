export const FRASES_ACIERTO = [
  "¡Bieeen!",
  "¡Eso es!",
  "¡Crack!"
];

export const FRASES_FALLO = [
  "¡Uy, casi!",
  "¡Plaf!"
];

export const FRASES_RACHA = {
  2: [
    "¡Bien ahí!",
    "¡Buen comienzo!",
    "¡Venís bien!"
  ],
  3: [
    "¡Estás en llamas!",
    "¡Qué racha metiste!",
    "¡Imparable!"
  ],
  5: [
    "¡Nadie te para!",
    "¡A pleno!",
    "¡Qué nivel!"
  ],
  7: [
    "¡Sos una leyenda!",
    "¡Monstruo total!",
    "¡Increíble!"
  ]
};

export function getFrasePorRespuesta({ correct, streak }) {
  if (!correct) {
    const list = FRASES_FALLO;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (streak >= 3) {
    const list = FRASES_RACHA[3];
    return list[Math.floor(Math.random() * list.length)];
  }
  if (streak === 2) {
    const list = FRASES_RACHA[2];
    return list[Math.floor(Math.random() * list.length)];
  }
  const list = FRASES_ACIERTO;
  return list[Math.floor(Math.random() * list.length)];
}

// Función pura y testeable para elegir preguntas evitando repeticiones globales

export function getQuestionId(questionText) {
  if (!questionText) return 'q_unknown';
  const normalized = questionText.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `q_${Math.abs(hash)}`;
}

export function pickQuestion(categoryQuestions, categorySeenIds = []) {
  if (!categoryQuestions || categoryQuestions.length === 0) {
    return { question: null, questionId: null, updatedSeenIds: categorySeenIds };
  }

  const mapped = categoryQuestions.map(q => ({
    ...q,
    stableId: getQuestionId(q.question)
  }));

  let available = mapped.filter(q => !categorySeenIds.includes(q.stableId));

  // Si se agotaron las preguntas de la categoría, reiniciar historial de ESA categoría
  // Evitando que la primera sea la última que salió (si es posible)
  if (available.length === 0) {
    const lastSeenId = categorySeenIds[categorySeenIds.length - 1];
    const freshPool = mapped.filter(q => q.stableId !== lastSeenId);
    available = freshPool.length > 0 ? freshPool : mapped;
    categorySeenIds = [];
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  const chosen = available[randomIndex];
  const updatedSeenIds = [...categorySeenIds, chosen.stableId];

  return {
    question: chosen,
    questionId: chosen.stableId,
    updatedSeenIds
  };
}

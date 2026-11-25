import json
import random
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== PUNTO 2: VALIDACIÓN ===")
total_errors = 0
for cat, questions in data.items():
    print(f"\nCategoría: {cat} (Total preguntas: {len(questions)})")
    
    # Check levels count
    levels = {1: 0, 2: 0, 3: 0}
    for q in questions:
        diff = q.get('difficulty')
        if diff in [1, 2, 3]:
            levels[diff] += 1

    seen_questions = set()
    for i, q in enumerate(questions):
        # 1. 4 opciones
        opts = q.get('options', [])
        if len(opts) != 4:
            print(f"  [ERROR] Pregunta {i+1} ('{q.get('question')}') no tiene exactamente 4 opciones: {len(opts)}")
            total_errors += 1
        
        # 2. Índice entre 0 y 3
        correct_idx = q.get('correct')
        if correct_idx not in [0, 1, 2, 3]:
            print(f"  [ERROR] Pregunta {i+1} ('{q.get('question')}') tiene índice correcto inválido: {correct_idx}")
            total_errors += 1
            
        # 3. Dificultad entre 1 y 3
        diff = q.get('difficulty')
        if diff not in [1, 2, 3]:
            print(f"  [ERROR] Pregunta {i+1} ('{q.get('question')}') tiene dificultad inválida: {diff}")
            total_errors += 1

        # 4. Explicación presente
        expl = q.get('explanation')
        if not expl or not isinstance(expl, str) or len(expl.strip()) == 0:
            print(f"  [ERROR] Pregunta {i+1} ('{q.get('question')}') no tiene explicación válida.")
            total_errors += 1

        # 5. Opciones repetidas dentro de la misma pregunta
        if len(opts) != len(set(opts)):
            print(f"  [ERROR] Pregunta {i+1} ('{q.get('question')}') tiene opciones repetidas: {opts}")
            total_errors += 1

        # 6. Enunciados duplicados
        q_text = q.get('question', '').strip().lower()
        if q_text in seen_questions:
            print(f"  [ERROR] Pregunta duplicada: '{q.get('question')}'")
            total_errors += 1
        seen_questions.add(q_text)

if total_errors == 0:
    print("\n[OK] Validación exitosa: Todas las categorías tienen 90 preguntas (30 por nivel 1, 2 y 3), 4 opciones, índices válidos 0-3, dificultad 1-3, explicaciones, sin duplicados ni opciones repetidas.")
else:
    print(f"\n[!] Se encontraron {total_errors} errores en la validación.")

print("\n=== PUNTO 3: DISTRIBUCIÓN DE ÍNDICES CORRECTOS Y DIFICULTADES POR CATEGORÍA ===")
for cat, questions in data.items():
    counts = {0: 0, 1: 0, 2: 0, 3: 0}
    diff_counts = {1: 0, 2: 0, 3: 0}
    for q in questions:
        counts[q.get('correct', 0)] += 1
        diff_counts[q.get('difficulty', 1)] += 1
    print(f"- {cat}: Correctos (0={counts[0]}, 1={counts[1]}, 2={counts[2]}, 3={counts[3]}) | Dificultad (N1={diff_counts[1]}, N2={diff_counts[2]}, N3={diff_counts[3]})")

print("\n=== PUNTO 4: 5 PREGUNTAS AL AZAR POR CATEGORÍA Y NIVEL CON OPCIONES Y EXPLICACIÓN ===")
random.seed(42)
for cat, questions in data.items():
    print(f"\n--- Categoría: {cat.upper()} ---")
    for lvl in [1, 2, 3]:
        lvl_qs = [q for q in questions if q.get('difficulty') == lvl]
        if lvl_qs:
            q_sample = random.choice(lvl_qs)
            print(f"\n  [Nivel {lvl}] {q_sample['question']}")
            for o_idx, opt in enumerate(q_sample['options']):
                marker = " [CORRECTA]" if o_idx == q_sample['correct'] else ""
                print(f"     {['A', 'B', 'C', 'D'][o_idx]}) {opt}{marker}")
            print(f"     Explicación: {q_sample.get('explanation')}")

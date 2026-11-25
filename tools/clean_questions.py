import json
import os
import re
import unicodedata

def normalize_text(text):
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    no_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    lower = no_accents.lower()
    cleaned = re.sub(r'[^a-z0-9\s]', '', lower)
    return re.sub(r'\s+', ' ', cleaned).strip()

def is_filler(q):
    text = q.get('question', '')
    options = q.get('options', [])
    lower_text = text.lower()
    if 'generada' in lower_text or re.search(r'nivel\s*\d', lower_text) or re.search(r'#\d', lower_text):
        return True
    for opt in options:
        if re.search(r'opci[oó]n\s+[a-d]', opt, re.IGNORECASE):
            return True
    return False

def main():
    q_path = os.path.join(os.path.dirname(__file__), '../src/data/questions.json')
    backup_path = os.path.join(os.path.dirname(__file__), '../src/data/questions.backup.json')
    
    if os.path.exists(backup_path):
        with open(backup_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        with open(q_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    categories = list(data.keys())
    
    stats = {}
    for cat in categories:
        stats[cat] = {
            1: {'before': 0, 'filler': 0, 'duplicate': 0, 'remaining': 0},
            2: {'before': 0, 'filler': 0, 'duplicate': 0, 'remaining': 0},
            3: {'before': 0, 'filler': 0, 'duplicate': 0, 'remaining': 0},
            'total': {'before': 0, 'filler': 0, 'duplicate': 0, 'remaining': 0}
        }
        
    all_qs = []
    for cat in categories:
        for q in data[cat]:
            level = q.get('difficulty', 1)
            if level not in [1, 2, 3]:
                level = 1
            stats[cat][level]['before'] += 1
            stats[cat]['total']['before'] += 1
            
            all_qs.append({
                'cat': cat,
                'level': level,
                'question': q.get('question', ''),
                'options': q.get('options', []),
                'correct': q.get('correct', 0),
                'difficulty': q.get('difficulty', level),
                'explanation': q.get('explanation', '')
            })
            
    non_filler_qs = []
    for item in all_qs:
        if is_filler(item):
            stats[item['cat']][item['level']]['filler'] += 1
            stats[item['cat']]['total']['filler'] += 1
        else:
            non_filler_qs.append(item)
            
    seen = {}
    unique_qs = []
    duplicate_examples = []
    
    for item in non_filler_qs:
        norm = normalize_text(item['question'])
        if not norm:
            stats[item['cat']][item['level']]['filler'] += 1
            stats[item['cat']]['total']['filler'] += 1
            continue
            
        if norm in seen:
            existing = seen[norm]
            stats[item['cat']][item['level']]['duplicate'] += 1
            stats[item['cat']]['total']['duplicate'] += 1
            if len(duplicate_examples) < 10:
                duplicate_examples.append({
                    'kept': existing['question'],
                    'kept_cat': existing['cat'],
                    'discarded': item['question'],
                    'discarded_cat': item['cat']
                })
        else:
            seen[norm] = item
            unique_qs.append(item)
            
    final_qs_by_cat = {cat: [] for cat in categories}
    for item in unique_qs:
        opts = item['options']
        correct = item['correct']
        if isinstance(opts, list) and len(opts) == 4 and len(set(opts)) == 4 and isinstance(correct, int) and 0 <= correct < 4:
            cat = item['cat']
            level = item['level']
            stats[cat][level]['remaining'] += 1
            stats[cat]['total']['remaining'] += 1
            final_qs_by_cat[cat].append({
                'question': item['question'],
                'options': item['options'],
                'correct': item['correct'],
                'difficulty': item['difficulty'],
                'explanation': item['explanation']
            })
        else:
            stats[item['cat']][item['level']]['filler'] += 1
            stats[item['cat']]['total']['filler'] += 1

    with open(q_path, 'w', encoding='utf-8') as f:
        json.dump(final_qs_by_cat, f, ensure_ascii=False, indent=2)
        
    print("=== TABLA DE RESUMEN POR CATEGORÍA Y NIVEL ===")
    print(f"{'Categoría':<16} | {'Nivel':<6} | {'Antes':<6} | {'Relleno':<8} | {'Duplicados':<10} | {'Quedan':<6}")
    print("-" * 65)
    for cat in categories:
        for lvl in [1, 2, 3]:
            s = stats[cat][lvl]
            print(f"{cat:<16} | {lvl:<6} | {s['before']:<6} | {s['filler']:<8} | {s['duplicate']:<10} | {s['remaining']:<6}")
        tot = stats[cat]['total']
        print(f"{cat+' (TOTAL)':<16} | {'---':<6} | {tot['before']:<6} | {tot['filler']:<8} | {tot['duplicate']:<10} | {tot['remaining']:<6}")
        print("-" * 65)

if __name__ == '__main__':
    main()

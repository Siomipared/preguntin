import json
import unicodedata
import re

def normalize_strict(text):
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    no_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    lower = no_accents.lower()
    cleaned = re.sub(r'[^a-z\s]', '', lower)
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
    q_path = r"C:\Users\encin\Downloads\sio\Preguntados\frontend\src\data\questions.backup.json"
    with open(q_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    all_qs = []
    for cat in data:
        for q in data[cat]:
            all_qs.append({
                'cat': cat,
                'question': q.get('question', ''),
                'options': q.get('options', []),
                'correct': q.get('correct', 0),
                'difficulty': q.get('difficulty', 1),
                'explanation': q.get('explanation', '')
            })
            
    seen = {}
    dups = []
    for item in all_qs:
        if is_filler(item):
            continue
        norm = normalize_strict(item['question'])
        if not norm:
            continue
        if norm in seen:
            dups.append((item, seen[norm]))
        else:
            seen[norm] = item
            
    print(f"Total duplicates with strict normalization: {len(dups)}")
    for i, (d, o) in enumerate(dups, 1):
        print(f"\nPair {i}:")
        print(f"  Kept ({o['cat']}): {o['question']}")
        print(f"  Drop ({d['cat']}): {d['question']}")

if __name__ == '__main__':
    main()

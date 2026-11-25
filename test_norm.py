import json
import unicodedata
import re

def normalize_text(text):
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    no_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    lower = no_accents.lower()
    # Keep alphanumeric (including digits) and spaces
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
    duplicates = []
    for item in all_qs:
        if is_filler(item):
            continue
        norm = normalize_text(item['question'])
        if not norm:
            continue
        if norm in seen:
            duplicates.append((item, seen[norm]))
        else:
            seen[norm] = item
            
    print(f"Total non-filler duplicates found with digits kept: {len(duplicates)}")
    for i, (dup, orig) in enumerate(duplicates[:10], 1):
        print(f"\nDup {i}:")
        print(f"  Orig ({orig['cat']}): {orig['question']}")
        print(f"  Dup  ({dup['cat']}): {dup['question']}")

if __name__ == '__main__':
    main()

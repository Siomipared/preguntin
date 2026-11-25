import json

with open(r"C:\Users\encin\Downloads\sio\Preguntados\frontend\src\data\questions.backup.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for cat in data:
    for q in data[cat]:
        text = q.get('question', '').lower()
        if 'generada' in text or 'nivel' in text or '#' in text:
            print(cat, q['difficulty'], q['question'])
            break

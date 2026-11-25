import json

with open(r"C:\Users\encin\Downloads\sio\Preguntados\frontend\src\data\questions.backup.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for cat in data:
    for q in data[cat]:
        if "polígono" in q['question'] or "romano" in q['question']:
            print(cat, q['difficulty'], q['question'], q['options'])

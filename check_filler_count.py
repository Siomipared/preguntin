import json
import re

with open(r"C:\Users\encin\Downloads\sio\Preguntados\frontend\src\data\questions.backup.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for cat in data:
    count = 0
    for q in data[cat]:
        text = q.get('question', '').lower()
        if 'generada' in text or re.search(r'nivel\s*\d', text) or re.search(r'#\d', text):
            count += 1
    print(cat, count)

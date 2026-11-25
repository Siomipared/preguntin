import json
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# We will ensure every category has exactly:
# - 30 questions with difficulty = 1
# - 30 questions with difficulty = 2
# - 30 questions with difficulty = 3
# Total = 90 questions per category.

# Let's write helper to add explanations and difficulties to existing questions, 
# and add new distinct questions to reach 30 per level.

print("Starting full population of 90 questions per category (30 per level)...")

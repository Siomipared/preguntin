import json

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Helper function to ensure questions have difficulty, explanation, 4 options, valid correct.
# We will classify existing questions and add new ones until each category has:
# 30 of difficulty 1, 30 of difficulty 2, 30 of difficulty 3 (Total 90).

print("Processing categories...")
new_data = {}

# We will define specific expansions for each category.
# Let's write helper logic.

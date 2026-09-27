import json
import random

# Чтение исходного JSON-файла
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Извлечение только текста (значений словаря) в виде списка
formula_list = list(data["formulas"].values())

# Выбор 15 случайных уникальных формул
selected_formulas = random.sample(formula_list, 15)

# Вывод результата на экран
print("Случайный набор из 15 формул:")
for i, formula in enumerate(selected_formulas, 1):
    print(f"{i}. {formula}")

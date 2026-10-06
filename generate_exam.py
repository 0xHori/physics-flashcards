import html
import json
from pathlib import Path

# Тот самый правильный порядок изучения, разбитый по блокам
STUDY_PLAN = [
    ("БЛОК 1: Электростатика. База", [
        "Закон Кулона",
        "Напряженность поля точечного заряда",
        "Потенциал поля точечного заряда",
        "Связь напряженности и потенциала",
        "Интегральная связь поля и потенциала",
        "Теорема Гаусса в интегральной форме",
        "Дипольный момент",
        "Напряженность поля диполя",
        "Потенциал поля диполя",
        "Момент сил, действующих на диполь",
        "Потенциальная энергия диполя",
    ]),
    ("БЛОК 2: Электростатика. Проводники и поля", [
        "Напряженность поля бесконечной плоскости",
        "Потенциал поля бесконечной плоскости",
        "Напряженность поля заряженной нити",
        "Потенциал поля заряженной нити",
        "Напряженность поля на оси заряженного кольца",
        "Потенциал поля на оси заряженного кольца",
        "Напряженность поля проводящей сферы. Внутри сферы",
        "Потенциал поля проводящей сферы. Внутри сферы",
        "Напряженность поля проводящей сферы. Снаружи сферы",
        "Потенциал поля проводящей сферы. Снаружи сферы",
        "Напряженность поля равномерно заряженного шара. Внутри шара",
        "Потенциал поля равномерно заряженного шара. Внутри шара",
    ]),
    ("БЛОК 3: Электроемкость и Конденсаторы", [
        "Емкость проводящей сферы",
        "Энергия заряженной сферы",
        "Емкость плоского конденсатора",
        "Емкость сферического конденсатора",
        "Емкость цилиндрического конденсатора",
        "Параллельное соединение конденсаторов",
        "Последовательное соединение конденсаторов",
        "Связь напряженности и индукции электростатического поля в веществе",
        "Вектор поляризации",
    ]),
    ("БЛОК 4: Постоянный ток", [
        "Закон Ома для однородного участка цепи",
        "Закон Ома для замкнутой цепи",
        "Сопротивление проводника",
        "Последовательное соединение резисторов",
        "Параллельное соединение резисторов",
        "Закон Джоуля-Ленца",
        "Мощность тока",
        "Закон Ома в дифференциальной форме",
        "Первое правило Кирхгофа",
        "Второе правило Кирхгофа",
    ]),
    ("БЛОК 5: Магнетизм. Источники поля", [
        "Закон Био-Савара-Лапласа",
        "Индукция магнитного поля бесконечного прямого провода",
        "Индукция магнитного поля провода конечной длины",
        "Поле в центре кругового витка",
        "Поле соленоида (бесконечного или когда длина >> диаметра)",
        "Поле на оси соленоида длины l и радиуса R",
        "Поле тороида",
        "Теорема о циркуляции вектора магнитной индукции",
    ]),
    ("БЛОК 6: Магнетизм. Действие поля", [
        "Поток магнитной индукции",
        "Сила Ампера",
        "Сила взаимодействия параллельных токов",
        "Сила Лоренца",
        "Момент сил на рамке",
        "Намагниченность",
        "Связь напряженности и индукции магнитного поля в веществе",
    ]),
    ("БЛОК 7: Электромагнитная индукция и Колебания", [
        "Закон Фарадея (электромагнитной индукции)",
        "Индуктивность соленоида",
        "Энергия катушки индуктивности",
        "Энергия магнитного поля",
        "Ток при размыкании цепи",
        "Ток при замыкании цепи",
        "Циклическая частота колебательного контура",
        "Скорость электромагнитной волны",
    ]),
]

ALL_REQUIRED_NAMES = []
for block_name, formulas in STUDY_PLAN:
    ALL_REQUIRED_NAMES.extend([f.lower().strip() for f in formulas])


def generate_exam_ticket(
    json_path="data.json", output_file="ticket.html", ticket_num=1
):
    with open(json_path, "r", encoding="utf-8") as f:
        formulas_data = json.load(f)["formulas"]

    # Теперь JSON: {название: latex}. Ключ — название (lowercase), значение — LaTeX.
    lookup = {}
    for name, latex in formulas_data.items():
        lookup[name.lower().strip()] = (name, latex)

    html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Экзаменационный билет №{ticket_num}</title>

<!-- ПОДКЛЮЧАЕМ MATHJAX -->
<script>
MathJax = {{
  tex: {{
    inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
    displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
    processEscapes: true
  }},
  svg: {{
    fontCache: 'global'
  }}
}};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fafafa; }}
    h2 {{ text-align: center; margin-bottom: 20px; }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
    th, td {{ border: 1px solid #333; padding: 10px; vertical-align: middle; }}
    th {{ background: #e0e0e0; }}
    .num {{ width: 5%; text-align: center; font-weight: bold; }}
    .title {{ width: 45%; }}
    .formula-cell {{ width: 50%; text-align: center; font-size: 1.1em; }}

    .block-header {{
        background-color: #4a5568;
        color: #ffffff;
        font-weight: bold;
        text-align: center;
        font-size: 1.1em;
        letter-spacing: 1px;
        padding: 12px;
        border: 1px solid #333;
    }}
    @media print {{
        button {{ display: none; }}
        body {{ padding: 0; background: #fff; }}
        .block-header {{ background-color: #ccc !important; color: #000 !important; -webkit-print-color-adjust: exact; }}
    }}
</style>
</head>
<body>
    <button onclick="window.print()" style="margin-bottom:15px; padding:8px 16px; cursor:pointer; font-size:16px;">Распечатать билет</button>
    <h2>Билет по физике (Формулы) — Вариант {ticket_num}</h2>
    <table>
        <thead>
            <tr><th>№</th><th>Название величины / закона</th><th>Формула</th></tr>
        </thead>
        <tbody>
"""

    counter = 1
    missing_formulas = []

    for block_name, formula_names in STUDY_PLAN:
        html_content += f'            <tr><td colspan="3" class="block-header">{html.escape(block_name)}</td></tr>\n'
        
        for target_name in formula_names:
            key = target_name.lower().strip()
            if key in lookup:
                real_name, latex = lookup[key]
                # Оборачиваем LaTeX в $$ для центрирования и отображения в display-режиме
                html_content += f"""            <tr>
                <td class="num">{counter}</td>
                <td class="title">{html.escape(real_name)}</td>
                <td class="formula-cell">$${latex}$$</td>
            </tr>\n"""
                counter += 1
            else:
                missing_formulas.append(target_name)

    # Дополнительные формулы
    orphans = []
    for name, latex in formulas_data.items():
        if name.lower().strip() not in ALL_REQUIRED_NAMES:
            orphans.append((name, latex))

    if orphans:
        html_content += f'            <tr><td colspan="3" class="block-header">ДОПОЛНИТЕЛЬНО (Вне плана)</td></tr>\n'
        for name, latex in orphans:
            html_content += f"""            <tr>
                <td class="num">{counter}</td>
                <td class="title">{html.escape(name)}</td>
                <td class="formula-cell">$${latex}$$</td>
            </tr>\n"""
            counter += 1

    html_content += """        </tbody>
    </table>
</body>
</html>"""

    Path(output_file).write_text(html_content, encoding="utf-8")
    
    print(f"✅ Билет успешно сгенерирован: {output_file}")
    print(f"📊 Всего формул в билете: {counter - 1}")
    if missing_formulas:
        print("\n⚠️ ВНИМАНИЕ! Эти формулы из плана не найдены в data.json:")
        for mf in missing_formulas:
            print(f"   - {mf}")

if __name__ == "__main__":
    generate_exam_ticket()
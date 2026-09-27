import html
import json
import random
from pathlib import Path


def generate_exam_ticket(
    json_path="data.json", count=15, ticket_num=1, output_file="ticket.html"
):
    with open(json_path, "r", encoding="utf-8") as f:
        formulas = json.load(f)["formulas"]

    # Выбираем случайные пары (путь_к_картинке, название)
    items = list(formulas.items())
    selected = random.sample(items, min(count, len(items)))

    html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Экзаменационный билет №{ticket_num}</title>
<style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; }}
    h2 {{ text-align: center; margin-bottom: 20px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ border: 1px solid #333; padding: 10px; }}
    th {{ background: #f0f0f0; }}
    .num {{ width: 5%; text-align: center; font-weight: bold; }}
    .title {{ width: 55%; }}
    .answer-space {{ width: 40%; height: 50px; }}
    @media print {{
        button {{ display: none; }}
        body {{ padding: 0; }}
    }}
</style>
</head>
<body>
    <button onclick="window.print()" style="margin-bottom:15px; padding:8px 16px; cursor:pointer;">Распечатать</button>
    <h2>Билет по физике (Формулы) — Вариант {ticket_num}</h2>
    <table>
        <thead>
            <tr><th>№</th><th>Название величины / закона</th><th>Формула (заполнить)</th></tr>
        </thead>
        <tbody>
"""

    for i, (img, name) in enumerate(selected, 1):
        html_content += f"""            <tr>
                <td class="num">{i}</td>
                <td class="title">{html.escape(name)}</td>
                <td class="answer-space"></td>
            </tr>\n"""

    html_content += """        </tbody>
    </table>
</body>
</html>"""

    Path(output_file).write_text(html_content, encoding="utf-8")
    print(f"Билет успешно сгенерирован: {output_file}")


if __name__ == "__main__":
    generate_exam_ticket()
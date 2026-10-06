import html
import json
from pathlib import Path
import random
import re


def extract_used_titles(ticket_html_path="ticket.html") -> set:
    """Извлекает уже использованные названия формул из первого билета."""
    ticket_file = Path(ticket_html_path)
    if not ticket_file.exists():
        print(
            f"Внимание: файл {ticket_html_path} не найден. Исключения не будут применены."
        )
        return set()

    content = ticket_file.read_text(encoding="utf-8")
    # Ищем строки вида <td class="title">...</td>
    titles = re.findall(r'<td class="title">(.*?)</td>', content)
    # Декодируем HTML entities (например, &quot; или &amp;)
    return {html.unescape(t.strip()) for t in titles}


def generate_ticket_html(items, ticket_num):
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
    for i, (img, name) in enumerate(items, 1):
        html_content += f"""            <tr>
                <td class="num">{i}</td>
                <td class="title">{html.escape(name)}</td>
                <td class="answer-space"></td>
            </tr>\n"""

    html_content += """        </tbody>
    </table>
</body>
</html>"""
    return html_content


def generate_remaining_tickets(
    json_path="data.json",
    base_ticket_path="ticket_1.html",
    ticket_sizes=(15, 15, 15, 8),
    start_ticket_num=2,
):
    with open(json_path, "r", encoding="utf-8") as f:
        formulas = json.load(f)["formulas"]

    used_titles = extract_used_titles(base_ticket_path)
    print(f"Найдено выученных формул для исключения: {len(used_titles)}")

    # Оставляем только те формулы, которых нет в первом билете
    available_items = [
        (img, name)
        for img, name in formulas.items()
        if name not in used_titles
    ]

    total_needed = sum(ticket_sizes)
    print(f"Доступно уникальных формул: {len(available_items)}")
    print(f"Требуется формул на 4 билета: {total_needed}")

    if len(available_items) < total_needed:
        print(
            f"Внимание: доступных формул ({len(available_items)}) меньше, чем требуется ({total_needed})."
        )

    # Случайно перемешиваем доступный пул формул
    random.shuffle(available_items)

    offset = 0
    for idx, count in enumerate(ticket_sizes):
        ticket_num = start_ticket_num + idx
        output_file = f"ticket_{ticket_num}.html"

        ticket_items = available_items[offset : offset + count]
        offset += count

        html_str = generate_ticket_html(ticket_items, ticket_num)
        Path(output_file).write_text(html_str, encoding="utf-8")
        print(
            f"Сгенерирован {output_file} (билет №{ticket_num}) с {len(ticket_items)} формулами."
        )


if __name__ == "__main__":
    generate_remaining_tickets()
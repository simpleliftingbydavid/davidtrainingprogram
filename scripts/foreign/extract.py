"""Đưa Bảng thành phần thực phẩm Úc (FSANZ) và Na Uy (Matvaretabellen 2022) về một dạng chung.

    python3 -I scripts/foreign/extract.py <file Úc .xlsx> <file Na Uy .xlsx> <thư mục ra>
        -> <thư mục ra>/AU.json, NO.json: mọi dòng, 11 chất trên 100 g (để tra cứu, KHÔNG commit)
    python3 -I scripts/foreign/extract.py <file Úc> <file Na Uy> <thư mục ra> --select
        -> thêm scripts/foreign/selected.json: chỉ các dòng được ghép trong food-map.json và
           extra-map.json (dữ liệu đã lọc, được commit; app và build-micros.mjs chỉ đọc file này)

Cần openpyxl (có sẵn trong môi trường). Ô trống, "M" hoặc không phải số -> None (không bao giờ 0).
Bảng Úc chỉ có năng lượng theo kJ: kcal = kJ / 4.184.
"""
import json
import os
import sys

import openpyxl

KEYS = ['kcal', 'protein', 'carb', 'fat', 'fiber', 'potassium', 'sodium', 'calcium', 'magnesium', 'iron', 'zinc']
HERE = os.path.dirname(os.path.abspath(__file__))


def number(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value) if value >= 0 else None
    return None


def read_au(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb['data']
    rows = list(ws.iter_rows(values_only=True))
    head = [str(h).replace('\n', ' ').strip() if h else '' for h in rows[2]]

    def col(*needles, exclude=None):
        for i, h in enumerate(head):
            low = h.lower()
            if all(n.lower() in low for n in needles) and not (exclude and exclude.lower() in low):
                return i
        raise SystemExit(f'Không thấy cột {needles} trong bảng Úc')

    cols = {
        'kJ': col('Energy with dietary fibre'),
        'protein': col('Protein'), 'fat': col('Fat, total'), 'carb': col('Available carbohydrate'),
        'fiber': col('Total dietary fibre'), 'potassium': col('Potassium'), 'sodium': col('Sodium'),
        'calcium': col('Calcium'), 'magnesium': col('Magnesium'), 'iron': col('Iron (Fe)'), 'zinc': col('Zinc'),
    }
    out = {}
    for r in rows[3:]:
        if not r or not r[0] or not r[2]:
            continue
        values = {k: number(r[cols[k]]) for k in KEYS if k != 'kcal'}
        kj = number(r[cols['kJ']])
        values['kcal'] = round(kj / 4.184, 1) if kj is not None else None
        out[str(r[0])] = {'id': str(r[0]), 'name': str(r[2]).strip(), 'classification': str(r[1] or ''),
                          'carbBasis': 'available', 'values': {k: values[k] for k in KEYS}}
    return out


def read_no(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = list(wb['Foods'].iter_rows(values_only=True))
    head = rows[2]
    idx = {h: i for i, h in enumerate(head) if h and h != 'Ref'}
    names = {'kcal': 'Kilocalories', 'protein': 'Protein', 'fat': 'Fat', 'carb': 'Carbo', 'fiber': 'Dietary fibre',
             'potassium': 'Potassium', 'sodium': 'Sodium', 'calcium': 'Calcium', 'magnesium': 'Magnesium',
             'iron': 'Iron', 'zinc': 'Zinc'}
    out = {}
    category = ''
    for r in rows[5:]:
        if not r or not r[0] or not r[1]:
            continue
        code = str(r[0])
        if not (isinstance(r[0], str) and '.' in code and len(code) > 4):
            category = f'{code} {r[1]}'
            continue
        out[code] = {'id': code, 'name': str(r[1]).strip(), 'classification': category, 'carbBasis': 'available',
                     'values': {k: number(r[idx[names[k]]]) for k in KEYS}}
    return out


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    au_path, no_path, out_dir = sys.argv[1:4]
    os.makedirs(out_dir, exist_ok=True)
    tables = {'AU': read_au(au_path), 'NO': read_no(no_path)}
    for key, rows in tables.items():
        with open(os.path.join(out_dir, f'{key}.json'), 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False)
        print(f'{key}: {len(rows)} dòng -> {out_dir}/{key}.json')
    if '--select' in sys.argv:
        wanted = {}
        for map_name in ('food-map.json', 'extra-map.json'):
            path = os.path.join(HERE, map_name)
            if not os.path.exists(path):
                continue
            with open(path, encoding='utf-8') as f:
                for name, entry in json.load(f).items():
                    if name.startswith('_') or not isinstance(entry, dict) or entry.get('source') not in ('AU', 'NO'):
                        continue
                    row = tables[entry['source']].get(entry['id'])
                    if not row:
                        raise SystemExit(f'Không thấy {entry["source"]} {entry["id"]} cho {name}')
                    wanted[f"{entry['source']}:{entry['id']}"] = row
        selected = {
            'sources': {
                'AU': {'file': os.path.basename(au_path), 'title': 'Australian Food Composition Database (Food Standards Australia New Zealand)'},
                'NO': {'file': os.path.basename(no_path), 'title': 'The Norwegian Food Composition Table 2022 (Matvaretabellen)'},
            },
            'rows': dict(sorted(wanted.items())),
        }
        with open(os.path.join(HERE, 'selected.json'), 'w', encoding='utf-8') as f:
            json.dump(selected, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print(f'selected.json: {len(wanted)} dòng đã chọn')


if __name__ == '__main__':
    main()

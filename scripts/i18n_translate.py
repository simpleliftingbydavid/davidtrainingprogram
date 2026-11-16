"""Ghi bản tiếng Anh cho các key đã có trong i18n-vi-<khu>.js.
   python3 scripts/i18n_translate.py <khu> < file   (mỗi dòng: key<TAB>English; '#' là chú thích)
   Dòng 'NOTE key<TAB>ghi chú' thêm một ghi chú ⚠ cho David."""
import sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from i18n_apply import Area
a = Area(sys.argv[1])
for line in sys.stdin.read().split('\n'):
    if not line.strip() or line.startswith('#'): continue
    if line.startswith('NOTE '):
        k, v = line[5:].split('\t', 1); a.note(k.strip(), v.strip()); continue
    k, v = line.split('\t', 1)
    k = k.strip(); v = v.strip()
    if ' || ' in v:  # số nhiều: one || other
        one, other = v.split(' || ', 1); v = (one, other)
    a.translate(k, v)
a.save()

"""Công cụ dịch từng file (dùng trong lúc chuyển trang sang song ngữ).

  from i18n_apply import Area
  a = Area('home')                       # i18n-vi-home.js / i18n-en-home.js
  a.key('home.title', 'Trang chủ', 'Home')
  a.key('home.sessions', '{n} buổi', ('{n} session', '{n} sessions'))   # số nhiều tiếng Anh
  a.note('home.title', 'Cần David xem')
  a.edit('home.html', 'chuỗi cũ', 'chuỗi mới')                  # phải xuất hiện đúng 1 lần (hoặc count=)
  a.save()
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def js_str(v):
    return "'" + v.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"

def js_val(v):
    if isinstance(v, tuple): return '{ one: ' + js_str(v[0]) + ', other: ' + js_str(v[1]) + ' }'
    return js_str(v)

class Area:
    def __init__(self, name):
        self.name = name; self.vi = {}; self.en = {}; self.notes = {}; self.files = {}
        self.vi_path = os.path.join(ROOT, f'i18n-vi-{name}.js'); self.en_path = os.path.join(ROOT, f'i18n-en-{name}.js')
        for path, header in ((self.vi_path, f'// Tiếng Việt: {name}. Chữ phải trùng đúng chữ đang hiện trên trang.\nexport default {{\n}};\n'),
                             (self.en_path, f'// English: {name}. Same keys as i18n-vi-{name}.js.\nexport default {{\n}};\n\nexport const NOTES = {{\n}};\n')):
            if not os.path.exists(path): open(path, 'w', encoding='utf8').write(header)
        self.vi_src = open(self.vi_path, encoding='utf8').read(); self.en_src = open(self.en_path, encoding='utf8').read()
    def key(self, k, vi, en):
        if f"'{k}':" in self.vi_src or k in self.vi:
            raise SystemExit(f'key đã có: {k}')
        self.vi[k] = vi; self.en[k] = en
        return k
    def note(self, k, text): self.notes[k] = text
    def translate(self, k, en):
        """Bản tiếng Anh cho key đã có sẵn trong file vi (do i18n-tag-html.py thêm)."""
        if f"'{k}':" not in self.vi_src: raise SystemExit(f'không có key vi: {k}')
        if f"'{k}':" in self.en_src: raise SystemExit(f'đã có bản en: {k}')
        self.en_extra = getattr(self, 'en_extra', {}); self.en_extra[k] = en
    def _file(self, f):
        if f not in self.files: self.files[f] = open(os.path.join(ROOT, f), encoding='utf8').read()
        return self.files[f]
    def edit(self, f, old, new, count=1):
        s = self._file(f); n = s.count(old)
        if (count is None and n < 1) or (count is not None and n != count): raise SystemExit(f'{f}: tìm thấy {n} lần (cần {count}):\n{old[:300]}')
        self.files[f] = s.replace(old, new)
    def lit(self, f, vi, key, en, count=1, quote="'"):
        """Thay chuỗi '<vi>' trong code bằng t('key') và thêm key."""
        self.edit(f, f'{quote}{vi}{quote}', f"t('{key}')", count)
        if key not in self.vi: self.key(key, vi, en)
        return key

    def save(self):
        def insert(src, marker_start, entries):
            i = src.index(marker_start); j = src.index('\n};', i)
            return src[:j] + ''.join(entries) + src[j:]
        if self.vi:
            self.vi_src = insert(self.vi_src, 'export default {', [f"  '{k}': {js_val(v)},\n" for k, v in self.vi.items()])
            self.en_src = insert(self.en_src, 'export default {', [f"  '{k}': {js_val(v)},\n" for k, v in self.en.items()])
        if getattr(self, 'en_extra', None):
            self.en_src = insert(self.en_src, 'export default {', [f"  '{k}': {js_val(v)},\n" for k, v in self.en_extra.items()])
        if self.notes:
            self.en_src = insert(self.en_src, 'export const NOTES = {', [f"  '{k}': {js_str(v)},\n" for k, v in self.notes.items()])
        open(self.vi_path, 'w', encoding='utf8').write(self.vi_src)
        open(self.en_path, 'w', encoding='utf8').write(self.en_src)
        for f, s in self.files.items(): open(os.path.join(ROOT, f), 'w', encoding='utf8').write(s)
        print(f'{self.name}: +{len(self.vi)} key, {len(self.notes)} ghi chú, {len(self.files)} file')

#!/usr/bin/env python3
"""Tách chữ tiếng Việt trong code JS (file .js, hoặc các <script type="module"> của một trang) sang
từ điển, thay bằng t('key').

  python3 scripts/i18n-auto.py <file> <tiền tố key> <khu> [--dry] [--skip-lines a-b,c-d]

- Chuỗi '…' / "…" có chữ Việt → t('key'). Bỏ qua: chuỗi trong chú thích, console.*, dòng có
  "i18n-data", khoá của object ('Tên': …), chuỗi đứng sau ===, !==, ==, case, và chuỗi trong
  .includes( / .startsWith( / .endsWith( / .replace( (thường là so khớp dữ liệu).
- Trong template `…`: mỗi đoạn chữ có chữ Việt (giữa các thẻ HTML, hoặc trong giá trị thuộc tính)
  → ${t('key', { p0: … })}, các ${…} nằm trong đoạn đó thành tham số {p0}, {p1}…
- Key = tiền tố + chữ không dấu; chữ giống nhau dùng chung key (kể cả key đã có trong từ điển).
In ra danh sách (key = chữ Việt) để viết bản tiếng Anh. Không đụng phần HTML tĩnh (dùng
i18n-tag-html.py cho phần đó).
"""
import os, re, sys, json, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = re.compile(r'[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]', re.I)
REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^')

def slug(text):
    t = unicodedata.normalize('NFD', text).replace('đ', 'd').replace('Đ', 'D')
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    t = re.sub(r'\{p\d+\}', ' ', t)
    words = re.findall(r'[a-z0-9]+', t)[:6] or ['text']
    return '_'.join(words)

class Scanner:
    """Duyệt code JS. nodes: ('str', quote, body, start, end) và ('tpl', start, end, parts),
    parts = [('text', s, abs_start) | ('expr', s, abs_start)]. Gồm cả chuỗi nằm trong ${…}."""
    def __init__(self, src):
        self.s = src; self.nodes = []
    def prev_sig(self, pos):
        s = self.s; j = pos - 1
        while j >= 0 and s[j] in ' \t\r\n': j -= 1
        if j < 0: return '', ''
        m = re.search(r'([A-Za-z_$][\w$]*)$', s[max(0, j - 20):j + 1])
        return s[j], (m.group(1) if m else '')
    def scan(self, i, end, in_expr=False):
        s = self.s; depth = 0
        while i < end:
            c = s[i]
            if s.startswith('//', i):
                k = s.find('\n', i); i = end if k < 0 else k; continue
            if s.startswith('/*', i):
                i = s.find('*/', i) + 2; continue
            if c in '\'"':
                st = i; i += 1
                while s[i] != c:
                    if s[i] == '\\': i += 1
                    i += 1
                i += 1
                self.nodes.append(('str', c, s[st + 1:i - 1], st, i)); continue
            if c == '`':
                i = self.template(i); continue
            if c == '/':
                ch, word = self.prev_sig(i)
                if ch in REGEX_PREV or word in ('return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw') or ch == '':
                    i += 1; inclass = False
                    while i < end:
                        d = s[i]
                        if d == '\\': i += 2; continue
                        if d == '[': inclass = True
                        elif d == ']': inclass = False
                        elif d == '/' and not inclass: break
                        elif d == '\n': break
                        i += 1
                    i += 1
                    while i < end and s[i].isalpha(): i += 1
                    continue
            if in_expr:
                if c == '{': depth += 1
                elif c == '}':
                    if depth == 0: return i
                    depth -= 1
            i += 1
        return i
    def template(self, i):
        s = self.s; st = i; i += 1; parts = []; seg = i
        while s[i] != '`':
            if s[i] == '\\': i += 2; continue
            if s.startswith('${', i):
                parts.append(('text', s[seg:i], seg))
                es = i + 2
                close = self.scan(es, len(s), in_expr=True)
                parts.append(('expr', s[es:close], es))
                i = close + 1; seg = i
                continue
            i += 1
        parts.append(('text', s[seg:i], seg))
        self.nodes.append(('tpl', st, i + 1, parts))
        return i + 1

def collect(src, start, end):
    sc = Scanner(src); sc.scan(start, end); return sc.nodes

def line_of(src, pos): return src.count('\n', 0, pos) + 1

def main():
    path, prefix, area = sys.argv[1:4]
    dry = '--dry' in sys.argv
    skip = []
    if '--skip-lines' in sys.argv:
        for r in sys.argv[sys.argv.index('--skip-lines') + 1].split(','):
            a, b = r.split('-'); skip.append((int(a), int(b)))
    full = os.path.join(ROOT, path)
    src = open(full, encoding='utf8').read()
    regions = []
    if path.endswith('.html'):
        for m in re.finditer(r'<script type="module">([\s\S]*?)</script>', src): regions.append((m.start(1), m.end(1)))
    else:
        regions.append((0, len(src)))
    vi_path = os.path.join(ROOT, f'i18n-vi-{area}.js')
    if not os.path.exists(vi_path):
        open(vi_path, 'w', encoding='utf8').write(f'// Tiếng Việt: {area}. Chữ phải trùng đúng chữ đang hiện trên trang.\nexport default {{\n}};\n')
        open(os.path.join(ROOT, f'i18n-en-{area}.js'), 'w', encoding='utf8').write(f'// English: {area}. Same keys as i18n-vi-{area}.js.\nexport default {{\n}};\n\nexport const NOTES = {{\n}};\n')
    # every existing Vietnamese dictionary: reuse identical sentences
    existing = {}
    for f in os.listdir(ROOT):
        if re.match(r'^i18n-vi(-[\w-]+)?\.js$', f):
            for k, v in re.findall(r"^\s*'([\w.]+)':\s*'((?:[^'\\]|\\.)*)',", open(os.path.join(ROOT, f), encoding='utf8').read(), re.M):
                existing.setdefault(v.replace("\\'", "'").replace('\\n', '\n'), k)
    used = set(re.findall(r"^\s*'([\w.]+)':", open(vi_path, encoding='utf8').read(), re.M))
    for f in os.listdir(ROOT):
        if re.match(r'^i18n-vi(-[\w-]+)?\.js$', f):
            used |= set(re.findall(r"^\s*'([\w.]+)':", open(os.path.join(ROOT, f), encoding='utf8').read(), re.M))
    new = {}
    def keyfor(text):
        if text in existing: return existing[text]
        if text in new.values(): return [k for k, v in new.items() if v == text][0]
        base = f'{prefix}.{slug(text)}'; k = base; n = 2
        while k in used or k in new: k = f'{base}_{n}'; n += 1
        new[k] = text; return k
    edits = []; report = []
    lines = src.split('\n')
    def skipped(pos):
        ln = line_of(src, pos); l = lines[ln - 1]
        if 'console.' in l or 'i18n-data' in l: return True
        return any(a <= ln <= b for a, b in skip)
    for (a, b) in regions:
        nodes = collect(src, a, b)
        seen = set()
        for n in nodes:
            ident = (n[0], n[3] if n[0] == 'str' else n[1])
            if ident in seen: continue
            seen.add(ident)
            if n[0] == 'str':
                _, q, body, st, en = n
                if not V.search(body) or skipped(st): continue
                after = src[en:en + 3].lstrip()
                before = src[max(0, st - 14):st].rstrip()
                if after.startswith(':') and not before.endswith('?'): continue  # object key
                if re.search(r'(===|!==|==|!=|\bcase)$', before): continue
                if re.search(r'\.(includes|startsWith|endsWith|replace|indexOf|test|match)\($', before): continue
                text = bytes(body, 'utf8').decode('unicode_escape').encode('latin1').decode('utf8') if '\\' in body else body
                k = keyfor(text)
                edits.append((st, en, f"t('{k}')"))
                report.append((line_of(src, st), k, text))
            else:
                _, st, en, parts = n
                if skipped(st): continue
                # split the template text into runs: between tags (> … <) and inside quotes of attributes
                # Build a flat list of (kind, text, abs) and find runs of text containing Vietnamese.
                flat = []
                for p in parts:
                    if p[0] == 'text':
                        for m in re.finditer(r'[^<>"]+|[<>"]', p[1]):
                            flat.append(('t', m.group(0), p[2] + m.start()))
                    else:
                        flat.append(('e', p[1], p[2] - 2))
                # a run: consecutive text pieces (not < > ") and exprs, bounded by < > " or ends
                i = 0
                while i < len(flat):
                    if flat[i][0] == 't' and flat[i][1] in '<>"':
                        i += 1; continue
                    j = i; run = []
                    while j < len(flat) and not (flat[j][0] == 't' and flat[j][1] in '<>"'):
                        run.append(flat[j]); j += 1
                    # inside a tag (between < and >) but not in quotes: skip (tag names, attributes)
                    prev = flat[i - 1][1] if i > 0 and flat[i - 1][0] == 't' else ''
                    in_tag = prev == '<' or (prev == '"' and False)
                    texts = ''.join(r[1] for r in run if r[0] == 't')
                    if not in_tag and V.search(texts):
                        # trim leading/trailing whitespace pieces that are text
                        startpos = run[0][2]; last = run[-1]
                        endpos = last[2] + (len(last[1]) + (3 if last[0] == 'e' else 0)) if last[0] == 'e' else last[2] + len(last[1])
                        raw = src[startpos:endpos]
                        lead = len(raw) - len(raw.lstrip()); trail = len(raw) - len(raw.rstrip())
                        core_start = startpos + lead; core_end = endpos - trail
                        core = src[core_start:core_end]
                        # rebuild value with {pN}
                        params = []; value = ''; k2 = core_start
                        for m in re.finditer(r'\$\{', core):
                            pass
                        # walk core using the run pieces
                        pieces = []
                        for r in run:
                            if r[0] == 't': pieces.append(('t', r[1], r[2]))
                            else: pieces.append(('e', r[1], r[2]))
                        out = ''
                        for kind, txt, pos in pieces:
                            if kind == 't':
                                s0 = max(pos, core_start); s1 = min(pos + len(txt), core_end)
                                if s1 > s0: out += src[s0:s1]
                            else:
                                if pos >= core_start and pos < core_end:
                                    out += '{p%d}' % len(params); params.append(txt)
                        if '\\' in out or '{' in out.replace('{p', ''):
                            report.append((line_of(src, core_start), 'TAY', core[:90])); i = j; continue
                        k = keyfor(out)
                        arg = '' if not params else ', { ' + ', '.join(f'p{n}: {e.strip()}' for n, e in enumerate(params)) + ' }'
                        edits.append((core_start, core_end, "${t('%s'%s)}" % (k, arg)))
                        report.append((line_of(src, core_start), k, out))
                    i = j if j > i else i + 1
    # apply edits from the end; drop overlapping ones (keep the outer-most earlier match)
    edits.sort(key=lambda e: (e[0], -e[1]))
    kept = []; last_end = -1
    for e in edits:
        if e[0] < last_end: continue
        kept.append(e); last_end = e[1]
    for st, en, rep in sorted(kept, reverse=True):
        src = src[:st] + rep + src[en:]
    for ln, k, text in sorted(report):
        print(f'{ln}\t{k}\t{text}')
    print(f'# {len(kept)} chỗ, {len(new)} key mới', file=sys.stderr)
    if dry: return
    open(full, 'w', encoding='utf8').write(src)
    if new:
        d = open(vi_path, encoding='utf8').read(); i = d.rstrip().rfind('};')
        body = ''.join("  '%s': %s,\n" % (k, "'" + v.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'") for k, v in new.items())
        open(vi_path, 'w', encoding='utf8').write(d[:i] + body + d[i:])

main()

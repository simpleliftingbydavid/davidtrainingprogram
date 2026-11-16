#!/usr/bin/env python3
"""Gắn data-i18n vào chữ tiếng Việt viết sẵn trong phần HTML (ngoài <script>/<style>) của một trang.

  python3 scripts/i18n-tag-html.py <trang.html> <tiền tố key> <file từ điển vi> [--dry]

- Phần tử chỉ chứa chữ: data-i18n="key". Chữ có thẻ nội dòng (strong, em, a, br, span…):
  data-i18n-html="key". Phần tử có id mà JS của trang nhắc tới (trang tự ghi lại chữ sau đó):
  bản -init, chỉ dịch lúc mở trang.
- placeholder / aria-label / title / alt có chữ Việt: data-i18n-<thuộc tính>="key".
- Key = tiền tố + chữ không dấu (tối đa 6 từ); chữ giống nhau dùng chung một key.
- Chữ nằm lẫn với khối con (div, p…) không tự gắn được: in ra để làm tay.
Ghi các key mới (key: chữ Việt) vào cuối file từ điển vi chỉ định (object `export default {…}`).
"""
import re, sys, unicodedata, html as htmllib, json
from html.parser import HTMLParser

V = re.compile(r'[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]', re.I)
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
INLINE = {'a','strong','b','em','i','span','small','br','code','kbd','abbr','sup','sub','mark','u','s','time'}
ATTRS = ['placeholder','aria-label','title','alt']

def slug(text, prefix, used, existing):
    t = unicodedata.normalize('NFD', text).replace('đ','d').replace('Đ','D')
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    words = re.findall(r'[a-z0-9]+', t)[:6] or ['text']
    base = f"{prefix}.{'_'.join(words)}"
    key, n = base, 2
    while key in used and used[key] != text or key in existing and existing[key] != text:
        key = f'{base}_{n}'; n += 1
    return key

class P(HTMLParser):
    def __init__(s, src):
        super().__init__(convert_charrefs=False); s.src = src; s.stack = []; s.els = []; s.texts = []
        lines = src.split('\n'); s.lineoff = [0]
        for l in lines: s.lineoff.append(s.lineoff[-1] + len(l) + 1)
    def pos(s):
        l, c = s.getpos(); return s.lineoff[l-1] + c
    def handle_starttag(s, tag, attrs):
        start = s.pos(); end = start + len(s.get_starttag_text())
        el = {'tag': tag, 'attrs': dict(attrs), 'start': start, 'tagend': end, 'parent': s.stack[-1] if s.stack else None, 'children': [], 'direct': ''}
        if el['parent'] is not None: el['parent']['children'].append(el)
        s.els.append(el)
        if tag not in VOID: s.stack.append(el)
        else: el['close'] = end; el['end'] = end
    def handle_startendtag(s, tag, attrs):
        s.handle_starttag(tag, attrs)
        if s.stack and s.stack[-1]['tag'] == tag and tag not in VOID:
            el = s.stack.pop(); el['close'] = el['end'] = el['tagend']
    def handle_endtag(s, tag):
        p = s.pos()
        for i in range(len(s.stack)-1, -1, -1):
            if s.stack[i]['tag'] == tag:
                for el in s.stack[i:]:
                    el.setdefault('close', p); el.setdefault('end', p + len(f'</{tag}>'))
                del s.stack[i:]; break
    def handle_data(s, data):
        if s.stack: s.stack[-1]['direct'] += data
    handle_entityref = lambda s, n: s.stack and s.stack[-1].__setitem__('direct', s.stack[-1]['direct'] + '&' + n + ';')
    handle_charref = lambda s, n: s.stack and s.stack[-1].__setitem__('direct', s.stack[-1]['direct'] + '&#' + n + ';')

def main():
    page, prefix, dictfile = sys.argv[1:4]; dry = '--dry' in sys.argv
    src = open(page, encoding='utf8').read()
    scripts = ''.join(re.findall(r'<script[^>]*>([\s\S]*?)</script>', src))
    jsfiles = re.findall(r"from\s+'\./([\w.-]+\.js)'", scripts)
    alljs = scripts
    for f in jsfiles:
        try: alljs += open(f, encoding='utf8').read()
        except OSError: pass
    dsrc = open(dictfile, encoding='utf8').read()
    existing = dict(re.findall(r"^\s*'([\w.]+)':\s*'((?:[^'\\]|\\.)*)',", dsrc, re.M))
    existing = {k: v.replace("\\'", "'") for k, v in existing.items()}
    by_text = {v: k for k, v in existing.items()}
    p = P(src); p.feed(src)
    inside_skip = lambda el: any(a['tag'] in ('script','style','svg','template') for a in ancestors(el))
    def ancestors(el):
        out = []; e = el['parent']
        while e is not None: out.append(e); e = e['parent']
        return out
    edits = []; new = {}; manual = []
    chosen = set()
    def keyfor(text):
        if text in by_text: return by_text[text]
        k = slug(text, prefix, new, existing); new[k] = text; by_text[text] = k; return k
    def js_mentions(el):
        i = el['attrs'].get('id')
        return bool(i) and re.search(r"""(getElementById\(\s*['"]%s['"]|['"`]#%s\b|\$\(\s*['"]%s['"])""" % ((re.escape(i),)*3), alljs)
    for el in p.els:
        if el['tag'] in ('script','style','svg','template') or inside_skip(el): continue
        # attributes
        for a in ATTRS:
            v = el['attrs'].get(a)
            if v and V.search(v) and f'data-i18n-{a}' not in el['attrs']:
                edits.append((el['tagend'] - (2 if src[el['tagend']-2:el['tagend']] == '/>' else 1), f' data-i18n-{a}="{keyfor(htmllib.unescape(v))}"'))
        if el['tag'] == 'head' or 'close' not in el: continue
        if not V.search(el['direct']): continue
        if any(id(a) in chosen for a in ancestors(el)): continue
        if any(k.startswith('data-i18n') and k not in ('data-i18n-'+x for x in ATTRS) for k in el['attrs']): continue
        inner = src[el['tagend']:el['close']]
        def all_inline(e):
            return all(c['tag'] in INLINE and 'id' not in c['attrs'] and all_inline(c) for c in e['children'])
        if not all_inline(el):
            line = src.count('\n', 0, el['start']) + 1
            manual.append(f"{page}:{line} <{el['tag']}> {re.sub(r'\s+',' ',el['direct']).strip()[:80]}"); continue
        chosen.add(id(el))
        has_tags = bool(el['children'])
        text = re.sub(r'\s+', ' ', inner).strip() if has_tags else re.sub(r'\s+', ' ', htmllib.unescape(inner)).strip()
        if text != inner.strip() and not has_tags:
            # keep exact whitespace semantics: normalize only if the element's text is the same after trimming
            pass
        k = keyfor(text)
        attr = ('data-i18n-html' if has_tags else 'data-i18n') + ('-init' if js_mentions(el) else '')
        edits.append((el['tagend'] - 1, f' {attr}="{k}"'))
    for pos, ins in sorted(edits, reverse=True):
        src = src[:pos] + ins + src[pos:]
    print(f'{page}: {len(edits)} chỗ gắn, {len(new)} key mới, {len(manual)} chỗ làm tay')
    for m in manual: print('  TAY', m)
    if dry: 
        for k, v in new.items(): print('  ', k, '=', v)
        return
    open(page, 'w', encoding='utf8').write(src)
    if new:
        body = ''.join(f"  {json.dumps(k)[0:0]}'{k}': '{v.replace(chr(92), chr(92)*2).replace(chr(39), chr(92)+chr(39))}',\n" for k, v in new.items())
        i = dsrc.rstrip().rfind('};')
        dsrc = dsrc[:i] + body + dsrc[i:]
        open(dictfile, 'w', encoding='utf8').write(dsrc)

main()

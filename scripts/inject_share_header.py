"""Idempotently add the shared share-microheader to every prez HTML page.
Inserts <script src="/prez-header.js" defer></script> before the last </body>."""
import os, re, sys
TAG = '<script src="/prez-header.js" defer></script>'
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
added, skipped = [], []
for dp, dn, fn in os.walk(root):
    if '/.git' in dp: continue
    for f in fn:
        if not f.endswith('.html'): continue
        p = os.path.join(dp, f); rel = os.path.relpath(p, root)
        html = open(p, encoding='utf-8').read()
        if '/prez-header.js' in html:
            skipped.append(rel); continue
        if re.search(r'</body>', html, re.I):
            html = re.sub(r'([ \t]*)</body>', TAG + r'\n\1</body>', html, count=1,
                          flags=re.I)
        else:
            html = html.rstrip() + '\n' + TAG + '\n'
        open(p, 'w', encoding='utf-8').write(html)
        added.append(rel)
print(f"ADDED ({len(added)}):"); [print("  +", r) for r in sorted(added)]
print(f"SKIPPED already-had ({len(skipped)}):"); [print("  =", r) for r in sorted(skipped)]

#!/usr/bin/env python3
# ---
# name: nav_audit
# summary: Lists prez pages that no navigation links to, so nothing published is unfindable. Exit 1 when any page is missing a card, or a category is missing from the home page. Pages that are deliberately unlisted go in scripts/nav-unlisted.txt.
# version: 1.0.1
# created: 2026-11-09
# last_updated: 2026-11-09
# maintainer: pvragon
# ---
"""Usage: python3 scripts/nav_audit.py [repo_root] [--self-check]

A page is listed when its category's index.html links to it (with or without .html).
A category is listed when the root index.html links to its folder.
"""
import os
import re
import sys
import tempfile

# Folders that hold code, data or work in progress, not published categories.
SKIP = {"api", "lib", "public", "scripts", "supabase", "runtime", "node_modules", "backlog", "drafts"}
ALLOW_FILE = os.path.join("scripts", "nav-unlisted.txt")


def hrefs(path):
    """Every local href in an HTML file, without #fragment or ?query."""
    if not os.path.exists(path):
        return set()
    text = open(path, encoding="utf-8", errors="ignore").read()
    out = set()
    for h in re.findall(r'href="([^"]+)"', text):
        if h.startswith(("http:", "https:", "mailto:", "data:", "#")):
            continue
        out.add(h.split("#")[0].split("?")[0])
    return out


def resolve(base_dir, href):
    """A repo-relative path for an href written inside base_dir."""
    if href.startswith("/"):
        return os.path.normpath(href.lstrip("/"))
    return os.path.normpath(os.path.join(base_dir, href))


def is_redirect(path):
    """A moved-page stub (meta refresh) needs no card: its target has one."""
    head = open(path, encoding="utf-8", errors="ignore").read(4000).lower()
    return 'http-equiv="refresh"' in head


def allowlist(root):
    p = os.path.join(root, ALLOW_FILE)
    if not os.path.exists(p):
        return set()
    lines = (l.split("#")[0].strip() for l in open(p, encoding="utf-8"))
    return {l for l in lines if l}


def audit(root):
    """Return (missing_pages, missing_categories); each path is repo-relative."""
    allowed = allowlist(root)
    root_links = {resolve("", h).split("/")[0] for h in hrefs(os.path.join(root, "index.html"))}
    missing_pages, missing_cats = [], []
    for cat in sorted(os.listdir(root)):
        d = os.path.join(root, cat)
        if not os.path.isdir(d) or cat in SKIP or cat.startswith("."):
            continue
        has_pages = False
        linked = {resolve(cat, h) for h in hrefs(os.path.join(d, "index.html"))}
        linked |= {l[:-5] if l.endswith(".html") else l for l in list(linked)}
        for dp, _, files in os.walk(d):
            for f in files:
                if not f.endswith(".html"):
                    continue
                rel = os.path.relpath(os.path.join(dp, f), root)
                if rel == os.path.join(cat, "index.html"):
                    continue
                has_pages = True
                if rel in allowed or is_redirect(os.path.join(dp, f)):
                    continue
                stem = rel[:-5]
                folder = os.path.dirname(rel)
                if stem in linked or rel in linked:
                    continue
                if f == "index.html" and folder in linked:
                    continue
                missing_pages.append(rel)
        if has_pages and cat not in root_links and cat + "/" not in allowed and cat not in allowed:
            missing_cats.append(cat)
    return missing_pages, missing_cats


def self_check():
    with tempfile.TemporaryDirectory() as t:
        os.makedirs(os.path.join(t, "cat"))
        os.makedirs(os.path.join(t, "orphan"))
        open(os.path.join(t, "index.html"), "w").write('<a href="cat/">x</a>')
        open(os.path.join(t, "cat", "index.html"), "w").write('<a href="listed">a</a><a href="b.html">b</a>')
        for f in ("listed.html", "b.html", "missing.html", "private.html"):
            open(os.path.join(t, "cat", f), "w").write("x")
        open(os.path.join(t, "cat", "moved.html"), "w").write('<meta http-equiv="refresh" content="0; url=b">')
        open(os.path.join(t, "orphan", "page.html"), "w").write("x")
        os.makedirs(os.path.join(t, "scripts"))
        open(os.path.join(t, ALLOW_FILE), "w").write("cat/private.html  # deliberate\n")
        pages, cats = audit(t)
        assert pages == ["cat/missing.html", "orphan/page.html"], pages
        assert cats == ["orphan"], cats
    print("self-check ok")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--self-check" in sys.argv:
        self_check()
        return 0
    root = args[0] if args else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pages, cats = audit(root)
    for c in cats:
        print(f"category not on home page: {c}/")
    for p in pages:
        print(f"page with no listing card: {p}")
    if not pages and not cats:
        print("nav ok: every page is listed or allowlisted")
        return 0
    print(f"{len(pages)} page(s), {len(cats)} categor(ies) unlisted. Add cards, or allowlist in {ALLOW_FILE} with a reason.")
    return 1


if __name__ == "__main__":
    sys.exit(main())

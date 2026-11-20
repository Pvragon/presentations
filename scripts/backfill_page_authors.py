#!/usr/bin/env python3
"""Record the author of every comment-enabled prez page that existed before the author registry (2026-11-20).

Author = the git author who first added the file, mapped to a prez writer id. Pages Jaime's account added are his
(the API also defaults any unregistered page to `jaime`, so those rows are a record, not a requirement).

  python3 scripts/backfill_page_authors.py            # dry run: print page → author
  python3 scripts/backfill_page_authors.py --apply    # write prez_pages rows through /api/comments (agent token)
"""
import subprocess, sys, pathlib, importlib.util

REPO = pathlib.Path(__file__).resolve().parent.parent
GIT_TO_WRITER = {  # git author name → (writer id, display name)
    "jkhereford": ("jaime", "Jaime"),
    "Roman Naidenko": ("roman", "Roman"),
    "Verridiumc": ("victor", "Victor"),   # Victor Cheung, GitHub Verridium (Jaime, 2026-11-20)
    "blondiegeek": ("blondiegeek", "blondiegeek"),
}


def first_author(rel):
    out = subprocess.run(["git", "-C", str(REPO), "log", "--diff-filter=A", "--follow", "--format=%an", "--", rel],
                         capture_output=True, text=True).stdout.split("\n")
    names = [n for n in out if n.strip()]
    return names[-1] if names else None


def main(apply):
    spec = importlib.util.spec_from_file_location("pc", pathlib.Path.home() / "ai-workspace/my-lib/executions/prez_comments.py")
    pc = importlib.util.module_from_spec(spec); spec.loader.exec_module(pc)
    rows = []
    for f in sorted(REPO.rglob("*.html")):
        rel = str(f.relative_to(REPO))
        if rel.startswith(("runtime/", "node_modules/", ".")) or 'name="prez-comments" content="on"' not in f.read_text(errors="ignore"):
            continue
        git = first_author(rel)
        if git not in GIT_TO_WRITER:
            sys.exit(f"unmapped git author {git!r} for {rel}: add it to GIT_TO_WRITER")
        rows.append((pc.norm_page("/" + rel), *GIT_TO_WRITER[git]))
    for page, wid, name in rows:
        print(f"{page:70} {wid}")
        if apply:
            pc.call("POST", None, {"action": "set_author", "page": page, "author_id": wid, "author_name": name})
    print(f"{len(rows)} pages{' recorded' if apply else ' (dry run)'}")


if __name__ == "__main__":
    main("--apply" in sys.argv)

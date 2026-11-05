#!/usr/bin/env python3
"""Deckwright deck page: the Monday-list format, regenerated from data.

Two steps, so a page is a pure function of committed files:

  gather  DECK_DIR   runs Deckwright on DECK_DIR/deck.txt and writes DECK_DIR/inputs.json
                     (review, strength, card facts from the local card store), and downloads any
                     card image missing from deckwright/cards/.
  render  DECK_DIR   reads DECK_DIR/spec.json + DECK_DIR/inputs.json and writes the page named
                     by spec["out"] under deckwright/. No network, no Deckwright call.

spec.json holds what a person decides: the words (title, lede, notes), the palette and the role
each card is filed under. inputs.json holds what Deckwright measured. Rendering the same two files
always gives the same bytes. Format source: deckwright/261101-scarab-god-monday.html.

Self-check: python3 deck_page.py --self-check
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
import urllib.request
from math import comb
from pathlib import Path

HERE = Path(__file__).resolve().parent
PREZ = HERE.parent.parent                      # the presentations repo
CARDS = PREZ / "deckwright" / "cards"
DECKWRIGHT = Path(os.environ.get("DECKWRIGHT_REPO", Path.home() / "deckwright"))
DATA = Path(os.environ.get("DECKWRIGHT_DATA", Path.home() / ".cache" / "deckwright"))
SEEN_BY = 11                                   # cards seen for the redundancy odds: opening 7 + 4 draws
TYPE_ORDER = ("Creature", "Planeswalker", "Instant", "Sorcery", "Artifact", "Enchantment", "Battle", "Land")
TYPE_PLURAL = {"Creature": "Creatures", "Planeswalker": "Planeswalkers", "Instant": "Instants",
               "Sorcery": "Sorceries", "Artifact": "Artifacts", "Enchantment": "Enchantments",
               "Battle": "Battles", "Land": "Lands"}
E = html.escape


# ---------------------------------------------------------------- shared helpers

def slug(name: str) -> str:
    """Card image file name, as the Monday page's cards/ folder spells it."""
    s = name.lower().replace("'", "-").replace("’", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def read_deck(path: Path) -> tuple[list[str], list[tuple[int, str]]]:
    commanders, cards, part = [], [], None
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        if line in ("Commander", "Deck"):
            part = line
            continue
        n, name = line.split(" ", 1)
        (commanders if part == "Commander" else cards).append((int(n), name))
    return [c for _, c in commanders], cards


def main_type(type_line: str) -> str:
    front = type_line.split("//")[0]
    for t in ("Land", "Creature", "Planeswalker", "Battle", "Instant", "Sorcery", "Artifact", "Enchantment"):
        if t in front:
            return t
    return "Other"


def odds(k: int, n: int = SEEN_BY, deck: int = 99) -> float:
    """Chance of at least one of k copies among the first n cards of a 99-card library."""
    return 1 - comb(deck - k, n) / comb(deck, n) if k else 0.0


def pips(cost: str) -> str:
    if not cost:
        return ""
    cost = cost.split(" // ")[0]
    out = []
    for sym in re.findall(r"\{([^}]+)\}", cost):
        cls = {"W": "pw", "U": "pu", "B": "pb", "R": "pr", "G": "pg"}.get(sym, "pc")
        out.append(f'<i class="pip {cls}">{E(sym)}</i>')
    return f'<span class="cost">{"".join(out)}</span>' if out else ""


# ---------------------------------------------------------------- gather

def _uv(project: str, *args: str) -> str:
    cmd = ["uv", "run", "--project", f"packages/{project}", "python", "-m", f"deckwright_{project}", *args]
    r = subprocess.run(cmd, cwd=DECKWRIGHT, capture_output=True, text=True)
    if r.returncode not in (0,):
        raise SystemExit(f"{' '.join(cmd)} failed ({r.returncode}):\n{r.stderr[-2000:]}")
    return r.stdout


def _fetch_images(names: list[str]) -> list[str]:
    CARDS.mkdir(parents=True, exist_ok=True)
    missing = [n for n in names if not (CARDS / f"{slug(n)}.jpg").exists()]
    got = []
    for i in range(0, len(missing), 75):
        batch = missing[i:i + 75]
        body = json.dumps({"identifiers": [{"name": n.split(" // ")[0]} for n in batch]}).encode()
        req = urllib.request.Request("https://api.scryfall.com/cards/collection", data=body,
                                     headers={"Content-Type": "application/json", "Accept": "application/json",
                                              "User-Agent": "deckwright-deck-page/1.0"})
        res = json.load(urllib.request.urlopen(req, timeout=60))
        by_front = {n.split(" // ")[0].lower(): n for n in batch}
        for card in res.get("data", []):
            uris = card.get("image_uris") or (card.get("card_faces") or [{}])[0].get("image_uris") or {}
            name = by_front.get(card["name"].split(" // ")[0].lower())
            if not name or "normal" not in uris:
                continue
            req = urllib.request.Request(uris["normal"], headers={"User-Agent": "deckwright-deck-page/1.0"})
            (CARDS / f"{slug(name)}.jpg").write_bytes(urllib.request.urlopen(req, timeout=60).read())
            got.append(name)
            time.sleep(0.1)                     # Scryfall asks for 50-100 ms between requests
    return got


def gather(deck_dir: Path, bracket: int) -> None:
    deck = deck_dir / "deck.txt"
    commanders, cards = read_deck(deck)
    out = deck_dir / ".review.json"
    _uv("expert", "review", str(deck.resolve()), "--bracket", str(bracket), "--out", str(out.resolve()))
    review = json.loads(out.read_text())
    out.unlink()
    strength = json.loads(_uv("analysis", "strength", str(deck.resolve()), "--bracket", str(bracket), "--json"))
    con = sqlite3.connect(DATA / "cards.sqlite")
    facts = {}
    for name in commanders + [c for _, c in cards]:
        r = con.execute("select oracle_id, mana_cost, cmc, type_line, game_changer from cards where name=?",
                        (name,)).fetchone()
        if not r:
            raise SystemExit(f"not in the card store: {name}")
        price = con.execute("select min(usd) from prices where oracle_id=? and usd is not null", (r[0],)).fetchone()[0]
        facts[name] = {"mana_cost": r[1] or "", "mv": r[2], "type_line": r[3], "type": main_type(r[3]),
                       "game_changer": bool(r[4]), "usd": price}
    meta = dict(con.execute("select key, value from meta"))
    inputs = {"commanders": commanders, "cards": [{"count": n, "name": c} for n, c in cards],
              "facts": facts, "review": review, "strength": strength,
              "sources": {"scryfall_updated": json.loads(meta["sources"]).get("oracle_cards"),
                          "store_built": meta.get("built_at"),
                          "combos": review["bracket"]["notes"]}}
    (deck_dir / "inputs.json").write_text(json.dumps(inputs, indent=1, sort_keys=True) + "\n")
    got = _fetch_images(commanders + [c for _, c in cards])
    print(f"wrote {deck_dir / 'inputs.json'}; {len(got)} new card images")


# ---------------------------------------------------------------- render pieces

def palette_css(p: dict) -> str:
    def block(t: dict) -> str:
        return "; ".join(f"--{k}:{v}" for k, v in t.items())
    fonts = ('--display:"Grenze",Georgia,"Times New Roman",serif; '
             '--body:"IBM Plex Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; '
             '--mono:"IBM Plex Mono",ui-monospace,"SFMono-Regular",Menlo,monospace')
    return (f"/* {p['comment']} */\n:root{{{block(p['light'])}; {fonts}}}\n"
            f"@media (prefers-color-scheme:dark){{:root:not([data-theme=\"light\"]){{{block(p['dark'])}; color-scheme:dark}}}}\n"
            f":root[data-theme=\"dark\"]{{{block(p['dark'])}; color-scheme:dark}}\n")


def card_li(name: str, facts: dict, qty: int = 1) -> str:
    f = facts[name]
    q = f'<span class="qty">{qty}</span>' if qty > 1 else ""
    cost = "" if f["type"] == "Land" else pips(f["mana_cost"])
    return f'<li><span class="cn">{E(name)}</span>{q}{cost}</li>'


def sort_cards(names, facts):
    return sorted(names, key=lambda n: (facts[n]["type"] != "Land", facts[n]["mv"] or 0, n))


def curve_svg(buckets: dict) -> str:
    vals = [buckets.get(str(i), 0) for i in range(7)] + [sum(v for k, v in buckets.items() if int(k) >= 7)]
    top = max(5, -(-max(vals) // 5) * 5)
    y = lambda v: 190 - v * 172 / top
    peak = vals.index(max(vals))
    out = ['<svg viewBox="0 0 520 220" role="img" aria-label="Mana curve">']
    for t in range(0, top + 1, 5):
        out.append(f'<line x1="34" x2="510" y1="{y(t):.1f}" y2="{y(t):.1f}" class="grid"/>'
                   f'<text x="28" y="{y(t) + 4:.1f}" class="ax" text-anchor="end">{t}</text>')
    for i, v in enumerate(vals):
        x = 40 + i * 59.5
        hl = " hl" if i == peak else ""
        out.append(f'<rect x="{x:.1f}" y="{y(v):.1f}" width="47.5" height="{190 - y(v):.1f}" rx="2" class="bar{hl}"/>'
                   f'<text x="{x + 23.75:.1f}" y="{y(v) - 5:.1f}" class="lbl" text-anchor="middle">{v}</text>'
                   f'<text x="{x + 23.75:.1f}" y="206" class="ax" text-anchor="middle">{"7+" if i == 7 else i}</text>')
    return "".join(out) + "</svg>"


def goldfish_svg(gf: dict) -> str:
    turns = [str(t) for t in range(1, 9)]
    a = [gf["mana"][t] for t in turns]
    b = [gf["spent"][t] for t in turns]
    x = lambda i: 44 + i * 450 / 7
    y = lambda v: 210 - v * 23
    out = ['<svg viewBox="0 0 520 240" role="img" aria-label="Goldfish mana by turn">']
    for t in range(0, 9, 2):
        out.append(f'<line x1="44" x2="494" y1="{y(t):.1f}" y2="{y(t):.1f}" class="grid"/>'
                   f'<text x="38" y="{y(t) + 4:.1f}" class="ax" text-anchor="end">{t}</text>')
    for i in range(8):
        out.append(f'<text x="{x(i):.1f}" y="230" class="ax" text-anchor="middle">T{i + 1}</text>')
    pa = " ".join(f"L{x(i):.1f},{y(v):.1f}" for i, v in enumerate(a))
    pb = " ".join(f"L{x(i):.1f},{y(v):.1f}" for i, v in enumerate(b))
    out.append(f'<path d="M44.0,210.0 {pa} L494.0,210.0 Z" class="area"/>')
    out.append(f'<path d="M{pa[1:]}" class="line-a"/><path d="M{pb[1:]}" class="line-b"/>')
    out += [f'<circle cx="{x(i):.1f}" cy="{y(v):.1f}" r="3" class="dot-a"/>' for i, v in enumerate(a)]
    out += [f'<circle cx="{x(i):.1f}" cy="{y(v):.1f}" r="3" class="dot-b"/>' for i, v in enumerate(b)]
    out.append(f'<text x="488.0" y="{y(a[-1]) - 9:.1f}" class="lbl" text-anchor="end">{a[-1]:.1f} available</text>')
    out.append(f'<text x="488.0" y="{y(b[-1]) + 18:.1f}" class="lbl" text-anchor="end">{b[-1]:.1f} spent</text>')
    return "".join(out) + "</svg>"


def verdict(status: str) -> str:
    word, cls = {"within": ("OK", "v-ok"), "below": ("SHORT", "v-short"), "above": ("OVER", "v-over")}[status]
    return f'<span class="verdict {cls}">{word}</span>'


PACKAGE_LABEL = {"ramp": "Ramp", "card_advantage": "Card advantage", "targeted_interaction": "Targeted interaction",
                 "mass_interaction": "Mass interaction", "protection": "Protection", "plan": "Plan cards",
                 "lands": "Lands"}
KIND_LABEL = {"cheap_one_for_one": "Cheap one-for-one removal", "counterspell": "Counterspells", "edict": "Edicts",
              "repeatable_removal": "Repeatable removal", "one_sided_wipe": "One-sided wipes", "wipe": "Symmetric wipes"}


# ---------------------------------------------------------------- render

def render(deck_dir: Path) -> Path:
    spec = json.loads((deck_dir / "spec.json").read_text())
    inp = json.loads((deck_dir / "inputs.json").read_text())
    facts, rv, st = inp["facts"], inp["review"], inp["strength"]
    cmdr = inp["commanders"]
    deck = [(c["count"], c["name"]) for c in inp["cards"]]
    names = [n for _, n in deck]
    qty = {n: q for q, n in deck}
    total = sum(qty.values())

    # every card in the 99 sits in at least one role, and every role card is in the deck
    filed = {c for r in spec["roles"] for c in r["cards"]}
    unknown = sorted(filed - set(names))
    unfiled = sorted(set(n for n in names if facts[n]["type"] != "Land") - filed)
    if unknown or unfiled:
        raise SystemExit(f"spec roles disagree with the deck: not in deck {unknown}; nonland cards in no role {unfiled}")

    lands = [n for n in names if facts[n]["type"] == "Land"]
    land_count = sum(qty[n] for n in lands)
    nonland = [n for n in names if facts[n]["type"] != "Land"]
    price = sum((facts[n]["usd"] or 0) * qty.get(n, 1) for n in cmdr + names)
    unpriced = [n for n in cmdr + names if facts[n]["usd"] is None]
    gf = rv["goldfish"]
    computed = {
        "power": f'{st["power"]:.2f}', "bracket_floor": str(rv["bracket"]["floor"]),
        "game_changers": str(rv["bracket"]["facts"]["game_changers"]),
        "combos": str(rv["bracket"]["facts"]["two_card_combos"]),
        "price": f"${price:,.0f}", "avg_mv": f'{rv["curve"]["avg_mv"]:.2f}',
        "lands": str(land_count),
        "cmdr_by_t4": f'{round(100 * gf["p_commanders"]["4"])}%',
        "cmdr_by_t5": f'{round(100 * gf["p_commanders"]["5"])}%',
        "mulligan": f'{round(100 * gf["mulligan_rate"])}%',
        "games": f'{gf["games"]:,}',
        "role_entries": str(sum(len(r["cards"]) for r in spec["roles"]) + len(lands)),
    }
    for r in spec["roles"]:
        computed["role:" + r["name"]] = str(len(r["cards"]))
    fill = lambda s: re.sub(r"\{([a-z_0-9:A-Z ,'-]+)\}", lambda m: computed.get(m.group(1), m.group(0)), s)

    css = (HERE / "deck_page.css").read_text()
    P = []
    P.append(f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="prez-comments" content="on">
<link rel="icon" type="image/png" sizes="32x32" href="/deckwright/favicon-32.png?v=2">
<link rel="icon" type="image/png" sizes="192x192" href="/deckwright/favicon-192.png?v=2">
<link rel="apple-touch-icon" href="/deckwright/apple-touch-icon.png?v=2">
<title>{E(spec["title"])}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Grenze:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>
/* Generated by scripts/deckwright/deck_page.py from {deck_dir.name}/spec.json and inputs.json; do not edit by hand. */
{palette_css(spec["palette"])}{css}</style>
</head>
<body>
<div class="wrap"><header>
  <div class="eyebrow">{E(fill(spec["eyebrow"]))}</div>
  <h1>{E(spec["title"])}</h1>
  <p class="lede">{E(fill(spec["lede"]))}</p>
  <p class="meta">{E(fill(spec["meta"]))}</p>
</header>""")

    figs = "".join(f'<div class="fig"><b>{E(fill(f["value"]))}</b><span>{E(fill(f["label"]))}</span>'
                   f'<small>{E(fill(f["source"]))}</small></div>' for f in spec["figures"])
    P.append(f'<section aria-label="Key figures"><div class="figs">{figs}</div></section>')

    # ---- architecture
    A = rv["architecture"]
    cat_rows = "".join(f'<tr><td>{E(c["name"])}</td><td class="num">{c["count"]}</td></tr>' for c in A["categories"])
    cat_rows += (f'<tr class="sum"><td>Sum of categories</td><td class="num">{A["sum"]}</td></tr>'
                 f'<tr class="sum"><td>Cards working in two or more categories</td><td class="num">{len(A["multi"])}</td></tr>'
                 f'<tr><td>Cards, basics excluded</td><td class="num">{total - sum(qty[b] for b in spec.get("basics", []) if b in qty)}</td></tr>')
    outside = sorted(o["card"] for o in A["outside"])
    type_counts = {}
    for n in names:
        type_counts[facts[n]["type"]] = type_counts.get(facts[n]["type"], 0) + qty[n]
    type_rows = "".join(f'<tr><td>{t}</td><td class="num">{type_counts[t]}</td></tr>' for t in TYPE_ORDER if t in type_counts)
    type_rows += f'<tr class="sum"><td>Total</td><td class="num">{total}</td></tr>'

    tgt = rv["targets"]
    trow = lambda label, have, want, status, why="": (
        f'<tr><td>{E(label)}</td><td class="num">{have}</td><td class="num">{want}</td><td>{verdict(status)}</td>'
        f'<td class="note">{E(why)}</td></tr>')
    target_rows = []
    for p in rv["packages"]:
        want = f'{p["min"]}-{p["max"]}'
        why = (f'{round(100 * p["p"])}% to see one by turn {p["turn"]} (target {round(100 * p["p_target"])}%)'
               if p.get("p") is not None else "")
        target_rows.append(trow(PACKAGE_LABEL.get(p["name"], p["name"]), p["count"], want, p["status"], why))
    for k in tgt["interaction"]:
        target_rows.append(trow(KIND_LABEL.get(k["kind"], k["kind"]), k["count"], k["target"], k["status"],
                                ", ".join(k["cards"])))
    for t in tgt["types"]:
        if t["count"] or t["high"]:
            target_rows.append(trow(TYPE_PLURAL[t["type"].capitalize()], t["count"], f'{t["low"]}-{t["high"]}', t["status"]))

    rules = "".join(f"<li><b>{E(k)}:</b> {E(fill(v))}</li>" for k, v in spec["constraints"])
    P.append(f"""<section aria-labelledby="arch-h">
  <div class="eyebrow">Architecture</div>
  <h2 id="arch-h">{E(spec["arch_heading"])}</h2>
  <p>{E(fill(spec["arch_intro"]))}</p>
  <h3>Card pool and constraints</h3><ul class="rules">{rules}</ul>
  <h3>Against Deckwright's targets</h3>
  <p class="note">{E(fill(spec["targets_note"]))}</p>
  <div class="scroll"><table class="arch"><thead><tr><th>Effect</th><th class="num">Deck</th><th class="num">Target</th><th>Verdict</th><th>Detail</th></tr></thead><tbody>{"".join(target_rows)}</tbody></table></div>
  <h3>By category and card type</h3>
  <div class="tgs" role="group" aria-label="Table view"><button type="button" class="tg" data-grp="t" data-i="0" aria-pressed="true">By category</button><button type="button" class="tg" data-grp="t" data-i="1" aria-pressed="false">By card type</button></div>
  <div class="tv" data-view="0"><div class="scroll"><table class="arch"><thead><tr><th>Category</th><th class="num">This deck</th></tr></thead><tbody>{cat_rows}</tbody></table></div><p class="note">In no package ({len(outside)}): {E("; ".join(outside))}. {E(fill(spec.get("outside_note", "")))}</p></div><div class="tv" data-view="1" hidden><div class="scroll"><table class="arch"><thead><tr><th>Card type</th><th class="num">This deck</th></tr></thead><tbody>{type_rows}</tbody></table></div></div>
  <h3>Curve and goldfish</h3>
  <div class="two"><div class="box"><h3>Mana curve, nonland cards</h3>{curve_svg(rv["curve"]["buckets"])}</div><div class="box"><h3>Goldfish, mean by turn</h3>{goldfish_svg(gf)}<div class="legend"><span><i class="sw" style="background:var(--accent)"></i>mana available</span><span><i class="sw" style="background:var(--violet)"></i>mana spent</span></div></div></div><div class="scroll"><table class="arch"><thead><tr><th>Turn</th>{"".join(f'<th class="num">T{t}</th>' for t in range(1, 9))}</tr></thead><tbody><tr><td>{E(spec["cmdr_short"])} cast</td>{"".join(f'<td class="num">{round(100 * gf["p_commanders"][str(t)])}%</td>' for t in range(1, 9))}</tr></tbody></table></div>
  <p class="note">{E(fill(spec["goldfish_note"]))}</p>
  <script>
  document.querySelectorAll('#arch-h ~ .tgs .tg').forEach(function(b){{b.addEventListener('click',function(){{
    var g=b.dataset.grp, i=b.dataset.i, sec=b.closest('section');
    sec.querySelectorAll('.tg[data-grp="'+g+'"]').forEach(function(x){{x.setAttribute('aria-pressed', x===b?'true':'false');}});
    sec.querySelectorAll(g==='t'?'.tv':'.cv').forEach(function(v){{v.hidden = v.dataset.view!==i;}});
  }});}});
  </script>
</section>""")

    # ---- redundancy
    rrows = []
    for r in spec["roles"]:
        if r.get("redundancy") is False:
            continue
        k = len(r["cards"])
        p = round(100 * odds(k))
        kind = "thin" if p < 50 else r.get("kind", "main")
        rrows.append(f'<div class="rrow {kind}"><span class="rname">{E(r["name"])}</span><span class="rcount">{k}</span>'
                     f'<span class="rbar"><span style="width:{p}%"></span></span><span class="rp">{p}%</span></div>')
    P.append(f"""<section aria-labelledby="red-h">
  <div class="eyebrow">Redundancy</div>
  <h2 id="red-h">How often each role shows up</h2>
  <p class="note">Odds of at least one card of the role in your first {SEEN_BY} cards (opening hand plus four draws). Under 50% is marked thin.</p>
  <div class="box rtable">{"".join(rrows)}</div>
</section>""")

    # ---- the 99
    groups = []
    for r in spec["roles"]:
        note = f'<p class="note">{E(r["note"])}</p>' if r.get("note") else ""
        lis = "".join(card_li(n, facts) for n in sort_cards(r["cards"], facts))
        groups.append(f'<div class="dg"><h3>{E(r["name"])} <span class="ct">{len(r["cards"])}</span></h3>{note}<ul class="cards">{lis}</ul></div>')
    land_lis = "".join(card_li(n, facts, qty[n]) for n in sorted(lands))
    groups.append(f'<div class="dg"><h3>Lands <span class="ct">{land_count}</span></h3><ul class="cards">{land_lis}</ul></div>')
    bytype = []
    for t in TYPE_ORDER:
        ns = [n for n in names if facts[n]["type"] == t]
        if not ns:
            continue
        lis = "".join(card_li(n, facts, qty[n]) for n in (sorted(ns) if t == "Land" else sort_cards(ns, facts)))
        bytype.append(f'<div class="dg"><h3>{TYPE_PLURAL[t]} <span class="ct">{sum(qty[n] for n in ns)}</span></h3><ul class="cards">{lis}</ul></div>')
    cf = facts[cmdr[0]]
    P.append(f"""<section aria-labelledby="deck-h">
  <div class="eyebrow">The 99</div>
  <h2 id="deck-h">Built by role</h2>
  <p>{E(fill(spec["deck_intro"]))} Hover or tap a card name to see the card.</p>
  <div class="box cmdr"><div><div class="eyebrow">Commander</div><h3>{E(cmdr[0])} {pips(cf["mana_cost"])}</h3></div><p>{E(fill(spec["cmdr_note"]))}</p></div>
  <div class="tgs" role="group" aria-label="Deck view"><button type="button" class="tg" data-i="0" aria-pressed="true">By role</button><button type="button" class="tg" data-i="1" aria-pressed="false">By card type</button></div><p class="note" data-for="0">A card that fills several roles is listed under each, so the role lists hold {computed["role_entries"]} entries for {total} cards.</p><div class="deckm" data-view="0">{"".join(groups)}</div><div class="deckm" data-view="1" hidden>{"".join(bytype)}</div><script>document.querySelectorAll("#deck-h ~ .tgs .tg").forEach(function(b){{b.addEventListener("click",function(){{var s=b.closest("section");s.querySelectorAll(".tgs .tg").forEach(function(x){{x.setAttribute("aria-pressed",x===b?"true":"false");}});s.querySelectorAll(".deckm").forEach(function(v){{v.hidden=v.dataset.view!==b.dataset.i;}});s.querySelectorAll("p.note[data-for]").forEach(function(v){{v.hidden=v.dataset.for!==b.dataset.i;}});var h=document.getElementById("deck-h");if(h)h.textContent=b.dataset.i==="0"?"Built by role":"Built by card type";}});}});</script>
</section>""")

    # ---- open items
    if spec.get("open"):
        items = "".join(f'<li class="{"warn" if o.get("warn") else ""}"><b>{E(o["title"])}</b><span>{E(fill(o["text"]))}</span></li>'
                        for o in spec["open"])
        P.append(f"""<section aria-labelledby="gap-h">
  <div class="eyebrow">{E(spec.get("open_eyebrow", "Still open"))}</div>
  <h2 id="gap-h">{E(spec.get("open_heading", "What the checks flagged"))}</h2>
  <ul class="open">{items}</ul>
</section>""")

    foot = "".join(f"<div>{E(fill(x))}</div>" for x in spec["footer"])
    if unpriced:
        foot += f"<div>Unpriced, counted as $0: {E(', '.join(unpriced))}.</div>"
    P.append(f"<footer>\n  {foot}\n</footer></div>")

    # ---- card hover
    imgs = {}
    for n in cmdr + names:
        f = CARDS / f"{slug(n)}.jpg"
        if f.exists():
            imgs[n] = f"cards/{slug(n)}.jpg"
            if " // " in n:
                imgs[n.split(" // ")[0]] = imgs[n]
    keys = sorted(imgs, key=lambda k: (-len(k), k))
    rx = "(?<![A-Za-z0-9])(" + "|".join(re.escape(k).replace("/", "\\/") for k in keys) + ")(?![A-Za-z0-9])"
    js = (HERE / "cardpop.js").read_text().replace("__MAP__", json.dumps(imgs, sort_keys=True)).replace("__RE__", json.dumps(rx))
    P.append(f"""<div id="cardpop" hidden><img id="cardimg" alt=""></div>
<script>
{js}</script>
<script src="/prez-header.js" defer></script>
</body>
</html>
""")
    out = PREZ / "deckwright" / spec["out"]
    out.write_text("\n".join(P))
    missing = sorted(set(cmdr + names) - set(imgs))
    print(f"wrote {out} ({out.stat().st_size:,} bytes); images missing: {missing or 'none'}")
    return out


def self_check() -> None:
    assert slug("Ashnod's Altar") == "ashnod-s-altar"
    assert slug("Funeral Room // Awakening Hall") == "funeral-room-awakening-hall"
    assert round(100 * odds(16)) == 87 and round(100 * odds(3)) == 30      # Monday page's redundancy figures
    assert main_type("Artifact Creature — Construct") == "Creature"
    assert main_type("Legendary Creature — Elder Wizard // Legendary Creature — God") == "Creature"
    assert 'class="pip pg"' in pips("{1}{G}") and pips("") == ""
    print("self-check ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--self-check", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    g = sub.add_parser("gather")
    g.add_argument("deck_dir", type=Path)
    g.add_argument("--bracket", type=int, default=3)
    r = sub.add_parser("render")
    r.add_argument("deck_dir", type=Path)
    a = ap.parse_args()
    if a.self_check:
        self_check()
    elif a.cmd == "gather":
        gather(a.deck_dir, a.bracket)
    elif a.cmd == "render":
        render(a.deck_dir)
    else:
        ap.print_help()
        sys.exit(2)

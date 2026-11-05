# Deckwright deck pages

`deck_page.py` regenerates the deck page format first built by hand for
`deckwright/261101-scarab-god-monday.html` (header, key figures, architecture against
Deckwright's targets, curve and goldfish, redundancy, the 99 by role or card type, open
items, card-image hover).

Each deck lives in `decks/<yymmdd-name>/`:

| File | Who writes it | What it holds |
|---|---|---|
| `deck.txt` | export | `Commander` / `Deck` list |
| `spec.json` | a person | words, palette, figures, and the role each card is filed under |
| `inputs.json` | `gather` | Deckwright review and strength, card facts and prices from the card store |

```bash
# 1. measure (needs the deckwright repo and its data dir; downloads missing card images)
DECKWRIGHT_REPO=~/deckwright python3 scripts/deckwright/deck_page.py gather scripts/deckwright/decks/261105-leinore --bracket 2
# 2. render (no network; same inputs give the same bytes)
python3 scripts/deckwright/deck_page.py render scripts/deckwright/decks/261105-leinore
```

`render` refuses a spec whose roles name a card missing from the deck, or leave a
nonland card unfiled. Text fields take `{power}`, `{price}`, `{role:<name>}` and the
other keys built in `render()`.

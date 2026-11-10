---
title: Generated category listings with subcategories, sorting and filters
created: 2026-11-09
status: backlog
scope: navigation
impact: High
effort: Med
roi: Great
---

# Generated category listings with subcategories, sorting and filters

## Why

On 2026-11-09, 12 live pages (David's Echo1 billing executive summary among them) had no listing
card, because cards were hand-written and optional for single-page artifacts. Jaime asked for the
cards to always exist, and for subcategories and sorting so things are easier to find. Hand-written
cards fixed the first part. This item fixes the cause: listings that depend on someone remembering.

## Step 1 (done 2026-11-09)

- `scripts/nav_audit.py` fails when a page has no card. Deliberate exceptions live in
  `scripts/nav-unlisted.txt`.
- The publish-to-prez skill (v1.1.0) makes the card mandatory. It also requires three tags on every
  new page: `prez-date`, `prez-topic` and `prez-summary`.

## Step 2: back-fill the tags

Add the three meta tags to every existing listed page, taking the values from its current card. Where
the page and its card disagree, the page wins.

## Step 3: generate the listings

A script, `scripts/build_listings.py`, rebuilds the card list of each `<category>/index.html` from
the tags, between two marker comments, and leaves the rest of the page alone. The root counts come
from the same pass. The audit then becomes a check that the generated output is current.

## Step 4: subcategories, sorting and filters on the category page

- **Subcategories:** topic groups come from `prez-topic`. A two-level value (`Billing / Waystar`)
  nests a group inside another. Groups collapse.
- **Sorting:** newest first by default, with buttons for A-Z and by topic.
- **Filters:** topic chips beside the existing search box, plus a date range for long categories
  such as Echo1.
- Echo1 has 20+ pages and grows fastest, so it is the first category to try this on.

## Decided (Jaime, 2026-11-09)

- `drafts/` is a hidden working area for Jaime and Rowan: pushed and served behind a password so
  Jaime can view drafts in the browser, but never linked from any listing. Open item: give it its own
  password (`PREZ_PW_DRAFTS`) instead of the Echo1 one.
- `echo1` and `echo1-exec` stay separate categories, at least for now.

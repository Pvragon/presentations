# Pvragon Presentations

Branded HTML presentations, auto-deployed via Vercel.

**Live at:** [prez.pvragon.com](https://prez.pvragon.com)

## Structure

```
presentations/
├── index.html                    ← Category browser (root landing page)
├── echo1/
│   ├── index.html                ← Echo1 category page (topic groups + search)
│   ├── kickoff-company-intro.md  ← Source
│   ├── kickoff-company-intro.html← Rendered presentation
│   ├── ...
├── <new-category>/
│   ├── index.html                ← Category page (copy echo1/index.html as template)
│   ├── ...
└── README.md
```

## How to Add a Presentation to an Existing Category

1. Create a `.md` source file with slide content.
2. Generate the `.html` using the Pvragon branded HTML presentation template (see `team-lib/skills/brand-guidelines/pvragon/templates/html-presentation.html`).
3. Place both `.md` and `.html` files in the category folder (e.g., `echo1/`).
4. Add a `<li>` entry to the category's `index.html` inside the appropriate `<ul class="prez-grid">` within a topic group:

```html
<li>
    <a class="prez-card" href="your-filename.html" data-search="keywords for search filtering">
        <div class="prez-title">Presentation Title <i class="fa-solid fa-arrow-right arrow"></i></div>
        <div class="prez-desc">One-line description</div>
        <div class="prez-meta">Mon DD, YYYY</div>
    </a>
</li>
```

5. If this is a new topic within the category, add a new topic group above the `<li>`:

```html
<div class="topic-group" data-topic="your-topic-slug">
    <div class="topic-label">Topic Name</div>
    <ul class="prez-grid">
        <!-- presentation <li> entries go here -->
    </ul>
</div>
```

6. Update the presentation count in the root `index.html` category card (the `<span class="category-count">` element).
7. Push to `main` — Vercel auto-deploys.

## How to Add a New Category

1. Create a new folder (e.g., `pvragon-internal/`).
2. Copy `echo1/index.html` as a starting template. Update the breadcrumb, title, subtitle, and topic groups.
3. Add a `<li>` entry to the root `index.html` inside `<ul class="category-grid">`:

```html
<li>
    <a class="category-card" href="your-category/">
        <i class="fa-solid fa-icon-name category-icon"></i>
        <h3>Category Name <i class="fa-solid fa-arrow-right"></i></h3>
        <p class="category-desc">One-line description of this category</p>
        <span class="category-count"><i class="fa-solid fa-layer-group"></i> N presentations</span>
    </a>
</li>
```

4. Push to `main` — Vercel auto-deploys.

## Notes

- The `data-search` attribute on presentation cards adds hidden keywords for the search/filter bar. Include terms users might search for that aren't in the title or description.
- All HTML presentations are self-contained single files (embedded CSS, JS, base64 logos). No build step.
- The root `index.html` auto-fills columns based on screen width. Category pages use a two-column grid that collapses to single-column on mobile.
- Markdown source files are kept alongside HTML for version history and regeneration. Vercel serves the HTML files; markdown is ignored.

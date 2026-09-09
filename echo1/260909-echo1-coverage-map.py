#!/usr/bin/env python3
# ---
# coverage_map.py — inline-SVG "who covers what" matrix for the 2026-09-10 RideCare CEO brief.
# Application areas across the top, people down the side. Filled dot = builds and supports the area;
# outlined dot = directs, designs or tests it. Rows in the Required Downsizing group are drawn in the
# subtle grey. Two count rows at the bottom show hands-on people per area today and after the taper.
# Colours are the html-document template's tokens only (headingText, textMuted, textSubtle, textMain,
# bgCard, accentSecondary for the group rule). Edit the tables below, rebuild the page; never the HTML.
# ---
AREAS = ['Intake', 'Dispatch & Ops', 'Optimization', 'Fleet Management', 'Billing', 'Admin & Reporting', 'Customer Service']
# (name, group, builds[set of area indexes], directs/tests[set of area indexes])
ALL = set(range(7))
PEOPLE = [
    ('James Hereford',    'stays', set(),           ALL),
    ('Bradd Schofield',   'stays', set(),           ALL),
    ('Roman Naidenko',    'stays', {1, 3, 4},       set()),
    ('JP Casabianca',     'stays', {0, 1, 2, 5},    set()),
    ('Rafael Casabianca', 'stays', {2, 5},          set()),
    ('Saymond Montoya',   'stays', set(),           {0, 1, 6}),
    ('William Titus',     'drop',  {6},             {0, 5}),
    ('Alexander Pavelko', 'drop',  {5},             {0}),
    ('Victor Cheung',     'drop',  {0, 5},          {6}),
    ('Prameeth Kotian',   'drop',  set(),           {0, 3, 5, 6}),
]
TEAL, MUTED, SUBTLE, MAIN, CARD, ACCENT = '#86C1D6', '#DEEAEF', '#5E767D', '#F8FAFC', '#112328', '#E7511F'

def render():
    W, LEFT, TOP, RH, CW = 812, 150, 78, 40, (812 - 150 - 16) / 7
    rows = []
    y = TOP + 16
    out = []
    font = "font-family=\"'Noto Sans', system-ui, sans-serif\""
    def cx(i): return LEFT + CW * i + CW / 2
    # column headers, two lines where needed
    for i, a in enumerate(AREAS):
        parts = a.split(' & ') if ' & ' in a else a.split(' ')
        if len(parts) == 2 and ' & ' in a: parts = [parts[0] + ' &', parts[1]]
        if len(parts) == 1: out.append(f'<text x="{cx(i):.1f}" y="{TOP - 26}" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>{a}</text>')
        else:
            out.append(f'<text x="{cx(i):.1f}" y="{TOP - 40}" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>{parts[0]}</text>')
            out.append(f'<text x="{cx(i):.1f}" y="{TOP - 22}" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>{parts[1]}</text>')
    group = None
    for name, g, builds, directs in PEOPLE:
        if g != group:
            group = g
            label = 'STAYS' if g == 'stays' else 'REQUIRED DOWNSIZING'
            if g == 'drop':
                out.append(f'<line x1="16" y1="{y - 4}" x2="{W - 16}" y2="{y - 4}" stroke="{ACCENT}" stroke-width="1.5"/>')
                y += 10
            out.append(f'<text x="16" y="{y + 14}" fill="{TEAL}" font-size="13.5" font-weight="700" letter-spacing="1.6" {font}>{label}</text>')
            y += RH * 0.75
        col = TEAL if g == 'stays' else SUBTLE
        txt = MUTED if g == 'stays' else SUBTLE
        out.append(f'<text x="16" y="{y + 20}" fill="{txt}" font-size="15.5" {font}>{name}</text>')
        for i in range(7):
            if i in builds: out.append(f'<circle cx="{cx(i):.1f}" cy="{y + 15}" r="9" fill="{col}"/>')
            elif i in directs: out.append(f'<circle cx="{cx(i):.1f}" cy="{y + 15}" r="8" fill="none" stroke="{col}" stroke-width="2"/>')
        y += RH
    # count rows
    today = [sum(1 for _, g, b, _ in PEOPLE if i in b) for i in range(7)]
    after = [sum(1 for _, g, b, _ in PEOPLE if g == 'stays' and i in b) for i in range(7)]
    out.append(f'<line x1="16" y1="{y + 2}" x2="{W - 16}" y2="{y + 2}" stroke="{SUBTLE}" stroke-width="1"/>')
    y += 12
    for label, vals in (('Hands-on today', today), ('Hands-on after taper', after)):
        out.append(f'<text x="16" y="{y + 20}" fill="{MAIN}" font-size="15.5" font-weight="700" {font}>{label}</text>')
        for i, v in enumerate(vals):
            out.append(f'<text x="{cx(i):.1f}" y="{y + 20}" text-anchor="middle" fill="{MAIN}" font-size="16" font-weight="700" {font}>{v}</text>')
        y += RH
    # legend
    y += 14
    out.append(f'<circle cx="26" cy="{y}" r="8" fill="{TEAL}"/><text x="42" y="{y + 5}" fill="{MUTED}" font-size="14" {font}>builds and supports the area</text>')
    out.append(f'<circle cx="290" cy="{y}" r="7" fill="none" stroke="{TEAL}" stroke-width="2"/><text x="306" y="{y + 5}" fill="{MUTED}" font-size="14" {font}>directs, designs or tests it</text>')
    out.append(f'<circle cx="540" cy="{y}" r="8" fill="{SUBTLE}"/><text x="556" y="{y + 5}" fill="{MUTED}" font-size="14" {font}>required downsizing</text>')
    H = y + 26
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H:.0f}" width="100%" role="img" '
           f'aria-label="Who covers which area of the application, today and after the taper" style="display:block;max-width:100%;height:auto">'
           f'<rect x="0" y="0" width="{W}" height="{H:.0f}" rx="14" fill="{CARD}"/>' + ''.join(out) + '</svg>')
    return svg

if __name__ == '__main__':
    print(render())

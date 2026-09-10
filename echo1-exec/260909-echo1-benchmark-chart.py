#!/usr/bin/env python3
# ---
# benchmark_chart.py — inline-SVG range chart for the CEO brief: hybrid-agency price per person (P10–P90 band,
# P50 tick) with RideCare's current figure marked. Figures come from the staffing benchmark
# (my-lib/runtime/deliverables/260901-echo1-staffing-benchmark.md §6.7 and 260909-hybrid-price-per-head-percentiles.py).
# Colours are html-document template tokens only. Edit FIGURES, rebuild the page; never the HTML.
# ---
FIGURES = {'p10': 12400, 'p50': 13900, 'p90': 15600, 'ridecare': 11062}
TEAL, MUTED, SUBTLE, MAIN, CARD, ACCENT, PRIMARY = '#86C1D6', '#DEEAEF', '#5E767D', '#F8FAFC', '#112328', '#E7511F', '#1E4958'

def render():
    W, H, L, R = 812, 170, 60, 772
    lo, hi = 10000, 17000
    x = lambda v: L + (R - L) * (v - lo) / (hi - lo)
    font = "font-family=\"'Noto Sans', system-ui, sans-serif\""
    f = FIGURES; o = []
    o.append(f'<rect x="0" y="0" width="{W}" height="{H}" rx="14" fill="{CARD}"/>')
    # axis with $k ticks
    o.append(f'<line x1="{L}" y1="118" x2="{R}" y2="118" stroke="{SUBTLE}" stroke-width="1"/>')
    for v in range(10000, 17001, 1000):
        o.append(f'<line x1="{x(v):.1f}" y1="118" x2="{x(v):.1f}" y2="124" stroke="{SUBTLE}" stroke-width="1"/>')
        o.append(f'<text x="{x(v):.1f}" y="142" text-anchor="middle" fill="{SUBTLE}" font-size="12.5" {font}>${v // 1000}k</text>')
    # hybrid agency band P10–P90 with P50 tick
    o.append(f'<rect x="{x(f["p10"]):.1f}" y="70" width="{x(f["p90"]) - x(f["p10"]):.1f}" height="28" rx="6" fill="{PRIMARY}"/>')
    o.append(f'<rect x="{x(f["p10"]):.1f}" y="70" width="{x(f["p90"]) - x(f["p10"]):.1f}" height="28" rx="6" fill="none" stroke="{TEAL}" stroke-width="1.5"/>')
    o.append(f'<line x1="{x(f["p50"]):.1f}" y1="64" x2="{x(f["p50"]):.1f}" y2="98" stroke="{TEAL}" stroke-width="3"/>')
    o.append(f'<text x="{x(f["p10"]):.1f}" y="58" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>Low ${f["p10"] / 1000:.1f}k</text>')
    o.append(f'<text x="{x(f["p50"]):.1f}" y="40" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>Typical ${f["p50"] / 1000:.1f}k</text>')
    o.append(f'<text x="{x(f["p90"]):.1f}" y="58" text-anchor="middle" fill="{TEAL}" font-size="13" font-weight="700" {font}>High ${f["p90"] / 1000:.1f}k</text>')
    o.append(f'<text x="{(x(f["p10"]) + x(f["p90"])) / 2:.1f}" y="112" text-anchor="middle" fill="{MUTED}" font-size="12.5" {font}>hybrid agency, same ten seats</text>')
    # RideCare marker
    rx = x(f['ridecare'])
    o.append(f'<line x1="{rx:.1f}" y1="30" x2="{rx:.1f}" y2="118" stroke="{ACCENT}" stroke-width="3"/>')
    o.append(f'<text x="{rx:.1f}" y="22" text-anchor="middle" fill="{TEAL}" font-size="14" font-weight="700" {font}>RideCare today ${f["ridecare"] / 1000:.1f}k</text>')
    o.append(f'<text x="{L}" y="162" fill="{SUBTLE}" font-size="12" {font}>Monthly price per person, ten-person team</text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" role="img" '
            f'aria-label="RideCare pays {f["ridecare"] / 1000:.1f}k per person a month; a hybrid agency would charge {f["p10"] / 1000:.1f}k to {f["p90"] / 1000:.1f}k" '
            f'style="display:block;max-width:100%;height:auto">' + ''.join(o) + '</svg>')

if __name__ == '__main__':
    print(render())

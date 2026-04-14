# Design System — Awaken

## Product Context
- **What this is:** A mobile-first web app that sends 6 daily psychological interrupt notifications, prompting users to confront autopilot behavior in real-time.
- **Who it's for:** 20-30 test users in Phase 0; adults experiencing existential dissatisfaction who want a mirror, not a coach.
- **Space/industry:** Self-awareness / psychological tools. Not wellness, not mindfulness, not productivity. Closest reference: @instance_11 / Second Nature (@secondnature.inc).
- **Project type:** PWA (mobile-first web app)

## Aesthetic Direction
- **Direction:** Grimoire / Scholarly Manuscript
- **Decoration level:** Intentional — ornamental symbols and dividers serve as structural punctuation, not decoration for its own sake.
- **Mood:** A private grimoire of self-examination. Scholarly weight. The gravity of a document that takes the reader seriously. The feeling of writing in a book that matters — not tapping into an app that gamifies your attention.
- **Reference:** @instance_11 / Second Nature — heavy serif, paper grain, illuminated drop caps, typographic ornaments, dense text, square corners, monochrome palette.

### What this is NOT
```
TYPICAL APP:                        AWAKEN:
──────────────                      ──────────
Gradient backgrounds                Cool gray parchment with visible grain
Rounded cards with shadows          Ruled pages, 2px ink borders, square corners
Sans-serif everything               Heavy serif body, monospace metadata
Colorful icons                      Black geometric ornaments (cross/diamond motifs)
"Great job!" celebrations           Silence. The response is recorded. That's it.
Bouncy animations                   Slow, deliberate 400ms fades
Confetti, particles, emoji          Never. Not in any phase.
```

## Typography

### Typefaces
- **Body/Display:** Cormorant Garamond — a high-contrast Garamond with true optical sizes. Carries scholarly weight without pretension.
- **Small Caps/Labels:** Cormorant SC — the small caps companion. Used for section markers (§1), button labels, and any text that needs that typeset/printed quality.
- **Monospace/Metadata:** JetBrains Mono — timestamps, timezone info, slot indicators. The technical voice of the system.

### Font Loading
Load from Google Fonts with ALL required weights. This is critical — missing weights cause synthetic bold, which looks muddy.

```
Cormorant Garamond: 400, 500, 600, 700 (regular + italic 400)
Cormorant SC: 400, 600, 700
JetBrains Mono: 400, 500, 600
```

URL:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap
```

### Font Stacks
```css
--font-body:    'Cormorant Garamond', 'Georgia', serif;
--font-display: 'Cormorant SC', 'Georgia', serif;
--font-mono:    'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
```

### Type Scale (modular, ratio ~1.25)
```css
--text-xs:   0.7rem;    /* 11.2px — timestamps, fine metadata */
--text-sm:   0.875rem;  /* 14px   — secondary mono, labels */
--text-base: 1.1rem;    /* 17.6px — body text, prompts, responses */
--text-lg:   1.375rem;  /* 22px   — emphasized body, prompt questions */
--text-xl:   1.7rem;    /* 27.2px — page titles */
--text-2xl:  2.125rem;  /* 34px   — section markers (§1) */
--text-hero: 3.5rem;    /* 56px   — reserved for Phase 1 streak number */
```

### Weight Usage
| Context | Weight | Why |
|---------|--------|-----|
| Body text, responses, prompts | 600 (semibold) | Matches the heavy, dense feel of the reference. Regular (400) is too thin for this aesthetic. |
| Section markers §N, page headings | 700 (bold) | Anchors the page. Must be true 700, not synthetic. |
| Monospace metadata | 600 (semibold) | Matches body weight for visual consistency on parchment background. |
| Placeholders, faint labels | 400 (regular) | Deliberately lighter to recede. |
| Button labels (Cormorant SC) | 700 (bold) | Small caps + bold = typeset stamp quality. |

### Line Height
- Body: 1.65 — tighter than typical (1.5-1.7 range). Dense manuscript feel.
- Headers: 1.2
- Mono: 1.5

### Letter Spacing
- Small caps (Cormorant SC): 0.2–0.25em
- Monospace metadata: 0.05–0.06em
- Body: normal (0)

## Color

### Approach: Monochrome — restrained to the point of austerity.

Color is earned in this design. The only non-grayscale color is ember, and it appears in Phase 1 only (streak number, active state). Phase 0 is fully monochrome.

### Palette
```css
--parchment:       #C9C4BA;   /* Cool gray, aged paper — the page surface */
--parchment-dark:  #B8B3A8;   /* Slightly darker — borders, recessed areas */
--parchment-light: #D4CFC6;   /* Slightly lighter — input backgrounds, inset areas */
--ink:             #0A0A0A;   /* Near-black — primary text, borders, ornaments */
--ink-light:       #1E1E1E;   /* Dark gray — secondary text */
--ink-faint:       #4A4A45;   /* Medium gray — timestamps, metadata, placeholders */
--ember:           #5C1508;   /* Deep burnt red — Phase 1 only: streak number, active states */
```

### Rules
- If you reach for a color not in this list, stop. Monochrome is the constraint that makes this work.
- `--ember` is NEVER used for: buttons, backgrounds, decorative elements, borders.
- `--ember` is ONLY used for: streak number (Phase 1), active state indicators (Phase 1).
- Phase 0 uses NO ember. Zero color. Fully monochrome.

### Theme Color (PWA/browser)
```html
<meta name="theme-color" content="#C9C4BA" />
```
Must match `--parchment`. Updated whenever the parchment value changes.

## Spacing

### Base Unit: 4px
### Density: Comfortable-to-dense — manuscript pages are full, not airy.

```css
--space-line:      8px;    /* 2 units — tight: between metadata and content */
--space-paragraph: 20px;   /* 5 units — between paragraphs, form elements */
--space-page:      28px;   /* 7 units — left/right page margins */
--space-section:   40px;   /* 10 units — between major sections */
```

### Page Margins
- Mobile: 28px horizontal padding
- Content max-width: 480px, centered
- Page feels contained — like a physical page, not an infinite scroll

## Layout

### Approach: Single-column manuscript
Every screen is a **page**, not a card. The app feels like turning pages in a personal grimoire.

### Page Structure
```
┌─────────────────────────────────┐
│ §N                    [ornament]│  ← page header
│                                 │
│   [content]                     │  ← body fills the page densely
│   text never touches edges      │
│   28px margins                  │
│                                 │
│  ·◇·─ ◆ ─·◇·  ·◇·─ ◆ ─·◇·   │  ← footer ornaments
└─────────────────────────────────┘
```

### Page Frame
Content container has a max-width of 480px, centered. The parchment background extends full-width, but the text column is contained — this creates the "page" feel without needing an explicit border.

### Corners
`border-radius: 0` on everything. No exceptions. Square corners are a core design constraint.

## Ornamental System

### Section Markers
Format: Roman numerals with period — `I.`, `II.`, `III.`, etc. for interrupt slots (1–6). Page identifiers use letters with period (`O.` for origin/landing, `H.` for history).
- Font: Cormorant SC, weight 700, size `--text-2xl`
- Positioned top-left of page
- Paired with either a page number (top-right) or a cross ornament (top-right)
- **Why not §?** The section sign (§) caused user confusion — most people outside legal/academic contexts don't recognize it. Roman numerals carry the same scholarly weight while being universally readable.

### Cross/Diamond Ornaments
The primary decorative motif. Based on the @instance_11 reference: compass-rose shapes with cardinal dots, axis lines, center diamond, and diagonal accent dots.

**Key principle:** Ornaments should feel hand-cut, not computer-generated. This means:
- Slightly heavier fills on diamonds vs circles
- Varying stroke weights (axis lines: 1.2-1.3px, not uniform)
- The overall shape should feel typeset, like a printer's ornament, not a geometric diagram

### Divider Variants
| Variant | Usage | Description |
|---------|-------|-------------|
| `simple` | Between responses in history | Solid line + center dot |
| `medium` | Between sections, after submit | Dashed lines + small crosses + diamond |
| `dashed` | Lightweight breaks within content | Dashed `<hr>` rule |
| `footer` | Bottom of every page | Full-width row: dot-chains + cross ornaments |

### Drop Caps
- First letter of major paragraphs floats left
- **Dark block style:** letter in `--parchment-light` on `--ink` background
- Sized to roughly 3 lines of body text (font-size: ~4em)
- Font: Cormorant Garamond, weight 700
- Used on: landing intro text, onboard description, prompt text, history empty state, post-submit message. NOT on every paragraph — only the first/primary one per page.

## Motion

### Approach: Minimal-functional
Only transitions that aid comprehension. Nothing celebratory, bouncy, or attention-seeking.

```
Page transitions:     fade 0→1 over 400ms, ease-in-out
Button hover:         background/color swap, 120ms ease
Focus states:         box-shadow appears, no transition (instant)
```

### What NEVER exists
Confetti, particle effects, bouncing, elastic animations, slide-up modals, loading spinners, toast notifications, haptic celebrations, sound effects, emoji anywhere in UI.

## Input Styles

### Text Inputs & Textareas
- Background: `--parchment-light` (slightly lighter than page — reads as inset)
- Border: 2px solid `--ink`
- No border-radius (square corners)
- Font: inherits body (Cormorant Garamond, weight 600)
- Focus: `box-shadow: 3px 3px 0 var(--ink)` — a typographic "stamp" effect, no outline

### Buttons
- Background: `--ink`
- Text: `--parchment-light`, Cormorant SC, weight 700, letter-spacing 0.25em, uppercase
- Border: 2px solid `--ink`
- Hover: inverts to transparent background, `--ink` text
- No border-radius
- Full-width on mobile for primary actions

## Paper Grain Texture

Two layered SVG noise filters on `body::before` and `body::after`:
1. **Primary grain:** fractalNoise, baseFrequency 0.75, 5 octaves, opacity 0.12
2. **Secondary grain:** turbulence, baseFrequency 1.5, 3 octaves, opacity 0.04

Both are `position: fixed`, `pointer-events: none`, high z-index. The double layer creates depth — the primary gives overall grain, the secondary adds fine speckle.

The texture should be **visible** — not subtle. It's a key part of the aged paper feel. If you can't see the grain on a retina display, increase opacity.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-16 | Grimoire/manuscript aesthetic | Content asks users to confront uncomfortable truths. Design must match that gravity. Duolingo-style gamification would trivialize the experience. |
| 2026-03-16 | Cormorant Garamond + JetBrains Mono | Scholarly serif for body, technical mono for system voice. High-contrast pairing that mirrors the reference. |
| 2026-03-17 | Cool gray parchment (#C9C4BA) | Warmer yellows read as "vintage filter." Cool gray reads as actual aged paper (newsprint). Matches reference images. |
| 2026-03-17 | Drop caps: dark block style | Simple enlarged letter looked too clean/digital. Dark background block with light letter matches illuminated manuscript tradition. |
| 2026-03-17 | Double-layer paper grain | Single noise layer was too subtle on retina. Two layers at different frequencies create convincing paper depth. |
| 2026-03-19 | Font loading: must include weight 700 | Synthetic bold (browser-faked) was making text look muddy. Loading true 700 weight is critical for the heavy serif to render correctly. |
| 2026-03-19 | Section markers use Cormorant SC | Regular weight Cormorant Garamond for §N lacked the scholarly/typeset quality. SC (small caps) variant at 700 weight matches the reference's printed feel. |
| 2026-03-19 | Type scale ratio ~1.25 | Previous scale had inconsistent jumps (17% then 29%). Regularized to ~1.25 ratio for proportional steps. |
| 2026-03-30 | § → Roman numerals (I–VI) | User feedback: people didn't recognize the section sign (§). Roman numerals preserve scholarly weight while being universally legible. |
| 2026-03-30 | Fixed schedule (no time pickers) | Phase 0 friction reduction: 6 time pickers added unnecessary friction. Default times are fine. Schedule saved as read-only display. |
| 2026-03-30 | Removed PWA install prompt | The "Add to Home Screen" instruction wall blocked onboarding flow. Removed entirely to reduce friction. |
| 2026-03-30 | Mono weight synced to 600 | DESIGN.md said 500, CSS shipped 600. Aligned doc to match what actually looks right on the parchment background. |

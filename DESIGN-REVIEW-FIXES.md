# Design Review Fixes — Awaken Phase 0

*Review date: 2026-03-19*
*Reviewed against: DESIGN.md, reference images (@instance_11), all 4 pages + 3 components*

Overall score: **6/10 → target 9/10 after these fixes**

The aesthetic direction is strong and distinctive. The gaps are in interaction states, accessibility, the notification-to-response emotional arc, and several missing UX details that real users will hit immediately.

---

## Pass 1: Information Architecture (5/10)

### 1.1 No navigation between pages

Once a user is on `/history`, there's no way to get to `/onboard` to change their schedule. Once on `/respond`, there's no way back to `/history`. The only navigation is auth redirects and the browser back button.

**Fix:** Add a minimal persistent nav element — not a navbar (too app-like for the grimoire aesthetic), but a subtle link structure.

```
IMPLEMENTATION:
- History page: add "§ edit schedule" link at top, below SectionMarker
  Style: mono-meta class, right-aligned
  Links to: /onboard

- Respond page (submitted state): add "§ history" link below the confirmation
  Style: mono-meta class, centered
  Links to: /history

- Onboard page: add "§ history" link at top if user already has a profile
  Style: mono-meta class, right-aligned
  Links to: /history
```

### 1.2 Respond page has no context about WHEN this interrupt was scheduled

The user taps a notification at 3:15 PM and sees a prompt, but nothing tells them "this is your 3:15 PM interrupt." The `interrupt 3 of 6` at the bottom is too subtle and uses slot number, not time.

**Fix:** Add the scheduled time prominently above the prompt.

```
IMPLEMENTATION in Respond.tsx:
- Above PromptCard, add:
  <p class="mono-meta" style="margin-bottom: var(--space-paragraph)">
    {formatTime(slot)} · interrupt {slot} of 6
  </p>

- Where formatTime maps slot → default time:
  1→"11:00 AM", 2→"1:30 PM", 3→"3:15 PM", 4→"5:00 PM", 5→"7:30 PM", 6→"9:00 PM"

- Remove the duplicate "interrupt N of 6" from the bottom
```

---

## Pass 2: Interaction State Coverage (3/10)

This is the biggest gap. Most states render nothing or crash silently.

### State Table — What Exists vs What's Needed

```
PAGE/FEATURE       | LOADING         | EMPTY           | ERROR           | SUCCESS         | PARTIAL
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
Landing: send OTP  | "Sending..."    | n/a             | Shows error msg | "Check email"   | n/a
                   | ✅ OK           |                 | ⚠️ No recovery  | ✅ OK           |
                   |                 |                 | action          |                 |
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
Onboard: save      | "Saving..."     | n/a             | ❌ SILENT FAIL  | Navigates away  | n/a
                   | ✅ OK           |                 | No error shown  | ⚠️ No confirm  |
                   |                 |                 | if upsert fails |                 |
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
Onboard: push      | ❌ NO STATE     | n/a             | ❌ SILENT FAIL  | "notifications  | ❌ Permission
permission         | Button stays    |                 | If user denies, | enabled."       | denied state
                   | enabled during  |                 | nothing happens | ✅ OK           | missing
                   | async request   |                 |                 |                 |
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
Respond: submit    | "Submitting..." | n/a             | Shows error msg | Drop cap conf.  | ❌ Already
                   | ✅ OK           |                 | ✅ OK           | ✅ OK           | answered state
                   |                 |                 |                 |                 | missing
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
Respond: draft     | n/a             | n/a             | n/a             | n/a             | ⚠️ No visible
restore            |                 |                 |                 |                 | "draft restored"
                   |                 |                 |                 |                 | indicator
-------------------|-----------------|-----------------|-----------------|-----------------|------------------
History: fetch     | ❌ returns null | Drop cap text   | ❌ SILENT FAIL  | Shows responses | n/a
                   | (blank screen)  | ✅ Good copy    | Blank screen if | ✅ OK           |
                   |                 |                 | query fails     |                 |
```

### Fixes Required

**2.1 — History loading state** (currently `return null` — blank screen)
```
IMPLEMENTATION in History.tsx:
Replace: if (loading) return null
With: if (loading) return (
  <div class="page" style="max-width: 480px; margin: 0 auto">
    <SectionMarker label="H" pageNum={1} />
    <Divider variant="medium" />
    <p class="mono-meta" style="text-align: center">
      loading reflections...
    </p>
  </div>
)
```

**2.2 — History fetch error state** (currently swallowed)
```
IMPLEMENTATION in History.tsx:
- Add error state: const [error, setError] = useState(false)
- In fetchResponses catch: setError(true); setLoading(false)
- Render when error:
  <p class="drop-cap">
    Unable to load your reflections. Check your connection and refresh.
  </p>
```

**2.3 — Onboard save error** (currently silent)
```
IMPLEMENTATION in Onboard.tsx:
- Add: const [error, setError] = useState('')
- Wrap upsert in try/catch or check returned error
- On fail: setError('Unable to save. Check your connection and try again.')
- Render error in --ember below the Begin button
```

**2.4 — Onboard push permission denied** (currently nothing happens)
```
IMPLEMENTATION in Onboard.tsx:
- Add: const [pushDenied, setPushDenied] = useState(false)
- In requestPush, if subscription is null after request: setPushDenied(true)
- Render when denied:
  <p class="mono-meta" style="text-align: center; margin-bottom: var(--space-section)">
    notifications blocked. you can enable them later in your browser settings.
  </p>
- Change "Begin" button to remain enabled — user can proceed without push
```

**2.5 — Respond: draft restored indicator**
```
IMPLEMENTATION in Respond.tsx:
- If initialDraft is non-empty on mount, show:
  <p class="mono-meta" style="margin-bottom: var(--space-line)">
    draft restored from earlier.
  </p>
- Place above the textarea in PromptCard
```

**2.6 — Respond: already answered today** (nice to have, not critical)
```
DEFER TO PHASE 1 — requires querying responses table for today's slot.
For now, user can re-answer the same slot. Duplicate responses are harmless.
```

**2.7 — Landing: error recovery action**
```
IMPLEMENTATION in Landing.tsx:
- When error is shown, also show a "Try again" link/button below the error
  that clears the error and refocuses the email input.
- Style: mono-meta, underline, not a full button.
```

---

## Pass 3: User Journey & Emotional Arc (5/10)

### The Critical 30 Seconds: Notification → Response

This is the moment that decides retention. The user is in the middle of their day, autopiloting. Their phone buzzes. They tap the notification. What happens next determines if they answer or close the tab.

**Current flow:**
```
Notification → page loads → §3 header → drop cap prompt → textarea → submit
```

**Problem:** The transition from "interrupted daily life" to "deep self-confrontation" is too abrupt. The user goes from scrolling Instagram to "What am I avoiding by doing what I'm doing?" with zero transition. That's jarring, not in a productive way — in a "I'll do this later" way.

**Fix: Add a breath of intentional space**
```
IMPLEMENTATION in Respond.tsx:
- Before PromptCard, add a 1-second delayed fade-in for the prompt.
  NOT a loading spinner — a deliberate pause.

  The page loads showing:
    §3 header
    Divider medium
    "3:15 PM · interrupt 3 of 6" in mono-meta

  Then after 800ms, the prompt fades in (the same fadeIn animation, 400ms).

  This creates a moment of stillness between "busy life" and "confrontation."
  It says: "slow down. this is different from what you were just doing."

IMPLEMENTATION:
- Add state: const [showPrompt, setShowPrompt] = useState(false)
- useEffect(() => { const t = setTimeout(() => setShowPrompt(true), 800); return () => clearTimeout(t) }, [])
- Wrap PromptCard in: {showPrompt && <div style="animation: fadeIn 400ms ease-in-out"> ... </div>}
```

### Post-Submit Arc

**Current:** "Response recorded. The act of writing it down..."

**Problem:** This is good copy, but the user has nowhere to go. They stare at a dead end. There's no "close" action that feels intentional.

**Fix:**
```
IMPLEMENTATION in Respond.tsx submitted state:
- After the confirmation text and divider, add:
  <Link to="/history" class="mono-meta" style="display: block; text-align: center; margin-top: var(--space-paragraph)">
    § view your reflections
  </Link>
- This gives the user an intentional exit that reinforces the value of what they just did.
```

---

## Pass 4: AI Slop Risk (8/10)

The grimoire aesthetic is genuinely distinctive. This is not generic. Two small flags:

### 4.1 The landing page intro text feels written-by-AI

"You are just today's face of The Change. That incontrovertible, irreconcilable Change." — This is borrowed from the @instance_11 reference. That's fine as placeholder, but for production your cofounder should write original copy that matches the product's actual voice.

**Fix:** Mark as TODO — copy should be written by a human who understands the brand voice. Current text is placeholder from reference material.

### 4.2 The "Response recorded" confirmation is generic

"The act of writing it down is the act of seeing. What you cannot name, you cannot change." — Good, but every confirmation says the same thing regardless of which prompt they answered.

**Fix (Phase 1):** Vary confirmation text by slot. For now, the single message is fine.

---

## Pass 5: Design System Alignment (7/10)

### 5.1 Inline styles vs CSS classes

Every page uses extensive inline `style={{}}` objects instead of CSS classes. This means:
- Styles aren't reusable
- They're harder to audit against DESIGN.md
- If a design token changes, you update 40 inline styles instead of 1 class

**Fix:** Extract repeated patterns into CSS classes in `components.css`.

```
CLASSES TO ADD in components.css:

.page-body        — max-width: 480px; margin: 0 auto (used on every page)
.text-body        — font-family/size/weight/line-height for body paragraphs
.text-heading     — font-family/size/weight for h1-h2 level
.text-label       — mono-meta but for form labels
.error-text       — color: var(--ember); font-size: var(--text-sm); font-weight: 700
.nav-link         — mono-meta styled as subtle navigation link
```

This is a refactor, not a visual change. Can be done in a separate pass.

### 5.2 Placeholder weight doesn't match DESIGN.md

DESIGN.md says placeholders should be `font-weight: 400` (deliberately lighter to recede). Current CSS has `font-weight: 500`.

**Fix in globals.css:**
```css
::placeholder {
  font-weight: 400;  /* was 500 */
}
```

---

## Pass 6: Responsive & Accessibility (2/10)

This is the weakest area. Almost nothing is specified.

### 6.1 Focus states are invisible

The current focus style is `box-shadow: 3px 3px 0 var(--ink)` on inputs only. Buttons, links, and interactive elements have **no visible focus indicator**. A keyboard user cannot tell what's selected.

**Fix in globals.css:**
```css
/* Visible focus for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

/* Remove for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Input focus keeps box-shadow instead */
input:focus-visible,
textarea:focus-visible {
  outline: none;
  box-shadow: 3px 3px 0 var(--ink);
}
```

### 6.2 No ARIA landmarks

None of the pages use semantic HTML landmarks. Screen readers see a flat `<div>` soup.

**Fix per page:**
```
- Wrap each page content in <main> instead of <div class="page">
  Or add role="main" to the page div.

- Landing form: add aria-label="Sign in with magic link"
- Onboard: add aria-label="Set interrupt schedule" on the form area
- Respond: add aria-label="Respond to interrupt" on the form
- History: add aria-label="Response history" on the list container
```

### 6.3 Touch targets too small

The time picker inputs on Onboard and the mock-nav links on History have no minimum touch target size. On mobile, these are hard to tap.

**Fix:**
```css
/* Minimum touch target */
input[type="time"] {
  min-height: 44px;
  min-width: 44px;
}

.mock-nav a {
  display: inline-block;
  min-height: 44px;
  line-height: 44px;
  padding: 0 8px;
}
```

### 6.4 Contrast audit

Against `--parchment: #C9C4BA`:
- `--ink: #0A0A0A` → contrast ratio ~10.5:1 ✅ AAA
- `--ink-light: #1E1E1E` → contrast ratio ~9.2:1 ✅ AAA
- `--ink-faint: #555550` → contrast ratio ~3.9:1 ⚠️ **FAILS AA for small text** (needs 4.5:1)

**Fix:** Darken `--ink-faint` from `#555550` to `#4A4A45`.
```
#4A4A45 on #C9C4BA = ~4.6:1 → passes AA for normal text.
```

Update in both globals.css AND DESIGN.md.

### 6.5 No responsive breakpoints

The app is 480px max-width on all viewports. On a wide desktop monitor, the content floats in a narrow column with nothing else. This is fine for Phase 0 (mobile-first, testers are on phones), but should be noted as a known limitation.

**No fix needed for Phase 0.** Add to TODOS for Phase 1: tablet/desktop layout with wider reading column and potential two-column history view.

### 6.6 Button disabled state needs aria

Disabled buttons should communicate their state to screen readers.

**Fix:**
```
In PromptCard.tsx and all pages with disabled buttons:
- Add aria-disabled="true" when disabled (already handled by HTML disabled attr)
- Add aria-busy="true" when in loading/submitting state
```

---

## Pass 7: Unresolved Design Decisions

```
DECISION NEEDED                           | IF DEFERRED, WHAT HAPPENS
------------------------------------------|--------------------------------------------
What happens when user taps notification  | Undefined behavior — might open blank
but is signed out?                        | page, might redirect to landing with
                                          | no context that they had a notification.
                                          | FIX: Landing should detect ?slot=N param,
                                          | show "sign in to answer your interrupt",
                                          | then redirect to /respond?slot=N after auth.
------------------------------------------|--------------------------------------------
Can user re-answer the same slot twice    | Currently yes — inserts duplicate. Harmless
in one day?                               | but confusing in history view.
                                          | DEFER: acceptable for Phase 0.
------------------------------------------|--------------------------------------------
What if user changes timezone after       | Schedule stays in old timezone until they
setting schedule?                         | revisit /onboard. Notifications fire at
                                          | wrong times.
                                          | DEFER: acceptable for 30 known testers.
```

---

## Implementation Priority

### Must Fix (before shipping to testers)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 1 | History loading state (blank screen → "loading...") | History.tsx | S |
| 2 | Focus states for keyboard nav | globals.css | S |
| 3 | Contrast: darken --ink-faint to #4A4A45 | globals.css, DESIGN.md | S |
| 4 | Onboard save error handling | Onboard.tsx | S |
| 5 | Onboard push permission denied state | Onboard.tsx | S |
| 6 | Landing error recovery action | Landing.tsx | S |
| 7 | Placeholder font-weight: 400 | globals.css | S |
| 8 | Navigation links between pages | History.tsx, Respond.tsx, Onboard.tsx | S |

### Should Fix (improves experience significantly)

| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 9 | Respond: delayed prompt fade-in (800ms pause) | Respond.tsx | S |
| 10 | Respond: scheduled time above prompt | Respond.tsx | S |
| 11 | Respond: "view your reflections" link post-submit | Respond.tsx | S |
| 12 | Respond: "draft restored" indicator | PromptCard.tsx | S |
| 13 | History fetch error state | History.tsx | S |
| 14 | ARIA landmarks on all pages | All pages | S |
| 15 | Touch target minimums | components.css | S |

### Defer to Phase 1

| # | Fix | Why defer |
|---|-----|----------|
| 16 | Extract inline styles to CSS classes | Refactor, not user-facing |
| 17 | Vary confirmation text by slot | Nice-to-have |
| 18 | "Already answered" state on Respond | Requires DB query |
| 19 | Desktop/tablet responsive layout | Phase 0 is mobile-only |
| 20 | Original brand copy for landing | Needs human copywriter |
| 21 | Signed-out notification redirect | Requires auth flow changes |

---

## Completion Summary

```
+====================================================================+
|         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
+====================================================================+
| DESIGN.md status   | Exists, comprehensive                        |
| Initial rating     | 6/10                                         |
| Pass 1 (Info Arch) | 5/10 → 8/10 with nav links + time context    |
| Pass 2 (States)    | 3/10 → 8/10 with 7 state fixes               |
| Pass 3 (Journey)   | 5/10 → 8/10 with delayed fade + post-submit  |
| Pass 4 (AI Slop)   | 8/10 → 8/10 (grimoire is genuine, copy TBD)  |
| Pass 5 (Design Sys)| 7/10 → 9/10 with placeholder fix + class note|
| Pass 6 (A11y)      | 2/10 → 7/10 with focus/contrast/ARIA/touch   |
| Pass 7 (Decisions) | 3 surfaced, 1 fix, 2 deferred                |
+--------------------------------------------------------------------+
| Must Fix           | 8 items (all size S)                          |
| Should Fix         | 7 items (all size S)                          |
| Deferred           | 6 items (Phase 1)                             |
| Overall target     | 6/10 → 9/10                                   |
+====================================================================+
```

All 15 "Must Fix" + "Should Fix" items are size S. An experienced implementer can knock out all of them in one focused session.

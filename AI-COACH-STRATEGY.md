# AI Coach Strategy — Why Not Phase 0, and What It Should Be

*Created: 2026-03-17*

---

## Your cofounder is right about the WHAT but wrong about the WHEN.

### The Insight

After 7 days of raw self-confrontation, users will have written 20-40 honest responses about their avoidance patterns, identity defenses, and uncomfortable truths. That's an **incredibly rich dataset** — richer than anything a therapist gets in a first session, because the user was alone and unperformed when they wrote it.

An AI that synthesizes that into "here's the pattern I see in your week" would be genuinely powerful. Not motivational fluff — actual pattern recognition across their responses.

### Why NOT in Phase 0

Phase 0 exists to answer ONE question: **do timed psychological interrupts retain users?**

```
WHAT YOU'RE VALIDATING:              WHAT AI COACH VALIDATES:
────────────────────────             ───────────────────────
"Do people answer prompts            "Do people value AI
 when interrupted 6x/day?"           synthesis of their answers?"

These are DIFFERENT hypotheses.
Testing both at once = you learn nothing.
```

If Phase 0 retention is < 20%, the AI coach won't save it — the core mechanic is broken. If retention is ≥ 50%, you don't know if it's the interrupts or the AI that's working. **Clean signal requires isolated variables.**

### Where it SHOULD live

```
PHASE 0 (now):     Raw interrupts only. Measure retention.
                   Day-7 retention ≥ 50% → proceed.

PHASE 1 WEEK 1:   AI Weekly Synthesis. After 7 days of responses,
                   generate a "Week 1 Mirror" — pattern analysis.
                   This is the FIRST premium feature. Gate behind paywall.

PHASE 1 WEEK 3:   AI evolves — it starts noticing cross-week patterns.
                   "You've mentioned avoiding creative work in 14 of
                    your 42 responses. The avoidance peaks on Mondays."
```

---

## What the AI Coach Should Actually Be

**Not this:**
> "Great job reflecting today! Here are 3 tips to improve your mindfulness practice!"

**This:**
> "In 23 of your 38 responses this week, the word 'should' appeared in the context of someone else's expectations. You describe your own desires using hedging language ('maybe', 'I think', 'sort of want to') but describe obligations with certainty ('I need to', 'I have to'). The gap between your hedged desires and your certain obligations is where your identity is being borrowed."

That's the kind of synthesis that makes someone say "holy shit." It requires no gamification, no tips, no cheerfulness. It's a **mirror with memory** — it sees what the user can't see because they're too close to their own words.

---

## Architecture Prep (Do NOW, Build LATER)

Don't build the AI coach in Phase 0, but **design the data model so it's trivial to add later:**

```
ALREADY DONE (Phase 0):
  responses table stores prompt_text + response_text + timestamp
  → This is all the AI needs. No schema changes required.

PHASE 1 ADDITION (2 files):
  src/lib/insights.ts        — Claude API call with user's weekly responses
  supabase/functions/weekly-insight/index.ts  — cron, runs Sunday night
  insights table (user_id, week_number, insight_text, generated_at)

  The prompt: "Here are 42 self-reflection responses from one person over
  7 days. Identify patterns they cannot see themselves. Be direct, specific,
  and reference their exact words. Do not motivate. Mirror."
```

That's **one afternoon of work** once Phase 0 validates. No reason to build it now and risk muddying the validation data.

---

## The Pitch to Your Cofounder

The AI coach is **Phase 1's killer feature and the core of the premium tier**. It's too important to ship half-baked as an afterthought in Phase 0. It deserves to be designed properly after you have real user response data to test against — not synthetic prompts.

*"We validate the mirror first. Then we give the mirror memory."*

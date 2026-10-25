# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: curious adults reading classic books on their own, who want to understand every word, place, and reference without leaving the page. Important secondary use: high school and college students working through an assigned classic, who need the vocabulary glossed most of all.

## Product Purpose
Scholia publishes free annotated editions of public-domain classics. A short note sits beside each word, allusion, historical detail, or place a modern reader is likely to stumble on, so the reader keeps reading instead of searching. Success is a reader finishing a hard chapter without opening another tab.

## Positioning
Detailed annotations, including student-friendly vocabulary glosses that most annotated editions skip, released under an open license (CC BY 4.0) so teachers and other projects can reuse every note.

## Operating Context
Long-form reading of one chapter at a time, on laptops and phones. Notes are grouped into four layers (vocab, allusion, history, place) that readers can turn on or off. Notes are drafted with AI and verified by a person against a cited source. Draft status is kept in the data, not shown to readers.

## Capabilities and Constraints
- Static site: plain HTML, CSS, and JavaScript, no framework, no build step, deployed to GitHub Pages from `site/`, `texts/`, and `notes/`.
- The author's text is never altered: wording, spelling, and punctuation stay as in the Project Gutenberg source.
- Notes state facts only: no interpretation of themes or symbols, no spoilers beyond the current chapter.
- First edition: Lord Jim by Joseph Conrad (1900), chapters 1 to 10, all annotated (1,062 draft notes).
- Reader preferences (theme, font, text size, line length, layer toggles) persist in localStorage.

## Brand Commitments
- Name: Scholia, after the explanatory notes written in the margins of Greek and Latin manuscripts.
- The feel should stay classic and antique, in a distinctive way. The user ruled out theme-park antique (fake parchment textures, wax seals, quills), anything that makes long reading tiring, and generic web-app styling (cards, pill buttons, dashboards).

## Evidence on Hand
- Text: `texts/lord-jim/ch01.txt` to `ch10.txt` (public domain).
- Notes: `notes/lord-jim/ch1.json` to `ch10.json` (1,062 drafts, none verified yet). No verified notes, testimonials, usage numbers, or audit results exist yet; none may be invented.

## Product Principles
1. Reading comes first: nothing competes with the text column for attention.
2. A note answers one question and gets out of the way.
3. Every claim in a note can be checked against a named source.
4. Open by default: notes are meant to be copied and reused.

## Accessibility & Inclusion
Long-form reading must stay comfortable: body text contrast of at least 4.5:1, adjustable text size and line length, and full keyboard and touch access to notes.

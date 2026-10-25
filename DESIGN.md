---
name: Scholia
description: Free annotated editions of the classics, framed as a Victorian literary magazine.
colors:
  wrapper-buff: "#d6c69f"
  wrapper-ink: "#1c1913"
  newsprint: "#f3f2ee"
  ink: "#1c1a17"
  muted-ink: "#5d584e"
  faint-rule: "#c9c4b8"
  buff-wash: "#e6dcc2"
  shadow: "rgba(28, 26, 23, .16)"
  dark-ground: "#2b2823"
  dark-wrapper: "#4a3f2b"
  dark-wrapper-ink: "#efe6d1"
  dark-ink: "#e7e1d4"
  dark-muted-ink: "#b2a995"
  dark-hair: "#cfc6b2"
  dark-faint-rule: "#57514a"
  dark-buff-wash: "#4a4232"
  dark-shadow: "rgba(0, 0, 0, .4)"
typography:
  display:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "clamp(2.6rem, 9vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.16em"
  headline:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "clamp(2.2rem, 7vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.08em"
  title:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "1.26rem"
    fontWeight: 700
    lineHeight: 1.62
    letterSpacing: "0.24em"
  section-head:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "0.2em"
  body:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0em"
  body-frame:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  note:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  note-margin:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.28
    letterSpacing: "0em"
  label:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  initial:
    fontFamily: "Old Standard, Century Schoolbook, New Century Schoolbook, Georgia, serif"
    fontSize: "3.2em"
    fontWeight: 700
    lineHeight: 0.8
rounded:
  none: "0px"
spacing:
  hair: "1px"
  gutter: "16px"
  note-gap: "3px"
  panel-gap: "20px"
  paragraph: "0.9rem"
  section: "3rem"
  measure: "36em"
  page: "40rem"
components:
  running-head:
    backgroundColor: "{colors.wrapper-buff}"
    textColor: "{colors.wrapper-ink}"
    typography: "{typography.label}"
    padding: ".45rem 16px .4rem"
  masthead:
    backgroundColor: "{colors.wrapper-buff}"
    textColor: "{colors.wrapper-ink}"
    typography: "{typography.display}"
    padding: "2.6rem 16px 0"
  bar-button:
    backgroundColor: "transparent"
    textColor: "{colors.wrapper-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: ".15rem .55rem"
  bar-button-hover:
    backgroundColor: "{colors.wrapper-ink}"
    textColor: "{colors.wrapper-buff}"
  layer-mark-on:
    backgroundColor: "{colors.wrapper-ink}"
    textColor: "{colors.wrapper-buff}"
    rounded: "{rounded.none}"
    size: "1.15rem"
  layer-mark-off:
    backgroundColor: "transparent"
    textColor: "{colors.wrapper-ink}"
    rounded: "{rounded.none}"
    size: "1.15rem"
  settings-card:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: ".9rem 1rem"
    width: "18rem"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: ".3rem .5rem"
  segmented-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.newsprint}"
  select:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: ".25rem 1.8rem .25rem .5rem"
  stepper-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "2.6rem"
  stepper-button-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.newsprint}"
  reading-column:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    width: "{spacing.measure}"
  annotated-phrase-active:
    backgroundColor: "{colors.buff-wash}"
    textColor: "{colors.ink}"
  margin-note:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.note-margin}"
    padding: ".05rem .25rem"
  margin-note-active:
    backgroundColor: "{colors.buff-wash}"
    textColor: "{colors.ink}"
  reference-tick:
    textColor: "{colors.muted-ink}"
    width: "2.4rem"
  reference-tick-active:
    textColor: "{colors.ink}"
---

# Design System: Scholia

## Overview

**Creative North Star: "The Serial Number of Blackwood's"**

Scholia is dressed as the Victorian literary magazine that first serialized these novels. The frame carries the period: a buff paper wrapper that owns the masthead and the running head, thick-thin rules where wrapper meets page, a contents page with dotted leaders, run-in capital heads, centred spaced-capital section heads. Inside that frame the reading column is plain book type on neutral newsprint, justified and hyphenated, indented paragraphs with no gap, a two-line initial opening each chapter. The period lives in the furniture, never in the paragraph.

The system is monochrome ink on paper. There is no colour accent: emphasis comes from weight, capitals, letterspacing, italic, and the printed hairline. One face, Old Standard TT, sets everything from masthead to margin note. Corners are square, rules are 1px ink, and depth is almost absent; a soft shadow appears only on things that genuinely float over the text (the settings card, a hovered or pinned margin note).

The signature is the scholarly apparatus: four printers' reference marks (* vocab, † allusion, § history, ¶ place) sit in the gutters level with each annotated line, and notes are set like a critical edition: mark, lemma in italic closed by a bracket, gloss, then source. The world rejects theme-park antique (parchment textures, seals, quills), the cream-paper and red-accent default, and app chrome (cards, pills, dashboards).

**Key Characteristics:**
- Buff wrapper frame, neutral newsprint page, black ink, no hue accent.
- Old Standard TT throughout; tracked uppercase for every frame label.
- Square corners and 1px ink hairlines; thick-thin double rule as the frame border.
- Printers' reference marks as the only iconography.
- Book-set reading column: justified, hyphenated, indented, 36em measure by default.
- Dark mode is a lamplit umber, not black.

## Colors

Two papers and one ink: a buff wrapper, a neutral newsprint page, and near-black ink that also prints every rule.

### Primary
- **Wrapper Buff** (wrapper-buff): the magazine's paper cover. Owns the masthead, the sticky running head, and text selection. It is a field, never a highlight on text (that job is Buff Wash).
- **Wrapper Ink** (wrapper-ink): type and rules printed on the wrapper; fills the active layer mark and inverted bar-button hover.

### Neutral
- **Newsprint** (newsprint): the page ground. Deliberately neutral, not cream.
- **Ink** (ink): body text, headings, and every hairline rule (rules are printed in ink, so `--hair` equals ink in light mode).
- **Muted Ink** (muted-ink): sources, status lines, the "unverified" label, contents meta, dotted leaders and resting reference marks.
- **Faint Rule** (faint-rule): resting link underlines only; it darkens to currentColor on hover.
- **Buff Wash** (buff-wash): the highlight. A wash of wrapper buff behind an active annotated phrase and a hovered or pinned note.

### Dark theme
The dark set (dark-ground, dark-wrapper, dark-wrapper-ink, dark-ink, dark-muted-ink, dark-hair, dark-faint-rule, dark-buff-wash, dark-shadow) mirrors every role above. It is a warm umber lamplight; rules lighten to dark-hair rather than staying ink. It applies under `prefers-color-scheme: dark` unless the reader pins light, or whenever `data-theme="dark"` is set.

### Named Rules
**The No Accent Rule.** There is no hue accent. Emphasis is typographic (weight, capitals, italic, tracking) or a buff wash; never a red, blue, or any added colour.

**The Ink Rule Rule.** Every structural line is printed in the current ink at 1px (or the 3px+1px thick-thin pair). No grey dividers, no tinted borders.

## Typography

**Display Font:** Old Standard (Old Standard TT, self-hosted woff2, with Century Schoolbook, Georgia, serif)
**Body Font:** Old Standard, same family; the reader may swap the reading column face in settings
**Label/Mono Font:** none distinct; labels are Old Standard in tracked capitals

**Character:** A late-nineteenth-century periodical face with high contrast and a modern-style italic, used at every level so the page reads as one printed object. The dagger loads from the latin-ext file by unicode-range so the reference marks stay in the face.

### Hierarchy
- **Display** (masthead): bold, uppercase, tracked .16em with a matching negative right margin to recentre the tracked caps. Cover only.
- **Headline** (book title page): bold uppercase, tracked .08em.
- **Title** (chapter head): bold uppercase at 1.05em of the column size, tracked .24em, centred over a short double hairline.
- **Section head**: bold uppercase, .82rem, tracked .2em, centred, with a 3rem ink hairline beneath.
- **Body** (reading column): 1.2rem times the reader's scale, line-height 1.62, measure 36em (adjustable 26 to 46em). Indented 1.5em, no paragraph gap; justified and hyphenated above 700px.
- **Body frame** (cover, contents, about copy): 1.0625rem, line-height 1.55, paragraphs spaced .9rem.
- **Note**: .95rem/1.4 inline; .88rem/1.28 in the margin panels. Lemma italic followed by an upright "]".
- **Label**: .78rem uppercase tracked .08em for running head, bar buttons and issue line; settings labels .72rem tracked .12em in muted ink.
- **Initial**: two-line drop initial, bold, 3.2em, line-height .8; the rest of the first line in spaced capitals (.8em, .05em tracking).

### Named Rules
**The One Face Rule.** Old Standard sets the whole frame. Reader font choices (EB Garamond, Georgia, Palatino, Charter, sans) apply only to the reading column and notes via `--font`; the frame always stays on `--frame`.

**The Run-In Rule.** Sub-heads inside prose are run-in bold spaced capitals (.82em, .08em tracking) leading the paragraph, not standalone headings.

## Layout

Single centred column with the margins reserved for notes. Frame pages (cover, book) use a 40rem page with 16px side gutters; the chapter reader centres a column whose width is `min(100%, var(--measure))`, measured in ems of the text size so it grows with the type. Margin geometry is set in reader.js: 20px between text and panel, 16px from panel to window edge, a margin note needs at least 170px, panels run 300 to 440px, stacked notes sit 3px apart. When both panels cannot fit, opening one slides the column aside (`--shift`). Reference marks occupy a 2.4rem gutter on each side. Vocab notes take the right margin; allusion, history, and place take the left.

Below 700px: the running head wraps, layer toggles drop to their own full-width row, the chapter crumb hides, text is ragged right, and notes open inline as footnotes under their paragraph with a 4em footnote rule. Vertical rhythm on frame pages: 3rem before section heads, .9rem between paragraphs, 3 to 3.5rem before the colophon and chapter navigation.

## Elevation & Depth

Flat by default. Depth comes from paper changes (buff wrapper over newsprint) and rules, not shadow. Two things genuinely float over the text and only they carry a soft, diffuse shadow in the current shadow colour.

### Shadow Vocabulary
- **Floating card** (`box-shadow: 0 10px 30px var(--shadow)`): the open settings card.
- **Lifted note** (`box-shadow: 0 6px 18px var(--shadow)`): a hovered or pinned note in an open margin panel, raised over its trimmed neighbours.
- **Tipped-in plate** (`box-shadow: 0 18px 40px -22px var(--shadow)`): the one exception at rest; a painting's buff mount sits on the page like a plate tipped into a bound volume.

### Named Rules
**The Print Is Flat Rule.** Nothing at rest has a shadow. Shadows are soft and diffuse and appear only on an element that overlaps the text; never a hard offset shadow.

## Shapes

Square everywhere: radius 0 on buttons, selects, steppers, range thumbs, toggles and the settings card. Form language is the printed rule: 1px ink hairlines, the thick-thin double rule (3px over 1px, 5px tall) between wrapper and page, a short double hairline (4.5rem) under the chapter title, a 3rem hairline under section heads, 1px dotted leaders in contents, a dotted underline on annotated phrases that turns solid on hover. Even the select caret is drawn from two hairlines.

## Components

### Buttons
Printed boxes, not app buttons.
- **Shape:** square (0px), 1px currentColor border.
- **Bar button / settings toggle:** transparent on the wrapper, label type, padding .15rem .55rem. Hover and the open settings state invert to wrapper ink on buff.
- **Stepper (A−, A+):** 2.6rem square-cornered boxes in ink hairline; hover inverts to ink on newsprint; disabled at 35% opacity.
- **Text action** (reset): muted ink, underlined in faint rule, no box.
- **Focus:** 1px ink outline offset 3px (2px on composite controls).

### Logo
The mark is a bold Old Standard "S" inside an open square frame whose top-right corner is broken by an asterisk, the vocabulary reference mark: a letter with a note in its margin. `site/brand/mark.svg` is drawn in currentColor and applied as a CSS mask on `.logo`, so it inherits ink in both themes (1.45rem in the running head, 4.25rem on the home title page, 1em in colophons). `favicon.svg` is a heavier variant on a buff ground, legible at 16px; PNGs at 32, 180 (apple-touch) and 512px are rendered from it.

### Plates (signature)
Public-domain paintings of readers, set as numbered plates: the image in a 1px wrapper-ink keyline on a buff mount (padding clamp(12px, 1.8vw, 24px)), with a caption below in muted ink led by a small-caps plate number ("Plate I.", "Frontispiece."). The home page pairs Plate I with the title page in a 5fr/6fr spread, then floats Plates II and III alternately beside its two folios. Home art stays general (reading, libraries), never tied to one book; a book's own frontispiece belongs on its book page. Every plate is credited with museum and source in the colophon and `site/art/CREDITS.md`. Buff appears only as wrapper bars and mounts, never as a full-width band meeting the page.

### Layer toggles (signature)
Each layer is its printer's mark in a 1.15rem square box. On: filled wrapper ink with the mark in buff. Off: hollow box, name struck through at 60% opacity. The checkbox stays real and visually hidden; focus draws the outline on the box.

### Cards / Containers
- **Settings card:** the only container. Newsprint, 1px ink border, square, padding .9rem 1rem, 18rem wide, floating card shadow. Treated as a printed card, not an app panel.
- No other cards. Contents and notes are typeset lists, never boxes.

### Inputs / Fields
- **Segmented control:** a 1px ink-bordered strip divided by hairlines; the selected option is reversed out (ink ground, newsprint text).
- **Select:** square, hairline border, newsprint ground, hairline-drawn caret.
- **Range:** a 1px ink track with a 12px square ink thumb.

### Navigation
- **Running head:** sticky buff bar: SCHOLIA in bold .14em capitals, breadcrumb in tracked capitals with a dimmed middle-dot separator, layer marks, then controls; closed by the thick-thin rule in wrapper ink.
- **Contents:** title, dotted leader, and right-aligned italic status on one baseline; chapter numerals right-aligned in a 3.2rem slot.
- **Chapter navigation:** three-column grid over an ink hairline, tracked capitals, direction word in muted ink above the target.

### Annotated text and notes (signature)
- **Anchor:** dotted muted underline (1px, .22em offset), never hyphenated across lines; hover goes solid ink; active adds the buff wash.
- **Reference marks:** * † § ¶ in the gutters, muted at rest, bold ink when their note is hovered or active.
- **Note:** bold mark, italic lemma, "]", gloss; source on its own line in muted ink. In open margins notes are trimmed to whole words; draft status is never shown to readers; hover or pin shows the note whole with the buff wash and lifted-note shadow.
- **Focus note:** a single note beside its anchor; pinned adds the buff wash and the source.
- **Motion:** panels fade and slide 8px in over .2s, focus notes rise 3px over .16s, the column shift takes .24s, all on `cubic-bezier(.16, 1, .3, 1)`.

## Do's and Don'ts

### Do:
- **Do** frame every page with the buff wrapper and close it with the thick-thin rule in wrapper ink.
- **Do** set frame labels in Old Standard uppercase, tracked .08em to .24em by rank.
- **Do** draw every divider as a 1px ink hairline, square-cornered.
- **Do** mark notes only with the four printers' marks: * vocab, † allusion, § history, ¶ place.
- **Do** use Buff Wash for the active anchor and the hovered or pinned note.
- **Do** keep the reading column at the reader's measure (36em default), indented paragraphs, justified and hyphenated only above 700px.

### Don't:
- **Don't** add a colour accent; no red, blue, or brand hue anywhere.
- **Don't** round corners or use pill shapes; radius stays 0.
- **Don't** wrap content in cards; the settings card is the only container.
- **Don't** use parchment textures, wax seals, quills, or cream paper for the page ground.
- **Don't** put shadows on resting elements or use hard offset shadows.
- **Don't** introduce icon glyphs or icon fonts; the reference marks and drawn hairlines are the whole iconography.
- **Don't** let the reader's font choice reach the frame; it changes the column and notes only.

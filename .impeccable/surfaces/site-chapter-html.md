---
version: 1
slug: "site-chapter-html"
primary_target: "site/chapter.html"
related_targets: ["site/index.html","site/book.html"]
---

# Surface brief: Scholia reader (home, book contents, chapter)

Scope: site/index.html (library cover), site/book.html (title page and contents), site/chapter.html (chapter reader). Visitor mode: Read.
Audience: curious adults reading a classic on their own; students on assigned reading. Job: read a chapter and understand every hard word, place, and reference without leaving the page.
Constraints: static HTML/CSS/JS, no build step; author's text never altered; reading column calm and readable; no theme-park antique, no generic web-app chrome.
Memorable moment: margin notes keyed by the old printers' reference marks (* † § ¶), set like a scholarly apparatus.

## Direction contract

THESIS: Scholia as a Victorian literary magazine, the kind that first serialized these novels (Lord Jim ran in Blackwood's Magazine, 1899 to 1900). The frame is the magazine's wrapper, running heads, rules, and contents page; the column is plain book type. Refuses the cream-paper, Garamond, red-accent default and the card-based reading app.

OWN-WORLD: Wrapper buff field (#d6c69f family) owning the masthead and running head; neutral newsprint ground; black ink, no colour accent. Old Standard TT throughout (a revival of late-1800s book and periodical type). Thick-thin rules, dotted leaders, run-in capital heads, square corners, black hairlines. Notes carry reference marks by layer: * vocab, † allusion, § history, ¶ place.

STORY: The reader opens a cover, finds the book in a contents page, reads a chapter whose margins answer questions on demand, and trusts the notes because each shows its source.

FIRST VIEWPORT: Chapter page: buff running head across the top (SCHOLIA, book and chapter, layer marks, controls) over a thick-thin rule; centred CHAPTER I. in spaced capitals; the text column at about 70 to 90 characters with a two-line initial; reference marks in the gutters level with each annotated line.

FORM: Victorian magazine (Blackwood's) wrapper and contents grammar; candidate 3 of 7 on the ordered list; seed:5c70ab71c22cd543.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

# Open Margins

Free, open annotated editions of classic books for high school and college students.

Classic books are free to read online, but they are full of words, places, people, and events that modern readers don't know. Open Margins puts a short note in the margin wherever a reader is likely to get stuck, and releases every note under an open license so teachers, students, and other projects can reuse them.

**Library:** *Lord Jim* by Joseph Conrad (1900), all 45 chapters; *Heart of Darkness* by Joseph Conrad (1899), all three parts; *The Death of Ivan Ilyich* by Leo Tolstoy (1886, trans. Constance Garnett), all twelve chapters; *Bartleby, the Scrivener* by Herman Melville (1853), all six parts; *Siddhartha* by Hermann Hesse (1922), all twelve chapters; *The Romantic Poets*, the 123 poems of Palgrave’s *Golden Treasury* Fourth Book (1861), regrouped under twelve poets.

## Why?

- A lot of people aren’t reading classic literature these days, especially people in high school and college.
- Yet reading trains us to think, to be articulate, and to understand other people better. And these works have faced intense selection pressure: only the works of the highest literary merit are still read today. Naturally, I think we can conclude that there must be _something_ in these books that makes them worth reading.
- Students nowadays often turn to SparkNotes or LitCharts, which summarize the texts most often taught in schools.
- I think this is worsening people’s ability to read and think well.
- And it seems that part of the reason people turn to these tools is that reading the text by itself is difficult for them, so they take the easy way out.
- This tool is meant to address that concern and give people a smoother, more interactive experience with classic texts.

## How it works

- **Layers you can toggle.** Notes are grouped into layers: vocabulary, allusions, history, and places. A 10th grader can turn everything on; a college reader can hide vocabulary.
- **AI-drafted, not yet human-reviewed.** Notes are drafted with AI and checked against a cited source by AI. No note has been reviewed by a person yet, and some will be wrong. A note is marked verified only after a person checks it.

## Repository layout

```
texts/lord_jim.txt         Full public domain text (Project Gutenberg boilerplate removed)
texts/lord-jim/ch01.txt    One file per chapter, ch01.txt to ch45.txt
texts/heart-of-darkness/   Parts I to III as ch01.txt to ch03.txt
texts/ivan-ilyich/         Chapters 1 to 12 as ch01.txt to ch12.txt
texts/bartleby/            Parts 1 to 6 as ch01.txt to ch06.txt
texts/siddhartha/          Chapters 1 to 12 as ch01.txt to ch12.txt
texts/romantic-poets/      Twelve poets as ch01.txt to ch12.txt
notes/SCHEMA.md            Annotation format
notes/lord-jim/ch1.json    Annotations, one JSON file per chapter (heart-of-darkness/ likewise, per part)
site/books.js              The library registry shared by every page
site/                      Static site: home page (index.html), book contents (book.html), chapter reader (chapter.html), type-through mode (type.html), search (search.js), sources (sources.html)
site/fonts/                Old Standard TT and EB Garamond web fonts (SIL Open Font License)
site/brand/                Logo mark and favicons
site/art/                  Public domain paintings used as plates (sources in CREDITS.md)
scripts/check_notes.py     Checks notes against the schema and the chapter text
.github/workflows/pages.yml  Deploys site/, texts/, and notes/ to GitHub Pages
.github/workflows/fetch-art.yml  Downloads paintings listed in .github/art-sources.txt from Wikimedia Commons
.claude/skills/impeccable/  Impeccable design skill for Claude Code (Apache 2.0), run with /impeccable
```

To preview locally, run `python3 -m http.server` in the repository root and open `http://localhost:8000/site/`.

## Annotation format

Each note is a JSON object:

```json
{
  "id": "ch1-042",
  "anchor": "exact phrase in the text",
  "layer": "vocab",
  "note": "Plain-language explanation for a high school reader.",
  "source": "Merriam-Webster",
  "status": "verified",
  "checker": "github-username"
}
```

See [`notes/SCHEMA.md`](notes/SCHEMA.md) for the full rules.

## License

- **Text:** public domain. Source edition: [Project Gutenberg](https://www.gutenberg.org/).
- **Annotations:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse freely with credit to Open Margins.
- **Code:** MIT.

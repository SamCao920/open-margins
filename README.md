# scholia

Free, open annotated editions of classic books for high school and college students.

Classic books are free to read online, but they are full of words, places, people, and events that modern readers don't know. Scholia puts a short note in the margin wherever a reader is likely to get stuck, and releases every note under an open license so teachers, students, and other projects can reuse them.

**First edition:** *Lord Jim* by Joseph Conrad (1900), all 45 chapters.

## Why?

- A lot of people aren’t reading classic literature these days, especially people in high school and college.
- Yet reading trains us to think, to be articulate, and to understand other people better. And these works have faced intense selection pressure: only the works of the highest literary merit are still read today. Naturally, I think we can conclude that there must be _something_ in these books that makes them worth reading.
- Students nowadays often turn to SparkNotes or LitCharts, which summarize the texts most often taught in schools.
- I think this is worsening people’s ability to read and think well.
- And it seems that part of the reason people turn to these tools is that reading the text by itself is difficult for them, so they take the easy way out.
- This tool is meant to address that concern and give people a smoother, more interactive experience with classic texts.

## How it works

- **Layers you can toggle.** Notes are grouped into layers: vocabulary, allusions, history, and places. A 10th grader can turn everything on; a college reader can hide vocabulary.
- **AI-drafted, human-verified.** Notes are drafted with AI, then checked by a person against a cited source before they are marked verified.
- **Audited.** We recheck a random sample of verified notes and publish the error rate.

## Repository layout

```
texts/lord_jim.txt         Full public domain text (Project Gutenberg boilerplate removed)
texts/lord-jim/ch01.txt    One file per chapter, ch01.txt to ch45.txt
notes/SCHEMA.md            Annotation format
notes/lord-jim/ch1.json    Annotations, one JSON file per chapter
site/                      Static site: home page (index.html), book contents (book.html), chapter reader (chapter.html), sources (sources.html)
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

## Contributing

We need checkers. To help:

1. Pick an open issue for a chapter.
2. For each note with `"status": "draft"`, check it against a reliable source.
3. Fix or cut wrong notes, set `status` to `verified` or `cut`, add your username as `checker`, and open a pull request.

Good sources: Merriam-Webster or the OED for words; encyclopedias, scholarly editions, and primary sources for allusions and history. Wikipedia is a starting point, not a final source.

## Status

| Chapter | Drafted | Verified |
|---|---|---|
| 1 | 112 | 0 |
| 2 | 91 | 0 |
| 3 | 120 | 0 |
| 4 | 58 | 0 |
| 5 | 196 | 0 |
| 6 | 159 | 0 |
| 7 | 90 | 0 |
| 8 | 91 | 0 |
| 9 | 65 | 0 |
| 10 | 77 | 0 |
| 11 | 40 | 0 |
| 12 | 71 | 0 |
| 13 | 118 | 0 |
| 14 | 112 | 0 |
| 15 | 32 | 0 |
| 16 | 45 | 0 |
| 17 | 30 | 0 |
| 18 | 58 | 0 |
| 19 | 67 | 0 |
| 20 | 95 | 0 |
| 21 | 53 | 0 |
| 22 | 59 | 0 |
| 23 | 65 | 0 |
| 24 | 47 | 0 |
| 25 | 73 | 0 |
| 26 | 46 | 0 |
| 27 | 55 | 0 |
| 28 | 53 | 0 |
| 29 | 56 | 0 |
| 30 | 45 | 0 |
| 31 | 55 | 0 |
| 32 | 27 | 0 |
| 33 | 57 | 0 |
| 34 | 67 | 0 |
| 35 | 36 | 0 |
| 36 | 49 | 0 |
| 37 | 48 | 0 |
| 38 | 77 | 0 |
| 39 | 43 | 0 |
| 40 | 48 | 0 |
| 41 | 40 | 0 |
| 42 | 31 | 0 |
| 43 | 41 | 0 |
| 44 | 26 | 0 |
| 45 | 33 | 0 |
| **Total** | **2,957** | **0** |

## License

- **Text:** public domain. Source edition: [Project Gutenberg](https://www.gutenberg.org/).
- **Annotations:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse freely with credit to scholia.
- **Code:** MIT.

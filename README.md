# scholia

Free, open annotated editions of classic books for high school and college students.

Classic books are free to read online, but they are full of words, places, people, and events that modern readers don't know. Scholia puts a short note in the margin wherever a reader is likely to get stuck, and releases every note under an open license so teachers, students, and other projects can reuse them.

**First edition:** *Lord Jim* by Joseph Conrad (1900), chapters 1 to 10.

## How it works

- **Layers you can toggle.** Notes are grouped into layers: vocabulary, allusions, history, and places. A 10th grader can turn everything on; a college reader can hide vocabulary.
- **AI-drafted, human-verified.** Notes are drafted with AI, then checked by a person against a cited source before they are marked verified.
- **Audited.** We recheck a random sample of verified notes and publish the error rate.

## Repository layout

```
texts/lord_jim.txt         Full public domain text (Project Gutenberg boilerplate removed)
texts/lord-jim/ch01.txt    One file per chapter, ch01.txt to ch10.txt
notes/SCHEMA.md            Annotation format
notes/lord-jim/ch1.json    Annotations, one JSON file per chapter
site/                      Static reader: plain HTML, CSS, and JavaScript
scripts/check_notes.py     Checks notes against the schema and the chapter text
.github/workflows/pages.yml  Deploys site/, texts/, and notes/ to GitHub Pages
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
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |
| 9 | | |
| 10 | | |

## License

- **Text:** public domain. Source edition: [Project Gutenberg](https://www.gutenberg.org/).
- **Annotations:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse freely with credit to scholia.
- **Code:** MIT.

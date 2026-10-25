# scholia

Free, open annotated editions of classic books for high school and college students.

Classic books are free to read online, but they are full of words, places, people, and events that modern readers don't know. Open Margins puts a short note in the margin wherever a reader is likely to get stuck, and releases every note under an open license so teachers, students, and other projects can reuse them.

**First edition:** *Lord Jim* by Joseph Conrad (1900), chapters 1 to 10.

## How it works

- **Layers you can toggle.** Notes are grouped into layers: vocabulary, allusions, history, and places. A 10th grader can turn everything on; a college reader can hide vocabulary.
- **AI-drafted, human-verified.** Notes are drafted with AI, then checked by a person against a cited source before they are marked verified.
- **Audited.** We recheck a random sample of verified notes and publish the error rate.

## Repository layout

```
text/            Public domain text, one file per chapter
notes/           Annotations, one JSON file per chapter
notes/SCHEMA.md  Annotation format
site/            Static reader (deployed with GitHub Pages)
```

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

- **Text:** public domain. Source edition: [Standard Ebooks](https://standardebooks.org/).
- **Annotations:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse freely with credit to Open Margins.
- **Code:** MIT.

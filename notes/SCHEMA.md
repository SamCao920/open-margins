# Annotation schema

One file per chapter: `notes/lord-jim/ch1.json`, `notes/lord-jim/ch2.json`, and so on. Each file is a JSON array of notes.

## Fields

| Field | Required | Values |
|---|---|---|
| `id` | yes | `ch{chapter}-{three-digit number}`, e.g. `ch1-042`. Never reuse an id. |
| `anchor` | yes | Exact phrase from the text, copied character for character. Keep it short (1 to 6 words) and unique within the chapter. |
| `layer` | yes | `vocab`, `allusion`, `history`, or `place` |
| `note` | yes | The explanation. See writing rules below. |
| `source` | yes for `allusion`, `history`, `place` | Where the claim can be checked. Name the work and, for web sources, include a URL. |
| `status` | yes | `draft`, `verified`, or `cut` |
| `checker` | when verified or cut | GitHub username of the person who checked it |

## Which layer

- **vocab:** a word or phrase a typical 10th grader would not know, or one whose meaning has changed since the book was written (e.g. “gay” meaning cheerful).
- **allusion:** a reference to another work, myth, song, or famous person.
- **history:** an event, institution, custom, product, or price from the period.
- **place:** a real or fictional location and why it matters.

## Writing rules

- Write for a 10th grader. Plain words, short sentences.
- Vocab notes: 5 to 20 words. Give the meaning in this context, not every dictionary sense.
- Other notes: 15 to 60 words. Say what it is, then why it matters here if that is not obvious.
- State facts, not interpretations. Do not explain themes or symbols.
- Do not spoil later plot.
- If unsure, mark it `draft` and leave a comment in the pull request. A missing note is better than a wrong one.

## Example

```json
[
  {
    "id": "ch1-003",
    "anchor": "Middle West",
    "layer": "place",
    "note": "The older name for the Midwest, the central northern states such as Minnesota, where Nick grew up.",
    "source": "Merriam-Webster, “Middle West”",
    "status": "verified",
    "checker": "samcao"
  }
]
```

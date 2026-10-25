#!/usr/bin/env python3
"""Check notes/<book>/chN.json against notes/SCHEMA.md and the chapter text.

Anchors are matched the way the reader matches them: within one paragraph,
with line breaks treated as spaces. Exits 1 if any problem is found.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LAYERS = {"vocab", "allusion", "history", "place"}
STATUSES = {"draft", "verified", "cut"}
NEEDS_SOURCE = {"allusion", "history", "place"}


def paragraphs(raw):
    paras = re.split(r"\n\s*\n", raw.replace("\r\n", "\n"))
    return [re.sub(r"\s*\n\s*", " ", p).strip() for p in paras if p.strip()]


def check(path):
    problems = []
    book = path.parent.name
    n = int(re.fullmatch(r"ch(\d+)\.json", path.name).group(1))
    text_path = ROOT / "texts" / book / f"ch{n:02d}.txt"
    paras = paragraphs(text_path.read_text(encoding="utf-8"))
    notes = json.loads(path.read_text(encoding="utf-8"))
    seen_ids, seen_anchors = set(), set()
    spans = []
    for note in notes:
        nid = note.get("id", "?")
        where = f"{path.relative_to(ROOT)} {nid}"
        if not re.fullmatch(rf"ch{n}-\d{{3}}", nid):
            problems.append(f"{where}: bad id")
        if nid in seen_ids:
            problems.append(f"{where}: duplicate id")
        seen_ids.add(nid)
        for field in ("anchor", "layer", "note", "status"):
            if not note.get(field):
                problems.append(f"{where}: missing {field}")
        if note.get("layer") not in LAYERS:
            problems.append(f"{where}: bad layer {note.get('layer')!r}")
        if note.get("status") not in STATUSES:
            problems.append(f"{where}: bad status {note.get('status')!r}")
        if note.get("layer") in NEEDS_SOURCE and not note.get("source"):
            problems.append(f"{where}: {note['layer']} note needs a source")
        if note.get("status") in {"verified", "cut"} and not note.get("checker"):
            problems.append(f"{where}: {note['status']} note needs a checker")
        anchor = note.get("anchor", "")
        if anchor in seen_anchors:
            problems.append(f"{where}: anchor used by another note: {anchor!r}")
        seen_anchors.add(anchor)
        count = sum(p.count(anchor) for p in paras) if anchor else 0
        if count == 0:
            problems.append(f"{where}: anchor not found: {anchor!r}")
        elif count > 1:
            problems.append(f"{where}: anchor occurs {count} times: {anchor!r}")
        else:
            i = next(i for i, p in enumerate(paras) if anchor in p)
            start = paras[i].index(anchor)
            spans.append((i, start, start + len(anchor), nid))
        words = len(note.get("note", "").split())
        lo, hi = (5, 20) if note.get("layer") == "vocab" else (15, 60)
        if not lo <= words <= hi:
            problems.append(f"{where}: note is {words} words (want {lo} to {hi})")
    spans.sort()
    for a, b in zip(spans, spans[1:]):
        if a[0] == b[0] and b[1] < a[2]:
            problems.append(f"{path.relative_to(ROOT)} {b[3]}: anchor overlaps {a[3]}")
    return problems, len(notes)


def main():
    problems = []
    for path in sorted((ROOT / "notes").glob("*/ch*.json")):
        p, count = check(path)
        problems += p
        print(f"{path.relative_to(ROOT)}: {count} notes, {len(p)} problems")
    for p in problems:
        print("  " + p)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()

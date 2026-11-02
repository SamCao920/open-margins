#!/usr/bin/env python3
"""Mark French, German, and Latin phrases in the Lord Jim text as italics.

Project Gutenberg's text leaves most foreign phrases in roman type. This wraps
each listed phrase in _underscores_, the same markup Gutenberg uses for
emphasis, which the reader renders as <em>. Safe to re-run: phrases already
inside underscores are skipped.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "texts" / "lord-jim"

PHRASES = {
    3: ["schwein"],
    5: ["verfluchte", "Ewigkeit"],
    9: ["Mein Gott"],
    10: ["Donnerwetter"],
    12: ["Fort intrigues par ce cadavre", "Merci", "cassis a l’eau",
         "Impossible de comprendre—vous concevez", "Parbleu",
         "exigeait les plus grands menagements", "naturellement", "Dieu merci",
         "notez bien", "s’en va", "C’est bien ca", "Enfin", "drole de trouvaille"],
    13: ["Mon Dieu", "tres coquet", "triste ville", "au juste", "bah",
         "S’est enfui avec les autres", "roule ma bosse", "Allez", "le metier veut ca",
         "Eh bien", "bien entendu", "vous lachez tout", "un trac epouvantable",
         "que diable", "parbleu", "un derangement d’estomac", "L’homme est ne poltron",
         "voila", "ne vient pas tout seul", "monsieur", "Monsieur", "ah ca",
         "par exemple", "Serviteur"],
    19: ["Es ist ein’ Idee"],
    20: ["residenz", "gelungen", "bleibt ganz ruhig",
         "So halt’ ich’s endlich denn in meinen Handen, Und nenn’ es in gewissem Sinne mein",
         "Na", "Ach so", "Ja! ja", "Ach", "Ja", "Wie? Was? Gott im Himmel", "nicht wahr",
         "ewig", "usque ad finem", "Gewiss"],
    21: ["Schon"],
    23: ["Absit omen"],
    28: ["verdammte"],
    34: ["Magna est veritas el"],
    37: ["Ach", "sehen Sie", "Schrecklich"],
    41: ["in articulo mortis"],
}


def italic_spans(text):
    return [m.span() for m in re.finditer(r"_[^_]+_", text)]


def wrap(text, phrase):
    pat = r"(?<![\w’])" + r"\s+".join(re.escape(w) for w in phrase.split(" ")) + r"(?![\w’])"
    out, pos, n = [], 0, 0
    for m in re.finditer(pat, text):
        spans = italic_spans(text)
        if any(a <= m.start() < b for a, b in spans):
            continue
        out.append(text[pos:m.start()] + "_" + m.group(0) + "_")
        pos = m.end()
        n += 1
    out.append(text[pos:])
    return "".join(out), n


def main():
    for ch, phrases in PHRASES.items():
        p = ROOT / f"ch{ch:02d}.txt"
        text = p.read_text(encoding="utf-8")
        for ph in phrases:
            text, n = wrap(text, ph)
            if n == 0:
                print(f"ch{ch}: not found (or already italic): {ph!r}")
        p.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()

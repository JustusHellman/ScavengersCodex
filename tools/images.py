#!/usr/bin/env python3
"""Art pass helper for the Scavenger's Codex.

  python3 tools/images.py report                 # which entries have a picture, which still use a generated plate
  python3 tools/images.py import <folder>        # preview: match pictures in <folder> to entries by file name
  python3 tools/images.py import <folder> --apply   # copy them into images/<kind>/<id>.<ext>
  python3 tools/images.py import <folder> --apply --resize   # also shrink to 640 px wide .webp (needs Pillow)

File names are matched to an entry's id or name, so "Dire Wolf.jpg", "dire_wolf.png" and
"dire-wolf.webp" all become images/creatures/dire-wolf.<ext>. Put "creature-", "item-",
"material-" or "place-" in front of a name that exists in more than one list.
"""
import json, os, re, sys, shutil, difflib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA, IMAGES = os.path.join(ROOT, "data"), os.path.join(ROOT, "images")
EXTS = (".webp", ".jpg", ".jpeg", ".png")
FOLDER = {"monster": "creatures", "item": "items", "material": "materials", "place": "places"}
PREFIX = {"creature": "monster", "monster": "monster", "item": "item", "material": "material", "place": "place"}

slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def load():
    entries = []  # (kind, id, name, has_explicit_img)
    for f in sorted(os.listdir(DATA)):
        if not f.endswith(".json") or f == "manifest.json": continue
        d = json.load(open(os.path.join(DATA, f)))
        for k, kind in (("materials", "material"), ("items", "item"), ("monsters", "monster"), ("environments", "place")):
            for e in d.get(k, []):
                entries.append((kind, e["id"], e.get("name", e["id"]), bool(e.get("img"))))
    return entries

def has_image(kind, id_):
    base = os.path.join(IMAGES, FOLDER[kind], id_)
    return any(os.path.exists(base + x) for x in (".webp", ".jpg", ".png"))

def report(entries):
    print("Pictures per kind (the rest show a generated specimen plate):")
    missing = {}
    for kind in ("monster", "item", "material", "place"):
        es = [e for e in entries if e[0] == kind]
        got = [e for e in es if e[3] or has_image(kind, e[1])]
        missing[kind] = [e for e in es if e not in got]
        print(f"  {FOLDER[kind]:<10} {len(got):>4} of {len(es):<4} ({100 * len(got) // max(1, len(es))}%)")
    out = os.path.join(IMAGES, "_missing.txt")
    os.makedirs(IMAGES, exist_ok=True)
    with open(out, "w") as fh:
        for kind, es in missing.items():
            fh.write(f"# {FOLDER[kind]} ({len(es)} without a picture) -> images/{FOLDER[kind]}/<id>.webp\n")
            for _, i, n, _ in sorted(es, key=lambda e: e[2]): fh.write(f"{i}\t{n}\n")
            fh.write("\n")
    print(f"Full list of entries without a picture: {os.path.relpath(out, ROOT)}")

def match(fname, entries, by_id, by_name):
    stem = slug(os.path.splitext(fname)[0])
    kind = None
    m = re.match(r"^(creature|monster|item|material|place)-(.+)$", stem)
    if m: kind, stem = PREFIX[m.group(1)], m.group(2)
    pool = [e for e in entries if not kind or e[0] == kind]
    hits = [e for e in pool if e[1] == stem] or [e for e in pool if slug(e[2]) == stem]
    how = "exact"
    if not hits:
        keys = {e[1]: e for e in pool}
        close = difflib.get_close_matches(stem, list(keys), n=2, cutoff=0.86)
        hits, how = [keys[c] for c in close[:1]], "guess"
    if len(hits) > 1:
        return None, f"ambiguous ({', '.join(h[0] + ':' + h[1] for h in hits)}); add a creature-/item-/material-/place- prefix"
    return (hits[0], how) if hits else (None, "no entry with that id or name")

def do_import(folder, apply, resize):
    entries = load()
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(EXTS))
    if not files: print("No .webp/.jpg/.png files in", folder); return
    if resize:
        try: from PIL import Image
        except ImportError: print("--resize needs Pillow: pip install pillow"); return
    done, skipped, taken = 0, [], {}
    for f in sorted(files, key=lambda f: match(f, entries, None, None)[1] == "guess"):  # exact matches first
        e, how = match(f, entries, None, None)
        if not e: skipped.append((f, how)); continue
        kind, id_ = e[0], e[1]
        if (kind, id_) in taken: skipped.append((f, f"{taken[(kind, id_)]} already matched {id_}")); continue
        taken[(kind, id_)] = f
        ext = ".webp" if resize else (".jpg" if f.lower().endswith(".jpeg") else os.path.splitext(f)[1].lower())
        dest = os.path.join(IMAGES, FOLDER[kind], id_ + ext)
        flag = "  (guessed, check it)" if how == "guess" else ""
        print(f"  {f:<40} -> images/{FOLDER[kind]}/{id_}{ext}{flag}")
        if apply:
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            for other in (".webp", ".jpg", ".png"):  # the app tries .webp first, so remove stale copies
                p = os.path.join(IMAGES, FOLDER[kind], id_ + other)
                if p != dest and os.path.exists(p): os.remove(p)
            if resize:
                im = Image.open(os.path.join(folder, f)); im.thumbnail((640, 4000))
                im.convert("RGB").save(dest, "WEBP", quality=82)
            else: shutil.copyfile(os.path.join(folder, f), dest)
        done += 1
    for f, why in skipped: print(f"  SKIPPED {f}: {why}")
    print(f"--- {done} matched, {len(skipped)} skipped" + ("" if apply else ". Nothing copied yet: run again with --apply."))

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] == "report": report(load())
    elif a[0] == "import" and len(a) > 1: do_import(a[1], "--apply" in a, "--resize" in a)
    else: print(__doc__)

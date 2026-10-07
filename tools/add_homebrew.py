#!/usr/bin/env python3
"""Add (or remove) a homebrew pack without hand-editing the data folder.

  python3 tools/add_homebrew.py my-pack.json              add it (checks first, changes nothing if it fails)
  python3 tools/add_homebrew.py my-pack.json --dry-run    check it and show what would happen
  python3 tools/add_homebrew.py my-pack.json --replace    overwrite an earlier version of the same pack
  python3 tools/add_homebrew.py --remove my-pack          take a pack back out (refuses if something else uses it)
  python3 tools/add_homebrew.py --list                    show the homebrew packs in homebrew/

A pack is a JSON file shaped like the files in data/ (materials, items, monsters, environments,
cultivation), with a "homebrew": {"name", "title", "desc", "default", "requires", "credit"} block.
The pack is saved as homebrew/<name>.json and homebrew/index.json is rebuilt. Commit both.
(Dropping the file into homebrew/ by hand works too: the deploy workflow rebuilds the index.)
Nothing is left behind if the checks fail.
See README.md ("Adding your own homebrew") and SCHEMA.md for the format.
"""
import argparse, json, os, re, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import codexdata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "homebrew")
MANIFEST = os.path.join(DATA, "index.json")
SECTIONS = ("materials", "items", "monsters", "environments", "cultivation")
PREFIX = ""


def slug(s):
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", str(s).lower()))[:40]


def read_manifest():
    return {"files": [os.path.basename(f) for f in codexdata.pack_files(ROOT)]}


def write_manifest(m=None):
    codexdata.write_index(ROOT)


def run_validate(only):
    """Runs tools/validate.py, reporting only problems in `only` (but resolving ids against everything)."""
    args = [sys.executable, os.path.join(ROOT, "tools", "validate.py")] + ([only] if only else [])
    p = subprocess.run(args, capture_output=True, text=True, cwd=ROOT)
    return p.returncode == 0, (p.stdout + p.stderr).strip()


class Snapshot:
    """Remembers data/manifest.json and one data file so a failed change can be undone exactly."""

    def __init__(self, path):
        self.path = path
        os.makedirs(DATA, exist_ok=True)
        self.manifest = open(MANIFEST, "rb").read() if os.path.exists(MANIFEST) else b'{"packs": []}\n'
        self.file = open(path, "rb").read() if os.path.exists(path) else None

    def restore(self):
        open(MANIFEST, "wb").write(self.manifest)
        if self.file is None:
            if os.path.exists(self.path):
                os.remove(self.path)
        else:
            open(self.path, "wb").write(self.file)


def summarize(pack):
    parts = []
    for k, label in (("materials", "materials"), ("items", "items"), ("monsters", "creatures"), ("environments", "place extensions"), ("cultivation", "garden plants")):
        n = len(pack.get(k, []) or [])
        if n:
            parts.append(f"{n} {label}")
    return ", ".join(parts) or "nothing"


def cmd_list():
    names = [f for f in read_manifest()["files"] if f.startswith(PREFIX)]
    if not names:
        print("No homebrew packs in homebrew/.")
    for f in names:
        with open(os.path.join(DATA, f), encoding="utf-8") as fh:
            pack = json.load(fh)
        title = (pack.get("homebrew") or {}).get("title") or f
        print(f"{f}: {title} ({summarize(pack)})")
    return 0


def cmd_remove(name):
    fn = f"{PREFIX}{slug(name)}.json"
    path = os.path.join(DATA, fn)
    man = read_manifest()
    if not os.path.exists(path) and fn not in man["files"]:
        print(f"No homebrew pack called '{name}' (looked for homebrew/{fn}). Try --list.")
        return 1
    snap = Snapshot(path)
    if os.path.exists(path):
        os.remove(path)
    write_manifest()
    ok, out = run_validate(None)
    if not ok:
        snap.restore()
        print(out)
        print(f"\nNot removed: something else in the codex uses what '{name}' adds (see above). Nothing was changed.")
        return 1
    print(f"Removed homebrew/{fn}. Commit homebrew/index.json and the deleted file.")
    return 0


def cmd_add(src, name, dry, replace):
    try:
        with open(src, encoding="utf-8") as f:
            pack = json.load(f)
    except Exception as e:
        print(f"Can't read {src}: {e}")
        return 1
    if not isinstance(pack, dict):
        print("The pack must be a JSON object, like the files in data/.")
        return 1
    meta = pack.get("homebrew") if isinstance(pack.get("homebrew"), dict) else {}
    name = slug(name or meta.get("name") or os.path.splitext(os.path.basename(src))[0].replace(".homebrew", ""))
    meta = {**meta, "name": name, "title": meta.get("title") or name.replace("-", " ").title()}
    pack = {"homebrew": meta, **{k: v for k, v in pack.items() if k != "homebrew"}}
    if not name:
        print("Couldn't work out a name for the pack. Pass --name.")
        return 1
    unknown = [k for k in pack if k not in SECTIONS + ("homebrew",)]
    if unknown:
        print(f"Note: ignoring unknown sections: {', '.join(unknown)}")
    if not any(pack.get(k) for k in SECTIONS):
        print("The pack is empty. It needs at least one of: " + ", ".join(SECTIONS) + ".")
        return 1
    for it in pack.get("items", []) or []:
        if isinstance(it, dict):
            it.setdefault("src", "Homebrew")

    fn = f"{PREFIX}{name}.json"
    path = os.path.join(DATA, fn)
    if os.path.exists(path) and not replace and not dry:
        print(f"homebrew/{fn} already exists. Use --replace to overwrite it (or --name to pick a different name).")
        return 1
    snap = Snapshot(path)
    man = read_manifest()
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(pack, f, ensure_ascii=False, indent=1)
            f.write("\n")
        write_manifest()
        ok, out = run_validate(path)
        if not ok:
            print(out)
            print("\nNot added: fix the problems above and run it again. Nothing was changed.")
            return 1
        print(out.splitlines()[-1] if out else "")
        if dry:
            print(f"Dry run: '{name}' would add {summarize(pack)} as homebrew/{fn}. Nothing was changed.")
            return 0
        snap = None
        print(f"Added '{name}': {summarize(pack)}.")
        print(f"Saved homebrew/{fn} and updated homebrew/index.json. Commit both files to publish.")
        print("It starts switched " + ("on" if meta.get("default") else "off") + " for new visitors; the DM ticks it on the Homebrew page.")
        print("Tip: run  python3 tools/playtest.py  to see how the new recipes fit the balance table.")
        return 0
    finally:
        if snap is not None:
            snap.restore()


def main():
    ap = argparse.ArgumentParser(description="Add or remove a homebrew pack.")
    ap.add_argument("pack", nargs="?", help="path to a pack .json file")
    ap.add_argument("--name", help="name for the pack (default: from the pack, or the file name)")
    ap.add_argument("--dry-run", action="store_true", help="check only; change nothing")
    ap.add_argument("--replace", action="store_true", help="overwrite an earlier version of the same pack")
    ap.add_argument("--remove", metavar="NAME", help="remove a homebrew pack")
    ap.add_argument("--list", action="store_true", help="list homebrew packs")
    a = ap.parse_args()
    if a.list:
        return cmd_list()
    if a.remove:
        return cmd_remove(a.remove)
    if not a.pack:
        ap.print_help()
        return 1
    return cmd_add(a.pack, a.name, a.dry_run, a.replace)


if __name__ == "__main__":
    sys.exit(main())

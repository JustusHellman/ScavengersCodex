#!/usr/bin/env python3
"""Writes catalog.json: a small list of every creature, material and item (base and homebrew),
for DnDocs to link entries to the codex without downloading all the data.
The deploy workflow runs it, so the published catalog always matches the data.
Usage: python3 tools/catalog.py [output path]"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import codexdata

ROOT = codexdata.ROOT

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "catalog.json")
    allp = codexdata.packs()
    packs = {n: {"title": (d.get("homebrew") or {}).get("title") or n, "default": bool((d.get("homebrew") or {}).get("default"))} for n, (_, d) in allp.items()}
    origin = {}
    for n, (f, _) in allp.items(): origin[f] = n
    things, monsters = {}, {}
    for f, d in codexdata.load("all"):
        pack = origin.get(f)
        for key, kind in (("materials", "material"), ("items", "item")):
            for t in d.get(key, []):
                if t.get("extend") or not t.get("id"): continue
                e = {"id": t["id"], "name": t["name"], "kind": kind, "tier": t.get("tier")}
                if kind == "item" and t.get("cat"): e["cat"] = t["cat"]
                if t.get("aka"): e["aka"] = t["aka"]
                if pack: e["pack"] = pack
                things[t["id"]] = e
        for m in d.get("monsters", []):
            if m.get("extend") or not m.get("id"): continue
            e = {"id": m["id"], "name": m["name"], "type": m.get("type"), "size": m.get("size"), "cr": m.get("cr")}
            if m.get("aka"): e["aka"] = m["aka"]
            if pack: e["pack"] = pack
            monsters[m["id"]] = e
    aliases = codexdata.read(os.path.join(ROOT, "aliases.json")) if os.path.exists(os.path.join(ROOT, "aliases.json")) else {}
    cat = {"v": 1, "packs": packs, "aliases": {"things": aliases.get("things") or {}, "monsters": aliases.get("monsters") or {}},
           "things": sorted(things.values(), key=lambda e: e["name"].lower()), "monsters": sorted(monsters.values(), key=lambda e: e["name"].lower())}
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(cat, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {os.path.relpath(out, ROOT)}: {len(monsters)} creatures, {len(things)} materials and items, {os.path.getsize(out) // 1024} KB")

if __name__ == "__main__":
    main()

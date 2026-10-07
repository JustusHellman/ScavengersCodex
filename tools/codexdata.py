"""Shared loader for The Scavenger's Codex data.

The base codex lives in data/*.json. Homebrew packs live in homebrew/*.json, one file per pack,
each starting with a "homebrew" header ({"name", "title", "desc", "default", "requires", ...}).
homebrew/index.json lists the packs for the website; write_index() regenerates it.
"""
import json, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def base_files(root=ROOT):
    return [f for f in sorted(glob.glob(os.path.join(root, "data", "*.json"))) if os.path.basename(f) != "manifest.json"]

def pack_files(root=ROOT):
    return [f for f in sorted(glob.glob(os.path.join(root, "homebrew", "*.json"))) if os.path.basename(f) != "index.json"]

def read(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)

def packs(root=ROOT):
    """{name: (path, data)} for every pack file."""
    out = {}
    for f in pack_files(root):
        d = read(f)
        name = ((d.get("homebrew") or {}).get("name")) or os.path.splitext(os.path.basename(f))[0]
        out[name] = (f, d)
    return out

def with_requires(names, allp):
    """The packs named plus everything they need, in a safe load order."""
    order, seen = [], set()
    def visit(n):
        if n in seen or n not in allp: return
        seen.add(n)
        for r in (allp[n][1].get("homebrew") or {}).get("requires", []) or []: visit(r)
        order.append(n)
    for n in names: visit(n)
    return order

def load(which="all", root=ROOT):
    """[(path, data)] for the base plus the chosen packs: "all", "none", "default" or a list of names."""
    allp = packs(root)
    if which == "all": names = list(allp)
    elif which == "none": names = []
    elif which == "default": names = [n for n, (_, d) in allp.items() if (d.get("homebrew") or {}).get("default")]
    else: names = list(which)
    return [(f, read(f)) for f in base_files(root)] + [allp[n] for n in with_requires(names, allp)]

def merged(parts):
    """things, monsters, envs, cultivation with every "extend" entry applied (dupes skipped)."""
    things, mons, envs, grow, mext, eext = {}, {}, {}, [], [], []
    for f, d in parts:
        fn = os.path.basename(f)
        for k in ("materials", "items"):
            for t in d.get(k, []): t["_k"] = k; t["_f"] = fn; things[t["id"]] = t
        for m in d.get("monsters", []):
            if m.get("extend"): mext.append(m)
            else: m["_f"] = fn; mons[m["id"]] = m
        for e in d.get("environments", []):
            if e.get("extend"): eext.append(e)
            else: envs[e["id"]] = e
        grow += d.get("cultivation", [])
    for m in mext:
        if m["id"] in mons:
            have = {h["m"] for h in mons[m["id"]].get("harvest", [])}
            mons[m["id"]] = {**mons[m["id"]], "harvest": mons[m["id"]].get("harvest", []) + [h for h in m.get("harvest", []) if h["m"] not in have]}
    for e in eext:
        if e["id"] in envs:
            have = {g["m"] for g in envs[e["id"]].get("gather", [])}
            envs[e["id"]] = {**envs[e["id"]], "gather": envs[e["id"]].get("gather", []) + [g for g in e.get("gather", []) if g["m"] not in have]}
    return things, mons, envs, grow

def index_entry(path, d):
    h = d.get("homebrew") or {}
    count = lambda k: len([x for x in d.get(k, []) if not x.get("extend")])
    return {"file": os.path.basename(path), "name": h.get("name") or os.path.splitext(os.path.basename(path))[0],
            "title": h.get("title") or h.get("name"), "desc": h.get("desc", ""), "default": bool(h.get("default")),
            "requires": h.get("requires", []) or [], "version": h.get("version", 1),
            "counts": {k: count(k) for k in ("items", "materials", "monsters") if count(k)}}

def write_index(root=ROOT, out_dir=None):
    entries = [index_entry(f, d) for f, d in ((f, read(f)) for f in pack_files(root))]
    entries.sort(key=lambda e: (not e["default"], e["title"].lower()))
    out = os.path.join(out_dir or os.path.join(root, "homebrew"), "index.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump({"packs": entries}, fh, indent=1, ensure_ascii=False)
    return entries

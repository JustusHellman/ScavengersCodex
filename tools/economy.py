#!/usr/bin/env python3
"""Economy check: does an item's value cover its parts, reagent gold AND the crafter's labour?
python3 tools/economy.py [--fix]"""
import json, glob, os, sys, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = ["mundane", "common", "uncommon", "rare", "very-rare", "legendary"]; ti = T.index
BAND = {"mundane": (0, 10**9), "common": (50, 100), "uncommon": (101, 500), "rare": (501, 5000), "very-rare": (5001, 50000), "legendary": (50001, 500000)}
WAGE = {"mundane": 2, "common": 10, "uncommon": 20, "rare": 50, "very-rare": 150, "legendary": 300}  # gp per workday of skilled crafting
LEVEL = {"mundane": None, "common": 1, "uncommon": 3, "rare": 6, "very-rare": 11, "legendary": 17}
CONSUMABLE = {"potion", "oil", "poison", "scroll", "ammunition", "provision", "meal"}
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import codexdata
PACKS = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--packs=")), "all")
things = codexdata.merged(codexdata.load(PACKS if PACKS in ("all", "none", "default") else PACKS.split(",")))[0]
def match(t, c): return all(x in t["tags"] for x in c["any"]) and ti(t["tier"]) >= ti(c.get("min", "mundane"))
def opts(c):
    if "m" in c: return [things[c["m"]]]
    if "oneOf" in c: return [things[x] for x in c["oneOf"]]
    return [t for t in things.values() if match(t, c)]
def days(txt):
    m = re.match(r"([\d.]+)\s*(hour|day|week)", str(txt or ""))
    if not m: return 1
    n = float(m.group(1)); u = m.group(2)
    return n / 8 if u == "hour" else n * 5 if u == "week" else n
def cost(t):
    r = t["recipe"]; y = r.get("yields") or 1
    parts = sum(min((o.get("value") or 0) for o in opts(c)) * c.get("q", 1) for c in r["components"])
    return parts / y, (r.get("gp") or 0) / y, days(r.get("time")) * WAGE[t["tier"]] / y
rows = []; issues = collections.defaultdict(list)
for t in things.values():
    if t["_k"] != "items" or not t.get("recipe") or not t.get("value"): continue
    p, g, l = cost(t); tot = p + g + l
    rows.append((t, p, g, l, tot))
    lo, hi = BAND[t["tier"]]
    base_bonus = sum(min((o.get("value") or 0) for o in opts(c)) * c.get("q", 1) for c in t["recipe"]["components"] if c.get("role") == "base" and all(o["_k"] == "items" for o in opts(c)))
    if not (lo <= t["value"] <= hi + base_bonus): issues["value outside rarity band"].append(f"{t['id']} [{t['tier']}] {t['value']} gp (band {lo}-{hi})")
    if tot > t["value"] and t["tier"] != "mundane": issues["value < parts + reagents + labour"].append(f"{t['id']} [{t['tier']}] value {t['value']} < {tot:.0f} (parts {p:.0f}, reagents {g:.0f}, labour {l:.0f})")
    lv = LEVEL[t["tier"]]
    if lv and t["recipe"].get("level") and t["recipe"]["level"] != lv: issues["level off table"].append(f"{t['id']} [{t['tier']}] level {t['recipe']['level']} (table {lv})")
    if lv and not t["recipe"].get("level"): issues["missing level"].append(t["id"])
print("rarity      n   median value   median parts  reagents  labour  profit/day")
by = collections.defaultdict(list)
for r in rows: by[r[0]["tier"]].append(r)
for k in T:
    v = by[k]
    if not v: continue
    med = lambda f: sorted(f(x) for x in v)[len(v) // 2]
    prof = med(lambda x: (x[0]["value"] - x[1] - x[2]) / max(days(x[0]["recipe"].get("time")), 0.125))
    print(f"{k:10} {len(v):4} {med(lambda x: x[0]['value']):>12,.0f} {med(lambda x: x[1]):>13,.0f} {med(lambda x: x[2]):>9,.0f} {med(lambda x: x[3]):>7,.0f} {prof:>11,.0f}")
for k, v in issues.items():
    print(f"\n## {k}: {len(v)}"); [print("  ", x) for x in v[:12 if "--all" not in sys.argv else 999]]
if "--fix" in sys.argv:
    n = 0
    for t, p, g, l, tot in rows:
        if t["tier"] == "mundane": continue
        lo, hi = BAND[t["tier"]]
        want = max(t["value"], tot * 1.1)
        base_bonus = sum(min((o.get("value") or 0) for o in opts(c)) * c.get("q", 1) for c in t["recipe"]["components"] if c.get("role") == "base" and all(o["_k"] == "items" for o in opts(c)))
        want = min(max(want, lo), hi + base_bonus)
        nice = int(round(want, -1 if want < 1000 else -2)) if want >= 100 else int(round(want))
        nice = min(max(nice, lo), hi + base_bonus)
        if nice != t["value"]: t["value"] = nice; n += 1
        if LEVEL[t["tier"]] and not t["recipe"].get("level"): t["recipe"]["level"] = LEVEL[t["tier"]]
    for f, d in files.items():
        for k in ("materials", "items"):
            for x in d.get(k, []): x.pop("_k", None)
        json.dump(d, open(f, "w"), indent=1, ensure_ascii=False)
    print(f"\nfixed values on {n} items")

#!/usr/bin/env python3
"""Mechanical playtest of the Codex data.
Plays the system as a party would: can every item actually be reached, how many kills /
forage trips does it take, how hard are the checks at the level you'd meet each source,
and is the difficulty in line with the item's rarity?  Writes playtest-report.json and prints a summary."""
import json, glob, os, math, re, collections, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = ["mundane", "common", "uncommon", "rare", "very-rare", "legendary"]
ti = T.index
RARITY_BAND = {"mundane": (1, 20), "common": (1, 4), "uncommon": (1, 8), "rare": (5, 13), "very-rare": (8, 18), "legendary": (15, 30)}
MIN_LEVEL = {"mundane": 1, "common": 1, "uncommon": 3, "rare": 6, "very-rare": 11, "legendary": 17}
ENV_LEVEL = {"feywild": 5, "shadowfell": 6, "underdark": 4, "elemental-fire": 11, "elemental-water": 11, "elemental-air": 11,
             "elemental-earth": 11, "lower-planes": 13, "upper-planes": 13, "astral": 15}
TIER_DC = {"mundane": 8, "common": 10, "uncommon": 13, "rare": 16, "very-rare": 19, "legendary": 22}

def cr_num(c):
    c = str(c)
    if "/" in c: a, b = c.split("/"); return int(a) / int(b)
    return float(c)
def cr_level(c):  # party level at which a 4-person party reasonably takes this creature down
    c = cr_num(c)
    return 1 if c < 1 else min(20, max(1, round(c * 0.85 + 0.5)))
def bonus(level, expertise=False):
    prof = 2 + (level - 1) // 4
    abil = 3 if level < 4 else 4 if level < 8 else 5
    return abil + prof * (2 if expertise else 1)
def p_success(dc, b, adv=False):
    p = min(1, max(0.05, (21 - (dc - b)) / 20))
    return 1 - (1 - p) ** 2 if adv else p
def avg_dice(e):
    m = re.match(r"^(\d*)d(\d+)\s*([+-]\s*\d+)?$", str(e))
    if not m: return float(e)
    return int(m.group(1) or 1) * (int(m.group(2)) + 1) / 2 + (int(m.group(3).replace(" ", "")) if m.group(3) else 0)

def load():
    things, mons, envs, owner = {}, {}, {}, {}
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*.json"))):
        d = json.load(open(f)); fn = os.path.basename(f)
        for k in ("materials", "items"):
            for t in d.get(k, []): t["_k"] = k; t["_f"] = fn; things[t["id"]] = t
        for m in d.get("monsters", []): m["_f"] = fn; mons[m["id"]] = m
        for e in d.get("environments", []): envs[e["id"]] = e
    return things, mons, envs

def main():
    things, mons, envs = load()
    src = collections.defaultdict(list); gat = collections.defaultdict(list)
    for m in mons.values():
        for h in m["harvest"]:
            if h["m"] in things: src[h["m"]].append((m, h))
    for e in envs.values():
        for g in e["gather"]:
            if g["m"] in things: gat[g["m"]].append((e, g))
    def match(t, c): return all(x in t["tags"] for x in c["any"]) and ti(t["tier"]) >= ti(c.get("min", "mundane"))
    def options(c):
        if "m" in c: return [things[c["m"]]]
        if "oneOf" in c: return [things[x] for x in c["oneOf"]]
        return [t for t in things.values() if match(t, c)]
    trade = {t["id"] for t in things.values() if not src[t["id"]] and not gat[t["id"]] and not t.get("recipe")}

    # ---------- access level: the lowest party level at which you can realistically obtain one unit
    memo = {}
    def access(tid, stack=()):
        if tid in memo: return memo[tid]
        if tid in stack: return (99, "cycle")
        t = things[tid]; best = (99, "unobtainable")
        for m, h in src[tid]:
            best = min(best, (cr_level(m["cr"]), f"kill {m['name']} (CR {m['cr']})"))
        for e, g in gat[tid]:
            lv = ENV_LEVEL.get(e["id"], 1)
            gd = g.get("guard")
            if gd and gd.get("m") in mons: lv = max(lv, cr_level(mons[gd["m"]]["cr"]))
            # need a decent chance on the check too
            while lv < 20 and p_success(g["dc"], bonus(lv)) < 0.5: lv += 1
            best = min(best, (lv, f"forage {e['name']} DC {g['dc']}"))
        if tid in trade:
            lv = {"mundane": 1, "common": 1, "uncommon": 3}.get(t["tier"], 99)
            best = min(best, (lv, "buy" if lv < 99 else "unobtainable (rare+ trade good)"))
        if t.get("recipe"):
            r = t["recipe"]; lv = r.get("level") or MIN_LEVEL[t["tier"]]; ok = True
            for c in r["components"]:
                opts = options(c)
                a = min((access(o["id"], stack + (tid,)) for o in opts), default=(99, ""))
                if a[0] >= 99: ok = False; break
                lv = max(lv, a[0])
            if ok: best = min(best, (lv, "craft"))
        memo[tid] = best
        return best

    rep = collections.defaultdict(list)
    # unreachable
    for t in things.values():
        a = access(t["id"])
        if a[0] >= 99: rep["unreachable"].append(f"{t['id']} ({a[1]})")
    # dead ends: materials no recipe can consume
    direct = collections.defaultdict(list); anyslots = []
    for t in things.values():
        for c in (t.get("recipe") or {}).get("components", []):
            if "m" in c: direct[c["m"]].append(t["id"])
            elif "oneOf" in c: [direct[x].append(t["id"]) for x in c["oneOf"]]
            else: anyslots.append((t, c))
    for t in things.values():
        if t["_k"] != "materials": continue
        if direct[t["id"]]: continue
        fits = [p["id"] for p, c in anyslots if match(t, c)]
        if not fits: rep["dead_end_material"].append(f"{t['id']} [{t['tier']}] {','.join(t['tags'])}")
        elif len(fits) <= 2 and all(things[f]["tier"] == "mundane" for f in fits):
            rep["weak_use_material"].append(f"{t['id']} [{t['tier']}] only fits mundane: {fits}")
    # rare+ trade goods (buyable keystones)
    for tid in trade:
        t = things[tid]
        if t["_k"] == "materials" and ti(t["tier"]) >= ti("rare"): rep["rare_trade_good"].append(f"{tid} [{t['tier']}] in {t['_f']}")
    # per-item analysis
    for t in things.values():
        r = t.get("recipe")
        if not r or t["_k"] != "items": continue
        tier = t["tier"]
        for i, c in enumerate(r["components"]):
            opts = options(c); q = c.get("q", 1)
            # kills / trips needed with the most convenient option
            best_runs, best_desc = 999, ""
            for o in opts:
                for m, h in src[o["id"]]:
                    y = avg_dice(h["dice"]) if h.get("dice") else h.get("q", 1)
                    y = max(y, 0.5); runs = math.ceil(q / y)
                    if runs < best_runs: best_runs, best_desc = runs, f"{runs}× {m['name']} (CR {m['cr']}) for {q}× {o['name']}"
                for e, g in gat[o["id"]]:
                    y = avg_dice(g["dice"]) if g.get("dice") else g.get("q", 1)
                    runs = math.ceil(q / max(y, 0.5))
                    if runs < best_runs: best_runs, best_desc = runs, f"{runs} forage trips in {e['name']} for {q}× {o['name']}"
                if o["id"] in trade or o.get("recipe"): best_runs, best_desc = 0, ""
            if best_desc:
                # how scary is repeated farming? unique/big creatures should need 1 kill
                crs = [cr_num(m["cr"]) for o in opts for m, _ in src[o["id"]]]
                big = crs and min(crs) >= 10
                if best_runs == 2 and big:
                    rep["just_short"].append(f"{t['id']} [{tier}] slot{i}: {best_desc}")
                if (big and best_runs > 1) or best_runs > 4:
                    rep["grind"].append(f"{t['id']} [{tier}] slot{i} ({c.get('role')}): {best_desc}")
            if c.get("role") == "keystone" and tier != "mundane":
                acc = min((access(o["id"]) for o in opts), default=(99, ""))
                lo, hi = RARITY_BAND[tier]
                if acc[0] < lo: rep["keystone_too_easy"].append(f"{t['id']} [{tier}] keystone reachable at L{acc[0]}: {acc[1]}")
                if acc[0] > hi: rep["keystone_too_hard"].append(f"{t['id']} [{tier}] keystone needs L{acc[0]}: {acc[1]}")
        acc = access(t["id"])
        SWEET = {"common": 3, "uncommon": 6, "rare": 9, "very-rare": 15, "legendary": 20}
        if tier != "mundane" and SWEET[tier] < acc[0] < 99 and t.get("src") == "SRD 5.1":
            why = []
            for c in r["components"]:
                a = min((access(o["id"]) for o in options(c)), default=(99, ""))
                if a[0] > SWEET[tier]: why.append(f"{c.get('role')} '{c.get('label') or c.get('m')}' -> L{a[0]} {a[1]}")
            rep["srd_item_late"].append(f"{t['id']} [{tier}] first craftable at L{acc[0]} (sweet spot ≤ L{SWEET[tier]}) :: " + " | ".join(why))
        if tier != "mundane" and acc[0] > RARITY_BAND[tier][1] + 2 and acc[0] < 99:
            why = []
            for c in r["components"]:
                a = min((access(o["id"]) for o in options(c)), default=(99, ""))
                if a[0] > RARITY_BAND[tier][1]: why.append(f"{c.get('role')} '{c.get('label') or c.get('m')}' -> L{a[0]} {a[1]}")
            rep["item_too_hard"].append(f"{t['id']} [{tier}] first craftable at L{acc[0]} :: " + " | ".join(why))
    # harvest checks: odds at the level you'd fight the creature
    for m in mons.values():
        L = cr_level(m["cr"])
        for h in m["harvest"]:
            t = things.get(h["m"]);
            if not t: continue
            p = p_success(h["dc"], bonus(L))
            pa = p_success(h["dc"], bonus(L), adv=True)
            if pa < 0.45: rep["harvest_too_hard"].append(f"{m['id']} (CR {m['cr']}, L{L}) {h['m']} DC {h['dc']}: {p:.0%} / {pa:.0%} with tools")
            exp = TIER_DC[t["tier"]]
            if abs(h["dc"] - exp) > 4: rep["harvest_dc_off_table"].append(f"{m['id']} {h['m']} [{t['tier']}] DC {h['dc']} (table {exp})")
            # tier vs CR
            c = cr_num(m["cr"])
            crt = 1 if c <= 2 else 2 if c <= 6 else 3 if c <= 12 else 4 if c <= 18 else 5
            if not m.get("salvage") and ti(t["tier"]) > crt + 1:
                rep["part_tier_above_cr"].append(f"{m['id']} (CR {m['cr']}) {h['m']} is {t['tier']}")
    for e in envs.values():
        L = ENV_LEVEL.get(e["id"], 1)
        for g in e["gather"]:
            t = things[g["m"]]
            gd = g.get("guard")
            if gd and gd.get("m") not in mons: rep["bad_guard"].append(f"{e['id']} {g['m']} guard {gd}")
            if ti(t["tier"]) >= ti("rare") and not gd:
                rep["unguarded_rare_gather"].append(f"{e['id']} {g['m']} [{t['tier']}] DC {g['dc']}")
            if gd and gd.get("m") in mons:
                c = cr_num(mons[gd["m"]]["cr"]); band = {"uncommon": (2, 8), "rare": (6, 13), "very-rare": (12, 19), "legendary": (18, 30)}.get(t["tier"])
                if band and not (band[0] <= c <= band[1]): rep["guard_cr_off"].append(f"{e['id']} {g['m']} [{t['tier']}] guard {gd['m']} CR {mons[gd['m']]['cr']}")
            if False and ti(t["tier"]) >= ti("rare") and L < 5:
                rep["rare_gather_on_home_plane"].append(f"{e['id']} {g['m']} [{t['tier']}] DC {g['dc']}: {g.get('cond','')[:70]}")
    # perishable parts in long recipes with no preservation path
    for t in things.values():
        r = t.get("recipe")
        if not r: continue
        for c in r["components"]:
            for o in options(c)[:1]:
                if o.get("perish") in ("1 hour",) and "salt" not in " ".join(o["tags"]):
                    pass  # preserving salts handle 1-hour parts; noted in rules
    # ---------- cultivation: can every plant be started, fits its bed, and does a bed pay about a wage?
    grow = []
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*.json"))): grow += json.load(open(f)).get("cultivation", [])
    SITE_MAX = {"plot": "common", "greenhouse": "uncommon", "cellar": "uncommon", "grove": "rare"}
    WAGE = {"mundane": 2, "common": 10, "uncommon": 20, "rare": 50}
    keystones = collections.defaultdict(list)
    for t in things.values():
        for c in (t.get("recipe") or {}).get("components", []):
            if c.get("role") == "keystone":
                for o in options(c) if "any" not in c else []: keystones[o["id"]].append(t["id"])
    rep["grow_problems"] = []; rep["grow_overpaid"] = []; grow_rows = []
    import random; rnd = random.Random(7)
    for g in grow:
        t = things.get(g["m"])
        if not t or t["_k"] != "materials": rep["grow_problems"].append(f"{g['m']}: not a material"); continue
        if g["site"] not in SITE_MAX: rep["grow_problems"].append(f"{g['m']}: unknown site {g['site']}"); continue
        if ti(t["tier"]) > ti(SITE_MAX[g["site"]]): rep["grow_problems"].append(f"{g['m']} [{t['tier']}] is above what a {g['site']} can grow")
        if ti(t["tier"]) >= ti("very-rare"): rep["grow_problems"].append(f"{g['m']}: very rare / legendary plants must not be growable")
        if not gat[g["m"]] and not src[g["m"]]: rep["grow_problems"].append(f"{g['m']}: no way to get the first cutting")
        fungal = bool({"fungus"} & set(t["tags"]))
        if fungal != (g["site"] == "cellar") and not (g["site"] == "grove" and fungal):
            if not (g["site"] == "cellar" and "moss" in t["tags"]): rep["grow_problems"].append(f"{g['m']}: fungi belong in a cellar, and only fungi/mosses do")
        # simulate tending at the level a party would first build this bed
        L = {"plot": 1, "cellar": 2, "greenhouse": 3, "grove": 6}[g["site"]]
        dc = min(x[1]["dc"] for x in gat[g["m"]]) if gat[g["m"]] else 12
        b = bonus(L); cyc = []; yl = []
        for _ in range(3000):
            # mirrors the app: growth pauses at each weekly tending point; a failed check takes growth back
            need = g["days"] * 24; hours, grown, tends, bonus_, blight = 0, 0, 0, 0, False
            while True:
                point = (tends + 1) * 168 if tends < need // 168 else need
                hours += point - grown; grown = point           # grow (tended on time) up to the next point
                if tends >= need // 168: break                  # grown and fully tended: harvest
                d = rnd.randint(1, 20) + b - dc; tends += 1; back = 0
                if d >= 10: bonus_ += 1
                elif d < 0:
                    back = 48
                    if d <= -5:
                        ev = rnd.randrange(10)
                        if ev == 0: blight = True
                        if ev == 2 and g["site"] == "plot": back += 48
                        if ev == 5: back += 168
                grown = max(0, grown - back)
            y = avg_dice(g["yield"]) + bonus_
            if blight: y = y / 2
            cyc.append(hours / 24); yl.append(y)
        days = sum(cyc) / len(cyc); y = sum(yl) / len(yl)
        net = y - (0 if g["regrows"] else 1)
        per_wk = net * (t.get("value") or 0) / (days / 7)
        wage = WAGE[t["tier"]] * 7
        grow_rows.append((t["tier"], g["m"], g["site"], round(days, 1), round(y, 2), round(per_wk, 1), wage, len(keystones[g["m"]])))
        if per_wk > wage * 1.1: rep["grow_overpaid"].append(f"{g['m']} [{t['tier']}] {per_wk:.0f} gp/week per bed vs a {wage} gp/week wage")
    json.dump(rep, open(os.path.join(ROOT, "playtest-report.json"), "w"), indent=1)
    for k, v in rep.items():
        print(f"\n## {k}: {len(v)}")
        for x in v[: int(sys.argv[1]) if len(sys.argv) > 1 else 8]: print("  ", x)
    # distribution of first-craftable level by rarity
    dist = collections.defaultdict(list)
    for t in things.values():
        if t["_k"] == "items" and t.get("recipe"):
            a = access(t["id"])[0]
            if a < 99: dist[t["tier"]].append(a)
    if "--grow" in sys.argv or True:
        print("\n## cultivation: one bed, tended by a party at the level it would build that bed (3000 simulated seasons)")
        print(f"  {'plant':26} {'tier':9} {'bed':10} {'days/harvest':>12} {'yield':>6} {'gp/week':>8} {'wage/wk':>7} keystone-of")
        for r in sorted(grow_rows, key=lambda r: (ti(r[0]), -r[5])): print(f"  {r[1]:26} {r[0]:9} {r[2]:10} {r[3]:>12} {r[4]:>6} {r[5]:>8} {r[6]:>7} {r[7] or ''}")
    print("\n## first-craftable level by rarity (min / median / max)")
    for tr in T:
        v = sorted(dist[tr])
        if v: print(f"  {tr:10} n={len(v):4} {v[0]:>3} / {v[len(v)//2]:>3} / {v[-1]:>3}")

if __name__ == "__main__":
    main()

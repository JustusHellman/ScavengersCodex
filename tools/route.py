#!/usr/bin/env python3
"""Plan the easiest route to craft an item: python3 tools/route.py <item-id> [party-level]"""
import json, glob, os, sys, math, re, collections
sys.path.insert(0, os.path.dirname(__file__))
from playtest import load, cr_num, cr_level, bonus, p_success, avg_dice, ENV_LEVEL, T, ti
things, mons, envs = load()
src = collections.defaultdict(list); gat = collections.defaultdict(list)
for m in mons.values():
    for h in m["harvest"]: src[h["m"]].append((m, h))
for e in envs.values():
    for g in e["gather"]: gat[g["m"]].append((e, g))
def match(t, c): return all(x in t["tags"] for x in c["any"]) and ti(t["tier"]) >= ti(c.get("min", "mundane"))
def opts(c):
    if "m" in c: return [things[c["m"]]]
    if "oneOf" in c: return [things[x] for x in c["oneOf"]]
    return [t for t in things.values() if match(t, c)]
def ways(t, L):
    out = []
    for m, h in src[t["id"]]:
        lv = cr_level(m["cr"]); y = avg_dice(h["dice"]) if h.get("dice") else h.get("q", 1)
        out.append((lv, f"slay {m['name']} (CR {m['cr']}, {'/'.join(m.get('env', [])[:2])}) → {h['skill']} DC {h['dc']} ({p_success(h['dc'], bonus(max(L, lv)), True):.0%} w/ tools), ~{y:g} per kill, keeps {t.get('perish','stable')}"))
    for e, g in gat[t["id"]]:
        lv = ENV_LEVEL.get(e["id"], 1); gd = g.get("guard"); gtxt = ""
        if gd and gd["m"] in mons: lv = max(lv, cr_level(mons[gd["m"]]["cr"])); gtxt = f", guarded by {mons[gd['m']]['name']} (CR {mons[gd['m']]['cr']})"
        out.append((lv, f"forage {e['name']} → {g['skill']} DC {g['dc']} ({p_success(g['dc'], bonus(max(L, lv)))*1:.0%}){gtxt}; {g.get('cond','')[:80]}"))
    if not src[t["id"]] and not gat[t["id"]] and not t.get("recipe"): out.append((1 if ti(t["tier"]) < 3 else 99, f"buy (~{t.get('value')} gp)"))
    if t.get("recipe"): out.append((max(1, t["recipe"].get("level") or 1), f"craft it ({t['recipe'].get('time')}, DC {t['recipe'].get('dc')})"))
    return sorted(out)
def plan(iid, L):
    t = things[iid]; r = t["recipe"]
    print(f"\n=== {t['name']} [{t['tier']}] — craft DC {r['dc']}, {r['time']}, {r.get('gp')} gp reagents, min level {r.get('level','-')}, tools {', '.join(r.get('tools',[]))}, station {r.get('station')}")
    if r.get("spells"): print("    spells:", " or ".join(r["spells"]))
    worst = 1
    for c in r["components"]:
        best = None
        for o in opts(c):
            w = ways(o, L)
            if w and (best is None or w[0][0] < best[0]): best = (w[0][0], o, w[0][1])
        worst = max(worst, best[0] if best else 99)
        lbl = c.get("label") or (things[c["m"]]["name"] if "m" in c else "")
        print(f"  {c.get('role','?'):10} {c.get('q',1)}× {lbl:38.38} → L{best[0] if best else '??'}: {best[1]['name'] if best else ''}: {best[2] if best else 'NO ROUTE'}")
    print(f"  ⇒ reachable from about level {worst}")
if __name__ == "__main__":
    L = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    for iid in sys.argv[1].split(","): plan(iid, L)

#!/usr/bin/env python3
"""Validate Scavenger's Codex data. Usage: python3 tools/validate.py [file ...]
With no args validates everything in data/. With args, only reports problems in those files,
but resolves references against all files in data/."""
import json, sys, glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIERS = ["mundane", "common", "uncommon", "rare", "very-rare", "legendary"]
FORM = "hide fur scale carapace shell feather wing bone skull horn tooth claw stinger eye heart blood ichor venom gland organ brain tongue sinew meat fat hair tentacle silk slime core ash dust essence ectoplasm crystal stone metal ore ingot gem pearl coral salt sand ice oil resin sap wood bark leaf flower root fungus moss vine seed fruit herb ink wax thread cloth leather glass vessel salvage relic reagent food liquid".split()
AURA = "fire cold lightning thunder acid poison necrotic radiant psychic force arcane primal fey shadow celestial fiendish infernal abyssal elemental earth air water".split()
TRAIT = "stealth flight swimming climbing burrowing speed strength toughness regeneration senses darkvision truesight charm fear illusion invisibility petrification paralysis telepathy breathing resistance shapechange luck sleep healing light storm antimagic sound teleport death undeath blessing curse madness disease growth size domination knowledge protection binding time planar cunning".split()
ITEMT = "weapon armor shield sword axe hammer bludgeon polearm bow crossbow dagger spear ammunition light-armor medium-armor heavy-armor potion scroll ring rod staff wand wondrous tool gear clothing jewelry container instrument focus poison food".split()
CTYPES = "aberration beast celestial construct dragon elemental fey fiend giant humanoid monstrosity ooze plant undead".split()
TAGS = set(FORM + AURA + TRAIT + ITEMT + CTYPES)
TOOLS = set("alchemists-supplies brewers-supplies calligraphers-supplies carpenters-tools cartographers-tools cobblers-tools cooks-utensils glassblowers-tools herbalism-kit jewelers-tools leatherworkers-tools masons-tools painters-supplies potters-tools smiths-tools tinkers-tools weavers-tools woodcarvers-tools poisoners-kit harvesting-kit".split())
STATIONS = set("none campfire forge alchemy-lab tannery workshop loom jewelers-bench scriptorium enchanting-circle shrine kitchen glassworks".split())
ENVS = set("arctic coast desert forest grassland hill mountain swamp underdark underwater urban ruins feywild shadowfell elemental-fire elemental-water elemental-air elemental-earth lower-planes upper-planes astral".split())
CATS = set("weapon armor ammunition potion oil poison scroll ring rod staff wand wondrous gear tool provision".split())
SKILLS = set("Survival Medicine Nature Arcana Religion Investigation".split())
SIZES = set("Tiny Small Medium Large Huge Gargantuan".split())
ROLES = set("base keystone supporting binding".split())
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

def load_all():
    out = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*.json"))):
        try:
            with open(f) as fh:
                out[f] = json.load(fh)
        except Exception as e:
            print(f"FATAL {os.path.basename(f)}: invalid JSON: {e}")
            out[f] = {}
    return out

def main():
    data = load_all()
    only = set(os.path.abspath(a) for a in sys.argv[1:]) or set(data)
    things, owner, monsters, mowner = {}, {}, {}, {}
    errs = []
    def err(f, msg):
        if f in only: errs.append(f"{os.path.basename(f)}: {msg}")
    for f, d in data.items():
        for key in ("materials", "items"):
            for t in d.get(key, []):
                i = t.get("id")
                if i in things: err(f, f"duplicate id '{i}' (also in {os.path.basename(owner[i])})")
                things[i] = t; owner[i] = f; t["_kind"] = key
        for m in d.get("monsters", []):
            i = m.get("id")
            if i in monsters: err(f, f"duplicate monster id '{i}'")
            monsters[i] = m; mowner[i] = f
    def tier_ok(t): return t in TIERS
    def check_recipe(f, tid, r, rarity, is_item):
        comps = r.get("components") or []
        if not comps: err(f, f"{tid}: recipe has no components")
        keys = 0
        for c in comps:
            if c.get("role") not in ROLES: err(f, f"{tid}: bad role {c.get('role')}")
            if c.get("role") == "keystone": keys += 1
            if "m" in c:
                if c["m"] not in things: err(f, f"{tid}: unknown component id '{c['m']}'")
            elif "any" in c:
                bad = [x for x in c["any"] if x not in TAGS]
                if bad: err(f, f"{tid}: unknown tags in any-slot {bad}")
                if "min" in c and not tier_ok(c["min"]): err(f, f"{tid}: bad min tier {c['min']}")
                if not c.get("label"): err(f, f"{tid}: any-slot missing label")
            elif "oneOf" in c:
                for x in c["oneOf"]:
                    if x not in things: err(f, f"{tid}: unknown oneOf id '{x}'")
                if not c.get("label"): err(f, f"{tid}: oneOf-slot missing label")
            else: err(f, f"{tid}: slot without m/any/oneOf")
            if not isinstance(c.get("q", 1), (int, float)): err(f, f"{tid}: q must be number")
        for tl in r.get("tools", []):
            if tl not in TOOLS: err(f, f"{tid}: unknown tool '{tl}'")
        if r.get("station", "none") not in STATIONS: err(f, f"{tid}: unknown station '{r.get('station')}'")
        for c in comps:
            if c.get("role") == "keystone" and is_item and rarity != "mundane":
                ids = [c["m"]] if "m" in c else c.get("oneOf", [])
                for x in ids:
                    if x in things and TIERS.index(things[x].get("tier", "mundane")) < TIERS.index(rarity):
                        err(f, f"{tid}: keystone option '{x}' ({things[x].get('tier')}) is below item tier {rarity}")
                if "any" in c and TIERS.index(c.get("min", "mundane")) < TIERS.index(rarity):
                    err(f, f"{tid}: any-keystone min '{c.get('min','mundane')}' is below item tier {rarity}")
        if is_item and rarity not in ("mundane",) and keys != 1:
            err(f, f"{tid}: magic item should have exactly 1 keystone (has {keys})")
    for i, t in things.items():
        f = owner[i]
        if not i or not ID_RE.match(i): err(f, f"bad id '{i}'")
        if not tier_ok(t.get("tier")): err(f, f"{i}: bad tier '{t.get('tier')}'")
        bad = [x for x in t.get("tags", []) if x not in TAGS]
        if bad: err(f, f"{i}: unknown tags {bad}")
        if not t.get("name"): err(f, f"{i}: missing name")
        if t["_kind"] == "items":
            if t.get("cat") not in CATS: err(f, f"{i}: bad cat '{t.get('cat')}'")
            if not t.get("effect"): err(f, f"{i}: missing effect")
        elif not t.get("desc"): err(f, f"{i}: missing desc")
        if t.get("recipe"): check_recipe(f, i, t["recipe"], t.get("tier"), t["_kind"] == "items")
        elif t["_kind"] == "items" and t.get("src") != "unobtainable": err(f, f"{i}: item without recipe")
    for i, m in monsters.items():
        f = mowner[i]
        if not ID_RE.match(i or ""): err(f, f"bad monster id '{i}'")
        if m.get("type") not in CTYPES: err(f, f"{i}: bad type {m.get('type')}")
        if m.get("size") not in SIZES: err(f, f"{i}: bad size {m.get('size')}")
        for e in m.get("env", []):
            if e not in ENVS: err(f, f"{i}: unknown env '{e}'")
        if not m.get("harvest"): err(f, f"{i}: no harvest entries")
        for h in m.get("harvest", []):
            if h.get("m") not in things: err(f, f"{i}: harvest unknown material '{h.get('m')}'")
            if h.get("skill") not in SKILLS: err(f, f"{i}: bad skill '{h.get('skill')}'")
            if "dice" in h and not re.match(r"^(\d*d\d+([+-]\d+)?|\d+)$", str(h["dice"])): err(f, f"{i}: harvest '{h.get('m')}' has a bad dice value '{h['dice']}'")
    # An environment id may appear in more than one file only if the later entries say "extend": true.
    # Extensions add finds to an existing place; they never replace it.
    base_env = {}
    for f, d in data.items():
        for e in d.get("environments", []):
            if e.get("extend"): continue
            if e.get("id") in base_env: err(f, f"environment '{e.get('id')}' is already defined in {os.path.basename(base_env[e.get('id')])}; add \"extend\": true to add finds to it")
            base_env.setdefault(e.get("id"), f)
    for f, d in data.items():
        for e in d.get("environments", []):
            if e.get("extend") and e.get("id") not in base_env: err(f, f"environment '{e.get('id')}' extends a place that doesn't exist")
            if e.get("id") not in ENVS: err(f, f"unknown environment id {e.get('id')}")
            for g in e.get("gather", []):
                if g.get("m") not in things: err(f, f"env {e.get('id')}: unknown material '{g.get('m')}'")
                if g.get("skill") not in SKILLS: err(f, f"env {e.get('id')}: bad skill '{g.get('skill')}'")
                if g.get("guard") and g["guard"].get("m") not in monsters: err(f, f"env {e.get('id')}: guard for {g.get('m')} is unknown monster '{g['guard'].get('m')}'")
                if "risk" in g and g["risk"] not in (0, 1, 2, 3): err(f, f"env {e.get('id')}: {g.get('m')} risk must be 0-3")
                for x in g.get("foes", []) + (g.get("guard") or {}).get("alt", []):
                    if x not in monsters: err(f, f"env {e.get('id')}: {g.get('m')} lists unknown creature '{x}'")
    for f, d in data.items():
        for c in d.get("cultivation", []):
            if c.get("m") not in things: err(f, f"cultivation: unknown material '{c.get('m')}'")
            if c.get("site") not in ("plot", "greenhouse", "cellar", "grove"): err(f, f"cultivation {c.get('m')}: bad site '{c.get('site')}'")
            if not re.match(r"^(\d*d\d+([+-]\d+)?|\d+)$", str(c.get("yield", ""))): err(f, f"cultivation {c.get('m')}: bad yield '{c.get('yield')}'")
            if not isinstance(c.get("days"), (int, float)) or c["days"] <= 0: err(f, f"cultivation {c.get('m')}: days must be a positive number")
    # unlock codes store a 29-bit hash of each id, so ids must not collide (mirrors idHash in app.js)
    def id_hash(prefix, i):
        h = 0x811c9dc5
        for ch in prefix + i: h = ((h ^ ord(ch)) * 0x01000193) & 0xffffffff
        return h & 0x1fffffff
    envs_ids = list(dict.fromkeys(e.get("id") for d in data.values() for e in d.get("environments", [])))
    for prefix, ids in (("t:", list(things)), ("c:", list(monsters)), ("p:", envs_ids)):
        seen = {}
        for i in ids:
            h = id_hash(prefix, i)
            if h in seen and seen[h] != i: errs.append(f"code hash collision: '{seen[h]}' and '{i}' (rename one)")
            seen[h] = i
    for e in errs: print(e)
    print(f"--- {len(errs)} problems | {len(things)} things, {len(monsters)} monsters")
    return 1 if errs else 0

if __name__ == "__main__":
    sys.exit(main())

# The Scavenger's Codex — Data Schema & Design Bible

All data lives in `data/*.json`. Every file is a JSON object that may contain any of the arrays
`materials`, `items`, `monsters`, `environments`. Files are merged by the build script.
**IDs are global and unique across ALL files** (materials and items share one namespace).
IDs are lowercase kebab-case ASCII (`dire-wolf-pelt`, `cloak-of-elvenkind`).

Write everything in your OWN words. Never paste SRD/PHB/DMG text. Effects are short paraphrases.

---------------------------------------------------------------------------------------------------
## 1. Tiers (rarity ladder)

`mundane` < `common` < `uncommon` < `rare` < `very-rare` < `legendary`

Monster-part tier from CR (then adjust ±1 by how significant the part is — a dragon's heart is
one step above its claws; an ordinary deer hide is `mundane`):

| CR        | default tier for its *special* parts |
|-----------|---------------------------------------|
| 0 – 2     | common (ordinary hide/meat/bone of mundane beasts = mundane) |
| 3 – 6     | uncommon |
| 7 – 12    | rare |
| 13 – 18   | very-rare |
| 19 +      | legendary |

Harvest DC by tier: mundane 8, common 10, uncommon 13, rare 16, very-rare 19, legendary 22
(±2 for especially delicate/robust parts).

Harvest skills:
- `Survival` — hides, pelts, scales, meat, bone, horn, teeth, claws, feathers
- `Medicine` — organs, blood, glands, eyes, brains, venom sacs
- `Nature` — plants, fungi, minerals, ooze residue, beast oddities
- `Arcana` — magical essences, elemental cores, arcane organs, construct cores
- `Religion` — celestial/fiendish/undead remnants (halos, ichor, grave-dust, soul-stuff)
- `Investigation` — salvaging gear from humanoids/constructs

Perishability (`perish`): `"1 minute"` (essences — need an Essence Vessel), `"1 hour"`
(blood, eyes, brains, most organs), `"1 day"` (hides, pelts, meat, glands), `"1 week"`,
`"stable"` (bone, horn, teeth, scales, shells, minerals, dried herbs, salvage).

---------------------------------------------------------------------------------------------------
## 2. Tags (use ONLY these; the app's "any X" recipe slots match on them)

**Form (what the thing physically is)** — pick 1–2:
hide, fur, scale, carapace, shell, feather, wing, bone, skull, horn, tooth, claw, stinger, eye,
heart, blood, ichor, venom, gland, organ, brain, tongue, sinew, meat, fat, hair, tentacle, silk,
slime, core, ash, dust, essence, ectoplasm, crystal, stone, metal, ore, ingot, gem, pearl, coral,
salt, sand, ice, oil, resin, sap, wood, bark, leaf, flower, root, fungus, moss, vine, seed, fruit,
herb, ink, wax, thread, cloth, leather, glass, vessel, salvage, relic, reagent, food, liquid

**Aura / damage / essence** — 0–3:
fire, cold, lightning, thunder, acid, poison, necrotic, radiant, psychic, force, arcane, primal,
fey, shadow, celestial, fiendish, infernal, abyssal, elemental, earth, air, water

**Trait (what the thing is *good for*, the immersive logic)** — 0–3:
stealth, flight, swimming, climbing, burrowing, speed, strength, toughness, regeneration, senses,
darkvision, truesight, charm, fear, illusion, invisibility, petrification, paralysis, telepathy,
breathing, resistance, shapechange, luck, sleep, healing, light, storm, antimagic, sound,
teleport, death, undeath, blessing, curse, madness, disease, growth, size, domination,
knowledge, protection, binding, time, planar, cunning

**Item-type tags** (items only, used for base slots): weapon, armor, shield, sword, axe, hammer,
bludgeon, polearm, bow, crossbow, dagger, spear, ammunition, light-armor, medium-armor,
heavy-armor, potion, scroll, ring, rod, staff, wand, wondrous, tool, gear, clothing, jewelry,
container, instrument, focus, poison, food

The creature type (`aberration`, `beast`, `celestial`, `construct`, `dragon`, `elemental`, `fey`,
`fiend`, `giant`, `humanoid`, `monstrosity`, `ooze`, `plant`, `undead`) is automatically added as a
tag to every material harvested from a monster — you don't need to add it.

---------------------------------------------------------------------------------------------------
## 3. Tools & stations

Tool ids: `alchemists-supplies`, `brewers-supplies`, `calligraphers-supplies`,
`carpenters-tools`, `cartographers-tools`, `cobblers-tools`, `cooks-utensils`,
`glassblowers-tools`, `herbalism-kit`, `jewelers-tools`, `leatherworkers-tools`, `masons-tools`,
`painters-supplies`, `potters-tools`, `smiths-tools`, `tinkers-tools`, `weavers-tools`,
`woodcarvers-tools`, `poisoners-kit`, `harvesting-kit`

Station ids: `none`, `campfire`, `forge`, `alchemy-lab`, `tannery`, `workshop`, `loom`,
`jewelers-bench`, `scriptorium`, `enchanting-circle`, `shrine`, `kitchen`, `glassworks`

---------------------------------------------------------------------------------------------------
## 4. Environments (ids)

arctic, coast, desert, forest, grassland, hill, mountain, swamp, underdark, underwater, urban,
ruins, feywild, shadowfell, elemental-fire, elemental-water, elemental-air, elemental-earth,
lower-planes, upper-planes, astral

---------------------------------------------------------------------------------------------------
## 5. Records

### Material
```json
{
  "id": "dire-wolf-pelt",
  "name": "Dire Wolf Pelt",
  "tier": "common",
  "tags": ["fur", "hide", "stealth", "cold"],
  "desc": "Thick, smoke-grey fur that sheds no sound as it moves. Prized by rangers for cloaks.",
  "perish": "1 day",
  "value": 25,
  "recipe": null
}
```
`value` = typical sale price in gp. `recipe` is only for refined intermediates (see §6).

### Monster
```json
{
  "id": "dire-wolf",
  "name": "Dire Wolf",
  "type": "beast",
  "size": "Large",
  "cr": "1",
  "env": ["forest", "hill", "arctic"],
  "blurb": "One-sentence own-words description with a harvesting angle.",
  "salvage": false,
  "harvest": [
    { "m": "dire-wolf-pelt", "q": 1, "dc": 12, "skill": "Survival", "note": "Must be skinned in one piece or the cloak-grade value is lost." },
    { "m": "dire-wolf-fang", "q": 2, "dice": "1d4", "dc": 10, "skill": "Survival" }
  ]
}
```
`cr` is a string ("0", "1/8", "1/4", "1/2", "1" … "30"). `size`: Tiny, Small, Medium, Large,
Huge, Gargantuan. `dice` optional (overrides q in display). `salvage: true` for civilised
humanoids/NPCs. Optional `srd` ("5.1" or "5.2") and `aka` (array of alternative names, e.g. 2024 names; searchable) — they yield **gear and belongings, never body parts**.

### Item (anything craftable that ends up in a character's hands)
```json
{
  "id": "cloak-of-elvenkind",
  "name": "Cloak of Elvenkind",
  "cat": "wondrous",
  "tier": "uncommon",
  "attune": true,
  "src": "SRD 5.1",
  "tags": ["wondrous", "clothing", "stealth"],
  "effect": "Own-words 1–3 sentence summary of what it does.",
  "value": 500,
  "recipe": { ... }
}
```
`cat` ∈ weapon, armor, ammunition, potion, oil, poison, scroll, ring, rod, staff, wand,
wondrous, gear, tool, provision, meal. `attune`: false | true | "by a spellcaster" etc.
`src`: "SRD 5.1", "PHB/SRD basic" (mundane equipment) or "Homebrew".

**Meals** (`"cat": "meal"`) are cooked with `cooks-utensils` at a `kitchen` or `campfire` in one
check. Extra fields: `recipe.yields` (servings per batch, usually 4; feasts 6–8), `meal.lasts`
(how long the effect lasts, e.g. "8 hours"), and `perish` ("1 day" for stews, "1 week" for baked or
pickled food; omit for dried or smoked trail food). `value` is **per serving**. Always tag "food".

| tier | DC | time | gp | min level | value / serving | effect |
|---|---|---|---|---|---|---|
| mundane | 10 | 1–2 hours (smoking up to 8) | 0.2–1 | 1 | 0.2–5 | flavour + a tiny perk |
| common | 12 | 2–4 hours | 5 | 1 | 50–80 | one small boon for ~8 hours |
| uncommon | 15 | 4–8 hours | 25 | 3 | 150–300 | one solid boon, like an uncommon potion |

Magic meals need exactly one keystone, like other magic items. A creature has one meal's effect at
a time ("well fed"), so a meal may be a touch better than a potion of the same rarity.

### Recipe
```json
{
  "components": [
    { "m": "cloak", "q": 1, "role": "base" },
    { "m": "dire-wolf-pelt", "q": 1, "role": "supporting" },
    { "m": "whisperleaf-vine", "q": 3, "role": "supporting" },
    { "any": ["essence", "fey"], "min": "uncommon", "q": 1, "role": "keystone", "label": "Fey essence (uncommon+)" },
    { "oneOf": ["moonsilver-thread", "spider-silk-thread"], "q": 1, "role": "binding", "label": "Fine thread" }
  ],
  "tools": ["weavers-tools", "leatherworkers-tools"],
  "station": "loom",
  "dc": 15,
  "time": "5 days",
  "gp": 100,
  "level": 3,
  "spells": ["pass without trace"],
  "requires": "Optional free-text prerequisite.",
  "yields": 1,
  "lore": "Why these components make sense — the immersive reasoning."
}
```
Slot kinds: `m` (exact id — material OR item), `any` (thing must carry ALL listed tags; optional
`min` tier), `oneOf` (list of exact ids). Always give `label` for any/oneOf.
Roles: `base`, `keystone`, `supporting`, `binding`.

---------------------------------------------------------------------------------------------------
## 6. Crafting rules (balance)

| Rarity    | DC | Time    | Reagent gp | Min level | Keystone tier |
|-----------|----|---------|-----------:|----------:|---------------|
| mundane   | 10 | by value (≈ value ÷ 10 days, min "1 hour") | ≈ ⅓ value | 1 | — |
| common    | 12 | 2 days  |     10 | 1  | common+ |
| uncommon  | 15 | 5 days  |     50 | 3  | uncommon+ |
| rare      | 18 | 15 days |    750 | 6  | rare+ |
| very-rare | 21 | 30 days |  4,000 | 11 | very-rare+ |
| legendary | 25 | 60 days | 20,000 | 17 | legendary |

Consumables (potion, oil, poison, scroll, ammunition, provision): halve time and gp.
Every **magic** item recipe has:
- exactly 1 `keystone` slot whose tier ≥ the item rarity (this is where the magic comes from — its
  tags must match the item's effect: fire resistance → fire; flight → flight; etc.);
- a `base` (mundane item, vessel, blank scroll…) when it makes sense;
- 1–4 `supporting` components that reinforce the theme (most can be commoner-tier);
- optionally 1 `binding` (ink, oil, thread, holy water, quicksilver…);
- `spells` (1–2 SRD spells a participant must cast each crafting day) for most uncommon+ items.
Prefer SPECIFIC monster parts where a monster is iconic for the effect (giant blood → Potion of
Giant Strength; basilisk eye → petrification; red dragon scales → Red Dragon Scale Mail) and use
`any` slots for flexibility elsewhere. Aim for 3–6 component slots total.

Refined intermediates (tanned leather, ingots, distilled essences, inks) are **materials with a
recipe** (tier = what they are, time in hours/days, station e.g. tannery/forge/alchemy-lab).

### Environment
```json
{
  "id": "forest",
  "name": "Forests & Woodlands",
  "desc": "2–3 sentence own-words flavour: what foragers find here and what dangers lurk.",
  "forage": "Short note on how foraging works here (e.g. 'Easy in summer; halved yields in winter').",
  "gather": [
    { "m": "whisperleaf-vine", "q": 1, "dice": "1d4", "dc": 13, "skill": "Nature",
      "cond": "Only in old-growth groves touched by the Feywild; best gathered at dusk." }
  ]
}
```
A gatherable material may appear in several environments. Optional danger fields: `"risk": 0-3` (none / low 10% / moderate 25% / high 45% chance of a creature encounter while gathering this find), `"riskWhy": "one line for the DM"`, and `"foes": ["creature-id", …]` (the most likely creatures first). Optional `"guard": {"m": "<monster-id>", "note": "…", "alt": ["other-guardian-id"]}`
marks a guardian that must be dealt with first; required for rare+ gatherables (guard CR: rare 6–13, very-rare 12–19,
legendary 18–30).

#### Extending a place (homebrew packs)
A later file can add finds to an environment that already exists instead of replacing it:
```json
{ "id": "urban", "extend": true, "gather": [ { "m": "my-material", "q": 1, "dice": "1d4", "dc": 12, "skill": "Investigation" } ] }
```
An entry with `"extend": true` carries only `id` and `gather`; its finds are appended to the base place. Without `extend`, a repeated environment id is an error. Files load in `manifest.json` order, so list the pack after the file that defines the place.

### Homebrew pack (`homebrew/<name>.json`)
Same sections as any data file, plus a header:
`"homebrew": {"name": "kebab-id", "title": "Shown to everyone", "desc": "one line", "default": true|false, "requires": ["other-pack"], "credit": "...", "version": 1}`.
Items without a `src` get `"src": "Homebrew"` when added. A pack may reference the base codex and the packs it `requires`, never other packs.
`"extend": true` entries add to existing things instead of defining new ones: an environment entry adds `gather` finds, a monster entry adds `harvest` parts (duplicates of a part already there are skipped).
`homebrew/index.json` is generated (`python3 tools/pack_index.py`); don't edit it by hand.

---------------------------------------------------------------------------------------------------
## 7. Tone & immersion checklist
- Every material description says what it *looks/feels/smells like* AND what crafters value it for.
- Harvest notes add a practical wrinkle (danger, timing, technique) — e.g. "Rupture the venom sac
  (fail by 5+) and you're exposed to its poison", "Must be cut while the ooze still quivers".
- Materials that obviously exist on a creature should exist in the data (a basilisk has an eye
  that petrifies; a troll's blood regenerates; a phase spider's silk slips between planes).
- Recipes must read like the components *logically* produce the effect.
- Keep numbers conservative. Don't let a CR 1 creature supply a rare keystone.


## Cultivation (`data/cultivation.json`)
```json
{"cultivation": [
  {"m": "healers-moss", "site": "plot", "days": 14, "yield": "1d4", "regrows": true, "needs": "Shade, damp stone and still air."}
]}
```
- `m`: a material id. One fresh piece of it is the cutting.
- `site`: `plot` (mundane–common), `greenhouse` (up to uncommon, also grows plot plants), `cellar` (fungi and cave mosses, up to uncommon), `grove` (up to rare, anything but fungi).
- `days`: time to the first harvest. The tending DC is the plant's lowest foraging DC.
- `yield`: dice or a number (`1d4`, `1d3+1`, `1`). `regrows`: whether it grows back after harvest.
- Keep very rare and legendary plants out, and run `tools/playtest.py` to check a bed doesn't out-earn a wage.

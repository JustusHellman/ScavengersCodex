# Playtest report

This is how the Codex was tested and what changed as a result. The tools are in `tools/`, so you can rerun every check after editing the data.

## Method
1. **Mechanical playtest** (`tools/playtest.py`) plays the system the way a party would.
   - It works out the earliest party level at which each item can be made. For every component it takes the easiest source:
     - the lowest-CR creature that yields it (a party of 4 at level ≈ 0.85 × CR);
     - a foraging spot, raised to the guardian's CR and to the level where the check succeeds half the time;
     - planar travel at about level 11–15;
     - or buying it.
   - It flags:
     - unreachable items and dead-end materials that no recipe uses;
     - recipes that need several kills of a big creature (grind);
     - keystones that are too easy or too hard for the item's rarity;
     - harvest checks that are hopeless at the level you'd meet the creature;
     - parts whose tier outranks their creature's CR;
     - rare+ gatherables with no guardian;
     - SRD items that arrive later than a table would expect.
2. **Economy check** (`tools/economy.py`) compares reagent gold plus the cheapest components against the item's value.
3. **Route planning** (`tools/route.py <item> [level]`) gives the concrete shopping list per item: which creature to hunt, where to forage, the check and your odds, the guardian, and spoilage.
4. **Sense review:** six reviewers read every recipe and every creature's parts as a DM would. They checked whether the parts fit the effect, whether the tools and station fit the work, whether the spells fit, the quantities, clarity, and any off-licence names.

## What we found and fixed
| Finding | Before | After | Fix |
|---|---|---|---|
| Unreachable items / dead-end materials | 0 / 0 | 0 / 0 | Held through all edits |
| Rare+ gatherables with no guardian (a level-1 ranger could pick a rare keystone off a glacier) | 70 | 0 | 107 guardians of matching CR that lair beside the find, e.g. a treant tending a fallen thousand-year oak, a remorhaz under a meteorite field |
| Keystones too easy for their rarity | 105 | 0 | Mostly fixed by the guardians |
| Uncommon items blocked until level 11–15 by planar-only gems and herbs | 22 | 0 | Material Plane sources added (brimstone at volcanic vents, opal in the badlands…) or alternatives offered |
| SRD items much later than expected (e.g. Flame Tongue at L10) | 45 | 2 | Keystone options at the right tier from nearer sources (Flame Tongue now takes fire-giant forge-iron) |
| Grind (e.g. 3 djinn kills, 6 assassins for a brigandine) | 9 | 0 | Yields and quantities adjusted |
| Dragon Scale Mail needed 12 scales, but an adult dragon averaged 11 | 1 | 0 | An adult hide now always gives 12–18 plates |
| Recipes costing more in parts than the item is worth | 355 | 0 at rare+ | Material prices re-derived from how recipes use them: the keystone carries about 40% of an item's value, and the rest is shared |
| Keystone options below the item's rarity | 8 | 0 | Now enforced by `validate.py` |
| Parts, tools, spells or lore that didn't make sense | — | ~145 fixes | E.g. hydra blood (not poisonous) removed from the poison periapt; white-dragon scales removed from fire items; Vorpal Sword keyed on a tarrasque claw, not a phylactery; arrows given arrowheads |
| Missing parts on some dragons (no blood, no fangs) | uneven | consistent | 49 dragon parts added across ages |
| Non-SRD names (githyanki, elder brain, City of Brass…) | several | 0 | Rewritten generically |

**Deliberately left:**
- **Purple Worm Poison (L13):** it is literally purple worm venom.
- **Golden Lions figurine (L10):** it is sphinx-bound, and the lowest sphinx is CR 11.

## When each rarity becomes craftable (earliest party level)
| Rarity | Earliest | Median | Latest |
|---|---|---|---|
| Common | 1 | 1 | 4 |
| Uncommon | 3 | 3 | 8 |
| Rare | 6 | 7 | 15 |
| Very rare | 11 | 12 | 18 |
| Legendary | 17 | 18 | 20 |

The site shows this estimate on every item ("Craftable from party level"). The Items page also has a **Party level** filter.

## Sample campaign routes
- **Level 3, Cloak of Elvenkind (uncommon):**
  - Skin a dire wolf (CR 1; Survival DC 12, 91% with tools).
  - At dusk, cut 3 whisperleaf vines in a Feywild-touched grove (Nature DC 13). The grove's green hag (CR 3) treats it as her garden.
  - Catch a sprite's essence in an Essence Vessel within a minute (Arcana DC 10).
  - Weave it all on a loom over 5 days while someone casts *pass without trace*.
- **Level 6, Stonefather Maul (rare):**
  - Defeat a stone giant (CR 7).
  - Search its belongings for the heartstone (Investigation DC 16) and take 2 of its boulder shards.
  - Take tremor gravel from an earth elemental.
  - Spend 15 days at a forge while someone casts *thunderwave* or *shatter*.
- **Level 8, Flame Tongue (rare):**
  - A fire giant's forge-iron is the keystone.
  - A hell hound's fire gland is a supporting part.
  - Forge it into any sword.
- **Level 12, Frost Brand (very rare):**
  - Pry eternal ice from a frozen rift that an ice devil (CR 14) guards (Arcana DC 19).
  - Add a winter wolf's frost gland and a frost giant's glacial ice.
- **Level 15, Dragon Scale Mail (red):**
  - One adult red dragon (CR 17). Its hide gives 12–18 armour-grade plates (Survival DC 19, 84% with tools).
- **Level 18, Holy Avenger:**
  - A solar's halo-essence (Religion DC 22).
  - A golden bough from Elysium, guarded by an adult gold dragon.
  - A shrine and 60 days of work.

## Rerunning the checks
```
python3 tools/validate.py      # references, tags, keystone tiers
python3 tools/playtest.py 20   # mechanical playtest (writes playtest-report.json)
python3 tools/economy.py       # cost vs value per rarity
python3 tools/route.py flame-tongue 8   # easiest route for an item
```


## Early-game quality pass (levels 1–5)
Reviewed every common and uncommon item (359 recipes) and every CR 0–5 creature (250 creatures and their parts) for sense, reachability, balance and text. 109 fixes were applied: 9 bugs, 41 sense fixes and 59 text fixes.
- **Reachability:** uncommon items that needed parts only from high-CR creatures or other planes now take reachable alternatives (Apeskull War-Helm, Emberline Shortsword, Rime-Iron Axe, Nightmare-Edge Glaive, Tyrant's Roar Horn, Stone of Good Luck, Wraith-Ectoplasm Cloak and more). The latest first-craftable level for uncommon items fell from 8 to 6.
- **Sense:** parts that didn't fit were swapped (a stirge proboscis for the blood-drinking stiletto, a wolf nose for tracking snuff, griffon feathers for a glide cloak, and more). Supporting parts above the item's tier became options.
- **Rules:** the consumable time and cost halving is now applied consistently, and the Pale Tincture effect matches the SRD.
- **Creatures:** four duplicate horse-hair materials were merged into one. Skills, perish times and yields that were off (for example a Swarm of Quippers giving 4d6 meat) were corrected. 17 thin part descriptions were rewritten, and contradictory notes (lycanthropes, the otyugh) were fixed.
- **Text:** an internal id that showed up in about 120 essence harvest notes was removed, and the identical notes now have varied, creature-appropriate wording.
- **New sources:** Toxic Herbs, Medicinal Herbs, clay, sand, salt, ores, rock crystal, hemp and hardwood can now be found in the wild, and horses give horsehair.

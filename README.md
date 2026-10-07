# The Scavenger's Codex

A harvesting and crafting handbook for D&D 5e. You skin, harvest and forage components from 338 SRD creatures and 21 environments, then craft every SRD magic item, the basic equipment, and, with the Core+ homebrew packs, about 370 original items and meals.

- **Cross-linked:** every item shows its recipe and what it is used in. Every material shows where it comes from and what it makes, and every creature shows its parts and everything craftable from them.
- **Satchel:** add what your party carries (or "add all parts" from a slain creature) to see what you can craft now and what you're 1–2 parts away from. The satchel is saved in your browser, with export and import.
- **Full breakdown:** item pages trace the whole crafting chain (e.g. ore → ingot → armour) down to raw parts, and say where to get each one.
- **Goals:** track the items you're working towards, and the satchel shows what's still missing.
- **Harvest rolls:** on a creature's page, each harvester writes in their own total and sees the outcome (flawless, success, flawed or ruined, with hazards), or the codex rolls for everyone. Then add the results to your satchel.
- **Player view as a journal:** players see only what the party has discovered. On a first visit that's mundane gear, common materials, ordinary beasts and people, and the places of the world. DCs, CRs (shown as a rough danger word instead), exact prices of magic goods (shown as bands like "a small fortune") and stat-block links stay hidden. The DM shares in-world handouts with unlock codes (a formula code reveals the recipe and its components, and adds the creatures and places they come from as "heard of": name, look, habitat and only the parts you need; a creature or place code gives the full entry). Players can also research a formula by studying a keystone, and anything in the satchel is known.
- **DM PIN:** DM view can be locked with a PIN set in `config.json`, so curious players stay in player view.
- **Specimen plates:** every creature, item, material and place has a generated illustration. Real pictures can be dropped in at any time (see below).
- **Party satchel:** a shared inventory plus learned formulas, kept on each device and shared by sending a link or party code. No server or database is needed.
- **DM tools:** forage expeditions (every find has its own lore-based danger and fitting creatures, and guardians vary), wandering traders by settlement size and speciality, harvesting a whole fight at once, and a session recap.
- **Party clock and spoilage:** move the clock as time passes in the game. Perishable parts count down, get flagged before they spoil, and can be preserved (salts, an essence vessel, drying).
- **Workbench:** starting a craft puts it on the workbench. Log the days of work, roll the final check and finish it.
- **Garden:** grow herbs, fungi and rarer plants from cuttings in plots, glasshouses, mushroom cellars and warded groves. They grow on the party clock, need a weekly Nature check, can thrive or catch blight, and many grow back after harvest.
- **Links and QR codes:** every handout comes with a clickable link and a QR code (also printed on the back of each card). Players tap or scan it and the entry unlocks in their journal. The code is cleared from the address straight away, so it never unlocks twice. Party links get a QR code too.
- **After the fight:** add the slain creatures (or press *Add to the fight* on a creature's page), type in each player's harvest roll or roll them all, then send the parts to the party satchel. You can also turn the creatures into handout cards or a single handout.
- **Session recap:** start a session in DM tools → Session. Harvests, handouts, crafting and the garden are logged, and the recap can be copied for your notes or group chat.
- **Backup and restore:** one file (or a block of text) holds everything a device keeps: satchels, journal, garden, workbench, cards and settings. Find it in the Journal and in DM tools → Player setup.
- **Handout cards:** every handout entry becomes a collectible card, with a picture and details on the front and the in-world note plus a short unlock code (`SC-XXXX-XXXX`) on the back. Flip them on screen, or print them double-sided (backs line up), as fold-overs, or fronts only.
- **Collapsible sections:** every section on an entry page folds away. Sensible ones start open, and the codex remembers your choice for each kind of section.
- **Homebrew packs:** original content comes in packs ("Core+: Hunter's Gear", "Core+: The Cookbook", and campaign packs like "The Rooted City"). The DM ticks which ones a campaign uses and the choice travels to players with the party link. Adding a pack is one file in `homebrew/`.
- **The Web:** a map of how everything connects, from places and creatures to the parts they give and the things those parts make. Every entry page has a small *Connections* map, and the Web page can centre on anything. Hover or tap a bubble to light up its whole chain. Players see only what their journal holds, and every lead they haven't followed shows as a "?" with no name, so the map grows as they discover things. The DM can focus on a homebrew pack or a place, or preview exactly what the players see.
- **Meals and cooking:** a chef can cook 50 dishes, from campfire fry-ups to uncommon feasts, out of harvested and foraged ingredients. The meal's page rolls the cooking check (superb, success, flawed or ruined), puts the servings in a satchel, and the satchel can show only the meals you can cook. Servings spoil like other fresh parts, and a creature enjoys one meal's effect at a time.
- **Final check:** roll any recipe's crafting check or type in your own total, with the failure rules, quirks (d20) and masterwork boons (d10).
- **SRD 5.1 + 5.2.1:** 338 creatures, including 18 added in SRD 5.2.1. 2024 creature names (e.g. "Sphinx of Lore") are searchable aliases.
- **No backend:** plain HTML, CSS, JS and JSON.

## Host it on GitHub Pages
1. Create a new repository and upload **everything in this folder** (`index.html`, `app.js`, `rules.js`, `styles.css`, the `data/` folder, `.nojekyll`, …).
2. In the repository, go to **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Pick `main` and `/ (root)`, then save.
3. After a minute the site is live at `https://<you>.github.io/<repo>/`.

`codex-standalone.html` is the same app as a single file, with the data built in (it doesn't show pictures from `images/` unless it sits in the same folder). You can open it straight from your disk or send it to a player. Opening `index.html` directly from disk won't work, because browsers block reading the `data/` files that way. To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Setting up your table (config.json)
`config.json` (next to `index.html`) controls what players know by default and the DM PIN. The easiest way to fill it in is **DM tools → Player setup & PIN**: choose the settings, type a PIN, press **Copy config.json**, then paste it over `config.json` in your GitHub repository (open the file → pencil icon → paste → Commit). Every device that opens your site uses it.

`siteUrl` is your site's public address, used for links and QR codes on handouts (on GitHub Pages it's detected automatically, so set it when you run the codex from a file). `spoilage` (true / false) sets whether parts spoil by default. A party can also switch spoilage off from its clock on the Satchel page. Options under `player`: `places` (all / none), `creatures` (beasts / all / none), `materials` (common / mundane / all / none), `items` (mundane / common / all) and `threat` (vague / cr / none: how players see a creature's danger).

The PIN only keeps curious players out. It isn't real security, because anyone can read the site's files.

## Adding real pictures
Every entry shows a generated specimen plate until a real image exists. To add one, upload a picture named after the entry's id (the last part of its page address) into the matching folder:

| Kind | Folder | Example |
|---|---|---|
| Creature | `images/creatures/` | `images/creatures/dire-wolf.webp` |
| Item | `images/items/` | `images/items/cloak-of-elvenkind.webp` |
| Material | `images/materials/` | `images/materials/whisperleaf-vine.webp` |
| Place | `images/places/` | `images/places/forest.webp` |

`.webp`, `.jpg` and `.png` all work, tried in that order. About 640 × 440 px (a 16:11 shape) looks best. On GitHub, open the folder → **Add file → Upload files**. The picture appears automatically, with no code changes.

**Adding many at once:** put your pictures in any folder, named after the entry (e.g. `Dire Wolf.jpg`, `cloak_of_elvenkind.png`), and run:

```
python3 tools/images.py import my-pictures            # preview which entry each file matches
python3 tools/images.py import my-pictures --apply    # copy them into images/ with the right names
python3 tools/images.py import my-pictures --apply --resize   # and shrink them to 640 px .webp (needs Pillow)
python3 tools/images.py report                        # how many entries have pictures; writes images/_missing.txt
```

If a name exists in more than one list, add `creature-`, `item-`, `material-` or `place-` in front of it.

To use an image hosted elsewhere, or to credit an artist, add `"img": "https://…"` and `"imgCredit": "Art by …"` to that entry in its `data/*.json` file. Use only art you have the rights to: your own, commissioned, public-domain or suitably licensed work, and never official D&D artwork.

## Adding or changing content
- The base codex is in `data/*.json`: the SRD creatures and items, the harvesting and foraging tables, and places. `SCHEMA.md` documents the format, tags, tiers and balance table.
- Original items and other homebrew live in **packs** in `homebrew/` (see below).
- Check your edits with `python3 tools/validate.py`. It checks the base on its own, the base with each pack, and everything together, and reports broken ids, unknown tags and missing keystones.
- `codex-standalone.html` is not updated automatically. Rebuild it with `python3 tools/build_standalone.py`, or just use the GitHub Pages version.

## Homebrew packs
Every homebrew set is one JSON file in the `homebrew/` folder. The codex ships with three:

| Pack | File | On for new visitors |
|---|---|---|
| Core+: Hunter's Gear (about 320 original items) | `homebrew/core-hunters-gear.json` | yes |
| Core+: The Cookbook (42 meals) | `homebrew/core-cookbook.json` | yes |
| The Rooted City (a campaign pack) | `homebrew/rooted-city.json` | no |

**Choosing packs for a campaign.** Everyone sees the list in the left-hand column and on the *Homebrew* page (on phones, via the Journal). In DM view the packs have tick boxes. The DM's choice is saved with the party and travels to the players with the party link (Satchel → Party satchel → Share), so every player's codex matches. Players can't change it. Content from a pack in use works like the rest of the codex and still follows the discovery rules. Switching a pack off hides its content but never deletes anything: satchel contents, learned formulas and journal entries come back when it's switched on again. To make a choice the default for everyone who opens the site, copy the settings from DM tools → Player setup into `config.json` (the `"packs"` list). Without that, each pack's own `"default"` decides.

**Adding a pack.** Drop the file into `homebrew/` and push. The deploy workflow rebuilds `homebrew/index.json` (the list the site reads) and checks the pack. Locally, `python3 tools/pack_index.py` rebuilds the index, or use the helper, which checks first and changes nothing if the pack has problems:

```
python3 tools/add_homebrew.py my-pack.json --dry-run   # check only, changes nothing
python3 tools/add_homebrew.py my-pack.json             # saves homebrew/my-pack.json and updates homebrew/index.json
python3 tools/validate.py                              # the same check the deploy runs
```

Use `--replace` to overwrite an older version, `--remove my-pack` to take one out (it refuses if another pack needs it) and `--list` to see what is installed. `python3 tools/playtest.py` shows how new recipes fit the balance table (`--packs=none` checks the base on its own).

A pack starts with a header, then any of the usual sections (`materials`, `items`, `monsters`, `environments`, `cultivation`):

```json
{"homebrew": {"name": "my-pack", "title": "My Pack", "desc": "One line shown to everyone.", "default": false, "requires": [], "credit": "you", "version": 1},
 "items": [ ... ]}
```

A pack may use anything in the base codex. If it uses another pack's content, list that pack in `"requires"`; it is then switched on together with it. A pack can add finds to an existing place, or parts to an existing creature, without copying it: `{"id": "forest", "extend": true, "gather": [ ... ]}` or `{"id": "wolf", "extend": true, "harvest": [ ... ]}`.

**Just for you, with no repo.** DM tools → Homebrew tab: choose or paste the pack, press *Check pack*, then *Add*. The pack is stored in this browser only and is always on there. Use *Download as repo file* to move it into `homebrew/` later.

**Spoilers.** The repo is public, so anything in a pack, and every pack's title and description, is readable by anyone, including players. Keep secrets out of names and descriptions or use the device-only route.

`node tools/test_homebrew.js` checks that the in-browser checker and `tools/validate.py` agree.

## Balance and playtesting
See `PLAYTEST.md`. Run `python3 tools/playtest.py` after editing data to catch unreachable items, dead-end materials, grind and mis-tiered keystones. It also simulates 3,000 growing seasons for every plant in `data/cultivation.json` and flags any bed that earns more than a skilled worker's wage.

## Third-party code
`qrcode.js` is the QR Code Generator for JavaScript by Kazuhiko Arase (MIT licence, https://github.com/kazuhikoarase/qrcode-generator). "QR Code" is a registered trademark of DENSO WAVE INCORPORATED.

## Legal
This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Item effects are short paraphrases. Harvest data, recipes, places and Homebrew items are original. This is unofficial fan content, not approved or endorsed by Wizards of the Coast.

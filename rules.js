/* Rules chapter of The Scavenger's Codex — plain HTML so it is easy to edit. */
window.CODEX_RULES = `
<div class="callout"><b>In short:</b> slay or find something → <b>harvest</b> its parts with the right skill before they spoil → <b>refine</b> raw parts if needed → <b>craft</b> by combining a <i>base</i>, a <i>keystone</i> that carries the magic, <i>supporting</i> parts and a <i>binding</i>, spending time, reagent gold and a final tool check.</div>

<div class="toc">
  <a class="chip" href="#/rules/harvest">Harvesting</a><a class="chip" href="#/rules/spoil">Spoilage</a><a class="chip" href="#/rules/forage">Foraging</a>
  <a class="chip" href="#/rules/refine">Refining</a><a class="chip" href="#/rules/craft">Crafting</a><a class="chip" href="#/rules/table">Crafting table</a>
  <a class="chip" href="#/rules/formulas">Formulas</a><a class="chip" href="#/rules/fail">Success &amp; failure</a><a class="chip" href="#/rules/grow">Cultivation</a><a class="chip" href="#/rules/cook">Cooking</a><a class="chip" href="#/rules/dm">DM guidance</a><a class="chip" href="#/rules/quirks">Quirks &amp; masterworks</a>
</div>

<h2 id="r-harvest">1. Harvesting creatures</h2>
<p>After a fight, a character can spend time working on a corpse to take usable parts. Each creature's page lists what it yields. Each part has a <b>skill</b>, a <b>DC</b> and a quantity.</p>
<table><thead><tr><th>Skill</th><th>Used for</th><th>Tool that grants advantage</th></tr></thead><tbody>
<tr><td>Survival</td><td>Hides, pelts, scales, feathers, meat, bone, horn, teeth, claws</td><td>Leatherworker's tools or harvesting kit</td></tr>
<tr><td>Medicine</td><td>Organs, blood, glands, eyes, brains, venom sacs</td><td>Herbalism kit or alchemist's supplies</td></tr>
<tr><td>Nature</td><td>Plants, fungi, minerals, ooze residue</td><td>Herbalism kit (plants), mason's tools (stone)</td></tr>
<tr><td>Arcana</td><td>Magical essences, elemental cores, construct cores</td><td>Alchemist's supplies; an Essence Vessel is required</td></tr>
<tr><td>Religion</td><td>Celestial, fiendish and undead remnants</td><td>A holy symbol or a blessed tool</td></tr>
<tr><td>Investigation</td><td>Salvaging gear from people and constructs</td><td>Tinker's tools or thieves' tools</td></tr>
</tbody></table>
<p><b>Time.</b> Harvesting one part takes time based on the creature's size. Several characters can work on different parts at once, and a helper can take the Help action on one part.</p>
<table><thead><tr><th>Size</th><th>Time per part</th></tr></thead><tbody>
<tr><td>Tiny</td><td>5 minutes</td></tr><tr><td>Small</td><td>10 minutes</td></tr><tr><td>Medium</td><td>20 minutes</td></tr>
<tr><td>Large</td><td>40 minutes</td></tr><tr><td>Huge</td><td>1½ hours</td></tr><tr><td>Gargantuan</td><td>3 hours</td></tr>
</tbody></table>
<p><b>Default DCs</b> scale with the part's tier: mundane 8, common 10, uncommon 13, rare 16, very rare 19, legendary 22. Delicate parts are a little harder and sturdy ones a little easier. The creature's page always shows the exact DC.</p>
<p><b>Without tools</b> (no knife, saw or vials) you harvest at disadvantage. A <a href="#/item/harvesting-kit">Harvesting Kit</a> removes that penalty.</p>
<h3>Harvest results</h3>
<ul>
<li><b>Success:</b> you take the listed quantity.</li>
<li><b>Success by 10 or more:</b> a flawless cut. The part counts as +1 quantity, or sells for 50% more.</li>
<li><b>Failure by 1–4:</b> a flawed yield. Take half the quantity (minimum 0), or the whole part at half value. You can't retry the same part.</li>
<li><b>Failure by 5 or more:</b> the part is ruined. Hazardous parts spring their danger: a venom sac bursts over you (you're exposed to the creature's poison), a breath gland vents, a lycanthrope's blood risks the curse.</li>
</ul>
<h3>Optional: the killing blow</h3>
<p>If the final blow dealt fire or acid damage, hides, fur and feathers are harvested at disadvantage. Lightning ruins eyes and brains the same way, and a crushing bludgeoning blow does the same to shells and skulls. Hunters who want clean pelts learn to finish with a blade.</p>
<h3>People are salvaged, not butchered</h3>
<p>Civilised humanoids (bandits, mages, goblins, merfolk and the like) yield <b>salvage</b>: gear, components, spellbook pages and trinkets, found with Investigation. Giants yield what they carry and what their bodies give up freely, such as blood, hair and heartstones. Celestials and sacred beasts should only be harvested from what was freely given or lost in a fall. Taking more may offend a god.</p>

<h2 id="r-spoil">2. Spoilage and preservation</h2>
<table><thead><tr><th>Perishes in</th><th>Typical parts</th><th>How to keep it</th></tr></thead><tbody>
<tr><td>1 minute</td><td>Essences, elemental cores</td><td>Must be caught in an <a href="#/material/essence-vessel">Essence Vessel</a> as the creature dies. Sealed, it lasts indefinitely.</td></tr>
<tr><td>1 hour</td><td>Blood, eyes, brains, most organs</td><td><a href="#/material/preserving-salts">Preserving salts</a> extend it to 1 week, and <i>gentle repose</i> on the corpse pauses the clock.</td></tr>
<tr><td>1 day</td><td>Hides, pelts, meat, glands</td><td>Salt or tan them (<a href="#/material/cured-leather">cured leather</a> loses any magic), or keep them cold.</td></tr>
<tr><td>1 week</td><td>Preserved organs, dried herbs</td><td>Keep them dry and sealed.</td></tr>
<tr><td>Stable</td><td>Bone, horn, teeth, scales, shells, minerals, salvage</td><td>Nothing needed.</td></tr>
</tbody></table>
<p><b>Preserved parts:</b> salted or chilled parts (1 hour or 1 day) keep for 1 week, dried parts (1 week) keep for a month, and a sealed essence keeps indefinitely.</p>
<p><b>The party clock.</b> The Satchel page has a clock for the party. Move it forward as time passes in the game, and every perishable part counts down from the moment it went into a satchel. Parts close to spoiling are flagged, and spoiled ones can be thrown out. The preserve buttons use up preserving salts or an essence vessel if the method needs one. Each batch keeps its own timer, so a fresh harvest never inherits an old stack's clock. Don't want to track it? Untick <b>Parts can spoil</b> on the clock and nothing spoils.</p>
<p><b>Once crafting begins,</b> the components are bound into the work on the first day and stop spoiling. You only need to keep them fresh until you reach the workshop.</p>
<p>The corpse itself also spoils. Parts not taken within the listed window are lost. Undead, constructs and elementals often don't leave a normal body at all, and their pages say what remains.</p>

<h2 id="r-forage">3. Foraging</h2>
<p>Each <a href="#/places">place</a> lists what can be gathered there, along with DCs and conditions like "only under a full moon" or "after a thunderstorm".</p>
<ul>
<li><b>During travel:</b> a character travelling at a slow pace can forage instead of navigating. Once per day they make one gathering attempt against a chosen entry whose conditions are met. The DM decides whether the conditions apply.</li>
<li><b>Dedicated search:</b> each hour spent searching one area allows one attempt. After 4 attempts in an area, the easy pickings are gone for a tenday.</li>
<li><b>Results:</b> use the same success and failure bands as harvesting. Failing by 5 or more on a dangerous plant exposes you to it.</li>
<li><b>Guardians:</b> every rare, very rare and legendary gatherable, and some uncommon ones, is <b>guarded</b> by a creature of matching challenge that lairs beside it (a treant tending a fallen thousand-year oak, a remorhaz under a meteorite field). You deal with the guardian first, by fighting it, sneaking past or bargaining. That keeps foraging from being a shortcut around the rule that a rare keystone means beating a rare threat. Each guarded find has a usual guardian, and sometimes another creature of similar challenge has taken its place.</li>
<li><b>Danger:</b> every find has its own risk of drawing a creature while you gather it: <i>safe work</i> (none, like wayside herbs or pine resin at the forest edge), <i>mostly safe</i> (10%), <i>risky</i> (25%, like a wild hive or deep leaf litter) and <i>dangerous</i> (45%, like an owlbear's hollow tree or a hag's garden). The creature suits that find, that place and the party's level. The DM rolls it (or the Forage expedition tool does), and can always swap or skip it.</li>
</ul>

<h2 id="r-refine">4. Refining</h2>
<p>Some materials are made from others: ore is smelted into ingots, pelts are tanned into leather, essences are distilled into inks. Refined materials have their own small recipes (look for the recipe card on a material's page). They use the same check, usually DC 8–16, and take hours or a few days.</p>

<h2 id="r-craft">5. Crafting</h2>
<p>To craft an item you need:</p>
<ol>
<li><b>The recipe.</b> Mundane and common items are known by anyone proficient with the tools. Uncommon and rarer items need a <a href="#/rules/formulas">formula</a>.</li>
<li><b>The components</b> shown on the recipe card:
  <ul>
  <li><b>Base:</b> the mundane item or vessel that receives the magic.</li>
  <li><b>Keystone:</b> the one part that carries the enchantment. Its tier must be at least the item's rarity, so a rare item needs a rare-grade keystone, which means beating a rare-grade threat.</li>
  <li><b>Supporting:</b> thematic parts that shape the effect.</li>
  <li><b>Binding:</b> threads, inks, oils or catalysts that hold it together.</li>
  </ul>
  Slots marked "any…" accept any material with the listed traits. Tap them to see every option.</li>
<li><b>Tool proficiency</b> with at least one listed tool, and access to the listed <b>station</b> (a forge, alchemy lab, loom, enchanting circle and so on).</li>
<li><b>Reagent gold</b>, for the solvents, fuel and minor catalysts that aren't worth tracking.</li>
<li><b>Spells.</b> Many magic items list one or two spells. Someone taking part must cast one of them on each day of crafting, and a spell scroll can stand in.</li>
<li><b>Time</b> in 8-hour workdays. Up to four proficient crafters can share the work. Divide the days among them, but only one of them makes the final check.</li>
</ol>
<p><b>The workbench.</b> Pressing <b>Start crafting</b> takes the components out of your satchels and puts the item on the workbench (Satchel page). Log work as it happens, a day (8 hours) at a time. When the work is done, roll the final check on the item's page and finish it. Abandoning a project before any work is done gives the parts back. After that they are bound into the work and lost.</p>

<h2 id="r-table">6. Crafting table</h2>
<table><thead><tr><th>Rarity</th><th>Craft DC</th><th>Time</th><th>Reagent gp</th><th>Min. level</th><th>Keystone</th></tr></thead><tbody>
<tr><td><span class="pill t-mundane">Mundane</span></td><td>10</td><td>≈ value ÷ 10 days</td><td>≈ ⅓ value</td><td>—</td><td>none</td></tr>
<tr><td><span class="pill t-common">Common</span></td><td>12</td><td>2 days</td><td>10</td><td>1</td><td>common+</td></tr>
<tr><td><span class="pill t-uncommon">Uncommon</span></td><td>15</td><td>5 days</td><td>50</td><td>3</td><td>uncommon+</td></tr>
<tr><td><span class="pill t-rare">Rare</span></td><td>18</td><td>15 days</td><td>750</td><td>6</td><td>rare+</td></tr>
<tr><td><span class="pill t-very-rare">Very rare</span></td><td>21</td><td>30 days</td><td>4,000</td><td>11</td><td>very rare+</td></tr>
<tr><td><span class="pill t-legendary">Legendary</span></td><td>25</td><td>60 days</td><td>20,000</td><td>17</td><td>legendary</td></tr>
</tbody></table>
<p><b>Consumables</b> (potions, oils, poisons, scrolls, ammunition, provisions) take half the time and half the gold. Artifacts can't be crafted.</p>
<p><b>Does crafting pay?</b> An item's value covers its parts, the reagent gold and the crafter's time. Counting skilled labour at about 10 gp a day for common work, 20 for uncommon, 50 for rare, 150 for very rare and 300 for legendary, every item is worth at least what goes into it, give or take a few items at the top of their price band. Selling what you craft is a fair trade, not a money printer. The real profit comes from harvesting the parts yourself.</p>
<p>These costs are far below the purchase price because <i>you</i> supplied the dangerous part. The price of a magic item is mostly the price of its keystone, and that's paid in risk.</p>

<h2 id="r-formulas">7. Formulas</h2>
<p>In <b>player view</b> (the switch at the top of the page), the codex becomes your party's <b>journal</b>. Players see only what they've discovered: formulas, creatures, places and materials beyond common knowledge stay hidden, and DCs are the DM's secret. Things are discovered in three ways:</p>
<ul>
<li><b>Handouts from the DM.</b> On any page in DM view, press <b>Share with players</b> (or bundle several on <a href="#/dm">DM tools → Handouts</a>). You get an in-world note ("a wax-sealed page from an artificer's workbook…") and a code. Players enter it under <a href="#/journal">Journal</a>. A formula code unlocks the recipe and every component. The creatures and places those components come from are added as <i>heard of</i>: you learn their name, look and habitat, and which of their parts you need, but nothing more. A creature or place code gives the full entry.</li>
<li><b>Research.</b> Once the party has heard of an item (a rumour handout, a sighting, a line in a tome), a player holding a suitable keystone can study it: one Intelligence (Arcana) check per week against the craft DC. Uncommon formulas take 1 successful week, rare 2, very rare 3 and legendary 4. Failing by 10 or more loses a week.</li>
<li><b>Owning it.</b> Anything that goes into your satchel is added to the journal.</li>
</ul>
<p>Players also judge by eye: creatures show a rough sense of danger ("Deadly") instead of a challenge rating, and magic goods show a rough worth ("a small fortune") instead of an exact price. Only mundane gear has a listed price.</p>
<p>The journal belongs to the party and travels with the party code. The DM can also set a <b>PIN</b> for DM view and choose what players know by default under DM tools → Player setup.</p>
<ul>
<li><b>Found:</b> in spellbooks, tomes, dungeon libraries, a dead artisan's notes (see salvage such as <a href="#/material/spellbook-pages">spellbook pages</a>).</li>
<li><b>Taught:</b> by a master crafter, usually in exchange for a service or 10% of the item's value.</li>
<li><b>Researched:</b> study the keystone itself. Spend one week per rarity step above common and make an Arcana check (DC = the craft DC). A success means you work out the recipe. A failure means another week.</li>
</ul>

<h2 id="r-fail">8. The final check, success and failure</h2>
<p>When the time is spent, the lead crafter makes a check with a listed tool against the Craft DC, adding their proficiency bonus.</p>
<ul>
<li><b>Success:</b> the item is complete. If the item needs attunement, the crafter may attune to it immediately.</li>
<li><b>Failure by 1–4:</b> the work stalls. Spend 25% more time and gold, then roll again.</li>
<li><b>Failure by 5–9:</b> a supporting or binding component is spoiled (DM's choice). Replace it and spend 25% more time.</li>
<li><b>Failure by 10 or more, or a natural 1 on a rare+ item:</b> the enchantment backfires. The keystone survives, but the base and other components are lost. The DM may add a <i>quirk</i> instead of destroying everything.</li>
<li><b>Success by 10 or more:</b> a <b>masterwork</b>. Roll on the masterwork table below.</li>
<li><b>Optional quirks:</b> on a failure by 5 or more, the DM may let the crafter push on. The item is finished, but it carries a random <b>quirk</b> (see below).</li>
</ul>

<h2 id="r-grow">9. Cultivation</h2>
<p>Many herbs, flowers, fungi and a few rarer plants can be grown instead of foraged. The <a href="#/garden">Garden</a> page keeps the party's beds on the party clock. A material's page says whether it can be grown and how.</p>
<ul>
<li><b>Cuttings.</b> One fresh (unspoiled) piece of a growable plant is a cutting. Planting it uses it up.</li>
<li><b>Beds set the ceiling.</b> A <i>garden plot</i> grows mundane and common plants. A <i>glasshouse</i> grows anything a plot can, plus tender and uncommon plants. A <i>mushroom cellar</i> grows fungi and cave mosses, up to uncommon. A <i>warded grove</i> (a fey-touched or consecrated circle) grows anything except fungi, up to rare. Very rare and legendary plants can't be grown.</li>
<li><b>Tending.</b> Growth pauses at the end of each week until someone tends the plant, so a forgotten bed simply waits. Each week of growth, someone makes an Intelligence (Nature) check against the plant's foraging DC. Beat it by 10 and the plant thrives (+1 to the harvest, and these add up). Fail and growth is set back 2 days. Fail by 5 or more and something goes wrong: roll on the garden events table (blight, pests, frost, a curious visitor, the fey wanting their due…).</li>
<li><b>Harvest.</b> Once it's grown and the tending is done, roll the yield. Blight halves it. Most plants grow back for another harvest, and the rest must be replanted.</li>
<li><b>Time.</b> Mundane plants take about 1–3 weeks, common 2–3 weeks, uncommon about a month, and rare plants two months.</li>
</ul>
<p>Growing is slow on purpose. A bed produces roughly what a skilled worker earns in the same time, so it's a steady supply of reagents, not a gold mine. Keystones for rare items still have to be hunted.</p>

<h2 id="r-cook">10. Cooking</h2>
<p>Meals come in the <a href="#/homebrew">Core+: The Cookbook</a> pack. Meals are crafted like any other item, but faster: a cook with <b>cook's utensils</b> spends a few hours at a kitchen or campfire and makes one cooking check (Wisdom, adding proficiency with the utensils) against the meal's DC. The meal's page has a cooking panel that rolls the check and puts the servings in a satchel.</p>
<table><thead><tr><th>Tier</th><th>DC</th><th>Time</th><th>Reagents</th><th>Effect</th></tr></thead><tbody>
<tr><td>Mundane</td><td>10</td><td>1–2 hours (smoking or drying up to 8)</td><td>under 1 gp</td><td>Flavour and a small perk; counts as a day's food</td></tr>
<tr><td>Common</td><td>12</td><td>2–4 hours</td><td>5 gp</td><td>One small boon, usually for 8 hours</td></tr>
<tr><td>Uncommon</td><td>15</td><td>4–8 hours</td><td>25 gp</td><td>One solid boon, like an uncommon potion. Needs a learned formula and level 3</td></tr>
</tbody></table>
<ul>
<li><b>Superb</b> (beat the DC by 10, or a natural 20): one extra serving, and the effect lasts until the end of the eater's next long rest.</li>
<li><b>Success:</b> the batch makes its listed servings.</li>
<li><b>Flawed</b> (fail by 1–4): only half the servings (rounded up) turn out; the rest is scraped into the fire.</li>
<li><b>Ruined</b> (fail by 5 or more, or a natural 1): the ingredients are lost. Fail by 10 or more and anyone who eats it anyway makes a DC 10 Constitution save or is poisoned for 1 hour.</li>
<li><b>Servings.</b> A batch usually makes 4 servings (feasts 6–8). The listed value is per serving.</li>
<li><b>Well fed.</b> A creature enjoys one meal's effect at a time. Eating another meal replaces the first. Eating a serving takes about a minute; a magical effect starts when the meal is finished.</li>
<li><b>Keeping.</b> Stews and fresh dishes keep a day, baked or pickled food about a week, and dried or smoked trail food keeps indefinitely. With spoilage turned on, servings spoil like any other batch.</li>
</ul>

<h2 id="r-dm">11. Guidance for the DM</h2>
<ul>
<li><b>Keystones are the throttle.</b> Don't let shops sell keystones freely. Supporting parts and bindings can be bought in cities at their listed value.</li>
<li><b>Selling parts:</b> specialists (alchemists, tanners, wizards) pay the listed value, and general merchants pay half.</li>
<li><b>Homebrew items</b> are marked <i>Homebrew</i>. They were balanced against SRD items of the same rarity, but treat them as proposals.</li>
<li><b>Swap freely.</b> If a keystone doesn't exist in your campaign, any material with the same tags and tier is a fair substitute. That's what the tags are for.</li>
<li><b>"Craftable from party level"</b> on each item is an estimate. It takes the easiest source for every component (lowest-CR creature, a guardian's CR, planar travel at about level 11–15) and assumes a party can take on a creature of CR ≈ its level. Use the <i>Party level</i> filter on Items to see what your group could realistically make right now.</li>
<li><b>Make it a quest.</b> A rare formula can simply be "the heartstone of the stone giant who guards the pass".</li>
</ul>
`;

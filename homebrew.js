/* The Scavenger's Codex: checking homebrew packs (pure logic, no DOM).
 *
 * A pack is a JSON file shaped like any file in data/ (materials, items, monsters, environments,
 * cultivation) plus an optional "homebrew" block { name, title, credit }.
 * validate() mirrors tools/validate.py, so a pack that passes here passes the site's checks too.
 * Run `node tools/test_homebrew.js` to confirm the two still agree.
 */
(function (root) {
  'use strict';
  const TIERS = ['mundane', 'common', 'uncommon', 'rare', 'very-rare', 'legendary'];
  const words = s => s.split(/\s+/);
  const FORM = words('hide fur scale carapace shell feather wing bone skull horn tooth claw stinger eye heart blood ichor venom gland organ brain tongue sinew meat fat hair tentacle silk slime core ash dust essence ectoplasm crystal stone metal ore ingot gem pearl coral salt sand ice oil resin sap wood bark leaf flower root fungus moss vine seed fruit herb ink wax thread cloth leather glass vessel salvage relic reagent food liquid');
  const AURA = words('fire cold lightning thunder acid poison necrotic radiant psychic force arcane primal fey shadow celestial fiendish infernal abyssal elemental earth air water');
  const TRAIT = words('stealth flight swimming climbing burrowing speed strength toughness regeneration senses darkvision truesight charm fear illusion invisibility petrification paralysis telepathy breathing resistance shapechange luck sleep healing light storm antimagic sound teleport death undeath blessing curse madness disease growth size domination knowledge protection binding time planar cunning');
  const ITEMT = words('weapon armor shield sword axe hammer bludgeon polearm bow crossbow dagger spear ammunition light-armor medium-armor heavy-armor potion scroll ring rod staff wand wondrous tool gear clothing jewelry container instrument focus poison food');
  const CTYPES = words('aberration beast celestial construct dragon elemental fey fiend giant humanoid monstrosity ooze plant undead');
  const TAGS = new Set([...FORM, ...AURA, ...TRAIT, ...ITEMT, ...CTYPES]);
  const TOOLS = new Set(words('alchemists-supplies brewers-supplies calligraphers-supplies carpenters-tools cartographers-tools cobblers-tools cooks-utensils glassblowers-tools herbalism-kit jewelers-tools leatherworkers-tools masons-tools painters-supplies potters-tools smiths-tools tinkers-tools weavers-tools woodcarvers-tools poisoners-kit harvesting-kit'));
  const STATIONS = new Set(words('none campfire forge alchemy-lab tannery workshop loom jewelers-bench scriptorium enchanting-circle shrine kitchen glassworks'));
  const ENVS = new Set(words('arctic coast desert forest grassland hill mountain swamp underdark underwater urban ruins feywild shadowfell elemental-fire elemental-water elemental-air elemental-earth lower-planes upper-planes astral'));
  const CATS = new Set(words('weapon armor ammunition potion oil poison scroll ring rod staff wand wondrous gear tool provision'));
  const SKILLS = new Set(words('Survival Medicine Nature Arcana Religion Investigation'));
  const SIZES = new Set(words('Tiny Small Medium Large Huge Gargantuan'));
  const ROLES = new Set(words('base keystone supporting binding'));
  const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const YIELD_RE = /^(\d*d\d+([+-]\d+)?|\d+)$/;
  const ti = t => TIERS.indexOf(t);

  function idHash(prefix, id) {
    let h = 0x811c9dc5; const s = prefix + id;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h & 0x1fffffff;
  }
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

  /**
   * @param pack   the parsed JSON
   * @param ctx    { things: Map(id -> {tier}), monsters: Map|Set, envs: Map|Set }  what the codex already has
   * @param own    optional { things:Set, monsters:Set } ids to ignore because this pack is replacing an older copy of itself
   * @returns { errors: string[], warnings: string[], counts: {materials, items, monsters, extensions, cultivation} }
   */
  function validate(pack, ctx, own) {
    const errors = [], warnings = [];
    const err = m => errors.push(m);
    const counts = { materials: 0, items: 0, monsters: 0, extensions: 0, cultivation: 0 };
    own = own || { things: new Set(), monsters: new Set() };
    if (!isObj(pack)) return { errors: ['The file must contain a JSON object (like the files in the data folder).'], warnings, counts };
    const lists = {};
    for (const k of ['materials', 'items', 'monsters', 'environments', 'cultivation']) {
      if (pack[k] !== undefined && !Array.isArray(pack[k])) err(`"${k}" must be a list.`);
      lists[k] = Array.isArray(pack[k]) ? pack[k] : [];
    }
    const known = Object.keys(pack).filter(k => !['materials', 'items', 'monsters', 'environments', 'cultivation', 'homebrew'].includes(k));
    if (known.length) warnings.push(`Ignoring unknown section${known.length > 1 ? 's' : ''}: ${known.join(', ')}.`);
    if (errors.length) return { errors, warnings, counts };
    if (!lists.materials.length && !lists.items.length && !lists.monsters.length && !lists.environments.length && !lists.cultivation.length) {
      return { errors: ['The pack is empty. It needs at least one of: materials, items, monsters, environments, cultivation.'], warnings, counts };
    }

    // ---- ids -------------------------------------------------------------------------
    const things = new Map(), monsters = new Map();
    const existsThing = id => things.has(id) || (ctx.things.has(id) && !own.things.has(id));
    const existsMonster = id => monsters.has(id) || (ctx.monsters.has(id) && !own.monsters.has(id));
    const tierOf = id => (things.get(id) || ctx.things.get(id) || {}).tier;
    for (const key of ['materials', 'items']) {
      lists[key].forEach((t, i) => {
        if (!isObj(t)) return err(`${key}[${i}] must be an object.`);
        const id = t.id;
        if (typeof id !== 'string' || !ID_RE.test(id)) return err(`${key}[${i}]: bad id "${id}" (lowercase letters, numbers and dashes).`);
        if (things.has(id)) return err(`Duplicate id "${id}" inside the pack.`);
        if (ctx.things.has(id) && !own.things.has(id)) return err(`"${id}" already exists in the codex. Pick another id.`);
        things.set(id, { ...t, _kind: key });
      });
    }
    lists.monsters.forEach((m, i) => {
      if (!isObj(m)) return err(`monsters[${i}] must be an object.`);
      const id = m.id;
      if (typeof id !== 'string' || !ID_RE.test(id)) return err(`monsters[${i}]: bad id "${id}".`);
      if (monsters.has(id)) return err(`Duplicate monster id "${id}" inside the pack.`);
      if (ctx.monsters.has(id) && !own.monsters.has(id)) return err(`Monster "${id}" already exists in the codex. Pick another id.`);
      monsters.set(id, m);
    });

    // ---- materials & items -----------------------------------------------------------
    function checkRecipe(id, r, rarity, isItem) {
      if (!isObj(r)) return err(`${id}: recipe must be an object.`);
      const comps = Array.isArray(r.components) ? r.components : [];
      if (!comps.length) err(`${id}: recipe has no components`);
      let keys = 0;
      for (const c of comps) {
        if (!isObj(c)) { err(`${id}: a component isn't an object`); continue; }
        if (!ROLES.has(c.role)) err(`${id}: bad role ${c.role}`);
        if (c.role === 'keystone') keys++;
        if ('m' in c) { if (!existsThing(c.m)) err(`${id}: unknown component id '${c.m}'`); }
        else if ('any' in c) {
          const bad = (Array.isArray(c.any) ? c.any : []).filter(x => !TAGS.has(x));
          if (!Array.isArray(c.any) || bad.length) err(`${id}: unknown tags in any-slot ${JSON.stringify(bad)}`);
          if ('min' in c && !TIERS.includes(c.min)) err(`${id}: bad min tier ${c.min}`);
          if (!c.label) err(`${id}: any-slot missing label`);
        } else if ('oneOf' in c) {
          for (const x of Array.isArray(c.oneOf) ? c.oneOf : []) if (!existsThing(x)) err(`${id}: unknown oneOf id '${x}'`);
          if (!c.label) err(`${id}: oneOf-slot missing label`);
        } else err(`${id}: slot without m/any/oneOf`);
        if (c.q !== undefined && typeof c.q !== 'number') err(`${id}: q must be number`);
      }
      for (const tl of r.tools || []) if (!TOOLS.has(tl)) err(`${id}: unknown tool '${tl}'`);
      if (!STATIONS.has(r.station === undefined ? 'none' : r.station)) err(`${id}: unknown station '${r.station}'`);
      for (const c of comps) {
        if (isObj(c) && c.role === 'keystone' && isItem && rarity !== 'mundane') {
          const ids = 'm' in c ? [c.m] : (c.oneOf || []);
          for (const x of ids) if (existsThing(x) && ti(tierOf(x) || 'mundane') < ti(rarity)) err(`${id}: keystone option '${x}' (${tierOf(x)}) is below item tier ${rarity}`);
          if ('any' in c && ti(c.min || 'mundane') < ti(rarity)) err(`${id}: any-keystone min '${c.min || 'mundane'}' is below item tier ${rarity}`);
        }
      }
      if (isItem && rarity !== 'mundane' && keys !== 1) err(`${id}: magic item should have exactly 1 keystone (has ${keys})`);
    }
    for (const [id, t] of things) {
      if (!TIERS.includes(t.tier)) err(`${id}: bad tier '${t.tier}'`);
      const bad = (Array.isArray(t.tags) ? t.tags : []).filter(x => !TAGS.has(x));
      if (bad.length) err(`${id}: unknown tags ${JSON.stringify(bad)}`);
      if (t.tags !== undefined && !Array.isArray(t.tags)) err(`${id}: tags must be a list`);
      if (!t.name) err(`${id}: missing name`);
      if (t._kind === 'items') {
        counts.items++;
        if (!CATS.has(t.cat)) err(`${id}: bad cat '${t.cat}'`);
        if (!t.effect) err(`${id}: missing effect`);
      } else { counts.materials++; if (!t.desc) err(`${id}: missing desc`); }
      if (t.recipe) checkRecipe(id, t.recipe, t.tier, t._kind === 'items');
      else if (t._kind === 'items' && t.src !== 'unobtainable') err(`${id}: item without recipe`);
    }

    // ---- creatures -------------------------------------------------------------------
    for (const [id, m] of monsters) {
      counts.monsters++;
      if (!CTYPES.includes(m.type)) err(`${id}: bad type ${m.type}`);
      if (!SIZES.has(m.size)) err(`${id}: bad size ${m.size}`);
      for (const e of m.env || []) if (!ENVS.has(e)) err(`${id}: unknown env '${e}'`);
      if (!m.name) err(`${id}: missing name`);
      if (!Array.isArray(m.harvest) || !m.harvest.length) err(`${id}: no harvest entries`);
      for (const h of Array.isArray(m.harvest) ? m.harvest : []) {
        if (!isObj(h) || !existsThing(h.m)) err(`${id}: harvest unknown material '${isObj(h) ? h.m : h}'`);
        else if (!SKILLS.has(h.skill)) err(`${id}: bad skill '${h.skill}'`);
        else if (h.dice !== undefined && !YIELD_RE.test(String(h.dice))) err(`${id}: harvest '${h.m}' has a bad dice value '${h.dice}'`);
      }
    }

    // ---- places (extend existing environments only) -----------------------------------
    for (const e of lists.environments) {
      if (!isObj(e) || typeof e.id !== 'string') { err('An environment entry needs an id.'); continue; }
      counts.extensions++;
      if (!ctx.envs.has(e.id)) err(`environment '${e.id}': new places aren't supported yet. Extend an existing one (${[...ENVS].slice(0, 6).join(', ')}, …).`);
      if (!e.extend) err(`environment '${e.id}': add "extend": true. Homebrew can add finds to an existing place, not replace it.`);
      for (const g of Array.isArray(e.gather) ? e.gather : []) {
        if (!existsThing(g.m)) err(`env ${e.id}: unknown material '${g.m}'`);
        if (!SKILLS.has(g.skill)) err(`env ${e.id}: bad skill '${g.skill}'`);
        if (g.guard && !existsMonster(g.guard.m)) err(`env ${e.id}: guard for ${g.m} is unknown monster '${g.guard.m}'`);
        if ('risk' in g && ![0, 1, 2, 3].includes(g.risk)) err(`env ${e.id}: ${g.m} risk must be 0-3`);
        for (const x of [...(g.foes || []), ...((g.guard || {}).alt || [])]) if (!existsMonster(x)) err(`env ${e.id}: ${g.m} lists unknown creature '${x}'`);
      }
    }

    // ---- cultivation -----------------------------------------------------------------
    for (const c of lists.cultivation) {
      counts.cultivation++;
      if (!existsThing(c.m)) err(`cultivation: unknown material '${c.m}'`);
      if (!['plot', 'greenhouse', 'cellar', 'grove'].includes(c.site)) err(`cultivation ${c.m}: bad site '${c.site}'`);
      if (!YIELD_RE.test(String(c.yield === undefined ? '' : c.yield))) err(`cultivation ${c.m}: bad yield '${c.yield}'`);
      if (typeof c.days !== 'number' || c.days <= 0) err(`cultivation ${c.m}: days must be a positive number`);
    }

    // ---- unlock-code hashes must stay unique (see idHash in app.js) -----------------------
    for (const [prefix, fresh, all] of [['t:', things.keys(), ctx.things.keys()], ['c:', monsters.keys(), ctx.monsters.keys()]]) {
      const seen = new Map();
      for (const id of all) if (!(prefix === 't:' ? own.things : own.monsters).has(id)) seen.set(idHash(prefix, id), id);
      for (const id of fresh) {
        const h = idHash(prefix, id);
        if (seen.has(h) && seen.get(h) !== id) err(`code hash collision: '${seen.get(h)}' and '${id}' (rename the new one)`);
        seen.set(h, id);
      }
    }
    return { errors, warnings, counts };
  }

  root.CodexHomebrew = { validate, slug, idHash, TIERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CodexHomebrew;
})(typeof window !== 'undefined' ? window : globalThis);

/* The Scavenger's Codex — app logic (no build step, no dependencies). */
(() => {
'use strict';

/* ================================================================ constants */
const TIERS = ['mundane', 'common', 'uncommon', 'rare', 'very-rare', 'legendary'];
const TIER_LABEL = { mundane: 'Mundane', common: 'Common', uncommon: 'Uncommon', rare: 'Rare', 'very-rare': 'Very rare', legendary: 'Legendary' };
const ti = t => Math.max(0, TIERS.indexOf(t));
const CAT_LABEL = { weapon: 'Weapon', armor: 'Armor', ammunition: 'Ammunition', potion: 'Potion', oil: 'Oil', poison: 'Poison', scroll: 'Scroll', ring: 'Ring', rod: 'Rod', staff: 'Staff', wand: 'Wand', wondrous: 'Wondrous item', gear: 'Gear', tool: 'Tool', provision: 'Provision' };
const TYPES = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'];
const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const FORM_TAGS = 'hide fur scale carapace shell feather wing bone skull horn tooth claw stinger eye heart blood ichor venom gland organ brain tongue sinew meat fat hair tentacle silk slime core ash dust essence ectoplasm crystal stone metal ore ingot gem pearl coral salt sand ice oil resin sap wood bark leaf flower root fungus moss vine seed fruit herb ink wax thread cloth leather glass vessel salvage relic reagent food liquid'.split(' ');
const AURA_TAGS = 'fire cold lightning thunder acid poison necrotic radiant psychic force arcane primal fey shadow celestial fiendish infernal abyssal elemental earth air water'.split(' ');
const TRAIT_TAGS = 'stealth flight swimming climbing burrowing speed strength toughness regeneration senses darkvision truesight charm fear illusion invisibility petrification paralysis telepathy breathing resistance shapechange luck sleep healing light storm antimagic sound teleport death undeath blessing curse madness disease growth size domination knowledge protection binding time planar cunning'.split(' ');
const TOOL_NAMES = { 'alchemists-supplies': "Alchemist's supplies", 'brewers-supplies': "Brewer's supplies", 'calligraphers-supplies': "Calligrapher's supplies", 'carpenters-tools': "Carpenter's tools", 'cartographers-tools': "Cartographer's tools", 'cobblers-tools': "Cobbler's tools", 'cooks-utensils': "Cook's utensils", 'glassblowers-tools': "Glassblower's tools", 'herbalism-kit': 'Herbalism kit', 'jewelers-tools': "Jeweler's tools", 'leatherworkers-tools': "Leatherworker's tools", 'masons-tools': "Mason's tools", 'painters-supplies': "Painter's supplies", 'potters-tools': "Potter's tools", 'smiths-tools': "Smith's tools", 'tinkers-tools': "Tinker's tools", 'weavers-tools': "Weaver's tools", 'woodcarvers-tools': "Woodcarver's tools", 'poisoners-kit': "Poisoner's kit", 'harvesting-kit': 'Harvesting kit' };
const STATION_NAMES = { none: 'Anywhere', campfire: 'Campfire', forge: 'Forge', 'alchemy-lab': 'Alchemy lab', tannery: 'Tannery', workshop: 'Workshop', loom: 'Loom', 'jewelers-bench': "Jeweler's bench", scriptorium: 'Scriptorium', 'enchanting-circle': 'Enchanting circle', shrine: 'Shrine', kitchen: 'Kitchen', glassworks: 'Glassworks' };
const ENV_COLOR = { arctic: '#8FB8CF', coast: '#5E9FB0', desert: '#D1A660', forest: '#4F8A4B', grassland: '#9EB35A', hill: '#8F9A5A', mountain: '#8A8580', swamp: '#6B7D4E', underdark: '#6C5A86', underwater: '#2F6F9A', urban: '#9A7B63', ruins: '#9C8B6A', feywild: '#C27BB8', shadowfell: '#55596B', 'elemental-fire': '#D7603A', 'elemental-water': '#3B86C4', 'elemental-air': '#9CC3DA', 'elemental-earth': '#8B6B45', 'lower-planes': '#9E3B3B', 'upper-planes': '#D9B84A', astral: '#7F86C9' };
const ROLE_ORDER = ['base', 'keystone', 'supporting', 'binding'];
const ROLE_LABEL = { base: 'Base', keystone: 'Keystone', supporting: 'Supporting', binding: 'Binding' };
const PAGE = 60;
const LS_KEY = 'scavengers-codex.satchel.v1';

/* ================================================================ icons */
const P = {
  essence: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  hide: '<path d="M7 4c1.5 1 3.2 1.4 5 1.4S15.5 5 17 4c.4 2 1.6 3 3 3.4-.7 2.1-.7 4.2 0 6.3-1.6.7-2.6 2.2-2.6 4.1-1.9.3-3.6 1.3-5.4 3.2-1.8-1.9-3.5-2.9-5.4-3.2 0-1.9-1-3.4-2.6-4.1.7-2.1.7-4.2 0-6.3C5.4 7 6.6 6 7 4z"/>',
  bone: '<path d="M8.5 15.5l7-7"/><path d="M8.5 15.5a2.3 2.3 0 1 1-3.2 1.6 2.3 2.3 0 1 1 1.6-3.2zM15.5 8.5a2.3 2.3 0 1 1 3.2-1.6 2.3 2.3 0 1 1-1.6 3.2z"/>',
  fang: '<path d="M6 4c4 0 8 1 12 0-1 5-2.5 10-6 16C8.5 14 7 9 6 4z"/><path d="M9.5 6.8c1.5 3 2.2 6 2.5 9"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  drop: '<path d="M12 3.5s6 6.4 6 10.6A6 6 0 0 1 6 14.1C6 9.9 12 3.5 12 3.5z"/><path d="M9.2 14.6a2.9 2.9 0 0 0 2.4 2.6"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 14-14-.2 9-5.7 14-14 14z"/><path d="M5 19l8-8"/>',
  gem: '<path d="M6.5 4h11L21 9l-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  ingot: '<path d="M3.5 16.5l3-7.5h11l3 7.5z"/><path d="M6.5 9l2-3.5h7l2 3.5"/>',
  feather: '<path d="M19.5 4.5C12 5 6.5 10 5.5 18.5"/><path d="M19.5 4.5c.5 6.5-4 12-12.4 12.8"/><path d="M4 20l1.5-1.5M10 12l3 .5M12.5 9l3 .5"/>',
  thread: '<path d="M7 4h10M7 20h10"/><path d="M8 4v16M16 4v16"/><path d="M8 8l8 2M8 12l8 2M8 16l8 2"/>',
  dust: '<path d="M3 19h18"/><path d="M5 19c1.5-4 4-6 7-6s5.5 2 7 6"/><circle cx="9" cy="8" r=".8"/><circle cx="14" cy="6" r=".8"/><circle cx="12" cy="10" r=".8"/>',
  relic: '<circle cx="12" cy="12" r="7.5"/><path d="M12 7.5v9M8.5 11h7"/>',
  quill: '<path d="M20 4c-7 1-11 6-12.5 13"/><path d="M20 4c-1 5-4.5 9.5-11 11.5"/><path d="M5 20l2.5-3"/>',
  sword: '<path d="M14.5 4H20v5.5L10 19.5 4.5 14z"/><path d="M4 20l2.5-2.5M8 13l3 3"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3 7.8-7.5 9.5-4.5-1.7-7.5-5-7.5-9.5V6z"/>',
  flask: '<path d="M9.5 3.5h5M10 3.5v5.2L5 18a2 2 0 0 0 1.8 2.8h10.4A2 2 0 0 0 19 18l-5-9.3V3.5"/><path d="M7.4 14.5h9.2"/>',
  scroll: '<path d="M7 5h11a2 2 0 0 1 0 4h-2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h10v1a3 3 0 0 0 3 3"/><path d="M7 5a2 2 0 0 0-2 2v10"/>',
  ring: '<circle cx="12" cy="14.5" r="6"/><path d="M9.5 8.8L12 5l2.5 3.8"/>',
  wand: '<path d="M4 20L15 9"/><path d="M17 3v3M17 12v3M11.5 7.5h3M19.5 7.5h3M13.5 4l1.5 1.5M19 10.5l1.5 1.5M19 4.5L20.5 3"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  bowl: '<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3"/>',
  arrow: '<path d="M4 20L18 6"/><path d="M13 5.5h5.5V11"/><path d="M4 20v-3.5M4 20h3.5M6.5 17.5v-3M6.5 17.5h3"/>',
  poison: '<path d="M12 3.5s6 6.4 6 10.6A6 6 0 0 1 6 14.1C6 9.9 12 3.5 12 3.5z"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><path d="M10 16.5h4"/>',
  beast: '<path d="M5 9l1.5-5L10 7.5h4L17.5 4 19 9c1 1.6 1.5 3.3 1.5 5 0 3.6-3.8 6.5-8.5 6.5S3.5 17.6 3.5 14c0-1.7.5-3.4 1.5-5z"/><circle cx="9" cy="13" r=".9"/><circle cx="15" cy="13" r=".9"/><path d="M11 16.5h2"/>',
  dragon: '<path d="M4 18c3-1 5-3 6-6-2 0-3.5-1-4-3 2.5 0 4 .5 5 1.5C12 7 14.5 5 18.5 4.5 17 6.5 16.5 8 17 10c1.5 0 2.5.5 3 1.5-1.5.5-2.5 1.5-3 3-1 3-4 4.5-8 4.5z"/>',
  skull: '<path d="M12 3.5a7.5 7.5 0 0 0-5 13.1V20h10v-3.4a7.5 7.5 0 0 0-5-13.1z"/><circle cx="9.3" cy="11.5" r="1.6"/><circle cx="14.7" cy="11.5" r="1.6"/><path d="M11 20v-2.5M13 20v-2.5"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.3 2.4-5.5 3.7-8.3.8 1.8 1.8 2.8 3 3.3 0-2.6 1-4.8 3-6.3.3 3.6 3.3 6 3.3 10.3 0 4-2.5 7.2-6.5 7.2z"/>',
  wing: '<path d="M3 17c4-1 7.5-4.5 9-10 1.5 5.5 5 9 9 10-3 .5-5.3 2-6.5 3.5-1-1.2-1.8-1.7-2.5-1.7s-1.5.5-2.5 1.7C8.3 19 6 17.5 3 17z"/>',
  tentacle: '<path d="M6 20c0-6 2-10 6-12s5-4 4-6"/><path d="M11 20c.5-4 2-6.5 4.5-8S19 8 19 6"/><circle cx="8.6" cy="14" r=".8"/><circle cx="13.6" cy="15.5" r=".8"/>',
  golem: '<rect x="6" y="3.5" width="12" height="8" rx="1.5"/><path d="M4 20l2-8.5h12l2 8.5"/><path d="M9.5 7.5h1M13.5 7.5h1"/>',
  plant: '<path d="M12 21V10"/><path d="M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6zM12 10c0-4 2.5-6.5 6.5-6.5 0 4-2.5 6.5-6.5 6.5z"/>',
  ooze: '<path d="M4 17c0-5 3.6-10 8-10s8 5 8 10c0 1.6-1.2 3-3 3-1 0-1.5-.8-2.5-.8S13 20 12 20s-1.5-.8-2.5-.8S8 20 7 20c-1.8 0-3-1.4-3-3z"/><circle cx="10" cy="13" r="1"/><circle cx="14.5" cy="12" r=".7"/>',
  person: '<circle cx="12" cy="7" r="3.5"/><path d="M5 20.5c.5-4.3 3.3-7 7-7s6.5 2.7 7 7"/>',
  halo: '<ellipse cx="12" cy="5" rx="5" ry="1.8"/><path d="M12 9.5l1.5 4.5L18 15.5l-4.5 1.5L12 21l-1.5-4L6 15.5l4.5-1.5z"/>',
  horns: '<path d="M6 4c-2 4 0 7 3 8M18 4c2 4 0 7-3 8"/><path d="M8 11.5c0 5 1.5 9 4 9s4-4 4-9"/><circle cx="10.5" cy="14" r=".8"/><circle cx="13.5" cy="14" r=".8"/>',
  giant: '<path d="M8 21v-5l-2-4 2.5-6h7l2.5 6-2 4v5"/><circle cx="12" cy="4" r="2.3"/><path d="M6 12H3.5M18 12h2.5"/>',
  mountain: '<path d="M2.5 19.5l6.5-12 4 6.5 2.5-3.5 6 9z"/><path d="M7.3 10l1.7 1.5 1.7-1.3"/>',
  mind: '<path d="M8.5 19.5V17a6.5 6.5 0 1 1 7-4.5l1.5 2.5h-2v2a2 2 0 0 1-2 2z"/><path d="M11 8.5c1-1 3-1 3.5.5"/>',
  sparkle: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.3 2.3M15.2 15.2l2.3 2.3M17.5 6.5l-2.3 2.3M8.8 15.2l-2.3 2.3"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>', scroll2: '',
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>', home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/>', book: '<path d="M4 5.5A2 2 0 0 1 6 3.5h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20.5V5.5M8 7.5h7"/>',
  pack: '<path d="M7 8V6a5 5 0 0 1 10 0v2"/><path d="M5 8h14l-1 12H6z"/><path d="M9 13h6"/>', map: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>', trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>'
};
const svg = (k, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${P[k] || P.star}</svg>`;

function iconKey(t) {
  if (!t) return 'star';
  if (t.kind === 'place') return 'map';
  if (t.kind === 'monster') return { beast: 'beast', dragon: 'dragon', undead: 'skull', elemental: 'flame', aberration: 'tentacle', construct: 'golem', plant: 'plant', ooze: 'ooze', humanoid: 'person', celestial: 'halo', fiend: 'horns', giant: 'giant', fey: 'sparkle', monstrosity: 'fang' }[t.type] || 'beast';
  if (t.kind === 'item') {
    const c = { weapon: 'sword', armor: 'shield', ammunition: 'arrow', potion: 'flask', oil: 'flask', poison: 'poison', scroll: 'scroll', ring: 'ring', rod: 'wand', staff: 'wand', wand: 'wand', wondrous: 'star', gear: 'tool', tool: 'tool', provision: 'bowl' }[t.cat];
    if (t.tags.includes('shield')) return 'shield';
    if (t.tags.includes('clothing') && (t.cat === 'gear' || t.cat === 'wondrous')) return 'thread';
    if (t.tags.includes('jewelry')) return 'ring';
    return c || 'star';
  }
  const g = t.tags || [];
  const has = (...a) => a.some(x => g.includes(x));
  if (has('essence', 'core', 'ectoplasm')) return 'essence';
  if (has('eye')) return 'eye';
  if (has('heart', 'organ', 'brain', 'gland', 'tongue')) return 'heart';
  if (has('venom')) return 'poison';
  if (has('blood', 'ichor', 'liquid', 'oil', 'slime', 'sap', 'resin')) return 'drop';
  if (has('feather', 'wing')) return 'feather';
  if (has('tooth', 'claw', 'stinger', 'horn')) return 'fang';
  if (has('bone', 'skull')) return 'bone';
  if (has('hide', 'fur', 'scale', 'carapace', 'shell', 'leather')) return 'hide';
  if (has('ingot', 'ore', 'metal')) return 'ingot';
  if (has('gem', 'crystal', 'pearl', 'coral', 'stone', 'ice', 'glass')) return 'gem';
  if (has('leaf', 'flower', 'root', 'fungus', 'moss', 'vine', 'seed', 'fruit', 'herb', 'bark', 'wood')) return 'leaf';
  if (has('hair', 'silk', 'thread', 'cloth', 'sinew', 'tentacle')) return 'thread';
  if (has('ink')) return 'quill';
  if (has('dust', 'ash', 'salt', 'sand', 'reagent', 'wax')) return 'dust';
  if (has('food', 'meat', 'fat')) return 'bowl';
  if (has('salvage', 'relic', 'vessel')) return 'relic';
  return 'star';
}
const ico = (t, lg) => `<span class="ico${lg ? ' lg' : ''} t-${t && t.tier ? t.tier : 'common'}">${svg(iconKey(t))}</span>`;

/* ================================================================ utils */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const pill = t => `<span class="pill t-${t}">${TIER_LABEL[t] || t}</span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const fmtGp = v => v == null ? '—' : (v >= 1 ? `${Number(v).toLocaleString('en-US')} gp` : v >= 0.1 ? `${Math.round(v * 10)} sp` : `${Math.max(1, Math.round(v * 100))} cp`);
const crNum = cr => { if (cr == null) return 0; const s = String(cr); if (s.includes('/')) { const [a, b] = s.split('/'); return a / b; } return +s; };
const envName = id => (D.envs.get(id) || {}).name || cap(id.replace(/-/g, ' '));
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2200); }
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};

/* ================================================================ data */
let D = null;
const HB_KEY = 'scavengers-codex.homebrew';
let hbLoadError = '';
function localPacks() { const l = store.get(HB_KEY, []); return Array.isArray(l) ? l.filter(p => p && p.name && p.data && typeof p.data === 'object') : []; }
async function loadRaw() {
  if (window.CODEX_DATA) return window.CODEX_DATA;
  const man = await (await fetch('data/manifest.json')).json();
  const parts = await Promise.all(man.files.map(f => fetch('data/' + f).then(r => { if (!r.ok) throw new Error(f); return r.json(); })));
  return parts;
}
function buildIndex(parts) {
  const things = new Map(), monsters = new Map(), envs = new Map(), grow = new Map();
  for (const p of parts) {
    for (const k of ['materials', 'items']) for (const t of p[k] || []) {
      t.kind = k === 'items' ? 'item' : 'material';
      t.tags = t.tags || [];
      things.set(t.id, t);
    }
    for (const m of p.monsters || []) { m.kind = 'monster'; monsters.set(m.id, m); }
    for (const e of p.environments || []) if (!e.extend) { e.kind = 'place'; envs.set(e.id, e); }
    for (const c of p.cultivation || []) grow.set(c.m, c);
  }
  // A homebrew pack can add finds to an existing place ("extend": true). Applied after every base place exists.
  for (const p of parts) for (const e of p.environments || []) if (e.extend) {
    const prev = envs.get(e.id); if (!prev) continue;
    envs.set(e.id, { ...prev, gather: [...(prev.gather || []), ...(e.gather || [])] });
  }
  const src = new Map(), gat = new Map(), usedIn = new Map(), anySlots = [], envMon = new Map();
  const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
  for (const m of monsters.values()) {
    for (const h of m.harvest || []) {
      const t = things.get(h.m); if (!t) continue;
      if (!m.salvage && !t.tags.includes(m.type)) t.tags.push(m.type);
      push(src, h.m, { m, h });
    }
    for (const e of m.env || []) push(envMon, e, m);
  }
  for (const t of things.values()) if ((t.tags.includes('infernal') || t.tags.includes('abyssal')) && !t.tags.includes('fiendish')) t.tags.push('fiendish');
  for (const e of envs.values()) for (const g of e.gather || []) push(gat, g.m, { e, g });
  for (const t of things.values()) {
    const r = t.recipe; if (!r) continue;
    r.components.forEach((c, i) => {
      if (c.m) push(usedIn, c.m, { t, c, i, via: 'direct' });
      else if (c.oneOf) c.oneOf.forEach(o => push(usedIn, o, { t, c, i, via: 'option' }));
      else if (c.any) anySlots.push({ t, c, i });
    });
  }
  // search index
  const search = [];
  const addS = (o, kind, sub) => search.push({ o, kind, n: o.name.toLowerCase(), w: o.name.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean), tags: o.tags || [], sub });
  for (const t of things.values()) addS(t, t.kind, t.kind === 'item' ? (CAT_LABEL[t.cat] || t.cat) : 'Material');
  for (const m of monsters.values()) {
    addS(m, 'monster', `${cap(m.type)} · ${m.size}`); search[search.length - 1].cr = true;
    for (const alt of m.aka || []) search.push({ o: m, kind: 'monster', n: alt.toLowerCase(), w: alt.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean), tags: [], sub: `2024 name for ${m.name}` });
  }
  for (const e of envs.values()) addS(e, 'place', 'Place');
  for (const id of [...grow.keys()]) if (!things.has(id)) grow.delete(id);
  D = { things, monsters, envs, src, gat, usedIn, anySlots, envMon, search, grow,
    items: [...things.values()].filter(t => t.kind === 'item').sort(byName),
    materials: [...things.values()].filter(t => t.kind === 'material').sort(byName),
    monsterList: [...monsters.values()].sort(byName) };
}
const byName = (a, b) => a.name.localeCompare(b.name);
const matches = (t, c) => c.any.every(x => t.tags.includes(x)) && ti(t.tier) >= ti(c.min || 'mundane');
function slotOptions(c) {
  if (c.m) return [D.things.get(c.m)].filter(Boolean);
  if (c.oneOf) return c.oneOf.map(id => D.things.get(id)).filter(Boolean);
  const out = []; for (const t of D.things.values()) if (matches(t, c)) out.push(t);
  return out.sort((a, b) => ti(a.tier) - ti(b.tier) || byName(a, b));
}
function thingSub(t) {
  if (t.kind === 'item') return `${CAT_LABEL[t.cat] || cap(t.cat)}${t.attune ? ' · attunement' : ''}${known(t) ? '' : ' · formula unknown'}`;
  const s = (D.src.get(t.id) || []).filter(x => seeMon(x.m)), sAll = (D.src.get(t.id) || []).length;
  if (s.length) return s.length === 1 && sAll === 1 ? s[0].m.name : isDM() ? `${s[0].m.name} +${sAll - 1} more` : `${s[0].m.name} and others`;
  if (sAll) return 'From an unknown creature';
  const g = (D.gat.get(t.id) || []).filter(x => seePlace(x.e));
  if (g.length) return g.map(x => x.e.name).slice(0, 2).join(', ') + (g.length > 2 ? '…' : '');
  if ((D.gat.get(t.id) || []).length) return 'Found somewhere undiscovered';
  if (t.recipe) return 'Refined / crafted';
  return 'Trade good';
}
function linkOf(o) { return o.kind === 'monster' ? `#/monster/${o.id}` : o.kind === 'place' ? `#/place/${o.id}` : `#/${o.kind}/${o.id}`; }


/* ================================================================ reachability (mirrors tools/playtest.py) */
const ENV_LEVEL = { feywild: 5, shadowfell: 6, underdark: 4, 'elemental-fire': 11, 'elemental-water': 11, 'elemental-air': 11, 'elemental-earth': 11, 'lower-planes': 13, 'upper-planes': 13, astral: 15 };
const MIN_LEVEL = { mundane: 1, common: 1, uncommon: 3, rare: 6, 'very-rare': 11, legendary: 17 };
const crLevel = cr => { const c = crNum(cr); return c < 1 ? 1 : Math.min(20, Math.max(1, Math.round(c * 0.85 + 0.5))); };
const skillBonus = L => (L < 4 ? 3 : L < 8 ? 4 : 5) + 2 + Math.floor((L - 1) / 4);
const accMemo = new Map();
function access(id, stack = new Set()) {
  if (accMemo.has(id)) return accMemo.get(id);
  if (stack.has(id)) return 99;
  const t = D.things.get(id); let best = 99;
  for (const { m } of D.src.get(id) || []) best = Math.min(best, crLevel(m.cr));
  for (const { e, g } of D.gat.get(id) || []) {
    let lv = ENV_LEVEL[e.id] || 1;
    const gd = g.guard && D.monsters.get(g.guard.m); if (gd) lv = Math.max(lv, crLevel(gd.cr));
    while (lv < 20 && (21 - (g.dc - skillBonus(lv))) / 20 < 0.5) lv++;
    best = Math.min(best, lv);
  }
  if (!(D.src.get(id) || []).length && !(D.gat.get(id) || []).length && !t.recipe) best = Math.min(best, { mundane: 1, common: 1, uncommon: 3 }[t.tier] || 99);
  if (t.recipe) {
    stack.add(id);
    let lv = t.recipe.level || MIN_LEVEL[t.tier] || 1, ok = true;
    for (const c of t.recipe.components) {
      let a = 99; for (const o of slotOptions(c)) { a = Math.min(a, access(o.id, stack)); if (a <= 1) break; }
      if (a >= 99) { ok = false; break; } lv = Math.max(lv, a);
    }
    stack.delete(id);
    if (ok) best = Math.min(best, lv);
  }
  accMemo.set(id, best);
  return best;
}

/* ================================================================ search */
function scoreEntry(e, toks, full) {
  let s = 0;
  for (const tk of toks) {
    let best = 0;
    for (const w of e.w) {
      if (w === tk || w === tk + 's' || w + 's' === tk || w === tk + 'es') best = Math.max(best, 100);
      else if (w.startsWith(tk)) best = Math.max(best, 70 - Math.min(20, w.length - tk.length));
    }
    if (!best && e.n.includes(tk)) best = 40;
    if (!best && e.tags.includes(tk)) best = 30;
    if (!best && tk.length > 3 && e.o.type === tk) best = 30;
    if (!best && tk.length >= 3) { // subsequence fuzzy
      let i = 0; for (const ch of e.n) if (ch === tk[i]) i++;
      if (i === tk.length) best = 8;
    }
    if (!best) return 0;
    s += best;
  }
  if (e.n === full) s += 250; else if (e.n.startsWith(full)) s += 80;
  s -= e.n.length * 0.15;
  if (e.kind === 'monster' || e.kind === 'place') s += 4;
  return s;
}
function doSearch(q, limit = 50, kinds) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const toks = q.split(/\s+/).filter(Boolean);
  const res = [];
  for (const e of D.search) {
    if (kinds && !kinds.includes(e.kind)) continue;
    if (!isDM() && !seeAny(e.o)) continue;
    const s = scoreEntry(e, toks, q); if (s > 0) res.push([s, e]);
  }
  res.sort((a, b) => b[0] - a[0]);
  const seen = new Set(), out = [];
  for (const [, e] of res) { if (seen.has(e.o)) continue; seen.add(e.o); out.push(e); if (out.length >= limit) break; }
  return out;
}
const KIND_LABEL = { item: 'Item', material: 'Material', monster: 'Creature', place: 'Place' };

function wireTypeahead(input, box, onPick, kinds, footer) {
  let sel = -1, cur = [];
  const render = () => {
    const q = input.value;
    cur = doSearch(q, 9, kinds);
    if (!q.trim()) { box.hidden = true; return; }
    if (footer && /^\s*sc-/i.test(q)) { cur = []; box.innerHTML = `<div class="sug on">${svg('scroll')}<span><b>Unlock this code</b><br><span class="small muted">Press Enter to add it to your journal</span></span></div>`; box.hidden = false; return; }
    box.innerHTML = cur.map((e, i) => `<a class="sug${i === sel ? ' on' : ''}" data-i="${i}" href="${linkOf(e.o)}" role="option">${ico(e.o)}<span><b>${esc(e.o.name)}</b><br><span class="small muted">${esc(e.sub)}${e.cr && showCR() ? ` · CR ${esc(e.o.cr)}` : ''}</span></span><span class="kind">${KIND_LABEL[e.kind]}</span></a>`).join('')
      + (footer ? `<div class="sug-foot">${cur.length ? 'Enter for all results' : 'No matches'}${cur.length ? '' : ' — try fewer letters'}</div>` : (cur.length ? '' : '<div class="sug-foot">No matches</div>'));
    box.hidden = false;
  };
  input.addEventListener('input', () => { sel = -1; render(); });
  input.addEventListener('focus', () => { if (input.value.trim()) render(); });
  input.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown') { sel = Math.min(cur.length - 1, sel + 1); render(); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); render(); ev.preventDefault(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); onPick(sel >= 0 ? cur[sel] : null, input.value); box.hidden = true; }
    else if (ev.key === 'Escape') { box.hidden = true; input.blur(); }
  });
  box.addEventListener('mousedown', ev => { const a = ev.target.closest('.sug'); if (!a) return; ev.preventDefault(); onPick(cur[+a.dataset.i], input.value); box.hidden = true; });
  box._input = input;
}

document.addEventListener('click', ev => {
  document.querySelectorAll('.suggest').forEach(box => { if (!box.hidden && !box.contains(ev.target) && ev.target !== box._input) box.hidden = true; });
});

/* ================================================================ satchel */
let sat = store.get(LS_KEY, {});
function saveSat() { for (const k of Object.keys(sat)) if (!(sat[k] > 0) || !D.things.has(k)) delete sat[k]; store.set(LS_KEY, sat); if (typeof Party !== 'undefined' && Party.known) { learnOwned(); syncStamps(); } renderNav(); }
function addSat(id, q = 1) { sat[id] = (sat[id] || 0) + q; saveSat(); }
/* ---- spoilage: one stamp per part (its oldest batch), on the party's clock ---- */
const PERISH_H = { '1 minute': 1 / 60, '1 hour': 1, '1 day': 24, '1 week': 168 };
const PRESERVE = {
  '1 minute': { need: 'essence-vessel', life: Infinity, label: 'Seal in a vessel', done: 'Sealed in a vessel' },
  '1 hour': { need: 'preserving-salts', life: 168, label: 'Pack in salts', done: 'Packed in salts' },
  '1 day': { need: null, life: 168, label: 'Salt or chill', done: 'Salted / kept cold' },
  '1 week': { need: null, life: 720, label: 'Seal it dry', done: 'Sealed dry' }
};
// Spoilage can be switched off for the party (clock bar), or by default in config.json ("spoilage": false).
const spoilOn = () => Party.spoil != null ? !!Party.spoil : CFG.spoilage !== false;
// Each perishable part keeps a list of batches, so a fresh harvest never inherits an old stack's clock.
function batchesOf(id) {
  let b = Party.stamps[id]; if (!b) return [];
  if (!Array.isArray(b)) { b = [{ at: b.at, q: (sat[id] || 0) + Party.qty(id), pres: !!b.pres }]; Party.stamps[id] = b; }
  return b;
}
function batchLeft(t, x) { const life = x.pres ? PRESERVE[t.perish].life : PERISH_H[t.perish]; return { life, left: x.at + life - Party.clock }; }
function syncStamps() {
  if (typeof Party === 'undefined' || !Party.stamps) return;
  let ch = false;
  if (!spoilOn()) { if (Object.keys(Party.stamps).length) { Party.stamps = {}; Party.save(); } return; }
  const have = new Set([...Object.keys(sat).filter(k => sat[k] > 0), ...Object.keys(Party.items)]);
  for (const id of have) {
    const t = D.things.get(id); if (!t || !PERISH_H[t.perish]) continue;
    const bs = Party.stamps[id] ? batchesOf(id) : (Party.stamps[id] = []), total = (sat[id] || 0) + Party.qty(id), sum = bs.reduce((a, x) => a + x.q, 0);
    if (total > sum) { bs.push({ at: Party.clock, q: total - sum }); ch = true; }
    else if (total < sum) {
      // parts that were used up come out of the oldest usable batch first, spoiled ones last
      let n = sum - total; const order = [...bs].sort((a, b) => (batchLeft(t, a).left <= 0) - (batchLeft(t, b).left <= 0) || a.at - b.at);
      for (const x of order) { const k = Math.min(x.q, n); x.q -= k; n -= k; if (!n) break; }
      Party.stamps[id] = bs.filter(x => x.q > 0); ch = true;
    }
    if (Party.stamps[id] && !Party.stamps[id].length) delete Party.stamps[id];
  }
  for (const id of Object.keys(Party.stamps)) if (!have.has(id)) { delete Party.stamps[id]; ch = true; }
  if (ch) Party.save();
}
function spoilInfo(t) {
  if (!spoilOn() || !PERISH_H[t.perish]) return null;
  const bs = batchesOf(t.id); if (!bs.length) return null;
  const rows = bs.map(x => ({ ...x, ...batchLeft(t, x) })).map(x => ({ ...x, spoiled: x.left <= 0, soon: x.left > 0 && x.left !== Infinity && x.left <= Math.max(1, x.life * 0.25) }));
  const fresh = rows.filter(x => !x.spoiled), spoiledQ = rows.filter(x => x.spoiled).reduce((a, x) => a + x.q, 0);
  const next = fresh.sort((a, b) => a.left - b.left)[0];
  return { rows, spoiledQ, freshQ: fresh.reduce((a, x) => a + x.q, 0), next, spoiled: !fresh.length, soon: !!(next && next.soon), unpreserved: fresh.some(x => !x.pres) };
}
const fmtHours = h => h === Infinity ? 'indefinitely' : h < 1 ? 'minutes' : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
function fmtClock(h) { const d = Math.floor(h / 24) + 1, hh = Math.floor(h % 24); return `Day ${d} · ${String(hh).padStart(2, '0')}:00`; }
function spoilBadge(t) {
  const s = spoilInfo(t); if (!s) return '';
  const P = PRESERVE[t.perish], n = s.next, split = s.rows.length > 1;
  const freshTxt = n ? (n.soon ? `<span class="pill t-rare spoil">${t.perish === '1 minute' && !n.pres ? 'Seal it now!' : (split ? `${n.q} spoil${n.q === 1 ? 's' : ''} in ` : 'Spoils in ') + fmtHours(n.left)}</span>`
    : `<span class="small muted spoil">${split ? `${s.freshQ} fresh` : n.pres ? esc(P.done) : 'Fresh'}, ${n.left === Infinity ? 'keeps indefinitely' : (split ? 'next spoils in ' : 'keeps ') + fmtHours(n.left)}</span>`) : '';
  const badTxt = s.spoiledQ ? `<span class="pill t-legendary spoil">${s.spoiledQ} spoiled</span><button class="btn sm" type="button" data-act="toss" data-id="${t.id}">Throw out ${s.spoiledQ}</button>` : '';
  const btn = s.unpreserved ? `<button class="btn sm" type="button" data-act="preserve" data-id="${t.id}" title="${esc(P.label)}${P.need ? ' (uses 1 ' + esc((D.things.get(P.need) || {}).name || P.need) + ')' : ''}">${esc(P.label)}</button>` : '';
  return `<div class="spoil-row">${freshTxt}${btn}${badTxt}</div>`;
}
/* ---- cultivation: the party's garden beds, on the party clock ---- */
const SITES = {
  plot: { name: 'Garden plot', rank: 1, max: 'common', cost: 'about 5 gp and a patch of ground', desc: 'Tilled soil outdoors. Weather and pests matter.' },
  greenhouse: { name: 'Glasshouse', rank: 2, max: 'uncommon', cost: 'about 250 gp to build', desc: 'Glass, warmth and shelter. Grows anything a plot can, and tender plants too.' },
  cellar: { name: 'Mushroom cellar', rank: 0, max: 'uncommon', cost: 'about 100 gp to dig and shore up', desc: 'Dark, damp and still. Fungi and cave mosses only.' },
  grove: { name: 'Warded grove', rank: 3, max: 'rare', cost: 'about 2,000 gp and a rite your DM sets', desc: 'A fey-touched or consecrated circle. Grows anything except fungi.' }
};
const bedsFor = g => Object.keys(SITES).filter(k => bedFits(k, g)).map(k => SITES[k].name);
const bedFits = (site, g) => g.site === 'cellar' ? site === 'cellar' : site !== 'cellar' && SITES[site].rank >= SITES[g.site].rank;
function growDC(id) { const g = D.gat.get(id) || []; return g.length ? Math.min(...g.map(x => x.g.dc)) : 12; }
const GARDEN_EVENTS = [
  'Blight: a grey mould creeps through the bed. This harvest is halved.',
  'Pests: slugs, beetles or a hungry goat. The next tending check has disadvantage.',
  'A late frost bites. Growth slows another 2 days, unless the bed is under glass or underground.',
  'Something is drawn to the magic: a curious creature (a sprite, a stirge swarm, giant rats or worse, depending on the plant) visits tonight.',
  'The fey want their due: leave an offering worth a tenth of the plant\'s value, or the next harvest vanishes overnight.',
  'A neighbour\'s goat, child or apprentice tramples the bed. Growth is set back a week.',
  'Thieves: a rival herbalist has been taking cuttings. Catch them, or lose one from the next harvest.',
  'The plant reacts to its own magic: it glows, hums or whispers at night. No harm done, but people talk.',
  'Root rot from too much water. The next tending check is 2 harder.',
  'A lucky break: a passing druid or old gardener gives advice. The next tending check has advantage.'
];
// Growth runs on the party clock but pauses at each weekly tending point until someone tends it.
// A failed check takes growth back (2 days), so setbacks always cost real time.
function bedState(b) {
  const p = b.p; if (!p) return null;
  const g = D.grow.get(p.id) || {};
  if (p.grown == null) { p.grown = 0; p.since = p.at; p.need = g.days * 24; p.bonus = p.thrive ? 1 : 0; p.log = []; }
  const tendsNeeded = Math.floor(p.need / 168), point = p.tends < tendsNeeded ? (p.tends + 1) * 168 : p.need;
  const age = Math.max(0, Math.min(p.grown + Math.max(0, Party.clock - p.since), point));
  const due = p.tends < tendsNeeded && age >= point ? 1 : 0;
  const ready = p.tends >= tendsNeeded && age >= p.need;
  return { g, age, point, due, ready, toPoint: Math.max(0, point - age), tendsLeft: tendsNeeded - p.tends, left: Math.max(0, p.need - age), pct: Math.min(100, Math.round(age / p.need * 100)) };
}
function plantInto(b, id) {
  const g = D.grow.get(id); if (!g || !bedFits(b.site, g)) return false;
  if (!(usable()[id] > 0)) return false;
  consume(id, 1); saveSat();
  b.p = { id, grown: 0, since: Party.clock, need: g.days * 24, tends: 0, bonus: 0, n: 0, log: [] }; b.last = '';
  Party.note(`Planted ${D.things.get(id).name} in the ${SITES[b.site].name.toLowerCase()}`); Party.save(); return true;
}
function growSection(t) {
  const g = D.grow.get(t.id); if (!g) return '';
  const S = SITES[g.site], free = Party.beds.filter(b => !b.p && bedFits(b.site, g));
  const rows = [['Grows in', bedsFor(g).join(', ')], ['First harvest', `${g.days} days`], ['Yield', g.yield], ['After harvest', g.regrows ? 'It grows back' : 'Replant from a cutting'], ['Tending', `Nature check each week${showDC() ? `, DC ${growDC(t.id)}` : ''}`]];
  return fold('thing.grow', 'Can be grown', `<p class="small">${esc(g.needs)}</p>
    <div class="facts">${rows.map(([k, v]) => `<div class="fact"><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>
    <div class="frow">${usable()[t.id] > 0 && free.length ? `<button class="btn sm primary" type="button" data-act="gplantid" data-id="${t.id}">${svg('plant')}Plant a cutting (${esc(SITES[free[0].site].name.toLowerCase())})</button>` : ''}<a class="btn sm" href="#/garden">${svg('plant')}Open the garden</a>
      <span class="small muted">${usable()[t.id] > 0 ? (free.length ? '' : `No free bed that suits it. Add a ${esc(S.name.toLowerCase())} in the garden.`) : 'Plant one from your satchel: a single fresh piece counts as a cutting.'}</span></div>`);
}
function pGarden() {
  const inv0 = usable();
  const bedCard = b => {
    const st = bedState(b), S = SITES[b.site];
    let body;
    if (!st) {
      const opts = Object.keys(inv0).filter(id => D.grow.has(id) && bedFits(b.site, D.grow.get(id))).map(id => D.things.get(id)).sort(byName);
      body = opts.length ? `<div class="frow"><select class="select" id="gsel-${b.uid}" aria-label="What to plant">${opts.map(t => `<option value="${t.id}">${esc(t.name)} (${inv0[t.id]} in satchels)</option>`).join('')}</select><button class="btn sm primary" type="button" data-act="gplant" data-uid="${b.uid}">Plant</button></div>`
        : `<p class="small muted">Empty. Nothing in your satchels grows here yet: take a cutting of a growable plant when you forage${b.site === 'cellar' ? ' (fungi and cave mosses)' : ''}.</p>`;
      body += `<div class="frow"><button class="btn sm" type="button" data-act="gdel" data-uid="${b.uid}">Remove bed</button></div>`;
    } else {
      const t = D.things.get(b.p.id);
      const status = st.ready ? '<b>Ready to harvest</b>' : st.due ? '<b>Growth paused</b> until it is tended' : st.tendsLeft > 0 ? `Next tending in ${fmtHours(st.toPoint)} · ready in about ${fmtHours(st.left)}` : `Ready in ${fmtHours(st.left)}`;
      const tags = `${b.p.bonus ? `<span class="pill t-uncommon">+${b.p.bonus} to harvest</span>` : ''}${b.p.blight ? '<span class="pill t-legendary">Blighted: harvest halved</span>' : ''}${b.p.n ? `<span class="small muted">harvested ${b.p.n}× so far</span>` : ''}`;
      body = `<div class="bed-plant">${ico(t)}<div class="txt"><a href="${linkOf(t)}"><b>${esc(t.name)}</b></a><span class="small muted">${status}</span></div>${pill(t.tier)}</div>
        <div class="meter${st.ready ? '' : ' part'}"><i style="width:${st.pct}%"></i></div>
        ${tags ? `<div class="frow bed-tags">${tags}</div>` : ''}
        ${st.due ? `<div class="tend"><div class="small"><b>Tending is due</b> (week ${b.p.tends + 1}). Make a Nature check${showDC() ? ` (DC ${growDC(t.id)})` : ''}.</div>
          <div class="frow"><input class="textin mono" type="number" inputmode="numeric" id="gt-${b.uid}" placeholder="Total" aria-label="Nature check total" style="width:84px"><button class="btn sm primary" type="button" data-act="gtend" data-uid="${b.uid}">Record</button><span class="small muted">or</span><button class="btn sm" type="button" data-act="gtend" data-uid="${b.uid}" data-roll="1">Roll for me</button></div></div>` : ''}
        <div class="frow">${st.ready && !st.due ? `<button class="btn sm primary" type="button" data-act="gharvest" data-uid="${b.uid}">${svg('plus')}Harvest (${esc(st.g.yield)})</button>` : ''}<button class="btn sm" type="button" data-act="guproot" data-uid="${b.uid}">Uproot</button></div>`;
    }
    const log = b.p && (b.p.log || []).length ? `<details class="bed-log"><summary class="small">Tending log (${b.p.log.length})</summary><ol class="small">${b.p.log.map(x => `<li>${x}</li>`).join('')}</ol></details>` : '';
    return `<div class="card bed bed-${b.site}"><div class="bed-head"><b>${esc(S.name)}</b><span class="small muted">up to ${esc(TIER_LABEL[S.max].toLowerCase())}</span></div>${body}${b.last ? `<p class="small bed-last">${b.last}</p>` : ''}${log}</div>`;
  };
  const bonus = store.get('scavengers-codex.natureBonus', 3);
  const growables = [...D.grow.values()].map(g => ({ g, t: D.things.get(g.m) })).filter(x => seeThing(x.t)).sort((a, b) => ti(a.t.tier) - ti(b.t.tier) || byName(a.t, b.t));
  return `<div class="page"><div class="section-head"><h1>Garden</h1><span class="count">${plural(Party.beds.length, 'bed')}</span></div>
    <p class="lede">Grow herbs, fungi and rarer plants from cuttings. Plants grow on the party clock, need a Nature check each week, and many grow back after harvest.</p>
    ${clockBar()}
    <div class="frow"><label class="skill-in" for="gBonus">Nature bonus <input class="textin mono" type="number" id="gBonus" value="${esc(bonus)}"></label><span class="small muted">used by “Roll for me”.</span></div>
    ${Party.beds.length ? `<div class="beds">${Party.beds.map(bedCard).join('')}</div>` : '<div class="empty">No beds yet. Add one below: a garden plot is the easy start.</div>'}
    ${fold('garden.add', 'Add a bed', `<div class="sitegrid">${Object.entries(SITES).map(([k, S]) => `<div class="card site"><b>${esc(S.name)}</b><span class="small">${esc(S.desc)}</span><span class="small muted">Up to ${esc(TIER_LABEL[S.max].toLowerCase())} · ${esc(S.cost)}</span><button class="btn sm" type="button" data-act="gadd" data-site="${k}">${svg('plus')}Add</button></div>`).join('')}</div>
      <p class="small muted">Your DM decides whether you can build it and what it really costs.</p>`, { open: !Party.beds.length })}
    ${fold('garden.list', 'What can be grown', growables.length ? `<div class="tbl-wrap"><table><thead><tr><th>Plant</th><th>Grows in</th><th>First harvest</th><th>Yield</th><th>Regrows</th></tr></thead><tbody>${growables.map(({ g, t }) => `<tr><td><a href="${linkOf(t)}"><b>${esc(t.name)}</b></a> ${pill(t.tier)}</td><td class="small">${esc(bedsFor(g).join(', '))}</td><td class="mono">${g.days} days</td><td class="mono">${esc(g.yield)}</td><td>${g.regrows ? 'Yes' : 'No'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">You don\'t know of any growable plants yet.</div>', { open: false, count: growables.length })}
    ${isDM() ? fold('garden.dm', 'Garden events (DM)', `<p class="small muted">A tending check failed by 5 or more rolls on this table automatically. You can also roll it whenever the garden is left alone for a while.</p><ol class="small">${GARDEN_EVENTS.map(e => `<li>${esc(e)}</li>`).join('')}</ol><div class="frow"><button class="btn sm" type="button" data-act="gevent">Roll a garden event</button><span class="small" id="gEventOut"></span></div>`, { open: false }) : ''}
    <p class="small muted">See the <a href="#/rules/grow">cultivation rules</a>.</p></div>`;
}
/* ---- crafting projects (the workbench) ---- */
function workHours(time) { const m = String(time || '').match(/([\d.]+)\s*(minute|hour|day|week)/i); if (!m) return 8; return Math.max(0.25, +m[1] * { minute: 1 / 60, hour: 1, day: 8, week: 40 }[m[2].toLowerCase()]); }
const fmtWork = h => h < 8 ? `${+h.toFixed(2)} h` : (d => `${d} ${d === 1 ? 'day' : 'days'}`)(+(h / 8).toFixed(1));
function learnOwned() { const k = []; for (const id of Object.keys(sat)) if (!Party.known.has('t:' + id)) k.push('t:' + id); if (k.length) Party.know(k); }
function satCount() { return Object.keys(sat).length; }
function allocate(r, inv) {
  const pool = new Map(Object.entries(inv));
  const order = r.components.map((c, i) => ({ c, i })).sort((a, b) => pri(a.c) - pri(b.c));
  const slots = [];
  let need = 0, got = 0;
  for (const { c, i } of order) {
    let n = c.q || 1; const want = n; const used = [];
    let cands;
    if (c.m) cands = [c.m];
    else if (c.oneOf) cands = c.oneOf;
    else cands = [...pool.keys()].filter(id => { const t = D.things.get(id); return t && matches(t, c); }).sort((a, b) => ti(D.things.get(a).tier) - ti(D.things.get(b).tier));
    for (const id of cands) {
      const have = pool.get(id) || 0; if (!have) continue;
      const take = Math.min(have, n); pool.set(id, have - take); used.push([id, take]); n -= take; if (!n) break;
    }
    slots[i] = { used, missing: n, want };
    need += want; got += want - n;
  }
  return { slots, ok: slots.every(s => !s.missing), frac: need ? got / need : 0, missingSlots: slots.filter(s => s.missing).length };
}
function pri(c) { return c.m ? 0 : c.oneOf ? 1 : 2 + (5 - c.any.length) + (5 - ti(c.min || 'mundane')) * 0.1; }
function craftables() {
  const pool = usable();
  const ids = Object.keys(pool); if (!ids.length) return [];
  const idSet = new Set(ids);
  const satThings = ids.map(id => D.things.get(id)).filter(Boolean);
  const out = [];
  for (const t of D.things.values()) {
    const r = t.recipe; if (!r || !known(t)) continue;
    const touches = r.components.some(c => c.m ? idSet.has(c.m) : c.oneOf ? c.oneOf.some(o => idSet.has(o)) : satThings.some(s => matches(s, c)));
    if (!touches) continue;
    const a = allocate(r, pool);
    out.push({ t, a });
  }
  return out.sort((x, y) => (y.a.ok - x.a.ok) || (y.a.frac - x.a.frac) || (ti(y.t.tier) - ti(x.t.tier)) || byName(x.t, y.t));
}


/* ================================================================ config (site-wide, from config.json) */
const CFG_DEFAULT = { dmPin: null, startInPlayerView: false, spoilage: true, player: { places: 'all', creatures: 'beasts', materials: 'common', items: 'mundane', threat: 'vague' } };
let CFG = CFG_DEFAULT;
async function loadConfig() {
  let c = window.CODEX_CONFIG || null;
  if (!c && location.protocol !== 'file:') { try { const r = await fetch('config.json', { cache: 'no-cache' }); if (r.ok) c = await r.json(); } catch (e) { /* optional */ } }
  c = c && typeof c === 'object' ? c : {};
  CFG = { ...CFG_DEFAULT, ...c, player: { ...CFG_DEFAULT.player, ...(c.player || {}) } };
  CFG.siteUrl0 = CFG.siteUrl || null; const local = store.get('scavengers-codex.siteUrl', null); if (local) CFG.siteUrl = local;
}
// A peek-blocker, not security: anyone can read the site's files.
function pinHash(pin) { let h = 0x811c9dc5; const s = 'scavenger:' + String(pin).trim(); for (let r = 0; r < 500; r++) for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i) + r; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
const pinSet = () => CFG.dmPin || store.get('scavengers-codex.localPin', null);
const dmUnlocked = () => !pinSet() || store.get('scavengers-codex.dmUnlocked', null) === pinSet();

/* ================================================================ party: shared satchel, formulas, discoveries */
const PARTY_KEY = 'scavengers-codex.party.v1';
const slugify = c => String(c || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'my-party';
const Party = {
  code: slugify(store.get(PARTY_KEY + '.code', 'my-party')),
  items: {}, learned: new Set(), known: new Set(), research: {}, log: [], clock: 8, stamps: {}, projects: [], beds: [], spoil: null, session: null,
  localData() { return store.get(PARTY_KEY + '.data.' + this.code, {}); },
  save() { store.set(PARTY_KEY + '.data.' + this.code, { items: this.items, learned: [...this.learned], known: [...this.known], research: this.research, log: this.log.slice(0, 300), session: this.session, clock: this.clock, stamps: this.stamps, projects: this.projects, beds: this.beds, spoil: this.spoil }); },
  init() { this.load(); },
  load() {
    const d = this.localData();
    this.items = {}; for (const [k, v] of Object.entries(d.items || {})) if (D.things.has(k) && +v > 0) this.items[k] = Math.floor(+v);
    this.learned = new Set((d.learned || []).filter(id => D.things.has(id)));
    this.known = new Set(d.known || []); this.research = d.research || {}; this.log = d.log || [];
    this.clock = +d.clock || 8; this.stamps = d.stamps || {}; this.projects = (d.projects || []).filter(p => D.things.has(p.id)); this.beds = (d.beds || []).filter(b => SITES[b.site]); this.spoil = d.spoil ?? null; this.session = d.session || null;
    partyChanged();
  },
  setCode(c) { this.code = slugify(c); store.set(PARTY_KEY + '.code', this.code); this.load(); },
  qty(id) { return this.items[id] || 0; },
  set(id, q) { q = Math.max(0, Math.floor(q || 0)); if (q) { this.items[id] = q; this.known.add('t:' + id); } else delete this.items[id]; this.save(); syncStamps(); partyChanged(); },
  add(id, q) { this.set(id, this.qty(id) + q); },
  note(text) { this.log.unshift({ at: Date.now(), clock: this.clock, text: String(text).slice(0, 200) }); this.log = this.log.slice(0, 300); this.save(); },
  know(keys) { let n = 0; for (const k of keys) if (!this.known.has(k)) { this.known.add(k); n++; } if (n) { this.save(); partyChanged(); } return n; },
  teach(id, on) {
    if (on) { this.learned.add(id); this.know(formulaKeys(id)); } else this.learned.delete(id);
    this.save(); partyChanged();
  },
  shareCode() {
    const json = JSON.stringify({ c: this.code, i: this.items, l: [...this.learned], k: [...this.known], r: this.research, h: this.clock, s: this.stamps, j: this.projects, b: this.beds, sp: this.spoil });
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  parseShare(code) {
    try { const b = code.replace(/-/g, '+').replace(/_/g, '/'); const o = JSON.parse(decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4))))); return o && typeof o === 'object' ? o : null; } catch (e) { return null; }
  },
  applyShare(o, replace) {
    const items = {}; for (const [k, v] of Object.entries(o.i || {})) if (D.things.has(k) && +v > 0) items[k] = Math.floor(+v);
    if (replace) this.items = items; else for (const [k, v] of Object.entries(items)) this.items[k] = Math.max(this.qty(k), v);
    for (const id of (o.l || [])) if (D.things.has(id)) this.learned.add(id);
    for (const k of (o.k || [])) if (typeof k === 'string') this.known.add(k);
    for (const [k, v] of Object.entries(o.r || {})) if (D.things.has(k)) this.research[k] = Math.max(this.research[k] || 0, +v || 0);
    if (+o.h) this.clock = replace ? +o.h : Math.max(this.clock, +o.h);
    for (const [k, v] of Object.entries(o.s || {})) if (D.things.has(k) && v && (replace || !this.stamps[k])) this.stamps[k] = Array.isArray(v) ? v : [{ at: v.at, q: 1, pres: !!v.pres }];
    if (o.sp != null) this.spoil = o.sp;
    if (replace) this.projects = []; for (const p of o.j || []) if (D.things.has(p.id) && !this.projects.some(x => x.uid === p.uid)) this.projects.push(p);
    if (replace) this.beds = []; for (const b of o.b || []) if (SITES[b.site] && !this.beds.some(x => x.uid === b.uid)) this.beds.push(b);
    this.save(); partyChanged();
  }
};
let partyTimer;
function partyChanged() {
  if (!D) return;
  renderNav();
  clearTimeout(partyTimer);
  partyTimer = setTimeout(function tick() {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.id !== 'satAdd') { partyTimer = setTimeout(tick, 900); return; }
    if (/^#\/(satchel|party)/.test(location.hash)) rerender();
  }, 120);
}

/* ---- DM / player view ---- */
let mode = pinSet() && !dmUnlocked() ? 'player' : (store.get('scavengers-codex.mode', null) || (CFG.startInPlayerView ? 'player' : 'dm'));
const isDM = () => mode === 'dm';
const needsFormula = t => !!(t && t.recipe) && t.tier !== 'mundane' && t.tier !== 'common';
function known(t) { return isDM() || !needsFormula(t) || Party.learned.has(t.id); }
function setMode(m) { mode = m; store.set('scavengers-codex.mode', m); syncModeBtn(); rerender(); }
function requestMode(m) {
  if (m === 'dm' && !dmUnlocked()) { pinDialog(); return; }
  setMode(m); toast(m === 'dm' ? 'DM view: everything is visible' : 'Player view: only what the party has discovered');
}
function syncModeBtn() {
  const b = $('#modeBtn'); if (!b) return;
  const narrow = matchMedia('(max-width: 820px)').matches;
  b.textContent = mode === 'dm' ? (narrow ? 'DM' : 'DM view') : (narrow ? 'Player' : 'Player view');
  b.setAttribute('aria-pressed', mode === 'player');
  b.title = mode === 'dm' ? 'Everything is visible. Switch to player view to see only what the party has discovered.' : 'Only what your party has discovered is shown.' + (pinSet() ? ' DM view needs the PIN.' : '');
  b.classList.toggle('player', mode === 'player');
}
function pinDialog() {
  const wrap = document.createElement('div'); wrap.className = 'modal'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'pinTitle');
  wrap.innerHTML = `<form class="modal-card" id="pinForm"><h2 id="pinTitle">DM view is locked</h2><p class="small muted">Enter the DM's PIN to see everything on this device.</p>
    <input class="textin mono" id="pinIn" type="password" inputmode="numeric" autocomplete="off" aria-label="PIN" style="height:42px;font-size:1.1rem">
    <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="pinRemember" checked> Remember on this device</label>
    <p class="small" id="pinErr" style="color:var(--danger)" hidden>That PIN isn't right.</p>
    <div class="frow"><button class="btn primary" type="submit">Unlock</button><button class="btn" type="button" id="pinCancel">Cancel</button></div></form>`;
  document.body.appendChild(wrap);
  const inp = $('#pinIn'); inp.focus();
  $('#pinCancel').onclick = () => wrap.remove();
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') wrap.remove(); });
  $('#pinForm').onsubmit = e => {
    e.preventDefault();
    if (pinHash(inp.value) === pinSet()) { if ($('#pinRemember').checked) store.set('scavengers-codex.dmUnlocked', pinSet()); else dmSession = true; wrap.remove(); setMode('dm'); toast('DM view unlocked'); }
    else { $('#pinErr').hidden = false; inp.select(); }
  };
}
let dmSession = false;

/* ---- what a player can see ---- */
const matTierOk = { all: () => true, common: t => ti(t.tier) <= 1, mundane: t => t.tier === 'mundane', none: () => false };
// 2 = fully known, 1 = heard of (name, look, habitat, and only the parts a handout mentioned), 0 = unknown
function monLevel(m) {
  if (!m) return 0; if (isDM()) return 2;
  const c = CFG.player.creatures;
  if (c === 'all' || (c === 'beasts' && (m.type === 'beast' || !!m.salvage)) || Party.known.has('m:' + m.id)) return 2;
  return Party.known.has('hm:' + m.id) ? 1 : 0;
}
function placeLevel(e) { if (!e) return 0; if (isDM() || CFG.player.places === 'all' || Party.known.has('p:' + e.id)) return 2; return Party.known.has('hp:' + e.id) ? 1 : 0; }
const seeMon = m => monLevel(m) > 0, seePlace = e => placeLevel(e) > 0;
const owns = t => sat[t.id] > 0 || Party.qty(t.id) > 0;
const partKnown = t => !!t && (isDM() || Party.known.has('t:' + t.id) || owns(t));
// the harvest entries a player can see on a creature's page
function monParts(m) { const all = (m.harvest || []).filter(h => D.things.has(h.m)); return monLevel(m) >= 2 ? all : all.filter(h => partKnown(D.things.get(h.m))); }
/* ---- threat & value, as a player would judge them ---- */
const showCR = () => isDM() || CFG.player.threat === 'cr';
function threatWord(m) { const c = crNum(m.cr); return c <= 0.5 ? 'Little threat' : c <= 3 ? 'Dangerous' : c <= 8 ? 'Deadly' : c <= 15 ? 'Fearsome' : 'A legend'; }
function crLabel(m) { return showCR() ? `CR ${m.cr}` : CFG.player.threat === 'none' ? '' : threatWord(m); }
const VALUE_BANDS = [[1, 'A few silver'], [100, 'A fair purse'], [1000, 'A heavy purse'], [10000, 'A small fortune'], [Infinity, 'A king’s ransom']];
function valueText(t) {
  if (t.value == null) return '—';
  if (isDM() || t.tier === 'mundane') return fmtGp(t.value);
  return VALUE_BANDS.find(b => t.value < b[0])[1];
}
function seeThing(t) {
  if (!t) return false; if (isDM()) return true;
  if (Party.known.has('t:' + t.id) || owns(t)) return true;
  if (t.kind === 'item') { const c = CFG.player.items; return c === 'all' || (c === 'common' && ti(t.tier) <= 1) || (c === 'mundane' && t.tier === 'mundane'); }
  if (!(matTierOk[CFG.player.materials] || matTierOk.common)(t)) return false;
  // a creature part is only common knowledge if you know the creature it comes from (or can gather it elsewhere)
  const src = D.src.get(t.id) || [];
  return !src.length || (D.gat.get(t.id) || []).length > 0 || src.some(x => monLevel(x.m) >= 2);
}
const seeAny = o => o.kind === 'monster' ? seeMon(o) : o.kind === 'place' ? seePlace(o) : seeThing(o);
function knowLink(o, cls = '') {
  if (seeAny(o)) return `<a href="${linkOf(o)}"${cls ? ` class="${cls}"` : ''}>${esc(o.name)}</a>`;
  return `<span class="unknown">${o.kind === 'monster' ? 'an unknown creature' : o.kind === 'place' ? 'an undiscovered place' : 'something undiscovered'}</span>`;
}
const showDC = () => isDM();
// everything a formula reveals: the item, its components (and their own formulas), and where they come from
function sourceKeys(id) {
  const out = ['t:' + id];
  for (const { m } of D.src.get(id) || []) out.push('hm:' + m.id);
  for (const { e, g } of D.gat.get(id) || []) { out.push('hp:' + e.id); if (g.guard) out.push('hm:' + g.guard.m); }
  return out;
}
function formulaKeys(id, depth = 0, seen = new Set()) {
  const t = D.things.get(id); if (!t || seen.has(id)) return []; seen.add(id);
  const out = ['t:' + id];
  for (const c of (t.recipe || {}).components || []) {
    const ids = c.m ? [c.m] : c.oneOf || [];
    for (const x of ids) {
      out.push(...sourceKeys(x));
      const sub = D.things.get(x);
      if (sub && sub.recipe && depth < 3 && sub.kind === 'material') { out.push(...formulaKeys(x, depth + 1, seen)); if (needsFormula(sub)) out.push('f:' + x); }
    }
  }
  return out;
}
function creatureKeys(id) { const m = D.monsters.get(id); if (!m) return []; return ['m:' + id, ...(m.harvest || []).map(h => 't:' + h.m)]; }
function placeKeys(id) { const e = D.envs.get(id); if (!e) return []; const out = ['p:' + id]; for (const g of e.gather || []) { out.push('t:' + g.m); if (g.guard) out.push('hm:' + g.guard.m); } return out; }

/* ---- links & QR codes for codes ---- */
// Where players open the codex. Set "siteUrl" in config.json; on GitHub Pages the current address is used.
function siteBase() {
  let u = (CFG.siteUrl || '').trim();
  if (!u && /^https?:$/.test(location.protocol) && !window.CODEX_ARTIFACT) u = location.origin + location.pathname;
  if (!u) return '';
  u = u.replace(/#.*$/, '').replace(/\?.*$/, '');
  return /\.html?$/i.test(u) || u.endsWith('/') ? u : u + '/';
}
const codeLink = code => siteBase() ? siteBase() + '#/journal/' + code : '';
function qrSVG(text, cls = 'qr') {
  if (!text || typeof qrcode !== 'function') return '';
  try {
    const q = qrcode(0, text.length > 300 ? 'L' : 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg class="${cls}" viewBox="-3 -3 ${n + 6} ${n + 6}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-3" y="-3" width="${n + 6}" height="${n + 6}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
  } catch (e) { return ''; }
}
/* ---- unlock codes: DM handouts ---- */
const CODE_TYPES = { F: 'formula', C: 'creature', P: 'place', M: 'material', I: 'item' };
const B32 = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
function b32enc(bytes) { let out = '', bits = 0, v = 0; for (const b of bytes) { v = (v << 8) | b; bits += 8; while (bits >= 5) { out += B32[(v >>> (bits - 5)) & 31]; bits -= 5; } } if (bits) out += B32[(v << (5 - bits)) & 31]; return out; }
function b32dec(str) { const out = []; let bits = 0, v = 0; for (const ch of str) { const i = B32.indexOf(ch); if (i < 0) return null; v = (v << 5) | i; bits += 5; if (bits >= 8) { out.push((v >>> (bits - 8)) & 255); bits -= 8; } } return out; }
function mask(bytes) { let x = 0x5c; return bytes.map((b, i) => { x = (x * 73 + 41 + i) & 255; return b ^ x; }); }
// Short codes: each entry is 4 bytes (3-bit type + 29-bit hash of its id), then a 1-byte checksum.
// One entry is 8 characters (SC-XXXX-XXXX); every extra entry adds about 6-7.
const TY_BITS = ['F', 'C', 'P', 'M', 'I'];
function idHash(ty, id) { let h = 0x811c9dc5; const s = (ty === 'C' ? 'c:' : ty === 'P' ? 'p:' : 't:') + id; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h & 0x1fffffff; }
let hashIdx = null;
function hashLookup(ty, h) {
  if (!hashIdx) { hashIdx = { C: new Map(), P: new Map(), T: new Map() }; for (const id of D.monsters.keys()) hashIdx.C.set(idHash('C', id), id); for (const id of D.envs.keys()) hashIdx.P.set(idHash('P', id), id); for (const id of D.things.keys()) hashIdx.T.set(idHash('F', id), id); }
  return (ty === 'C' ? hashIdx.C : ty === 'P' ? hashIdx.P : hashIdx.T).get(h) || null;
}
const sum8 = bytes => bytes.reduce((a, b, i) => (a * 31 + b + i) & 255, 7);
function makeCode(entries) {
  const bytes = [];
  for (const [ty, id] of entries) { const v = ((TY_BITS.indexOf(ty) << 29) | idHash(ty, id)) >>> 0; bytes.push(v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255); }
  bytes.push(sum8(bytes));
  return 'SC-' + b32enc(mask(bytes)).match(/.{1,4}/g).join('-');
}
function readShortCode(raw) {
  const bytes = b32dec(raw); if (!bytes || bytes.length < 5 || (bytes.length - 1) % 4) return null;
  const un = mask(bytes), data = un.slice(0, -1); if (sum8(data) !== un[un.length - 1]) return null;
  const out = [];
  for (let i = 0; i < data.length; i += 4) {
    const v = ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0;
    const ty = TY_BITS[v >>> 29], id = ty && hashLookup(ty, v & 0x1fffffff); if (!id) return null;
    out.push([ty, id]);
  }
  return out;
}
function readCode(code) {
  const raw = String(code || '').toUpperCase().replace(/^.*?SC-/, '').replace(/[^0-9A-Z]/g, '');
  return readShortCode(raw);
}
function redeem(entries) {
  const before = new Set(Party.known), formulas = [];
  for (const [ty, id] of entries) {
    if (ty === 'F' && D.things.has(id)) { if (!Party.learned.has(id)) formulas.push(id); Party.learned.add(id); Party.know(formulaKeys(id)); }
    if (ty === 'C') Party.know(creatureKeys(id));
    if (ty === 'P') Party.know(placeKeys(id));
    if (ty === 'M' && D.things.has(id)) Party.know(sourceKeys(id));
    if (ty === 'I' && D.things.has(id)) Party.know(['t:' + id]);
  }
  for (const k of [...Party.known]) if (k.startsWith('f:')) { Party.learned.add(k.slice(2)); }
  Party.save(); partyChanged();
  const fresh = [...Party.known].filter(k => !before.has(k));
  return { formulas, fresh };
}
const kpre = k => k.slice(0, k.indexOf(':')), kid = k => k.slice(k.indexOf(':') + 1);
function entityOfKey(k) {
  const p = kpre(k), id = kid(k);
  return p === 'm' || p === 'hm' ? D.monsters.get(id) : p === 'p' || p === 'hp' ? D.envs.get(id) : p === 't' ? D.things.get(id) : null;
}
const HANDOUT = {
  F: ['A wax-sealed page from an artificer’s workbook', 'A stained recipe card, copied in a careful hand', 'A master crafter’s notes, passed on over a pint', 'A formula scratched into the margin of an old tome'],
  C: ['A hunter’s field notes, blood-spotted at the edges', 'A page torn from a monster-slayer’s bestiary', 'A tanner’s chalked tally of what fetches coin'],
  P: ['A surveyor’s sketch-map with finds marked in the margins', 'A forager’s folded guide to the area', 'A ranger’s notes on what grows where, and what guards it'],
  M: ['An apothecary’s label with notes on where it comes from', 'A merchant’s price sheet with sources scribbled beside it'],
  I: ['A rumour, a song, or a line in a history book about it']
};
function handoutText(entries) {
  const first = entries[0]; const pool = HANDOUT[first[0]] || HANDOUT.I;
  const names = entries.map(([ty, id]) => (ty === 'C' ? D.monsters.get(id) : ty === 'P' ? D.envs.get(id) : D.things.get(id)) || { name: id }).map(o => o.name);
  const h = [...names.join('')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return `${pool[h % pool.length]}, concerning ${names.length > 2 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names.join(' and ')}.`;
}
function defaultShare(o) {
  if (o.kind === 'monster') return [['C', o.id]];
  if (o.kind === 'place') return [['P', o.id]];
  if (o.recipe && needsFormula(o)) return [['F', o.id]];
  return [[o.kind === 'item' ? 'I' : 'M', o.id]];
}

let useParty = store.get('scavengers-codex.useParty', true);
function inv() {
  if (!useParty) return sat;
  const o = { ...sat }; for (const [k, v] of Object.entries(Party.items)) o[k] = (o[k] || 0) + v; return o;
}
// what can actually be used: spoiled parts don't count
function usable() { const o = inv(); for (const id of Object.keys(o)) { const t = D.things.get(id), s = t && spoilInfo(t); if (s && s.spoiledQ) { o[id] -= s.spoiledQ; if (o[id] <= 0) delete o[id]; } } return o; }
function invCount() { return Object.keys(inv()).length; }
function consume(pid, q) {
  const a = Math.min(sat[pid] || 0, q); if (a) sat[pid] -= a;
  const rest = q - a; if (rest > 0) Party.add(pid, -rest);
  return rest;
}

/* ================================================================ nav */
const NAV = [
  ['home', '#/', 'Home', 'home', 'desk'], ['items', '#/items', 'Items', 'star'], ['monsters', '#/monsters', 'Creatures', 'beast'],
  ['materials', '#/materials', 'Materials', 'leaf'], ['places', '#/places', 'Places', 'map'], ['satchel', '#/satchel', 'Satchel', 'pack'], ['garden', '#/garden', 'Garden', 'plant'], ['journal', '#/journal', 'Journal', 'book'],
  ['sep'], ['dm', '#/dm', 'DM tools', 'dust', 'desk'], ['rules', '#/rules', 'Rules', 'book', 'desk'], ['about', '#/about', 'About', 'info', 'desk']
];
function renderNav(active) {
  if (active !== undefined) renderNav.a = active;
  const a = renderNav.a;
  $('#nav').innerHTML = NAV.map(n => n[0] === 'sep' ? '<div class="nav-sep"></div>' :
    `<a class="navlink${a === n[0] ? ' on' : ''}${n[4] ? ' ' + n[4] : ''}" href="${n[1]}"${a === n[0] ? ' aria-current="page"' : ''}>${svg(n[3])}<span class="lbl">${n[2]}</span>${n[0] === 'satchel' && (satCount() || Object.keys(Party.items).length) ? `<span class="badge">${satCount() + Object.keys(Party.items).length}</span>` : ''}</a>`).join('')
    + `<div class="nav-foot">SRD 5.1 &amp; 5.2.1 content under CC-BY-4.0. Unofficial fan content.</div>`;
}

/* ================================================================ render helpers */
// Collapsible sections. Defaults are set per section; once someone opens or closes one,
// that choice is remembered for that kind of section on every page.
const FOLD_KEY = 'scavengers-codex.folds.v1';
let folds = store.get(FOLD_KEY, {});
function fold(key, title, body, o = {}) {
  const open = key in folds ? folds[key] : o.open !== false;
  return `<details class="section fold${o.cls ? ' ' + o.cls : ''}" data-fold="${key}"${open ? ' open' : ''}${o.id ? ` id="${o.id}"` : ''}${o.hidden ? ' hidden' : ''}><summary class="section-head fold-sum"><span class="chev" aria-hidden="true"></span><${o.h || 'h2'}>${title}</${o.h || 'h2'}>${o.count !== undefined && o.count !== '' ? `<span class="count">${o.count}</span>` : ''}${o.note ? `<span class="small muted fold-note">${o.note}</span>` : ''}</summary><div class="fold-body">${body}</div></details>`;
}
document.addEventListener('change', ev => {
  const f = ev.target; if (f.id !== 'backupFile' || !f.files[0]) return;
  const rd = new FileReader(); rd.onload = () => { $('#backupBox').hidden = false; $('#backupText').value = rd.result; toast('Backup loaded. Press Restore to replace what’s on this device'); }; rd.readAsText(f.files[0]);
});
document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('tcard')) { ev.preventDefault(); ev.target.classList.toggle('flipped'); } });
document.addEventListener('focusout', ev => { const n = ev.target; if (!n.dataset || n.dataset.cnote === undefined) return; const sh = cardSheet(), c = sh[+n.dataset.cnote]; if (c) { c.text = n.innerText.trim(); store.set(PRINT_KEY, sh); document.querySelectorAll(`[data-pnote="${n.dataset.cnote}"]`).forEach(p => { p.textContent = c.text; }); } });
document.addEventListener('toggle', ev => { const d = ev.target; if (d.dataset && d.dataset.fold && !d.dataset.nosave) { folds[d.dataset.fold] = d.open; store.set(FOLD_KEY, folds); } }, true);
function rowFor(o, extra = '') {
  const sub = o.kind === 'monster' ? `${cap(o.type)} · ${o.size}${monLevel(o) === 1 ? ' · known by reputation' : ''}` : o.kind === 'place' ? 'Place' : thingSub(o);
  const right = o.tier ? pill(o.tier) : o.kind === 'monster' ? `<span class="${showCR() ? 'mono ' : 'small '}muted">${esc(crLabel(o))}</span>` : '';
  const add = (o.kind === 'material' || o.kind === 'item') ? `<button class="add" type="button" data-act="add" data-id="${o.id}" aria-label="Add ${esc(o.name)} to satchel" title="Add to satchel">${svg('plus')}</button>` : '';
  return `<div class="row">${ico(o)}<a class="txt" href="${linkOf(o)}" style="color:inherit;text-decoration:none"><span class="name">${esc(o.name)}</span><span class="sub">${esc(sub)}${extra}</span></a><div class="right">${right}</div>${add}</div>`;
}
function listBlock(arr, key, empty = 'Nothing here yet.') {
  const shown = (listBlock.state[key] || PAGE);
  if (!arr.length) return `<div class="empty">${empty}</div>`;
  return `<div class="list">${arr.slice(0, shown).map(o => rowFor(o)).join('')}</div>` + (arr.length > shown ? `<button class="btn more" type="button" data-act="more" data-key="${key}" data-shown="${shown}" data-step="${PAGE}">Show ${Math.min(PAGE, arr.length - shown)} more of ${arr.length - shown}</button>` : '');
}
listBlock.state = {};
const tagChip = (tag, extra = '') => `<a class="chip" href="#/tag/${encodeURIComponent(tag)}">${esc(tag)}${extra}</a>`;
function slotLabel(c) {
  if (c.m) { const t = D.things.get(c.m); return t ? t.name : c.m; }
  return c.label || (c.any ? 'Any ' + c.any.join(' + ') : 'One of…');
}
function recipeCard(owner, opts = {}) {
  const r = owner.recipe; if (!r) return '';
  const alloc = invCount() ? allocate(r, usable()) : null;
  const groups = ROLE_ORDER.map(role => ({ role, slots: r.components.map((c, i) => ({ c, i })).filter(x => (x.c.role || 'supporting') === role) })).filter(g => g.slots.length);
  const tile = ({ c, i }) => {
    const st = alloc ? alloc.slots[i] : null;
    const cls = st ? (st.missing === 0 ? ' has' : st.missing < st.want ? ' part' : '') : '';
    const key = c.role === 'keystone' ? ' key' : '';
    const q = `<span class="q">${c.q || 1}×</span>`;
    if (c.m) {
      const t = D.things.get(c.m);
      if (!t) return `<span class="tile">${q}<span class="tx"><span class="tn">${esc(c.m)}</span></span></span>`;
      return `<a class="tile${key}${cls}" href="${linkOf(t)}" title="${esc(t.name)} — ${esc(TIER_LABEL[t.tier])}">${ico(t)}<span class="tx"><span class="tn">${esc(t.name)}</span><span class="ts">${esc(thingSub(t))}</span></span>${q}</a>`;
    }
    const optAll = slotOptions(c), opt = isDM() ? optAll : optAll.filter(seeThing);
    const what = c.any ? `${c.any.map(esc).join(' + ')}${c.min ? ' · ' + TIER_LABEL[c.min] + '+' : ''}` : `${opt.length} options`;
    const fake = { kind: 'material', tier: c.min || (opt[0] && opt[0].tier) || 'common', tags: c.any || (opt[0] ? opt[0].tags : []) };
    const shown = opt.slice(0, 40);
    const optHtml = `<div class="options" id="opt-${owner.id}-${i}">${shown.map(o => `<a class="chip" href="${linkOf(o)}"><span class="t-${o.tier}">●</span> ${esc(o.name)}</a>`).join('')}${opt.length > shown.length && c.any ? `<a class="chip" href="#/tag/${encodeURIComponent(c.any.join('+'))}${c.min ? '?min=' + c.min : ''}">All ${opt.length} →</a>` : ''}${optAll.length > opt.length ? `<span class="muted small">…and others you haven't discovered</span>` : ''}${!optAll.length ? '<span class="muted small">No known material fits. Ask your DM for a substitute.</span>' : ''}</div>`;
    return `<button type="button" class="tile slot-any${key}${cls}" data-act="opts" data-target="opt-${owner.id}-${i}" aria-expanded="false">${ico(fake)}<span class="tx"><span class="tn">${esc(slotLabel(c))}</span><span class="ts">${what}</span></span>${q}</button>${optHtml}`;
  };
  const tools = (r.tools || []).map(tl => D.things.has(tl) ? `<a href="#/item/${tl}">${esc(TOOL_NAMES[tl] || tl)}</a>` : esc(TOOL_NAMES[tl] || tl)).join(', ') || '—';
  const proj = Party.projects.find(p => p.id === owner.id);
  const have = proj ? `<span class="have pill t-rare">On the workbench: ${Math.round(proj.done / proj.need * 100)}%</span>` : alloc ? `<span class="have pill ${alloc.ok ? 't-uncommon' : 't-common'}">${alloc.ok ? 'You can craft this' : `Satchel: ${Math.round(alloc.frac * 100)}% of parts`}</span>` : '';
  const craftBtn = alloc && alloc.ok ? `<button class="btn primary sm" type="button" data-act="craft" data-id="${owner.id}">${svg('check')}Start crafting (uses the parts)</button>` : '';
  const open = 'thing.recipe' in folds ? folds['thing.recipe'] : true;
  return `<details class="recipe fold" data-fold="thing.recipe"${open ? ' open' : ''}>
    <summary class="recipe-top fold-sum"><span class="chev" aria-hidden="true"></span><h2>${opts.title || 'Recipe'}</h2>${have}</summary>
    ${craftBtn || proj ? `<div class="frow">${craftBtn}${proj ? '<a class="btn sm" href="#/satchel">Open the workbench</a>' : ''}</div>` : ''}
    <div class="bench">
      <div class="slots">${groups.map(g => `<div class="role-grp"><div class="role-lbl ${g.role}">${ROLE_LABEL[g.role]}${g.role === 'keystone' ? ' — carries the magic' : ''}</div><div class="role-tiles">${g.slots.map(tile).join('')}</div></div>`).join('')}</div>
      <div class="arrow">${svg('arrowR')}</div>
      <div class="result t-${owner.tier}">${ico(owner)}<span><span class="rn">${esc(owner.name)}${r.yields > 1 ? ` ×${r.yields}` : ''}</span><br>${pill(owner.tier)}</span></div>
    </div>
    <div class="rmeta">
      <span><b>Tools:</b> ${tools}</span>
      <span><b>Station:</b> ${esc(STATION_NAMES[r.station] || r.station || 'Anywhere')}</span>
      ${showDC() ? `<span><b>Check:</b> <span class="mono">DC ${esc(r.dc ?? '—')}</span></span>` : ''}
      <span><b>Time:</b> ${esc(r.time || '—')}</span>
      <span><b>Reagents:</b> ${fmtGp(r.gp)}</span>
      ${r.level ? `<span><b>Min. level:</b> ${r.level}</span>` : ''}
      ${(r.spells || []).length ? `<span><b>Spells:</b> <i>${r.spells.map(esc).join('</i> or <i>')}</i></span>` : ''}
    </div>
    ${r.requires ? `<p class="small"><b>Requires:</b> ${esc(r.requires)}</p>` : ''}
    ${r.lore ? `<p class="lore">${esc(r.lore)}</p>` : ''}
  </details>`;
}
function usedInList(t) {
  const direct = (D.usedIn.get(t.id) || []);
  const seen = new Set(); let rows = [];
  for (const u of direct) { if (seen.has(u.t.id)) continue; seen.add(u.t.id); rows.push(u); }
  let fits = [];
  if (t.kind === 'material' || t.kind === 'item') {
    for (const s of D.anySlots) if (!seen.has(s.t.id) && matches(t, s.c)) { seen.add(s.t.id); fits.push(s); }
  }
  const sortU = (a, b) => ti(a.t.tier) - ti(b.t.tier) || byName(a.t, b.t);
  rows.sort(sortU); fits.sort(sortU);
  const vis = u => isDM() || (known(u.t) && seeThing(u.t));
  const hidR = rows.filter(u => !vis(u)).length, hidF = fits.filter(u => !vis(u)).length;
  rows = rows.filter(vis); fits = fits.filter(vis);
  const role = u => `<span class="${u.c.role === 'keystone' ? '' : 'muted'}" style="${u.c.role === 'keystone' ? 'color:var(--brass);font-weight:700' : ''}"> · ${ROLE_LABEL[u.c.role] || 'Part'}${u.via === 'option' ? ' (one option)' : ''}</span>`;
  const kList = (arr, key) => {
    const shown = listBlock.state[key] || 24;
    return `<div class="list">${arr.slice(0, shown).map(u => rowFor(u.t, role(u))).join('')}</div>` + (arr.length > shown ? `<button class="btn more" data-act="more" data-key="${key}" data-shown="${shown}" data-step="48" type="button">Show more (${arr.length - shown})</button>` : '');
  };
  return fold('thing.used', 'Used to craft', `${rows.length ? kList(rows, 'used-' + t.id) : `<div class="empty">${isDM() ? `No recipe names this ${t.kind} directly${fits.length ? ', but it fits the open slots below' : ''}.` : 'None of the formulas your party knows use it.'}</div>`}
    ${hidR + hidF ? `<p class="small muted undisc">Crafters whisper that it has other uses. Learn the right formula to find out.</p>` : ''}`, { count: rows.length })
    + (fits.length ? fold('thing.fits', 'Also fits “any…” slots in', `<p class="small muted">These recipes accept any material with the right traits, and this one qualifies.</p>${kList(fits, 'fits-' + t.id)}`, { open: false, count: fits.length }) : '');
}


/* ================================================================ goals, breakdown, harvest roller */
const GOAL_KEY = 'scavengers-codex.goals.v1', SKILL_KEY = 'scavengers-codex.skills.v1';
let goals = store.get(GOAL_KEY, []);
function toggleGoal(id) { const i = goals.indexOf(id); if (i >= 0) goals.splice(i, 1); else goals.push(id); store.set(GOAL_KEY, goals); }
let bdBuy = true;
function whereFrom(t) {
  const sA = D.src.get(t.id) || [], gA = D.gat.get(t.id) || [];
  const s = sA.filter(x => seeMon(x.m)), g = gA.filter(x => seePlace(x.e));
  const bits = [];
  s.slice(0, 3).forEach(({ m }) => bits.push(`<a href="#/monster/${m.id}">${esc(m.name)}</a>`));
  if (sA.length > Math.min(3, s.length)) bits.push(s.length ? (isDM() ? `+${sA.length - Math.min(3, s.length)} more` : 'and elsewhere') : 'an unknown creature');
  g.slice(0, 2).forEach(({ e }) => bits.push(`<a href="#/place/${e.id}">${esc(e.name)}</a>`));
  if (gA.length > Math.min(2, g.length)) bits.push(g.length ? (isDM() ? `+${gA.length - Math.min(2, g.length)} places` : 'other places') : 'somewhere undiscovered');
  if (!bits.length) bits.push(t.kind === 'item' ? (t.tier === 'mundane' ? 'Buy it, or craft it yourself' : 'Craft it') : t.recipe ? 'Refine or craft it' : 'Buy (trade good)');
  return bits.join(', ');
}
function slotHint(c) {
  const o = slotOptions(c); if (!o.length) return 'Ask your DM for a substitute';
  return 'Any of: ' + o.slice(0, 3).map(x => `<a href="${linkOf(x)}">${esc(x.name)}</a>`).join(', ') + (o.length > 3 ? ` +${o.length - 3} more` : '');
}
function breakdown(owner) {
  const r = owner.recipe; if (!r) return '';
  const hasSub = r.components.some(c => { const x = c.m && D.things.get(c.m); return x && x.recipe && !(x.kind === 'item' && x.tier === 'mundane'); });
  if (!hasSub) return '';
  const leaves = new Map();
  const leaf = (key, q, t, label, c) => { const L = leaves.get(key) || { q: 0, t, label, c }; L.q += q; leaves.set(key, L); };
  const node = (c, mult, depth, path) => {
    const q = (c.q || 1) * mult;
    if (c.m) {
      const x = D.things.get(c.m); if (!x) return '';
      const buyIt = bdBuy && x.kind === 'item' && x.tier === 'mundane';
      const can = x.recipe && !buyIt && depth < 7 && !path.includes(x.id);
      const name = `<span class="mono">${q}×</span> <a href="${linkOf(x)}">${esc(x.name)}</a> <span class="t-${x.tier} small">●</span>`;
      if (!can) { leaf(x.id, q, x); return `<li>${name}${buyIt && x.recipe ? ' <span class="small muted">(buy)</span>' : ''}</li>`; }
      const runs = Math.ceil(q / (x.recipe.yields || 1));
      const kids = x.recipe.components.map(cc => node(cc, runs, depth + 1, [...path, x.id])).join('');
      return `<li><details${depth < 1 ? ' open' : ''}><summary>${name} <span class="small muted">— made${runs > 1 ? ` in ${runs} batches` : ''}: ${esc(x.recipe.time || '')}${showDC() ? `, DC ${esc(x.recipe.dc)}` : ''}</span></summary><ul>${kids}</ul></details></li>`;
    }
    const label = slotLabel(c); leaf('slot:' + label + (c.min || ''), q, null, label, c);
    return `<li><span class="mono">${q}×</span> <i>${esc(label)}</i> <span class="small muted">(your choice)</span></li>`;
  };
  const tree = r.components.map(c => node(c, 1, 0, [owner.id])).join('');
  const rows = [...leaves.values()].sort((a, b) => (a.t ? 0 : 1) - (b.t ? 0 : 1) || (b.t && a.t ? ti(b.t.tier) - ti(a.t.tier) : 0));
  return fold('thing.breakdown', 'Full breakdown', `<div class="frow"><p class="small muted" style="flex:1;margin:0">Some parts must be made from other parts first. This is the whole chain, down to what you hunt, gather or buy.</p>
      <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="bdBuy" data-act="bdbuy"${bdBuy ? ' checked' : ''}> Buy mundane gear</label></div>
    <div class="bd-grid"><div class="card bd-tree"><ul class="tree">${tree}</ul></div>
    <div class="tbl-wrap"><table><thead><tr><th>Raw part</th><th>Qty</th><th>Where to get it</th></tr></thead><tbody>
    ${rows.map(L => `<tr><td>${L.t ? `<a href="${linkOf(L.t)}"><b>${esc(L.t.name)}</b></a> <span class="t-${L.t.tier} small">●</span>` : `<i>${esc(L.label)}</i>`}</td><td class="mono">${L.q}</td><td class="small">${L.t ? whereFrom(L.t) : slotHint(L.c)}</td></tr>`).join('')}
    </tbody></table></div></div>`, { open: false, count: `${rows.length} raw parts` });
}
function rollDice(expr) {
  const m = String(expr).match(/^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i);
  if (!m) return Math.max(0, parseInt(expr, 10) || 1);
  let n = +(m[1] || 1), tot = 0; for (let i = 0; i < n; i++) tot += 1 + Math.floor(Math.random() * +m[2]);
  return Math.max(0, tot + (m[3] ? parseInt(m[3].replace(/\s/g, ''), 10) : 0));
}
const HAZARD_RE = /(fail(s|ed|ing)? by 5|expos|burst|vent|curse|lycanthrop|explod|spray|scald|sting)/i;
let lastRoll = null;
const OUTCOME_TEXT = {
  Flawless: 'A perfect cut: take one extra, or sell this part for 50% more.',
  Success: 'A clean harvest: take the full amount.',
  Flawed: 'Rough work: take half (rounded down), or the whole part at half value.',
  Ruined: 'The part is ruined.'
};
function harvestRoller(m) {
  const parts = monParts(m); if (!parts.length) return '';
  const skills = [...new Set(parts.map(h => h.skill))];
  const saved = store.get(SKILL_KEY, {});
  const open = store.get('scavengers-codex.rollerOpen', false);
  return `<details class="section card roller" id="roller" data-mon="${m.id}"${open ? ' open' : ''}><summary class="roller-sum fold-sum"><span class="chev" aria-hidden="true"></span><h2>Harvest rolls</h2><span class="small muted">${plural(parts.length, 'part')} · type in each check, or let the codex roll</span></summary>
    <p class="small muted" style="margin-top:8px">Each check follows the <a href="#/rules/harvest">harvest rules</a>.${showDC() ? '' : ' Your DM knows the DCs and has the final say.'}</p>
    <div class="tbl-wrap"><table class="hman"><thead><tr><th>Part</th><th>Check</th><th>Total rolled</th><th>Yield if successful</th><th>Result</th></tr></thead><tbody>
    ${parts.map((h, i) => { const t = D.things.get(h.m); return `<tr><td><a href="${linkOf(t)}"><b>${esc(t.name)}</b></a><div class="note">keeps ${esc(t.perish || 'stable')}</div></td>
      <td class="nowrap">${dcCell(h.skill, h.dc)}</td>
      <td><input class="textin mono" type="number" inputmode="numeric" data-hman="total" data-i="${i}" placeholder="—" aria-label="Total rolled for ${esc(t.name)}" style="width:76px"></td>
      <td>${h.dice
        ? `<div class="yield-in"><input class="textin mono" type="number" min="0" data-hman="yield" data-i="${i}" value="" placeholder="${esc(h.dice)}" aria-label="Yield for ${esc(t.name)}"><button class="btn sm die" type="button" data-act="rollyield" data-i="${i}" data-dice="${esc(h.dice)}" title="Roll ${esc(h.dice)} for the yield" aria-label="Roll ${esc(h.dice)} for the yield">${svg('dice')}Roll <span class="mono">${esc(h.dice)}</span></button></div>`
        : `<div class="yield-fixed"><span class="mono">${h.q || 1}</span> <span class="note">always</span><input type="hidden" data-hman="yield" data-i="${i}" value="${h.q || 1}"></div>`}</td>
      <td id="hres-${i}" class="hres"><span class="muted small">Waiting for a roll</span></td></tr>`; }).join('')}
    </tbody></table></div>
    <details class="autoroll"><summary>Roll everything for me</summary>
      <div class="frow" style="margin-top:10px">${skills.map(sk => `<label class="skill-in" for="sk-${sk}">${sk} <input class="textin mono" type="number" id="sk-${sk}" data-skill="${sk}" value="${esc(saved[sk] ?? 0)}" aria-label="${sk} bonus"></label>`).join('')}
      <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="rollAdv"${saved._adv ? ' checked' : ''}> Right tools (advantage)</label>
      <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="rollDis"${saved._dis ? ' checked' : ''}> No tools (disadvantage)</label>
      <button class="btn sm" type="button" data-act="rollh" data-id="${m.id}">Roll every check and yield</button></div>
      <p class="small muted">This fills in the totals and yields above. You can still change them.</p></details>
    <div class="frow" style="margin-top:12px"><button class="btn primary sm" type="button" data-act="addroll" id="addRollBtn" disabled>${svg('plus')}Add results to my satchel</button><button class="btn sm" type="button" data-act="addroll" data-to="party" id="addRollParty" disabled>…to the party satchel</button><span class="small muted" id="rollSum"></span></div></details>`;
}
function evalHarvest() {
  const box = $('#roller'); if (!box) return;
  const m = D.monsters.get(box.dataset.mon); if (!m) return;
  const parts = monParts(m);
  const val = (i, k) => { const el = box.querySelector(`[data-hman="${k}"][data-i="${i}"]`); return el ? el.value : ''; };
  const res = [];
  parts.forEach((h, i) => {
    const cell = document.getElementById('hres-' + i); const raw = val(i, 'total');
    if (raw === '' || isNaN(+raw)) { cell.innerHTML = '<span class="muted small">Waiting for a roll</span>'; return; }
    const yRaw = val(i, 'yield');
    const tot = +raw, bd = band(tot, h.dc);
    const needYield = bd[2] >= -1 && yRaw === '' && h.dice;
    const base = Math.max(0, parseInt(yRaw, 10) || 0), q = needYield ? 0 : yieldFor(base, bd);
    const hazard = bd[0] === 'Ruined' && HAZARD_RE.test(h.note || '') ? h.note : '';
    const margin = showDC() ? (tot - h.dc >= 0 ? ` Beat the DC by ${tot - h.dc}.` : ` Missed by ${h.dc - tot}.`) : '';
    cell.innerHTML = `<span class="pill ${bd[1]}">${bd[0]}</span> ${needYield ? `<span class="small muted">roll the yield (${esc(h.dice)})</span>` : `<span class="mono">×${q}</span>`}<div class="note">${esc(OUTCOME_TEXT[bd[0]])}${margin}</div>${hazard ? `<div class="note hazard">Hazard: ${esc(hazard)}</div>` : ''}`;
    if (!needYield) res.push({ t: D.things.get(h.m), q });
  });
  lastRoll = res;
  const n = res.reduce((a, r) => a + r.q, 0);
  const b1 = $('#addRollBtn'), b2 = $('#addRollParty');
  if (b1) { b1.disabled = !n; b1.innerHTML = `${svg('plus')}Add ${plural(n, 'part')} to my satchel`; }
  if (b2) b2.disabled = !n;
  const sum = $('#rollSum'); if (sum) sum.textContent = res.length ? `${res.length} of ${parts.length} parts rolled` : '';
}
function doRoll(m) {
  const saved = store.get(SKILL_KEY, {});
  const adv = $('#rollAdv').checked, dis = $('#rollDis').checked;
  document.querySelectorAll('[data-skill]').forEach(i => { saved[i.dataset.skill] = parseInt(i.value, 10) || 0; });
  saved._adv = adv; saved._dis = dis; store.set(SKILL_KEY, saved);
  const box = $('#roller');
  monParts(m).forEach((h, i) => {
    const a = d20(), b = d20(); const nat = adv && !dis ? Math.max(a, b) : dis && !adv ? Math.min(a, b) : a;
    box.querySelector(`[data-hman="total"][data-i="${i}"]`).value = nat + (saved[h.skill] || 0);
    if (h.dice) box.querySelector(`[data-hman="yield"][data-i="${i}"]`).value = rollDice(h.dice);
  });
  evalHarvest();
}

/* ================================================================ formulas on item pages, final check, quirks */
const QUIRKS = [
  'It hums softly whenever a creature of the same kind as its keystone’s source is within 60 feet.',
  'It smells faintly of the creature it came from. Anything tracking you by scent has advantage.',
  'Its colour shifts with its bearer’s mood, giving others advantage on Insight checks to read you.',
  'It is always cold to the touch and gathers a rime of frost overnight.',
  'At midnight it whispers a single word in a language nobody present speaks.',
  'It sheds dim light in a 5-foot radius that can’t be covered or dimmed.',
  'It weighs twice what it should.',
  'It is jealous: while you are attuned to it, attuning to any other item takes 1 hour instead of a short rest.',
  'It refuses to be sold. A buyer always finds it back in the seller’s pack by morning.',
  'Beasts of its keystone’s kind are uneasy near you (disadvantage on Animal Handling with them).',
  'After each use it leaves a trail of frost, soot, sparks or glitter (matching its magic) for 1 minute.',
  'Once a day, when the DM chooses, it lets out a sound true to its source: a howl, a hiss, a chime.',
  'It sulks unless cleaned and oiled daily. If neglected, its first use each day is at disadvantage or costs an extra charge.',
  'It dislikes water and stops working while submerged.',
  'It feels alive: a faint heartbeat or slow breath can be felt when you hold it.',
  'Its surface reflects the creature it was made from instead of its bearer.',
  'It grows warm near gold and cold near cold iron.',
  'Small creatures (rats, crows, moths) follow its bearer at a distance.',
  'It resents its maker: the crafter can never attune to it.',
  'A harmless flaw: it bears a visible scar that bards love to sing about. No mechanical effect.'
];
const MASTERWORKS = [
  'Featherweight: it weighs half as much.',
  'Unbreakable: it can’t be damaged by nonmagical means.',
  'Deep reserves: if it has charges, its maximum increases by 1.',
  'Quick bond: you can attune to it with a 1-minute ritual instead of a short rest.',
  'Maker’s mark: it sells for 150% of its value.',
  'Keen: once per long rest, reroll one attack roll, check or damage roll made with (or while using) it, and keep either result.',
  'Faithful: once per long rest, if it’s within 30 feet, you can call it to your hand as a bonus action.',
  'Warding: while you carry it, you have advantage on saving throws against creatures of its keystone’s type.',
  'Resplendent: once per day, advantage on a Persuasion check with anyone who values fine craft.',
  'Heirloom: it takes a name and gains one minor property of the DM’s choice.'
];
function formulaCtl(t) {
  if (!needsFormula(t)) return '';
  const has = Party.learned.has(t.id);
  if (mode === 'dm') return `<button class="btn sm${has ? ' on-goal' : ''}" type="button" data-act="teach" data-id="${t.id}" aria-pressed="${has}" title="Only changes this device's party journal. To reach your players' devices, use Share with players.">${svg('book')}${has ? 'Learned on this device' : 'Mark as learned here'}</button>`;
  return has ? `<span class="pill t-uncommon" style="align-self:center">Formula learned</span>` : '';
}
function keystoneSlot(t) { return (t.recipe.components || []).find(c => c.role === 'keystone'); }
function researchNeed(t) { return Math.max(1, ti(t.tier) - 1); }
function lockedCard(t) {
  const need = researchNeed(t), prog = Math.min(need, Party.research[t.id] || 0);
  const ks = keystoneSlot(t);
  const hasKey = ks ? allocate({ components: [ks] }, inv()).ok : false;
  const b = store.get('scavengers-codex.arcanaBonus', 4);
  const research = hasKey
    ? `<div class="research"><div class="section-head"><h3>Study the keystone</h3><span class="small muted">You hold something that could be this formula's keystone.</span></div>
        <p class="small">Each week of study, the researcher makes an <b>Intelligence (Arcana)</b> check. A success fills one box, a bad failure smudges one away. Fill ${plural(need, 'box', )} to work out the formula.</p>
        <div class="boxes" aria-label="Research progress ${prog} of ${need}">${Array.from({ length: need }, (_, i) => `<span class="box${i < prog ? ' on' : ''}"></span>`).join('')}</div>
        <div class="frow"><label class="skill-in" for="rsTotal">Week's check total <input class="textin mono" type="number" inputmode="numeric" id="rsTotal" placeholder="—"></label><button class="btn sm primary" type="button" data-act="research" data-id="${t.id}">Record the week</button>
          <span class="small muted">or</span><label class="skill-in" for="rsBonus">Arcana bonus <input class="textin mono" type="number" id="rsBonus" value="${esc(b)}"></label><button class="btn sm" type="button" data-act="research" data-id="${t.id}" data-roll="1">Roll for me</button></div>
        <div id="rsOut"></div></div>`
    : `<p class="small">To research it yourself, you need a suitable <b>keystone</b> in your satchel to study. It must be ${esc(TIER_LABEL[t.tier].toLowerCase())} or better and fit the formula. Your DM can tell you if something qualifies.</p>`;
  return `<details class="recipe locked fold" data-fold="thing.locked"${folds['thing.locked'] === false ? '' : ' open'}><summary class="recipe-top fold-sum"><span class="chev" aria-hidden="true"></span><h2>Formula unknown</h2><span class="pill t-common">${svg('book')} not learned</span></summary>
    <p>Your party hasn't learned how to make this yet. Formulas turn up in tomes and in dead artisans' notes, a master may teach one for a price, or you can work it out by studying the right keystone (<a href="#/rules/formulas">formula rules</a>).</p>
    ${research}
    <div class="frow"><a class="btn sm" href="#/journal">${svg('scroll')}Enter a code from your DM</a></div></details>`;
}
function doResearch(t, roll) {
  const need = researchNeed(t); let tot, nat = null;
  if (roll) { const bonus = parseInt($('#rsBonus').value, 10) || 0; store.set('scavengers-codex.arcanaBonus', bonus); nat = d20(); tot = nat + bonus; }
  else { const v = $('#rsTotal').value; if (v === '' || isNaN(+v)) { toast('Type in the week’s check total first'); return; } tot = +v; }
  const dc = t.recipe.dc, diff = tot - dc; let msg, cls, delta = 0;
  if (nat === 1 || diff <= -10) { delta = -1; cls = 't-rare'; msg = 'A wrong turn: ink blots and false leads. You lose a week of progress.'; }
  else if (diff < 0) { cls = 't-common'; msg = 'A week of dead ends. No progress, but nothing lost.'; }
  else { delta = 1; cls = 't-uncommon'; msg = diff >= 10 ? 'A breakthrough! The keystone gives up another secret.' : 'Progress. Another piece of the formula falls into place.'; }
  const prog = Math.max(0, Math.min(need, (Party.research[t.id] || 0) + delta));
  Party.research[t.id] = prog; Party.save();
  Party.note(`Researched ${t.name}: ${delta > 0 ? 'progress' : delta < 0 ? 'a setback' : 'no progress'} (${prog}/${need})`);
  if (prog >= need) {
    delete Party.research[t.id]; Party.teach(t.id, true); Party.note(`Worked out the formula for ${t.name}`);
    const res = { formulas: [t.id], fresh: formulaKeys(t.id).filter(k => k.length) };
    rerender(); showReveal(res, 'Formula worked out!'); return;
  }
  rerender();
  const out = $('#rsOut'); if (out) out.innerHTML = `<div class="fc-result"><span class="pill ${cls}">${delta > 0 ? 'Progress' : delta < 0 ? 'Setback' : 'No progress'}</span> <span class="mono">${nat ? `d20 ${nat} → ` : ''}total ${tot}</span><p>${msg}</p></div>`;
}
function showReveal(res, title) {
  const groups = { f: [], m: [], p: [], t: [] };
  for (const id of res.formulas || []) { const t = D.things.get(id); if (t) groups.f.push(t); }
  for (const k of res.fresh || []) { const o = entityOfKey(k); if (!o) continue; const g = { hm: 'm', hp: 'p' }[kpre(k)] || kpre(k); if (groups[g] && !groups[g].includes(o)) groups[g].push(o); }
  const sec = (label, arr) => arr.length ? `<div class="rv-sec"><div class="eyebrow">${label}</div><div class="chips">${arr.slice(0, 30).map((o, i) => `<a class="chip rv" style="animation-delay:${i * 45}ms" href="${linkOf(o)}"><span class="t-${o.tier || 'common'}">●</span> ${esc(o.name)}</a>`).join('')}${arr.length > 30 ? `<span class="small muted">+${arr.length - 30} more</span>` : ''}</div></div>` : '';
  const total = groups.f.length + groups.m.length + groups.p.length + groups.t.length;
  const wrap = document.createElement('div'); wrap.className = 'modal'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
  wrap.innerHTML = `<div class="modal-card reveal"><div class="eyebrow">New in your journal</div><h2>${esc(title || 'Discovered!')}</h2>
    ${total ? sec('Formulas', groups.f) + sec('Creatures', groups.m) + sec('Places', groups.p) + sec('Materials & items', groups.t.filter(o => !groups.f.includes(o))) : '<p class="muted">Nothing new. Your party already knew all of this.</p>'}
    <div class="frow"><button class="btn primary" type="button" id="rvClose">Close</button></div></div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  $('#rvClose').onclick = close; wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('a')) close(); });
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); $('#rvClose').focus();
}
function finalCheck(t) {
  const b = store.get('scavengers-codex.craftBonus', 5);
  return fold('thing.final', 'Roll the final check', `<p class="small muted">One ${esc((t.recipe.tools || []).map(x => TOOL_NAMES[x] || x).join(' or ') || 'tool')} check${showDC() ? ` against DC ${esc(t.recipe.dc)}` : ''}, following the <a href="#/rules/fail">success &amp; failure rules</a>.</p>
    <div class="frow"><label class="skill-in" for="fcBonus">Tool bonus <input class="textin mono" type="number" id="fcBonus" value="${esc(b)}"></label>
    <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="fcAdv"> Advantage (inspiration, a spell, a master's guidance)</label>
    <button class="btn primary sm" type="button" data-act="fcroll" data-id="${t.id}">Roll for me</button></div>
    <div class="frow"><label class="skill-in" for="fcTotal">…or enter the total you rolled <input class="textin mono" type="number" inputmode="numeric" id="fcTotal" placeholder="—"></label><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="fcNat1"> It was a natural 1</label></div><div id="fcOut"></div>`, { open: false, cls: 'card roller', id: 'fcheck', h: 'h3' });
}
function doFinalCheck(t, manual) {
  const bonus = parseInt($('#fcBonus').value, 10) || 0; store.set('scavengers-codex.craftBonus', bonus);
  let nat, tot;
  if (manual !== undefined) {
    if (manual === '' || isNaN(+manual)) { $('#fcOut').innerHTML = ''; return; }
    tot = +manual; nat = $('#fcNat1').checked ? 1 : null;
  } else {
    const a = d20(), b2 = d20(); nat = $('#fcAdv').checked ? Math.max(a, b2) : a; tot = nat + bonus;
    const ti2 = $('#fcTotal'); if (ti2) ti2.value = '';
  }
  const dc = t.recipe.dc, diff = tot - dc;
  const pick = arr => { const i = Math.floor(Math.random() * arr.length); return `<b>${i + 1}.</b> ${esc(arr[i])}`; };
  let head, body, cls;
  if (nat === 1 && ti(t.tier) >= ti('rare') || diff <= -10) { cls = 't-legendary'; head = 'Backfire'; body = `The enchantment tears loose. The keystone survives, but the base and every other component are lost. <i>Optional:</i> the DM may instead let the item finish with a quirk (d20): ${pick(QUIRKS)}`; }
  else if (diff <= -5) { cls = 't-rare'; head = 'Spoiled component'; body = `One supporting or binding component is ruined (DM's choice). Replace it and spend 25% more time. <i>Optional:</i> keep going and the item finishes with a quirk (d20): ${pick(QUIRKS)}`; }
  else if (diff < 0) { cls = 't-common'; head = 'The work stalls'; body = 'Spend 25% more time and reagent gold, then roll again.'; }
  else if (diff >= 10) { cls = 't-uncommon'; head = 'Masterwork!'; body = `The item is complete, and exceptional (d10): ${pick(MASTERWORKS)}`; }
  else { cls = 't-uncommon'; head = 'Success'; body = 'The item is complete. If it needs attunement, the crafter may attune to it now.'; }
  const vs = showDC() ? ` vs DC ${dc}` : '';
  const how = manual !== undefined ? `total <b>${tot}</b>${vs}` : `d20 ${nat}${bonus >= 0 ? '+' : ''}${bonus} = <b>${tot}</b>${vs}`;
  $('#fcOut').innerHTML = `<div class="fc-result"><span class="pill ${cls}">${head}</span> <span class="mono">${how}</span><p>${body}</p>${manual !== undefined ? '<p class="small muted">Quirks and masterwork boons above were rolled for you. Reroll by retyping the total.</p>' : ''}</div>`;
}
function quirkTables() {
  return `<h2 id="r-quirks">11. Quirks and masterworks</h2>
    <p>A quirk is a harmless oddity left by an imperfect enchantment. A masterwork is the reward for beating the craft DC by 10 or more. The <b>Roll the final check</b> panel on every recipe rolls these for you.</p>
    <h3>Crafting quirks (d20)</h3><ol>${QUIRKS.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
    <h3>Masterwork boons (d10)</h3><ol>${MASTERWORKS.map(q => `<li>${esc(q)}</li>`).join('')}</ol>`;
}


/* ================================================================ DM tools */
const d20 = () => 1 + Math.floor(Math.random() * 20);
const rnd = n => Math.floor(Math.random() * n);
const pickW = (arr, w) => { const tot = arr.reduce((a, x) => a + w(x), 0); let r = Math.random() * tot; for (const x of arr) { r -= w(x); if (r <= 0) return x; } return arr[arr.length - 1]; };
function band(tot, dc) { return tot >= dc + 10 ? ['Flawless', 't-legendary', 1] : tot >= dc ? ['Success', 't-uncommon', 0] : tot >= dc - 4 ? ['Flawed', 't-common', -1] : ['Ruined', 't-mundane', -2]; }
function yieldFor(base, b) { return b[2] === 1 ? base + 1 : b[2] === 0 ? base : b[2] === -1 ? Math.floor(base / 2) : 0; }
function rollHarvest(m, bon, adv, dis) {
  return (m.harvest || []).filter(h => D.things.has(h.m)).map(h => {
    const a = d20(), b = d20(); const nat = adv && !dis ? Math.max(a, b) : dis && !adv ? Math.min(a, b) : a;
    const tot = nat + (bon[h.skill] || 0), bd = band(tot, h.dc), q = yieldFor(h.dice ? rollDice(h.dice) : (h.q || 1), bd);
    return { h, t: D.things.get(h.m), nat, tot, q, out: bd, hazard: bd[0] === 'Ruined' && HAZARD_RE.test(h.note || '') ? h.note : '' };
  });
}
const DMS = { bundle: [], player: null, startPlayer: null, newPin: '', tab: 'forage', env: 'forest', hours: 4, bonus: 4, adv: false, lvl: 5, forage: null, trader: null, drops: [], dropOut: null, fight: {}, fightOut: [], fg: {}, fgOut: [], town: 'town', spec: 'general', theme: '', region: '' };
const TOWN = { hamlet: { n: 5, cap: 'mundane', gp: 25, label: 'Hamlet' }, village: { n: 8, cap: 'common', gp: 150, label: 'Village' }, town: { n: 12, cap: 'uncommon', gp: 1000, label: 'Town' }, city: { n: 18, cap: 'uncommon', rare: 0.08, gp: 5000, label: 'City' }, metropolis: { n: 26, cap: 'rare', rare: 0.05, gp: Infinity, label: 'Metropolis' } };
const SPEC = {
  general: { label: 'General goods', tags: null },
  alchemist: { label: 'Alchemist & herbalist', tags: ['herb', 'flower', 'root', 'fungus', 'moss', 'liquid', 'reagent', 'venom', 'gland', 'sap', 'resin', 'salt', 'potion'] },
  tanner: { label: 'Tanner & furrier', tags: ['hide', 'fur', 'leather', 'scale', 'carapace', 'sinew', 'feather'] },
  jeweler: { label: 'Jeweler & smith', tags: ['gem', 'crystal', 'pearl', 'metal', 'ingot', 'ore', 'coral'] },
  arcane: { label: 'Curio & arcana dealer', tags: ['essence', 'dust', 'ink', 'relic', 'core', 'ectoplasm', 'arcane', 'scroll'] }
};
const TRADER_A = ['Old', 'One-Eyed', 'Honest', 'Silver-Tongued', 'Grim', 'Cheerful', 'Widow', 'Brother', 'Mother', 'Captain'];
const TRADER_B = ['Marta', 'Osric', 'Yelena', 'Tobin', 'Ilsa', 'Benedek', 'Nym', 'Garrow', 'Pell', 'Hesk', 'Ondine', 'Crane'];
const TRADER_C = { general: ['Sundries', 'Trading Post', 'Wagon'], alchemist: ['Apothecary', 'Stillroom', 'Herb Cart'], tanner: ['Tannery', 'Hide & Horn', 'Furs'], jeweler: ['Forge & Facet', 'Metalworks', 'Gem Stall'], arcane: ['Curiosities', 'Oddments', 'Arcanum'] };
// ---- foraging risk: each find has its own chance of drawing a creature, with lore-fitting foes
const RISK_P = [0, 10, 25, 45], RISK_WORD = ['None', 'Low', 'Moderate', 'High'];
const PLANE_IDS = new Set(['feywild', 'shadowfell', 'elemental-fire', 'elemental-water', 'elemental-air', 'elemental-earth', 'lower-planes', 'upper-planes', 'astral']);
function riskOf(g, e) {
  if (g.risk != null) return g.risk;
  const t = D.things.get(g.m), base = t ? Math.min(3, Math.max(0, ti(t.tier) - 1)) : 1;
  return Math.min(3, base + (PLANE_IDS.has(e.id) ? 1 : 0) + (g.guard ? 1 : 0));
}
function pickFoe(g, e, lvl, not) {
  const inBand = m => { const c = crNum(m.cr); return c <= Math.max(1, lvl + 2) && c >= (lvl >= 5 ? Math.min(lvl / 5, 3) : 0); };
  const foes = (g.foes || []).map(id => D.monsters.get(id)).filter(m => m && !m.salvage);
  const locals = (D.envMon.get(e.id) || []).filter(m => !m.salvage && !foes.includes(m));
  // the find's own foes first; other local creatures only when none of them suits the party's level
  let pool = foes.filter(inBand).map((m, i) => ({ m, w: 6 - Math.min(4, i) }));
  if (!pool.length || (not && pool.every(o => o.m === not))) pool = pool.concat(locals.filter(inBand).map(m => ({ m, w: 1 })));
  if (not) pool = pool.filter(o => o.m !== not); 
  if (!pool.length) pool = foes.concat(locals).filter(m => m !== not).sort((a, b) => Math.abs(crNum(a.cr) - lvl) - Math.abs(crNum(b.cr) - lvl)).slice(0, 3).map(m => ({ m, w: 1 }));
  return pool.length ? pickW(pool, o => o.w).m : null;
}
function pickGuard(g, not) {
  if (!g.guard) return null;
  const pref = D.monsters.get(g.guard.m), alts = (g.guard.alt || []).map(id => D.monsters.get(id)).filter(Boolean);
  const opts = [pref, ...alts].filter(m => m && m !== not);
  if (not) return opts.length ? opts[rnd(opts.length)] : not;
  return !alts.length || Math.random() < 0.65 ? pref : alts[rnd(alts.length)];
}
function rollForage() {
  const e = D.envs.get(DMS.env); if (!e) return;
  const W = { mundane: 8, common: 6, uncommon: 3, rare: 1.2, 'very-rare': 0.5, legendary: 0.15 };
  const gather = (e.gather || []).filter(g => D.things.has(g.m));
  const mons = (D.envMon.get(e.id) || []).filter(m => !m.salvage && crNum(m.cr) <= Math.max(1, DMS.lvl + 1) && crNum(m.cr) >= DMS.lvl / 4);
  const rows = [];
  for (let h = 1; h <= DMS.hours; h++) {
    const g = pickW(gather, x => W[D.things.get(x.m).tier] || 1), t = D.things.get(g.m);
    const risk = riskOf(g, e), roll = 1 + rnd(100);
    const guard = pickGuard(g);
    const enc = roll <= RISK_P[risk] ? pickFoe(g, e, DMS.lvl) : null;
    rows.push({ h, g, t, guard, enc, risk, roll });
  }
  DMS.forage = { env: e, rows }; DMS.fg = {}; DMS.fgOut = [];
}
// Each trader has a theme: most of the stock follows it, some is everyday stock for that kind of shop,
// and a few odd lots came in from whoever passed through.
// tags/cats say what fits the theme; env lists the lands its goods come from (creatures living there count too).
const THEMES = {
  general: [
    { id: 'outfitter', need: ['thread', 'oil', 'healing'],  name: 'Adventurer’s outfitter', blurb: 'Rope, rations and arrows for people who go into holes for a living. Knows every rumour about the local ruins.', cats: ['weapon', 'armor', 'ammunition', 'provision'], ids: ['backpack', 'bedroll', 'blanket', 'rope', 'silk-rope', 'torch', 'lantern', 'bullseye-lantern', 'tinderbox', 'waterskin', 'rations', 'tent', 'crowbar', 'grappling-hook', 'iron-spikes', 'piton', 'chain', 'caltrops', 'ball-bearings', 'shovel', 'miners-pick', 'signal-whistle', 'mess-kit', 'hunting-trap', 'quiver', 'oil-flask', 'chalk', 'clothes-travelers', 'boots', 'whetstone', 'healers-kit', 'climbers-kit', 'potion-of-healing'], tags: ['thread', 'oil', 'healing'] },
    { id: 'market', need: ['food', 'cloth', 'herb', 'flower', 'fruit', 'hair', 'salt'],  name: 'Market-day stall', blurb: 'A farmer’s wife’s stall: honey, grain, wool, dyes and whatever the hedgerows gave this week.', tags: ['food', 'cloth', 'herb', 'flower', 'fruit', 'hair', 'salt', 'meat'], cats: ['provision'], ids: ['soap', 'candle', 'basket', 'jug', 'bowl', 'bucket', 'blanket', 'clothes-common'], env: ['grassland', 'forest'] },
    { id: 'salvage', made: ['metal', 'leather', 'hide', 'wood', 'bone'], need: ['salvage', 'metal', 'bone', 'leather'],  name: 'Battlefield scavenger', blurb: 'Picks over old battlefields and buys from anyone who does. Doesn’t ask where things came from.', tags: ['salvage', 'metal', 'bone', 'cloth', 'leather'], cats: ['weapon', 'armor'], salvage: true },
    { id: 'caravan', need: ['salt', 'resin', 'sand', 'cloth', 'silk', 'glass'],  name: 'Caravan trader', blurb: 'Just in from the far roads, with a wagon of desert salts, spices and goods from three countries.', tags: ['salt', 'resin', 'sand', 'cloth', 'silk', 'glass'], env: ['desert', 'coast', 'grassland'] }
  ],
  alchemist: [
    { id: 'hedge', need: ['herb', 'flower', 'root', 'moss', 'leaf', 'fruit'],  name: 'Hedge-witch’s herb cart', blurb: 'Every herb has a story, and she will tell you all of them. Smells of chamomile and woodsmoke.', tags: ['herb', 'flower', 'root', 'moss', 'leaf', 'healing', 'fruit'], env: ['forest', 'grassland', 'hill', 'swamp'], cats: ['potion'] },
    { id: 'poison', need: ['poison', 'venom', 'gland', 'fungus'],  name: 'Discreet poisoner’s cabinet', blurb: 'The front room sells cough syrup. The back room has a curtain and no windows.', tags: ['poison', 'venom', 'gland', 'fungus', 'paralysis', 'sleep', 'acid'], cats: ['poison'] },
    { id: 'healer', need: ['healing', 'regeneration', 'blessing'],  name: 'Temple stillroom', blurb: 'Run by a patient acolyte. Healing draughts, blessed salts and herbs picked at dawn.', tags: ['healing', 'regeneration', 'blessing', 'radiant', 'celestial', 'herb'], cats: ['potion'] },
    { id: 'deep', need: ['fungus', 'moss', 'slime', 'ooze'],  name: 'Undermarket mushroom dealer', blurb: 'Down the stairs under the tannery: glowing caps, cave truffles and things that crawl out of the dark.', tags: ['fungus', 'moss', 'slime', 'ooze', 'darkvision'], env: ['underdark', 'ruins', 'swamp'] },
    { id: 'fire', need: ['fire', 'oil', 'ash'],  name: 'Fireworks & fire-salts', blurb: 'Singed eyebrows, a missing finger and the best alchemist’s fire in the region.', tags: ['fire', 'oil', 'resin', 'ash', 'salt', 'lightning'], cats: ['oil'] }
  ],
  tanner: [
    { id: 'north', need: ['fur', 'hair'],  name: 'Northern furrier', blurb: 'Pelts from the far north, thick enough to sleep in the snow. Buys winter wolf hides at any price.', tags: ['fur', 'hide', 'cold', 'hair', 'fat'], env: ['arctic', 'mountain', 'hill'] },
    { id: 'swamp', need: ['scale', 'hide', 'leather'],  name: 'Swamp leathers', blurb: 'Crocodile belts, lizard-scale vests and a smell you stop noticing after an hour.', tags: ['scale', 'hide', 'swimming', 'poison', 'leather'], env: ['swamp', 'coast', 'underwater'] },
    { id: 'monster', need: ['hide', 'scale', 'carapace', 'leather'],  name: 'Monster-hide specialist', blurb: 'Only buys from hunters who bring the whole beast. Walls hung with trophies no one else would stuff.', tags: ['monstrosity', 'dragon', 'scale', 'carapace', 'hide', 'horn', 'claw'] },
    { id: 'fletch', need: ['feather', 'sinew'],  name: 'Fletcher & feather-trader', blurb: 'Goose, griffon, roc: if it has feathers, she can make it fly straight.', tags: ['feather', 'wing', 'sinew', 'flight', 'wood'], ids: ['longbow', 'shortbow', 'light-crossbow', 'hand-crossbow', 'heavy-crossbow', 'arrows', 'crossbow-bolts', 'blowgun', 'blowgun-needles', 'quiver', 'sling', 'sling-bullets'] }
  ],
  jeweler: [
    { id: 'dwarf', made: ['metal', 'ingot'], need: ['metal', 'ingot', 'ore'],  name: 'Dwarven metalworks', blurb: 'A clan forge with a shop front. Ore from deep veins, ingots stamped with the clan rune, blades on the wall.', tags: ['metal', 'ingot', 'ore', 'stone', 'earth'], env: ['mountain', 'underdark', 'hill'], cats: ['weapon', 'armor'], ids: ['smiths-tools', 'tinkers-tools', 'masons-tools', 'miners-pick', 'chain', 'iron-spikes', 'manacles', 'lock', 'iron-pot'] },
    { id: 'gems', need: ['gem', 'crystal'],  name: 'Gem-cutter’s window', blurb: 'Velvet trays, a loupe on a chain, and prices that change depending on how you are dressed.', tags: ['gem', 'crystal', 'glass', 'light'] },
    { id: 'sea', need: ['pearl', 'coral', 'shell'],  name: 'Pearl & coral merchant', blurb: 'Just off the ship. Pearls, coral, sea-glass and a parrot that insults customers.', tags: ['pearl', 'coral', 'shell', 'water', 'swimming', 'salt'], env: ['coast', 'underwater'] },
    { id: 'storm', need: ['lightning', 'storm', 'thunder', 'metal'],  name: 'Stormforge', blurb: 'A smith who works only during thunderstorms. Lightning-struck metals and humming crystals.', tags: ['lightning', 'storm', 'thunder', 'metal', 'crystal', 'air'] }
  ],
  arcane: [
    { id: 'necro', need: ['necrotic', 'undead', 'undeath', 'death', 'shadow'],  name: 'Bone-and-candle shop', blurb: 'Grave dust, ectoplasm and skulls in jars. The owner is very pale and very polite.', tags: ['necrotic', 'undead', 'undeath', 'bone', 'shadow', 'death', 'curse'], env: ['shadowfell', 'ruins'] },
    { id: 'elemental', need: ['elemental', 'core'],  name: 'Elemental curios', blurb: 'Shelves that hum, hiss and occasionally spark. Keep your hands off the red jars.', tags: ['elemental', 'fire', 'cold', 'lightning', 'core', 'earth', 'air', 'water'], env: ['elemental-fire', 'elemental-water', 'elemental-air', 'elemental-earth'] },
    { id: 'fey', need: ['fey', 'charm', 'illusion', 'luck'],  name: 'Fey trinket peddler', blurb: 'His prices are always “a small favour, later”. Everything glitters slightly.', tags: ['fey', 'charm', 'illusion', 'luck', 'sleep', 'flower'], env: ['feywild', 'forest'] },
    { id: 'scribe', need: ['ink', 'knowledge', 'reagent'],  name: 'Scribe & scroll-seller', blurb: 'Inks, vellum and scrolls copied by candlelight. Smells of paper and old magic.', tags: ['ink', 'reagent', 'knowledge', 'arcane', 'thread'], cats: ['scroll'] },
    { id: 'planar', need: ['fiendish', 'celestial', 'planar', 'infernal', 'abyssal'],  name: 'Planar bazaar stall', blurb: 'Goods from places that aren’t on any map: brimstone, angel-feather dust, and one jar that should not be opened.', tags: ['fiendish', 'celestial', 'planar', 'infernal', 'abyssal', 'radiant'], env: ['lower-planes', 'upper-planes', 'astral'] }
  ]
};
const ODD_LOTS = ['bought off a limping adventurer', 'salvaged from a wrecked caravan', 'left as payment for a debt', 'came in a crate addressed to someone else', 'won at cards last night', 'traded by a nervous stranger', 'found in a dead customer’s pack', 'bought cheap from a passing sailor'];
let thingLands = null;
// what an item is made of: the tags of its recipe's components (one level down)
const madeMemo = new Map();
function madeOf(x) {
  if (madeMemo.has(x.id)) return madeMemo.get(x.id);
  const out = new Set();
  for (const c of (x.recipe || {}).components || []) {
    if (c.any) c.any.forEach(t => out.add(t));
    for (const id of c.m ? [c.m] : c.oneOf || []) { const t = D.things.get(id); if (t) t.tags.forEach(g => out.add(g)); }
  }
  madeMemo.set(x.id, out); return out;
}
const catFits = (x, th) => x.kind === 'item' && ((th.ids || []).includes(x.id) || ((th.cats || []).includes(x.cat) && (!th.made || th.made.some(t => madeOf(x).has(t)))));
function landsOf(id) {
  if (!thingLands) { thingLands = new Map(); const add = (k, e) => { if (!thingLands.has(k)) thingLands.set(k, new Set()); thingLands.get(k).add(e); };
    for (const [k, arr] of D.gat) for (const { e } of arr) add(k, e.id);
    for (const [k, arr] of D.src) for (const { m } of arr) for (const e of m.env || []) add(k, e); }
  return thingLands.get(id) || new Set();
}
function themeScore(x, th, region) {
  let sc = 0;
  for (const tg of th.tags || []) if (x.tags.includes(tg)) sc += 1;
  if (catFits(x, th)) sc += 2;
  const lands = landsOf(x.id);
  if ((th.env || []).some(e => lands.has(e))) sc += 1;
  if (region && lands.has(region)) sc += 1.5;
  return sc;
}
function rollTrader() {
  const T = TOWN[DMS.town], S = SPEC[DMS.spec], capI = ti(T.cap);
  const nOdd = T.n >= 12 ? 2 : 1, nCore = Math.round(T.n * 0.65), nDay = T.n - nCore - nOdd;
  const themes = THEMES[DMS.spec] || [];
  // with a nearby land set, a random theme is drawn from those that suit the land
  const fits = DMS.region ? themes.filter(t => (t.env || []).includes(DMS.region)) : [];
  const neutral = themes.filter(t => !(t.env || []).length);
  const pickFrom = fits.length ? fits : DMS.region && neutral.length ? neutral : themes;
  const th = themes.find(t => t.id === DMS.theme) || pickFrom[rnd(pickFrom.length)];
  const sellable = x => x.value && !x.tags.includes('relic') && (x.kind === 'material' || (x.kind === 'item' && (x.tier === 'mundane' || ['potion', 'scroll', 'oil', 'ammunition', 'provision', 'poison'].includes(x.cat))));
  const all = [...D.things.values()].filter(x => sellable(x) && x.value <= (T.gp || Infinity) && (th.salvage || !x.tags.includes('salvage')));
  const inCap = x => ti(x.tier) <= capI, rareOk = x => ti(x.tier) === capI + 1;
  const okTag = x => !S.tags || S.tags.some(tg => x.tags.includes(tg)) || catFits(x, th);
  const needOk = x => (x.kind === 'material' && (th.need || th.tags || []).some(tg => x.tags.includes(tg))) || catFits(x, th) || (x.kind === 'item' && !(th.cats || []).length && !(th.ids || []).length && (th.need || []).some(tg => x.tags.includes(tg)));
  let scored = all.filter(x => okTag(x) && needOk(x)).map(x => ({ x, sc: 1 + themeScore(x, th, DMS.region) }));
  if (scored.filter(o => inCap(o.x)).length < nCore) scored = scored.concat(all.filter(x => okTag(x) && !needOk(x)).map(x => ({ x, sc: themeScore(x, th, DMS.region) })).filter(o => o.sc >= 2));
  // variety: each pick makes others of the same form (hide, gem, meat…) less likely
  const formOf = x => x.kind === 'item' ? 'cat:' + x.cat : (x.tags.find(tg => FORM_TAGS.includes(tg)) || 'other'), formN = {};
  const vary = x => 1 / (1 + 3 * (formN[formOf(x)] || 0));
  const seen = new Set(), stock = [];
  const take = (x, sec, note) => {
    if (!x || seen.has(x.id)) return false; seen.add(x.id);
    const q = [1 + rnd(10), 1 + rnd(6), 1 + rnd(3), 1, 1, 1][ti(x.tier)];
    // the speciality is priced a little keener, odd lots are a gamble
    const f = sec === 'core' ? 0.8 + Math.random() * 0.4 : sec === 'odd' ? 0.6 + Math.random() * 0.9 : 0.9 + Math.random() * 0.5;
    stock.push({ x, q, price: Math.max(0.01, x.value * f), sec, note, rare: ti(x.tier) > capI }); formN[formOf(x)] = (formN[formOf(x)] || 0) + 1; return true;
  };
  // 1. the speciality: weighted by how well each good fits the theme (and the local land, if set)
  const core = scored.filter(o => inCap(o.x) || (T.rare && rareOk(o.x) && Math.random() < T.rare * 4));
  for (let i = 0; i < nCore * 6 && stock.filter(s => s.sec === 'core').length < nCore && core.length; i++) { const o = pickW(core, o => o.sc * o.sc * (ti(o.x.tier) <= 1 ? 1.4 : 1) * vary(o.x)); take(o.x, 'core'); }
  // 2. everyday stock for this kind of shop
  const day = all.filter(x => inCap(x) && okTag(x) && !seen.has(x.id));
  for (let i = 0; i < nDay * 6 && stock.filter(s => s.sec === 'day').length < nDay && day.length; i++) { const x = pickW(day, x => (DMS.region && landsOf(x.id).has(DMS.region) ? 3 : 1) * (ti(x.tier) === 0 ? 2 : 1) * vary(x)); take(x, 'day'); }
  // 3. odd lots from anywhere, one step rarer at most
  const oddCap = T.rare && Math.random() < 0.3 ? capI + 1 : capI;
  const odd = all.filter(x => ti(x.tier) <= oddCap && !seen.has(x.id) && !needOk(x));
  for (let i = 0; i < 20 && stock.filter(s => s.sec === 'odd').length < nOdd && odd.length; i++) take(odd[rnd(odd.length)], 'odd', ODD_LOTS[rnd(ODD_LOTS.length)]);
  const order = { core: 0, day: 1, odd: 2 };
  stock.sort((a, b) => order[a.sec] - order[b.sec] || ti(a.x.tier) - ti(b.x.tier) || byName(a.x, b.x));
  const nm = `${TRADER_A[rnd(TRADER_A.length)]} ${TRADER_B[rnd(TRADER_B.length)]}'s ${TRADER_C[DMS.spec][rnd(3)]}`;
  const buys = [...new Set([...(th.tags || []).slice(0, 4)])];
  DMS.trader = { nm, T, S, th, stock, buys, region: DMS.region };
}
// one row per part per kind of creature; the yield covers every body of that kind
function fightRows() {
  const rows = [];
  for (const { id, n } of DMS.drops) {
    const m = D.monsters.get(id); if (!m) continue;
    (m.harvest || []).forEach((h, k) => { const t = D.things.get(h.m); if (!t) return; rows.push({ key: id + ':' + k, m, n, h, t, dice: h.dice ? (n > 1 ? `${n}×${h.dice}` : h.dice) : '', fixed: (h.q || 1) * n }); });
  }
  return rows;
}
function evalFight() {
  const rows = fightRows(); let total = 0; const res = [], haz = [];
  rows.forEach((r, i) => {
    const cell = document.getElementById('fres-' + i); if (!cell) return;
    const raw = DMS.fight[r.key + '|t']; if (raw === '' || raw == null || isNaN(+raw)) { cell.innerHTML = '<span class="muted small">Waiting for a roll</span>'; return; }
    const bd = band(+raw, r.h.dc), yRaw = DMS.fight[r.key + '|y'];
    const needY = bd[2] >= -1 && r.dice && (yRaw === '' || yRaw == null);
    const base = r.dice ? Math.max(0, parseInt(yRaw, 10) || 0) : (yRaw === '' || yRaw == null || isNaN(+yRaw) ? r.fixed : Math.max(0, parseInt(yRaw, 10) || 0));
    const q = needY ? 0 : yieldFor(base, bd);
    const hz = bd[0] === 'Ruined' && HAZARD_RE.test(r.h.note || '') ? r.h.note : ''; if (hz) haz.push(`${r.m.name}: ${hz}`);
    cell.innerHTML = `<span class="pill ${bd[1]}">${bd[0]}</span> ${needY ? `<span class="small muted">roll the yield (${esc(r.dice)})</span>` : `<span class="mono">×${q}</span>`}<div class="note">${esc(OUTCOME_TEXT[bd[0]])} ${+raw - r.h.dc >= 0 ? `Beat the DC by ${+raw - r.h.dc}.` : `Missed by ${r.h.dc - +raw}.`}</div>`;
    if (!needY && q) { res.push({ id: r.t.id, q }); total += q; }
  });
  DMS.fightOut = res;
  const hb = $('#fightHaz'); if (hb) hb.innerHTML = haz.length ? `<div class="guard">${svg('shield')}<span><b>Hazards:</b> ${haz.map(esc).join(' · ')}</span></div>` : '';
  ['#fightParty', '#fightMine'].forEach(k => { const b = $(k); if (b) b.disabled = !total; });
  const sm = $('#fightSum'); if (sm) sm.textContent = total ? `${plural(total, 'part')} ready` : '';
}
function evalForage() {
  const F = DMS.forage; if (!F) return; let total = 0, blocked = 0; const res = [];
  F.rows.forEach((r, i) => {
    const cell = document.getElementById('gres-' + i); if (!cell) return;
    const raw = DMS.fg[i + '|t']; if (raw === '' || raw == null || isNaN(+raw)) { cell.innerHTML = '<span class="muted small">Waiting for a roll</span>'; return; }
    const bd = band(+raw, r.g.dc), yRaw = DMS.fg[i + '|y'], fixed = r.g.q || 1;
    const needY = bd[2] >= -1 && r.g.dice && (yRaw === '' || yRaw == null);
    const base = yRaw === '' || yRaw == null || isNaN(+yRaw) ? (r.g.dice ? 0 : fixed) : Math.max(0, parseInt(yRaw, 10) || 0);
    const q = needY ? 0 : yieldFor(base, bd), locked = r.guard && !DMS.fg[i + '|ok'];
    cell.innerHTML = `<span class="pill ${bd[1]}">${bd[0]}</span> ${needY ? `<span class="small muted">roll the yield (${esc(r.g.dice)})</span>` : `<span class="mono">×${q}</span>`}${locked && q ? ' <span class="small muted">(guarded)</span>' : ''}<div class="note">${esc(OUTCOME_TEXT[bd[0]])} ${+raw - r.g.dc >= 0 ? `Beat the DC by ${+raw - r.g.dc}.` : `Missed by ${r.g.dc - +raw}.`}</div>`;
    if (!needY && q) { if (locked) blocked += q; else { res.push({ id: r.t.id, q }); total += q; } }
  });
  DMS.fgOut = res;
  ['#fgParty', '#fgMine'].forEach(k => { const b = $(k); if (b) b.disabled = !total; });
  const sm = $('#fgSum'); if (sm) sm.textContent = total || blocked ? `${plural(total, 'find')} ready${blocked ? `, ${blocked} still guarded` : ''}` : '';
}
const rollDiceN = (dice, n) => { let s = 0; for (let i = 0; i < n; i++) s += rollDice(dice); return s; };
function rollDrops() {
  const bon = store.get(SKILL_KEY, {});
  const agg = new Map(), hazards = [];
  for (const { id, n } of DMS.drops) {
    const m = D.monsters.get(id); if (!m) continue;
    for (let k = 0; k < n; k++) for (const r of rollHarvest(m, bon, !!bon._adv, !!bon._dis)) {
      const A = agg.get(r.t.id) || { t: r.t, q: 0, rolls: 0, best: '' }; A.q += r.q; A.rolls++; agg.set(r.t.id, A);
      if (r.hazard) hazards.push(`${m.name}: ${r.hazard}`);
    }
  }
  DMS.dropOut = { rows: [...agg.values()].sort((a, b) => ti(b.t.tier) - ti(a.t.tier) || byName(a.t, b.t)), hazards: [...new Set(hazards)].slice(0, 8) };
}
const PRINT_KEY = 'scavengers-codex.cards.v1';
const entOf = (ty, id) => ty === 'C' ? D.monsters.get(id) : ty === 'P' ? D.envs.get(id) : D.things.get(id);
const cardSheet = () => store.get(PRINT_KEY, []).filter(c => c && c.ty && entOf(c.ty, c.id));
const CARD_KIND = { F: 'Formula', I: 'Item', C: 'Creature', P: 'Place', M: 'Material' };
function cardData(ty, id) {
  const o = entOf(ty, id); if (!o) return null;
  const clip = (arr, n) => arr.slice(0, n).join(' · ') + (arr.length > n ? ' …' : '');
  const d = { o, kind: CARD_KIND[ty], tier: o.tier || 'common', badge: '', type: '', text: '', label: '', list: '' };
  if (o.kind === 'monster') {
    d.badge = CFG.player.threat === 'cr' ? `CR ${o.cr}` : threatWord(o); d.type = `${o.size} ${o.type}`; d.text = o.blurb || '';
    d.tier = ['mundane', 'common', 'uncommon', 'rare', 'very-rare', 'legendary'][Math.min(5, Math.floor(crNum(o.cr) / 4) + (crNum(o.cr) >= 1 ? 1 : 0))];
    d.label = o.salvage ? 'Salvage' : 'Parts'; d.list = clip((o.harvest || []).map(h => D.things.get(h.m)).filter(Boolean).map(t => t.name.replace(o.name, '').trim() || t.name), 6);
  } else if (o.kind === 'place') {
    d.badge = 'Place'; d.type = 'A place to forage'; d.text = o.desc || ''; d.tier = 'uncommon';
    d.label = 'Finds'; d.list = clip((o.gather || []).map(g => D.things.get(g.m)).filter(Boolean).map(t => t.name), 6);
  } else {
    d.badge = TIER_LABEL[o.tier]; d.type = o.kind === 'item' ? `${CAT_LABEL[o.cat] || cap(o.cat)}${o.attune ? ' · attunement' : ''}` : `Keeps ${o.perish || 'stable'}`;
    d.text = o.effect || o.desc || '';
    if (ty === 'F' && o.recipe) { d.label = 'Components'; d.list = clip(o.recipe.components.map(c => `${(c.q || 1) > 1 ? c.q + '× ' : ''}${slotLabel(c)}`), 6); }
    else if (ty === 'M') { const s = (D.src.get(o.id) || []).map(x => x.m.name), g = (D.gat.get(o.id) || []).map(x => x.e.name); d.label = 'Found'; d.list = clip([...s, ...g], 4) || (o.recipe ? 'Refined or crafted' : 'Bought from traders'); }
  }
  return d;
}
const CARD_EMBLEM = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="36" stroke-dasharray="2 3"/><path d="M50 10 L57 43 L90 50 L57 57 L50 90 L43 57 L10 50 L43 43 Z"/><path d="M36 64 L50 30 L64 64 M41 53 H59" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
function cardFront(c) {
  const d = cardData(c.ty, c.id), o = d.o;
  const art = window.CodexPlates ? window.CodexPlates.plate(o, {}) : '';
  return `<div class="tc-face tc-front k-${c.ty} t-${d.tier}"><div class="tc-inner">
    <div class="tc-top"><span class="tc-name">${esc(o.name)}</span><span class="tc-badge">${esc(d.badge)}</span></div>
    <div class="tc-art">${art}</div>
    <div class="tc-type"><span class="tc-kind">${esc(d.kind)}</span> ${esc(d.type)}</div>
    <div class="tc-text">${esc(d.text)}</div>
    ${d.list ? `<div class="tc-list"><b>${esc(d.label)}:</b> ${esc(d.list)}</div>` : ''}
    <div class="tc-foot"><span>Scavenger's Codex</span><span class="mono">${esc(makeCode([[c.ty, c.id]]))}</span></div></div></div>`;
}
function cardBack(c, i, editable) {
  const d = cardData(c.ty, c.id);
  const link = codeLink(makeCode([[c.ty, c.id]]));
  return `<div class="tc-face tc-back k-${c.ty} t-${d.tier}"><div class="tc-inner">
    ${link ? `<div class="tc-qr">${qrSVG(link)}</div>` : `<div class="tc-emblem">${CARD_EMBLEM}</div>`}
    <p class="tc-note"${editable ? ` contenteditable="true" spellcheck="true" data-cnote="${i}" title="Click to reword"` : ` data-pnote="${i}"`}>${esc(c.text || handoutText([[c.ty, c.id]]))}</p>
    <div class="tc-code mono">${esc(makeCode([[c.ty, c.id]]))}</div>
    <div class="tc-foot tc-foot-c">${link ? 'Scan it, or enter the code in your Journal' : 'Enter this code in your Journal'}</div></div></div>`;
}
function pPrint() {
  if (!isDM()) return `<div class="page"><h1>Handout cards</h1><div class="empty">The cards are for the DM.</div></div>`;
  const sheet = cardSheet(), mode = store.get('scavengers-codex.cardMode', 'duplex');
  const screen = sheet.map((c, i) => `<div class="tcard" data-act="cflip" role="button" tabindex="0" aria-label="${esc(entOf(c.ty, c.id).name)} card, press to flip"><div class="tc-flip">${cardFront(c)}${cardBack(c, i, true)}</div><button class="btn sm noprint tc-x" type="button" data-act="printdel" data-i="${i}" aria-label="Remove card">✕</button></div>`).join('');
  // print pages: 9 cards per A4 page; backs mirrored so they line up when printed double-sided (flip on the long edge)
  let pages = '';
  if (mode === 'fold') {
    for (let p = 0; p < sheet.length; p += 3) pages += `<div class="psheet fold">${sheet.slice(p, p + 3).map((c, k) => `<div class="pcard">${cardFront(c)}</div><div class="pcard">${cardBack(c, p + k)}</div>`).join('')}</div>`;
  } else {
    for (let p = 0; p < sheet.length; p += 9) {
      const chunk = sheet.slice(p, p + 9);
      pages += `<div class="psheet">${chunk.map(c => `<div class="pcard">${cardFront(c)}</div>`).join('')}</div>`;
      if (mode === 'duplex') {
        const rows = []; for (let r = 0; r < chunk.length; r += 3) { const row = chunk.slice(r, r + 3).map((c, k) => cardBack(c, p + r + k)); while (row.length < 3) row.push(''); rows.push(row.reverse()); }
        pages += `<div class="psheet">${rows.flat().map(h => `<div class="pcard">${h}</div>`).join('')}</div>`;
      }
    }
  }
  const mbtn = (m, l) => `<button class="btn sm${mode === m ? ' primary' : ''}" type="button" data-act="cmode" data-m="${m}">${l}</button>`;
  return `<div class="page print-page"><div class="noprint"><div class="section-head"><h1>Handout cards</h1><span class="count">${plural(sheet.length, 'card')}</span></div>
    <p class="lede">One card per entry. Tap a card to flip it. The back holds the in-world note (click it to reword) and the unlock code.</p>
    <div class="frow"><button class="btn primary" type="button" data-act="print">Print</button>${sheet.length ? '<button class="btn" type="button" data-act="cflipall">Flip all</button>' : ''}<a class="btn" href="#/dm">Back to DM tools</a>${sheet.length ? '<button class="btn" type="button" data-act="printclear">Remove all</button>' : ''}</div>
    <div class="frow"><span class="small muted">Print layout:</span>${mbtn('duplex', 'Double-sided')}${mbtn('fold', 'Fold-over')}${mbtn('fronts', 'Fronts only')}<span class="small muted">${mode === 'duplex' ? 'Print on both sides, flipping on the long edge. Backs are mirrored so they line up.' : mode === 'fold' ? 'Front and back side by side: cut out the pair and fold it down the middle.' : 'Fronts only, with the code in the corner.'}${window.CODEX_ARTIFACT ? ' Printing may be blocked in this preview: print from the GitHub Pages site.' : ''}</span></div></div>
    ${sheet.length ? `<div class="cards-screen noprint">${screen}</div><div class="print-only">${pages}</div>` : '<div class="empty">No cards yet. Press <b>Make a card</b> on any handout.</div>'}</div>`;
}

/* ---- homebrew packs (DM tools > Homebrew) ---- */
const HB = { text: '', fileName: '', res: null, pack: null, name: '' };
function hbOwn(name) {
  const old = localPacks().find(p => p.name === name), own = { things: new Set(), monsters: new Set() };
  if (old) { for (const k of ['materials', 'items']) for (const t of old.data[k] || []) own.things.add(t.id); for (const m of old.data.monsters || []) own.monsters.add(m.id); }
  return own;
}
function hbCheck(text) {
  HB.text = text; HB.res = null; HB.pack = null; HB.name = '';
  if (!text.trim()) return;
  let pack; try { pack = JSON.parse(text); } catch (e) { HB.res = { errors: ['That isn’t valid JSON: ' + e.message], warnings: [], counts: {} }; return; }
  const meta = pack && typeof pack.homebrew === 'object' && pack.homebrew ? pack.homebrew : {};
  HB.name = window.CodexHomebrew.slug(meta.name || HB.fileName.replace(/\.json$/i, '').replace(/\.homebrew$/i, '')) || 'my-homebrew';
  if (pack && typeof pack === 'object') for (const it of pack.items || []) if (it && typeof it === 'object' && !it.src) it.src = 'Homebrew';
  HB.res = window.CodexHomebrew.validate(pack, { things: D.things, monsters: D.monsters, envs: D.envs }, hbOwn(HB.name));
  if (!HB.res.errors.length) HB.pack = pack;
}
function hbTab() {
  const list = localPacks(), r = HB.res, c = (r && r.counts) || {};
  const sum = ['materials', 'items', 'monsters', 'environments', 'cultivation'].filter(k => c[k]).map(k => `${c[k]} ${k === 'monsters' ? 'creatures' : k === 'environments' ? 'place extensions' : k === 'cultivation' ? 'garden plants' : k}`).join(', ');
  const exists = HB.pack && list.some(p => p.name === HB.name);
  return `<div class="card pad"><h2>Homebrew packs</h2>
    <p class="small muted">Add your own materials, items and creatures from a pack file. A pack is checked against the codex first and nothing is added if it has problems. A pack added here lives <b>on this device only</b>. To share it with your players, use “Download as repo file” and put it in the codex repo (see the README, “Adding your own homebrew”).</p>
    ${hbLoadError ? `<div class="empty">A saved pack could not be loaded and was skipped: ${esc(hbLoadError)}. Remove it below.</div>` : ''}
    ${list.length ? `<div class="sat-list">${list.map(p => `<div class="sat-row"><div class="txt"><span class="name">${esc((p.data.homebrew && p.data.homebrew.title) || p.name)}</span><span class="small muted">Added ${esc(String(p.addedAt || '').slice(0, 10))} · on this device</span></div><button class="btn sm" type="button" data-act="hbdl" data-name="${esc(p.name)}">Download</button><button class="btn sm" type="button" data-act="hbrm" data-name="${esc(p.name)}">Remove</button></div>`).join('')}</div>` : '<p class="small muted">No packs added on this device yet.</p>'}
    <h3>Add a pack</h3>
    <div class="frow"><input type="file" id="hbFile" accept=".json,application/json" aria-label="Pack file"></div>
    <textarea class="textin mono" id="hbText" rows="5" placeholder="…or paste the pack JSON here" aria-label="Pack JSON">${esc(HB.text)}</textarea>
    <div class="frow"><button class="btn sm primary" type="button" data-act="hbcheck">Check pack</button></div>
    ${r ? (r.errors.length
      ? `<div class="empty"><b>Not added: ${plural(r.errors.length, 'problem')}</b><ul class="small">${r.errors.slice(0, 40).map(e => `<li>${esc(e)}</li>`).join('')}</ul>${r.errors.length > 40 ? `<p class="small">…and ${r.errors.length - 40} more.</p>` : ''}</div>`
      : `<div class="card pad"><b>Looks good: ${esc(sum || 'nothing')}.</b>${r.warnings.length ? `<ul class="small">${r.warnings.slice(0, 20).map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
        <div class="frow"><button class="btn sm primary" type="button" data-act="hbuse">${exists ? 'Replace' : 'Add'} “${esc(HB.name)}” on this device</button><button class="btn sm" type="button" data-act="hbdl" data-name="">Download as repo file</button></div></div>`) : ''}</div>`;
}
function hbDownload(obj, name) {
  try { const blob = new Blob([JSON.stringify(obj, null, 1) + '\n'], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `homebrew-${name}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Saved. Put it in the repo’s data folder, or run tools/add_homebrew.py'); }
  catch (e) { toast('Download blocked here'); }
}
function hbAct(act, el) {
  if (act === 'hbcheck') { const t = $('#hbText'); hbCheck(t ? t.value : HB.text); rerender(); return; }
  if (act === 'hbuse') {
    if (!HB.pack) return;
    const next = localPacks().filter(p => p.name !== HB.name), entry = { name: HB.name, addedAt: new Date().toISOString(), data: HB.pack };
    store.set(HB_KEY, next.concat([entry]));
    toast(`“${HB.name}” added. Reloading…`); setTimeout(() => location.reload(), 500); return;
  }
  if (act === 'hbdl') { const n = el.dataset.name; const p = n ? localPacks().find(x => x.name === n) : null; hbDownload(p ? p.data : HB.pack, p ? p.name : HB.name); return; }
  if (act === 'hbrm') {
    if (!el.dataset.confirm) { el.dataset.confirm = '1'; el.textContent = 'Tap again to remove'; return; }
    store.set(HB_KEY, localPacks().filter(p => p.name !== el.dataset.name));
    toast('Removed. Reloading…'); setTimeout(() => location.reload(), 500);
  }
}
function pDM() {
  const envOpts = [...D.envs.values()].map(e => `<option value="${e.id}"${DMS.env === e.id ? ' selected' : ''}>${esc(e.name)}</option>`).join('');
  if (!isDM()) return `<div class="page"><h1>DM tools</h1><div class="empty">These tools are for the DM. ${pinSet() ? 'Switch to DM view with the PIN to use them.' : 'Switch to DM view at the top to use them.'}</div></div>`;
  const tabs = [['forage', 'Forage expedition'], ['trader', 'Wandering trader'], ['drops', 'After the fight'], ['session', 'Session'], ['handouts', 'Handouts'], ['settings', 'Player setup & PIN']];
  if (window.CodexHomebrew) tabs.splice(5, 0, ['homebrew', 'Homebrew']);
  let body = '';
  if (DMS.tab === 'forage') {
    const F = DMS.forage, saved = store.get(SKILL_KEY, {});
    const skills = F ? [...new Set(F.rows.map(r => r.g.skill))] : [];
    body = `<div class="card roller"><h2 style="margin-top:0">1 · Where and how long</h2><div class="frow">
        <label class="skill-in" for="dmEnv">Place <select class="select" id="dmEnv" data-dm="env">${envOpts}</select></label>
        <label class="skill-in" for="dmHours">Hours <input class="textin mono" type="number" min="1" max="12" id="dmHours" data-dm="hours" value="${DMS.hours}"></label>
        <label class="skill-in" for="dmLvl">Party level <input class="textin mono" type="number" min="1" max="20" id="dmLvl" data-dm="lvl" value="${DMS.lvl}"></label>
        <button class="btn primary sm" type="button" data-act="dmforage">Roll the expedition</button></div>
        <p class="small muted">Each hour turns up one gatherable, with rarer finds less likely. Every find carries its own risk of drawing a creature (none, low 10%, moderate 25%, high 45%), picked to suit that find and the party's level: a wayside herb is safe, an owlbear's hollow is not. Encounters are suggestions: reroll or dismiss them. Guarded finds can only be taken once the guardian is dealt with, and the guardian varies now and then. You still judge conditions like "only under a full moon".</p></div>
      ${F ? `<div class="card roller"><h2 style="margin-top:0">2 · What they find in ${esc(F.env.name)}</h2>
        <p class="small muted">Read out what they come across, then type in each forager's check, or roll it all at once. Results follow the <a href="#/rules/forage">foraging rules</a>.</p>
        <div class="tbl-wrap"><table class="hman fight forage"><thead><tr><th>Hour</th><th>Find</th><th>Check</th><th>Total rolled</th><th>Yield if successful</th><th>Result</th><th>Notes</th></tr></thead><tbody>
        ${F.rows.map((r, i) => `<tr><td class="mono">${r.h}</td><td><a href="${linkOf(r.t)}"><b>${esc(r.t.name)}</b></a> <span class="t-${r.t.tier} small">●</span><div class="note">keeps ${esc(r.t.perish || 'stable')}</div></td>
          <td class="nowrap">${esc(r.g.skill)} <span class="mono">DC ${esc(r.g.dc)}</span></td>
          <td><input class="textin mono" type="number" inputmode="numeric" data-gk="t" data-i="${i}" value="${esc(DMS.fg[i + '|t'] ?? '')}" placeholder="—" aria-label="Total for ${esc(r.t.name)}" style="width:76px"></td>
          <td><div class="yield-in"><input class="textin mono" type="number" min="0" data-gk="y" data-i="${i}" value="${esc(DMS.fg[i + '|y'] ?? (r.g.dice ? '' : (r.g.q || 1)))}" placeholder="${esc(r.g.dice || '')}" aria-label="Yield for ${esc(r.t.name)}">${r.g.dice ? `<button class="btn sm die" type="button" data-act="fgyield" data-i="${i}">${svg('dice')}Roll <span class="mono">${esc(r.g.dice)}</span></button>` : '<span class="note">always</span>'}</div></td>
          <td id="gres-${i}" class="hres"><span class="muted small">Waiting for a roll</span></td>
          <td class="small">${esc(r.g.cond || '')}
            <div class="risk r${r.risk}"><b>Risk: ${RISK_WORD[r.risk]}</b>${r.risk ? ` (${RISK_P[r.risk]}%)` : ''}${r.g.riskWhy ? ` · ${esc(r.g.riskWhy)}` : ''}</div>
            ${r.guard ? `<div class="guard">${svg('shield')}<span><b>Guardian: <a href="#/monster/${r.guard.id}">${esc(r.guard.name)}</a></b> <span class="mono">CR ${esc(r.guard.cr)}</span>${r.guard.id === r.g.guard.m ? `. ${esc(r.g.guard.note || '')}` : ' <span class="muted">(standing in for the usual guardian)</span>'}
              <span class="frow tight"><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-gk="ok" data-i="${i}"${DMS.fg[i + '|ok'] ? ' checked' : ''}> Guardian dealt with</label>${(r.g.guard.alt || []).length ? `<button class="btn xs" type="button" data-act="fgguard" data-i="${i}">Another guardian</button>` : ''}</span></span></div>` : ''}
            ${r.enc ? `<div class="guard enc">${svg('beast')}<span><b>Encounter: <a href="#/monster/${r.enc.id}">${esc(r.enc.name)}</a></b> <span class="mono">CR ${esc(r.enc.cr)}</span> <span class="muted">· rolled ${r.roll} vs ${RISK_P[r.risk]}%</span>
              <span class="frow tight"><button class="btn xs" type="button" data-act="fgenc" data-i="${i}">Reroll</button><button class="btn xs" type="button" data-act="fgencx" data-i="${i}">Dismiss</button></span></span></div>`
              : `<div class="quiet">${r.dismissed ? 'Encounter dismissed.' : `Quiet${r.risk ? ` (rolled ${r.roll} vs ${RISK_P[r.risk]}%)` : ''}.`} <button class="btn xs" type="button" data-act="fgenc" data-i="${i}">Roll an encounter anyway</button></div>`}</td></tr>`).join('')}
        </tbody></table></div>
        <details class="autoroll"><summary>Roll everything for me</summary>
          <div class="frow" style="margin-top:10px">${skills.map(sk => `<label class="skill-in">${sk} <input class="textin mono" type="number" data-gskill="${sk}" value="${esc(saved[sk] ?? DMS.bonus)}" aria-label="${sk} bonus"></label>`).join('')}
          <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="fgAdv"${DMS.adv ? ' checked' : ''}> Herbalism kit / right tools (advantage)</label>
          <button class="btn sm" type="button" data-act="fgroll">Roll every check and yield</button></div>
          <p class="small muted">This fills in the totals and yields above. You can still change them.</p></details></div>
      <div class="card roller"><h2 style="margin-top:0">3 · Share it out</h2>
        <div class="frow"><button class="btn primary sm" type="button" data-act="fgadd" data-to="party" id="fgParty" disabled>${svg('plus')}Add to the party satchel</button><button class="btn sm" type="button" data-act="fgadd" data-to="mine" id="fgMine" disabled>…to my satchel</button><span class="small muted" id="fgSum"></span></div>
        <p class="small muted">Guarded finds only count once you tick “Guardian dealt with”.</p></div>` : ''}`;
  } else if (DMS.tab === 'trader') {
    const T = DMS.trader;
    body = `<div class="card roller"><div class="frow">
        <label class="skill-in" for="dmTown">Settlement <select class="select" id="dmTown" data-dm="town">${Object.entries(TOWN).map(([k, v]) => `<option value="${k}"${DMS.town === k ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="skill-in" for="dmSpec">Trader <select class="select" id="dmSpec" data-dm="spec">${Object.entries(SPEC).map(([k, v]) => `<option value="${k}"${DMS.spec === k ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="skill-in" for="dmTheme">Theme <select class="select" id="dmTheme" data-dm="theme"><option value="">Surprise me</option>${(THEMES[DMS.spec] || []).map(t => `<option value="${t.id}"${DMS.theme === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
        <label class="skill-in" for="dmRegion">Nearby land <select class="select" id="dmRegion" data-dm="region"><option value="">Anywhere</option>${[...D.envs.values()].map(e => `<option value="${e.id}"${DMS.region === e.id ? ' selected' : ''}>${esc(e.name)}</option>`).join('')}</select></label>
        <button class="btn primary sm" type="button" data-act="dmtrader">Roll stock</button></div>
        <p class="small muted">Each trader has a theme that shapes most of the stock, with some everyday goods and an odd lot or two picked up from travellers. Set a nearby land to favour goods from that region. Bigger settlements carry rarer goods: villages top out at common, towns and cities at uncommon, and a metropolis may hold a few rare pieces. Traders buy parts at 50% of their value, or full value if it's their specialty.</p></div>
      ${T ? `<section class="section trader"><div class="section-head"><h2>${esc(T.nm)}</h2><span class="count">${esc(T.T.label)} · ${esc(T.S.label)}</span></div>
        <div class="card trader-card"><div class="eyebrow">${esc(T.th.name)}${T.region ? ` · goods from ${esc(envName(T.region))}` : ''}</div><p class="trader-blurb">${esc(T.th.blurb)}</p>
          <p class="small muted" style="margin:0">Pays full value for: ${T.buys.map(esc).join(', ')} goods. Everything else at half.</p></div>
        <div class="tbl-wrap"><table><thead><tr><th>Goods</th><th>In stock</th><th>Price each</th><th></th></tr></thead><tbody>${[['core', 'The speciality'], ['day', 'Everyday stock'], ['odd', 'Odd lots']].map(([sec, label]) => { const rows = T.stock.filter(x => x.sec === sec); return rows.length ? `<tr class="tsec"><th colspan="4">${label}</th></tr>` + rows.map(s => `<tr><td><a href="${linkOf(s.x)}"><b>${esc(s.x.name)}</b></a> ${pill(s.x.tier)}${s.rare ? ' <span class="small muted">rare find</span>' : ''}${s.note ? `<div class="note">${esc(cap(s.note))}</div>` : ''}</td><td class="mono">${s.q}</td><td class="mono">${fmtGp(s.price >= 10 ? Math.round(s.price) : s.price >= 1 ? Math.round(s.price * 10) / 10 : Math.round(s.price * 100) / 100)}</td><td><button class="btn sm" type="button" data-act="add" data-id="${s.x.id}" aria-label="Buy ${esc(s.x.name)}">Buy</button></td></tr>`).join('') : ''; }).join('')}</tbody></table></div></section>` : ''}`;
  } else if (DMS.tab === 'handouts') {
    body = `<div class="card roller"><p class="small">Bundle several things into one handout, for example the formula for a Cloak of Elvenkind plus a map of the grove where the vines grow. Players enter the code in their <b>Journal</b>.</p>
      <div class="addbox"><div class="search-wrap" style="max-width:none"><svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="hoAdd" type="search" placeholder="Add an item, creature, place or material…" autocomplete="off" aria-label="Add to handout"><div id="hoSug" class="suggest" hidden></div></div></div>
      ${DMS.bundle.length ? `<div class="sat-list" style="margin-top:10px">${DMS.bundle.map(([ty, id], i) => { const o = ty === 'C' ? D.monsters.get(id) : ty === 'P' ? D.envs.get(id) : D.things.get(id); const opts = o.kind === 'monster' ? ['C'] : o.kind === 'place' ? ['P'] : o.recipe && needsFormula(o) ? ['F', o.kind === 'item' ? 'I' : 'M'] : [o.kind === 'item' ? 'I' : 'M']; return `<div class="sat-row">${ico(o)}<div class="txt"><span class="name">${esc(o.name)}</span></div><select class="select" data-hoty="${i}" aria-label="What this unlocks">${opts.map(x => `<option value="${x}"${x === ty ? ' selected' : ''}>${{ F: 'Formula + parts + sources', I: 'Just the item', M: 'Material + sources', C: 'Creature + parts', P: 'Place + finds' }[x]}</option>`).join('')}</select><button class="btn sm" type="button" data-act="hodel" data-i="${i}" aria-label="Remove">✕</button></div>`; }).join('')}</div>${shareHTML(DMS.bundle)}` : '<p class="small muted" style="margin-top:8px">Nothing added yet.</p>'}</div>`;
    const sheet = cardSheet();
    body += `<div class="card roller"><div class="section-head"><h2>Handout cards</h2><span class="count">${plural(sheet.length, 'card')}</span></div>
      <p class="small muted">Press <b>Make a card</b> on any handout. Every entry becomes its own collectible card: a picture and details on the front, the in-world note and its unlock code on the back.</p>
      ${sheet.length ? `<div class="sat-list">${sheet.map((c, i) => { const o = entOf(c.ty, c.id); return `<div class="sat-row">${ico(o)}<div class="txt"><span class="name">${esc(o.name)}</span><span class="small muted">${esc(CODE_TYPES[c.ty])} · <span class="mono">${esc(makeCode([[c.ty, c.id]]))}</span></span></div><button class="btn sm" type="button" data-act="printdel" data-i="${i}" aria-label="Remove card">✕</button></div>`; }).join('')}</div>
      <div class="frow" style="margin-top:10px"><a class="btn sm primary" href="#/print">${svg('scroll')}Open the cards</a></div>` : ''}</div>`;
  } else if (DMS.tab === 'session') {
    body = sessionPanel(true);
  } else if (DMS.tab === 'settings') {
    const P = CFG.player, cfgText = JSON.stringify({ dmPin: DMS.newPin ? pinHash(DMS.newPin) : (CFG.dmPin || store.get('scavengers-codex.localPin', null) || null), siteUrl: (DMS.siteUrl ?? CFG.siteUrl) || null, startInPlayerView: DMS.startPlayer ?? CFG.startInPlayerView, spoilage: DMS.spoilage ?? CFG.spoilage !== false, player: DMS.player || P }, null, 2);
    const sel2 = (k, opts) => `<select class="select" data-pl="${k}">${opts.map(([v, l]) => `<option value="${v}"${(DMS.player || P)[k] === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    body = `<div class="card roller"><h2>What players know by default</h2>
        <p class="small muted">Everything else stays hidden in player view until it's discovered through a handout code, research, or by owning it.</p>
        <div class="frow"><label class="skill-in">Places ${sel2('places', [['all', 'All places'], ['none', 'Only discovered']])}</label>
          <label class="skill-in">Creatures ${sel2('creatures', [['beasts', 'Beasts & ordinary people'], ['all', 'All creatures'], ['none', 'Only discovered']])}</label>
          <label class="skill-in">Materials ${sel2('materials', [['common', 'Mundane & common'], ['mundane', 'Mundane only'], ['all', 'All materials'], ['none', 'Only discovered']])}</label>
          <label class="skill-in">Items ${sel2('items', [['mundane', 'Mundane gear only'], ['common', 'Mundane & common'], ['all', 'All items (not formulas)']])}</label>
          <label class="skill-in">Creature danger ${sel2('threat', [['vague', 'A vague word (“Deadly”)'], ['cr', 'Exact CR'], ['none', 'Nothing']])}</label></div>
        <p class="small muted">Players never see DCs or stat-block links, and see magic values only as a rough band (“a small fortune”).</p>
        <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-pl="startPlayer"${(DMS.startPlayer ?? CFG.startInPlayerView) ? ' checked' : ''}> New visitors start in player view</label>
        <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-pl="spoilage"${(DMS.spoilage ?? CFG.spoilage !== false) ? ' checked' : ''}> Parts can spoil (a party can still switch it off on its clock)</label></div>
      <div class="card roller"><h2>Your site’s address</h2>
        <p class="small muted">Used for clickable links and QR codes on handouts, so players never type a code. On GitHub Pages this is filled in for you; set it when you run the codex from a file or this preview.</p>
        <div class="frow"><input class="textin" id="siteUrl" data-dm="siteUrl" placeholder="https://you.github.io/codex/" value="${esc(DMS.siteUrl ?? CFG.siteUrl ?? '')}"><button class="btn sm" type="button" data-act="siteurl">Use on this device</button></div>
        <p class="small muted">${siteBase() ? `Links point to <span class="mono">${esc(siteBase())}</span>.` : 'No address yet, so handouts show codes only.'}</p></div>
      <div class="card roller"><h2>DM PIN</h2>
        <p class="small">${CFG.dmPin ? 'A site-wide PIN is set in <span class="mono">config.json</span>.' : store.get('scavengers-codex.localPin', null) ? 'A PIN is set on this device only.' : 'No PIN is set, so anyone can switch to DM view.'} A PIN keeps curious players out of DM view. It isn't real security: a determined player could read the site's files.</p>
        <div class="frow"><label class="skill-in" for="newPin">New PIN <input class="textin mono" id="newPin" type="password" inputmode="numeric" autocomplete="new-password" value="${esc(DMS.newPin || '')}" style="width:120px"></label>
          <button class="btn sm" type="button" data-act="pinlocal">Use on this device only</button>${store.get('scavengers-codex.localPin', null) ? '<button class="btn sm" type="button" data-act="pinclear">Remove device PIN</button>' : ''}<button class="btn sm" type="button" data-act="lockdm">Lock now (switch to player view)</button></div></div>
      <div class="card roller"><h2>Make it apply to every player: config.json</h2>
        <p class="small">Save this as <span class="mono">config.json</span> next to <span class="mono">index.html</span> in your GitHub repository (Add file → Create new file). Every device that opens your site then uses these settings and PIN.</p>
        <textarea class="io" id="cfgOut" readonly aria-label="config.json">${esc(cfgText)}</textarea>
        <div class="frow"><button class="btn sm primary" type="button" data-act="copytext" data-text="${esc(cfgText)}">Copy config.json</button></div></div>
      ${backupPanel()}`;
  } else {
    const rows = fightRows(), skills = [...new Set(rows.map(r => r.h.skill))], saved = store.get(SKILL_KEY, {});
    body = `<div class="card roller"><h2 style="margin-top:0">1 · The fallen</h2>
        <div class="addbox"><div class="search-wrap" style="max-width:none"><svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="dropAdd" type="search" placeholder="Add a slain creature…" autocomplete="off" aria-label="Add a slain creature"><div id="dropSug" class="suggest" hidden></div></div></div>
        ${DMS.drops.length ? `<div class="sat-list" style="margin-top:10px">${DMS.drops.map(({ id, n }) => { const m = D.monsters.get(id); return `<div class="sat-row">${ico(m)}<div class="txt"><a class="name" href="#/monster/${id}">${esc(m.name)}</a><span class="small muted">CR ${esc(m.cr)} · ${plural((m.harvest || []).length, 'part')}</span></div><div class="stepper"><button type="button" data-act="dropdec" data-id="${id}" aria-label="One fewer">−</button><input type="number" min="0" value="${n}" readonly aria-label="How many"><button type="button" data-act="dropinc" data-id="${id}" aria-label="One more">+</button></div></div>`; }).join('')}</div>` : '<p class="small muted" style="margin-top:8px">Add each creature the party defeated, for example 4 wolves and a dire wolf.</p>'}</div>
      ${rows.length ? `<div class="card roller"><h2 style="margin-top:0">2 · Harvest</h2>
        <p class="small muted">Each player calls out their total and you type it in, or roll it all at once. One check covers every body of the same kind; the yield counts them all. Results follow the <a href="#/rules/harvest">harvest rules</a>.</p>
        <div class="tbl-wrap"><table class="hman fight"><thead><tr><th>Part</th><th>Check</th><th>Total rolled</th><th>Yield if successful</th><th>Result</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td><a href="${linkOf(r.t)}"><b>${esc(r.t.name)}</b></a><div class="note">${esc(r.m.name)}${r.n > 1 ? ` ×${r.n}` : ''} · keeps ${esc(r.t.perish || 'stable')}</div></td>
          <td class="nowrap">${esc(r.h.skill)} <span class="mono">DC ${esc(r.h.dc)}</span></td>
          <td><input class="textin mono" type="number" inputmode="numeric" data-fk="t" data-i="${i}" value="${esc(DMS.fight[r.key + '|t'] ?? '')}" placeholder="—" aria-label="Total for ${esc(r.t.name)}" style="width:76px"></td>
          <td>${r.dice ? `<div class="yield-in"><input class="textin mono" type="number" min="0" data-fk="y" data-i="${i}" value="${esc(DMS.fight[r.key + '|y'] ?? '')}" placeholder="${esc(r.dice)}" aria-label="Yield for ${esc(r.t.name)}"><button class="btn sm die" type="button" data-act="fightyield" data-i="${i}">${svg('dice')}Roll <span class="mono">${esc(r.dice)}</span></button></div>` : `<div class="yield-in"><input class="textin mono" type="number" min="0" data-fk="y" data-i="${i}" value="${esc(DMS.fight[r.key + '|y'] ?? r.fixed)}" aria-label="Yield for ${esc(r.t.name)}"><span class="note">${r.n > 1 ? `${r.h.q || 1} each × ${r.n}` : 'always'}${r.n > 1 ? '. Lower it if some bodies failed' : ''}</span></div>`}</td>
          <td id="fres-${i}" class="hres"><span class="muted small">Waiting for a roll</span></td></tr>`).join('')}
        </tbody></table></div>
        <details class="autoroll"><summary>Roll everything for me</summary>
          <div class="frow" style="margin-top:10px">${skills.map(sk => `<label class="skill-in">${sk} <input class="textin mono" type="number" data-fskill="${sk}" value="${esc(saved[sk] ?? 0)}" aria-label="${sk} bonus"></label>`).join('')}<button class="btn sm" type="button" data-act="fightroll">Roll every check and yield</button></div></details>
        <div id="fightHaz"></div></div>
      <div class="card roller"><h2 style="margin-top:0">3 · Share it out</h2>
        <div class="frow"><button class="btn primary sm" type="button" data-act="fightadd" data-to="party" id="fightParty" disabled>${svg('plus')}Add to the party satchel</button><button class="btn sm" type="button" data-act="fightadd" data-to="mine" id="fightMine" disabled>…to my satchel</button><span class="small muted" id="fightSum"></span></div>
        <div class="frow" style="margin-top:8px"><button class="btn sm" type="button" data-act="fightcards">${svg('scroll')}Make creature cards</button><button class="btn sm" type="button" data-act="fightbundle">Share these creatures as one handout</button><button class="btn sm" type="button" data-act="fightclear">Clear the fight</button></div></div>` : ''}`;
  }
  if (DMS.tab === 'homebrew' && window.CodexHomebrew) body = hbTab();
  return `<div class="page"><div class="section-head"><h1>DM tools</h1></div>
    <p class="lede">Quick tools for the table: what a foraging trip turns up, what a passing trader sells, harvesting a whole fight at once, and a recap of the session.</p>
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab${DMS.tab === k ? ' on' : ''}" type="button" role="tab" aria-selected="${DMS.tab === k}" data-act="dmtab" data-tab="${k}">${l}</button>`).join('')}</div>
    ${body}</div>`;
}
document.addEventListener('input', ev => { const el = ev.target; if (!el.dataset || !el.dataset.gk) return; DMS.fg[el.dataset.i + '|' + el.dataset.gk] = el.type === 'checkbox' ? el.checked : el.value; evalForage(); });
document.addEventListener('change', ev => { const el = ev.target; if (el.dataset && el.dataset.gk === 'ok') { DMS.fg[el.dataset.i + '|ok'] = el.checked; evalForage(); } });
document.addEventListener('input', ev => { const el = ev.target; if (!el.dataset || !el.dataset.fk) return; const r = fightRows()[+el.dataset.i]; if (!r) return; DMS.fight[r.key + '|' + el.dataset.fk] = el.value; evalFight(); });
function wireDM() {
  if (DMS.tab === 'drops') setTimeout(evalFight, 0);
  if (DMS.tab === 'forage') setTimeout(evalForage, 0);
  const hf = $('#hbFile');
  if (hf) hf.addEventListener('change', () => { const file = hf.files[0]; if (!file) return; HB.fileName = file.name; const rd = new FileReader(); rd.onload = () => { hbCheck(String(rd.result)); rerender(); }; rd.readAsText(file); });
  const ho = $('#hoAdd');
  if (ho) wireTypeahead(ho, $('#hoSug'), e => { if (!e) { const r = doSearch(ho.value, 1); e = r[0]; } if (!e) return; const [entry] = defaultShare(e.o); if (!DMS.bundle.some(x => x[1] === entry[1] && x[0] === entry[0])) DMS.bundle.push(entry); rerender(); setTimeout(() => { const i = $('#hoAdd'); if (i) i.focus(); }, 0); });
  const inp = $('#dropAdd'); if (!inp) return;
  wireTypeahead(inp, $('#dropSug'), e => { if (!e) { const r = doSearch(inp.value, 1, ['monster']); e = r[0]; } if (!e) return; const d = DMS.drops.find(x => x.id === e.o.id); if (d) d.n++; else DMS.drops.push({ id: e.o.id, n: 1 }); rerender(); setTimeout(() => { const i = $('#dropAdd'); if (i) i.focus(); }, 0); }, ['monster']);
}

/* ================================================================ pages */
function pHome() {
  if (!isDM()) return pHomePlayer();
  const nMat = D.materials.length, nItem = D.items.length, nMon = D.monsters.size;
  const nMagic = D.items.filter(i => i.tier !== 'mundane').length;
  const feat = ['cloak-of-elvenkind', 'stonefather-maul', 'dragon-scale-mail-red', 'potion-of-hill-giant-strength', 'flame-tongue', 'bag-of-holding', 'ring-of-regeneration', 'potion-of-healing'].map(id => D.things.get(id)).filter(Boolean);
  const envs = [...D.envs.values()];
  return `<div class="page">
    <section class="hero">
      <div><div class="eyebrow">A harvesting &amp; crafting handbook for D&amp;D 5e</div>
        <h1>Skin it. Harvest it. Forge it into legend.</h1>
        <p>Every creature in the SRD has parts worth taking, and every place has something worth gathering. Look up any item to see exactly what it's made of, or fill your satchel and see what you can make.</p></div>
      <div class="stats">
        <div class="stat"><div class="n">${nMon}</div><div class="l">creatures to harvest</div></div>
        <div class="stat"><div class="n">${nMat.toLocaleString()}</div><div class="l">materials</div></div>
        <div class="stat"><div class="n">${nMagic}</div><div class="l">magic item recipes</div></div>
        <div class="stat"><div class="n">${D.envs.size}</div><div class="l">places to forage</div></div>
      </div>
    </section>
    <section class="section"><div class="section-head"><h2>How crafting works</h2><a class="small" href="#/rules">Full rules →</a></div>
      <div class="steps">
        <div class="step"><span class="no">1 · HUNT</span><h3>Find the source</h3><p>Pick a creature or place. Its page lists every part it yields.</p></div>
        <div class="step"><span class="no">2 · HARVEST</span><h3>Take the parts</h3><p>Survival for hides, Medicine for organs, Arcana for essences. Mind the spoilage clock.</p></div>
        <div class="step"><span class="no">3 · REFINE</span><h3>Process them</h3><p>Tan pelts, smelt ore, distil inks. Some parts need a workshop first.</p></div>
        <div class="step"><span class="no">4 · CRAFT</span><h3>Bind the magic</h3><p>A base, a keystone of the right rarity, supporting parts and a binding, then one tool check.</p></div>
      </div></section>
    <section class="section"><div class="section-head"><h2>Signature recipes</h2></div>
      <div class="feature">${feat.map(t => `<a class="fcard" href="${linkOf(t)}"><div style="display:flex;gap:10px;align-items:center">${ico(t)}<b>${esc(t.name)}</b></div><div>${pill(t.tier)}</div><div class="fx">${esc(t.recipe.components.filter(c => c.role !== 'binding').slice(0, 4).map(slotLabel).join(' · '))}</div></a>`).join('')}</div></section>
    <section class="section"><div class="section-head"><h2>Where to forage</h2><a class="small" href="#/places">All places →</a></div>
      <div class="envgrid">${envs.map(envCard).join('')}</div></section>
    <section class="section"><div class="section-head"><h2>At the table</h2></div>
      <div class="feature">
        <a class="fcard" href="#/dm"><b>DM tools</b><span class="fx">Roll a foraging expedition, stock a wandering trader, or harvest a whole encounter at once.</span></a>
        <a class="fcard" href="#/satchel"><b>Party satchel</b><span class="fx">A shared inventory for the whole group, plus the formulas your party has learned.</span></a>
        <a class="fcard" href="#/rules/formulas"><b>Player view</b><span class="fx">Use the DM/Player switch at the top. Players only see the recipes they've learned.</span></a>
        <a class="fcard" href="#/rules/quirks"><b>Quirks &amp; masterworks</b><span class="fx">Roll the final crafting check on any recipe. Great results earn a masterwork boon.</span></a>
      </div></section>
    <p class="small muted">New here? Read the <a href="#/rules">rules</a>, or open the <a href="#/satchel">satchel</a> and add what your party already carries.</p>
  </div>`;
}
function pHomePlayer() {
  const keys = [...Party.known];
  const ids = p => new Set(keys.filter(k => kpre(k) === p || kpre(k) === 'h' + p).map(kid));
  const nMon = D.monsterList.filter(seeMon).length, nPlace = [...D.envs.values()].filter(seePlace).length;
  const nThing = new Set([...keys.filter(k => kpre(k) === 't').map(kid), ...Object.keys(sat), ...Object.keys(Party.items)]).size;
  const learned = [...Party.learned].map(id => D.things.get(id)).filter(Boolean).sort((a, b) => ti(b.tier) - ti(a.tier) || byName(a, b));
  const envs = [...D.envs.values()].filter(seePlace);
  const fresh = !learned.length && !ids('m').size && !nThing;
  return `<div class="page">
    <section class="hero">
      <div><div class="eyebrow">Party “${esc(Party.code)}” · your journal</div>
        <h1>${fresh ? 'A blank page, and a whole world to skin.' : 'What your party has learned so far'}</h1>
        <p>This codex only knows what your party knows. Hunt, forage and read everything you find. When your DM hands you a note, a map or an old recipe with a code on it, enter it here.</p>
        <form class="codebox" id="homeCode"><div class="frow"><input class="textin mono" id="homeCodeIn" autocomplete="off" spellcheck="false" placeholder="SC-XXXX-XXXX-…" aria-label="Enter a code from your DM" style="height:44px;font-size:1.05rem;letter-spacing:.06em;flex:1;min-width:0"><button class="btn primary" type="submit">Unlock</button></div><p class="small" id="homeCodeErr" style="color:var(--danger)" hidden>That code didn't work. Check every character.</p></form></div>
      <div class="stats">
        <div class="stat"><div class="n">${learned.length}</div><div class="l">formulas learned</div></div>
        <div class="stat"><div class="n">${nMon}</div><div class="l">creatures known</div></div>
        <div class="stat"><div class="n">${nThing}</div><div class="l">finds recorded</div></div>
        <div class="stat"><div class="n">${nPlace}</div><div class="l">places known</div></div>
      </div>
    </section>
    ${learned.length ? `<section class="section"><div class="section-head"><h2>Your formulas</h2><a class="small" href="#/journal">Journal →</a></div>
      <div class="feature">${learned.slice(0, 8).map(t => `<a class="fcard" href="${linkOf(t)}"><div style="display:flex;gap:10px;align-items:center">${ico(t)}<b>${esc(t.name)}</b></div><div>${pill(t.tier)}</div><div class="fx">${esc(t.recipe.components.filter(c => c.role !== 'binding').slice(0, 4).map(slotLabel).join(' · '))}</div></a>`).join('')}</div></section>` : ''}
    ${Party.log.length ? `<section class="section"><div class="section-head"><h2>Recently</h2></div><ul class="plog">${Party.log.slice(0, 5).map(e => `<li><span class="mono muted">${new Date(e.at).toLocaleString([], { month: 'short', day: 'numeric' })}</span> ${esc(e.text)}</li>`).join('')}</ul></section>` : ''}
    <section class="section"><div class="section-head"><h2>How crafting works</h2><a class="small" href="#/rules">Full rules →</a></div>
      <div class="steps">
        <div class="step"><span class="no">1 · HUNT</span><h3>Find the source</h3><p>Creatures and places you know list the parts you've heard they yield.</p></div>
        <div class="step"><span class="no">2 · HARVEST</span><h3>Take the parts</h3><p>Survival for hides, Medicine for organs, Arcana for essences. Mind the spoilage clock.</p></div>
        <div class="step"><span class="no">3 · LEARN</span><h3>Find the formula</h3><p>Magic items need a formula: from a handout, a teacher, or weeks spent studying a keystone.</p></div>
        <div class="step"><span class="no">4 · CRAFT</span><h3>Bind the magic</h3><p>Gather every component, then make one tool check. Your DM sets the difficulty.</p></div>
      </div></section>
    ${envs.length ? `<section class="section"><div class="section-head"><h2>Where to forage</h2><a class="small" href="#/places">All places →</a></div><div class="envgrid">${envs.map(envCard).join('')}</div></section>` : ''}
    <p class="small muted">Carrying something already? Add it to the <a href="#/satchel">satchel</a> and it goes straight into your journal.</p>
  </div>`;
}
function wireHome() {
  const f = $('#homeCode'); if (!f) return;
  f.addEventListener('submit', ev => { ev.preventDefault(); const v = $('#homeCodeIn').value.trim(); if (!readCode(v)) { $('#homeCodeErr').hidden = false; return; } location.hash = '#/journal/' + encodeURIComponent(v); });
}
// players see a word (what foragers say); the DM also sees the reason
const RISK_TALK = ['Safe work', 'Mostly safe', 'Risky', 'Dangerous'];
function riskCell(g, e) { const r = riskOf(g, e); return `<span class="risk-pill r${r}" title="${esc(isDM() ? (g.riskWhy || '') : 'What foragers say about gathering it here')}">${RISK_TALK[r]}</span>${isDM() && g.riskWhy ? `<div class="note">${esc(g.riskWhy)}</div>` : ''}`; }
function guardHtml(g) {
  if (!g.guard) return '';
  const m = D.monsters.get(g.guard.m); if (!m) return '';
  if (!seeMon(m)) return `<div class="guard">${svg('shield')}<span><b>Guarded</b> by something you haven't encountered. Tread carefully.</span></div>`;
  return `<div class="guard">${svg('shield')}<span><b>Guarded by <a href="#/monster/${m.id}">${esc(m.name)}</a></b>${crLabel(m) ? ` <span class="${showCR() ? 'mono' : 'small muted'}">${esc(crLabel(m))}</span>` : ''}${g.guard.note ? ` — ${esc(g.guard.note)}` : ''}</span></div>`;
}
function envKnownLine(e) {
  const g = (e.gather || []).filter(x => { const t = D.things.get(x.m); return t && (placeLevel(e) >= 2 ? seeThing(t) : partKnown(t)); }).length;
  const c = (D.envMon.get(e.id) || []).filter(seeMon).length;
  return g || c ? `${g ? plural(g, 'known find') : ''}${g && c ? ' · ' : ''}${c ? plural(c, 'known creature') : ''}` : 'Unexplored';
}
function envCard(e) {
  return `<a class="envcard" href="#/place/${e.id}"><span class="band" style="background:${ENV_COLOR[e.id] || 'var(--accent)'}"></span><span class="en">${esc(e.name)}</span><span class="ec">${isDM() ? `${plural((e.gather || []).length, 'gatherable')} · ${plural((D.envMon.get(e.id) || []).length, 'creature')}` : envKnownLine(e)}</span></a>`;
}

/* ---- browse pages with filters ---- */
const F = { items: { q: '', cat: '', tier: '', src: '', att: '', lvl: '' }, materials: { q: '', tier: '', tag: '', aura: '', from: '' }, monsters: { q: '', type: '', env: '', size: '', cr: '', sort: 'name' } };
function sel(id, key, page, opts, all) {
  return `<select class="select" id="${id}" data-f="${page}" data-k="${key}">${`<option value="">${all}</option>`}${opts.map(([v, l]) => `<option value="${v}"${F[page][key] === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}
function filterBox(page, main, optRows) {
  return `<div class="filters" id="filters-${page}"><div class="frow"><input class="textin" type="search" id="fq-${page}" data-f="${page}" data-k="q" value="${esc(F[page].q)}" placeholder="Filter by name…" autocomplete="off">${main}<button class="btn sm filter-toggle" type="button" data-act="ftoggle" data-page="${page}">More filters</button></div>${optRows.map(r => `<div class="frow opt">${r}</div>`).join('')}</div>`;
}
function textFilter(arr, q) {
  q = q.trim().toLowerCase(); if (!q) return arr;
  const toks = q.split(/\s+/);
  return arr.filter(o => { const n = o.name.toLowerCase(); return toks.every(t => n.includes(t) || (o.tags || []).includes(t)); });
}
function hiddenNote(n, what) { return !isDM() && n > 0 ? `<p class="small muted undisc">Rumour has it there are more ${what} out there than your journal holds. Find them in play, or look for notes, maps and old tomes. <a href="#/journal">Enter a code →</a></p>` : ''; }
function pItems() {
  const f = F.items;
  let arr = D.items.filter(i => (!f.cat || i.cat === f.cat) && (!f.tier || i.tier === f.tier) && (!f.src || (f.src === 'magic' ? i.tier !== 'mundane' : i.src === f.src)) && (!f.att || (f.att === 'yes' ? !!i.attune : !i.attune)) && (!f.lvl || !isDM() || (i.recipe && access(i.id) <= +f.lvl)));
  arr = textFilter(arr, f.q);
  const hidN = isDM() ? 0 : arr.filter(x => !seeThing(x)).length; arr = isDM() ? arr : arr.filter(seeThing);
  const cats = [...new Set(D.items.map(i => i.cat))].sort().map(c => [c, CAT_LABEL[c] || c]);
  return `<div class="page"><div class="section-head"><h1>Items</h1><span class="count">${arr.length}${isDM() ? ` of ${D.items.length}` : ' discovered'}</span></div>
    ${filterBox('items', sel('f-tier', 'tier', 'items', TIERS.map(t => [t, TIER_LABEL[t]]), 'Any rarity'), [
      `<label for="f-cat">Type</label>${sel('f-cat', 'cat', 'items', cats, 'Any type')}`,
      `<label for="f-src">Source</label>${sel('f-src', 'src', 'items', [['magic', 'All magic items'], ['SRD 5.1', 'SRD magic items'], ['Homebrew', 'Homebrew'], ['PHB/SRD basic', 'Basic equipment']], 'Everything')}`,
      `<label for="f-att">Attunement</label>${sel('f-att', 'att', 'items', [['yes', 'Requires attunement'], ['no', 'No attunement']], 'Either')}`,
      ...(isDM() ? [`<label for="f-lvl">Party level</label>${sel('f-lvl', 'lvl', 'items', Array.from({ length: 20 }, (_, i) => [String(i + 1), `Craftable by level ${i + 1}`]), 'Any level')}`] : [])])}
    ${listBlock(arr, 'items', 'No items match these filters.')}${hiddenNote(hidN, 'items')}</div>`;
}
function matFrom(t) { return D.src.has(t.id) ? 'monster' : D.gat.has(t.id) ? 'place' : t.recipe ? 'refined' : 'trade'; }
function pMaterials() {
  const f = F.materials;
  let arr = D.materials.filter(t => (!f.tier || t.tier === f.tier) && (!f.tag || t.tags.includes(f.tag)) && (!f.aura || t.tags.includes(f.aura)) && (!f.from || matFrom(t) === f.from));
  arr = textFilter(arr, f.q);
  const hidN = isDM() ? 0 : arr.filter(x => !seeThing(x)).length; arr = isDM() ? arr : arr.filter(seeThing);
  return `<div class="page"><div class="section-head"><h1>Materials</h1><span class="count">${arr.length}${isDM() ? ` of ${D.materials.length}` : ' discovered'}</span></div>
    ${filterBox('materials', sel('fm-tier', 'tier', 'materials', TIERS.map(t => [t, TIER_LABEL[t]]), 'Any tier'), [
      `<label for="fm-tag">Form</label>${sel('fm-tag', 'tag', 'materials', FORM_TAGS.map(t => [t, cap(t)]), 'Any form')}`,
      `<label for="fm-aura">Trait</label>${sel('fm-aura', 'aura', 'materials', [...AURA_TAGS, ...TRAIT_TAGS].map(t => [t, cap(t)]), 'Any aura or trait')}`,
      `<label for="fm-from">Found</label>${sel('fm-from', 'from', 'materials', [['monster', 'Harvested from creatures'], ['place', 'Gathered in places'], ['refined', 'Refined / crafted'], ['trade', 'Bought as trade goods']], 'Anywhere')}`])}
    ${listBlock(arr, 'materials', 'No materials match these filters.')}${hiddenNote(hidN, 'materials')}</div>`;
}
const CR_BANDS = [['0-2', 'CR 0–2 (common parts)', 0, 2], ['3-6', 'CR 3–6 (uncommon)', 3, 6], ['7-12', 'CR 7–12 (rare)', 7, 12], ['13-18', 'CR 13–18 (very rare)', 13, 18], ['19-30', 'CR 19+ (legendary)', 19, 30]];
function pMonsters() {
  const f = F.monsters;
  const band = showCR() ? CR_BANDS.find(b => b[0] === f.cr) : null;
  let arr = D.monsterList.filter(m => (!f.type || m.type === f.type) && (!f.env || (m.env || []).includes(f.env)) && (!f.size || m.size === f.size) && (!band || (crNum(m.cr) >= band[2] && crNum(m.cr) <= band[3])));
  arr = textFilter(arr, f.q);
  const hidN = isDM() ? 0 : arr.filter(x => !seeMon(x)).length; arr = isDM() ? arr : arr.filter(seeMon);
  if (f.sort === 'cr' && showCR()) arr = [...arr].sort((a, b) => crNum(a.cr) - crNum(b.cr) || byName(a, b));
  return `<div class="page"><div class="section-head"><h1>Creatures</h1><span class="count">${arr.length}${isDM() ? ` of ${D.monsters.size}` : ' discovered'}</span></div>
    ${filterBox('monsters', sel('fc-type', 'type', 'monsters', TYPES.map(t => [t, cap(t)]), 'Any type'), [
      ...(showCR() ? [`<label for="fc-cr">Challenge</label>${sel('fc-cr', 'cr', 'monsters', CR_BANDS.map(b => [b[0], b[1]]), 'Any CR')}`] : []),
      `<label for="fc-env">Habitat</label>${sel('fc-env', 'env', 'monsters', [...D.envs.values()].map(e => [e.id, e.name]), 'Anywhere')}`,
      `<label for="fc-size">Size</label>${sel('fc-size', 'size', 'monsters', SIZES.map(s => [s, s]), 'Any size')}`,
      ...(showCR() ? [`<label for="fc-sort">Sort</label><select class="select" id="fc-sort" data-f="monsters" data-k="sort"><option value="name"${f.sort === 'name' ? ' selected' : ''}>By name</option><option value="cr"${f.sort === 'cr' ? ' selected' : ''}>By challenge rating</option></select>`] : [])])}
    ${listBlock(arr, 'monsters', 'No creatures match these filters.')}${hiddenNote(hidN, 'creatures')}</div>`;
}
function pPlaces() {
  return `<div class="page"><div class="section-head"><h1>Places</h1><span class="count">${isDM() ? D.envs.size : [...D.envs.values()].filter(seePlace).length}</span></div>
    <p class="lede">Each place lists what a forager can gather there, and which creatures hunt its paths.</p>
    <div class="envgrid">${[...D.envs.values()].filter(seePlace).map(envCard).join('')}</div>${hiddenNote([...D.envs.values()].filter(e => !seePlace(e)).length, 'places')}</div>`;
}

/* ---- detail: thing ---- */
/* ---- plates & images ---- */
const IMG_DIR = { monster: 'creatures', place: 'places', item: 'items', material: 'materials' };
window.codexImgFail = img => {
  const next = (img.dataset.try || '').split(',').filter(Boolean);
  if (!next.length) { img.remove(); return; }
  const ext = next.shift(); img.dataset.try = next.join(','); img.src = img.src.replace(/\.[a-z0-9]+$/i, '.' + ext);
};
function figure(o) {
  const plate = window.CodexPlates ? window.CodexPlates.plate(o, { caption: true }) : '';
  const explicit = !!o.img;
  const useImg = explicit || !window.CODEX_ARTIFACT;
  const src = o.img || `images/${IMG_DIR[o.kind] || 'items'}/${o.id}.webp`;
  const img = useImg ? `<img class="plate-img" alt="${esc(o.name)}" loading="lazy" decoding="async" src="${esc(src)}" data-try="${explicit ? '' : 'jpg,png'}" onerror="codexImgFail(this)" onload="this.parentNode.classList.add('has-img')">` : '';
  return `<figure class="plate">${plate}${img}${o.imgCredit ? `<figcaption>${esc(o.imgCredit)}</figcaption>` : ''}</figure>`;
}
function undiscovered(o, what) {
  const fog = window.CodexPlates ? window.CodexPlates.plate({ ...o, id: 'fog-' + o.kind, name: '', tags: o.kind === 'item' ? o.tags : [], tier: 'common' }) : '';
  return `<div class="page"><div class="undisc-card card"><figure class="plate fog">${fog}</figure><div class="meta"><div class="eyebrow">Not yet in your journal</div><h1>An undiscovered ${what}</h1>
    <p class="lede">Your party hasn't learned about this yet. Meet it in play, find a note or map about it, or study something that leads here.</p>
    <div class="frow"><a class="btn primary" href="#/journal">${svg('book')}Enter a code from your DM</a><a class="btn" href="javascript:history.back()">Go back</a></div></div></div></div>`;
}
function shareBtn(o) { return isDM() ? `<button class="btn sm" type="button" data-act="share" data-k="${o.kind}" data-id="${o.id}">${svg('scroll')}Share with players</button>` : ''; }
function shareHTML(entries) {
  const code = makeCode(entries), text = handoutText(entries);
  const what = entries.map(([ty, id]) => { const o = ty === 'C' ? D.monsters.get(id) : ty === 'P' ? D.envs.get(id) : D.things.get(id); return `<li><b>${esc(CODE_TYPES[ty])}:</b> ${esc(o ? o.name : id)}${ty === 'F' ? ' — the recipe, its components, and where to find them' : ty === 'C' ? ' — the creature and its harvestable parts' : ty === 'P' ? ' — the place, what grows there and what guards it' : ty === 'M' ? ' — the material and where it comes from' : ''}</li>`; }).join('');
  const link = codeLink(code);
  return `<div class="handout"><div class="handout-paper"><div class="handout-main"><div class="eyebrow">Handout for your players</div><p class="handout-text" contenteditable="true" spellcheck="true" title="Click to reword the note">${esc(text)}</p><div class="code mono">${esc(code)}</div>${link ? `<a class="small handout-link" href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a>` : ''}</div>${link ? `<div class="handout-qr">${qrSVG(link)}<span class="small muted">Scan to unlock</span></div>` : ''}</div>
    ${link ? '' : `<p class="small muted">${window.CODEX_ARTIFACT || location.protocol === 'file:' ? 'Links and QR codes need your site’s address: set it under DM tools → Player setup (or <span class="mono">siteUrl</span> in config.json).' : ''}</p>`}
    <p class="small">Players open <b>Journal</b> and enter the code to unlock:</p><ul class="small">${what}</ul>
    <p class="small muted">Click the note to reword it before you copy it or make a card.${entries.length > 1 ? ' Cards are one per entry, each with its own code.' : ''}</p>
    <div class="frow">${link ? `<button class="btn sm primary" type="button" data-act="copytext" data-text="${esc(link)}">Copy link</button>` : ''}<button class="btn sm${link ? '' : ' primary'}" type="button" data-act="copytext" data-text="${esc(code)}">Copy code</button><button class="btn sm" type="button" data-act="copyhandout" data-code="${esc(code)}">Copy note + ${link ? 'link' : 'code'}</button><button class="btn sm" type="button" data-act="printadd" data-entries="${esc(entries.map(e => e.join(':')).join(','))}">${svg('scroll')}${entries.length > 1 ? `Make ${entries.length} cards` : 'Make a card'}</button>${location.hash.startsWith('#/dm') ? '' : `<button class="btn sm" type="button" data-act="bundle" data-entries="${esc(entries.map(e => e.join(':')).join(','))}">Bundle with more…</button>`}</div></div>`;
}
function dcCell(skill, dc) { return showDC() ? `${esc(skill)} <span class="mono">DC ${esc(dc)}</span>` : esc(skill); }
function pThing(id) {
  const t = D.things.get(id);
  if (!t) return notFound();
  if (!seeThing(t)) return undiscovered(t, t.kind === 'item' ? 'item' : 'material');
  const srcA = D.src.get(t.id) || [], gatA = D.gat.get(t.id) || [];
  const src = srcA.filter(x => seeMon(x.m)), gat = gatA.filter(x => seePlace(x.e));
  const isItem = t.kind === 'item';
  const ext = isItem && t.src === 'SRD 5.1' ? `<a class="btn sm" href="https://www.dndbeyond.com/magic-items?filter-search=${encodeURIComponent(t.name.replace(/\s*\(.*\)|,.*$/g, ''))}" target="_blank" rel="noopener">${svg('ext')}D&amp;D Beyond</a>` : '';
  const facts = isItem
    ? [['Type', CAT_LABEL[t.cat] || t.cat], ['Rarity', TIER_LABEL[t.tier]], ['Attunement', t.attune === true ? 'Required' : t.attune ? cap(String(t.attune)) : 'No'], ['Value', valueText(t)], ...(isDM() ? [['Craftable from', t.recipe && access(t.id) < 99 ? `party level ${access(t.id)}` : '—']] : []), ['Source', t.src || '—']]
    : [['Tier', TIER_LABEL[t.tier]], ['Keeps', t.perish || 'stable'], ['Value', valueText(t)], ...(isDM() || src.length || gat.length || !(srcA.length || gatA.length) ? [['Found', { monster: 'On creatures', place: 'In the wild', refined: 'Refined / crafted', trade: 'Trade good' }[matFrom(t)]]] : [['Found', 'Unknown to you']])];
  const moreS = srcA.length - src.length, moreG = gatA.length - gat.length;
  const srcHtml = srcA.length ? fold('thing.src', 'Harvested from', `
    ${src.length ? `<div class="tbl-wrap"><table><thead><tr><th>Creature</th><th>Yield</th><th>Check</th><th>Notes</th></tr></thead><tbody>${src.map(({ m, h }) => `<tr><td><div class="cell-part">${ico(m)}<span><a href="#/monster/${m.id}"><b>${esc(m.name)}</b></a><br><span class="small muted">${esc([crLabel(m), m.type].filter(Boolean).join(' · '))}</span></span></div></td><td class="mono">${esc(h.dice || h.q || 1)}</td><td class="nowrap">${dcCell(h.skill, h.dc)}</td><td class="small">${esc(h.note || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${moreS ? `<p class="small muted undisc">${src.length ? 'Hunters say other creatures yield it too.' : 'It comes from a creature your party hasn’t learned about yet.'}</p>` : ''}`, { count: isDM() ? srcA.length : src.length }) : '';
  const gatHtml = gatA.length ? fold('thing.gat', 'Gathered in', `
    ${gat.length ? `<div class="tbl-wrap"><table><thead><tr><th>Place</th><th>Yield</th><th>Check</th><th>Danger</th><th>Conditions</th></tr></thead><tbody>${gat.map(({ e, g }) => `<tr><td><a href="#/place/${e.id}"><b>${esc(e.name)}</b></a></td><td class="mono">${esc(g.dice || g.q || 1)}</td><td class="nowrap">${dcCell(g.skill, g.dc)}</td><td>${riskCell(g, e)}</td><td class="small">${esc(g.cond || '')}${guardHtml(g)}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${moreG ? `<p class="small muted undisc">${gat.length ? 'Foragers say it grows elsewhere too.' : 'It is found somewhere your party hasn’t explored yet.'}</p>` : ''}`, { count: isDM() ? gatA.length : gat.length }) : '';
  const tags = t.tags.length && isDM() ? `<div class="chips">${t.tags.map(g => tagChip(g)).join('')}</div>` : '';
  return `<div class="page">
    <div class="crumbs"><a href="#/${isItem ? 'items' : 'materials'}">${isItem ? 'Items' : 'Materials'}</a><span>/</span><span>${esc(t.name)}</span></div>
    <div class="dhero"><div class="dhead">${ico(t, true)}<div class="meta"><h1>${esc(t.name)}</h1>
      <div class="line">${pill(t.tier)}<span>${esc(isItem ? (CAT_LABEL[t.cat] || t.cat) : 'Material')}</span>${isItem && t.attune ? '<span>· requires attunement</span>' : ''}${t.src === 'Homebrew' ? '<span>· Homebrew</span>' : ''}</div>
      <div class="actions"><button class="btn sm primary" type="button" data-act="add" data-id="${t.id}">${svg('plus')}Add to satchel</button>${t.recipe && known(t) ? `<button class="btn sm${goals.includes(t.id) ? ' on-goal' : ''}" type="button" data-act="goal" data-id="${t.id}" aria-pressed="${goals.includes(t.id)}">${svg('star')}${goals.includes(t.id) ? 'Tracking as goal' : 'Track as goal'}</button>` : ''}${formulaCtl(t)}${shareBtn(t)}${sat[t.id] || Party.qty(t.id) ? `<span class="small muted" style="align-self:center">You carry ${sat[t.id] || 0}${Party.qty(t.id) ? ` · party has ${Party.qty(t.id)}` : ''}</span>` : ''}${ext}</div></div></div>
      ${figure(t)}
      <div class="dbody">${isItem ? `<p class="effect">${esc(t.effect)}</p>` : `<p class="lede">${esc(t.desc)}</p>`}</div>
      <div class="dfacts"><div class="facts">${facts.map(([k, v]) => `<div class="fact"><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>${tags}</div></div>
    <div id="sharebox"></div>
    ${t.recipe ? (known(t) ? recipeCard(t, { title: isItem ? 'How to craft it' : 'How to make it' }) + finalCheck(t) : lockedCard(t)) : ''}
    ${known(t) ? breakdown(t) : ''}
    ${srcHtml}${gatHtml}${growSection(t)}
    ${!t.recipe && !srcA.length && !gatA.length ? fold('thing.buy', 'Where to get it', `<p class="small">A trade good. ${{ mundane: 'Any village store, market or peddler sells it.', common: 'Towns and cities stock it; villages rarely do.', uncommon: 'Only city specialists (alchemists, jewellers, arcane suppliers) sell it, and not always.' }[t.tier] || 'Very hard to buy. Ask your DM where one might be found.'} The <a href="#/rules/dm">DM tools</a> wandering trader can roll up stock.</p>`) : ''}
    ${usedInList(t)}
  </div>`;
}
/* ---- detail: monster ---- */
function pMonster(id) {
  const m = D.monsters.get(id); if (!m) return notFound();
  if (!seeMon(m)) return undiscovered(m, 'creature');
  const lvl = monLevel(m), allParts = (m.harvest || []).filter(h => D.things.has(h.m));
  const parts = monParts(m).map(h => ({ h, t: D.things.get(h.m) })), hiddenParts = allParts.length - parts.length;
  const partIds = new Set(parts.map(x => x.t.id));
  const craft = new Map();
  for (const pid of partIds) for (const u of D.usedIn.get(pid) || []) {
    if (!craft.has(u.t.id)) craft.set(u.t.id, { t: u.t, parts: new Set() });
    craft.get(u.t.id).parts.add(pid);
  }
  const clistAll = [...craft.values()].sort((a, b) => ti(a.t.tier) - ti(b.t.tier) || byName(a.t, b.t));
  const clist = isDM() ? clistAll : clistAll.filter(x => known(x.t) && seeThing(x.t));
  const hiddenCraft = clistAll.length - clist.length;
  const key = 'mcraft-' + id, shown = listBlock.state[key] || 24;
  return `<div class="page">
    <div class="crumbs"><a href="#/monsters">Creatures</a><span>/</span><span>${esc(m.name)}</span></div>
    <div class="dhero"><div class="dhead">${ico(m, true)}<div class="meta"><h1>${esc(m.name)}</h1>
      ${lvl === 1 ? '<div class="eyebrow">Known only by reputation</div>' : ''}<div class="line">${crLabel(m) ? `<span class="${showCR() ? 'mono' : 'threat'}">${esc(crLabel(m))}</span><span>·</span>` : ''}<span>${esc(m.size)} ${esc(m.type)}</span>${m.salvage ? '<span>· salvage only</span>' : ''}${m.srd === '5.2' ? '<span class="pill t-rare">SRD 5.2</span>' : ''}${(m.aka || []).length ? `<span>· 2024 name: ${m.aka.map(esc).join(', ')}</span>` : ''}</div>
      <div class="actions">${parts.length ? `<button class="btn sm primary" type="button" data-act="addall" data-id="${m.id}">${svg('plus')}Add ${lvl === 1 ? 'known' : 'all'} parts to satchel</button>` : ''}
      ${isDM() ? `<button class="btn sm" type="button" data-act="fightadd1" data-id="${m.id}">${svg('beast')}Add to the fight</button>` : ''}${isDM() ? `<a class="btn sm" href="https://www.dndbeyond.com/monsters?filter-search=${encodeURIComponent(m.name.replace(/\s*\(.*\)/, ''))}" target="_blank" rel="noopener">${svg('ext')}Stat block on D&amp;D Beyond</a>` : ''}${shareBtn(m)}</div></div></div>${figure(m)}
      <div class="dbody"><p class="lede">${esc(m.blurb || '')}</p>
      ${(m.env || []).filter(e => seePlace(D.envs.get(e))).length ? `<div class="chips"><span class="small muted">Found in</span>${m.env.filter(e => seePlace(D.envs.get(e))).map(e => `<a class="chip" href="#/place/${e}"><span style="color:${ENV_COLOR[e] || 'inherit'}">●</span> ${esc(envName(e))}</a>`).join('')}</div>` : ''}</div></div>
    <div id="sharebox"></div>
    ${fold('mon.parts', m.salvage ? 'Salvage' : 'Harvestable parts', `
      ${!parts.length ? '<div class="empty">Your notes say nothing about what can be taken from it.</div>' : ''}${hiddenParts && !isDM() ? `<p class="small muted undisc">${parts.length ? 'Hunters say it yields more than your notes mention.' : ''} A hunter’s field notes or a close look at a slain one would tell you more.</p>` : ''}
      <div class="tbl-wrap"${parts.length ? '' : ' hidden'}><table class="ptable"><thead><tr><th>Part</th><th>Yield</th><th>Check</th><th>Keeps</th><th>Harvesting notes</th><th></th></tr></thead><tbody>
      ${parts.map(({ h, t }) => `<tr><td><div class="cell-part">${ico(t)}<span><a href="#/material/${t.id}"><b>${esc(t.name)}</b></a><br>${pill(t.tier)}</span></div></td><td class="mono">${esc(h.dice || h.q || 1)}</td><td class="nowrap">${dcCell(h.skill, h.dc)}</td><td class="nowrap small">${esc(t.perish || 'stable')}</td><td class="small">${esc(h.note || '')}<div class="note">${esc(t.desc)}</div></td><td><button class="btn sm" type="button" data-act="add" data-id="${t.id}" data-q="${h.q || 1}" aria-label="Add ${esc(t.name)}">${svg('plus')}</button></td></tr>`).join('')}
      </tbody></table></div>
      <p class="small muted">Harvest time per part depends on size (${esc(m.size)}: ${({ Tiny: '5 min', Small: '10 min', Medium: '20 min', Large: '40 min', Huge: '1½ h', Gargantuan: '3 h' })[m.size] || '—'}). <a href="#/rules/harvest">Harvesting rules →</a></p>`, { count: parts.length })}
    ${harvestRoller(m)}
    ${fold('mon.craft', 'Craftable from this creature', `${hiddenCraft ? `<p class="small muted undisc">${clist.length ? '…and' : 'There are'} recipes your party hasn't learned yet.</p>` : ''}
      ${clist.length ? `<div class="list">${clist.slice(0, shown).map(x => rowFor(x.t, ` · uses ${[...x.parts].map(p => D.things.get(p).name.replace(m.name, '').trim() || D.things.get(p).name).join(', ')}`)).join('')}</div>${clist.length > shown ? `<button class="btn more" type="button" data-act="more" data-key="${key}" data-shown="${shown}" data-step="48">Show more (${clist.length - shown})</button>` : ''}` : (isDM() ? '<div class="empty">No recipe names these parts directly, but they fit many "any…" slots. Open a part to see where.</div>' : '')}`, { count: clist.length, hidden: !isDM() && !clist.length && !hiddenCraft })}
  </div>`;
}
/* ---- detail: place ---- */
function pPlace(id) {
  const e = D.envs.get(id); if (!e) return notFound();
  if (!seePlace(e)) return undiscovered(e, 'place');
  const monsA = (D.envMon.get(id) || []).slice().sort((a, b) => crNum(a.cr) - crNum(b.cr)), mons = monsA.filter(seeMon);
  const gA = (e.gather || []).map(x => ({ x, t: D.things.get(x.m) })).filter(y => y.t).sort((a, b) => ti(a.t.tier) - ti(b.t.tier));
  const plv = placeLevel(e), g = gA.filter(y => plv >= 2 ? seeThing(y.t) : partKnown(y.t));
  const key = 'penv-' + id, shown = listBlock.state[key] || 30;
  return `<div class="page">
    <div class="crumbs"><a href="#/places">Places</a><span>/</span><span>${esc(e.name)}</span></div>
    <figure class="plate banner">${window.CodexPlates ? window.CodexPlates.plate(e, {}) : ''}${!window.CODEX_ARTIFACT || e.img ? `<img class="plate-img" alt="${esc(e.name)}" loading="lazy" src="${esc(e.img || `images/places/${e.id}.webp`)}" data-try="${e.img ? '' : 'jpg,png'}" onerror="codexImgFail(this)" onload="this.parentNode.classList.add('has-img')">` : ''}</figure>
    <div class="section-head"><h1>${esc(e.name)}</h1>${shareBtn(e)}</div>
    <div id="sharebox"></div>
    <p class="lede">${esc(e.desc)}</p>
    ${e.forage ? `<p class="callout"><b>Foraging here:</b> ${esc(e.forage)}</p>` : ''}
    ${fold('place.gather', 'Gatherables', `${plv === 1 ? '<p class="small muted">You know this place only from what others have told you.</p>' : ''}
      ${g.length ? `<div class="tbl-wrap"><table><thead><tr><th>Material</th><th>Yield</th><th>Check</th><th>Danger</th><th>Conditions</th><th></th></tr></thead><tbody>
      ${g.map(({ x, t }) => `<tr><td><div class="cell-part">${ico(t)}<span><a href="#/material/${t.id}"><b>${esc(t.name)}</b></a><br>${pill(t.tier)}</span></div></td><td class="mono">${esc(x.dice || x.q || 1)}</td><td class="nowrap">${dcCell(x.skill, x.dc)}</td><td>${riskCell(x, e)}</td><td class="small">${esc(x.cond || '')}${guardHtml(x)}${D.grow.has(t.id) ? `<div class="note">${svg('leaf')} Can be grown from a cutting</div>` : ''}</td><td><button class="btn sm" type="button" data-act="add" data-id="${t.id}" data-q="${x.q || 1}" aria-label="Add ${esc(t.name)}">${svg('plus')}</button></td></tr>`).join('')}
      </tbody></table></div>` : ''}
      ${gA.length > g.length ? `<p class="small muted undisc">${g.length ? 'More' : 'Things'} grow or lie hidden here. Forage to find them, or ask around for a survey map.</p>` : ''}`, { count: g.length })}
    ${fold('place.mons', 'Creatures found here', `
      ${mons.length ? `<div class="list">${mons.slice(0, shown).map(m => rowFor(m)).join('')}</div>${mons.length > shown ? `<button class="btn more" type="button" data-act="more" data-key="${key}" data-shown="${shown}" data-step="60">Show more (${mons.length - shown})</button>` : ''}` : (isDM() ? '<div class="empty">No creatures listed here.</div>' : '')}
      ${monsA.length > mons.length ? `<p class="small muted undisc">${mons.length ? '…and' : 'Travellers speak of'} creatures you haven't encountered yet.</p>` : ''}`, { count: mons.length, open: false })}
  </div>`;
}
/* ---- tag page ---- */
function pTag(tagStr, query) {
  const tags = decodeURIComponent(tagStr).split('+').filter(Boolean);
  const min = query.get('min') || 'mundane';
  const c = { any: tags, min };
  let mats = D.materials.filter(t => matches(t, c)).sort((a, b) => ti(a.tier) - ti(b.tier) || byName(a, b));
  let items = D.items.filter(t => matches(t, c));
  const asks = D.anySlots.filter(s => tags.every(x => s.c.any.includes(x)));
  let askItems = [...new Map(asks.map(s => [s.t.id, s.t])).values()].sort(byName);
  if (!isDM()) { mats = mats.filter(seeThing); items = items.filter(seeThing); askItems = askItems.filter(x => known(x) && seeThing(x)); }
  return `<div class="page">
    <div class="crumbs"><a href="#/materials">Materials</a><span>/</span><span>Tag</span></div>
    <h1>${tags.map(esc).join(' + ')}${min !== 'mundane' ? ` <span class="muted" style="font-size:.6em">(${TIER_LABEL[min]}+)</span>` : ''}</h1>
    <p class="lede">Everything carrying ${tags.length > 1 ? 'these tags' : 'this tag'}. Recipes with an "any ${esc(tags.join(' + '))}" slot accept any of these.</p>
    <section class="section"><div class="section-head"><h2>Materials</h2><span class="count">${mats.length}</span></div>${listBlock(mats, 'tagm-' + tagStr + min, 'No materials carry this tag.')}</section>
    ${items.length ? `<section class="section"><div class="section-head"><h2>Items</h2><span class="count">${items.length}</span></div>${listBlock(items, 'tagi-' + tagStr)}</section>` : ''}
    ${askItems.length ? `<section class="section"><div class="section-head"><h2>Recipes asking for it</h2><span class="count">${askItems.length}</span></div>${listBlock(askItems, 'taga-' + tagStr)}</section>` : ''}
  </div>`;
}
/* ---- search results ---- */
function pSearch(q) {
  const res = doSearch(q, 300);
  const groups = ['monster', 'item', 'material', 'place'].map(k => [k, res.filter(e => e.kind === k).map(e => e.o)]).filter(g => g[1].length);
  return `<div class="page"><div class="section-head"><h1>Results for “${esc(q)}”</h1><span class="count">${res.length}</span></div>
    ${groups.length ? groups.map(([k, arr]) => `<section class="section"><div class="section-head"><h2>${{ monster: 'Creatures', item: 'Items', material: 'Materials', place: 'Places' }[k]}</h2><span class="count">${arr.length}</span></div>${listBlock(arr, 'search-' + k)}</section>`).join('') : '<div class="empty">Nothing matches. Try a single word, like <i>wolf</i>, <i>fire</i> or <i>cloak</i>.</div>'}
  </div>`;
}
/* ---- satchel ---- */
let satTab = 'ready';
let satView = store.get('scavengers-codex.satView', 'mine') === 'party' ? 'party' : 'mine';
function satRow(id, q, where) {
  const t = D.things.get(id);
  const move = where === 'mine'
    ? `<button class="btn sm" type="button" data-act="give" data-id="${id}" title="Move one to the party satchel"${Party.readonly ? ' disabled' : ''}>To party</button>`
    : `<button class="btn sm" type="button" data-act="take" data-id="${id}" title="Take one into your own satchel"${Party.readonly ? ' disabled' : ''}>Take</button>`;
  const dis = where === 'party' && Party.readonly ? ' disabled' : '';
  return `<div class="sat-row">${ico(t)}<div class="txt"><a class="name" href="${linkOf(t)}">${esc(t.name)}</a><span class="small muted">${TIER_LABEL[t.tier]} · ${esc(thingSub(t))}</span>${spoilBadge(t)}</div>${move}<div class="stepper"><button type="button" data-act="${where === 'mine' ? 'dec' : 'pdec'}" data-id="${id}" aria-label="One fewer"${dis}>−</button><input type="number" min="0" value="${q}" data-act="${where === 'mine' ? 'qty' : 'pqty'}" data-id="${id}" aria-label="Quantity of ${esc(t.name)}"${dis}><button type="button" data-act="${where === 'mine' ? 'inc' : 'pinc'}" data-id="${id}" aria-label="One more"${dis}>+</button></div></div>`;
}
function partyPanel() {
  const ids = Object.keys(Party.items).filter(id => D.things.has(id)).sort((a, b) => byName(D.things.get(a), D.things.get(b)));
  const learned = [...Party.learned].map(id => D.things.get(id)).filter(Boolean).sort(byName);
  const status = Party.live
    ? `<span class="pill t-uncommon">Live</span><span class="small muted">Shared with everyone who opens this page and uses party code <b>${esc(Party.code)}</b>.${Party.readonly ? ' You can view it, but only people with edit access can change it.' : ''}</span>`
    : `<span class="pill t-common">On this device</span><span class="small muted">Share it with the party by sending a link. Anyone who opens the link can load it.</span>`;
  return `<div class="card party-card"><div class="frow">${status}</div>
      <div class="frow"><label class="skill-in" for="partyCode">Party code <input class="textin" id="partyCode" value="${esc(Party.code)}" autocomplete="off" style="width:160px"></label><button class="btn sm" type="button" data-act="partycode">Switch party</button>
      </div>
      ${Party.live ? '' : `<div class="frow">${siteBase() || !window.CODEX_ARTIFACT ? '<button class="btn sm primary" type="button" data-act="sharelink">Copy share link</button>' : ''}<button class="btn sm" type="button" data-act="sharecode">Copy party code</button>${siteBase() ? '<button class="btn sm" type="button" data-act="partyqr">Show QR code</button>' : ''}</div><div id="partyQr"></div>
      <div class="frow"><input class="textin" id="pasteCode" placeholder="Load a party code or link…" autocomplete="off" aria-label="Paste a party code"><button class="btn sm" type="button" data-act="pastecode">Load</button></div>`}</div>
    <div class="addbox"><div class="search-wrap" style="max-width:none"><svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="satAdd" type="search" placeholder="Add to the party satchel…" autocomplete="off" aria-label="Add to party satchel"${Party.readonly ? ' disabled' : ''}><div id="satSug" class="suggest" hidden></div></div></div>
    ${ids.length ? `<div class="sat-list">${ids.map(id => satRow(id, Party.items[id], 'party')).join('')}</div>` : '<div class="empty">The party satchel is empty. Add things here, or use <b>To party</b> in your own satchel.</div>'}
    <section class="section"><div class="section-head"><h2>Learned formulas</h2><span class="count">${learned.length}</span></div>
      ${learned.length ? `<div class="chips">${learned.map(t => `<a class="chip" href="${linkOf(t)}"><span class="t-${t.tier}">●</span> ${esc(t.name)}</a>`).join('')}</div>` : `<p class="small muted">None yet. ${mode === 'dm' ? 'Share formulas with <b>Share with players</b> on an item page, or press <b>Mark as learned here</b> if this device is the party\'s.' : 'Your DM unlocks formulas as you find them.'}</p>`}</section>
    ${Party.log.length ? `<section class="section"><div class="section-head"><h2>Recent activity</h2></div><ul class="plog">${Party.log.slice(0, 12).map(e => `<li><span class="mono muted">${new Date(e.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> ${esc(e.text)}</li>`).join('')}</ul></section>` : ''}`;
}
function pSatchel() {
  const ids = Object.keys(sat).filter(id => D.things.has(id)).sort((a, b) => byName(D.things.get(a), D.things.get(b)));
  const cs = craftables();
  const ready = cs.filter(x => x.a.ok), close = cs.filter(x => !x.a.ok && x.a.missingSlots <= 2), rest = cs.filter(x => !x.a.ok && x.a.missingSlots > 2);
  const tabs = [['ready', 'Ready to craft', ready], ['close', '1–2 parts away', close], ['rest', 'Uses your parts', rest]];
  const curList = (tabs.find(t => t[0] === satTab) || tabs[0])[2];
  const key = 'sat-' + satTab, shown = listBlock.state[key] || 30;
  const craftRow = ({ t, a }) => {
    const miss = t.recipe.components.map((c, i) => ({ c, s: a.slots[i] })).filter(x => x.s.missing).map(x => `${x.s.missing}× ${esc(slotLabel(x.c))}`);
    return `<div class="craft-row"><div class="top">${ico(t)}<a class="txt" href="${linkOf(t)}"><b>${esc(t.name)}</b><br><span class="small muted">${esc(CAT_LABEL[t.cat] || 'Material')}${showDC() ? ` · DC ${esc(t.recipe.dc)}` : ''} · ${esc(t.recipe.time)}</span></a>${pill(t.tier)}${a.ok ? `<button class="btn sm primary" type="button" data-act="craft" data-id="${t.id}">Start</button>` : ''}</div>
      <div class="meter${a.ok ? '' : ' part'}"><i style="width:${Math.round(a.frac * 100)}%"></i></div>
      ${miss.length ? `<div class="miss">Missing: ${miss.join(' · ')}</div>` : `<div class="small muted">Tools: ${esc((t.recipe.tools || []).map(x => TOOL_NAMES[x] || x).join(', ') || '—')} · ${fmtGp(t.recipe.gp)} in reagents</div>`}</div>`;
  };
  const pc = Object.keys(Party.items).length;
  const mine = `<div class="addbox"><div class="search-wrap" style="max-width:none"><svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="satAdd" type="search" placeholder="Add a material or item…" autocomplete="off" aria-label="Add to satchel"><div id="satSug" class="suggest" hidden></div></div></div>
        ${ids.length ? `<div class="sat-list">${ids.map(id => satRow(id, sat[id], 'mine')).join('')}</div>
          <div class="frow"><button class="btn sm" type="button" data-act="export">Export</button><button class="btn sm" type="button" data-act="import">Import</button><button class="btn sm" type="button" data-act="clear">${svg('trash')}Empty satchel</button></div>`
          : `<div class="empty">Your satchel is empty. Search above, use “Add to satchel” on any page, or <button class="btn sm" type="button" data-act="sample">load a sample haul</button></div>`}
        <div id="ioBox" hidden><textarea class="io" id="ioText" aria-label="Satchel data"></textarea><div class="frow" style="margin-top:8px"><button class="btn sm primary" type="button" data-act="doimport">Load from text</button><button class="btn sm" type="button" data-act="copy">Copy</button>${window.CODEX_ARTIFACT ? '' : '<button class="btn sm" type="button" data-act="download">Download .json</button>'}<label class="btn sm" for="ioFile">Open file…</label><input type="file" id="ioFile" accept=".json,application/json" hidden></div></div>`;
  return `<div class="page"><div class="section-head"><h1>Satchel</h1><span class="count">${plural(ids.length, 'kind')} of things carried</span></div>
    <p class="lede">Your own satchel and the party's shared one. The codex works out what you can craft from both.</p>
    ${clockBar()}
    <div class="sat-grid">
      <section class="section">
        <div class="tabs" role="tablist"><button class="tab${satView === 'mine' ? ' on' : ''}" type="button" role="tab" aria-selected="${satView === 'mine'}" data-act="satview" data-v="mine">My satchel <span class="mono">${ids.length}</span></button><button class="tab${satView === 'party' ? ' on' : ''}" type="button" role="tab" aria-selected="${satView === 'party'}" data-act="satview" data-v="party">Party satchel <span class="mono">${pc}</span></button></div>
        ${satView === 'mine' ? mine : partyPanel()}
      </section>
      <section class="section">
        ${workbench()}
        ${goalBlock()}
        <label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-act="useparty"${useParty ? ' checked' : ''}> Count the party satchel when working out what can be crafted</label>
        <div class="tabs" role="tablist">${tabs.map(([k, l, arr]) => `<button class="tab${satTab === k ? ' on' : ''}" type="button" role="tab" aria-selected="${satTab === k}" data-act="sattab" data-tab="${k}">${l} <span class="mono">${arr.length}</span></button>`).join('')}</div>
        ${curList.length ? curList.slice(0, shown).map(craftRow).join('') + (curList.length > shown ? `<button class="btn more" type="button" data-act="more" data-key="${key}" data-shown="${shown}" data-step="40">Show more (${curList.length - shown})</button>` : '') : `<div class="empty">${ids.length || pc ? (satTab === 'ready' ? 'Nothing is fully covered yet. Check “1–2 parts away”.' : 'Nothing in this list.') : 'Add a few parts to see what they make.'}</div>`}
        <p class="small muted">Tools, stations and reagent gold aren't tracked here, so check the recipe before you craft.${mode === 'player' ? ' Player view: only formulas your party has learned are listed.' : ''}</p>
      </section>
    </div></div>`;
}
function pPartyLink(code) {
  const o = Party.parseShare(code || '');
  if (!o) return `<div class="page"><h1>That party link didn't work</h1><p class="lede">The link may have been cut short when it was copied. Ask for it again.</p></div>`;
  const items = Object.entries(o.i || {}).filter(([k]) => D.things.has(k));
  return `<div class="page"><div class="crumbs"><a href="#/satchel">Satchel</a><span>/</span><span>Party link</span></div><h1>Party satchel “${esc(o.c || 'party')}”</h1>
    <p class="lede">${plural(items.length, 'kind')} of things and ${plural((o.l || []).length, 'learned formula')}.</p>
    <div class="frow"><button class="btn primary" type="button" data-act="partyload" data-code="${esc(code)}" data-mode="replace">Load as my party satchel</button><button class="btn" type="button" data-act="partyload" data-code="${esc(code)}" data-mode="merge">Merge into my party satchel</button></div>
    <div class="list">${items.slice(0, 200).map(([k, v]) => rowFor(D.things.get(k), ` · ×${+v}`)).join('')}</div></div>`;
}
function clockBar() {
  const all = Object.keys(inv()).map(id => D.things.get(id)).filter(Boolean).map(t => ({ t, s: spoilInfo(t) })).filter(x => x.s);
  const bad = all.filter(x => x.s.spoiledQ).length, soon = all.filter(x => x.s.soon).length;
  return `<div class="card clockbar"><div><div class="eyebrow">Party clock</div><b class="mono">${fmtClock(Party.clock)}</b></div>
    <div class="frow"><button class="btn sm" type="button" data-act="clock" data-h="1">+1 hour</button><button class="btn sm" type="button" data-act="clock" data-h="8">+8 hours</button><button class="btn sm" type="button" data-act="clock" data-h="24">+1 day</button><button class="btn sm" type="button" data-act="clock" data-h="168">+1 week</button><button class="btn sm" type="button" data-act="clock" data-h="-1" title="Undo an hour">−1 h</button></div>
    <label class="small spoil-toggle" title="Switch spoilage off and nothing ever spoils. Shared with the party link."><input type="checkbox" data-act="spoiltoggle"${spoilOn() ? ' checked' : ''}> Parts can spoil</label>
    ${Party.beds.length && !location.hash.startsWith('#/garden') ? (() => { const st = Party.beds.map(bedState).filter(Boolean); const r = st.filter(x => x.ready && !x.due).length, d = st.filter(x => x.due).length; return `<a class="small" href="#/garden">${svg('plant')}Garden: ${r ? `<b>${r} ready</b>` : `${plural(st.length, 'plant')} growing`}${d ? `, ${d} need tending` : ''} →</a>`; })() : ''}
    <span class="small muted">${bad ? `<b style="color:var(--danger)">${plural(bad, 'part')} spoiled.</b> ` : ''}${soon ? `<b>${plural(soon, 'part')} will spoil soon.</b> ` : ''}${!spoilOn() ? 'Spoilage is off: nothing spoils.' : !bad && !soon ? (all.length ? 'Everything perishable is still fresh.' : 'Move the clock as time passes in game, and perishable parts count down.') : ''}</span></div>`;
}
function workbench() {
  if (!Party.projects.length) return '';
  return `<div class="section-head"><h2>Workbench</h2><span class="count">${Party.projects.length}</span></div>` + Party.projects.map(p => {
    const t = D.things.get(p.id), pct = Math.round(p.done / p.need * 100), done = p.done >= p.need;
    return `<div class="craft-row goal"><div class="top">${ico(t)}<a class="txt" href="${linkOf(t)}"><b>${esc(t.name)}</b><br><span class="small muted">${fmtWork(p.done)} of ${fmtWork(p.need)} worked${t.recipe && t.recipe.station ? ' · ' + esc(STATION_NAMES[t.recipe.station] || t.recipe.station) : ''}</span></a>${pill(t.tier)}</div>
      <div class="meter${done ? '' : ' part'}"><i style="width:${pct}%"></i></div>
      <div class="frow" style="margin-top:8px">${done ? `<a class="btn sm" href="${linkOf(t)}" title="The final check is on the item page">Roll the final check</a><button class="btn sm primary" type="button" data-act="projdone" data-uid="${p.uid}">${svg('check')}Finish &amp; add to satchel</button>`
        : `<button class="btn sm" type="button" data-act="projwork" data-uid="${p.uid}" data-h="1">+1 hour</button><button class="btn sm primary" type="button" data-act="projwork" data-uid="${p.uid}" data-h="8">+1 day of work</button>${p.need >= 40 ? `<button class="btn sm" type="button" data-act="projwork" data-uid="${p.uid}" data-h="40">+1 week</button>` : ''}`}<button class="btn sm" type="button" data-act="projdrop" data-uid="${p.uid}">Abandon</button></div></div>`;
  }).join('') + '<p class="small muted">A day of work is 8 hours. The parts are bound into the work, so they no longer spoil.</p>';
}
function goalBlock() {
  const gs = goals.map(id => D.things.get(id)).filter(t => t && t.recipe);
  if (!gs.length) return `<div class="empty small">Tip: open any item and press <b>Track as goal</b> to follow your progress here.</div>`;
  return `<div class="section-head"><h2>Goals</h2><span class="count">${gs.length}</span></div>` + gs.map(t => {
    const a = allocate(t.recipe, usable());
    const miss = t.recipe.components.map((c, i) => ({ c, s: a.slots[i] })).filter(x => x.s.missing).map(x => `${x.s.missing}× ${esc(slotLabel(x.c))}`);
    return `<div class="craft-row goal"><div class="top">${ico(t)}<a class="txt" href="${linkOf(t)}"><b>${esc(t.name)}</b><br><span class="small muted">${known(t) ? `${Math.round(a.frac * 100)}% of parts in hand` : 'Formula not learned yet'}</span></a>${pill(t.tier)}${a.ok && known(t) ? `<button class="btn sm primary" type="button" data-act="craft" data-id="${t.id}">Craft</button>` : ''}<button class="btn sm" type="button" data-act="goal" data-id="${t.id}" aria-label="Stop tracking ${esc(t.name)}">✕</button></div>
      <div class="meter${a.ok ? '' : ' part'}"><i style="width:${Math.round(a.frac * 100)}%"></i></div>${miss.length ? `<div class="miss">Still need: ${miss.join(' · ')}</div>` : '<div class="small" style="color:var(--ok)">Every part is in hand.</div>'}</div>`;
  }).join('');
}
/* ---- journal: codes, discoveries, research ---- */
function pJournal(prefill) {
  const keys = [...Party.known];
  const pick = (p, get) => keys.filter(k => k.startsWith(p + ':')).map(k => get(kid(k))).filter(Boolean).sort(byName);
  const uniq = arr => [...new Set(arr)].sort(byName);
  const mons = uniq([...pick('m', id => D.monsters.get(id)), ...pick('hm', id => D.monsters.get(id))]), places = uniq([...pick('p', id => D.envs.get(id)), ...pick('hp', id => D.envs.get(id))]), things = pick('t', id => D.things.get(id));
  const formulas = [...Party.learned].map(id => D.things.get(id)).filter(Boolean).sort(byName);
  const research = Object.entries(Party.research).map(([id, n]) => ({ t: D.things.get(id), n })).filter(x => x.t && x.n > 0);
  const chips = (arr, key) => { const shown = listBlock.state[key] || 40; return arr.length ? `<div class="chips">${arr.slice(0, shown).map(o => `<a class="chip${(o.kind === 'monster' && monLevel(o) === 1) || (o.kind === 'place' && placeLevel(o) === 1) ? ' heard' : ''}" href="${linkOf(o)}"${(o.kind === 'monster' && monLevel(o) === 1) || (o.kind === 'place' && placeLevel(o) === 1) ? ' title="Heard of, not yet studied"' : ''}><span class="t-${o.tier || 'common'}">●</span> ${esc(o.name)}</a>`).join('')}${arr.length > shown ? `<button class="chip" type="button" data-act="more" data-key="${key}" data-shown="${shown}" data-step="80">+${arr.length - shown} more</button>` : ''}</div>` : '<p class="small muted">Nothing yet.</p>'; };
  return `<div class="page"><div class="section-head"><h1>Journal</h1><span class="count">party “${esc(Party.code)}”</span></div>
    <p class="lede">What your party has learned: formulas, creatures, places and finds. Your DM hands out notes, maps and recipes with codes on them. Enter one here to add it to the journal.</p>
    <form class="card roller codebox" id="codeForm"><label class="eyebrow" for="codeIn">Enter a code</label><div class="frow"><input class="textin mono" id="codeIn" autocomplete="off" spellcheck="false" placeholder="SC-XXXX-XXXX-…" value="${esc(prefill || '')}" style="height:44px;font-size:1.05rem;letter-spacing:.06em"><button class="btn primary" type="submit">Unlock</button></div><p class="small muted" id="codeErr" hidden></p></form>
    ${research.length ? `<section class="section"><div class="section-head"><h2>Research in progress</h2></div>${research.map(({ t, n }) => `<a class="craft-row" href="${linkOf(t)}" style="color:inherit;text-decoration:none"><div class="top">${ico(t)}<span class="txt"><b>${esc(t.name)}</b><br><span class="small muted">${n} of ${researchNeed(t)} weeks of study</span></span>${pill(t.tier)}</div><div class="boxes">${Array.from({ length: researchNeed(t) }, (_, i) => `<span class="box${i < n ? ' on' : ''}"></span>`).join('')}</div></a>`).join('')}</section>` : ''}
    ${fold('j.f', 'Formulas learned', chips(formulas, 'jf'), { count: formulas.length })}
    ${fold('j.m', 'Creatures', `${chips(mons, 'jm')}${mons.some(o => monLevel(o) === 1) ? '<p class="small muted">Dashed ones you know only by reputation: a name, a look, and the parts your notes mention.</p>' : ''}${CFG.player.creatures !== 'none' ? `<p class="small muted">Plus ${CFG.player.creatures === 'all' ? 'every creature' : 'ordinary beasts and people'}, which everyone knows.</p>` : ''}`, { count: mons.length })}
    ${fold('j.p', 'Places', chips(places, 'jp'), { count: places.length })}
    ${fold('j.t', 'Materials &amp; items discovered', chips(things, 'jt'), { count: things.length })}
    ${sessionPanel(false)}
    ${backupPanel()}
    <p class="small muted">The journal belongs to the party. Share it along with the party satchel from <a href="#/satchel">Satchel → Party satchel</a>. ${isDM() ? 'You are in DM view, so every page is visible anyway. Switch to player view to see what your players see.' : ''}</p>
  </div>`;
}
/* ---- backup: everything this device keeps, in one file ---- */
const BACKUP_SKIP = ['scavengers-codex.dmUnlocked', 'scavengers-codex.localPin'];
function sessionEntries() { const since = (Party.session && Party.session.at) || 0; return Party.log.filter(e => e.at >= since).slice().reverse(); }
function sessionText() {
  const es = sessionEntries(), s = Party.session;
  return `${s && s.name ? s.name : 'Session recap'}${s ? ` (started ${new Date(s.at).toLocaleDateString()})` : ''}\n` + (es.length ? es.map(e => `- ${e.text}`).join('\n') : '- Nothing recorded yet.');
}
function sessionPanel(dm) {
  const es = sessionEntries(), s = Party.session;
  return fold(dm ? 'session.dm' : 'session', 'This session', `${s ? `<p class="small muted">${esc(s.name || 'Session')} began ${new Date(s.at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${s.clock != null ? ` (party clock ${fmtClock(s.clock)})` : ''}.</p>` : '<p class="small muted">No session started yet, so this shows everything recorded.</p>'}
    ${es.length ? `<ol class="plog recap">${es.map(e => `<li><span class="mono muted">${new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> ${esc(e.text)}</li>`).join('')}</ol>` : '<p class="small muted">Nothing recorded yet. Harvests, handouts, crafting and the garden are logged here as they happen.</p>'}
    <div class="frow"><button class="btn sm" type="button" data-act="copytext" data-text="${esc(sessionText())}">Copy recap</button>${dm ? `<input class="textin" id="sessName" placeholder="Session 12: The Barrow" aria-label="Session name" style="max-width:260px"><button class="btn sm primary" type="button" data-act="sessnew">Start a new session</button>` : ''}</div>`, { count: es.length, open: dm });
}
function backupObj() {
  const data = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('scavengers-codex.') && !BACKUP_SKIP.includes(k)) data[k] = localStorage.getItem(k); } } catch (e) { /* storage blocked */ }
  return { app: 'scavengers-codex', v: 1, at: new Date().toISOString(), party: Party.code, data };
}
function restoreBackup(txt) {
  let o; try { o = JSON.parse(txt); } catch (e) { return 'That isn’t a codex backup (it isn’t valid JSON).'; }
  if (!o || o.app !== 'scavengers-codex' || !o.data) return 'That file isn’t a Scavenger’s Codex backup.';
  try {
    const old = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('scavengers-codex.') && !BACKUP_SKIP.includes(k)) old.push(k); }
    old.forEach(k => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(o.data)) if (k.startsWith('scavengers-codex.') && !BACKUP_SKIP.includes(k)) localStorage.setItem(k, v);
  } catch (e) { return 'This browser won’t let the codex save data here.'; }
  return '';
}
function backupPanel() {
  const n = Object.keys(backupObj().data).length;
  return fold('backup', 'Backup &amp; restore', `<p class="small">Everything the codex keeps lives in this browser: satchels, the party journal, the garden, the workbench, goals, handout cards and settings. Browsers can clear that without warning, so save a backup now and then (the DM PIN isn’t included).</p>
    <div class="frow">${window.CODEX_ARTIFACT ? '' : '<button class="btn sm primary" type="button" data-act="backupdl">Download backup</button>'}<button class="btn sm${window.CODEX_ARTIFACT ? ' primary' : ''}" type="button" data-act="backupcopy">Copy backup as text</button><label class="btn sm" for="backupFile">Restore from file…</label><input type="file" id="backupFile" accept=".json,application/json" hidden><span class="small muted">${n} saved entries on this device</span></div>
    <div id="backupBox" hidden><textarea class="io" id="backupText" aria-label="Backup text" placeholder="Paste a backup here to restore it"></textarea><div class="frow" style="margin-top:8px"><button class="btn sm" type="button" data-act="backuprestore">Restore from this text</button><span class="small muted">Restoring replaces what’s on this device.</span></div></div>`, { open: false });
}
/* ---- rules / about ---- */
function pRules() {
  let r = window.CODEX_RULES || '';
  if (!isDM()) r = r.replace(/<h2 id="r-dm">[\s\S]*$/, '');
  r += quirkTables();
  const want = pRules.open;
  const parts = r.split(/(?=<h2 id="r-)/);
  const body = parts.map(p => {
    const m = p.match(/^<h2 id="r-([a-z]+)">([\s\S]*?)<\/h2>([\s\S]*)$/); if (!m) return p;
    const open = m[1] === want;
    return `<details class="rule-sec" id="r-${m[1]}"${open ? ' open' : ''}><summary class="fold-sum"><span class="chev" aria-hidden="true"></span><h2>${m[2]}</h2></summary>${m[3]}</details>`;
  }).join('');
  return `<div class="page"><div class="section-head"><h1>Harvesting &amp; Crafting Rules</h1><button class="btn sm" type="button" data-act="rulesall">Open all</button></div><div class="prose">${body}</div></div>`;
}
function pAbout() {
  return `<div class="page"><h1>About the Codex</h1><div class="prose">
    <p>The Scavenger's Codex is a fan-made harvesting and crafting supplement for the fifth edition of the world's most popular roleplaying game. It covers the ${D.monsters.size} creatures of the System Reference Documents (5.1 and 5.2.1), ${D.envs.size} places to forage, and ${D.items.length} craftable items: every SRD magic item, the basic equipment, and a large set of original items built around harvested parts.</p>
    <h2>Legal</h2>
    <p>This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at <a href="https://dnd.wizards.com/resources/systems-reference-document" target="_blank" rel="noopener">dnd.wizards.com/resources/systems-reference-document</a>. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener">creativecommons.org/licenses/by/4.0/legalcode</a>.</p>
    <p>This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noopener">dndbeyond.com/srd</a>. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License available at <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener">creativecommons.org/licenses/by/4.0/legalcode</a>. Creatures added from SRD 5.2.1 are marked on their pages, and 2024 creature names are listed as aliases.</p>
    <p>Item effects are short paraphrases, not rules text. Look up the full rules in your own books or on D&amp;D Beyond. Creature parts, harvesting data, recipes, places and Homebrew items are original content. This is unofficial fan content and is not approved or endorsed by Wizards of the Coast. Only open-licence (SRD) creatures are included; you can add others to the data files yourself.</p>
    <h2>Adding your own content</h2>
    <p>All content lives in plain JSON files in the <span class="mono">data/</span> folder. Add a creature, material or recipe, list the file in <span class="mono">data/manifest.json</span>, and the site links it up automatically. See <span class="mono">SCHEMA.md</span> for the format and run <span class="mono">tools/validate.py</span> to check your references.</p>
  </div></div>`;
}
function notFound() { return `<div class="page"><h1>Not found</h1><p>That entry isn't in the codex. <a href="#/">Back to the start</a>.</p></div>`; }

/* ================================================================ router */
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const query = new URLSearchParams(qs || '');
  const [a, b] = parts;
  let html, nav = a || 'home';
  switch (a) {
    case undefined: case '': html = pHome(); nav = 'home'; break;
    case 'items': html = pItems(); break;
    case 'materials': html = pMaterials(); break;
    case 'monsters': html = pMonsters(); break;
    case 'places': html = pPlaces(); break;
    case 'item': html = pThing(b); nav = 'items'; break;
    case 'material': html = pThing(b); nav = 'materials'; break;
    case 'monster': html = pMonster(b); nav = 'monsters'; break;
    case 'place': html = pPlace(b); nav = 'places'; break;
    case 'tag': html = pTag(parts.slice(1).join('/'), query); nav = 'materials'; break;
    case 'search': html = pSearch(query.get('q') || ''); nav = ''; break;
    case 'satchel': html = pSatchel(); break;
    case 'party': html = pPartyLink(parts.slice(1).join('/')); nav = 'satchel'; break;
    case 'dm': html = pDM(); nav = 'dm'; break;
    case 'journal': html = pJournal(parts.slice(1).join('/')); nav = 'journal'; break;
    case 'rules': pRules.open = b; html = pRules(); break;
    case 'about': html = pAbout(); break;
    case 'garden': html = pGarden(); break;
    case 'print': html = pPrint(); nav = 'dm'; break;
    default: html = notFound();
  }
  const v = $('#view');
  const sameView = route.last === path;
  v.innerHTML = html + `<footer class="foot"><a href="#/dm">DM tools</a><a href="#/rules">Rules</a><a href="#/about">About &amp; licence</a><span>Includes SRD 5.1 and 5.2.1 material (CC-BY-4.0). Unofficial fan content.</span></footer>`;
  renderNav(nav);
  if (a === 'satchel') wireSatchel();
  if (a === 'dm') wireDM();
  if (a === 'journal') wireJournal();
  if (nav === 'home') wireHome();
  if (a === 'rules' && b) { const el = document.getElementById('r-' + b); if (el) { el.open = true; el.scrollIntoView(); } }
  else if (!sameView) window.scrollTo(0, 0);
  route.last = path;
  const t = (a === 'item' || a === 'material') ? D.things.get(b) : a === 'monster' ? D.monsters.get(b) : a === 'place' ? D.envs.get(b) : null;
  document.title = t && seeAny(t) ? `${t.name} · Scavenger's Codex` : "The Scavenger's Codex";
}
function rerender() { const y = window.scrollY; route(); window.scrollTo(0, y); }
function wireJournal() {
  const f = $('#codeForm'); if (!f) return;
  if ($('#codeIn').value && !wireJournal.busy) { wireJournal.busy = true; setTimeout(() => { f.requestSubmit(); wireJournal.busy = false; }, 50); }
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    const entries = readCode($('#codeIn').value); const err = $('#codeErr');
    if (/^#\/journal\/./.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search + '#/journal'); } catch (e) { /* ignore */ } route.last = 'journal'; }
    if (!entries) { err.hidden = false; err.textContent = "That code didn't work. Check every character, since codes are case-insensitive but exact."; return; }
    if (/^#\/journal\/./.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search + '#/journal'); } catch (e) { /* ignore */ } route.last = 'journal'; }
    const res = redeem(entries);
    const names = entries.map(([ty, id]) => ((ty === 'C' ? D.monsters.get(id) : ty === 'P' ? D.envs.get(id) : D.things.get(id)) || {}).name).filter(Boolean);
    Party.note(`Unlocked a handout: ${names.join(', ')}`);
    $('#codeIn').value = ''; err.hidden = true; rerender();
    showReveal(res, names.length === 1 ? names[0] : 'Handout unlocked');
  });
}
function wireSatchel() {
  const inp = $('#satAdd'), box = $('#satSug');
  if (inp) {
    wireTypeahead(inp, box, (e) => { if (!e) { const r = doSearch(inp.value, 1, ['material', 'item']); e = r[0]; } if (e) { if (satView === 'party') { Party.add(e.o.id, 1); Party.note(`Added ${e.o.name} to the party satchel`); } else addSat(e.o.id); toast(`Added ${e.o.name}${satView === 'party' ? ' to the party satchel' : ''}`); rerender(); setTimeout(() => { const i = $('#satAdd'); if (i) i.focus(); }, 0); } }, ['material', 'item']);
  }
  const f = $('#ioFile');
  if (f) f.addEventListener('change', () => { const file = f.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => { $('#ioText').value = rd.result; doImport(); }; rd.readAsText(file); });
}
function doImport() {
  try {
    const obj = JSON.parse($('#ioText').value);
    const src = obj.satchel || obj; let n = 0;
    for (const [k, v] of Object.entries(src)) if (D.things.has(k) && +v > 0) { sat[k] = +v; n++; }
    saveSat(); toast(`Loaded ${plural(n, 'entry')}`); rerender();
  } catch (e) { toast('That text is not valid satchel JSON'); }
}

/* ================================================================ events */
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  if (act === 'spoiltoggle') { Party.spoil = el.checked; Party.save(); syncStamps(); rerender(); return; }
  if (act === 'qty' || act === 'pqty' || act === 'bdbuy' || act === 'useparty') return;
  if (el.tagName === 'BUTTON' || el.tagName === 'A') ev.preventDefault();
  switch (act) {
    case 'add': { const q = +(el.dataset.q || 1); addSat(id, q); toast(`Added ${q > 1 ? q + '× ' : ''}${D.things.get(id).name} to satchel`); if (location.hash.startsWith('#/item/') || location.hash.startsWith('#/material/') || location.hash.startsWith('#/satchel')) rerender(); break; }
    case 'addall': { const m = D.monsters.get(id); let n = 0; for (const h of monParts(m)) { sat[h.m] = (sat[h.m] || 0) + (h.q || 1); n++; } saveSat(); toast(`Added ${plural(n, 'part')} from the ${m.name}`); break; }
    case 'inc': sat[id] = (sat[id] || 0) + 1; saveSat(); rerender(); break;
    case 'dec': sat[id] = (sat[id] || 0) - 1; saveSat(); rerender(); break;
    case 'more': { listBlock.state[el.dataset.key] = +el.dataset.shown + +(el.dataset.step || PAGE); rerender(); break; }
    case 'opts': { const box = document.getElementById(el.dataset.target); if (box) { box.classList.toggle('open'); el.setAttribute('aria-expanded', box.classList.contains('open')); } break; }
    case 'ftoggle': { const b = document.getElementById('filters-' + el.dataset.page); b.classList.toggle('open'); el.textContent = b.classList.contains('open') ? 'Fewer filters' : 'More filters'; break; }
    case 'sattab': satTab = el.dataset.tab; rerender(); break;
    case 'satview': satView = el.dataset.v; store.set('scavengers-codex.satView', satView); rerender(); break;
    case 'pinc': Party.add(id, 1); break;
    case 'pdec': Party.add(id, -1); break;
    case 'give': { if (!(sat[id] > 0)) break; sat[id] -= 1; saveSat(); Party.add(id, 1); Party.note(`Put 1× ${D.things.get(id).name} in the party satchel`); toast('Moved to the party satchel'); rerender(); break; }
    case 'take': { if (!(Party.qty(id) > 0)) break; Party.add(id, -1); addSat(id, 1); Party.note(`Took 1× ${D.things.get(id).name} from the party satchel`); toast('Moved to your satchel'); rerender(); break; }
    case 'partycode': { const v = $('#partyCode').value; Party.setCode(v); toast(`Party “${Party.code}”`); rerender(); break; }
    case 'sharelink': case 'sharecode': {
      const code = Party.shareCode();
      const text = act === 'sharelink' ? (siteBase() || location.href.split('#')[0]) + '#/party/' + code : code;
      let box = document.getElementById('shareOut');
      if (!box) { box = document.createElement('textarea'); box.id = 'shareOut'; box.className = 'io'; box.readOnly = true; box.setAttribute('aria-label', 'Share text'); el.closest('.party-card').appendChild(box); }
      box.value = text; box.select();
      const ok = () => toast(act === 'sharelink' ? 'Link copied. Send it to your party' : 'Party code copied. Your party pastes it under “Load a party code”');
      try { navigator.clipboard.writeText(text).then(ok, () => toast('Select the text and copy it')); } catch (e) { toast('Select the text and copy it'); }
      break;
    }
    case 'partyqr': { const box = $('#partyQr'); if (!box) break; if (box.innerHTML) { box.innerHTML = ''; break; } const url = siteBase() + '#/party/' + Party.shareCode(); const q = qrSVG(url, 'qr qr-big'); box.innerHTML = q ? `<div class="qr-box">${q}<p class="small muted">Everyone scans this to load the party satchel and journal. It holds everything as of now: show a new one after changes.</p></div>` : '<p class="small muted">The party journal is too big for one QR code. Send the link instead.</p>'; break; }
    case 'pastecode': { const v = ($('#pasteCode').value || '').trim().replace(/^.*#\/party\//, ''); const o = Party.parseShare(v); if (!o) { toast("That code didn't work. Check it was copied in full"); break; } if (o.c) Party.setCode(o.c); Party.applyShare(o, false); toast('Party satchel loaded'); rerender(); break; }
    case 'partyload': { const o = Party.parseShare(el.dataset.code); if (o) { if (o.c) Party.setCode(o.c); Party.applyShare(o, el.dataset.mode === 'replace'); satView = 'party'; store.set('scavengers-codex.satView', 'party'); toast('Party satchel loaded'); try { history.replaceState(null, '', location.pathname + location.search + '#/satchel'); } catch (e) { /* ignore */ } route.last = 'satchel'; rerender(); } break; }
    case 'mode': setMode(mode === 'dm' ? 'player' : 'dm'); toast(mode === 'dm' ? 'DM view: every recipe is visible' : 'Player view: only learned formulas are shown'); break;
    case 'goal': toggleGoal(id); toast(goals.includes(id) ? 'Tracking in your satchel' : 'Stopped tracking'); rerender(); break;
    case 'rollh': doRoll(D.monsters.get(id)); break;
    case 'fcroll': doFinalCheck(D.things.get(id)); break;
    case 'research': doResearch(D.things.get(id), !!el.dataset.roll); break;
    case 'share': { const box = $('#sharebox'); if (!box) break; if (box.innerHTML) { box.innerHTML = ''; break; } const o = el.dataset.k === 'monster' ? D.monsters.get(id) : el.dataset.k === 'place' ? D.envs.get(id) : D.things.get(id); box.innerHTML = shareHTML(defaultShare(o)); break; }
    case 'rulesall': { const all = [...document.querySelectorAll('.rule-sec')]; const open = !all.every(d => d.open); all.forEach(d => { d.open = open; }); el.textContent = open ? 'Close all' : 'Open all'; break; }
    case 'sessnew': { const nm = ($('#sessName') || {}).value || ''; Party.session = { at: Date.now(), clock: Party.clock, name: nm.trim() || null }; Party.note(`${nm.trim() || 'A new session'} began`); toast('New session started. The recap starts from here'); rerender(); break; }
    case 'backupdl': { try { const blob = new Blob([JSON.stringify(backupObj(), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `codex-backup-${Party.code}-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Backup saved'); } catch (e) { toast('Download blocked here. Use Copy backup as text'); } break; }
    case 'backupcopy': { const b = $('#backupBox'), t = $('#backupText'); b.hidden = false; t.value = JSON.stringify(backupObj()); t.select(); try { navigator.clipboard.writeText(t.value).then(() => toast('Backup copied. Paste it somewhere safe'), () => toast('Select the text and copy it')); } catch (e) { toast('Select the text and copy it'); } break; }
    case 'backuprestore': {
      const t = $('#backupText'); if (!t || !t.value.trim()) { $('#backupBox').hidden = false; toast('Paste a backup into the box first'); break; }
      if (!el.dataset.confirm) { el.dataset.confirm = '1'; el.textContent = 'Tap again: this replaces what’s on this device'; break; }
      const err = restoreBackup(t.value); if (err) { toast(err); break; } toast('Backup restored'); setTimeout(() => location.reload(), 400); break;
    }
    case 'copyhandout': case 'printadd': {
      const box = el.closest('.handout'), text = ((box && box.querySelector('.handout-text')) || {}).innerText || '', code = el.dataset.code;
      if (el.dataset.act === 'printadd') {
        const ents = el.dataset.entries.split(',').map(x => x.split(':')), sh = store.get(PRINT_KEY, []);
        for (const [ty, eid] of ents) if (!sh.some(c => c.ty === ty && c.id === eid)) sh.push({ ty, id: eid, text: ents.length === 1 ? text.trim() : handoutText([[ty, eid]]) });
        store.set(PRINT_KEY, sh); toast(`${plural(ents.length, 'card')} added (${sh.length} on the sheet)`); if (location.hash.startsWith('#/dm')) rerender(); break;
      }
      const v = text.trim() + '\n' + (codeLink(code) || code); try { navigator.clipboard.writeText(v).then(() => toast('Copied'), () => toast('Select the text and copy it')); } catch (e) { toast('Select the text and copy it'); } break;
    }
    case 'printdel': { const sh = cardSheet(); sh.splice(+el.dataset.i, 1); store.set(PRINT_KEY, sh); rerender(); break; }
    case 'printclear': { if (!el.dataset.confirm) { el.dataset.confirm = '1'; el.textContent = 'Tap again to clear'; break; } store.set(PRINT_KEY, []); rerender(); break; }
    case 'cflip': { if (ev.target.closest('[contenteditable]')) break; const c = el.closest('.tcard'); if (c) c.classList.toggle('flipped'); break; }
    case 'cflipall': { const all = [...document.querySelectorAll('.cards-screen .tcard')]; const f = !all.every(c => c.classList.contains('flipped')); all.forEach(c => c.classList.toggle('flipped', f)); break; }
    case 'cmode': store.set('scavengers-codex.cardMode', el.dataset.m); rerender(); break;
    case 'print': { try { window.print(); } catch (e) { toast('Printing is blocked here. Open the site in your browser to print'); } break; }
    case 'copytext': { const txt = el.dataset.text; const done = () => toast('Copied'); try { navigator.clipboard.writeText(txt).then(done, () => toast('Select the text and copy it')); } catch (e) { toast('Select the text and copy it'); } break; }
    case 'bundle': { for (const e of el.dataset.entries.split(',').map(x => x.split(':'))) if (!DMS.bundle.some(x => x[0] === e[0] && x[1] === e[1])) DMS.bundle.push(e); DMS.tab = 'handouts'; toast(`${DMS.bundle.length} ${DMS.bundle.length === 1 ? 'entry' : 'entries'} in the bundle. Add more here`); location.hash = '#/dm'; if (location.hash === '#/dm') rerender(); break; }
    case 'dmtab-link': DMS.tab = el.dataset.tab; location.hash = '#/dm'; rerender(); break;
    case 'hodel': DMS.bundle.splice(+el.dataset.i, 1); rerender(); break;
    case 'siteurl': { const v = ($('#siteUrl').value || '').trim(); if (v && !/^https?:\/\//.test(v)) { toast('Use a full address starting with https://'); break; } store.set('scavengers-codex.siteUrl', v || null); CFG.siteUrl = v || CFG.siteUrl0 || null; toast(v ? 'Links and QR codes now point there' : 'Site address cleared'); rerender(); break; }
    case 'pinlocal': { const v = ($('#newPin').value || '').trim(); if (v.length < 3) { toast('Use at least 3 characters'); break; } store.set('scavengers-codex.localPin', pinHash(v)); store.set('scavengers-codex.dmUnlocked', pinHash(v)); DMS.newPin = ''; toast('PIN set on this device'); rerender(); break; }
    case 'pinclear': store.set('scavengers-codex.localPin', null); toast('Device PIN removed'); rerender(); break;
    case 'lockdm': store.set('scavengers-codex.dmUnlocked', null); dmSession = false; setMode('player'); toast('Locked. Switching back needs the PIN'); location.hash = '#/'; break;
    case 'rollyield': { const inp = document.querySelector(`[data-hman="yield"][data-i="${el.dataset.i}"]`); if (inp) { inp.value = rollDice(el.dataset.dice); inp.classList.add('flash'); setTimeout(() => inp.classList.remove('flash'), 500); evalHarvest(); } break; }
    case 'dmtab': DMS.tab = el.dataset.tab; rerender(); break;
    case 'hbcheck': case 'hbuse': case 'hbdl': case 'hbrm': hbAct(el.dataset.act, el); break;
    case 'dmforage': rollForage(); rerender(); break;
    case 'dmtrader': rollTrader(); rerender(); break;
    case 'dmdrops': rollDrops(); rerender(); break;
    case 'fightyield': { const r = fightRows()[+el.dataset.i]; if (!r) break; DMS.fight[r.key + '|y'] = rollDiceN(r.h.dice, r.n); const inp = document.querySelector(`[data-fk="y"][data-i="${el.dataset.i}"]`); if (inp) { inp.value = DMS.fight[r.key + '|y']; inp.classList.add('flash'); setTimeout(() => inp.classList.remove('flash'), 500); } evalFight(); break; }
    case 'fightroll': {
      const saved = store.get(SKILL_KEY, {}); document.querySelectorAll('[data-fskill]').forEach(x => { saved[x.dataset.fskill] = parseInt(x.value, 10) || 0; }); store.set(SKILL_KEY, saved);
      fightRows().forEach((r, i) => { DMS.fight[r.key + '|t'] = d20() + (saved[r.h.skill] || 0); if (r.h.dice) DMS.fight[r.key + '|y'] = rollDiceN(r.h.dice, r.n); const a = document.querySelector(`[data-fk="t"][data-i="${i}"]`), b = document.querySelector(`[data-fk="y"][data-i="${i}"]`); if (a) a.value = DMS.fight[r.key + '|t']; if (b) b.value = DMS.fight[r.key + '|y'] ?? ''; });
      evalFight(); break;
    }
    case 'fgyield': { const r = DMS.forage && DMS.forage.rows[+el.dataset.i]; if (!r) break; DMS.fg[el.dataset.i + '|y'] = rollDice(r.g.dice); const inp = document.querySelector(`[data-gk="y"][data-i="${el.dataset.i}"]`); if (inp) { inp.value = DMS.fg[el.dataset.i + '|y']; inp.classList.add('flash'); setTimeout(() => inp.classList.remove('flash'), 500); } evalForage(); break; }
    case 'fgenc': case 'fgencx': case 'fgguard': {
      const F = DMS.forage, r = F && F.rows[+el.dataset.i]; if (!r) break;
      if (act === 'fgencx') { r.enc = null; r.dismissed = true; }
      else if (act === 'fgenc') { r.enc = pickFoe(r.g, F.env, DMS.lvl, r.enc) || r.enc; r.dismissed = false; }
      else r.guard = pickGuard(r.g, r.guard);
      rerender(); break;
    }
    case 'fgroll': {
      const F = DMS.forage; if (!F) break; const saved = store.get(SKILL_KEY, {}); document.querySelectorAll('[data-gskill]').forEach(x => { saved[x.dataset.gskill] = parseInt(x.value, 10) || 0; }); store.set(SKILL_KEY, saved);
      const adv = ($('#fgAdv') || {}).checked; DMS.adv = !!adv;
      F.rows.forEach((r, i) => { const a = d20(), b = d20(); DMS.fg[i + '|t'] = (adv ? Math.max(a, b) : a) + (saved[r.g.skill] || 0); if (r.g.dice) DMS.fg[i + '|y'] = rollDice(r.g.dice); const x = document.querySelector(`[data-gk="t"][data-i="${i}"]`), y = document.querySelector(`[data-gk="y"][data-i="${i}"]`); if (x) x.value = DMS.fg[i + '|t']; if (y && r.g.dice) y.value = DMS.fg[i + '|y']; });
      evalForage(); break;
    }
    case 'fgadd': {
      const out = DMS.fgOut || []; let n = 0;
      for (const r of out) { if (el.dataset.to === 'party') Party.add(r.id, r.q); else sat[r.id] = (sat[r.id] || 0) + r.q; n += r.q; }
      const met = DMS.forage.rows.filter(r => r.enc).map(r => r.enc.name);
      saveSat(); Party.note(`Foraged ${plural(n, 'find')} in ${DMS.forage.env.name} over ${plural(DMS.forage.rows.length, 'hour')}${met.length ? ` (met ${met.join(', ')})` : ''}${el.dataset.to === 'party' ? ' into the party satchel' : ''}`);
      toast(`Added ${plural(n, 'find')} to ${el.dataset.to === 'party' ? 'the party satchel' : 'your satchel'}`); ['#fgParty', '#fgMine'].forEach(k => { const b = $(k); if (b) b.disabled = true; }); break;
    }
    case 'fightadd': {
      const out = DMS.fightOut || []; let n = 0;
      for (const r of out) { if (el.dataset.to === 'party') Party.add(r.id, r.q); else sat[r.id] = (sat[r.id] || 0) + r.q; n += r.q; }
      saveSat(); const names = DMS.drops.map(d => `${d.n > 1 ? d.n + ' ' : ''}${D.monsters.get(d.id).name}`).join(', ');
      Party.note(`Harvested ${plural(n, 'part')} after the fight with ${names}${el.dataset.to === 'party' ? ' into the party satchel' : ''}`);
      toast(`Added ${plural(n, 'part')} to ${el.dataset.to === 'party' ? 'the party satchel' : 'your satchel'}`); ['#fightParty', '#fightMine'].forEach(k => { const b = $(k); if (b) b.disabled = true; }); break;
    }
    case 'fightcards': { const sh = cardSheet(); let n = 0; for (const d of DMS.drops) if (!sh.some(c => c.ty === 'C' && c.id === d.id)) { sh.push({ ty: 'C', id: d.id, text: handoutText([['C', d.id]]) }); n++; } store.set(PRINT_KEY, sh); toast(n ? `${plural(n, 'card')} added. Open them under Handouts` : 'Those cards are already on the sheet'); break; }
    case 'fightbundle': { for (const d of DMS.drops) if (!DMS.bundle.some(x => x[0] === 'C' && x[1] === d.id)) DMS.bundle.push(['C', d.id]); DMS.tab = 'handouts'; rerender(); break; }
    case 'fightadd1': { const d = DMS.drops.find(x => x.id === id); if (d) d.n++; else DMS.drops.push({ id, n: 1 }); toast(`In the fight: ${DMS.drops.map(x => `${x.n}× ${D.monsters.get(x.id).name}`).join(', ')}. Harvest it under DM tools → After the fight`); break; }
    case 'fightclear': { DMS.drops = []; DMS.fight = {}; DMS.fightOut = []; rerender(); break; }
    case 'dropinc': { const d = DMS.drops.find(x => x.id === id); if (d) d.n++; rerender(); break; }
    case 'dropdec': { const d = DMS.drops.find(x => x.id === id); if (d) { d.n--; if (d.n <= 0) DMS.drops = DMS.drops.filter(x => x !== d); } rerender(); break; }
    case 'dmforageadd': case 'dmdropsadd': {
      const rows = act === 'dmforageadd' ? (DMS.forage ? DMS.forage.rows.filter(r => r.q > 0 && !r.guard).map(r => ({ id: r.t.id, q: r.q })) : []) : (DMS.dropOut ? DMS.dropOut.rows.filter(r => r.q > 0).map(r => ({ id: r.t.id, q: r.q })) : []);
      let n = 0; for (const r of rows) { if (el.dataset.to === 'party') Party.add(r.id, r.q); else sat[r.id] = (sat[r.id] || 0) + r.q; n += r.q; }
      saveSat(); if (el.dataset.to === 'party' && n) Party.note(`Added ${plural(n, 'part')} from ${act === 'dmforageadd' ? 'a foraging trip' : 'the hunt'}`);
      toast(`Added ${plural(n, 'part')} to ${el.dataset.to === 'party' ? 'the party satchel' : 'your satchel'}`); el.disabled = true; break;
    }
    case 'teach': { const on = !Party.learned.has(id); Party.teach(id, on); if (on) Party.note(`The party learned the formula for ${D.things.get(id).name}`); toast(on ? 'Marked as learned on this device only. Use Share with players to send it to your players' : 'Formula removed on this device'); break; }
    case 'learn': Party.teach(id, true); Party.note(`The party learned the formula for ${D.things.get(id).name}`); toast('Formula learned'); break;
    case 'addroll': {
      if (!lastRoll) break; let n = 0; const toParty = el.dataset.to === 'party';
      for (const r of lastRoll) if (r.q) { if (toParty) Party.add(r.t.id, r.q); else sat[r.t.id] = (sat[r.t.id] || 0) + r.q; n += r.q; }
      saveSat(); if (n) Party.note(`Harvested ${plural(n, 'part')} from a ${D.monsters.get(($('#roller') || { dataset: {} }).dataset.mon)?.name || 'creature'}${toParty ? ' into the party satchel' : ''}`);
      toast(`Added ${plural(n, 'part')} to ${toParty ? 'the party satchel' : 'your satchel'}`);
      document.querySelectorAll('#addRollBtn,#addRollParty').forEach(b => { b.disabled = true; }); break;
    }
    case 'craft': {
      const t = D.things.get(id);
      if (!known(t)) { toast('Your party has not learned this formula yet'); break; }
      const a = allocate(t.recipe, usable());
      if (!a.ok) { toast('Some parts are missing'); break; }
      let fromParty = 0; const parts = [];
      for (const s of a.slots) for (const [pid, q] of s.used) { const mine = Math.min(sat[pid] || 0, q); const p = consume(pid, q); fromParty += p; parts.push([pid, mine, p]); }
      saveSat();
      Party.projects.push({ uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), id, need: workHours(t.recipe.time), done: 0, parts, at: Party.clock });
      Party.note(`Started crafting ${t.name}${fromParty ? ` (with ${plural(fromParty, 'part')} from the party satchel)` : ''}`); Party.save();
      toast(`${t.name} is on the workbench. Track it in the Satchel.`); rerender(); break;
    }
    case 'projwork': { const p = Party.projects.find(x => x.uid === el.dataset.uid); if (!p) break; p.done = Math.min(p.need, p.done + +el.dataset.h); Party.save(); rerender(); break; }
    case 'projdone': {
      const i = Party.projects.findIndex(x => x.uid === el.dataset.uid); if (i < 0) break; const p = Party.projects[i], t = D.things.get(p.id);
      Party.projects.splice(i, 1); sat[p.id] = (sat[p.id] || 0) + ((t.recipe && t.recipe.yields) || 1); saveSat();
      Party.note(`Finished crafting ${t.name}`); Party.save(); toast(`${t.name} is finished and in your satchel`); rerender(); break;
    }
    case 'projdrop': {
      if (!el.dataset.confirm) { el.dataset.confirm = '1'; el.textContent = 'Tap again to abandon'; setTimeout(() => { if (el.isConnected) { delete el.dataset.confirm; el.textContent = 'Abandon'; } }, 3000); break; }
      const i = Party.projects.findIndex(x => x.uid === el.dataset.uid); if (i < 0) break; const p = Party.projects[i];
      Party.projects.splice(i, 1);
      if (!p.done) { for (const [pid, mine, fromP] of p.parts) { if (mine) sat[pid] = (sat[pid] || 0) + mine; if (fromP) Party.add(pid, fromP); } saveSat(); toast('Abandoned. No work was done, so the parts are back in the satchels'); }
      else toast('Abandoned. The parts were already bound into the work and are lost');
      Party.note(`Abandoned crafting ${D.things.get(p.id).name}`); Party.save(); rerender(); break;
    }
    case 'gadd': { Party.beds.push({ uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), site: el.dataset.site, p: null }); Party.note(`Added a ${SITES[el.dataset.site].name.toLowerCase()} to the garden`); Party.save(); rerender(); break; }
    case 'gdel': case 'guproot': {
      if (!el.dataset.confirm) { el.dataset.confirm = '1'; el.textContent = 'Tap again'; setTimeout(() => { if (el.isConnected) { delete el.dataset.confirm; el.textContent = el.dataset.act === 'gdel' ? 'Remove bed' : 'Uproot'; } }, 3000); break; }
      const i = Party.beds.findIndex(b => b.uid === el.dataset.uid); if (i < 0) break;
      if (el.dataset.act === 'gdel') Party.beds.splice(i, 1); else { Party.beds[i].p = null; Party.beds[i].last = 'Uprooted.'; }
      Party.save(); rerender(); break;
    }
    case 'gplant': { const b = Party.beds.find(x => x.uid === el.dataset.uid), v = ($('#gsel-' + el.dataset.uid) || {}).value; if (b && v && plantInto(b, v)) toast(`Planted ${D.things.get(v).name}`); rerender(); break; }
    case 'gplantid': { const g = D.grow.get(id), b = Party.beds.find(x => !x.p && bedFits(x.site, g)); if (b && plantInto(b, id)) toast(`Planted a cutting of ${D.things.get(id).name}. Follow it in the Garden`); rerender(); break; }
    case 'gtend': {
      const b = Party.beds.find(x => x.uid === el.dataset.uid); if (!b || !b.p) break;
      const t = D.things.get(b.p.id), dc = growDC(t.id); let tot, nat = null;
      if (el.dataset.roll) { const bonus = parseInt(($('#gBonus') || {}).value, 10) || 0; store.set('scavengers-codex.natureBonus', bonus); nat = d20(); tot = nat + bonus; }
      else { const v = ($('#gt-' + b.uid) || {}).value; if (v === '' || v == null || isNaN(+v)) { toast('Type in the check total first'); break; } tot = +v; }
      const st = bedState(b); if (!st.due) { toast('It doesn\'t need tending yet'); break; }
      const diff = tot - dc; let msg, back = 0;
      if (diff >= 10 || nat === 20) { b.p.bonus = (b.p.bonus || 0) + 1; msg = `Thriving: +1 to the harvest (now +${b.p.bonus}).`; }
      else if (diff >= 0) msg = 'Healthy and on schedule.';
      else if (diff > -5) { back = 48; msg = 'Struggling: growth is set back 2 days.'; }
      else {
        back = 48; const ev = Math.floor(Math.random() * GARDEN_EVENTS.length);
        if (ev === 0) b.p.blight = true;
        if (ev === 2 && b.site === 'plot') back += 48;
        if (ev === 5) back += 168;
        msg = `Trouble: growth is set back ${fmtHours(back)}, and <b>${esc(GARDEN_EVENTS[ev])}</b>`;
      }
      b.p.grown = Math.max(0, st.point - back); b.p.since = Party.clock; b.p.tends++;
      b.last = `${nat != null ? `Rolled ${nat} → ${tot}. ` : `Total ${tot}. `}${msg}`;
      b.p.log = [...(b.p.log || []), `Week ${b.p.tends}: ${b.last}`].slice(-12);
      Party.note(`Tended the ${t.name}: ${msg.replace(/<[^>]+>/g, '')}`); Party.save(); rerender(); break;
    }
    case 'gharvest': {
      const b = Party.beds.find(x => x.uid === el.dataset.uid); if (!b || !b.p) break;
      const g = D.grow.get(b.p.id), t = D.things.get(b.p.id);
      if (!(bedState(b) || {}).ready) break;
      let q = rollDice(g.yield) + (b.p.bonus || 0); if (b.p.blight) q = Math.floor(q / 2);
      if (q) { sat[t.id] = (sat[t.id] || 0) + q; saveSat(); }
      b.last = q ? `Harvested ${q} × ${esc(t.name)} into your satchel${b.p.bonus ? ` (including +${b.p.bonus} for thriving)` : ''}.${b.p.blight ? ' The blight took half.' : ''}` : 'The blight took the whole harvest.';
      if (g.regrows) b.p = { id: t.id, grown: 0, since: Party.clock, need: g.days * 24, tends: 0, bonus: 0, n: (b.p.n || 0) + 1, log: [] }; else { b.p = null; b.last += ' The plant is spent: replant from a cutting.'; }
      Party.note(`Harvested ${q} × ${t.name} from the garden`); Party.save(); toast(q ? `Harvested ${q} × ${t.name}` : 'The blight took the whole harvest'); rerender(); break;
    }
    case 'gevent': { const o = $('#gEventOut'); if (o) o.innerHTML = `<b>${esc(GARDEN_EVENTS[Math.floor(Math.random() * GARDEN_EVENTS.length)])}</b>`; break; }
    case 'clock': { Party.clock = Math.max(0, Party.clock + +el.dataset.h); Party.save(); rerender(); break; }
    case 'preserve': {
      const t = D.things.get(id), P = PRESERVE[t.perish], s0 = spoilInfo(t); if (!P || !s0) break;
      if (P.need) { const have = usable()[P.need] || 0; if (!have) { toast(`You need ${(D.things.get(P.need) || {}).name || P.need} for that`); break; } consume(P.need, 1); saveSat(); }
      for (const x of batchesOf(id)) if (!x.pres && batchLeft(t, x).left > 0) { x.pres = true; x.at = Party.clock; }
      Party.save(); toast(`${t.name}: ${P.done.toLowerCase()}`); rerender(); break;
    }
    case 'toss': {
      const t = D.things.get(id), bs = batchesOf(id); let n = 0;
      Party.stamps[id] = bs.filter(x => { if (batchLeft(t, x).left <= 0) { n += x.q; return false; } return true; });
      const mine = Math.min(sat[id] || 0, n); if (mine) sat[id] -= mine; if (n - mine) Party.add(id, -(n - mine)); saveSat();
      Party.save(); toast(`Threw out ${n} spoiled ${t.name}`); rerender(); break;
    }
    case 'clear': if (el.dataset.confirm) { sat = {}; saveSat(); rerender(); } else { el.dataset.confirm = '1'; el.innerHTML = 'Tap again to empty'; setTimeout(() => { if (el.isConnected) { delete el.dataset.confirm; el.innerHTML = svg('trash') + 'Empty satchel'; } }, 3000); } break;
    case 'sample': { for (const [k, v] of [['dire-wolf-pelt', 1], ['whisperleaf-vine', 3], ['cloak', 1], ['sprite-essence', 1], ['spider-silk-thread', 1], ['healers-moss', 3], ['glass-vial', 2], ['alchemical-base', 2], ['stone-giant-heartstone', 1], ['maul', 1]]) if (D.things.has(k)) sat[k] = v; saveSat(); rerender(); break; }
    case 'export': { const b = $('#ioBox'); b.hidden = false; $('#ioText').value = JSON.stringify({ satchel: sat }, null, 1); break; }
    case 'import': { const b = $('#ioBox'); b.hidden = false; $('#ioText').value = ''; $('#ioText').placeholder = 'Paste exported satchel JSON here, or open a file.'; $('#ioText').focus(); break; }
    case 'doimport': doImport(); break;
    case 'copy': { const txt = $('#ioText'); const v = txt.value; const fallback = () => { txt.select(); toast('Selected — press Ctrl/Cmd+C'); }; try { navigator.clipboard.writeText(v).then(() => toast('Copied'), fallback); } catch (e) { fallback(); } break; }
    case 'download': { try { const blob = new Blob([$('#ioText').value], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'satchel.json'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { toast('Download blocked here — use Copy instead'); } break; }
  }
});
document.addEventListener('toggle', ev => { if (ev.target.id === 'roller') store.set('scavengers-codex.rollerOpen', ev.target.open); }, true);
document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.dataset.act === 'bdbuy') { bdBuy = el.checked; rerender(); return; }
  if (el.id === 'fcNat1') { const v = $('#fcTotal').value, b = document.querySelector('[data-act=fcroll]'); if (b && v !== '') doFinalCheck(D.things.get(b.dataset.id), v); return; }
  if (el.dataset.dm) { const k = el.dataset.dm; DMS[k] = el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' || el.type === 'text' || k === 'siteUrl' ? el.value : (parseInt(el.value, 10) || 0); if (k === 'hours') DMS.hours = Math.min(12, Math.max(1, DMS.hours)); if (k === 'lvl') DMS.lvl = Math.min(20, Math.max(1, DMS.lvl)); if (k === 'spec') { DMS.theme = ''; rerender(); } return; }
  if (el.dataset.hoty !== undefined) { DMS.bundle[+el.dataset.hoty][0] = el.value; rerender(); return; }
  if (el.dataset.pl) { DMS.player = DMS.player || { ...CFG.player }; if (el.dataset.pl === 'startPlayer') DMS.startPlayer = el.checked; else if (el.dataset.pl === 'spoilage') DMS.spoilage = el.checked; else DMS.player[el.dataset.pl] = el.value; rerender(); return; }
  if (el.id === 'newPin') { DMS.newPin = el.value; rerender(); return; }
  if (el.dataset.act === 'useparty') { useParty = el.checked; store.set('scavengers-codex.useParty', useParty); rerender(); return; }
  if (el.dataset.act === 'pqty') { Party.set(el.dataset.id, parseInt(el.value, 10) || 0); return; }
  if (el.dataset.act === 'qty') { sat[el.dataset.id] = Math.max(0, parseInt(el.value, 10) || 0); saveSat(); rerender(); return; }
  if (el.dataset.f && el.tagName === 'SELECT') { F[el.dataset.f][el.dataset.k] = el.value; listBlock.state[el.dataset.f] = PAGE; rerender(); }
});
let fTimer;
document.addEventListener('input', ev => {
  const el = ev.target;
  if (el.dataset.hman) { evalHarvest(); return; }
  if (el.id === 'fcTotal') { const b = document.querySelector('[data-act=fcroll]'); if (b) doFinalCheck(D.things.get(b.dataset.id), el.value); return; }
  if (el.dataset.f && el.dataset.k === 'q') {
    F[el.dataset.f].q = el.value; clearTimeout(fTimer);
    fTimer = setTimeout(() => { const pos = el.selectionStart; rerender(); const n = document.getElementById(el.id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } } }, 160);
  }
});
document.addEventListener('keydown', ev => {
  if (ev.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { ev.preventDefault(); $('#q').focus(); }
});

/* ================================================================ theme */
function initTheme() {
  const saved = store.get('scavengers-codex.theme', null);
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next); store.set('scavengers-codex.theme', next);
  });
}

/* ================================================================ boot */
async function boot() {
  initTheme();
  try {
    await loadConfig();
    const raw = await loadRaw();
    try { buildIndex(raw.concat(localPacks().map(p => p.data))); }
    catch (e) { hbLoadError = e.message || String(e); buildIndex(raw); }
    mode = pinSet() && !dmUnlocked() ? 'player' : (store.get('scavengers-codex.mode', null) || (CFG.startInPlayerView ? 'player' : 'dm'));
  }
  catch (e) {
    $('#view').innerHTML = `<div class="page"><h1>Couldn't load the codex data</h1><p class="lede">If you opened <span class="mono">index.html</span> straight from your disk, your browser blocks the data files. Serve the folder instead (for example <span class="mono">python3 -m http.server</span>) or use the standalone file.</p><p class="small muted">${esc(e.message)}</p></div>`;
    return;
  }
  Party.init();
  saveSat();
  const mb = $('#modeBtn'); if (mb) { mb.addEventListener('click', () => requestMode(mode === 'dm' ? 'player' : 'dm')); syncModeBtn(); }
  const q = $('#q');
  if (matchMedia('(max-width: 820px)').matches) q.placeholder = 'Search the codex…';
  wireTypeahead(q, $('#suggest'), (e, text) => {
    if (!e && /^\s*sc-/i.test(text)) { location.hash = '#/journal/' + encodeURIComponent(text.trim()); q.value = ''; q.blur(); return; }
    if (e) location.hash = linkOf(e.o); else if (text.trim()) location.hash = '#/search?q=' + encodeURIComponent(text.trim()); q.blur();
  }, null, true);
  window.addEventListener('hashchange', route);
  route();
}
boot();
})();

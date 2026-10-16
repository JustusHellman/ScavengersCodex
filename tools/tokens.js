#!/usr/bin/env node
/*
 * Builds tokens.json: one round battle-map token picture (SVG) per kind of creature, drawn by
 * plates.js. DnDocs reads it (as data, it never runs codex code) for creatures added from the codex.
 *   node tools/tokens.js
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
require(path.join(root, 'plates.js'));
const types = new Set();
const man = JSON.parse(fs.readFileSync(path.join(root, 'data', 'manifest.json'), 'utf8'));
for (const f of man.files) for (const m of JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8')).monsters || []) if (m.type) types.add(m.type);
for (const t of ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead']) types.add(t);
const out = { v: 1, note: "Token pictures drawn by the codex's plates.js (original artwork). Built by tools/tokens.js.", types: {} };
for (const t of [...types].sort()) out.types[t] = window.CodexPlates.token({ id: t, type: t }, { ink: '#2a1c14', bg: '#efe3c6', ring: '#9a7428' });
fs.writeFileSync(path.join(root, 'tokens.json'), JSON.stringify(out));
console.log(`wrote tokens.json: ${Object.keys(out.types).length} kinds of creature`);

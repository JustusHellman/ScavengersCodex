// Checks that homebrew.js (in the browser) agrees with tools/validate.py. Run:  node tools/test_homebrew.js
const fs = require('fs'), path = require('path'), cp = require('child_process');
const HB = require('../homebrew.js');
const ROOT = path.join(__dirname, '..'), DATA = path.join(ROOT, 'data');
const man = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
const base = man.files.map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')));
const ctx = { things: new Map(), monsters: new Map(), envs: new Map() };
for (const p of base) {
  for (const k of ['materials', 'items']) for (const t of p[k] || []) ctx.things.set(t.id, t);
  for (const m of p.monsters || []) ctx.monsters.set(m.id, m);
  for (const e of p.environments || []) if (!e.extend) ctx.envs.set(e.id, e);
}
let fail = 0;
const ok = (c, msg) => { if (!c) { fail++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const clone = o => JSON.parse(JSON.stringify(o));
const own = { things: new Set(), monsters: new Set() };
const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'homebrew', 'rooted-city.json'), 'utf8'));
const v = (p, o = own) => HB.validate(p, ctx, o);

ok(v(real).errors.length === 0, 'the shipped pack passes');
ok(v(clone(real)).counts.monsters === real.monsters.length, 'counts match');

const mut = [
  ['duplicate material id', p => { p.materials.push(clone(p.materials[0])); }],
  ['id clashes with the codex', p => { p.materials[0].id = [...ctx.things.keys()][0]; }],
  ['bad id format', p => { p.materials[0].id = 'Bad_ID'; }],
  ['unknown tag', p => { p.materials[0].tags = ['nonsense-tag']; }],
  ['bad tier', p => { p.materials[0].tier = 'epic'; }],
  ['recipe uses unknown material', p => { p.items[0].recipe.components[1].m = 'no-such-thing'; }],
  ['monster harvests unknown material', p => { p.monsters[0].harvest[0].m = 'no-such-thing'; }],
  ['bad harvest dice', p => { const h = p.monsters[0].harvest.find(x => x.dice); if (h) h.dice = 'lots'; else p.monsters[0].harvest[0].dice = 'lots'; }],
  ['bad monster size', p => { p.monsters[0].size = 'Enormous'; }],
  ['extension of unknown place', p => { p.environments[0].id = 'nowhere'; }],
  ['not an object', p => 'x'],
];
for (const [name, f] of mut) {
  const p = clone(real); const r = f(p);
  const res = v(r === undefined ? p : r);
  ok(res.errors.length > 0, `rejects: ${name}`);
}

// Parity: same mutations through validate.py via add_homebrew.py --dry-run
const IDX = path.join(ROOT, 'homebrew', 'index.json'), man0 = fs.readFileSync(IDX, 'utf8');
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'hb-'));
for (const [name, f] of mut.slice(0, -1)) {
  const p = clone(real); f(p);
  const file = path.join(tmp, 'm.json'); fs.writeFileSync(file, JSON.stringify(p));
  const py = cp.spawnSync('python3', [path.join(ROOT, 'tools', 'add_homebrew.py'), file, '--name', 'rooted-city', '--replace', '--dry-run'], { cwd: ROOT, encoding: 'utf8' });
  ok(py.status !== 0, `validate.py also rejects: ${name}`);
}
const after = fs.readFileSync(IDX, 'utf8');
ok(after === man0 && JSON.stringify(JSON.parse(fs.readFileSync(path.join(ROOT, 'homebrew', 'rooted-city.json'), 'utf8'))) === JSON.stringify(real), 'dry runs left the homebrew folder untouched');
console.log(fail ? `\n${fail} FAILED` : '\nall good');
process.exit(fail ? 1 : 0);

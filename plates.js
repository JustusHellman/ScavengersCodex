/* The Scavenger's Codex — procedural "specimen plates".
   window.CodexPlates.plate(entity, { caption }) -> inline <svg> string (viewBox 0 0 320 220).
   Everything is drawn from primitives, seeded by entity.id, themed through CSS custom properties. */
(function () {
  'use strict';
  const PI = Math.PI, TAU = PI * 2;
  let COUNTER = 0;

  /* ------------------------------------------------------------------ utils */
  const n = v => Math.round(v * 10) / 10;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const mix = (c, p, b = 'var(--surface)') => `color-mix(in srgb, ${c} ${p}%, ${b})`;
  const INK = 'var(--ink)', SURF = 'var(--surface)', BRASS = 'var(--brass)', PALE = 'color-mix(in srgb, #fff 72%, var(--surface))';
  const WOOD = mix(BRASS, 38), METAL = mix('var(--muted)', 22), DARKM = mix('var(--muted)', 45);
  const AC = { fire: 'var(--t-legendary)', cold: 'var(--t-rare)', lightning: 'var(--warn)', thunder: 'var(--t-very-rare)', acid: '#9DB23A', poison: 'var(--ok)', necrotic: 'var(--ink)', radiant: BRASS, arcane: 'var(--t-very-rare)', fey: 'var(--t-very-rare)', fiend: 'var(--danger)', psychic: 'var(--t-very-rare)', earth: BRASS, water: 'var(--t-rare)', air: 'var(--muted)' };

  /* primitives */
  const P = (d, a = '') => `<path d="${d}" ${a}/>`;
  const C = (x, y, r, a = '') => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" ${a}/>`;
  const E = (x, y, rx, ry, a = '') => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" ${a}/>`;
  const R = (x, y, w, h, a = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${a}/>`;
  const L = (x1, y1, x2, y2, a = '') => `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" ${a}/>`;
  const G = (t, body, a = '') => `<g transform="${t}" ${a}>${body}</g>`;
  const M = pts => 'M' + pts.map(p => n(p[0]) + ' ' + n(p[1])).join('L');
  const Z = pts => M(pts) + 'Z';
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  function smooth(pts, closed) {
    const k = pts.length, q = (p, m) => `Q${n(p[0])} ${n(p[1])} ${n(m[0])} ${n(m[1])}`;
    if (closed) { let s = 'M' + mid(pts[k - 1], pts[0]).map(n).join(' '); for (let i = 0; i < k; i++) s += q(pts[i], mid(pts[i], pts[(i + 1) % k])); return s + 'Z'; }
    let s = 'M' + pts[0].map(n).join(' '); for (let i = 1; i < k - 1; i++) s += q(pts[i], i === k - 2 ? pts[k - 1] : mid(pts[i], pts[i + 1])); return k === 2 ? s + 'L' + pts[1].map(n).join(' ') : s;
  }
  const qpt = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
  const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const TH = 'fill="none" stroke-width="1"', NS = 'stroke="none"';
  const star = (x, y, r, k = 4, inner = .38) => { const p = []; for (let i = 0; i < k * 2; i++) p.push(polar(x, y, i % 2 ? r * inner : r, i * PI / k - PI / 2)); return Z(p); };
  /* a tapered stroke along a quadratic curve (limbs, tails, tentacles, roots) */
  function taper(a, b, c, w0, w1, col, steps = 8) {
    let s = ''; for (let i = 0; i < steps; i++) { const p = qpt(a, b, c, i / steps), q = qpt(a, b, c, (i + 1) / steps); s += L(p[0], p[1], q[0], q[1], `stroke="${col}" stroke-width="${n(w0 + (w1 - w0) * i / (steps - 1))}"`); }
    return s;
  }
  const limb = (pts, w, a = '') => P(smooth(pts), `fill="none" stroke-width="${w}" ${a}`);

  function makeCtx(ent) {
    const id = String(ent.id || ent.name || 'x'), seed = hash(id), rnd = mulberry(seed);
    const X = { seed, R: rnd, defs: '', key: id.replace(/[^a-z0-9-]/gi, '').slice(0, 40) + '-' + (++COUNTER) };
    X.r = (a, b) => a + (b - a) * rnd(); X.ri = (a, b) => Math.floor(a + (b - a + 1) * rnd());
    X.pick = a => a[Math.floor(rnd() * a.length)]; X.chance = p => rnd() < p; X.uid = s => `cp-${s}-${X.key}`;
    return X;
  }
  const glowDef = (X, name, col, o) => { const g = X.uid(name); X.defs += `<radialGradient id="${g}"><stop offset="0" stop-color="${col}" stop-opacity="${o}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`; return `url(#${g})`; };
  const clipDef = (X, name, d) => { const c = X.uid(name); X.defs += `<clipPath id="${c}"><path d="${d}"/></clipPath>`; return `clip-path="url(#${c})"`; };
  const rot = (pts, a, dx = 0, dy = 0) => pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a) + dx, x * Math.sin(a) + y * Math.cos(a) + dy]);

  /* ============================================================ SHARED DRAWINGS */
  function flask(X, shape, liq, level, opt = {}) {
    const D = {
      round: ['M-9 -52L-9 -22.9A38 38 0 1 0 9 -22.9L9 -52Z', 'M-26 4Q-28 26 -14 40'],
      cone: ['M-9 -52L-9 -18L-40 43Q-42 50 -35 50L35 50Q42 50 40 43L9 -18L9 -52Z', 'M-14 -6L-30 36'],
      vial: ['M-13 -56L-13 36A13 13 0 0 0 13 36L13 -56Z', 'M-7 -40L-7 30'],
      square: ['M-8 -52L-8 -31Q-30 -27 -30 -6L-30 40Q-30 50 -20 50L20 50Q30 50 30 40L30 -6Q30 -27 8 -31L8 -52Z', 'M-22 -4L-22 36'],
      gourd: ['M-7 -52L-7 -27C-46 -10 -40 50 0 50C40 50 46 -10 7 -27L7 -52Z', 'M-24 4Q-26 26 -12 40']
    }[shape];
    const top = shape === 'vial' ? -56 : -52, cw = shape === 'vial' ? 16 : 12, clip = clipDef(X, 'fl', D[0]);
    let s = P(D[0], `fill="${SURF}" fill-opacity=".75" stroke="none"`);
    s += `<g ${clip}>` + R(-60, level, 120, 120, `fill="${liq}" fill-opacity=".5" ${NS}`) + L(-60, level, 60, level, `stroke="${liq}" stroke-width="1.4"`);
    for (let i = 0; i < 4; i++) s += C(X.r(-14, 14), level + X.r(8, 40), X.r(1.2, 3), `fill="none" stroke="${PALE}" stroke-width=".9"`);
    s += '</g>' + P(D[0], 'fill="none"') + P(D[1], `fill="none" stroke="${PALE}" stroke-width="3" stroke-opacity=".9"`);
    s += R(-cw, top - 11, cw * 2, 12, `rx="2" fill="${mix(BRASS, 45)}"`) + R(-cw - 1.5, top - 1, cw * 2 + 3, 4, `rx="2" fill="${SURF}"`);
    if (opt.label !== false) {
      const lx = X.r(28, 40), ly = X.r(-38, -24);
      s += P(`M${cw * .7} ${top + 6}Q${lx - 6} ${top + 4} ${lx} ${ly}`, TH) + G(`translate(${n(lx)} ${n(ly)}) rotate(${n(X.r(-20, 15))})`,
        P('M0 -4L22 -4L26 0L22 4L0 4Z', `fill="${mix(BRASS, 18)}" stroke-width="1"`) + C(4, 0, 1.3, TH) + L(8, 0, 21, 0, 'stroke-width=".7" stroke="var(--muted)"') + (opt.mark ? P('M12 -2.5L17 2.5M17 -2.5L12 2.5', 'stroke="var(--danger)" stroke-width="1"') : ''));
    }
    return s;
  }
  function feather(X, len, wid, bend, col) {
    const pts = [], hl = len / 2;
    const at = t => [bend * 4 * t * (1 - t), hl - t * len];
    const wf = t => t < .16 ? 0 : wid * Math.pow(Math.sin(PI * (t - .16) / .84), .75) * (t > .5 ? 1 : 1 - (.5 - t) * .5);
    const left = [], right = [];
    for (let i = 0; i <= 16; i++) { const t = .16 + .84 * i / 16, [x, y] = at(t), w = wf(t) * (1 + (i % 5 === 2 ? -.18 : 0)); left.push([x - w, y - w * .45]); right.push([x + w * .8, y - w * .4]); }
    let s = P(smooth([at(.14), ...left, at(1), ...right.reverse()], true), `fill="${col}"`);
    for (let i = 1; i < 16; i++) { const t = .16 + .84 * i / 16, [x, y] = at(t), w = wf(t) * .92; s += L(x, y, x - w, y - w * .45, 'stroke-width=".6" stroke-opacity=".55"') + L(x, y, x + w * .75, y - w * .38, 'stroke-width=".6" stroke-opacity=".55"'); }
    for (let i = 0; i < 4; i++) { const [x, y] = at(.17 + i * .02); s += P(`M${n(x)} ${n(y)}q${n(-6 - i * 2)} -2 ${n(-9 - i)} ${n(3 + i)}`, TH); }
    return s + P(smooth([at(0), at(.3), at(.6), at(1)]), 'fill="none" stroke-width="1.6"');
  }
  function gem(X, sc = 1) {
    const w = 50 * sc, tw = 26 * sc, gy = -6 * sc, ty = -28 * sc, cy = 46 * sc;
    let s = P(Z([[-tw, ty], [tw, ty], [w, gy], [0, cy], [-w, gy]]), `fill="${X.w2}"`);
    const gp = [-w, -w * .5, 0, w * .5, w];
    for (const x of gp) s += L(x, gy, 0, cy, TH);
    s += L(-w, gy, w, gy, TH) + P(`M${-tw} ${ty}L${-w * .5} ${gy}L${-tw * .3} ${ty}L0 ${gy}L${tw * .3} ${ty}L${w * .5} ${gy}L${tw} ${ty}`, TH);
    s += P(Z([[-tw * .7, ty + 2], [-tw * .2, ty + 2], [-w * .45, gy - 2]]), `fill="${SURF}" fill-opacity=".7" ${NS}`);
    return s + P(star(w * .7, ty - 6, 7 * sc), `fill="${PALE}" stroke-width=".8"`);
  }
  function amulet(X) {
    let s = ''; for (let i = 0; i <= 14; i++) { const a = PI * (.08 + .84 * i / 14), [x, y] = polar(0, -60, 58, PI - a); s += E(x, y + 10, 3.2, 2.2, `fill="none" stroke-width="1.1" transform="rotate(${n(-a * 57 + 90)} ${n(x)} ${n(y + 10)})"`); }
    s += C(0, 6, 5, 'fill="none"') + P('M0 10C-26 16 -30 52 0 66C30 52 26 16 0 10Z', `fill="${mix(BRASS, 40)}"`) + P('M0 20C-15 26 -17 48 0 56C17 48 15 26 0 20Z', `fill="${X.w2}" stroke-width="1.2"`);
    return s + P('M-5 30Q-8 38 -4 44', `fill="none" stroke="${PALE}" stroke-width="2"`);
  }
  function orb(X, stand = true) {
    const g = glowDef(X, 'orb', X.c, .45);
    let s = C(0, -6, 60, `fill="${g}" ${NS}`) + (stand ? P('M-30 50L30 50L22 38L-22 38Z', `fill="${WOOD}"`) + P('M-18 38Q-24 20 -22 10M18 38Q24 20 22 10M0 38L0 26', `fill="none" stroke-width="3"`) : '');
    return s + C(0, -6, 38, `fill="${X.w}"`) + C(-4, -12, 20, `fill="${X.c}" fill-opacity=".18" ${NS}`) + P('M-26 -18A28 28 0 0 1 -8 -36', `fill="none" stroke="${PALE}" stroke-width="4"`) + E(0, -6, 38, 9, 'fill="none" stroke-width=".7" stroke-dasharray="2 3"');
  }

  /* ============================================================ MATERIALS */
  const MAT = {
    essence(X, t) {
      let s = C(0, 8, 76, `fill="${glowDef(X, 'es', X.c, .5)}" ${NS}`) + C(0, 8, 56, `fill="none" stroke="${X.c}" stroke-width=".8" stroke-dasharray="2 4"`);
      for (let i = 0; i < 16; i++) { const a = i * TAU / 16, [x1, y1] = polar(0, 8, 61, a), [x2, y2] = polar(0, 8, i % 2 ? 65 : 69, a); s += L(x1, y1, x2, y2, `stroke="${X.c}" stroke-width=".9"`); }
      if (t.includes('core')) {
        const k = X.r(-30, 30);
        return s + E(0, 8, 46, 12, `fill="none" stroke-width="1.2" transform="rotate(${n(k)} 0 8)"`) + C(0, 8, 28, `fill="${X.w2}"`) + P(star(0, 8, 18, 6, .5), `fill="${X.c}" fill-opacity=".45" stroke-width="1"`) + E(0, 8, 46, 12, `fill="none" stroke-width="1.2" stroke-dasharray="40 200" transform="rotate(${n(k + 180)} 0 8)"`) + E(0, 8, 40, 20, `fill="none" stroke-width=".8" transform="rotate(${n(k + 70)} 0 8)"`) + P('M-16 -6A20 20 0 0 1 -2 -14', `fill="none" stroke="${PALE}" stroke-width="3"`);
      }
      s += P('M-9 -46L-9 -25A34 34 0 1 0 9 -25L9 -46Z', `fill="${SURF}" fill-opacity=".7"`) + C(0, 10, X.r(14, 20), `fill="${X.c}" fill-opacity=".45" ${NS}`) + C(0, 10, 8, `fill="${SURF}" fill-opacity=".6" ${NS}`);
      for (let i = 0; i < 5; i++) s += C(X.r(-18, 18), X.r(-8, 30), X.r(.8, 2), `fill="${X.c}" ${NS}`);
      return s + P('M-22 -2A26 26 0 0 0 -16 28', `fill="none" stroke="${PALE}" stroke-width="3"`) + R(-12, -58, 24, 11, `rx="3" fill="${mix(BRASS, 45)}"`) + R(-13, -48, 26, 4, `rx="2" fill="${SURF}"`) + P('M-12 -53L12 -53', TH);
    },
    eye(X) {
      const lid = 'M-72 0Q0 -52 72 0Q0 52 -72 0Z', clip = clipDef(X, 'eye', lid), slit = X.chance(.45);
      let s = P(lid, `fill="${SURF}"`) + `<g ${clip}>` + C(0, 0, 27, `fill="${mix(X.c, 45)}"`);
      for (let i = 0; i < 18; i++) { const a = i * TAU / 18, [x1, y1] = polar(0, 0, 11, a), [x2, y2] = polar(0, 0, 25, a + .1); s += L(x1, y1, x2, y2, 'stroke-width=".6" stroke-opacity=".5"'); }
      s += (slit ? E(0, 0, 4, 22, `fill="${INK}"`) : C(0, 0, 10, `fill="${INK}"`)) + C(-9, -9, 4.5, `fill="${SURF}" ${NS}`);
      for (const sx of [-1, 1]) s += P(`M${sx * 70} 2q${-sx * 12} -2 ${-sx * 18} 6q${-sx * 4} 4 ${-sx * 12} 3`, 'fill="none" stroke="var(--danger)" stroke-width=".8" stroke-opacity=".7"');
      s += '</g>' + P(lid, 'fill="none" stroke-width="2"') + P('M-60 -8Q0 -58 60 -8', 'fill="none" stroke-width="1"');
      for (let i = 1; i < 10; i++) { const t = i / 10, [x, y] = qpt([-72, 0], [0, -52], [72, 0], t); s += L(x, y, x + (t - .5) * 14, y - 9, 'stroke-width="1.1"'); }
      return s;
    },
    heart(X, t) {
      if (t.includes('brain')) {
        const d = 'M-62 8C-66 -30 -30 -48 4 -46C40 -46 66 -26 60 4C56 26 30 30 10 26C-10 34 -54 34 -62 8Z', clip = clipDef(X, 'br', d);
        let s = P('M10 22Q16 44 8 58L22 58Q26 40 26 22Z', `fill="${X.w2}"`) + E(36, 26, 22, 13, `fill="${X.w2}"`) + P(d, `fill="${X.w}"`) + `<g ${clip}>`;
        for (let j = 0; j < 7; j++) { const y = -42 + j * 11, ph = X.r(0, 6); let pts = []; for (let x = -70; x <= 70; x += 7) pts.push([x, y + Math.sin(x * .22 + ph) * 5 + Math.sin(x * .09 + j) * 3]); s += P(smooth(pts), TH); }
        s += '</g>' + P('M-4 -44Q2 -10 -6 26', 'fill="none" stroke-width="1.4"');
        for (let i = 0; i < 4; i++) s += L(22 + i * 8, 16, 26 + i * 7, 36, TH);
        return s + P(d, 'fill="none" stroke-width="2"');
      }
      const tube = (d, w) => P(d, `fill="none" stroke="${INK}" stroke-width="${w + 3.6}"`) + P(d, `fill="none" stroke="${X.w2}" stroke-width="${w}"`);
      let s = tube(`M6 -20C4 -70 ${n(40 + X.r(0, 8))} -74 ${n(44 + X.r(0, 6))} -40`, 15) + tube('M-12 -18C-16 -40 -28 -52 -40 -56', 11) + tube(`M26 -22L${n(30 + X.r(0, 6))} -62`, 9) + tube('M-2 -28C-4 -60 -14 -70 -24 -74', 7);
      for (const [x, y, r] of [[44, -40, 7.5], [-40, -56, 5.5], [30, -62, 4.5], [-24, -74, 3.5]]) s += E(x, y, r, r * .45, `fill="${mix(X.c, 45)}" stroke-width="1"`);
      const d = 'M-10 -24C-44 -34 -62 -4 -52 20C-42 44 -8 58 8 70C20 52 50 34 50 4C50 -22 30 -34 10 -28C4 -30 -4 -30 -10 -24Z';
      return s + G(`rotate(${n(X.r(-14, -4))})`, P(d, `fill="${X.w}"`) + E(34, -18, 16, 12, `fill="${X.w2}" transform="rotate(-20 34 -18)"`) + P('M18 -24Q2 18 10 66', 'fill="none" stroke-width="1.3"') + P('M14 -4Q-8 8 -30 4M12 20Q28 24 40 12M-16 -18Q-34 -8 -40 12', 'fill="none" stroke="var(--danger)" stroke-width=".9" stroke-opacity=".65"') + P('M-42 -6Q-46 16 -32 34', `fill="none" stroke="${PALE}" stroke-width="3"`));
    },
    liquid(X, t) {
      const col = t.includes('venom') ? 'var(--ok)' : t.some(x => x === 'blood' || x === 'ichor') ? 'var(--danger)' : t.some(x => ['oil', 'sap', 'resin'].includes(x)) ? BRASS : X.c;
      return G(`rotate(${n(X.r(-6, 6))})`, flask(X, X.pick(['round', 'cone', 'vial', 'gourd']), col, X.r(-10, 22), { mark: t.includes('venom') }));
    },
    feather(X, t) {
      if (!t.includes('wing')) return G(`rotate(${n(X.r(25, 55))})`, feather(X, X.r(140, 170), X.r(15, 20), X.r(-12, 12), X.w));
      let s = ''; const k = X.ri(5, 7);
      for (let i = 0; i < k; i++) { const a = -62 + i * (70 / (k - 1)), ln = 124 - i * 9; s += G(`translate(-24 56) rotate(${n(a)}) translate(0 ${n(-ln / 2 + 8)})`, feather(X, ln, 12, 5, i % 2 ? X.w : X.w2)); }
      s += P('M-40 66C-40 28 -10 -4 30 -14C22 18 4 50 -16 70Z', `fill="${X.w2}"`);
      for (let i = 0; i < 6; i++) s += P(`M${-32 + i * 9} ${58 - i * 11}q10 4 14 12`, TH);
      return s;
    },
    tooth(X, t) {
      const fang = (L0, W, b, fill, ridges) => {
        const A = [-W / 2, 0], B = [W / 2, 0], T = [b, -L0], cv = b > 30, c1 = cv ? [-W / 2 - b * .1, -L0 * .95] : [-W / 2 + b * .1, -L0 * .6], c2 = cv ? [W / 2 + b * .05, -L0 * .55] : [W / 2 + b * .7, -L0 * .45];
        let s = P(`M${A}Q${c1} ${T}Q${c2} ${B}Q0 ${n(W * .5)} ${A}Z`.replace(/,/g, ' '), `fill="${fill}"`);
        for (let i = 1; i <= ridges; i++) { const u = i / (ridges + 1), p = qpt(A, c1, T, u), q = qpt(T, c2, B, 1 - u); s += P(`M${n(p[0])} ${n(p[1])}Q${n((p[0] + q[0]) / 2)} ${n((p[1] + q[1]) / 2 + 4)} ${n(q[0])} ${n(q[1])}`, TH); }
        const h1 = qpt(A, c1, T, .35), h2 = qpt(A, c1, T, .75);
        return s + P(`M${n(h1[0] + 4)} ${n(h1[1])}L${n(h2[0] + 3)} ${n(h2[1])}`, `fill="none" stroke="${PALE}" stroke-width="2.5"`);
      };
      if (t.includes('horn')) return G(`translate(-30 58) rotate(${n(X.r(10, 22))})`, fang(X.r(118, 130), 42, X.r(66, 80), X.w, 8) + E(0, 2, 21, 6, `fill="${X.w2}"`));
      if (t.includes('stinger')) return G(`translate(0 40) rotate(${n(X.r(20, 40))})`, C(0, 8, 20, `fill="${X.w2}"`) + fang(90, 22, 26, X.w, 2) + P('M26 -94q-4 8 0 10q4 -2 0 -10Z', `fill="var(--ok)" stroke-width="1"`));
      const claw = t.includes('claw'), k = X.ri(2, 3); let s = '';
      for (let i = 0; i < k; i++) { const off = (i - (k - 1) / 2); s += G(`translate(${n(off * 44)} ${n(50 - Math.abs(off) * 10)}) rotate(${n(off * 14 + X.r(-5, 5))})`, fang(claw ? 92 - Math.abs(off) * 12 : 96 - Math.abs(off) * 20, claw ? 26 : 26, claw ? 56 : 12, i % 2 ? X.w2 : X.w, claw ? 1 : 0) + (claw ? '' : P('M-12 0Q-10 16 -4 18M12 0Q10 16 4 18', 'fill="none" stroke-width="1.4"'))); }
      return s;
    },
    bone(X, t) {
      if (t.includes('skull')) {
        let s = P('M-44 8C-52 -58 52 -58 44 8L36 18L32 40L-32 40L-36 18Z', `fill="${X.w}"`) + E(-17, 0, 12, 11, `fill="${INK}" fill-opacity=".8"`) + E(17, 0, 12, 11, `fill="${INK}" fill-opacity=".8"`) + P('M0 12L-6 24L6 24Z', `fill="${INK}" fill-opacity=".7"`);
        for (let i = -3; i <= 3; i++) s += L(i * 6, 30, i * 6, 40, TH);
        return s + L(-24, 30, 24, 30, TH) + P('M-30 -30Q-20 -44 0 -44', `fill="none" stroke="${PALE}" stroke-width="3"`) + P('M20 -34q6 8 14 6', TH);
      }
      const b = (len, th) => { const h = len / 2; return C(-h, -th, th * 1.4, `fill="${X.w}"`) + C(-h, th, th * 1.4, `fill="${X.w}"`) + C(h, -th, th * 1.4, `fill="${X.w}"`) + C(h, th, th * 1.4, `fill="${X.w}"`) + R(-h, -th, len, th * 2, `fill="${X.w}" ${NS}`) + L(-h + th, -th, h - th, -th) + L(-h + th, th, h - th, th) + L(-h * .5, -th * .3, h * .4, -th * .3, `stroke="${PALE}" stroke-width="2"`); };
      let s = G(`rotate(${n(X.r(-30, -15))})`, b(X.r(110, 130), X.r(8, 10)));
      if (X.chance(.6)) s = G(`translate(0 30) rotate(${n(X.r(10, 25))})`, b(80, 6)) + s;
      return s;
    },
    hide(X, t) {
      let s = '';
      const fr = [[-88, -66], [88, -66], [88, 66], [-88, 66]];
      for (let i = 0; i < 4; i++) { const [a, b] = [fr[i], fr[(i + 1) % 4]]; s += L(a[0], a[1], b[0], b[1], `stroke="${INK}" stroke-width="6"`) + L(a[0], a[1], b[0], b[1], `stroke="${WOOD}" stroke-width="3.5"`); }
      const bumps = [[-PI / 2, .38, .22], [PI / 2, .5, .12], [-.6, .45, .22], [-PI + .6, .45, .22], [.7, .5, .22], [PI - .7, .5, .22]], pts = [];
      for (let i = 0; i < 36; i++) {
        const a = i * TAU / 36 - PI; let k = 1;
        for (const [ba, amp, w] of bumps) { let d = Math.atan2(Math.sin(a - ba), Math.cos(a - ba)); k += amp * Math.exp(-(d * d) / (w * w)); }
        k *= 1 + X.r(-.05, .05); pts.push([Math.cos(a) * 44 * k, Math.sin(a) * 34 * k]);
      }
      for (const [ba] of bumps) { const i = Math.round((ba + PI) / TAU * 36) % 36, [x, y] = pts[i], fx = Math.max(-86, Math.min(86, x * 1.25)), fy = Math.max(-64, Math.min(64, y * 1.25)); s += L(x, y, Math.abs(x) > 70 ? Math.sign(x) * 88 : fx, Math.abs(x) > 70 ? fy : Math.sign(y) * 66, TH); }
      s += P(smooth(pts, true), `fill="${X.w}" stroke-width="1.8"`) + P(smooth(pts.map(([x, y]) => [x * .86, y * .86]), true), 'fill="none" stroke-width=".9" stroke-dasharray="3 3"');
      if (!t.includes('leather')) for (let i = 0; i < 34; i++) { const a = X.r(0, TAU), rr = Math.sqrt(X.R()) * .75, x = Math.cos(a) * 44 * rr, y = Math.sin(a) * 32 * rr; s += L(x, y, x + 2, y + 5, 'stroke-width=".8" stroke-opacity=".55"'); }
      else s += E(0, 0, 20, 14, `fill="${X.c}" fill-opacity=".12" ${NS}`);
      return s;
    },
    scale(X, t) {
      if (t.includes('shell') && !t.includes('scale')) {
        if (X.chance(.5)) { let o = [], s = ''; for (let i = 0; i <= 60; i++) { const a = i / 60 * 3.2 * PI, r = 5 * Math.exp(.18 * a); o.push([Math.cos(a) * r, Math.sin(a) * r * .92]); }
          s += P(smooth(o) + 'Z', `fill="${X.w}" stroke-width="2"`);
          for (let i = 12; i <= 60; i += 5) { const [x, y] = o[i], [x2, y2] = o[Math.max(0, i - 22)]; s += P(`M${n(x)} ${n(y)}Q${n((x + x2) / 2 * .8)} ${n((y + y2) / 2 * .8)} ${n(x2)} ${n(y2)}`, TH); }
          return G(`rotate(${n(X.r(0, 360))}) scale(1.75)`, s);
        }
        let s = P('M0 44L-62 -8Q-40 -58 0 -60Q40 -58 62 -8Z', `fill="${X.w}"`);
        for (let i = 0; i <= 10; i++) { const [x, y] = qpt([-62, -8], [0, -84], [62, -8], i / 10); s += L(0, 44, x, y + 4, TH); }
        return s + P('M-14 38L-22 52L22 52L14 38', `fill="${X.w2}"`) + P('M-62 -8Q-40 -58 0 -60Q40 -58 62 -8', 'fill="none" stroke-width="1" stroke-dasharray="4 5"');
      }
      if (t.includes('carapace') && !t.includes('scale')) {
        const el = 'M0 -30C28 -30 44 -10 42 20C40 48 18 66 0 70Z', clip = clipDef(X, 'ca', el + 'M0 -30C-28 -30 -44 -10 -42 20C-40 48 -18 66 0 70Z');
        let s = P('M-26 -30C-30 -54 30 -54 26 -30Z', `fill="${X.w2}"`) + P('M-10 -48Q-14 -62 -22 -66M10 -48Q14 -62 22 -66', 'fill="none" stroke-width="1.6"') + P(el, `fill="${X.w}"`) + G('scale(-1 1)', P(el, `fill="${X.w}"`)) + `<g ${clip}>`;
        for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) { const x = (8 + r * 8), y = -18 + i * 12; s += C(x, y, 1, `fill="${INK}" ${NS}`) + C(-x, y, 1, `fill="${INK}" ${NS}`); }
        for (let i = 0; i < 5; i++) s += C(X.r(-30, 30), X.r(-10, 50), X.r(3, 6), `fill="${X.c}" fill-opacity=".22" ${NS}`);
        return s + '</g>' + P('M-24 -20Q-36 0 -32 30', `fill="none" stroke="${PALE}" stroke-width="3"`) + P('M24 -20Q34 0 32 20', `fill="none" stroke="${PALE}" stroke-width="2"`);
      }
      const d = 'M0 -64C40 -60 70 -30 66 10C62 42 30 62 0 66C-30 62 -62 42 -66 10C-70 -30 -40 -60 0 -64Z', clip = clipDef(X, 'sc', d), sw = X.r(11, 14);
      let s = P(d, `fill="${X.w}"`) + `<g ${clip}>`;
      for (let r = 9; r >= 0; r--) { const y = -72 + r * sw * 1.05; for (let c = -6; c <= 6; c++) { const x = c * sw * 1.6 + (r % 2 ? sw * .8 : 0); if (Math.abs(x) > 80) continue; s += P(`M${n(x - sw * .8)} ${n(y)}Q${n(x - sw * .8)} ${n(y + sw * 1.3)} ${n(x)} ${n(y + sw * 1.6)}Q${n(x + sw * .8)} ${n(y + sw * 1.3)} ${n(x + sw * .8)} ${n(y)}`, `fill="${(r + c) % 3 ? X.w : X.w2}" stroke-width="1"`) + L(x, y + sw * .4, x, y + sw * 1.1, 'stroke-width=".6" stroke-opacity=".5"'); } }
      return s + '</g>' + P(d, 'fill="none" stroke-width="2"');
    },
    ingot(X, t) {
      if (t.includes('ore') && !t.includes('ingot')) {
        const pts = []; for (let i = 0; i < 10; i++) pts.push(polar(0, 6, X.r(46, 62), i * TAU / 10 + X.r(-.15, .15)));
        let s = P(Z(pts), `fill="${mix('var(--muted)', 25)}" stroke-width="2"`);
        for (let i = 0; i < 10; i += 2) s += L(pts[i][0], pts[i][1], X.r(-12, 12), X.r(-6, 18), TH);
        for (let i = 0; i < 7; i++) { const [x, y] = polar(0, 6, X.r(8, 40), X.r(0, TAU)); s += P(Z([[x, y - 5], [x + 5, y], [x, y + 5], [x - 4, y]]), `fill="${X.c}" fill-opacity=".6" stroke-width=".8"`); }
        return s;
      }
      const ing = (x, y) => G(`translate(${x} ${y})`, P('M-40 14L30 14L42 4L-28 4Z', `fill="${X.w}" stroke="none"`) + P('M-40 14L-30 -6L22 -6L30 14Z', `fill="${X.w2}"`) + P('M30 14L22 -6L34 -14L42 4Z', `fill="${X.w}"`) + P('M-30 -6L-18 -14L34 -14L22 -6Z', `fill="${SURF}"`) + E(2, -10, 7, 2.2, TH) + L(-30, 8, 20, 8, `stroke="${PALE}" stroke-width="2"`));
      const k = X.ri(1, 3);
      return G('scale(1.3)', k === 1 ? G('scale(1.3)', ing(0, 6)) : k === 2 ? ing(-24, 22) + ing(26, 14) : ing(-36, 30) + ing(38, 30) + ing(0, 6));
    },
    gem(X, t) {
      if (t.includes('pearl')) { let s = P('M-58 20Q-70 -40 -10 -60Q50 -64 62 10Z', `fill="${mix(BRASS, 18)}"`); for (let i = 1; i < 8; i++) { const [x, y] = qpt([-58, 20], [-40, -80], [62, 10], i / 8); s += L(0, 16, x, y, TH); }
        s += P('M-62 20Q0 64 66 18Q0 34 -62 20Z', `fill="${mix(BRASS, 28)}"`) + P('M-50 22Q0 38 54 20', 'fill="none" stroke-width=".8"') + C(0, 8, 22, `fill="${mix(X.c, 10, PALE)}" stroke-width="1.6"`) + C(0, 8, 22, `fill="${glowDef(X, 'pr', X.c, .25)}" ${NS}`) + C(-7, 1, 6, `fill="${PALE}" ${NS}`); return s; }
      if (t.includes('coral')) { let s = ''; const br = (x, y, a, l, w, d) => { if (d > 4 || l < 8) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; s += L(x, y, x2, y2, `stroke-width="${n(w + 2.5)}"`) + '§' + L(x, y, x2, y2, `stroke="${X.w2}" stroke-width="${n(w)}"`) + '¤'; br(x2, y2, a - X.r(.3, .6), l * .75, w * .72, d + 1); br(x2, y2, a + X.r(.3, .6), l * .7, w * .72, d + 1); };
        br(0, 60, -PI / 2, 36, 11, 0); const parts = s.split('¤'); return parts.map(p => p.split('§')[0]).join('') + parts.map(p => p.split('§')[1] || '').join('') + E(0, 62, 30, 5, `fill="${WOOD}"`); }
      if (t.includes('stone') && !t.some(x => ['gem', 'crystal', 'ice', 'glass'].includes(x))) {
        const pts = []; for (let i = 0; i < 12; i++) pts.push(polar(0, 8, X.r(40, 50) * (i % 6 === 0 ? 1.1 : 1), i * TAU / 12)); const d = smooth(pts.map(([x, y]) => [x * 1.3, y]), true), clip = clipDef(X, 'st', d);
        let s = P(d, `fill="${mix('var(--muted)', 25)}"`) + `<g ${clip}>`; for (let i = 0; i < 5; i++) s += P(`M-80 ${-24 + i * 14}Q0 ${-30 + i * 14 + X.r(-6, 6)} 80 ${-20 + i * 14}`, 'fill="none" stroke-width=".8" stroke-opacity=".6"');
        for (let i = 0; i < 14; i++) s += C(X.r(-50, 50), X.r(-30, 40), .9, `fill="${INK}" ${NS}`);
        return s + '</g>' + P(d, 'fill="none" stroke-width="2"');
      }
      if (t.includes('gem')) return gem(X);
      let s = P('M-60 50Q-30 30 0 36Q34 30 62 50Z', `fill="${mix('var(--muted)', 25)}"`); const k = X.ri(3, 5), ice = t.includes('ice');
      const prism = (w, h) => P(Z([[-w / 2, 0], [-w / 2, -h], [0, -h - w * .9], [w / 2, -h], [w / 2, 0]]), `fill="${ice ? mix('var(--t-rare)', 14) : X.w2}"`) + L(0, 0, 0, -h - w * .9, TH) + L(-w / 2, -h, 0, -h + w * .3, TH) + L(w / 2, -h, 0, -h + w * .3, TH) + L(-w / 4, -6, -w / 4, -h + 2, `stroke="${PALE}" stroke-width="2"`);
      for (let i = 0; i < k; i++) { const off = (i - (k - 1) / 2) / ((k - 1) / 2 || 1), m = 1 - Math.abs(off); s += G(`translate(${n(off * 30)} 44) rotate(${n(off * 34 + X.r(-6, 6))})`, prism(18 + m * 8, 30 + m * 50 + X.r(-6, 6))); }
      return s;
    },
    leaf(X, t) {
      if (!t.some(x => ['fungus', 'root', 'bark', 'wood'].includes(x))) { const g = mix(X.c, 45, 'var(--ok)'); X.w = mix(g, 18); X.w2 = mix(g, 36); }
      if (t.includes('fungus')) {
        let s = ''; const k = X.ri(1, 3), spots = X.chance(.5);
        for (let i = 0; i < k; i++) { const sc = i ? X.r(.5, .7) : 1, x = i ? (i === 1 ? -50 : 48) : X.r(-6, 6), cw = 50 * sc, ch = 40 * sc, h = 70 * sc, top = 60 - h;
          s += P(`M${n(x - 8 * sc)} 60Q${n(x - 10 * sc)} ${n(top + 20)} ${n(x - 7 * sc)} ${n(top + 8)}L${n(x + 7 * sc)} ${n(top + 8)}Q${n(x + 4 * sc)} ${n(top + 30)} ${n(x + 10 * sc)} 60Z`, `fill="${SURF}"`) + P(`M${n(x - 12 * sc)} ${n(top + 22)}Q${n(x)} ${n(top + 28)} ${n(x + 12 * sc)} ${n(top + 22)}`, TH);
          s += P(`M${n(x - cw)} ${n(top + 8)}C${n(x - cw)} ${n(top - ch)} ${n(x + cw)} ${n(top - ch)} ${n(x + cw)} ${n(top + 8)}Q${n(x)} ${n(top)} ${n(x - cw)} ${n(top + 8)}Z`, `fill="${i ? X.w2 : X.w}"`);
          for (let g = -4; g <= 4; g++) s += L(x + g * cw / 5.5, top + 6, x + g * cw / 12, top + 10, 'stroke-width=".6"');
          if (spots) for (let j = 0; j < 5; j++) s += E(x + X.r(-.6, .6) * cw, top - X.r(4, ch * .5), 3.5 * sc, 2.5 * sc, `fill="${SURF}" stroke-width=".7"`);
        }
        return s + P('M-80 60Q0 54 80 60', 'fill="none" stroke-width="1.4"');
      }
      if (t.includes('root')) {
        let ink = '', fill = ''; const br = (x, y, a, l, w, d) => { if (d > 4) return; const bend = X.r(-.9, .9), x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l, cx = (x + x2) / 2 + Math.cos(a + PI / 2) * l * bend * .4, cy = (y + y2) / 2 + Math.sin(a + PI / 2) * l * bend * .4;
          const st = d > 2 ? 2 : 4; ink += taper([x, y], [cx, cy], [x2, y2], w + 3, w * .7 + 3, INK, st); fill += taper([x, y], [cx, cy], [x2, y2], w, w * .7, X.w2, st); const kk = d < 1 ? 3 : 2; for (let i = 0; i < kk; i++) br(x2, y2, a + (i - (kk - 1) / 2) * .7 + X.r(-.3, .3), l * X.r(.6, .8), w * .62, d + 1); };
        br(-6, -22, PI / 2 + .45, 32, 12, 2); br(6, -22, PI / 2 - .45, 32, 12, 2); br(0, -24, PI / 2, 36, 16, 0);
        const cr = []; for (let i = 0; i < 12; i++) cr.push(polar(0, -30, (i % 2 ? 16 : 20) * X.r(.9, 1.1), i * TAU / 12)); let lv = ''; for (const a of [-50, -10, 30]) lv += G(`translate(0 -44) rotate(${a - 90})`, P('M0 0Q14 -8 30 0Q14 8 0 0Z', `fill="${X.w}" stroke-width="1.2"`) + L(0, 0, 26, 0, TH));
        return lv + ink + fill + P(smooth(cr.map(([x, y]) => [x * 1.3, y]), true), `fill="${X.w}"`) + P('M-24 -36Q0 -30 24 -36M-24 -24Q0 -18 24 -24', TH);
      }
      if (t.includes('vine')) {
        let s = '', pts = []; for (let i = 0; i <= 12; i++) pts.push([-90 + i * 15, Math.sin(i * .9 + X.r(0, 1)) * 26]); s += P(smooth(pts), 'fill="none" stroke-width="2.4"');
        for (let i = 1; i < 12; i += 2) { const [x, y] = pts[i], a = i % 4 === 1 ? -1 : 1; s += G(`translate(${n(x)} ${n(y)}) rotate(${a * 50})`, P('M0 0C-4 -10 -18 -18 -10 -26Q0 -22 0 -30Q0 -22 10 -26C18 -18 4 -10 0 0Z', `fill="${i % 3 ? X.w : X.w2}" stroke-width="1.4"`) + L(0, 0, 0, -22, TH)); }
        for (const i of [4, 8]) { const [x, y] = pts[i]; let sp = []; for (let a = 0; a < 14; a++) { const r = 16 - a * 1.1; sp.push([x + Math.cos(a * .9) * r, y + 18 + Math.sin(a * .9) * r]); } s += P(smooth([[x, y], ...sp]), 'fill="none" stroke-width="1.1"'); }
        return s;
      }
      if (t.some(x => x === 'bark' || x === 'wood')) {
        let s = P('M-70 -30L30 -40A20 38 0 0 1 30 36L-70 46Z', `fill="${WOOD}"`); for (let i = 0; i < 6; i++) s += P(`M-66 ${-24 + i * 12}Q-20 ${-28 + i * 12 + X.r(-4, 4)} 22 ${-34 + i * 13}`, TH);
        s += E(30, -2, 20, 38, `fill="${mix(BRASS, 18)}"`); for (let i = 1; i < 5; i++) s += E(30 + i * .5, -2, 20 - i * 4, 38 - i * 7.6, TH);
        return s + P('M28 -30L34 20', 'fill="none" stroke-width=".8"');
      }
      const stemEnd = [X.r(-16, 16), -62], ctrl = [X.r(-30, 30), 0], base = [0, 66]; let s = P(`M${base}Q${ctrl} ${stemEnd}`.replace(/,/g, ' '), 'fill="none" stroke-width="2.2"');
      const k = t.includes('herb') ? 9 : X.ri(4, 7), lf = t.includes('herb') ? 24 : X.r(34, 44);
      for (let i = 0; i < k; i++) { const u = .15 + .8 * i / k, [x, y] = qpt(base, ctrl, stemEnd, u), side = i % 2 ? 1 : -1, l = lf * (1 - u * .4);
        s += G(`translate(${n(x)} ${n(y)}) rotate(${n(side * X.r(50, 70) - 90)})`, P(`M0 0Q${n(l * .45)} ${n(-l * .32)} ${n(l)} 0Q${n(l * .45)} ${n(l * .32)} 0 0Z`, `fill="${i % 3 ? X.w : X.w2}" stroke-width="1.3"`) + L(0, 0, l * .85, 0, TH)); }
      if (t.includes('flower')) { const [x, y] = stemEnd; for (let i = 0; i < 6; i++) s += E(x, y - 12, 7, 13, `fill="${mix(X.c, 30)}" stroke-width="1.2" transform="rotate(${i * 60} ${n(x)} ${n(y)})"`); s += C(x, y, 6, `fill="${mix(BRASS, 60)}"`); }
      else if (t.some(v => v === 'fruit' || v === 'seed')) { const [x, y] = stemEnd, seed = t.includes('seed'); for (let i = 0; i < 4; i++) { const bx = x + (i - 1.5) * 13, by = y + 10 + (i % 2) * 8; s += L(x, y, bx, by - 6, TH) + (seed ? E(bx, by, 4, 7, `fill="${WOOD}" stroke-width="1.2"`) : C(bx, by, 7, `fill="${mix(X.c, 40)}" stroke-width="1.3"`) + C(bx - 2, by - 2, 1.6, `fill="${SURF}" ${NS}`)); } }
      if (t.includes('moss')) { const pts = []; for (let i = 0; i <= 24; i++) { const a = PI + i * PI / 24, r = (i % 2 ? 58 : 62) + X.r(-2, 2); pts.push([Math.cos(a) * r * 1.1, 40 + Math.sin(a) * r * .72]); }
        s = E(0, 44, 78, 16, `fill="${mix('var(--muted)', 25)}"`) + P(smooth(pts) + 'Z', `fill="${X.w2}" stroke-width="1.6"`); for (let i = 0; i < 40; i++) { const a = X.r(PI * 1.1, PI * 1.9), r = X.r(10, 54); const x = Math.cos(a) * r * 1.1, y = 40 + Math.sin(a) * r * .72; s += L(x, y, x + X.r(-1.5, 1.5), y - 4, 'stroke-width=".8" stroke-opacity=".6"'); }
        for (let i = 0; i < 9; i++) { const x = -44 + i * 11 + X.r(-3, 3), y = 40 - Math.sqrt(Math.max(0, 1 - (x / 64) ** 2)) * 42; s += P(`M${n(x)} ${n(y + 2)}Q${n(x + 4)} ${n(y - 14)} ${n(x + X.r(-3, 6))} ${n(y - 24)}`, TH) + E(x + 1, y - 26, 2, 3.4, `fill="${WOOD}" stroke-width=".9"`); }
        s += P('M-60 48Q0 62 60 48', TH); }
      return s;
    },
    hair(X, t) {
      if (t.includes('tentacle')) {
        const c = [], a = [], b = []; for (let i = 0; i <= 40; i++) { const u = i / 40, ang = u * 2.2 * PI, r = 64 * (1 - u * .8); c.push([-20 + Math.cos(ang + PI) * r * 1.1 + u * 30, 6 + Math.sin(ang + PI) * r * .9]); }
        for (let i = 0; i <= 40; i++) { const p = c[i], q = c[Math.min(40, i + 1)], o = c[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], ln = Math.hypot(dx, dy) || 1, w = 17 * Math.pow(1 - i / 41, 1.3) + .8; a.push([p[0] - dy / ln * w, p[1] + dx / ln * w]); b.push([p[0] + dy / ln * w, p[1] - dx / ln * w]); }
        let s = P(M(a) + 'L' + b.reverse().map(p => p.map(n).join(' ')).join('L') + 'Z', `fill="${X.w}" stroke-width="1.8"`); b.reverse();
        for (let i = 2; i < 36; i += 3) { const p = c[i], q = b[i], w = 6 * Math.pow(1 - i / 41, 1.2) + .8; s += C((p[0] + q[0] * 1.6) / 2.6, (p[1] + q[1] * 1.6) / 2.6, w * .6, `fill="${X.w2}" stroke-width=".8"`); }
        return s;
      }
      const col = t.includes('hair') ? mix(INK, 30) : t.includes('silk') ? mix('var(--muted)', 12) : X.w2;
      let s = E(0, 40, 36, 10, `fill="${WOOD}"`) + R(-24, -34, 48, 74, `fill="${col}" ${NS}`) + L(-24, -34, -24, 40) + L(24, -34, 24, 40);
      for (let y = -30; y < 38; y += 4) s += P(`M-24 ${y}Q0 ${y + 4} 24 ${y + 1.5}`, 'fill="none" stroke-width=".5" stroke-opacity=".6"');
      s += E(0, -36, 36, 10, `fill="${WOOD}"`) + E(0, -36, 7, 2.5, `fill="${INK}" ${NS}`) + L(-14, -22, -14, 30, `stroke="${PALE}" stroke-width="3" stroke-opacity=".7"`);
      return s + P(`M24 10C50 14 70 30 ${n(X.r(50, 70))} 52C44 70 70 76 88 60`, 'fill="none" stroke-width="1.4"');
    },
    ink(X) {
      let s = G('translate(18 -30) rotate(28)', feather(X, 150, 14, 6, X.w));
      s += P('M-30 60L-40 30Q-40 8 -16 4L-16 -4L16 -4L16 4Q40 8 40 30L30 60Z', `fill="${mix(INK, 70)}"`) + R(-20, -10, 40, 8, `rx="2" fill="${SURF}"`) + P('M-30 28Q-30 16 -18 14', `fill="none" stroke="${PALE}" stroke-width="2.5"`);
      for (let i = 0; i < 4; i++) s += C(X.r(-70, -44), X.r(46, 62), X.r(1, 3), `fill="${INK}" ${NS}`);
      return s;
    },
    dust(X, t) {
      const col = t.includes('ash') ? mix(INK, 25) : t.includes('salt') ? SURF : t.includes('sand') ? mix(BRASS, 35) : t.includes('wax') ? mix(BRASS, 22) : X.w2;
      let s = P('M-78 18Q-70 56 0 58Q70 56 78 18Z', `fill="${mix('var(--muted)', 18)}"`) + E(0, 18, 78, 14, `fill="${SURF}"`) + P(`M-52 20Q${n(X.r(-20, 20))} ${n(X.r(-50, -30))} 52 20Q0 30 -52 20Z`, `fill="${col}"`);
      for (let i = 0; i < 26; i++) { const x = X.r(-36, 36), y = 16 - (1 - (x / 40) ** 2) * X.r(0, 28); s += t.includes('salt') ? R(x, y, 2, 2, `fill="${INK}" fill-opacity=".45" ${NS}`) : C(x, y, .9, `fill="${INK}" fill-opacity=".45" ${NS}`); }
      for (let i = 0; i < 8; i++) s += C(X.r(-86, 86), X.r(34, 66), X.r(.8, 1.6), `fill="${INK}" fill-opacity=".5" ${NS}`);
      return s + P('M-60 26Q-40 30 -20 32', `fill="none" stroke="${PALE}" stroke-width="2"`);
    },
    salvage(X, t) {
      if (t.includes('vessel')) return P('M-12 -50L12 -50L10 -40Q40 -26 34 12Q28 44 14 54L-14 54Q-28 44 -34 12Q-40 -26 -10 -40Z', `fill="${X.w}"`) + P('M-10 -40Q-40 -48 -36 -24M10 -40Q40 -48 36 -24', 'fill="none" stroke-width="2"') + P('M-32 0Q0 8 32 0M-26 30Q0 36 26 30', TH) + P(star(0, 16, 8, 5, .45), `fill="${X.c}" fill-opacity=".3" stroke-width=".8"`);
      if (t.includes('relic') && X.chance(.5)) return amulet(X);
      if (t.includes('salvage') && X.chance(.5)) { const pts = []; for (let i = 0; i < 40; i++) pts.push(polar(0, 0, i % 5 < 2 ? 46 : 38, i * TAU / 40)); return G(`rotate(${n(X.r(0, 30))})`, P(Z(pts), `fill="${METAL}"`) + C(0, 0, 16, `fill="${SURF}"`) + C(0, 0, 26, TH) + P('M-30 16L-12 6', `fill="none" stroke="${PALE}" stroke-width="2"`)); }
      let s = ''; for (let i = 2; i >= 0; i--) s += E(-26 + i * 6, 40 - i * 8, 30, 8, `fill="${mix(BRASS, 35)}"`) + R(-56 + i * 6, 40 - i * 8, 60, 5, `fill="${mix(BRASS, 35)}" ${NS}`);
      s += G('translate(26 0) rotate(-12)', C(0, 0, 36, `fill="${mix(BRASS, 40)}"`) + C(0, 0, 29, TH) + P(star(0, 0, 16, 6, .45), `fill="${X.w2}" stroke-width="1"`));
      for (let i = 0; i < 30; i++) { const [x1, y1] = polar(0, 0, 32, i * TAU / 30), [x2, y2] = polar(0, 0, 35, i * TAU / 30); s += G('translate(26 0) rotate(-12)', L(x1, y1, x2, y2, 'stroke-width=".6"')); }
      return s;
    },
    meat(X) {
      return P('M-60 10C-70 -30 -20 -54 20 -40C50 -30 56 0 44 20C30 44 -50 50 -60 10Z', `fill="${mix('var(--danger)', 25)}"`) + P('M-50 4C-52 -20 -20 -40 16 -32', `fill="none" stroke="${PALE}" stroke-width="5" stroke-opacity=".8"`) + P('M36 12L70 30', `stroke="${INK}" stroke-width="12"`) + P('M36 12L70 30', `stroke="${PALE}" stroke-width="8"`) + C(72, 26, 6, `fill="${SURF}"`) + C(70, 36, 6, `fill="${SURF}"`) + P('M-30 -8Q-10 0 0 20M-8 -24Q10 -10 20 8', TH);
    },
    jar(X) {
      let s = R(-40, -38, 80, 96, `rx="14" fill="${SURF}" fill-opacity=".75"`) + R(-38, -6, 76, 62, `rx="12" fill="${X.c}" fill-opacity=".2" ${NS}`) + L(-38, -6, 38, -6, `stroke="${X.c}" stroke-width="1.2"`);
      const pts = []; for (let i = 0; i < 9; i++) pts.push(polar(0, 22, X.r(12, 22), i * TAU / 9));
      s += P(smooth(pts, true), `fill="${X.w2}" stroke-width="1.4"`) + R(-44, -52, 88, 16, `rx="3" fill="${mix(BRASS, 45)}"`) + L(-40, -44, 40, -44, TH) + P('M-30 -26L-30 40', `fill="none" stroke="${PALE}" stroke-width="3"`);
      return s + R(-22, 30, 44, 16, `fill="${mix(BRASS, 15)}" stroke-width="1"`) + L(-14, 38, 14, 38, 'stroke-width=".7" stroke="var(--muted)"');
    }
  };
  const FORM = [[['essence', 'core', 'ectoplasm'], 'essence'], [['eye'], 'eye'], [['heart', 'organ', 'brain', 'gland', 'tongue'], 'heart'], [['venom', 'blood', 'ichor', 'liquid', 'oil', 'slime', 'sap', 'resin'], 'liquid'], [['feather', 'wing'], 'feather'], [['tooth', 'claw', 'stinger', 'horn'], 'tooth'], [['bone', 'skull'], 'bone'], [['hide', 'fur', 'leather'], 'hide'], [['scale', 'carapace', 'shell'], 'scale'], [['ingot', 'ore', 'metal'], 'ingot'], [['gem', 'crystal', 'pearl', 'coral', 'stone', 'ice', 'glass'], 'gem'], [['leaf', 'flower', 'root', 'fungus', 'moss', 'vine', 'seed', 'fruit', 'herb', 'bark', 'wood'], 'leaf'], [['hair', 'silk', 'thread', 'cloth', 'sinew', 'tentacle'], 'hair'], [['ink'], 'ink'], [['dust', 'ash', 'salt', 'sand', 'reagent', 'wax'], 'dust'], [['salvage', 'relic', 'vessel'], 'salvage'], [['meat', 'fat', 'food'], 'meat']];
  const formOf = t => { for (const [k, g] of FORM) if (k.some(x => t.includes(x))) return g; return 'jar'; };

  /* ============================================================ AURAS */
  function auras(X, tags) {
    const has = (...a) => a.some(x => tags.includes(x)); let s = ''; let k = 0;
    const put = f => { if (k++ < 2) s += f(); };
    const ring = (i, m) => polar(160, 110, X.r(84, 104), i * TAU / m + X.r(-.2, .2));
    if (has('fire')) put(() => { let o = E(160, 212, 150, 70, `fill="${glowDef(X, 'warm', AC.fire, .26)}" ${NS}`); for (let i = 0; i < 12; i++) { const x = X.r(40, 280), y = X.r(20, 100); o += C(x, y, X.r(1.2, 3), `fill="${AC.fire}" fill-opacity=".75" ${NS}`) + (i % 3 ? '' : L(x, y + 4, x - 2, y + 11, `stroke="${AC.fire}" stroke-width=".9"`)); } return o; });
    if (has('cold', 'ice')) put(() => { let o = ''; for (let i = 0; i < 4; i++) { const [x, y] = ring(i + .5, 4), r = X.r(7, 10); for (let j = 0; j < 3; j++) o += G(`translate(${n(x)} ${n(y)}) rotate(${j * 60})`, L(-r, 0, r, 0) + L(r * .55, 0, r * .8, -3) + L(r * .55, 0, r * .8, 3) + L(-r * .55, 0, -r * .8, -3) + L(-r * .55, 0, -r * .8, 3), `stroke="${AC.cold}" stroke-width=".9"`); } for (let x = 14; x < 306; x += 6) o += L(x, 206, x + X.r(-2, 2), 206 - X.r(2, 7), `stroke="${AC.cold}" stroke-width=".7" stroke-opacity=".6"`); return o; });
    if (has('lightning', 'storm')) put(() => { const x0 = X.pick([40, 280]), p = [[x0, 18]]; for (let i = 1; i < 8; i++) p.push([x0 + (i % 2 ? 11 : -9) + X.r(-3, 3), 18 + i * 13]); return P(M(p), `fill="none" stroke="${AC.lightning}" stroke-width="5" stroke-opacity=".2"`) + P(M(p), `fill="none" stroke="${AC.lightning}" stroke-width="1.6"`); });
    if (has('thunder')) put(() => { let o = ''; const x = X.pick([28, 292]), d = x < 160 ? 1 : -1; for (let i = 1; i <= 3; i++) o += P(`M${x + d * i * 10} ${110 - i * 22}Q${x + d * i * 22} 110 ${x + d * i * 10} ${110 + i * 22}`, `fill="none" stroke="${AC.thunder}" stroke-width="1.1" stroke-opacity="${n(1 - i * .22)}"`); return o; });
    if (has('acid', 'poison')) put(() => { const col = has('acid') ? AC.acid : AC.poison; let o = ''; for (let i = 0; i < 7; i++) o += C(X.r(232, 290), X.r(40, 170), X.r(2, 5), `fill="${col}" fill-opacity=".15" stroke="${col}" stroke-width=".9"`); for (let i = 0; i < 3; i++) { const x = X.r(90, 230), y = X.r(176, 194); o += P(`M${n(x)} ${n(y)}q-3 6 0 8q3 -2 0 -8Z`, `fill="${col}" stroke="${col}" stroke-width=".8"`); } return o; });
    if (has('necrotic', 'shadow')) put(() => { let o = ''; for (let i = 0; i < 4; i++) { const x = X.r(30, 290), y = X.r(150, 200); o += P(`M${n(x)} ${n(y)}c-10 -14 14 -22 4 -38s12 -20 6 -30`, `fill="none" stroke="${INK}" stroke-width="${n(X.r(2, 3.5))}" stroke-opacity=".22"`); } return o; });
    if (has('radiant', 'celestial')) put(() => { let o = ''; for (let i = 0; i < 24; i++) { const a = i * TAU / 24, [x1, y1] = polar(160, 108, 86, a), [x2, y2] = polar(160, 108, i % 2 ? 96 : 108, a); o += L(x1, y1, x2, y2, `stroke="${AC.radiant}" stroke-width="${i % 2 ? .7 : 1.2}" stroke-opacity=".7"`); } return o; });
    if (has('arcane', 'force')) put(() => { let o = E(160, 110, 128, 88, `fill="none" stroke="${AC.arcane}" stroke-width=".7" stroke-opacity=".6"`); for (let i = 0; i < 20; i++) { const a = i * TAU / 20, [x, y] = [160 + Math.cos(a) * 128, 110 + Math.sin(a) * 88]; o += G(`translate(${n(x)} ${n(y)}) rotate(${n(a * 57.3 + 90)})`, [L(0, -4, 0, 4), P('M-3 -3L0 3L3 -3'), P('M-3 0L3 0M0 -4L0 0'), C(0, 0, 2.2, 'fill="none"')][i % 4], `stroke="${AC.arcane}" stroke-width=".9" fill="none"`); } return o; });
    if (has('fey')) put(() => { let o = ''; for (let i = 0; i < 9; i++) { const [x, y] = ring(i, 9); o += P(star(x, y, X.r(2.5, 4.5)), `fill="${i % 2 ? BRASS : AC.fey}" ${NS}`); } return o; });
    if (has('fiendish', 'infernal', 'abyssal')) put(() => { let o = ''; for (const [x, y] of [[36, 34], [284, 34]]) o += G(`translate(${x} ${y})`, P('M-6 4C-10 -2 -8 -8 -3 -11C-5 -6 -3 -2 0 0C3 -2 5 -6 3 -11C8 -8 10 -2 6 4Q0 8 -6 4Z', `fill="${AC.fiend}" fill-opacity=".55" stroke="${AC.fiend}" stroke-width=".8"`)); return o; });
    if (has('psychic')) put(() => { let o = ''; for (let i = 1; i <= 3; i++) o += E(160, 110, 80 + i * 14, 58 + i * 12, `fill="none" stroke="${AC.psychic}" stroke-width=".8" stroke-dasharray="${i * 3} 5" stroke-opacity="${n(.8 - i * .18)}"`); return o; });
    if (has('earth')) put(() => { let o = ''; for (let i = 0; i < 7; i++) { const x = X.r(30, 290), y = X.r(188, 202), r = X.r(2.5, 5); o += P(Z([[x - r, y], [x - r * .4, y - r * .9], [x + r * .7, y - r * .6], [x + r, y + r * .3], [x, y + r * .5]]), `fill="${mix(AC.earth, 35)}" stroke="var(--ink-2)" stroke-width=".7"`); } return o; });
    if (has('water')) put(() => { let o = ''; for (let i = 0; i < 3; i++) { const y = 186 + i * 7, x = X.r(20, 40); o += P(`M${n(x)} ${y}q8 -5 16 0t16 0t16 0M${n(310 - x - 48)} ${y}q8 -5 16 0t16 0t16 0`, `fill="none" stroke="${AC.water}" stroke-width=".9" stroke-opacity="${n(.9 - i * .2)}"`); } return o; });
    if (has('air')) put(() => { let o = ''; for (let i = 0; i < 3; i++) { const x = X.r(26, 70) + (i % 2) * 210, y = X.r(30, 180); o += P(`M${n(x - 22)} ${n(y + 10)}L${n(x + 6)} ${n(y + 10)}c14 0 20 -8 14 -16s-16 -4 -12 4M${n(x - 30)} ${n(y + 17)}L${n(x + 12)} ${n(y + 17)}`, `fill="none" stroke="${AC.air}" stroke-width="1.1"`); } return o; });
    return s;
  }

  /* ============================================================ ITEMS */
  const IT = {
    sword(X, sh) { const l = sh ? 60 : 96, w = sh ? 11 : 9; return G(`rotate(${n(X.r(35, 50))}) translate(0 ${sh ? 4 : 12})`, P(Z([[-w, 20], [-w * .8, 20 - l], [0, 20 - l - 18], [w * .8, 20 - l], [w, 20]]), `fill="${METAL}"`) + L(0, 16, 0, 22 - l, TH) + P(`M${-w * .6} 14L${-w * .5} ${24 - l}`, `stroke="${PALE}" stroke-width="2"`) + P('M-30 20Q-34 28 -26 28L26 28Q34 28 30 20Z', `fill="${mix(BRASS, 45)}"`) + R(-5, 28, 10, 32, `fill="${X.w2}"`) + P('M-5 34L5 38M-5 42L5 46M-5 50L5 54', TH) + C(0, 64, 7, `fill="${mix(BRASS, 45)}"`)); },
    axe(X) { return G(`rotate(${n(X.r(20, 35))})`, R(-4, -60, 8, 130, `rx="3" fill="${WOOD}"`) + P('M4 -54Q22 -60 32 -76Q48 -44 32 -8Q22 -26 4 -28Z', `fill="${METAL}"`) + P('M-4 -48L-18 -52L-16 -34L-4 -36Z', `fill="${METAL}"`) + P('M26 -66Q36 -44 28 -18', `fill="none" stroke="${PALE}" stroke-width="2"`) + P('M-4 50L4 54M-4 58L4 62', TH)); },
    hammer(X, mace) { return G(`rotate(${n(X.r(20, 35))})`, R(-4, -46, 8, 118, `rx="3" fill="${WOOD}"`) + (mace ? P(star(0, -56, 30, 8, .6), `fill="${METAL}"`) + C(0, -56, 12, `fill="${X.w2}"`) : R(-30, -70, 60, 30, `rx="3" fill="${METAL}"`) + L(-24, -64, 24, -64, `stroke="${PALE}" stroke-width="2"`) + R(-8, -72, 16, 34, `fill="${X.w2}"`)) + P('M-4 52L4 56M-4 60L4 64', TH)); },
    bow(X, xbow) { if (xbow) return G(`rotate(${n(X.r(30, 45))}) translate(0 8)`, P('M-5 -60L5 -60L7 40L14 70L-14 70L-7 40Z', `fill="${WOOD}"`) + P('M-62 -34Q0 -62 62 -34', `fill="none" stroke="${INK}" stroke-width="7"`) + P('M-62 -34Q0 -62 62 -34', `fill="none" stroke="${METAL}" stroke-width="4"`) + P('M-62 -34L0 -4L62 -34', TH) + L(0, -4, 0, -70, 'stroke-width="1.6"') + P('M0 -80l-5 10h10Z', `fill="${METAL}"`) + P('M-4 -64Q-12 -74 0 -76Q12 -74 4 -64', `fill="none" stroke-width="2"`) + P('M5 14l8 6l-2 6', 'fill="none" stroke-width="1.6"'));
      const d = 'M-10 -76C40 -60 40 60 -10 76'; return G(`rotate(${n(X.r(-15, 15))})`, P(d, `fill="none" stroke="${INK}" stroke-width="8"`) + P(d, `fill="none" stroke="${WOOD}" stroke-width="5"`) + R(18, -10, 7, 20, `fill="${X.w2}"`) + L(-10, -76, -10, 76, 'stroke-width=".8"') + L(-10, 0, 74, 0, 'stroke-width="1.4"') + P('M74 0l-12 -6v12Z', `fill="${METAL}"`) + P('M-10 0l-8 -6h-8l8 6l-8 6h8Z', `fill="${X.w}" stroke-width="1"`)); },
    spear(X, pole) { return G(`rotate(${n(X.r(30, 45))})`, R(-3, -60, 6, 150, `rx="2" fill="${WOOD}"`) + (pole ? P('M3 -56Q24 -60 30 -80Q40 -50 26 -30Q14 -40 3 -38Z', `fill="${METAL}"`) + P('M-3 -46L-16 -42L-3 -38', `fill="${METAL}"`) : '') + P('M0 -96Q10 -76 5 -60L-5 -60Q-10 -76 0 -96Z', `fill="${METAL}"`) + L(0, -90, 0, -62, TH) + P('M-5 -56L5 -52M-5 -50L5 -46', `fill="none" stroke="${X.c}" stroke-width="1.6"`)); },
    armor(X) { return P('M-30 -54Q-44 -52 -58 -40Q-62 -24 -52 -14L-40 -20L-38 40Q0 58 38 40L40 -20L52 -14Q62 -24 58 -40Q44 -52 30 -54Q14 -40 0 -40Q-14 -40 -30 -54Z', `fill="${METAL}"`) + P('M-30 -54Q0 -30 30 -54', TH) + L(0, -40, 0, 48, TH) + P('M-38 14Q0 26 38 14M-38 28Q0 40 38 28', TH) + E(-50, -34, 12, 9, `fill="${X.w2}"`) + E(50, -34, 12, 9, `fill="${X.w2}"`) + P('M-26 -22Q-30 0 -24 20', `fill="none" stroke="${PALE}" stroke-width="3"`); },
    shield(X) { const d = 'M-52 -56L52 -56Q56 10 0 64Q-56 10 -52 -56Z'; const ch = X.ri(0, 2); return P(d, `fill="${METAL}" stroke-width="2.2"`) + P('M-44 -48L44 -48Q46 8 0 54Q-46 8 -44 -48Z', `fill="${X.w}" stroke-width="1"`) + [P('M-44 -10L0 -40L44 -10L44 4L0 -26L-44 4Z', `fill="${X.w2}" stroke-width="1"`), L(0, -48, 0, 54, 'stroke-width="1"') + L(-44, -8, 44, -8, 'stroke-width="1"'), P(star(0, -6, 20, 5, .45), `fill="${X.w2}" stroke-width="1"`)][ch] + C(0, -6, 7, `fill="${METAL}"`); },
    potion(X, cat, t) { const col = cat === 'poison' || t.includes('poison') && cat !== 'potion' ? 'var(--ok)' : cat === 'oil' ? BRASS : X.c; return G(`rotate(${n(X.r(-6, 6))})`, flask(X, X.pick(cat === 'poison' ? ['vial', 'gourd'] : ['round', 'square', 'gourd', 'cone']), col, X.r(-14, 16), { mark: cat === 'poison' })); },
    scroll(X) { let s = P('M-60 -40L60 -40L60 40L-60 40Z', `fill="${mix(BRASS, 14)}"`); for (let i = 0; i < 6; i++) { let d = `M-46 ${-26 + i * 10}`; for (let x = -46; x < 40 - (i === 5 ? 40 : 0); x += 8) d += `q2 ${-X.r(1, 3)} 4 0t4 0`; s += P(d, 'fill="none" stroke-width=".7" stroke="var(--ink-2)"'); }
      for (const x of [-64, 64]) s += R(x - 7, -48, 14, 96, `rx="6" fill="${mix(BRASS, 30)}"`) + E(x, -48, 7, 3, `fill="${SURF}"`) + R(x - 3, -56, 6, 8, `fill="${WOOD}"`) + R(x - 3, 48, 6, 8, `fill="${WOOD}"`);
      return s + P('M20 36L14 60L22 54L28 62L30 38Z', `fill="${X.w2}" stroke-width="1"`) + C(24, 34, 11, `fill="var(--danger)" fill-opacity=".7"`) + P(star(24, 34, 6, 5, .45), `fill="none" stroke="${PALE}" stroke-width=".8"`); },
    ring(X) { return P('M-46 10A46 32 0 1 0 46 10A46 32 0 1 0 -46 10ZM-35 8A35 22 0 1 1 35 8A35 22 0 1 1 -35 8Z', `fill="${mix(BRASS, 45)}" fill-rule="evenodd"`) + P('M-40 22Q-20 38 12 38', `fill="none" stroke="${PALE}" stroke-width="2.5"`) + P('M-16 -18L-10 -34L10 -34L16 -18Z', `fill="${mix(BRASS, 45)}"`) + G('translate(0 -44) scale(.36)', gem(X)); },
    staff(X, kind) { if (kind === 'wand') return G(`rotate(${n(X.r(30, 50))})`, P('M-3 -70L3 -70L6 60L-6 60Z', `fill="${WOOD}"`) + R(-6, 30, 12, 30, `rx="2" fill="${X.w2}"`) + P(star(0, -80, 14, 4, .3), `fill="${mix(X.c, 35)}" stroke-width="1"`) + C(0, -80, 22, `fill="${glowDef(X, 'wd', X.c, .4)}" ${NS}`));
      if (kind === 'rod') return G(`rotate(${n(X.r(25, 40))})`, R(-6, -50, 12, 120, `rx="3" fill="${METAL}"`) + P(star(0, -62, 22, 6, .55), `fill="${mix(BRASS, 45)}"`) + C(0, -62, 8, `fill="${X.w2}"`) + P('M-6 -20L6 -20M-6 20L6 20M-6 50L6 50', 'stroke-width="1.4"'));
      return G(`rotate(${n(X.r(15, 28))})`, P('M-4 -60Q-6 10 -3 96L4 96Q6 10 4 -60Z', `fill="${WOOD}"`) + P('M-4 -58Q-28 -70 -18 -92Q0 -104 14 -86Q20 -74 4 -58', `fill="none" stroke="${INK}" stroke-width="7"`) + P('M-4 -58Q-28 -70 -18 -92Q0 -104 14 -86Q20 -74 4 -58', `fill="none" stroke="${WOOD}" stroke-width="4"`) + C(-3, -78, 12, `fill="${mix(X.c, 40)}"`) + C(-3, -78, 26, `fill="${glowDef(X, 'st', X.c, .35)}" ${NS}`) + C(-7, -82, 3, `fill="${SURF}" ${NS}`) + R(-6, -30, 12, 18, `fill="${X.w2}"`) + P('M-6 -26L6 -22M-6 -20L6 -16', TH)); },
    cloak(X) { return P('M-16 -60Q0 -72 16 -60Q30 -40 40 -34Q56 10 66 56Q30 66 0 58Q-30 66 -66 56Q-56 10 -40 -34Q-30 -40 -16 -60Z', `fill="${X.w}"`) + P('M-16 -60Q0 -30 16 -60Q10 -40 0 -38Q-10 -40 -16 -60Z', `fill="${X.w2}"`) + P('M-20 -30Q-30 20 -40 58M0 -30L0 58M20 -30Q30 20 40 58', 'fill="none" stroke-width="1"') + C(0, -34, 5, `fill="${mix(BRASS, 50)}"`) + P('M-66 56Q-50 50 -40 58Q-26 52 -14 60Q0 54 14 60Q26 52 40 58Q50 50 66 56', 'fill="none" stroke-width="1"'); },
    boots(X) { const b = x => G(`translate(${x} 0)`, P('M-16 -54L14 -54L14 26Q40 30 44 46L44 54L-18 54L-18 20Z', `fill="${X.w}"`) + R(-19, -60, 36, 12, `rx="3" fill="${X.w2}"`) + L(-18, 48, 44, 48, 'stroke-width="2.2"') + P('M-6 -40L6 -34M-6 -28L6 -22M-6 -16L6 -10', TH)); return b(-40) + b(18); },
    book(X) { return P('M-50 -50L40 -60L56 -52L56 54L-34 64L-50 56Z', `fill="${mix(BRASS, 14)}"`) + P('M-50 -50L-34 -42L-34 64L-50 56Z', `fill="${X.w2}"`) + P('M-34 -42L56 -52L56 54L-34 64Z', `fill="${X.w}"`) + P('M-34 -42L40 -60', TH) + [-24, -8, 10, 30].map(y => L(-50, y + 4, -34, y + 12, TH)).join('') + P(star(12, 4, 18, 4, .35), `fill="${mix(BRASS, 45)}" stroke-width="1"`) + C(12, 4, 26, TH) + P('M50 -20L64 -22L64 -4L50 -2Z', `fill="${mix(BRASS, 45)}"`) + P('M-34 -42L-26 -44L-26 -32Z M56 54L46 55L56 44Z', `fill="${mix(BRASS, 45)}" stroke-width="1"`); },
    bag(X) { return P('M-14 -34Q-60 -10 -54 30Q-48 60 0 60Q48 60 54 30Q60 -10 14 -34Z', `fill="${X.w}"`) + P('M-14 -34L-22 -54Q0 -46 22 -54L14 -34Z', `fill="${X.w2}"`) + P('M-16 -34Q0 -28 16 -34', 'fill="none" stroke-width="2.4"') + P('M16 -34Q30 -26 34 -12M16 -34Q22 -20 20 -6', 'fill="none" stroke-width="1.2"') + P('M-20 10L20 10L20 36L-20 36Z', `fill="${X.w2}" stroke-width="1" stroke-dasharray="3 2"`) + P('M-40 0Q-44 30 -26 46', `fill="none" stroke="${PALE}" stroke-width="3"`); },
    lute(X) { return G('rotate(-35)', R(-6, -96, 12, 70, `fill="${WOOD}"`) + P('M-6 -96L-10 -118L10 -118L6 -96Z', `fill="${WOOD}"`) + P('M0 -30C-40 -30 -44 50 0 56C44 50 40 -30 0 -30Z', `fill="${mix(BRASS, 30)}"`) + C(0, 8, 10, `fill="${INK}" fill-opacity=".75"`) + C(0, 8, 14, TH) + R(-10, 34, 20, 5, `fill="${WOOD}"`) + [-3, -1, 1, 3].map(x => L(x, -114, x, 36, 'stroke-width=".4"')).join('') + [-106, -112].map(y => L(-12, y, 12, y, 'stroke-width="2"')).join('')); },
    box(X) { return P('M-54 -10L40 -10L58 -24L-36 -24Z', `fill="${X.w2}"`) + R(-54, -10, 94, 60, `fill="${X.w}"`) + P('M40 -10L58 -24L58 36L40 50Z', `fill="${X.w2}"`) + P('M-54 -10Q-50 -40 -36 -44L50 -44Q60 -40 58 -24', `fill="${mix(X.c, 26)}"`) + [-30, 16].map(x => R(x, -10, 8, 60, `fill="${mix(BRASS, 45)}" stroke-width="1"`)).join('') + C(-7, 20, 14, `fill="var(--danger)" fill-opacity=".7"`) + P(star(-7, 20, 9, 5, .42), `fill="${PALE}" stroke-width=".6"`); },
    tool(X) { return G('rotate(-35)', R(-3.5, -40, 7, 100, `rx="3" fill="${WOOD}"`) + R(-26, -56, 52, 18, `rx="2" fill="${METAL}"`) + P('M26 -56L34 -47L26 -38Z', `fill="${METAL}"`)) + G('rotate(35)', P('M-5 -50L-3 60M5 -50L3 60', `fill="none" stroke="${INK}" stroke-width="6"`) + P('M-5 -50L-3 60M5 -50L3 60', `fill="none" stroke="${METAL}" stroke-width="3"`) + P('M-5 -50Q-14 -60 -6 -70M5 -50Q14 -60 6 -70', `fill="none" stroke-width="3"`) + C(0, -30, 3, `fill="${mix(BRASS, 45)}"`)); },
    bowl(X) { let s = ''; for (let i = 0; i < 3; i++) s += P(`M${-20 + i * 20} -30c-8 -10 8 -16 0 -28`, 'fill="none" stroke="var(--muted)" stroke-width="1.4"'); s += P('M-60 0Q-58 50 0 52Q58 50 60 0Z', `fill="${mix(BRASS, 30)}"`) + E(0, 0, 60, 12, `fill="${SURF}"`) + P('M-46 2Q0 -24 46 2Q0 10 -46 2Z', `fill="${mix('var(--danger)', 25)}"`);
      for (let i = 0; i < 6; i++) s += C(X.r(-30, 30), X.r(-8, 2), X.r(2, 4), `fill="${i % 2 ? mix('var(--ok)', 40) : mix(BRASS, 50)}" stroke-width=".8"`); return s + P('M40 -14L74 -44', 'stroke-width="3"') + P('M-50 14Q-40 36 -20 42', `fill="none" stroke="${PALE}" stroke-width="3"`); },
    arrows(X) { let s = ''; for (let i = -1; i <= 1; i++) s += G(`rotate(${40 + i * 14}) translate(${i * 4} 0)`, L(0, -80, 0, 70, 'stroke-width="2.4"') + L(0, -80, 0, 70, `stroke="${WOOD}" stroke-width="1"`) + P('M0 -96L-6 -78L6 -78Z', `fill="${METAL}"`) + P('M0 44L-8 36L-8 62L0 70Z M0 44L8 36L8 62L0 70Z', `fill="${X.w2}" stroke-width="1"`)); return s; }
  };
  function itemDraw(X, e) {
    const t = e.tags || [], has = (...a) => a.some(x => t.includes(x)), nm = String(e.name || '').toLowerCase(), c = e.cat;
    if (c === 'weapon' || c === 'ammunition' && false) {
      if (has('bow')) return ['bow', IT.bow(X)]; if (has('crossbow')) return ['crossbow', IT.bow(X, 1)]; if (has('axe')) return ['axe', IT.axe(X)];
      if (has('polearm')) return ['polearm', IT.spear(X, 1)]; if (has('spear')) return ['spear', IT.spear(X)]; if (has('dagger')) return ['dagger', IT.sword(X, 1)];
      if (has('hammer')) return ['hammer', IT.hammer(X)]; if (has('bludgeon')) return ['mace', IT.hammer(X, 1)]; return ['sword', IT.sword(X)];
    }
    if (c === 'armor') return has('shield') ? ['shield', IT.shield(X)] : ['armor', IT.armor(X)];
    if (c === 'ammunition') return ['arrows', IT.arrows(X)];
    if (c === 'potion' || c === 'oil' || c === 'poison') return ['bottle', IT.potion(X, c, t)];
    if (c === 'scroll') return ['scroll', IT.scroll(X)];
    if (c === 'ring') return ['ring', IT.ring(X)];
    if (c === 'rod' || c === 'staff' || c === 'wand') return [c, IT.staff(X, c)];
    if (c === 'provision' || c === 'meal') return ['bowl', IT.bowl(X)];
    if (c === 'wondrous' || c === 'gear' || c === 'tool') {
      if (/boot|slipper|shoe|sandal/.test(nm)) return ['boots', IT.boots(X)];
      if (/\b(manual|tome|book|ledger|primer|libram|grimoire|codex|folio)\b/.test(nm)) return ['book', IT.book(X)];
      if (/\b(orb|sphere|crystal ball)\b/.test(nm)) return ['orb', orb(X)];
      if (has('clothing')) return ['cloak', IT.cloak(X)];
      if (has('jewelry') || /amulet|necklace|periapt|talisman|medallion|pendant/.test(nm)) return ['amulet', amulet(X)];
      if (has('container')) return ['bag', IT.bag(X)];
      if (has('instrument')) return ['instrument', IT.lute(X)];
      if (has('gem')) return ['gem', gem(X, 1.1)];
      if (c !== 'wondrous') return ['tool', IT.tool(X)];
      return ['box', IT.box(X)];
    }
    return ['box', IT.box(X)];
  }

  /* ============================================================ MONSTERS */
  const SIZE = { Tiny: .4, Small: .7, Medium: 1, Large: 1.8, Huge: 3.2, Gargantuan: 5 };
  /* silhouettes: ground y=0, a human is 100 tall. [width, height, draw(col, bg)] */
  const biped = (o = {}) => { const hw = o.sh || 12, lw = o.lw || 7, aw = o.aw || 5.5; return C(o.hx || 0, -91 * (o.k || 1), o.hr || 7.5) + P(Z([[-hw, -81], [hw, -81], [hw * .8, -50], [-hw * .8, -50]]), 'stroke-width="3"') + limb([[-5, -50], [-6, -25], [-6, -2]], lw) + limb([[5, -50], [o.st || 6, -25], [(o.st || 6) + 1, -2]], lw) + limb([[-hw, -79], [-hw - 4, -62], [-hw - 5, -45]], aw) + limb([[hw, -79], [hw + 4, -62], [hw + 5, -45]], aw); };
  const quad = () => P(smooth([[-44, -50], [-20, -56], [10, -55], [30, -60], [42, -70], [50, -78], [53, -86], [58, -78], [70, -70], [74, -64], [60, -60], [48, -52], [40, -38], [12, -35], [-22, -37], [-40, -40]], true)) + limb([[34, -42], [36, -20], [34, 0]], 6.5) + limb([[26, -40], [24, -20], [27, 0]], 5) + limb([[-34, -44], [-26, -22], [-36, 0]], 7.5) + limb([[-26, -42], [-20, -22], [-28, 0]], 5.5);
  const CR = {
    beast: [124, 86, () => quad() + limb([[-42, -50], [-56, -46], [-62, -30]], 4)],
    dragon: [180, 112, (c, bg) => E(0, -40, 36, 16) + taper([26, -46], [44, -70], [54, -86], 12, 8, c) + E(62, -88, 13, 6.5) + P('M68 -91L82 -86L68 -83Z') + limb([[58, -93], [52, -102], [46, -104]], 2.4) + taper([-30, -40], [-70, -30], [-96, -6], 12, 2.5, c, 10) + P('M-96 -6l-10 -2l8 -8Z') + P(Z([[10, -50], [-2, -100], [-16, -114], [-26, -88], [-40, -94], [-46, -70], [-62, -72], [-30, -46]])) + P('M-2 -100L-26 -88M-2 -100L-46 -70M-2 -100L-62 -72', `fill="none" stroke="${bg}" stroke-width="1.4"`) + limb([[22, -34], [26, -16], [30, 0]], 7) + limb([[-20, -34], [-28, -16], [-22, 0]], 8) + limb([[12, -30], [14, -12], [16, 0]], 5)],
    humanoid: [60, 104, (c) => biped({ st: 12 }) + L(24, -104, 20, 0, `stroke="${c}" stroke-width="2.4"`) + P('M24 -104l-4 -10l6 0Z') + E(-19, -58, 9, 13)],
    giant: [74, 100, (c) => C(0, -90, 8) + P(Z([[-22, -82], [22, -82], [16, -44], [-16, -44]]), 'stroke-width="6"') + E(0, -52, 17, 12) + limb([[-8, -44], [-10, -20], [-10, -2]], 11) + limb([[8, -44], [10, -20], [11, -2]], 11) + limb([[-22, -80], [-28, -58], [-28, -36]], 9) + limb([[22, -80], [28, -58], [30, -40]], 9) + P('M28 -40L50 -80L58 -76L34 -36Z', 'stroke-width="3"')],
    undead: [70, 96, (c) => C(10, -84, 6.5) + limb([[8, -78], [-2, -66], [-2, -46]], 5) + P('M-8 -48L4 -50L10 -6L4 -12L0 -4L-4 -12L-10 -4L-14 -12Z', 'stroke-width="2"') + limb([[-4, -74], [16, -68], [30, -66]], 3.2) + limb([[0, -72], [14, -60], [30, -58]], 3.2) + P('M30 -66l6 -3M30 -66l6 1M30 -58l6 -2M30 -58l6 2', `fill="none" stroke="${c}" stroke-width="1.4"`) + limb([[-4, -12], [-6, -4], [-8, 0]], 3.5) + limb([[4, -12], [6, -4], [8, 0]], 3.5)],
    elemental: [80, 104, (c, bg) => { let s = P('M-8 0Q-18 -30 -30 -60Q-44 -90 -20 -104Q0 -112 20 -104Q44 -90 30 -60Q18 -30 8 0Z'); for (let i = 0; i < 5; i++) s += P(`M${-30 + i * 3} ${-92 + i * 18}Q0 ${-80 + i * 18} ${28 - i * 5} ${-96 + i * 18}`, `fill="none" stroke="${bg}" stroke-width="2.2"`); return s + C(-36, -40, 6) + C(40, -70, 5) + C(34, -24, 3.5) + E(0, 0, 26, 3); }],
    ooze: [110, 52, (c, bg) => P(smooth([[-54, 0], [-50, -24], [-30, -38], [-10, -46], [12, -44], [34, -34], [52, -18], [56, 0]]) + 'Z') + P('M-30 0q-4 8 0 10q4 -2 0 -10ZM24 0q-3 6 0 8q3 -2 0 -8Z') + C(-12, -26, 5, `fill="${bg}" fill-opacity=".45"`) + C(10, -18, 3, `fill="${bg}" fill-opacity=".45"`) + C(24, -30, 4, `fill="${bg}" fill-opacity=".45"`)],
    plant: [96, 112, (c, bg) => P('M-12 0L-8 -70L8 -70L14 0Z', 'stroke-width="3"') + limb([[-6, -62], [-30, -70], [-40, -92]], 7) + limb([[6, -60], [30, -66], [42, -86]], 7) + [[-40, -96, 16], [-20, -104, 18], [4, -108, 20], [28, -100, 18], [44, -90, 14], [-4, -88, 18]].map(([x, y, r]) => C(x, y, r)).join('') + limb([[-10, -4], [-24, -2], [-32, 0]], 5) + limb([[12, -4], [26, -2], [34, 0]], 5) + E(-4, -52, 2.5, 1.8, `fill="${bg}"`) + E(5, -52, 2.5, 1.8, `fill="${bg}"`)],
    fiend: [80, 108, (c) => biped({ sh: 14 }).replace(/limb/g, '') + limb([[-4, -88], [-12, -100], [-8, -110]], 3.4) + limb([[4, -88], [12, -100], [8, -110]], 3.4) + limb([[-4, -50], [-24, -30], [-36, -40]], 3) + P('M-36 -40l-8 -2l5 -7Z') + P(Z([[12, -78], [36, -100], [40, -86], [48, -84], [34, -64]]))],
    celestial: [120, 116, (c) => { let s = ''; for (let i = 0; i < 5; i++) for (const d of [-1, 1]) s += E(d * (22 + i * 6), -80 - i * 4 + i * i, 30 - i * 3, 6, `transform="rotate(${d * (-30 + i * 14)} ${d * (22 + i * 6)} ${-80 - i * 4 + i * i})"`); return s + biped({}) + P('M-12 -52L12 -52L20 0L-20 0Z') + E(0, -104, 9, 3, `fill="none" stroke="${c}" stroke-width="2"`); }],
    construct: [70, 100, (c, bg) => R(-9, -100, 18, 16, 'rx="2"') + R(-22, -82, 44, 36, 'rx="3"') + R(-34, -82, 12, 14) + R(22, -82, 12, 14) + R(-34, -66, 10, 30) + R(24, -66, 10, 30) + R(-18, -44, 14, 44) + R(4, -44, 14, 44) + R(-6, -95, 12, 3, `fill="${bg}"`) + [[-14, -74], [14, -74], [-14, -54], [14, -54]].map(([x, y]) => C(x, y, 1.8, `fill="${bg}"`)).join('')],
    aberration: [110, 96, (c, bg) => { let s = E(0, -62, 30, 28); for (let i = 0; i < 6; i++) { const x = -24 + i * 10, e = (i - 2.5) * 16; s += taper([x, -42], [x + e * .4, -8], [x + e, -2 - (i % 2) * 8], 8, 2, c); } return s + C(0, -66, 10, `fill="${bg}"`) + C(0, -66, 4.5); }],
    fey: [80, 92, (c) => E(-18, -76, 18, 12, 'fill-opacity=".55" transform="rotate(-30 -18 -76)"') + E(18, -76, 18, 12, 'fill-opacity=".55" transform="rotate(30 18 -76)"') + E(-14, -56, 10, 7, 'fill-opacity=".55" transform="rotate(30 -14 -56)"') + E(14, -56, 10, 7, 'fill-opacity=".55" transform="rotate(-30 14 -56)"') + biped({ sh: 8, lw: 4.5, aw: 3.5, hr: 6.5 }) + P('M-6 -93l-6 -6l2 7ZM6 -93l6 -6l-2 7Z')],
    monstrosity: [150, 100, (c) => quad() + P(Z([[0, -56], [-14, -100], [-26, -96], [-36, -80], [-48, -82], [-44, -58]])) + taper([-40, -50], [-78, -60], [-70, -96], 7, 3, c) + P('M-70 -96l8 -12l2 12Z') + P('M58 -66L70 -60L62 -54Z') + limb([[50, -68], [48, -80], [42, -86]], 3)]
  };
  function monsterDraw(X, e) {
    const f = SIZE[e.size] || 1, [w, h, draw] = CR[e.type] || CR.beast;
    const u = Math.min(100, 146 * 100 / (f * h), 240 / (.4 + f * w / 100)), k = f * u / 100, hs = u / 100, gap = 14 * Math.min(1, u / 60) + 8;
    const tot = u * .4 + gap + w * k, hx = 160 - tot / 2 + u * .2, cx = hx + u * .2 + gap + w * k / 2, flip = e.type === 'dragon' || e.type === 'beast' || e.type === 'monstrosity' ? -1 : 1;
    const col = INK, bg = 'var(--surface-2)', gy = 182;
    let s = P(`M20 ${gy}L300 ${gy}`, 'stroke="var(--ink-2)" stroke-width="1.2"');
    for (let x = 22; x < 300; x += 7) s += L(x, gy + 1, x - 4, gy + 6, 'stroke="var(--line)" stroke-width=".8"');
    s += E(cx, gy, w * k * .45, 2 + 3 * k, `fill="${INK}" fill-opacity=".08"`);
    s += G(`translate(${n(hx)} ${gy}) scale(${n(hs * 1000) / 1000})`, biped({}), 'fill="var(--muted)" stroke="var(--muted)" opacity=".5" stroke-linecap="round" stroke-linejoin="round"');
    s += G(`translate(${n(cx)} ${gy}) scale(${n(k * flip * 1000) / 1000} ${n(k * 1000) / 1000})`, draw(col, bg), `fill="${col}" stroke="${col}" opacity=".88" stroke-linecap="round" stroke-linejoin="round"`);
    const bar = u * 5 / 5.9, bx = 296 - bar, by = 196;
    s += R(bx, by, bar / 2, 3.2, `fill="${INK}" stroke="${INK}" stroke-width=".7"`) + R(bx + bar / 2, by, bar / 2, 3.2, `fill="var(--surface)" stroke="${INK}" stroke-width=".7"`);
    s += `<text x="${n(bx - 4)}" y="${by + 3.4}" text-anchor="end" font-size="7.5" font-family="var(--f-mono, monospace)" fill="var(--ink-2)">0—5 ft</text>`;
    return [e.type || 'beast', s];
  }

  /* ============================================================ PLACES */
  function ridge(X, y, amp, step, jag, fill, a = '') {
    const pts = [[0, 220]], ph = [X.r(0, 6), X.r(0, 6)];
    for (let x = -10; x <= 330; x += step) pts.push([x, y + Math.sin(x * .021 + ph[0]) * amp * .6 + Math.sin(x * .053 + ph[1]) * amp * .4 + (jag ? X.r(-amp, amp) * .5 : 0)]);
    pts.push([330, 220]);
    return P(jag ? Z(pts) : smooth(pts.slice(1, -1)) + 'L330 220L-10 220Z', `fill="${fill}" ${a}`);
  }
  const pine = (x, y, h, f) => { let s = R(x - 1.2, y - h * .2, 2.4, h * .2, `fill="${f}"`); for (let i = 0; i < 3; i++) s += P(Z([[x - h * (.28 - i * .06), y - h * (.18 + i * .22)], [x, y - h * (.55 + i * .15)], [x + h * (.28 - i * .06), y - h * (.18 + i * .22)]]), `fill="${f}"`); return s; };
  const tree = (x, y, h, f) => R(x - 1.5, y - h * .5, 3, h * .5, `fill="${f}"`) + C(x, y - h * .65, h * .3, `fill="${f}"`) + C(x - h * .18, y - h * .52, h * .2, `fill="${f}"`) + C(x + h * .2, y - h * .55, h * .2, `fill="${f}"`);
  const dead = (X, x, y, h, f) => { let s = ''; const br = (x0, y0, a, l, w, d) => { if (d > 3) return; const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; s += L(x0, y0, x1, y1, `stroke="${f}" stroke-width="${n(w)}" stroke-linecap="round"`); br(x1, y1, a - X.r(.3, .7), l * .65, w * .6, d + 1); br(x1, y1, a + X.r(.3, .7), l * .6, w * .6, d + 1); }; br(x, y, -PI / 2 + X.r(-.1, .1), h * .45, h * .07, 0); return s; };
  const cloud = (x, y, s, f) => [[0, 0, 12], [14, -5, 14], [30, 0, 11], [16, 4, 12]].map(([a, b, r]) => C(x + a * s, y + b * s, r * s, `fill="${f}"`)).join('');
  const sky = (X, A, o) => { const g = X.uid('sky'); X.defs += `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A}" stop-opacity="${o}"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></linearGradient>`; return R(0, 0, 320, 220, `fill="url(#${g})"`); };
  const stars = (X, k, f, y1 = 120) => { let s = ''; for (let i = 0; i < k; i++) s += C(X.r(12, 308), X.r(12, y1), X.r(.4, 1.3), `fill="${f}"`); return s; };
  const PL = {
    arctic: ['var(--t-rare)', (X, A, l) => sky(X, A, .25) + C(250, 58, 16, `fill="${PALE}" stroke="${l(30)}"`) + ridge(X, 100, 26, 22, 1, l(22)) + ridge(X, 140, 14, 26, 1, PALE, `stroke="${l(55)}" stroke-width="1"`) + P('M40 170L90 164L120 172L70 178Z M180 180L240 172L280 182L220 188Z', `fill="${l(20)}" stroke="${l(60)}"`) + ridge(X, 192, 4, 30, 0, l(35)) + stars(X, 18, l(60), 200)],
    coast: ['var(--t-rare)', (X, A, l) => sky(X, A, .2) + C(90, 70, 18, `fill="${mix(BRASS, 30)}"`) + R(0, 120, 320, 100, `fill="${l(28)}"`) + [132, 146, 162, 180].map((y, i) => P(`M${10 + i * 20} ${y}q12 -4 24 0t24 0t24 0M${150 + i * 10} ${y + 4}q12 -4 24 0t24 0`, `fill="none" stroke="${l(60)}" stroke-width="1"`)).join('') + P('M200 220L210 120Q240 96 280 100L320 110L320 220Z', `fill="${l(65)}"`) + R(262, 70, 10, 32, `fill="${PALE}" stroke="${l(80)}"`) + P('M260 70L267 60L274 70Z', `fill="${l(80)}"`) + P('M60 50q5 -5 10 0q5 -5 10 0M100 38q4 -4 8 0q4 -4 8 0', `fill="none" stroke="${l(80)}" stroke-width="1.2"`)],
    desert: ['var(--t-legendary)', (X, A, l) => sky(X, A, .28) + C(230, 66, 26, `fill="${l(40)}"`) + P('M60 130L100 80L140 130Z', `fill="${l(35)}"`) + L(100, 80, 112, 130, `stroke="${l(55)}"`) + ridge(X, 140, 16, 40, 0, l(30)) + ridge(X, 170, 14, 40, 0, l(48)) + ridge(X, 200, 8, 50, 0, l(65)) + P('M250 196L250 160M250 176L240 174L240 164M250 170L260 168L260 158', `fill="none" stroke="${l(80)}" stroke-width="5" stroke-linecap="round"`)],
    forest: ['var(--t-uncommon)', (X, A, l) => { let s = sky(X, A, .18) + ridge(X, 110, 14, 24, 0, l(20)); for (let r = 0; r < 3; r++) for (let i = 0; i < 12 - r * 2; i++) s += pine(X.r(0, 320), 130 + r * 30 + X.r(-4, 4), 50 + r * 18 + X.r(-8, 8), l(30 + r * 22)); return s + ridge(X, 204, 5, 30, 0, l(70)); }],
    grassland: ['var(--ok)', (X, A, l) => { let s = sky(X, A, .15) + cloud(60, 50, 1, PALE) + cloud(210, 36, .8, PALE) + ridge(X, 130, 10, 40, 0, l(22)) + ridge(X, 160, 10, 40, 0, l(38)) + tree(240, 150, 44, l(55)); s += ridge(X, 188, 6, 40, 0, l(55)); for (let i = 0; i < 26; i++) { const x = X.r(10, 310), y = X.r(190, 212); s += P(`M${n(x - 3)} ${n(y)}L${n(x - 2)} ${n(y - 6)}M${n(x)} ${n(y)}L${n(x)} ${n(y - 8)}M${n(x + 3)} ${n(y)}L${n(x + 3)} ${n(y - 6)}`, `stroke="${l(80)}" stroke-width=".8"`); } return s; }],
    hill: ['var(--t-uncommon)', (X, A, l) => sky(X, A, .15) + C(70, 50, 14, `fill="${mix(BRASS, 30)}"`) + ridge(X, 110, 30, 40, 0, l(22)) + ridge(X, 150, 26, 44, 0, l(40)) + tree(80, 150, 30, l(60)) + tree(250, 144, 26, l(60)) + ridge(X, 186, 18, 50, 0, l(58)) + P('M150 220Q170 196 210 188', `fill="none" stroke="${PALE}" stroke-width="4" stroke-dasharray="6 4"`)],
    mountain: ['var(--accent)', (X, A, l) => { let s = sky(X, A, .18); const pk = (x, y, w, f) => P(Z([[x - w, 220], [x, y], [x + w, 220]]), `fill="${f}"`) + P(Z([[x - w * .22, y + (220 - y) * .22], [x, y], [x + w * .22, y + (220 - y) * .22], [x + w * .08, y + (220 - y) * .17], [x - w * .06, y + (220 - y) * .24]]), `fill="${PALE}"`); s += pk(80, 50, 90, l(30)) + pk(230, 34, 110, l(40)) + pk(150, 80, 80, l(55)); return s + ridge(X, 190, 10, 16, 1, l(72)); }],
    swamp: ['var(--accent)', (X, A, l) => { let s = sky(X, A, .22) + ridge(X, 130, 8, 30, 0, l(24)) + R(0, 150, 320, 70, `fill="${l(34)}"`); for (let i = 0; i < 3; i++) s += dead(X, 60 + i * 100 + X.r(-20, 20), 156, 90 - i * 10, l(70)); for (let i = 0; i < 5; i++) s += P(`M${20 + i * 64} ${166 + i % 2 * 20}q16 -3 32 0`, `fill="none" stroke="${l(60)}" stroke-width="1"`); for (let i = 0; i < 16; i++) { const x = X.r(0, 320); s += L(x, 212, x + X.r(-4, 4), 186 + X.r(0, 12), `stroke="${l(78)}" stroke-width="1.4"`); } return s + R(0, 140, 320, 14, `fill="${PALE}" fill-opacity=".45"`); }],
    underdark: ['var(--t-very-rare)', (X, A, l) => { let s = R(0, 0, 320, 220, `fill="${l(18)}"`); for (let i = 0; i < 14; i++) { const x = i * 24 + X.r(0, 10), h = X.r(16, 56); s += P(Z([[x - 10, 0], [x, h], [x + 10, 0]]), `fill="${l(55)}"`); } for (let i = 0; i < 9; i++) { const x = i * 38 + X.r(0, 14), h = X.r(20, 60); s += P(Z([[x - 12, 220], [x, 220 - h], [x + 12, 220]]), `fill="${l(45)}"`); } s += ridge(X, 196, 8, 20, 1, l(70)); for (let i = 0; i < 6; i++) { const x = X.r(20, 300), y = X.r(186, 198); s += C(x, y, 8, `fill="${glowDef(X, 'ud' + i, A, .5)}"`) + L(x, y + 8, x, y, `stroke="${l(80)}" stroke-width="1.2"`) + E(x, y, 4, 2.4, `fill="${A}"`); } return s; }],
    underwater: ['var(--t-rare)', (X, A, l) => { let s = R(0, 0, 320, 220, `fill="${l(22)}"`) + sky(X, 'var(--surface)', .5); for (let i = 0; i < 5; i++) s += P(Z([[40 + i * 60, 0], [60 + i * 60, 0], [30 + i * 64, 200], [10 + i * 64, 200]]), `fill="${PALE}" fill-opacity=".14"`); for (let i = 0; i < 7; i++) { const x = X.r(10, 310), h = X.r(40, 110); s += P(`M${n(x)} 210q-10 ${n(-h / 4)} 0 ${n(-h / 2)}t0 ${n(-h / 2)}`, `fill="none" stroke="${l(60)}" stroke-width="3"`); } for (let i = 0; i < 10; i++) s += C(X.r(20, 300), X.r(20, 170), X.r(1, 3), `fill="none" stroke="${l(70)}" stroke-width=".8"`); s += P('M200 80q14 -10 28 0q-14 10 -28 0l-8 -6v12Z M120 110q10 -7 20 0q-10 7 -20 0l-6 -4v8Z', `fill="${l(60)}"`); return s + ridge(X, 200, 8, 24, 0, l(55)); }],
    urban: ['var(--brass)', (X, A, l) => { let s = sky(X, A, .2) + C(250, 52, 14, `fill="${PALE}"`); let x = 6; while (x < 314) { const w = X.r(18, 34), h = X.r(40, 110), y = 196 - h, f = l(X.chance(.5) ? 45 : 60); s += R(x, y, w, h, `fill="${f}"`); if (X.chance(.35)) s += P(Z([[x - 2, y], [x + w / 2, y - X.r(12, 30)], [x + w + 2, y]]), `fill="${f}"`); for (let wy = y + 8; wy < 186; wy += 12) for (let wx = x + 4; wx < x + w - 5; wx += 8) if (X.chance(.4)) s += R(wx, wy, 3, 5, `fill="${mix(BRASS, 55)}"`); x += w + X.r(1, 5); } return s + R(0, 196, 320, 24, `fill="${l(72)}"`); }],
    ruins: ['var(--muted)', (X, A, l) => { let s = sky(X, 'var(--brass)', .2) + ridge(X, 150, 10, 40, 0, l(22)); for (let i = 0; i < 5; i++) { const x = 30 + i * 62, h = X.r(40, 110), y = 190 - h; s += R(x - 8, y, 16, h, `fill="${l(50)}"`) + L(x - 3, y + 4, x - 3, 190, `stroke="${l(70)}" stroke-width=".8"`) + L(x + 3, y + 4, x + 3, 190, `stroke="${l(70)}" stroke-width=".8"`) + P(Z([[x - 8, y], [x - 2, y - 6], [x + 3, y - 1], [x + 8, y - 4], [x + 8, y]]), `fill="${l(50)}"`); } s += P('M140 190L140 120A30 30 0 0 1 200 120L200 190L188 190L188 124A18 18 0 0 0 152 124L152 190Z', `fill="${l(62)}"`); for (let i = 0; i < 8; i++) s += R(X.r(10, 300), X.r(186, 196), X.r(8, 16), X.r(5, 9), `fill="${l(62)}" transform="rotate(${n(X.r(-20, 20))} 160 190)"`); return s + ridge(X, 200, 4, 30, 0, l(72)); }],
    feywild: ['var(--t-very-rare)', (X, A, l) => { let s = sky(X, A, .3) + stars(X, 22, BRASS, 110) + P('M250 40A20 20 0 1 0 268 70A16 16 0 1 1 250 40Z', `fill="${mix(BRASS, 45)}"`) + ridge(X, 140, 16, 40, 0, l(26)); for (let i = 0; i < 4; i++) { const x = 40 + i * 76 + X.r(-10, 10), h = X.r(40, 80); s += P(`M${n(x - 4)} 200Q${n(x - 8)} ${n(200 - h / 2)} ${n(x - 3)} ${n(200 - h)}L${n(x + 3)} ${n(200 - h)}Q${n(x + 2)} ${n(200 - h / 2)} ${n(x + 6)} 200Z`, `fill="${l(55)}"`) + P(`M${n(x - h * .45)} ${n(206 - h)}Q${n(x)} ${n(170 - h * 1.2)} ${n(x + h * .45)} ${n(206 - h)}Z`, `fill="${l(i % 2 ? 50 : 65)}"`); } s += ridge(X, 198, 6, 30, 0, l(62)); for (let i = 0; i < 12; i++) s += P(star(X.r(10, 310), X.r(100, 196), X.r(2, 4)), `fill="${BRASS}"`); return s; }],
    shadowfell: ['var(--muted)', (X, A, l) => { let s = R(0, 0, 320, 220, `fill="${mix(INK, 10, 'var(--surface-2)')}"`) + C(90, 56, 20, `fill="${PALE}" fill-opacity=".7" stroke="${l(40)}"`) + ridge(X, 130, 16, 26, 1, mix(INK, 20, 'var(--surface-2)')); for (let i = 0; i < 4; i++) s += dead(X, 30 + i * 84 + X.r(-10, 10), 196, X.r(70, 110), mix(INK, 55, 'var(--surface-2)')); s += ridge(X, 194, 5, 20, 1, mix(INK, 60, 'var(--surface-2)')); for (let i = 0; i < 3; i++) s += P(`M0 ${150 + i * 18}q80 -8 160 0t160 0`, `fill="none" stroke="${PALE}" stroke-width="5" stroke-opacity=".25"`); return s; }],
    'elemental-fire': ['var(--t-legendary)', (X, A, l) => { let s = sky(X, 'var(--danger)', .3) + P('M90 220L150 90L170 90L230 220Z', `fill="${l(45)}"`) + P('M150 90Q160 60 150 30Q170 50 172 90Z', `fill="${l(35)}"`) + P('M155 92L150 130L162 160L156 200', `fill="none" stroke="var(--danger)" stroke-width="3"`); for (let i = 0; i < 10; i++) { const x = i * 34 + X.r(0, 10), h = X.r(20, 44); s += P(`M${n(x - 12)} 220Q${n(x - 10)} ${n(220 - h * .6)} ${n(x)} ${n(220 - h)}Q${n(x + 2)} ${n(220 - h * .5)} ${n(x + 12)} 220Z`, `fill="${l(70)}"`); } for (let i = 0; i < 16; i++) s += C(X.r(20, 300), X.r(20, 180), X.r(.8, 2), `fill="${A}"`); return s; }],
    'elemental-water': ['var(--t-rare)', (X, A, l) => { let s = sky(X, A, .25) + R(0, 110, 320, 110, `fill="${l(30)}"`); for (let i = 0; i < 5; i++) s += E(160, 160, 120 - i * 22, 30 - i * 5, `fill="none" stroke="${l(60 + i * 5)}" stroke-width="1.4"`); s += P('M0 120Q40 60 90 70Q60 80 70 110Q90 90 110 110Z', `fill="${l(55)}"`) + P('M320 130Q280 60 230 70Q260 80 250 116Q230 96 214 120Z', `fill="${l(55)}"`); for (let i = 0; i < 3; i++) s += P(`M0 ${190 + i * 10}q20 -8 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0`, `fill="none" stroke="${l(70)}" stroke-width="1.4"`); return s; }],
    'elemental-air': ['var(--accent)', (X, A, l) => { let s = sky(X, A, .25); for (let i = 0; i < 6; i++) s += cloud(X.r(-10, 280), X.r(20, 190), X.r(.8, 1.6), PALE); s += P('M110 130L210 130L180 170L140 170Z', `fill="${l(55)}"`) + tree(150, 130, 26, l(70)) + tree(176, 132, 20, l(70)); for (let i = 0; i < 4; i++) { const x = X.r(20, 280), y = X.r(30, 190); s += P(`M${n(x)} ${n(y)}q20 -10 40 0q14 8 4 16q-10 4 -12 -6`, `fill="none" stroke="${l(55)}" stroke-width="1.2"`); } return s; }],
    'elemental-earth': ['var(--brass)', (X, A, l) => { let s = R(0, 0, 320, 220, `fill="${l(14)}"`); for (let i = 0; i < 5; i++) { const x = 30 + i * 64 + X.r(-8, 8), h = X.r(50, 120); s += P(Z([[x - 12, 210], [x - 8, 210 - h], [x, 210 - h - 20], [x + 8, 210 - h], [x + 12, 210]]), `fill="${l(i % 2 ? 40 : 55)}"`) + L(x, 210 - h - 16, x, 206, `stroke="${l(75)}" stroke-width=".8"`); } for (let i = 0; i < 4; i++) { const x = X.r(30, 290), y = X.r(24, 90), r = X.r(8, 16); s += P(Z([[x - r, y], [x - r * .4, y - r * .6], [x + r * .6, y - r * .5], [x + r, y], [x, y + r * 1.2]]), `fill="${l(48)}"`); } return s + ridge(X, 200, 10, 18, 1, l(70)); }],
    'lower-planes': ['var(--danger)', (X, A, l) => { let s = sky(X, A, .35); for (let i = 0; i < 7; i++) { const x = 20 + i * 46 + X.r(-10, 10), h = X.r(40, 120); s += P(Z([[x - 10, 200], [x - 3, 200 - h], [x, 200 - h - 14], [x + 3, 200 - h], [x + 10, 200]]), `fill="${mix(INK, 45 + (i % 2) * 20, 'var(--surface-2)')}"`); } s += ridge(X, 196, 8, 16, 1, mix(INK, 70, 'var(--surface-2)')) + P('M0 206Q80 196 160 206T320 204', `fill="none" stroke="${A}" stroke-width="3"`); for (let i = 0; i < 12; i++) s += C(X.r(10, 310), X.r(20, 150), X.r(.8, 1.8), `fill="${A}"`); return s; }],
    'upper-planes': ['var(--brass)', (X, A, l) => { let s = sky(X, A, .3); for (let i = 0; i < 24; i++) { const [x, y] = polar(160, 40, 200, PI * i / 23); s += L(160, 40, x, y, `stroke="${A}" stroke-width=".8" stroke-opacity=".4"`); } s += C(160, 40, 20, `fill="${PALE}" stroke="${A}"`); for (let i = 0; i < 5; i++) { const x = 90 + i * 35, h = 50 + (2 - Math.abs(i - 2)) * 26; s += R(x - 6, 170 - h, 12, h, `fill="${l(35)}"`) + P(Z([[x - 8, 170 - h], [x, 150 - h], [x + 8, 170 - h]]), `fill="${l(55)}"`); } for (let i = 0; i < 7; i++) s += cloud(i * 50 - 10, 176 + (i % 2) * 10, 1.4, PALE); return s; }],
    astral: ['var(--t-very-rare)', (X, A, l) => { let s = R(0, 0, 320, 220, `fill="${l(18)}"`) + stars(X, 60, 'var(--ink-2)', 210); for (let i = 0; i < 3; i++) s += E(160, 110, 150 - i * 30, 30 - i * 6, `fill="none" stroke="${l(40)}" stroke-width="${6 - i * 1.5}" stroke-opacity=".5" transform="rotate(-14 160 110)"`); s += P('M200 120Q210 90 250 94Q280 100 270 124Q250 140 200 120Z', `fill="${l(55)}"`) + P('M40 150l30 -10l12 10l-8 14l-26 4Z', `fill="${l(45)}"`) + L(0, 40, 320, 150, `stroke="${PALE}" stroke-width=".8" stroke-opacity=".6"`); for (let i = 0; i < 5; i++) s += P(star(X.r(20, 300), X.r(20, 200), X.r(3, 5)), `fill="${PALE}"`); return s; }]
  };
  function placeDraw(X, e) {
    const [A, fn] = PL[e.id] || PL.grassland, l = p => mix(A, p, 'var(--surface-2)');
    const clip = clipDef(X, 'pl', 'M8.5 8.5H311.5V211.5H8.5Z');
    return [e.id, `<g ${clip}>${fn(X, A, l)}</g>`];
  }

  /* ============================================================ PLATE */
  function plate(e, opts) {
    opts = opts || {}; e = e || {};
    const X = makeCtx(e), kind = e.kind || (e.size && e.type ? 'monster' : e.cat ? 'item' : e.tags ? 'material' : 'place');
    const tier = /^(mundane|common|uncommon|rare|very-rare|legendary)$/.test(e.tier) ? e.tier : 'common', tags = Array.isArray(e.tags) ? e.tags : [];
    X.c = `var(--t-${tier})`; const tone = tier === 'mundane' || tier === 'common' ? mix(X.c, 55, BRASS) : X.c; X.w = mix(tone, 17); X.w2 = mix(tone, 34);
    const tex = X.uid('tex'), vig = X.uid('vig');
    X.defs += `<pattern id="${tex}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0V5" stroke="var(--ink)" stroke-opacity=".05" stroke-width="1"/></pattern><radialGradient id="${vig}" r=".75"><stop offset=".55" stop-color="var(--brass)" stop-opacity="0"/><stop offset="1" stop-color="var(--brass)" stop-opacity=".1"/></radialGradient>`;
    let body = '', group = kind, over = '';
    if (kind === 'monster') [group, body] = monsterDraw(X, e);
    else if (kind === 'place') [group, body] = placeDraw(X, e);
    else {
      let g, d;
      if (kind === 'item') [g, d] = itemDraw(X, e); else { g = formOf(tags); d = MAT[g](X, tags); }
      group = g;
      const sc = n(X.r(.96, 1.04) * (kind === 'item' ? 1.08 : 1.16)), rt = kind === 'material' && !/liquid|jar|essence/.test(g) ? n(X.r(-8, 8)) : 0;
      body = E(160, 178, 64, 5, `fill="var(--ink)" fill-opacity=".07"`) + G(`translate(160 106) rotate(${rt}) scale(${sc})`, d, `stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="${X.w}"`);
      if (kind === 'item' && tier === 'legendary') body = C(160, 106, 96, `fill="${glowDef(X, 'leg', 'var(--t-legendary)', .32)}"`) + body;
      over = auras(X, tags);
    }
    let spk = ''; for (let i = 0, k = X.ri(3, 8); i < k; i++) spk += C(X.r(14, 306), X.r(14, 206), X.r(.5, 1.6), `fill="var(--brass)" fill-opacity=".22"`);
    const fo = kind === 'monster' || kind === 'place' ? 'var(--line)' : X.c, fi = kind === 'monster' || kind === 'place' ? BRASS : X.c;
    const corner = `<path d="M0 16V4Q0 0 4 0H16" fill="none" stroke="var(--brass)" stroke-width="1"/><path d="M4 12V6Q4 4 6 4H12" fill="none" stroke="var(--brass)" stroke-width=".6"/><circle cx="8" cy="8" r="1.3" fill="var(--brass)"/>`;
    const frame = R(4, 4, 312, 212, `fill="none" stroke="${fo}" stroke-width="1.6"`) + R(8.5, 8.5, 303, 203, `fill="none" stroke="${fi}" stroke-width=".6"`) + [[12, 12, 1, 1], [308, 12, -1, 1], [12, 208, 1, -1], [308, 208, -1, -1]].map(([x, y, a, b]) => G(`translate(${x} ${y}) scale(${a} ${b})`, corner)).join('');
    let cap = '';
    if (opts.caption) {
      const txt = typeof opts.caption === 'string' ? esc(opts.caption) : 'PL. ' + (1 + X.seed % 480), w = Math.max(40, txt.length * 5.6 + 16);
      cap = R(160 - w / 2, 200, w, 13, `rx="2" fill="var(--surface-2)" stroke="${fi}" stroke-width=".6"`) + `<text x="160" y="209.6" text-anchor="middle" font-size="8" letter-spacing="1.2" font-family="var(--f-display, Georgia, serif)" fill="var(--ink-2)">${txt}</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="100%" style="display:block;height:auto" role="img" aria-label="Specimen plate: ${esc(group)}" data-plate="${esc(kind)}:${esc(group)}"><defs>${X.defs}</defs>` +
      R(0, 0, 320, 220, 'fill="var(--surface-2)"') + R(0, 0, 320, 220, `fill="url(#${tex})"`) + body + over + R(0, 0, 320, 220, `fill="url(#${vig})"`) + spk + frame + cap + '</svg>';
  }

  window.CodexPlates = { plate };
})();

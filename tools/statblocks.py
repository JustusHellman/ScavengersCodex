#!/usr/bin/env python3
"""
Builds statblocks.json: the SRD stat block of every codex creature (AC, HP, speed, abilities, skills,
senses, traits, actions …), for the DM's creature pages and for battle maps in DnDocs.

The numbers come from the SRD (5.1 and 5.2.1, CC-BY-4.0) as machine-readable in the 5e-database
project (https://github.com/5e-bits/5e-database, MIT). Run it once after adding SRD creatures:

    git clone --depth 1 https://github.com/5e-bits/5e-database /tmp/5e-database
    python3 tools/statblocks.py /tmp/5e-database

Homebrew creatures have no SRD stat block and are left out.
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Codex creatures with several SRD forms: the one a fight usually needs.
FORMS = {'vampire': 'Vampire, Vampire Form', 'werewolf': 'Werewolf, Hybrid Form', 'wererat': 'Wererat, Hybrid Form',
         'wereboar': 'Wereboar, Hybrid Form', 'weretiger': 'Weretiger, Hybrid Form', 'werebear': 'Werebear, Hybrid Form'}
ABIL = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
XP = {'0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
      '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000,
      '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000}

def norm(s): return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()
def sign(n): return f'+{n}' if n >= 0 else str(n)
def cr_text(cr):
    if isinstance(cr, float) and not cr.is_integer(): cr = {0.125: '1/8', 0.25: '1/4', 0.5: '1/2'}.get(cr, str(cr))
    else: cr = str(int(cr))
    return cr, f"{cr} ({XP.get(cr, 0):,} XP)"

def ac_text(acs):
    out = []
    for a in acs or []:
        v = a.get('value'); t = a.get('type'); extra = ''
        if t == 'armor' and a.get('armor'): extra = ', '.join(x['name'].lower() for x in a['armor'])
        elif t == 'natural': extra = 'natural armor'
        elif t == 'spell' and a.get('spell'): extra = a['spell']['name']
        elif t == 'condition' and a.get('condition'): extra = 'in ' + a['condition']['name'].lower()
        out.append(f'{v} ({extra})' if extra else str(v))
    return ', '.join(out)

def hp_text(m):
    roll = m.get('hit_points_roll') or m.get('hit_dice') or ''
    roll = re.sub(r'([+-])', r' \1 ', roll).replace('  ', ' ').strip()
    return f"{m['hit_points']} ({roll})" if roll else str(m['hit_points'])

def speed_text(sp):
    parts = []
    for k, v in (sp or {}).items():
        if k == 'hover': continue
        parts.append(v if k == 'walk' else f'{k} {v}')
    if (sp or {}).get('hover'): parts[-1] += ' (hover)'
    return ', '.join(parts)

def prof_lists(m):
    saves, skills = [], []
    for p in m.get('proficiencies') or []:
        n = p['proficiency']['name']
        if n.startswith('Saving Throw: '): saves.append(f"{n[14:].title()} {sign(p['value'])}")
        elif n.startswith('Skill: '): skills.append(f"{n[7:]} {sign(p['value'])}")
    return saves, skills

def senses_text(se):
    out = []
    for k, v in (se or {}).items():
        out.append(f'passive Perception {v}' if k == 'passive_perception' else f"{k.replace('_', ' ')} {v}")
    return ', '.join(out)

def lst(xs): return ', '.join(x if isinstance(x, str) else x.get('name', '') for x in xs or [])

def block(name, entries):
    out = []
    for e in entries or []:
        nm = e['name']
        u = e.get('usage') or {}
        if u.get('type') == 'per day': nm += f" ({u.get('times')}/Day)"
        elif u.get('type') == 'recharge on roll': nm += f" (Recharge {u.get('min_value')}–6)" if u.get('min_value', 6) < 6 else ' (Recharge 6)'
        elif u.get('type') == 'recharge after rest': nm += f" (Recharges after a {' or '.join(u.get('rest_types', []))} rest)".replace('short or long', 'Short or Long')
        desc = (e.get('desc') or '').replace('\n', '\n\n')
        out.append(f'***{nm}.*** {desc}')
    return ([f'### {name}'] if name and out else []) + out

def stat(m, edition):
    saves, skills = prof_lists(m)
    cr, crt = cr_text(m['challenge_rating'])
    pb = m.get('proficiency_bonus') or (2 + max(0, (int(eval(cr)) - 1) // 4) if '/' not in cr else 2)
    top = []
    if saves: top.append(f"**Saving Throws** {', '.join(saves)}")
    for key, label in (('damage_vulnerabilities', 'Damage Vulnerabilities'), ('damage_resistances', 'Damage Resistances'), ('damage_immunities', 'Damage Immunities'), ('condition_immunities', 'Condition Immunities')):
        if m.get(key): top.append(f'**{label}** {lst(m[key])}')
    text = []
    if top: text.append('  \n'.join(top))
    text += block('', m.get('special_abilities'))
    text += block('Actions', m.get('actions'))
    text += block('Bonus Actions', m.get('bonus_actions'))
    text += block('Reactions', m.get('reactions'))
    if m.get('legendary_actions'): text += block('Legendary Actions', m['legendary_actions'])
    return {
        'ac': ac_text(m.get('armor_class')), 'hp': hp_text(m), 'speed': speed_text(m.get('speed')),
        'ab': [m[a] for a in ABIL], 'skills': ', '.join(skills), 'senses': senses_text(m.get('senses')),
        'languages': m.get('languages') or '—', 'cr': crt, 'pb': sign(int(pb)),
        'size': m.get('size'), 'type': m.get('type'), 'align': m.get('alignment'),
        'text': '\n\n'.join(text), 'ed': edition,
    }

def main(db):
    old = json.load(open(os.path.join(db, 'src/2014/en/5e-SRD-Monsters.json')))
    new = json.load(open(os.path.join(db, 'src/2024/en/5e-SRD-Monsters.json')))
    by = lambda lst: ({m.get('index'): m for m in lst if m.get('index')}, {norm(m['name']): m for m in lst})
    oi, on = by(old); ni, nn = by(new)
    codex = []
    for f in sorted(glob.glob(os.path.join(HERE, 'data', 'monsters-*.json'))): codex += json.load(open(f))['monsters']
    out, missing = {}, []
    for c in codex:
        first, second = ((ni, nn, '2024'), (oi, on, '2014')) if str(c.get('srd', '')).startswith('5.2') else ((oi, on, '2014'), (ni, nn, '2024'))
        names = [FORMS.get(c['id'], c['name'])] + list(c.get('aka') or [])
        hit = None
        for idx, nm, ed in (first, second):
            m = idx.get(c['id']) or next((nm[norm(n)] for n in names if norm(n) in nm), None)
            if m: hit = (m, ed); break
        if hit: out[c['id']] = stat(*hit)
        else: missing.append(c['id'])
    doc = {'v': 1, 'note': 'SRD 5.1 and 5.2.1 stat blocks (CC-BY-4.0), via 5e-database (MIT). Built by tools/statblocks.py.', 'creatures': out}
    with open(os.path.join(HERE, 'statblocks.json'), 'w') as fh: json.dump(doc, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'wrote statblocks.json: {len(out)} creatures' + (f'; no SRD stat block for {missing}' if missing else ''))

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(sys.argv[1])

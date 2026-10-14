// items.js - Objetos de combate: catálogo, efectos, equipar, tienda (monedas) y gacha de objetos (tickets)
//
// Un Pokémon puede llevar tantos objetos como ranuras tenga (árbol de habilidades: nv. 30 → 1, nv. 70 → 2).
// Los objetos se compran en la tienda (monedas) o se obtienen en el gacha de objetos (tickets), se guardan en la
// mochila (sección "Objetos de combate") y se equipan desde el menú del Pokémon. Las bayas y otros objetos de un
// solo uso se gastan al activarse en combate.
//
// EQUIDAD ENTRE TIENDA Y GACHA
//   · 1 ticket vale unas 200 monedas (es el cambio de las Masterballs: 1 🟣 = 1.000 🪙 o 5 🎟️).
//   · Una tirada de gacha (1 ticket) da, de media, ≈ 218 monedas de valor en objetos.
//   · La tienda te deja elegir el objeto exacto al precio de su rareza; el gacha da variedad y la posibilidad
//     de objetos raros baratos. Todos los precios y probabilidades están en ITEM_RARITY.

const ITEM_IMG_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';

const ITEM_CATEGORIES = {
    bayas:  { name: 'Bayas',             icon: '🍓' },
    cintas: { name: 'Cintas y pañuelos', icon: '🎀' },
    varios: { name: 'Objetos varios',    icon: '🎒' }
};

const ITEM_RARITY = {
    comun:      { name: 'Común',      price: 100,  rate: 70,  color: '#94a3b8' },
    raro:       { name: 'Raro',       price: 300,  rate: 22,  color: '#3b82f6' },
    epico:      { name: 'Épico',      price: 800,  rate: 6.5, color: '#a855f7' },
    legendario: { name: 'Legendario', price: 2000, rate: 1.5, color: '#fbbf24' }
};
const ITEM_RARITY_ORDER = ['comun', 'raro', 'epico', 'legendario'];

const ITEM_GACHA_COST = 1;              // tickets por tirada
const ITEM_TICKET_COIN_VALUE = 200;     // valor orientativo de un ticket en monedas

const ITEM_CATALOG = {};

function defItem(id, name, cat, rarity, desc, handlers) {
    ITEM_CATALOG[id] = Object.assign({ id, name, cat, rarity, desc, icon: ITEM_CATEGORIES[cat].icon, img: ITEM_IMG_BASE + id + '.png' }, handlers || {});
}

// =========================================================
// MOTOR DE EFECTOS
// =========================================================

function itemsActive(u) {
    if (!u || !u.items || u.items.length === 0) return false;
    if (typeof hasAb === 'function' && hasAb(u, 'klutz')) return false;   // Zoquete: no puede usar objetos
    return !(u.flags && u.flags.noItems);
}

function unitItemDefs(u) {
    return itemsActive(u) ? u.items.map(id => ITEM_CATALOG[id]).filter(Boolean) : [];
}

function consumeItem(u, id) {
    const i = u.items.indexOf(id);
    if (i < 0) return;
    u.items.splice(i, 1);
    (u.itemsUsed = u.itemsUsed || []).push(id);
    // Carrillo: al comer una baya recupera vida extra
    if (ITEM_CATALOG[id] && ITEM_CATALOG[id].cat === 'bayas' && typeof hasAb === 'function' && hasAb(u, 'cheek-pouch')) healFrac(u, 1 / 3);
}

function berryMult(u) { return (typeof hasAb === 'function' && hasAb(u, 'ripen')) ? 2 : 1; }

function applyItemResult(r, current, msgs) {
    if (r === undefined || r === null) return current;
    if (typeof r === 'number') return r <= 0 ? 0 : Math.max(1, Math.floor(current * r));
    if (r.msg) msgs.push(r.msg);
    if (r.damage !== undefined) return r.damage;
    if (r.mult !== undefined) return r.mult <= 0 ? 0 : Math.max(1, Math.floor(current * r.mult));
    return current;
}

// kind: 'atk' (daño que hace el portador) o 'def' (daño que recibe)
function itemDamageHook(kind, owner, other, move, damage, c) {
    let dmg = damage;
    const msgs = [];
    unitItemDefs(owner).forEach(it => {
        if (!it[kind]) return;
        dmg = applyItemResult(it[kind](owner, other, move, Object.assign({}, c || {}, { damage: dmg }), it), dmg, msgs);
    });
    return { damage: dmg, message: msgs.length ? msgs.join(' ') : null };
}

function itemEvent(name, owner, other, move, dmg, c) {
    const msgs = [];
    unitItemDefs(owner).forEach(it => {
        if (!it[name]) return;
        const m = it[name](owner, other, move, dmg, c, it);
        if (m) msgs.push(m);
    });
    return msgs.length ? msgs.join(' ') : null;
}

function itemEnter(owner, foe) { return itemEvent('enter', owner, foe, null, 0, null); }
function itemTurn(owner, foe) { return itemEvent('turn', owner, foe, null, 0, null); }

// Bayas de vida baja (y similares): se comprueban tras recibir daño y al final del turno
function itemCheckThresholds(u) {
    if (!u || u.currentHp <= 0) return null;
    const msgs = [];
    unitItemDefs(u).slice().forEach(it => {
        if (!it.lowHp) return;
        let thr = it.lowHp.threshold;
        if (thr <= 0.25 && typeof hasAb === 'function' && hasAb(u, 'gluttony')) thr = 0.5;
        if (u.currentHp / u.maxHp > thr) return;
        const m = it.lowHp.effect(u);
        consumeItem(u, it.id);
        if (m) msgs.push(m);
    });
    return msgs.length ? msgs.join(' ') : null;
}

// Bayas que curan estados
function itemOnStatus(unit, status) {
    if (!unit || unit.currentHp <= 0) return null;
    const msgs = [];
    unitItemDefs(unit).slice().forEach(it => {
        if (!it.cures || !it.cures.includes(status) || unit.status !== status) return;
        unit.status = null;
        consumeItem(unit, it.id);
        msgs.push(`🍓 ¡${unit.name} se curó con su ${it.name}!`);
    });
    return msgs.length ? msgs.join(' ') : null;
}

function itemCritRate(attacker) {
    return unitItemDefs(attacker).reduce((m, it) => m * (it.critRate || 1), 1);
}

// Multiplicadores de recompensa (Huevo Suerte / Moneda Amuleto)
function itemXpMult(unit) {
    return (unit.itemsAtStart || unit.items || []).reduce((m, id) => m * ((ITEM_CATALOG[id] && ITEM_CATALOG[id].xpMult) || 1), 1);
}
function itemCoinMult(team) { return (team || []).some(u => (u.itemsAtStart || []).includes('amulet-coin')) ? 1.2 : 1; }

// Tras el combate: quita de los Pokémon los objetos de un solo uso que se gastaron
function syncConsumedItems(team) {
    if (typeof userInventory === 'undefined') return;
    (team || []).forEach(u => {
        if (!u.itemsUsed || u.itemsUsed.length === 0) return;
        const inv = userInventory.find(x => Number(x.id) === Number(u.id));
        if (!inv || !inv.items) return;
        u.itemsUsed.forEach(id => { const i = inv.items.indexOf(id); if (i >= 0) inv.items.splice(i, 1); });
    });
    if (typeof saveStorage === 'function') saveStorage();
}

// =========================================================
// CATÁLOGO
// =========================================================

const ITEM_H = {
    boost: (stat, f) => stat === 'physical' ? { atk: (s, fo, mv) => !mv.isSpecial ? f : 1 } : { atk: (s, fo, mv) => mv.isSpecial ? f : 1 },
    type: (t, f = 1.2) => ({ atk: (s, fo, mv, c) => c.moveType === t ? f : 1 })
};

function berryHeal(id, name, rarity, frac, threshold, desc) {
    defItem(id, name, 'bayas', rarity, desc, {
        lowHp: { threshold, effect: u => { const h = healFrac(u, frac * berryMult(u)); return `🍓 ¡${u.name} comió su ${name} y recuperó ${h} HP!`; } }
    });
}
function berryCure(id, name, rarity, statuses, label) {
    defItem(id, name, 'bayas', rarity, `Cura ${label} al sufrirlo (un solo uso).`, { cures: statuses });
}
function berryStat(id, name, rarity, stat, label) {
    defItem(id, name, 'bayas', rarity, `Con poca vida (25%), sube ${label} (un solo uso).`, {
        lowHp: { threshold: 0.25, effect: u => { boostStat(u, stat, berryMult(u) === 2 ? 2 : 1.5); return `🍓 ¡${u.name} comió su ${name} y subió su ${STAT_ES[stat]}!`; } }
    });
}
function berryResist(id, name, type) {
    defItem(id, name, 'bayas', 'comun', `Reduce a la mitad el primer ataque superefectivo de tipo ${type} (un solo uso).`, {
        def: (s, f, mv, c, it) => {
            if (c.moveType !== type || c.elementMult <= 1) return 1;
            consumeItem(s, it.id);
            return { mult: 0.5, msg: `🍓 ¡${s.name} comió su ${name} y debilitó el golpe!` };
        }
    });
}

// ----- Bayas -----
berryHeal('oran-berry', 'Baya Aranja', 'comun', 0.20, 0.5, 'Con la mitad de vida o menos, recupera un 20% de HP (un solo uso).');
berryHeal('sitrus-berry', 'Baya Zidra', 'raro', 0.30, 0.5, 'Con la mitad de vida o menos, recupera un 30% de HP (un solo uso).');
berryHeal('figy-berry', 'Baya Higog', 'comun', 0.33, 0.25, 'Con poca vida (25%), recupera un 33% de HP (un solo uso).');
berryCure('cheri-berry', 'Baya Zreza', 'comun', ['paralyzed'], 'la parálisis');
berryCure('chesto-berry', 'Baya Atania', 'comun', ['asleep'], 'el sueño');
berryCure('pecha-berry', 'Baya Meloc', 'comun', ['poisoned'], 'el envenenamiento');
berryCure('rawst-berry', 'Baya Safre', 'comun', ['burned'], 'la quemadura');
berryCure('aspear-berry', 'Baya Perasi', 'comun', ['frozen'], 'la congelación');
berryCure('lum-berry', 'Baya Ziuela', 'raro', ['paralyzed', 'asleep', 'poisoned', 'burned', 'frozen'], 'cualquier estado alterado');
defItem('leppa-berry', 'Baya Zanama', 'bayas', 'comun', 'Si se queda sin energía (≤15), recupera 40 de energía (un solo uso).', {
    turn: (s, f, mv, d, c, it) => {
        if (s.energy > 15) return null;
        s.energy = Math.min(s.maxEnergy, s.energy + 40);
        consumeItem(s, 'leppa-berry');
        return `🍓 ¡${s.name} comió su Baya Zanama y recuperó energía!`;
    }
});
berryStat('liechi-berry', 'Baya Lichi', 'raro', 'atk', 'el Ataque');
berryStat('ganlon-berry', 'Baya Gonlan', 'raro', 'def', 'la Defensa');
berryStat('salac-berry', 'Baya Aslac', 'raro', 'spd', 'la Velocidad');
berryStat('petaya-berry', 'Baya Yapati', 'raro', 'spAtk', 'el At. Esp.');
berryStat('apicot-berry', 'Baya Aricoc', 'raro', 'spDef', 'la Def. Esp.');
defItem('starf-berry', 'Baya Arabol', 'bayas', 'epico', 'Con poca vida (25%), sube mucho el Ataque y el At. Esp. (un solo uso).', {
    lowHp: { threshold: 0.25, effect: u => { boostStat(u, 'atk', 1.6); boostStat(u, 'spAtk', 1.6); return `🍓 ¡${u.name} comió su Baya Arabol y se llenó de poder!`; } }
});
berryResist('occa-berry', 'Baya Caoca', 'Fuego');
berryResist('passho-berry', 'Baya Pasio', 'Agua');
berryResist('rindo-berry', 'Baya Tamar', 'Planta');
berryResist('wacan-berry', 'Baya Gualot', 'Eléctrico');
berryResist('yache-berry', 'Baya Rimoya', 'Hielo');
berryResist('shuca-berry', 'Baya Acardo', 'Tierra');
berryResist('roseli-berry', 'Baya Hibis', 'Hada');

// ----- Cintas y pañuelos -----
defItem('choice-band', 'Cinta Elegida', 'cintas', 'legendario', 'Potencia un 30% los ataques físicos.', ITEM_H.boost('physical', 1.3));
defItem('choice-specs', 'Gafas Elegidas', 'cintas', 'legendario', 'Potencia un 30% los ataques especiales.', ITEM_H.boost('special', 1.3));
defItem('choice-scarf', 'Pañuelo Elegido', 'cintas', 'epico', 'Aumenta mucho la velocidad (y con ella, algo de daño).', {
    enter: s => { boostStat(s, 'spd', 1.5); return null; }
});
defItem('muscle-band', 'Cinta Fuerte', 'cintas', 'comun', 'Potencia un 10% los ataques físicos.', ITEM_H.boost('physical', 1.1));
defItem('wise-glasses', 'Gafas Especiales', 'cintas', 'comun', 'Potencia un 10% los ataques especiales.', ITEM_H.boost('special', 1.1));
defItem('expert-belt', 'Cinta Experto', 'cintas', 'epico', 'Los ataques superefectivos hacen un 20% más de daño.', { atk: (s, f, mv, c) => c.elementMult > 1 ? 1.2 : 1 });
defItem('scope-lens', 'Periscopio', 'cintas', 'comun', 'Duplica la probabilidad de golpe crítico.', { critRate: 2 });
defItem('razor-claw', 'Garra Afilada', 'cintas', 'epico', 'Triplica la probabilidad de golpe crítico.', { critRate: 3 });
defItem('focus-band', 'Cinta Focus', 'cintas', 'raro', 'Con un 10% de probabilidad resiste un golpe mortal.', {
    def: (s, f, mv, c) => (c.damage >= s.currentHp && Math.random() < 0.1) ? { damage: s.currentHp - 1, msg: `🎀 ¡${s.name} resistió gracias a su Cinta Focus!` } : 1
});
defItem('focus-sash', 'Banda Focus', 'cintas', 'epico', 'Con la vida completa, resiste un golpe mortal (un solo uso).', {
    def: (s, f, mv, c, it) => {
        if (s.currentHp !== s.maxHp || c.damage < s.currentHp) return 1;
        consumeItem(s, it.id);
        return { damage: s.currentHp - 1, msg: `🎀 ¡${s.name} aguantó con 1 HP gracias a su Banda Focus!` };
    }
});
defItem('black-belt', 'Cinturón Negro', 'cintas', 'raro', 'Potencia un 20% los ataques de tipo Lucha.', ITEM_H.type('Lucha'));
defItem('silk-scarf', 'Pañuelo Seda', 'cintas', 'raro', 'Potencia un 20% los ataques de tipo Normal.', ITEM_H.type('Normal'));

// ----- Objetos varios -----
defItem('leftovers', 'Restos', 'varios', 'legendario', 'Recupera un 1/16 de HP al final de cada turno.', {
    turn: s => { const h = healFrac(s, 1 / 16); return h > 0 ? `🎒 ¡${s.name} recupera ${h} HP con sus Restos!` : null; }
});
defItem('life-orb', 'Vidasfera', 'varios', 'legendario', 'Potencia un 30% los ataques, pero cada golpe cuesta un 10% de HP.', {
    atk: () => 1.3,
    strike: s => { const d = indirect(s, s.maxHp / 10); return d > 0 ? `🔮 ¡${s.name} pierde ${d} HP por la Vidasfera!` : null; }
});
defItem('assault-vest', 'Chaleco Asalto', 'varios', 'legendario', 'Reduce un 30% el daño especial recibido.', { def: (s, f, mv) => mv.isSpecial ? 0.7 : 1 });
defItem('shell-bell', 'Campana Concha', 'varios', 'epico', 'Recupera 1/8 del daño que inflige.', {
    strike: (s, f, mv, dmg) => { const h = healFrac(s, Math.min(0.5, (dmg / s.maxHp) / 8)); return h > 0 ? `🔔 ¡${s.name} recupera ${h} HP con la Campana Concha!` : null; }
});
defItem('eviolite', 'Mineral Evolutivo', 'varios', 'epico', 'Si el Pokémon aún puede evolucionar, recibe un 25% menos de daño.', {
    def: s => (s.rarity === 'comun' || s.rarity === 'epico') ? 0.75 : 1
});
defItem('weakness-policy', 'Seguro Debilidad', 'varios', 'epico', 'Si recibe un golpe superefectivo, sube mucho su Ataque y At. Esp. (un solo uso).', {
    hit: (s, f, mv, d, c, it) => {
        if (!c.elementMult || c.elementMult <= 1) return null;
        consumeItem(s, it.id);
        boostStat(s, 'atk', 1.5); boostStat(s, 'spAtk', 1.5);
        return `📄 ¡El Seguro Debilidad de ${s.name} se activó!`;
    }
});
defItem('rocky-helmet', 'Casco Dentado', 'varios', 'epico', 'Hiere al atacante que le golpea con contacto (1/6 de su vida).', {
    hit: (s, f, mv, d, c) => { if (!c.contact) return null; const x = indirect(f, f.maxHp / 6); return x > 0 ? `⛑️ ¡El Casco Dentado de ${s.name} hirió a ${f.name} (-${x} HP)!` : null; }
});
defItem('air-balloon', 'Globo Helio', 'varios', 'raro', 'Inmune a los ataques de Tierra hasta que recibe un golpe (un solo uso).', {
    def: (s, f, mv, c) => c.moveType === 'Tierra' ? { mult: 0, msg: `🎈 ¡${s.name} flota sobre el ataque de Tierra!` } : 1,
    hit: (s, f, mv, d, c, it) => { consumeItem(s, it.id); return `🎈 ¡El Globo Helio de ${s.name} explotó!`; }
});
defItem('black-sludge', 'Lodo Negro', 'varios', 'raro', 'Cura un 1/16 de HP por turno a los de tipo Veneno; hiere a los demás.', {
    turn: s => {
        if (hasT(s, 'Veneno')) { const h = healFrac(s, 1 / 16); return h > 0 ? `🎒 ¡${s.name} recupera ${h} HP con el Lodo Negro!` : null; }
        const d = indirect(s, s.maxHp / 8); return d > 0 ? `☠️ ¡El Lodo Negro hiere a ${s.name} (-${d} HP)!` : null;
    }
});
defItem('toxic-orb', 'Toxiesfera', 'varios', 'epico', 'Envenena al portador al final del turno (ideal con Agallas o Antídoto).', {
    turn: s => { if (!s.status) tryApplyStatus(s, 'poisoned', null, 'Toxiesfera'); return null; }
});
defItem('flame-orb', 'Llamasfera', 'varios', 'epico', 'Quema al portador al final del turno (ideal con Agallas).', {
    turn: s => { if (!s.status) tryApplyStatus(s, 'burned', null, 'Llamasfera'); return null; }
});
defItem('lucky-egg', 'Huevo Suerte', 'varios', 'raro', 'El portador gana un 50% más de experiencia en combate.', { xpMult: 1.5 });
defItem('amulet-coin', 'Moneda Amuleto', 'varios', 'comun', 'Si lo lleva alguien del equipo, ganas un 20% más de monedas al ganar.', { coinMult: 1.2 });

// Potenciadores de tipo
[
    ['charcoal', 'Carbón', 'Fuego'], ['mystic-water', 'Agua Mística', 'Agua'], ['miracle-seed', 'Semilla Milagro', 'Planta'],
    ['magnet', 'Imán', 'Eléctrico'], ['never-melt-ice', 'Antiderretir', 'Hielo'], ['poison-barb', 'Flecha Venenosa', 'Veneno'],
    ['soft-sand', 'Arena Fina', 'Tierra'], ['sharp-beak', 'Pico Afilado', 'Volador'], ['twisted-spoon', 'Cuchara Torcida', 'Psíquico'],
    ['hard-stone', 'Piedra Dura', 'Roca'], ['spell-tag', 'Hechizo', 'Fantasma'], ['dragon-fang', 'Colmillo Dragón', 'Dragón'],
    ['metal-coat', 'Revestimiento Metálico', 'Acero']
].forEach(([id, name, type]) => defItem(id, name, 'varios', 'raro', `Potencia un 20% los ataques de tipo ${type}.`, ITEM_H.type(type)));

// Se integran en la mochila
if (typeof BACKPACK_ITEMS !== 'undefined') Object.keys(ITEM_CATALOG).forEach(k => { BACKPACK_ITEMS.combat[k] = ITEM_CATALOG[k]; });

// =========================================================
// INTERFAZ COMÚN
// =========================================================

function itemImgHtml(item, size = 44) {
    return `<img src="${item.img}" alt="${item.name}" loading="lazy" style="width: ${size}px; height: ${size}px; image-rendering: pixelated; object-fit: contain;" onerror="this.replaceWith(document.createTextNode('${item.icon}'))">`;
}

function itemRarityBadge(item) {
    const r = ITEM_RARITY[item.rarity];
    return `<span style="font-size: 10px; font-weight: 700; color: ${r.color}; letter-spacing: 1px;">${r.name.toUpperCase()}</span>`;
}

function itemToast(msg) {
    if (typeof showShopToast === 'function') showShopToast(msg); else alert(msg);
}

function injectItemStyles() {
    if (document.getElementById('item-styles')) return;
    const st = document.createElement('style');
    st.id = 'item-styles';
    st.textContent = `
    .it-card { background: rgba(255,255,255,0.04); border: 2px solid var(--it-color, #334155); border-radius: 10px; padding: 12px; text-align: center; color: #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 0 10px color-mix(in srgb, var(--it-color, #334155) 35%, transparent); }
    .it-card h4 { margin: 2px 0 0 0; font-size: 14px; color: #fff; }
    .it-card p { font-size: 11px; color: #94a3b8; margin: 2px 0 6px 0; min-height: 44px; line-height: 1.35; }
    .it-btn { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #0f172a; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; width: 100%; }
    .it-btn:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
    .it-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 10px; }
    .it-cats { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 8px 0 12px 0; }
    .it-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 10060; display: none; align-items: center; justify-content: center; padding: 15px; }
    .it-box { background: #0f172a; border: 1px solid rgba(0,242,254,0.4); border-radius: 12px; width: 100%; max-width: 520px; max-height: 88vh; display: flex; flex-direction: column; padding: 16px; color: #e2e8f0; position: relative; }
    .it-box h3 { margin: 0 0 8px 0; font-family: 'Orbitron', sans-serif; color: #00f2fe; font-size: 1rem; }
    .it-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    .it-list { overflow-y: auto; flex: 1; }
    .it-row { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .it-row .it-name { flex: 1; font-size: 13px; }
    .it-row .it-name small { display: block; color: #94a3b8; font-size: 11px; }
    .it-row button { background: #1e293b; border: 1px solid #00f2fe; color: #00f2fe; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-weight: 700; }
    .it-row button:disabled { opacity: .35; cursor: not-allowed; border-color: #334155; color: #64748b; }
    .it-slot { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.25); border: 1px dashed #334155; border-radius: 8px; padding: 6px 10px; margin-top: 6px; font-size: 13px; }
    .it-slot.full { border-style: solid; border-color: var(--it-color, #334155); }
    `;
    document.head.appendChild(st);
}

// =========================================================
// EQUIPAR (menú del Pokémon)
// =========================================================

function getItemSlots(p) {
    return typeof getPerkBonuses === 'function' ? getPerkBonuses(p).itemSlots : 0;
}

function findPokemonById(id) {
    return typeof userInventory !== 'undefined' ? userInventory.find(x => Number(x.id) === Number(id)) : null;
}

function equipItem(pokemonId, itemId) {
    const p = findPokemonById(pokemonId);
    if (!p || !ITEM_CATALOG[itemId]) return false;
    p.items = p.items || [];
    if (p.items.length >= getItemSlots(p)) { itemToast(`${p.name} no tiene ranuras libres.`); return false; }
    if (getItemCount('combat', itemId) <= 0) { itemToast('No tienes ese objeto en la mochila.'); return false; }

    removeBackpackItem('combat', itemId, 1);
    p.items.push(itemId);
    if (typeof saveStorage === 'function') saveStorage();
    itemToast(`🎒 ${p.name} lleva ahora ${ITEM_CATALOG[itemId].name}.`);
    refreshItemViews(p.id);
    return true;
}

function unequipItem(pokemonId, index) {
    const p = findPokemonById(pokemonId);
    if (!p || !p.items || !p.items[index]) return;
    const id = p.items.splice(index, 1)[0];
    addBackpackItem('combat', id, 1);
    if (typeof saveStorage === 'function') saveStorage();
    refreshItemViews(p.id);
}

function refreshItemViews(pokemonId) {
    const pm = document.getElementById('pokemon-modal');
    if (pm && pm.style.display === 'flex' && typeof openPokemonModal === 'function') openPokemonModal(pokemonId);
    if (typeof renderBackpack === 'function') renderBackpack();
    renderItemPickers();
}

// Bloque de objetos para el menú del Pokémon
function getItemRowHtml(pkmn) {
    const slots = getItemSlots(pkmn);
    const items = pkmn.items || [];

    if (slots === 0) {
        return `<div style="font-size: 12px; color: #94a3b8; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;">🔒 Objetos: desbloquea la 1ª ranura al nivel 30 en el árbol de habilidades.</div>`;
    }

    const rows = [];
    for (let i = 0; i < slots; i++) {
        const it = ITEM_CATALOG[items[i]];
        if (it) {
            rows.push(`<div class="it-slot full" style="--it-color: ${ITEM_RARITY[it.rarity].color};">
                ${itemImgHtml(it, 32)}
                <div style="flex: 1;"><b>${it.name}</b><div style="font-size: 11px; color: #94a3b8;">${it.desc}</div></div>
                <button onclick="unequipItem(${pkmn.id}, ${i})" style="background: #1e293b; border: 1px solid #e11d48; color: #fb7185; border-radius: 6px; padding: 4px 10px; cursor: pointer;">Quitar</button>
            </div>`);
        } else {
            rows.push(`<div class="it-slot">
                <span style="font-size: 20px;">➕</span>
                <div style="flex: 1; color: #94a3b8;">Ranura ${i + 1} vacía</div>
                <button onclick="openEquipPicker(${pkmn.id})" style="background: #1e293b; border: 1px solid #00f2fe; color: #00f2fe; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-weight: 700;">Equipar</button>
            </div>`);
        }
    }
    return `<div style="margin-bottom: 12px;"><div style="font-size: 13px; margin-bottom: 2px;">🎒 Objetos de combate (${items.length}/${slots})</div>${rows.join('')}</div>`;
}

// ----- Selector de objeto (desde un Pokémon) -----
let equipPickerPokemon = null;
let itemPickerItem = null;

function ensureOverlay(id) {
    injectItemStyles();
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'it-overlay';
        el.addEventListener('click', e => { if (e.target === el) el.style.display = 'none'; });
        document.body.appendChild(el);
    }
    return el;
}

function openEquipPicker(pokemonId) {
    equipPickerPokemon = pokemonId;
    ensureOverlay('equip-picker').style.display = 'flex';
    renderItemPickers();
}

function closeEquipPicker() { const el = document.getElementById('equip-picker'); if (el) el.style.display = 'none'; }

// ----- Selector de Pokémon (desde la mochila) -----
function openItemPicker(itemId) {
    itemPickerItem = itemId;
    ensureOverlay('item-picker').style.display = 'flex';
    renderItemPickers();
}

function closeItemPicker() { const el = document.getElementById('item-picker'); if (el) el.style.display = 'none'; }

function renderItemPickers() {
    const eq = document.getElementById('equip-picker');
    if (eq && eq.style.display === 'flex') {
        const p = findPokemonById(equipPickerPokemon);
        const bp = getBackpack().combat;
        const owned = Object.entries(bp).filter(([id, q]) => q > 0 && ITEM_CATALOG[id])
            .sort((a, b) => ITEM_RARITY_ORDER.indexOf(ITEM_CATALOG[b[0]].rarity) - ITEM_RARITY_ORDER.indexOf(ITEM_CATALOG[a[0]].rarity));
        const free = p ? getItemSlots(p) - (p.items || []).length : 0;
        if (!p || free <= 0) { eq.style.display = 'none'; }
        else {
            eq.innerHTML = `<div class="it-box">
                <button class="it-close" onclick="closeEquipPicker()">✖</button>
                <h3>🎒 Equipar a ${p.name}</h3>
                <div class="it-list">${owned.length ? owned.map(([id, q]) => { const it = ITEM_CATALOG[id]; return `
                    <div class="it-row">${itemImgHtml(it, 36)}
                        <div class="it-name">${it.name} <span style="color:#fbbf24;">x${q}</span> ${itemRarityBadge(it)}<small>${it.desc}</small></div>
                        <button onclick="equipItem(${p.id}, '${id}')">Equipar</button>
                    </div>`; }).join('') : '<div style="color:#94a3b8; padding: 16px; text-align:center;">No tienes objetos de combate. Consíguelos en la tienda o en el gacha de objetos.</div>'}</div>
            </div>`;
        }
    }

    const ip = document.getElementById('item-picker');
    if (ip && ip.style.display === 'flex') {
        const it = ITEM_CATALOG[itemPickerItem];
        if (!it || getItemCount('combat', itemPickerItem) <= 0) { ip.style.display = 'none'; return; }
        const query = (document.getElementById('item-picker-search') ? document.getElementById('item-picker-search').value : '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const rows = (typeof userInventory !== 'undefined' ? userInventory : []).slice().sort((a, b) => Number(a.id) - Number(b.id))
            .filter(p => !query || p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query))
            .map(p => {
                const slots = getItemSlots(p), used = (p.items || []).length;
                return `<div class="it-row"><img src="${p.sprite}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: contain;">
                    <div class="it-name">${p.name}<small>Nv. ${p.level || 1} · ranuras ${used}/${slots}</small></div>
                    <button ${used >= slots ? 'disabled' : ''} onclick="equipItem(${p.id}, '${itemPickerItem}')">Equipar</button></div>`;
            }).join('');
        if (!document.getElementById('item-picker-list')) {
            ip.innerHTML = `<div class="it-box">
                <button class="it-close" onclick="closeItemPicker()">✖</button>
                <h3>${it.name} · ¿A quién se lo equipas?</h3>
                <input id="item-picker-search" type="text" placeholder="🔍 Buscar Pokémon..." oninput="renderItemPickers()" autocomplete="off" style="background:#1e293b; border:1px solid #334155; color:#fff; border-radius:6px; padding:8px 10px; margin-bottom:8px;">
                <div class="it-list" id="item-picker-list">${rows}</div>
            </div>`;
        } else {
            document.getElementById('item-picker-list').innerHTML = rows;
        }
    }
}

// =========================================================
// TIENDA DE OBJETOS (monedas)
// =========================================================

let currentItemShopCat = 'bayas';

function buyShopItem(itemId) {
    const it = ITEM_CATALOG[itemId];
    if (!it) return;
    const price = ITEM_RARITY[it.rarity].price;
    const cur = getCurrencies();
    if ((cur.coins || 0) < price) { itemToast(`Te faltan ${price - (cur.coins || 0)} 🪙 para ${it.name}.`); return; }
    cur.coins -= price;
    saveCurrencies(cur);
    addBackpackItem('combat', itemId, 1);
    itemToast(`✅ Compraste ${it.name} por ${price} 🪙`);
    renderShop();
}

function setItemShopCat(cat) { currentItemShopCat = cat; renderShop(); }

function renderShopItems() {
    injectItemStyles();
    const coins = getCurrencies().coins || 0;
    const bp = getBackpack().combat;

    const cats = Object.entries(ITEM_CATEGORIES).map(([id, c]) =>
        `<button class="banner-btn ${id === currentItemShopCat ? 'active' : ''}" onclick="setItemShopCat('${id}')">${c.icon} ${c.name}</button>`).join('');

    const list = Object.values(ITEM_CATALOG).filter(it => it.cat === currentItemShopCat)
        .sort((a, b) => ITEM_RARITY_ORDER.indexOf(a.rarity) - ITEM_RARITY_ORDER.indexOf(b.rarity) || a.name.localeCompare(b.name));

    return `
        <p class="shop-note">🎒 Elige el objeto exacto que quieras pagando con 🪙 (precio según rareza: ${ITEM_RARITY_ORDER.map(r => `${ITEM_RARITY[r].name} ${ITEM_RARITY[r].price}`).join(' · ')}). También puedes probar suerte en el <b>Gacha de objetos</b> (pestaña Invocación) con 🎟️.</p>
        <div class="it-cats">${cats}</div>
        <div class="it-grid">${list.map(it => {
            const price = ITEM_RARITY[it.rarity].price;
            return `<div class="it-card" style="--it-color: ${ITEM_RARITY[it.rarity].color};">
                ${itemImgHtml(it, 48)}${itemRarityBadge(it)}
                <h4>${it.name}</h4>
                <p>${it.desc}</p>
                <div style="font-size: 11px; color: #94a3b8;">Tienes: ${bp[it.id] || 0}</div>
                <button class="it-btn" ${coins < price ? 'disabled' : ''} onclick="buyShopItem('${it.id}')">${price} 🪙</button>
            </div>`;
        }).join('')}</div>`;
}

// =========================================================
// GACHA DE OBJETOS (tickets)
// =========================================================

function rollItemRarity() {
    let r = Math.random() * 100;
    for (const id of ITEM_RARITY_ORDER) {
        r -= ITEM_RARITY[id].rate;
        if (r < 0) return id;
    }
    return 'comun';
}

function pickItemOfRarity(rarity) {
    const pool = Object.values(ITEM_CATALOG).filter(it => it.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

// x10: garantiza al menos un objeto Raro o mejor
function rollItemPulls(amount) {
    const pulls = [];
    for (let i = 0; i < amount; i++) pulls.push(pickItemOfRarity(rollItemRarity()));
    if (amount >= 10 && pulls.every(it => it.rarity === 'comun')) pulls[pulls.length - 1] = pickItemOfRarity('raro');
    return pulls;
}

function pullItemGacha(amount) {
    const cur = getCurrencies();
    const cost = amount * ITEM_GACHA_COST;
    if ((cur.tickets || 0) < cost) { alert(`¡No tienes suficientes tickets! Necesitas ${cost} y tienes ${cur.tickets || 0}.`); return; }

    cur.tickets -= cost;
    saveCurrencies(cur);

    const pulls = rollItemPulls(amount);
    pulls.forEach(it => addBackpackItem('combat', it.id, 1));

    const results = document.getElementById('item-gacha-results');
    if (!results) return;
    results.innerHTML = pulls.map((it, i) => {
        const r = ITEM_RARITY[it.rarity];
        return `<div class="card-pokemon" style="border-color: ${r.color}; box-shadow: 0 0 14px ${r.color}66; animation-delay: ${(i * 0.1).toFixed(2)}s;">
            ${itemImgHtml(it, 56)}
            <h4>${it.name}</h4>
            <div class="card-rarity" style="color: ${r.color};">${r.name.toUpperCase()}</div>
        </div>`;
    }).join('');
    renderItemGachaInfo();
}

function renderItemGachaInfo() {
    const el = document.getElementById('item-gacha-info');
    if (!el) return;
    const tickets = getCurrencies().tickets || 0;
    const ev = ITEM_RARITY_ORDER.reduce((s, id) => s + ITEM_RARITY[id].price * ITEM_RARITY[id].rate / 100, 0);
    el.innerHTML = `
        <p class="gacha-subtitle">Consigue bayas, cintas, pañuelos y objetos varios. Tienes <b>${tickets}</b> 🎟️</p>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 8px;">
            ${ITEM_RARITY_ORDER.map(id => `<span style="border: 1px solid ${ITEM_RARITY[id].color}; color: ${ITEM_RARITY[id].color}; border-radius: 14px; padding: 2px 10px; font-size: 12px;">${ITEM_RARITY[id].name} ${ITEM_RARITY[id].rate}%</span>`).join('')}
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 10px;">
            Cada tirada equivale de media a unas ${Math.round(ev)} 🪙 en objetos (1 🎟️ ≈ ${ITEM_TICKET_COIN_VALUE} 🪙). La tirada x10 garantiza al menos un objeto Raro o mejor.
        </p>`;
}

// Pestañas "Pokémon / Objetos" dentro de Invocación
function showGachaType(type) {
    const pk = document.getElementById('pokemon-gacha-panel');
    const it = document.getElementById('item-gacha-panel');
    if (pk) pk.style.display = type === 'items' ? 'none' : 'block';
    if (it) it.style.display = type === 'items' ? 'block' : 'none';
    document.querySelectorAll('.gacha-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
    if (type === 'items') renderItemGachaInfo();
}

function setupItemGacha() {
    const frame = document.querySelector('#tab-invocacion .gacha-frame');
    if (!frame || document.getElementById('item-gacha-panel')) return;

    // Todo el contenido actual (gacha de Pokémon) pasa a su propio panel
    const pokemonPanel = document.createElement('div');
    pokemonPanel.id = 'pokemon-gacha-panel';
    while (frame.firstChild) pokemonPanel.appendChild(frame.firstChild);

    const tabs = document.createElement('div');
    tabs.className = 'banner-selector';
    tabs.style.marginBottom = '14px';
    tabs.innerHTML = `
        <button class="banner-btn gacha-type-btn active" data-type="pokemon" onclick="showGachaType('pokemon')">🐾 Gacha de Pokémon</button>
        <button class="banner-btn gacha-type-btn" data-type="items" onclick="showGachaType('items')">🎒 Gacha de objetos</button>`;

    const itemPanel = document.createElement('div');
    itemPanel.id = 'item-gacha-panel';
    itemPanel.style.display = 'none';
    itemPanel.innerHTML = `
        <h2 class="gacha-banner-title">GACHA DE OBJETOS</h2>
        <div id="item-gacha-info"></div>
        <div class="gacha-buttons">
            <button class="btn-pull" onclick="pullItemGacha(1)">Tirada x1 (${ITEM_GACHA_COST} Ticket)</button>
            <button class="btn-pull multi" onclick="pullItemGacha(10)">Tirada x10 (${10 * ITEM_GACHA_COST} Tickets)</button>
        </div>
        <div id="item-gacha-results" class="results-grid"></div>`;

    frame.appendChild(tabs);
    frame.appendChild(pokemonPanel);
    frame.appendChild(itemPanel);
}

document.addEventListener('DOMContentLoaded', setupItemGacha);

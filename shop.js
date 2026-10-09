// shop.js - Tienda: Pokémon diarios, objetos, skins, Masterballs y calendario de recompensas

const SHOP_KEY = 'gachatara_shop';
const ADVENT_KEY = 'gachatara_advent';

// ---------- Configuración (fácil de ajustar) ----------

// Precio en monedas de cada Pokémon de la tienda según su categoría
const SHOP_POKEMON_PRICES = { comun: 150, raro: 400, epico: 1200, legendario: 5000 };
const SHOP_POKEMON_PER_GEN = 5;
const SHOP_GEN_NAMES = { 1: 'Kanto', 2: 'Johto', 3: 'Hoenn', 4: 'Sinnoh', 5: 'Unova', 6: 'Kalos', 7: 'Alola', 8: 'Galar', 9: 'Paldea' };

// Cambios de Masterballs. 'currency' es la clave en las monedas del jugador (shards = 💎 moneda de skins)
const MASTERBALL_OFFERS = [
    { currency: 'coins',   amount: 1000, cost: 1, icon: '🪙', label: 'Monedas Tara' },
    { currency: 'coins',   amount: 6000, cost: 5, icon: '🪙', label: 'Monedas Tara' },
    { currency: 'tickets', amount: 5,    cost: 1, icon: '🎟️', label: 'Tickets de Invocación' },
    { currency: 'tickets', amount: 30,   cost: 5, icon: '🎟️', label: 'Tickets de Invocación' },
    { currency: 'shards',  amount: 50,   cost: 1, icon: '💎', label: 'Esquirlas Coloridas' },
    { currency: 'shards',  amount: 300,  cost: 5, icon: '💎', label: 'Esquirlas Coloridas' }
];

const SHOP_SECTIONS = [
    { id: 'pokemon',     name: 'Pokémon',     icon: '🐾' },
    { id: 'objetos',     name: 'Objetos',     icon: '🎒' },
    { id: 'skins',       name: 'Skins',       icon: '🎨' },
    { id: 'masterballs', name: 'Masterballs', icon: '🟣' },
    { id: 'calendario',  name: 'Calendario',  icon: '🎁' }
];

let currentShopSection = 'pokemon';

// ---------- Utilidades ----------

function getTodayString(date = new Date()) {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
}

function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function seededRandom(seed) {
    let a = seed;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function showShopToast(message) {
    const old = document.getElementById('shop-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'shop-toast';
    t.className = 'shop-toast';
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; }
}

// ---------- Pokémon diarios ----------

function getShopState() {
    const today = getTodayString();
    const state = readJSON(SHOP_KEY, { date: today, bought: [] });
    if (state.date !== today) return { date: today, bought: [] };
    return state;
}

// 5 Pokémon por generación, siempre los mismos durante el mismo día y ordenados por Pokédex
function getDailyShopOffers() {
    if (typeof DATABASE === 'undefined') return null;
    const all = [].concat(DATABASE.comun || [], DATABASE.raro || [], DATABASE.epico || [], DATABASE.legendario || []);
    if (all.length === 0) return null;

    const today = getTodayString();
    const offers = [];

    for (let gen = 1; gen <= 9; gen++) {
        const range = (typeof GEN_RANGES !== 'undefined' && GEN_RANGES[gen]) ? GEN_RANGES[gen] : null;
        if (!range) continue;

        const pool = all.filter(p => p.id >= range.min && p.id <= range.max).sort((a, b) => a.id - b.id);
        if (pool.length === 0) continue;

        const rng = seededRandom(hashString(`${today}-gen${gen}`));
        const picked = [];
        const copy = pool.slice();
        while (picked.length < SHOP_POKEMON_PER_GEN && copy.length > 0) {
            picked.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
        }
        picked.sort((a, b) => a.id - b.id);
        offers.push({ gen, list: picked });
    }
    return offers;
}

function buyShopPokemon(pokemonId) {
    const offers = getDailyShopOffers();
    if (!offers) return;

    let pkmn = null;
    offers.forEach(o => o.list.forEach(p => { if (Number(p.id) === Number(pokemonId)) pkmn = p; }));
    if (!pkmn) return;

    const state = getShopState();
    if (state.bought.includes(pkmn.id)) return;

    const price = SHOP_POKEMON_PRICES[pkmn.rarity] || 150;
    const currencies = getCurrencies();
    if ((currencies.coins || 0) < price) {
        showShopToast(`Te faltan ${price - (currencies.coins || 0)} 🪙 para comprar a ${pkmn.name}.`);
        return;
    }

    currencies.coins -= price;
    saveCurrencies(currencies);

    addPokemonToInventory({ ...pkmn });

    state.bought.push(pkmn.id);
    localStorage.setItem(SHOP_KEY, JSON.stringify(state));

    showShopToast(`✅ Has comprado a ${pkmn.name} por ${price} 🪙`);
    renderShop();
}

function timeUntilRotation() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const mins = Math.floor((next - now) / 60000);
    return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

function renderShopPokemon() {
    const offers = getDailyShopOffers();
    if (!offers) {
        return '<div class="shop-empty"><div class="shop-empty-icon">⏳</div><p>Cargando la base de datos de Pokémon... vuelve a entrar en unos segundos.</p></div>';
    }

    const state = getShopState();
    const coins = getCurrencies().coins || 0;

    return `
        <p class="shop-note">🔄 La selección cambia cada día · Próxima rotación en <b>${timeUntilRotation()}</b> · Cada Pokémon se puede comprar una vez al día.</p>
        ${offers.map(o => `
            <h3 class="shop-gen-title">Generación ${o.gen} (${SHOP_GEN_NAMES[o.gen]})</h3>
            <div class="shop-grid">
                ${o.list.map(p => {
                    const bought = state.bought.includes(p.id);
                    const price = SHOP_POKEMON_PRICES[p.rarity] || 150;
                    const rarityClass = String(p.rarity || 'comun').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const owned = (typeof userInventory !== 'undefined') ? userInventory.find(x => Number(x.id) === Number(p.id)) : null;
                    return `
                        <div class="pokemon-card card-pokemon ${rarityClass} shop-card">
                            <div class="card-id">#${String(p.id).padStart(4, '0')}</div>
                            <img src="${p.sprite}" alt="${p.name}" loading="lazy">
                            <div class="card-name">${p.name}</div>
                            <div class="card-rarity">${String(p.rarity).toUpperCase()}</div>
                            <div class="shop-owned">${owned ? `Tienes x${owned.count || 1}` : '¡Nuevo!'}</div>
                            <button class="shop-buy" ${bought || coins < price ? 'disabled' : ''} onclick="buyShopPokemon(${p.id})">
                                ${bought ? 'Agotado' : `${price} 🪙`}
                            </button>
                        </div>`;
                }).join('')}
            </div>
        `).join('')}
    `;
}

// ---------- Masterballs ----------

function buyMasterballOffer(index) {
    const offer = MASTERBALL_OFFERS[index];
    if (!offer) return;

    const currencies = getCurrencies();
    if ((currencies.masterballs || 0) < offer.cost) {
        showShopToast('No tienes suficientes Masterballs 🟣');
        return;
    }

    currencies.masterballs -= offer.cost;
    currencies[offer.currency] = (currencies[offer.currency] || 0) + offer.amount;
    saveCurrencies(currencies);

    showShopToast(`✅ Cambiaste ${offer.cost} 🟣 por ${offer.amount} ${offer.icon}`);
    renderShop();
}

function renderShopMasterballs() {
    const balls = getCurrencies().masterballs || 0;
    return `
        <p class="shop-note">🟣 Tienes <b>${balls}</b> Masterballs. Se conseguirán en misiones y otras actividades futuras.</p>
        <div class="shop-grid wide">
            ${MASTERBALL_OFFERS.map((o, i) => `
                <div class="shop-offer">
                    <div style="font-size: 34px;">${o.icon}</div>
                    <h4>+${o.amount} ${o.label}</h4>
                    <button class="shop-buy" ${balls < o.cost ? 'disabled' : ''} onclick="buyMasterballOffer(${i})">${o.cost} 🟣</button>
                </div>`).join('')}
        </div>`;
}

// ---------- Calendario de recompensas ----------

function getAdventReward(day, daysInMonth) {
    if (day === daysInMonth) return { masterballs: 3, tickets: 10, coins: 1000 };
    if (day % 7 === 0) return { masterballs: 1, coins: 300 };
    if (day % 5 === 0) return { shards: 50, tickets: 2 };
    if (day % 2 === 0) return { tickets: 2 };
    return { coins: 300 };
}

function formatRewardIcons(reward) {
    const icons = { coins: '🪙', tickets: '🎟️', masterballs: '🟣', shards: '💎' };
    return Object.entries(reward).map(([k, v]) => `${icons[k]} ${v}`).join('<br>');
}

function getAdventState() {
    const monthKey = getTodayString().slice(0, 7);
    const state = readJSON(ADVENT_KEY, { month: monthKey, claimed: [] });
    if (state.month !== monthKey) return { month: monthKey, claimed: [] };
    return state;
}

function hasUnclaimedAdvent() {
    const today = new Date();
    return !getAdventState().claimed.includes(today.getDate());
}

function claimAdventDay(day) {
    const today = new Date();
    if (day !== today.getDate()) return;

    const state = getAdventState();
    if (state.claimed.includes(day)) return;

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const reward = getAdventReward(day, daysInMonth);

    const currencies = getCurrencies();
    Object.entries(reward).forEach(([k, v]) => { currencies[k] = (currencies[k] || 0) + v; });
    saveCurrencies(currencies);

    state.claimed.push(day);
    localStorage.setItem(ADVENT_KEY, JSON.stringify(state));

    showShopToast(`🎁 ¡Recompensa del día ${day} reclamada!`);
    renderShop();
}

function renderShopCalendar() {
    const today = new Date();
    const todayNum = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const state = getAdventState();
    const monthName = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const cells = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const reward = getAdventReward(day, daysInMonth);
        const claimed = state.claimed.includes(day);
        const isToday = day === todayNum;
        const missed = day < todayNum && !claimed;

        let status = 'locked';
        if (claimed) status = 'claimed';
        else if (isToday) status = 'today';
        else if (missed) status = 'missed';

        cells.push(`
            <div class="adv-day ${status}">
                <div class="adv-num">${day}</div>
                <div class="adv-reward">${formatRewardIcons(reward)}</div>
                ${status === 'claimed' ? '<div class="adv-state">✅</div>' : ''}
                ${status === 'today' ? `<button class="shop-buy" onclick="claimAdventDay(${day})">Reclamar</button>` : ''}
                ${status === 'missed' ? '<div class="adv-state">Perdido</div>' : ''}
                ${status === 'locked' ? '<div class="adv-state">🔒</div>' : ''}
            </div>`);
    }

    return `
        <p class="shop-note">🎁 Calendario de <b>${monthName}</b> · Reclama la recompensa de cada día (solo la del día de hoy). Reclamadas: <b>${state.claimed.length}/${daysInMonth}</b></p>
        <div class="adv-grid">${cells.join('')}</div>`;
}

// ---------- Interfaz ----------

function injectShopStyles() {
    if (document.getElementById('shop-styles')) return;
    const st = document.createElement('style');
    st.id = 'shop-styles';
    st.textContent = `
    .shop-tabs { display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
    .shop-tabs .banner-btn { position: relative; }
    .shop-dot { position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #fbbf24; border-radius: 50%; border: 2px solid #0f172a; }
    .shop-note { text-align: center; color: #94a3b8; font-size: 13px; margin: 6px 0 14px 0; }
    .shop-gen-title { font-family: 'Orbitron', sans-serif; color: #00f2fe; font-size: 0.95rem; margin: 18px 0 8px 0; border-bottom: 1px solid rgba(0,242,254,0.25); padding-bottom: 4px; }
    .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .shop-grid.wide { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .shop-card { position: relative; text-align: center; }
    .shop-owned { font-size: 11px; color: #94a3b8; margin: 3px 0 5px 0; }
    .shop-buy { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #0f172a; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; width: 100%; }
    .shop-buy:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
    .shop-offer { background: rgba(255,255,255,0.04); border: 1px solid rgba(0,242,254,0.25); border-radius: 10px; padding: 14px; text-align: center; color: #e2e8f0; }
    .shop-offer h4 { margin: 6px 0 10px 0; font-size: 15px; }
    .shop-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
    .shop-empty-icon { font-size: 52px; opacity: .6; }
    .adv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 8px; }
    .adv-day { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 6px; text-align: center; color: #e2e8f0; min-height: 110px; display: flex; flex-direction: column; justify-content: space-between; }
    .adv-num { font-family: 'Orbitron', sans-serif; font-size: 13px; color: #94a3b8; }
    .adv-reward { font-size: 13px; margin: 6px 0; line-height: 1.5; }
    .adv-state { font-size: 11px; color: #94a3b8; }
    .adv-day.today { border-color: #fbbf24; box-shadow: 0 0 12px rgba(251,191,36,0.45); }
    .adv-day.today .adv-num { color: #fbbf24; }
    .adv-day.claimed { background: rgba(20,83,45,0.35); border-color: #4ade80; }
    .adv-day.missed { opacity: 0.4; }
    .adv-day.locked { opacity: 0.7; }
    .shop-toast { position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); background: #0f172a; border: 1px solid #00f2fe; color: #fff; padding: 10px 18px; border-radius: 8px; z-index: 10100; font-size: 14px; box-shadow: 0 0 15px rgba(0,242,254,0.4); }
    `;
    document.head.appendChild(st);
}

function switchShopSection(sectionId) {
    currentShopSection = sectionId;
    renderShop();
}

function renderShop() {
    const container = document.getElementById('shop-content');
    if (!container) return;
    injectShopStyles();

    const tabs = SHOP_SECTIONS.map(s => `
        <button class="banner-btn ${s.id === currentShopSection ? 'active' : ''}" onclick="switchShopSection('${s.id}')">
            ${s.icon} ${s.name}${s.id === 'calendario' && hasUnclaimedAdvent() ? '<span class="shop-dot"></span>' : ''}
        </button>`).join('');

    let body = '';
    if (currentShopSection === 'pokemon') body = renderShopPokemon();
    else if (currentShopSection === 'masterballs') body = renderShopMasterballs();
    else if (currentShopSection === 'calendario') body = renderShopCalendar();
    else if (currentShopSection === 'objetos') body = '<div class="shop-empty"><div class="shop-empty-icon">🎒</div><p>Todavía no hay objetos a la venta. ¡Próximamente!</p></div>';
    else if (currentShopSection === 'skins') body = '<div class="shop-empty"><div class="shop-empty-icon">🎨</div><p>Todavía no hay skins a la venta. ¡Próximamente!</p></div>';

    container.innerHTML = `<div class="shop-tabs">${tabs}</div>${body}`;
}

document.addEventListener('DOMContentLoaded', renderShop);

// achievements.js - Logros permanentes (por niveles) con recompensas y títulos de jugador
//
// Cada logro es una serie con varios niveles (ej.: Combatiente: 10, 50, 200, 500 y 1000 combates).
// Se alimentan de dos fuentes:
//   · contadores de por vida: cada trackMission(evento, n) del juego también suma aquí (addLifetimeStat)
//   · valores calculados al momento: Pokémon distintos, legendarios, estrellas, nivel máximo, rango...
// Cada nivel completado se reclama aparte; los últimos niveles de algunos logros regalan un TÍTULO
// que se puede elegir en el perfil. Viven dentro de la pestaña Misiones (botón «Logros»).

const ACH_KEY = 'gachatara_achievements';

const ACH_CATEGORIES = {
    combate:   { name: 'Combate',            icon: '⚔️' },
    coleccion: { name: 'Colección',          icon: '📖' },
    progreso:  { name: 'Progreso',           icon: '📈' },
    habitos:   { name: 'Hábitos y economía', icon: '📅' }
};

// Recompensas por nivel (de menor a mayor). 1 🎟️ ≈ 200 🪙 · 1 🟣 = 5 🎟️ · 1 💎 ≈ 20 🪙
const ACH_LADDER = [
    { coins: 300 },
    { tickets: 2 },
    { tickets: 4, shards: 50 },
    { masterballs: 1 },
    { masterballs: 2, tickets: 5 },
    { masterballs: 3, tickets: 10, candies: 5 }
];
const ACH_LADDER_PICK = { 1: [3], 2: [1, 4], 3: [1, 3, 5], 4: [0, 2, 4, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5] };

let currentAchCat = 'all';

// ---------- Valores calculados ----------

function achInventory() { return typeof userInventory !== 'undefined' ? userInventory : []; }

function achDistinctItems() {
    const ids = new Set();
    if (typeof getBackpack === 'function') Object.entries(getBackpack().combat).forEach(([id, q]) => { if (q > 0) ids.add(id); });
    achInventory().forEach(p => (p.items || []).forEach(id => ids.add(id)));
    return ids.size;
}

function achRankPeak() {
    if (typeof getRankedState !== 'function') return 0;
    const s = getRankedState();
    return Math.max(s.single.rank, s.double.rank);
}

function achDexTotal() {
    if (typeof getAllPokemonFromDB === 'function') { const n = getAllPokemonFromDB().length; if (n > 0) return n; }
    return 1074;
}

const ACH_DERIVED = {
    distinct:  () => achInventory().length,
    dexPct:    () => Math.floor((achInventory().length / achDexTotal()) * 100),
    legend:    () => achInventory().filter(p => p.rarity === 'legendario').length,
    secret:    () => achInventory().filter(p => p.rarity === 'secreto').length,
    stars:     () => achInventory().reduce((s, p) => s + (p.stars || 0), 0),
    max7:      () => achInventory().filter(p => (p.stars || 0) >= 7).length,
    maxLevel:  () => achInventory().reduce((m, p) => Math.max(m, Number(p.level) || 1), 0),
    lvl100:    () => achInventory().filter(p => (Number(p.level) || 1) >= 100).length,
    rankPeak:  achRankPeak,
    itemsDistinct: achDistinctItems
};
const ACH_PEAK_KEYS = new Set(['rankPeak', 'itemsDistinct']);   // nunca bajan aunque el valor actual baje

// ---------- Definición de logros ----------

const ACHIEVEMENTS = [];

function defAch(id, cat, icon, name, desc, source, targets, opts = {}) {
    const pick = ACH_LADDER_PICK[targets.length] || ACH_LADDER_PICK[6];
    ACHIEVEMENTS.push({
        id, cat, icon, name, desc, source,
        format: opts.format || null,
        tiers: targets.map((t, i) => ({
            target: t,
            reward: ACH_LADDER[pick[Math.min(i, pick.length - 1)]],
            title: (i === targets.length - 1 && opts.title) ? opts.title : null
        }))
    });
}
const ev = key => ({ type: 'event', key });
const dv = key => ({ type: 'derived', key });
const RANK_NAMES_ACH = ['Pokéball', 'Superball', 'Ultraball', 'Velozball', 'Masterball', 'Campeón Pokémon'];

// Combate
defAch('c_played',  'combate', '⚔️', 'Combatiente',      'Juega combates', ev('battle_played'), [10, 50, 200, 500, 1000], { title: 'Veterano de Mil Batallas' });
defAch('c_won',     'combate', '🥇', 'Vencedor',         'Gana combates', ev('battle_won'), [5, 25, 100, 300, 750], { title: 'Invicto' });
defAch('c_defeat',  'combate', '💥', 'Cazador',          'Derrota Pokémon rivales', ev('enemies_defeated'), [50, 250, 1000, 3000], { title: 'Azote de Pokémon' });
defAch('c_flawless','combate', '🛡️', 'Intocable',        'Gana un combate sin perder ningún Pokémon', ev('flawless_win'), [1, 10, 50], { title: 'Intocable' });
defAch('c_double',  'combate', '👥', 'Dúo Dinámico',     'Gana combates dobles', ev('double_won'), [5, 25, 100], { title: 'Maestro del Doble' });
defAch('c_ranked',  'combate', '🏅', 'Competidor',       'Gana combates clasificatorios', ev('ranked_won'), [3, 15, 50, 150], { title: 'Competidor Nato' });
defAch('c_rank',    'combate', '👑', 'Ascenso',          'Alcanza un rango clasificatorio (Superball → Campeón)', dv('rankPeak'), [1, 2, 3, 4, 5], { title: 'Campeón Indiscutible', format: v => RANK_NAMES_ACH[Math.min(v, 5)] });
defAch('c_ulti',    'combate', '🌟', 'Golpe Final',      'Usa tu ulti en combate', ev('ulti_used'), [10, 50, 250]);
defAch('c_crit',    'combate', '🎯', 'Ojo Clínico',      'Asesta golpes críticos', ev('crit_dealt'), [10, 50, 250]);

// Colección
defAch('k_dex',     'coleccion', '📖', 'Coleccionista',  'Consigue Pokémon distintos', dv('distinct'), [10, 50, 150, 300, 600, 1000], { title: 'Maestro Coleccionista' });
defAch('k_pct',     'coleccion', '📚', 'Pokédex',        'Completa la Pokédex (%)', dv('dexPct'), [25, 50, 75, 100], { title: 'Pokédex Completa' });
defAch('k_leg',     'coleccion', '🐉', 'Leyendas',       'Consigue legendarios distintos', dv('legend'), [1, 5, 15, 30], { title: 'Domador de Leyendas' });
defAch('k_secret',  'coleccion', '✨', 'Megaevolución',  'Consigue megas o secretos distintos', dv('secret'), [1, 5, 15, 30], { title: 'Señor de las Megas' });
defAch('k_pull',    'coleccion', '🎰', 'Invocador',      'Haz tiradas en el gacha de Pokémon', ev('pokemon_pull'), [10, 100, 500, 1500], { title: 'Invocador Legendario' });
defAch('k_rare',    'coleccion', '🍀', 'Suertudo',       'Consigue Pokémon épicos o mejores en el gacha', ev('rare_pull'), [5, 25, 100]);
defAch('k_itempull','coleccion', '🎁', 'Cazador de Objetos', 'Haz tiradas en el gacha de objetos', ev('item_pull'), [10, 50, 200]);
defAch('k_items',   'coleccion', '🎒', 'Mochilero',      'Consigue objetos de combate distintos', dv('itemsDistinct'), [5, 15, 30, 55], { title: 'Coleccionista de Objetos' });
defAch('k_skin',    'coleccion', '🎨', 'Fashionista',    'Compra skins', ev('skin_bought'), [1, 5, 15, 40], { title: 'Fashionista' });
defAch('k_spark',   'coleccion', '🔆', 'Chispa',         'Canjea tu chispa por un legendario', ev('spark_exchanged'), [1, 3, 10]);

// Progreso
defAch('p_levels',  'progreso', '📈', 'Entrenamiento',   'Sube niveles a tus Pokémon', ev('levels_gained'), [50, 250, 1000, 3000]);
defAch('p_lvl',     'progreso', '🔝', 'Cima',            'Lleva un Pokémon a este nivel', dv('maxLevel'), [25, 50, 75, 100]);
defAch('p_100',     'progreso', '💯', 'Maestros',        'Ten Pokémon de nivel 100', dv('lvl100'), [1, 3, 10, 25], { title: 'Entrenador Supremo' });
defAch('p_stars',   'progreso', '⭐', 'Estrellado',      'Suma estrellas entre todos tus Pokémon', dv('stars'), [10, 50, 150, 400], { title: 'Lluvia de Estrellas' });
defAch('p_7',       'progreso', '🌠', 'Poder Máximo',    'Ten Pokémon a 7★', dv('max7'), [1, 5, 15]);
defAch('p_perk',    'progreso', '🌳', 'Estratega',       'Elige nodos del árbol de habilidades', ev('perk_chosen'), [3, 10, 30, 60], { title: 'Estratega' });
defAch('p_equip',   'progreso', '🛠️', 'Equipado',        'Equipa objetos a tus Pokémon', ev('item_equipped'), [1, 10, 50]);

// Hábitos y economía
defAch('h_login',   'habitos', '📅', 'Constancia',       'Inicia sesión en días distintos', ev('login'), [7, 30, 100, 365], { title: 'Entrenador Constante' });
defAch('h_advent',  'habitos', '🎄', 'Calendario',       'Reclama días del calendario', ev('advent_claimed'), [10, 50, 150]);
defAch('h_missions','habitos', '🎯', 'Cumplidor',        'Reclama misiones', ev('missions_claimed'), [10, 50, 200, 500], { title: 'Siempre Cumple' });
defAch('h_chests',  'habitos', '🎁', 'Cofres',           'Abre cofres de misiones', ev('chests_opened'), [3, 15, 50]);
defAch('h_spend',   'habitos', '💸', 'Magnate',          'Gasta monedas', ev('coins_spent'), [5000, 50000, 250000, 1000000], { title: 'Magnate' });

function getAchievement(id) { return ACHIEVEMENTS.find(a => a.id === id); }

// ---------- Estado ----------

function loadAchState() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(ACH_KEY) || '{}') || {}; } catch (e) { s = {}; }
    return Object.assign({ stats: {}, peaks: {}, claimed: {}, notified: {}, seeded: false }, s);
}
function saveAchState(s) { localStorage.setItem(ACH_KEY, JSON.stringify(s)); }

// Quienes ya jugaban conservan lo que ya tenían guardado en el perfil y en el clasificatorio
function seedLifetimeStats() {
    const s = loadAchState();
    if (s.seeded) return;
    const p = typeof getProfile === 'function' ? getProfile().stats : {};
    const r = typeof getRankedState === 'function' ? getRankedState() : null;
    const put = (k, v) => { if (v > (s.stats[k] || 0)) s.stats[k] = v; };
    put('battle_played', p.battles || 0);
    put('battle_won', p.wins || 0);
    put('double_played', p.double || 0);
    put('ranked_played', p.ranked || 0);
    if (r) put('ranked_won', (r.single.wins || 0) + (r.double.wins || 0));
    s.seeded = true;
    // Lo que ya habías conseguido no genera avisos: queda directamente listo para reclamar
    if (typeof userInventory !== 'undefined') ACHIEVEMENTS.forEach(ach => { s.notified[ach.id] = achStatus(ach, s).done; });
    saveAchState(s);
}

// Cada evento del juego suma también en los contadores de por vida
function addLifetimeStat(event, amount) {
    const s = loadAchState();
    s.stats[event] = (s.stats[event] || 0) + amount;
    saveAchState(s);
}

function achValue(ach, state) {
    if (ach.source.type === 'event') return state.stats[ach.source.key] || 0;
    const fn = ACH_DERIVED[ach.source.key];
    let v = fn ? fn() : 0;
    if (ACH_PEAK_KEYS.has(ach.source.key)) {
        v = Math.max(v, state.peaks[ach.source.key] || 0);
        state.peaks[ach.source.key] = v;
    }
    return v;
}

function achStatus(ach, state) {
    const value = achValue(ach, state);
    const done = ach.tiers.filter(t => value >= t.target).length;
    const claimed = Math.min(state.claimed[ach.id] || 0, ach.tiers.length);
    return { value, done, claimed, claimable: Math.max(0, done - claimed) };
}

// Avisa de los logros recién completados (se llama tras cada evento)
function checkAchievements() {
    if (typeof userInventory === 'undefined') return;
    const state = loadAchState();
    let changed = false;

    ACHIEVEMENTS.forEach(ach => {
        const st = achStatus(ach, state);
        const notified = state.notified[ach.id] || 0;
        if (st.done > notified) {
            state.notified[ach.id] = st.done;
            changed = true;
            const tier = ach.tiers[st.done - 1];
            if (typeof showShopToast === 'function') showShopToast(`🏆 ¡Logro conseguido! ${ach.name} · nivel ${st.done}/${ach.tiers.length}${tier.title ? ` · título «${tier.title}»` : ''}`);
        }
    });

    saveAchState(state);
    if (changed && typeof updateMissionBadge === 'function') updateMissionBadge();
}

// ---------- Reclamar ----------

function claimAchievement(id) {
    const ach = getAchievement(id);
    if (!ach) return false;
    const state = loadAchState();
    const st = achStatus(ach, state);
    if (st.claimable <= 0) return false;

    const total = {};
    const titles = [];
    for (let i = st.claimed; i < st.done; i++) {
        const t = ach.tiers[i];
        Object.entries(t.reward).forEach(([k, v]) => { total[k] = (total[k] || 0) + v; });
        if (t.title) titles.push(t.title);
    }

    state.claimed[id] = st.done;
    state.notified[id] = Math.max(state.notified[id] || 0, st.done);
    saveAchState(state);
    if (typeof giveMissionReward === 'function') giveMissionReward(total);

    const rewardTxt = typeof rewardText === 'function' ? rewardText(total) : '';
    if (typeof showShopToast === 'function') showShopToast(`🏆 ${ach.name}: +${rewardTxt}${titles.length ? ` · ¡Nuevo título: «${titles.join('», «')}»!` : ''}`);
    if (typeof updateMissionBadge === 'function') updateMissionBadge();
    if (typeof renderMissions === 'function') renderMissions();
    return true;
}

function claimAllAchievements() {
    let n = 0;
    ACHIEVEMENTS.forEach(a => { if (claimAchievement(a.id)) n++; });
    return n;
}

function countClaimableAchievements() {
    const state = loadAchState();
    return ACHIEVEMENTS.reduce((sum, a) => sum + (achStatus(a, state).claimable > 0 ? 1 : 0), 0);
}

// Títulos conseguidos con logros (el perfil los ofrece junto a los de nivel 100)
function getAchievementTitles() {
    const state = loadAchState();
    const titles = [];
    ACHIEVEMENTS.forEach(a => {
        const claimed = Math.min(state.claimed[a.id] || 0, a.tiers.length);
        for (let i = 0; i < claimed; i++) if (a.tiers[i].title) titles.push(a.tiers[i].title);
    });
    return titles;
}

// ---------- Interfaz ----------

function switchAchCat(cat) { currentAchCat = cat; if (typeof renderMissions === 'function') renderMissions(); }

function achFormat(ach, v) { return ach.format ? ach.format(v) : v.toLocaleString('es-ES'); }

function renderAchievementsHtml() {
    const state = loadAchState();
    const list = ACHIEVEMENTS.filter(a => currentAchCat === 'all' || a.cat === currentAchCat);

    const totalTiers = ACHIEVEMENTS.reduce((s, a) => s + a.tiers.length, 0);
    const claimedTiers = ACHIEVEMENTS.reduce((s, a) => s + achStatus(a, state).claimed, 0);
    const doneTiers = ACHIEVEMENTS.reduce((s, a) => s + achStatus(a, state).done, 0);
    const pct = Math.floor((doneTiers / totalTiers) * 100);
    const claimableSeries = countClaimableAchievements();

    const cats = [['all', '🏆 Todos']].concat(Object.entries(ACH_CATEGORIES).map(([id, c]) => [id, `${c.icon} ${c.name}`]))
        .map(([id, label]) => `<button class="banner-btn ${id === currentAchCat ? 'active' : ''}" onclick="switchAchCat('${id}')">${label}</button>`).join('');

    const cards = list.map(ach => {
        const st = achStatus(ach, state);
        const complete = st.done >= ach.tiers.length;
        const next = ach.tiers[Math.min(st.done, ach.tiers.length - 1)];
        const prevTarget = st.done > 0 ? ach.tiers[st.done - 1].target : 0;
        const pctBar = complete ? 100 : Math.min(100, Math.floor(((st.value - prevTarget) / Math.max(1, next.target - prevTarget)) * 100));
        const dots = ach.tiers.map((t, i) => `<span title="${achFormat(ach, t.target)}" style="color: ${i < st.claimed ? '#4ade80' : (i < st.done ? '#fbbf24' : '#475569')};">●</span>`).join(' ');
        const rewardTier = st.claimable > 0 ? ach.tiers[st.claimed] : next;
        const titleHint = ach.tiers.find(t => t.title);

        return `
            <div class="ms-card ${complete && st.claimable === 0 ? 'claimed' : (st.claimable > 0 ? 'done' : '')}">
                <div style="font-size: 30px; min-width: 40px; text-align: center;">${ach.icon}</div>
                <div class="ms-main">
                    <div class="ms-text">${ach.name} <span style="font-weight: 400; color: #94a3b8; font-size: 12px;">· ${ach.desc}</span></div>
                    <div class="ms-bar"><div style="width: ${pctBar}%"></div></div>
                    <div class="ms-prog">${complete ? `Completado · ${achFormat(ach, st.value)}` : `${achFormat(ach, st.value)} / ${achFormat(ach, next.target)}`} &nbsp; ${dots}
                        ${titleHint ? `<span style="color: #a855f7;"> · 🏷️ Título: ${titleHint.title}</span>` : ''}</div>
                </div>
                <div class="ms-reward">${complete && st.claimable === 0 ? '' : (typeof rewardHtml === 'function' ? rewardHtml(rewardTier.reward) : '')}</div>
                <button class="ms-btn" ${st.claimable === 0 ? 'disabled' : ''} onclick="claimAchievement('${ach.id}')">${st.claimable > 0 ? `Reclamar${st.claimable > 1 ? ' (' + st.claimable + ')' : ''}` : (complete ? '✔ Completado' : 'En curso')}</button>
            </div>`;
    }).join('');

    return `
        <div class="ms-head">Has completado <b>${doneTiers}</b> de <b>${totalTiers}</b> niveles de logro (${pct}%) · reclamados ${claimedTiers}
            ${claimableSeries > 0 ? ` &nbsp; <button class="ms-btn" style="min-width: 0; padding: 4px 12px;" onclick="claimAllAchievements()">Reclamar todos</button>` : ''}
        </div>
        <div class="it-cats" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">${cats}</div>
        <div class="ms-list">${cards}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    seedLifetimeStats();
    checkAchievements();
    if (typeof updateMissionBadge === 'function') updateMissionBadge();
});

// missions.js - Misiones diarias, semanales y mensuales (con cofre al completarlas todas)
//
// El resto del juego avisa de lo que ocurre con trackMission('evento', cantidad).
// Cada periodo elige sus misiones al empezar (mismas para todo el periodo) y se reinicia solo:
//   · diarias   → cada día a medianoche
//   · semanales → cada lunes
//   · mensuales → el día 1 de cada mes
//
// Recompensas calibradas con la economía: 1 🎟️ ≈ 200 🪙, 1 🟣 = 5 🎟️ = 1.000 🪙, 1 💎 ≈ 20 🪙.

const MISSIONS_KEY = 'gachatara_missions';

const MISSION_PERIODS = {
    daily:   { name: 'Diarias',   icon: '☀️', pick: 3, chest: { tickets: 2, coins: 300 } },
    weekly:  { name: 'Semanales', icon: '📅', pick: 4, chest: { masterballs: 1, tickets: 5 } },
    monthly: { name: 'Mensuales', icon: '🗓️', pick: 4, chest: { masterballs: 3, tickets: 20, candies: 10 } }
};

// fixed: true → siempre aparece en ese periodo
const MISSION_POOLS = {
    daily: [
        { id: 'd_login',    event: 'login',            target: 1,   text: 'Inicia sesión hoy', reward: { coins: 300 }, fixed: true },
        { id: 'd_played',   event: 'battle_played',    target: 3,   text: 'Juega {n} combates', reward: { tickets: 1 } },
        { id: 'd_won',      event: 'battle_won',       target: 2,   text: 'Gana {n} combates', reward: { coins: 400 } },
        { id: 'd_defeat',   event: 'enemies_defeated', target: 10,  text: 'Derrota a {n} Pokémon rivales', reward: { tickets: 1 } },
        { id: 'd_pull',     event: 'pokemon_pull',     target: 5,   text: 'Haz {n} tiradas en el gacha de Pokémon', reward: { shards: 25 } },
        { id: 'd_spend',    event: 'coins_spent',      target: 500, text: 'Gasta {n} 🪙', reward: { tickets: 1 } },
        { id: 'd_levels',   event: 'levels_gained',    target: 2,   text: 'Sube {n} niveles a tus Pokémon', reward: { candies: 1 } },
        { id: 'd_double',   event: 'double_played',    target: 1,   text: 'Juega 1 combate doble', reward: { tickets: 1 } },
        { id: 'd_flawless', event: 'flawless_win',     target: 1,   text: 'Gana un combate sin perder ningún Pokémon', reward: { tickets: 2 } },
        { id: 'd_itempull', event: 'item_pull',        target: 2,   text: 'Haz {n} tiradas en el gacha de objetos', reward: { coins: 300 } },
        { id: 'd_ranked',   event: 'ranked_played',    target: 1,   text: 'Juega 1 combate clasificatorio', reward: { tickets: 1 } }
    ],
    weekly: [
        { id: 'w_won',      event: 'battle_won',       target: 15,   text: 'Gana {n} combates', reward: { tickets: 4 } },
        { id: 'w_rplayed',  event: 'ranked_played',    target: 5,    text: 'Juega {n} combates clasificatorios', reward: { tickets: 3 } },
        { id: 'w_rwon',     event: 'ranked_won',       target: 3,    text: 'Gana {n} combates clasificatorios', reward: { masterballs: 1 } },
        { id: 'w_pull',     event: 'pokemon_pull',     target: 30,   text: 'Haz {n} tiradas en el gacha de Pokémon', reward: { shards: 150 } },
        { id: 'w_newmon',   event: 'new_pokemon',      target: 5,    text: 'Consigue {n} Pokémon nuevos', reward: { coins: 1500 } },
        { id: 'w_star',     event: 'star_up',          target: 2,    text: 'Sube {n} estrellas a tus Pokémon', reward: { candies: 5 } },
        { id: 'w_dwon',     event: 'double_won',       target: 5,    text: 'Gana {n} combates dobles', reward: { tickets: 4 } },
        { id: 'w_perk',     event: 'perk_chosen',      target: 2,    text: 'Elige {n} nodos del árbol de habilidades', reward: { tickets: 3 } },
        { id: 'w_defeat',   event: 'enemies_defeated', target: 60,   text: 'Derrota a {n} Pokémon rivales', reward: { coins: 1500 } },
        { id: 'w_spend',    event: 'coins_spent',      target: 3000, text: 'Gasta {n} 🪙', reward: { masterballs: 1 } },
        { id: 'w_advent',   event: 'advent_claimed',   target: 5,    text: 'Reclama {n} días del calendario', reward: { tickets: 3 } },
        { id: 'w_equip',    event: 'item_equipped',    target: 3,    text: 'Equipa {n} objetos a tus Pokémon', reward: { coins: 1000 } },
        { id: 'w_levels',   event: 'levels_gained',    target: 15,   text: 'Sube {n} niveles a tus Pokémon', reward: { tickets: 4 } },
        { id: 'w_rare',     event: 'rare_pull',        target: 3,    text: 'Consigue {n} Pokémon épicos o mejores en el gacha', reward: { tickets: 3 } },
        { id: 'w_skin',     event: 'skin_bought',      target: 1,    text: 'Compra 1 skin', reward: { shards: 40 } }
    ],
    monthly: [
        { id: 'm_won',      event: 'battle_won',       target: 80,  text: 'Gana {n} combates', reward: { masterballs: 3 } },
        { id: 'm_rwon',     event: 'ranked_won',       target: 20,  text: 'Gana {n} combates clasificatorios', reward: { masterballs: 3, tickets: 5 } },
        { id: 'm_pull',     event: 'pokemon_pull',     target: 150, text: 'Haz {n} tiradas en el gacha de Pokémon', reward: { shards: 500 } },
        { id: 'm_newmon',   event: 'new_pokemon',      target: 30,  text: 'Consigue {n} Pokémon nuevos', reward: { masterballs: 2 } },
        { id: 'm_star',     event: 'star_up',          target: 10,  text: 'Sube {n} estrellas a tus Pokémon', reward: { candies: 15, masterballs: 1 } },
        { id: 'm_levels',   event: 'levels_gained',    target: 100, text: 'Sube {n} niveles a tus Pokémon', reward: { masterballs: 2 } },
        { id: 'm_login',    event: 'login',            target: 20,  text: 'Inicia sesión {n} días distintos', reward: { tickets: 15, candies: 10 } },
        { id: 'm_advent',   event: 'advent_claimed',   target: 20,  text: 'Reclama {n} días del calendario', reward: { masterballs: 2 } },
        { id: 'm_itempull', event: 'item_pull',        target: 50,  text: 'Haz {n} tiradas en el gacha de objetos', reward: { tickets: 15 } },
        { id: 'm_perk',     event: 'perk_chosen',      target: 10,  text: 'Elige {n} nodos del árbol de habilidades', reward: { masterballs: 2 } },
        { id: 'm_rare',     event: 'rare_pull',        target: 15,  text: 'Consigue {n} Pokémon épicos o mejores en el gacha', reward: { masterballs: 2 } }
    ]
};

let currentMissionPeriod = 'daily';

// ---------- Periodos ----------

function missionDateKey(date) {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
}

// Lunes de la semana de una fecha (la semana empieza en lunes)
function getWeekStart(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d;
}

function getWeekKey(date = new Date()) { return missionDateKey(getWeekStart(date)); }

function getPeriodKey(period, date = new Date()) {
    if (period === 'daily') return missionDateKey(date);
    if (period === 'weekly') return getWeekKey(date);
    return missionDateKey(date).slice(0, 7);
}

function nextResetDate(period, now = new Date()) {
    if (period === 'daily') return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (period === 'weekly') { const s = getWeekStart(now); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7); }
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function timeUntilReset(period, now = new Date()) {
    const mins = Math.max(0, Math.floor((nextResetDate(period, now) - now) / 60000));
    const days = Math.floor(mins / 1440), hours = Math.floor((mins % 1440) / 60), m = mins % 60;
    if (days > 0) return `${days} d ${hours} h`;
    return `${hours} h ${m} min`;
}

function rollMissionIds(period, key) {
    const pool = MISSION_POOLS[period];
    const fixed = pool.filter(m => m.fixed).map(m => m.id);
    const rest = pool.filter(m => !m.fixed).map(m => m.id);
    const rng = seededRandom(hashString(`${period}-${key}-missions`));
    const picked = [];
    while (picked.length < MISSION_PERIODS[period].pick && rest.length) picked.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return fixed.concat(picked);
}

function getMissionDef(period, id) {
    return MISSION_POOLS[period].find(m => m.id === id);
}

// ---------- Estado ----------

function loadMissionState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(MISSIONS_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    return saved;
}

function saveMissionState(state) {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(state));
}

// Crea o renueva los periodos que hayan cambiado
function ensureMissions(date = new Date()) {
    const state = loadMissionState();
    let changed = false;

    Object.keys(MISSION_PERIODS).forEach(period => {
        const key = getPeriodKey(period, date);
        const cur = state[period];
        const valid = cur && cur.key === key && Array.isArray(cur.ids) && cur.ids.every(id => getMissionDef(period, id));
        if (!valid) {
            state[period] = { key, ids: rollMissionIds(period, key), progress: {}, claimed: {}, chest: false };
            changed = true;
        }
    });

    if (changed) saveMissionState(state);
    return state;
}

function missionTarget(def) { return def.target; }
function missionDone(st, def) { return (st.progress[def.id] || 0) >= def.target; }

// ---------- Seguimiento de eventos ----------

function trackMission(event, amount = 1) {
    if (!(amount > 0)) return;
    const state = ensureMissions();
    let changed = false;

    Object.keys(MISSION_PERIODS).forEach(period => {
        const st = state[period];
        st.ids.forEach(id => {
            const def = getMissionDef(period, id);
            if (!def || def.event !== event) return;
            const before = st.progress[id] || 0;
            if (before >= def.target) return;
            st.progress[id] = Math.min(def.target, before + amount);
            changed = true;
        });
    });

    if (changed) saveMissionState(state);
    updateMissionBadge();
    const tab = document.getElementById('tab-misiones');
    if (changed && tab && tab.classList.contains('active')) renderMissions();
}

// Resumen de un combate para las misiones (lo llama finishBattle)
function trackBattleMissions(won, battleState) {
    const opts = battleState.options || {};
    trackMission('battle_played');
    if (won) trackMission('battle_won');

    const defeated = battleState.enemyTeam.filter(u => u.currentHp <= 0).length;
    if (defeated > 0) trackMission('enemies_defeated', defeated);

    if (opts.format === 'double') { trackMission('double_played'); if (won) trackMission('double_won'); }
    if (opts.ranked) { trackMission('ranked_played'); if (won) trackMission('ranked_won'); }
    if (won && battleState.playerTeam.every(u => u.currentHp > 0)) trackMission('flawless_win');
}

// Un día distinto cada vez que se entra (cuenta una sola vez al día)
function trackDailyLogin() {
    const state = ensureMissions();
    const today = missionDateKey(new Date());
    if (state.lastLogin === today) return;
    state.lastLogin = today;
    saveMissionState(state);
    trackMission('login');
}

// ---------- Recompensas ----------

function giveMissionReward(reward) {
    const cur = getCurrencies();
    ['coins', 'tickets', 'shards', 'masterballs'].forEach(k => { if (reward[k]) cur[k] = (cur[k] || 0) + reward[k]; });
    saveCurrencies(cur);
    if (reward.candies && typeof addBackpackItem === 'function') addBackpackItem('consumables', 'rare_candy', reward.candies);
    if (typeof updateCurrenciesUI === 'function') updateCurrenciesUI();
}

function rewardHtml(reward) {
    const mb = typeof masterballIcon === 'function' ? masterballIcon(16) : '🟣';
    const parts = [];
    if (reward.coins) parts.push(`🪙 ${reward.coins}`);
    if (reward.tickets) parts.push(`🎟️ ${reward.tickets}`);
    if (reward.shards) parts.push(`💎 ${reward.shards}`);
    if (reward.masterballs) parts.push(`${mb} ${reward.masterballs}`);
    if (reward.candies) parts.push(`🍬 ${reward.candies}`);
    return parts.join(' &nbsp; ');
}

function rewardText(reward) {
    const names = { coins: 'monedas', tickets: 'tickets', shards: 'esquirlas', masterballs: 'Masterballs', candies: 'caramelos' };
    return Object.entries(reward).map(([k, v]) => `${v} ${names[k]}`).join(', ');
}

function missionToast(msg) {
    if (typeof showShopToast === 'function') showShopToast(msg);
}

function claimMission(period, id) {
    const state = ensureMissions();
    const st = state[period];
    const def = getMissionDef(period, id);
    if (!st || !def || !st.ids.includes(id) || st.claimed[id] || !missionDone(st, def)) return false;

    st.claimed[id] = true;
    saveMissionState(state);
    giveMissionReward(def.reward);
    missionToast(`🎯 Misión completada: +${rewardText(def.reward)}`);
    updateMissionBadge();
    renderMissions();
    return true;
}

function periodAllClaimed(st) { return st.ids.every(id => st.claimed[id]); }

function claimMissionChest(period) {
    const state = ensureMissions();
    const st = state[period];
    if (!st || st.chest || !periodAllClaimed(st)) return false;

    st.chest = true;
    saveMissionState(state);
    giveMissionReward(MISSION_PERIODS[period].chest);
    missionToast(`🎁 ¡Cofre ${MISSION_PERIODS[period].name.toLowerCase()} abierto! +${rewardText(MISSION_PERIODS[period].chest)}`);
    updateMissionBadge();
    renderMissions();
    return true;
}

function claimAllMissions(period) {
    const state = ensureMissions();
    const st = state[period];
    let n = 0;
    st.ids.forEach(id => { if (!st.claimed[id] && missionDone(st, getMissionDef(period, id))) { if (claimMission(period, id)) n++; } });
    return n;
}

// ---------- Aviso en la pestaña ----------

function countClaimable() {
    const state = ensureMissions();
    let n = 0;
    Object.keys(MISSION_PERIODS).forEach(period => {
        const st = state[period];
        st.ids.forEach(id => { if (!st.claimed[id] && missionDone(st, getMissionDef(period, id))) n++; });
        if (!st.chest && periodAllClaimed(st)) n++;
    });
    return n;
}

function updateMissionBadge() {
    const dot = document.getElementById('missions-dot');
    if (!dot) return;
    const n = countClaimable();
    dot.style.display = n > 0 ? 'inline-block' : 'none';
    dot.textContent = n > 0 ? String(n) : '';
}

// ---------- Interfaz ----------

function injectMissionStyles() {
    if (document.getElementById('mission-styles')) return;
    const st = document.createElement('style');
    st.id = 'mission-styles';
    st.textContent = `
    .ms-tabs { display: flex; gap: 10px; justify-content: center; margin: 12px 0; flex-wrap: wrap; }
    .ms-tabs .banner-btn { position: relative; }
    .ms-count { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px; background: #fbbf24; color: #0f172a; font-size: 11px; font-weight: 700; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
    .ms-head { text-align: center; color: #94a3b8; font-size: 13px; margin-bottom: 12px; }
    .ms-list { display: flex; flex-direction: column; gap: 10px; max-width: 760px; margin: 0 auto; }
    .ms-card { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px; color: #e2e8f0; flex-wrap: wrap; }
    .ms-card.done { border-color: #fbbf24; box-shadow: 0 0 10px rgba(251,191,36,0.3); }
    .ms-card.claimed { opacity: .55; border-color: #4ade80; }
    .ms-main { flex: 1 1 260px; }
    .ms-text { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
    .ms-bar { background: #0f172a; border: 1px solid #334155; border-radius: 6px; height: 10px; overflow: hidden; }
    .ms-bar > div { height: 100%; background: linear-gradient(90deg, #38bdf8, #0284c7); }
    .ms-card.done .ms-bar > div, .ms-card.claimed .ms-bar > div { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .ms-prog { font-size: 11px; color: #94a3b8; margin-top: 3px; }
    .ms-reward { font-size: 14px; min-width: 110px; text-align: center; }
    .ms-btn { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #0f172a; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; min-width: 100px; }
    .ms-btn:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
    .ms-chest { border: 2px dashed #a855f7; background: rgba(168,85,247,0.08); }
    .ms-chest.ready { border-style: solid; box-shadow: 0 0 14px rgba(168,85,247,0.5); }
    .ms-chest.claimed { border-color: #4ade80; }
    `;
    document.head.appendChild(st);
}

function switchMissionPeriod(period) {
    currentMissionPeriod = period;
    renderMissions();
}

function renderMissions() {
    const container = document.getElementById('missions-content');
    if (!container) return;
    injectMissionStyles();

    const state = ensureMissions();
    const st = state[currentMissionPeriod];

    const tabs = Object.entries(MISSION_PERIODS).map(([id, p]) => {
        const s = state[id];
        const ready = s.ids.filter(mid => !s.claimed[mid] && missionDone(s, getMissionDef(id, mid))).length + ((!s.chest && periodAllClaimed(s)) ? 1 : 0);
        return `<button class="banner-btn ${id === currentMissionPeriod ? 'active' : ''}" onclick="switchMissionPeriod('${id}')">${p.icon} ${p.name}${ready ? `<span class="ms-count">${ready}</span>` : ''}</button>`;
    }).join('');

    const cards = st.ids.map(id => {
        const def = getMissionDef(currentMissionPeriod, id);
        const value = st.progress[id] || 0;
        const done = value >= def.target;
        const claimed = !!st.claimed[id];
        const pct = Math.min(100, Math.floor((value / def.target) * 100));
        const text = def.text.replace('{n}', def.target);
        return `
            <div class="ms-card ${claimed ? 'claimed' : (done ? 'done' : '')}">
                <div class="ms-main">
                    <div class="ms-text">${text}</div>
                    <div class="ms-bar"><div style="width: ${pct}%"></div></div>
                    <div class="ms-prog">${value} / ${def.target}</div>
                </div>
                <div class="ms-reward">${rewardHtml(def.reward)}</div>
                <button class="ms-btn" ${(!done || claimed) ? 'disabled' : ''} onclick="claimMission('${currentMissionPeriod}', '${id}')">${claimed ? '✔ Reclamada' : (done ? 'Reclamar' : 'En curso')}</button>
            </div>`;
    }).join('');

    const allClaimed = periodAllClaimed(st);
    const claimedCount = st.ids.filter(id => st.claimed[id]).length;
    const chest = MISSION_PERIODS[currentMissionPeriod].chest;
    const chestHtml = `
        <div class="ms-card ms-chest ${st.chest ? 'claimed' : (allClaimed ? 'ready' : '')}">
            <div class="ms-main">
                <div class="ms-text">🎁 Cofre ${MISSION_PERIODS[currentMissionPeriod].name.toLowerCase()}: completa y reclama todas las misiones</div>
                <div class="ms-prog">${claimedCount} / ${st.ids.length} misiones reclamadas</div>
            </div>
            <div class="ms-reward">${rewardHtml(chest)}</div>
            <button class="ms-btn" ${(!allClaimed || st.chest) ? 'disabled' : ''} onclick="claimMissionChest('${currentMissionPeriod}')">${st.chest ? '✔ Abierto' : (allClaimed ? 'Abrir cofre' : 'Bloqueado')}</button>
        </div>`;

    const anyReady = st.ids.some(id => !st.claimed[id] && missionDone(st, getMissionDef(currentMissionPeriod, id)));

    container.innerHTML = `
        <div class="ms-tabs">${tabs}</div>
        <div class="ms-head">Se reinician en <b>${timeUntilReset(currentMissionPeriod)}</b>
            ${anyReady ? ` &nbsp; <button class="ms-btn" style="min-width: 0; padding: 4px 12px;" onclick="claimAllMissions('${currentMissionPeriod}')">Reclamar todas</button>` : ''}
        </div>
        <div class="ms-list">${cards}${chestHtml}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    trackDailyLogin();
    updateMissionBadge();
    renderMissions();
});

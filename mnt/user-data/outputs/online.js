// online.js - Combates online: búsqueda de rival (20 s), sincronización y respaldo con bot
//
// Arquitectura: el que espera en la cola es el ANFITRIÓN y su navegador simula el combate (usa el motor de
// combat_double.js con el equipo del rival). El otro jugador (INVITADO) envía sus acciones y recibe el estado
// de cada ronda. El servidor (api/online.js + Redis) solo hace de buzón: no ejecuta reglas de combate.
// Si el servidor no responde o no hay rival en 20 s, se juega contra un bot como siempre.

const ONLINE_API = '/api/online';
const ONLINE_SEARCH_MS = 20000;       // tiempo máximo buscando rival
const ONLINE_SEARCH_POLL_MS = 1500;
const ONLINE_BATTLE_POLL_MS = 1200;
const ONLINE_SELECT_MS = 45000;       // tiempo para elegir acciones en cada ronda
const ONLINE_GRACE_MS = 15000;        // margen extra del anfitrión antes de dar por ausente al rival
const ONLINE_PREF_KEY = 'gachatara_online_pref';
const ONLINE_ID_KEY = 'gachatara_player_id';

// ---------- Utilidades ----------

function getPlayerId() {
    let id = localStorage.getItem(ONLINE_ID_KEY);
    if (!id) {
        id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
        localStorage.setItem(ONLINE_ID_KEY, id);
    }
    return id;
}

function isOnlineEnabled() { return localStorage.getItem(ONLINE_PREF_KEY) !== 'off'; }
function setOnlinePref(enabled) {
    localStorage.setItem(ONLINE_PREF_KEY, enabled ? 'on' : 'off');
    if (typeof renderCombatMenu === 'function') renderCombatMenu();
}

function onlineSleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function cleanOnlineText(value, max = 24) {
    return String(value === undefined || value === null ? '' : value).replace(/[<>&"'`\\]/g, '').trim().slice(0, max);
}

async function onlineCall(op, payload = {}, timeoutMs = 6000) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
        const res = await fetch(ONLINE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.assign({ op, playerId: getPlayerId() }, payload)),
            signal: controller ? controller.signal : undefined
        });
        let data = null;
        try { data = await res.json(); } catch (e) { /* respuesta sin JSON */ }
        if (!res.ok || !data || data.ok === false) throw new Error((data && data.error) || ('HTTP ' + res.status));
        return data;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function showOnlineToast(message) {
    const old = document.getElementById('online-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'online-toast';
    t.textContent = message;
    t.style.cssText = 'position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); background: #0f172a; border: 1px solid #00f2fe; color: #fff; padding: 10px 18px; border-radius: 8px; z-index: 10100; font-size: 14px; box-shadow: 0 0 15px rgba(0,242,254,0.4); max-width: 90vw; text-align: center;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4500);
}

// ---------- Equipos ----------

function serializeTeamForOnline(team) {
    return team.map(p => ({
        id: p.id, name: p.name, types: p.types || [p.type || 'Normal'], type: p.type || (p.types && p.types[0]) || 'Normal',
        ability: p.ability || 'none', rarity: p.rarity || 'comun', level: p.level || 1, stars: p.stars || 0,
        perks: p.perks || {}, sprite: p.sprite || '', baseStats: p.baseStats
    }));
}

// Los datos del rival vienen de otro navegador: se limpian antes de usarlos
function sanitizeOpponentTeam(team, fixedLevel) {
    const validStat = v => Math.min(255, Math.max(1, Number(v) || 50));
    return (Array.isArray(team) ? team : []).slice(0, 6).map(p => ({
        id: Number(p.id) || 1,
        name: cleanOnlineText(p.name, 30) || 'Pokémon',
        types: (Array.isArray(p.types) ? p.types : ['Normal']).slice(0, 2).map(t => cleanOnlineText(t, 12)),
        type: cleanOnlineText(p.type || 'Normal', 12),
        ability: cleanOnlineText(p.ability || 'none', 30).toLowerCase(),
        rarity: cleanOnlineText(p.rarity || 'comun', 12),
        level: fixedLevel || Math.min(100, Math.max(1, Number(p.level) || 1)),
        stars: Math.min(7, Math.max(0, Number(p.stars) || 0)),
        perks: (p.perks && typeof p.perks === 'object') ? p.perks : {},
        sprite: /^https:\/\//.test(String(p.sprite || '')) ? String(p.sprite) : '',
        baseStats: {
            hp: validStat(p.baseStats && p.baseStats.hp), attack: validStat(p.baseStats && p.baseStats.attack),
            defense: validStat(p.baseStats && p.baseStats.defense), spAtk: validStat(p.baseStats && p.baseStats.spAtk),
            spDef: validStat(p.baseStats && p.baseStats.spDef), speed: validStat(p.baseStats && p.baseStats.speed)
        }
    }));
}

// ---------- Búsqueda de rival ----------

function showSearchOverlay(title) {
    const old = document.getElementById('online-overlay');
    if (old) old.remove();

    if (!document.getElementById('online-styles')) {
        const st = document.createElement('style');
        st.id = 'online-styles';
        st.textContent = '@keyframes onlineSpin { to { transform: rotate(360deg); } }';
        document.head.appendChild(st);
    }

    const overlay = document.createElement('div');
    overlay.id = 'online-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.82); z-index: 10090; display: flex; align-items: center; justify-content: center; padding: 15px;';
    overlay.innerHTML = `
        <div style="background: #0f172a; border: 1px solid rgba(0,242,254,0.45); border-radius: 14px; padding: 28px 34px; text-align: center; color: #e2e8f0; max-width: 380px; width: 100%;">
            <div style="width: 46px; height: 46px; border: 4px solid #1e293b; border-top-color: #00f2fe; border-radius: 50%; margin: 0 auto 16px auto; animation: onlineSpin 0.9s linear infinite;"></div>
            <h3 style="font-family: 'Orbitron', sans-serif; color: #00f2fe; font-size: 1rem; margin: 0 0 6px 0;">🌐 BUSCANDO RIVAL</h3>
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">${title}</div>
            <div id="online-search-text" style="font-size: 15px; margin-bottom: 16px;">Buscando... 20 s</div>
            <button id="online-cancel-btn" style="background: linear-gradient(135deg, #e11d48, #9f1239); border: none; color: #fff; padding: 9px 22px; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancelar</button>
        </div>`;
    document.body.appendChild(overlay);

    const ui = {
        cancelled: false,
        update(seconds) {
            const el = document.getElementById('online-search-text');
            if (el) el.textContent = `Buscando... ${Math.max(0, seconds)} s`;
        },
        setText(text) {
            const el = document.getElementById('online-search-text');
            if (el) el.textContent = text;
        },
        close() { overlay.remove(); }
    };
    const btn = document.getElementById('online-cancel-btn');
    if (btn) btn.onclick = () => { ui.cancelled = true; btn.disabled = true; ui.setText('Cancelando...'); };
    return ui;
}

// Devuelve { status: 'matched' | 'timeout' | 'cancelled' | 'unavailable', ... }
async function findOnlineOpponent(modeId, team, ui) {
    const profile = typeof getProfile === 'function' ? getProfile() : { name: 'Entrenador' };
    const started = Date.now();

    let res;
    try {
        res = await onlineCall('join', { mode: modeId, name: cleanOnlineText(profile.name, 16) || 'Entrenador', team: serializeTeamForOnline(team) });
    } catch (e) {
        return { status: 'unavailable', error: e.message };
    }

    let failures = 0;
    while (res.status === 'waiting') {
        if (ui.cancelled) {
            const c = await onlineCall('cancel').catch(() => null);
            return (c && c.status === 'matched') ? c : { status: 'cancelled' };
        }

        const remaining = ONLINE_SEARCH_MS - (Date.now() - started);
        ui.update(Math.ceil(remaining / 1000));
        if (remaining <= 0) {
            const c = await onlineCall('cancel').catch(() => null);
            return (c && c.status === 'matched') ? c : { status: 'timeout' };
        }

        await onlineSleep(ONLINE_SEARCH_POLL_MS);
        try {
            res = await onlineCall('poll');
            failures = 0;
        } catch (e) {
            failures++;
            if (failures >= 3) return { status: 'unavailable', error: e.message };
        }
    }
    return res;
}

// ---------- Inicio del combate online ----------

function startOnlineBattle(cfg, myTeam, match, battleOptions, onEnd) {
    const slots = cfg.format === 'double' ? 2 : 1;
    const options = Object.assign({}, battleOptions, {
        slots,
        opponentName: cleanOnlineText(match.opponent.name, 16) || 'Rival',
        net: { role: match.role, matchId: match.matchId }
    });

    if (match.role === 'host') {
        const oppTeam = sanitizeOpponentTeam(match.opponent.team, cfg.fixedLevel);
        return startDoubleBattle(myTeam, oppTeam, cfg.battleMode, onEnd, options);
    }
    return startOnlineGuest(cfg.battleMode, onEnd, options);
}

// ---------- Sincronización (anfitrión) ----------

function buildNetSnapshot(extra) {
    const net = CombatState.net;
    net.seq += 1;
    return Object.assign({
        seq: net.seq,
        round: DoubleCombat.round,
        over: false,
        hostWon: null,
        playerTeam: CombatState.playerTeam,
        enemyTeam: CombatState.enemyTeam,
        activePlayerIndices: CombatState.activePlayerIndices,
        activeEnemyIndices: CombatState.activeEnemyIndices,
        weather: CombatState.weather,
        weatherTurns: CombatState.weatherTurns,
        terrain: CombatState.terrain,
        terrainTurns: CombatState.terrainTurns,
        logHistory: CombatState.logHistory.slice(-40)
    }, extra || {});
}

async function netSendWithRetry(op, payload, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try { return await onlineCall(op, payload); } catch (e) { await onlineSleep(600); }
    }
    return null;
}

function netPublishState(extra) {
    const net = CombatState.net;
    if (!net || net.role !== 'host') return Promise.resolve(null);
    const state = JSON.parse(JSON.stringify(buildNetSnapshot(extra)));
    return netSendWithRetry('publish', { matchId: net.matchId, state });
}

function netPublishFinal(hostWon) {
    return netPublishState({ over: true, hostWon: !!hostWon });
}

// Convierte las acciones recibidas del invitado en acciones del motor (y rellena las que falten)
function netActionsToLocal(remote) {
    const result = [];
    const used = new Set();

    (Array.isArray(remote) ? remote : []).forEach(a => {
        const unit = CombatState.enemyTeam[a.unitIdx];
        if (!unit || !dblAlive(unit) || !dblIsActive(unit) || used.has(unit)) return;

        if (a.type === 'switch') {
            const nu = CombatState.enemyTeam[a.toIdx];
            if (nu && dblAlive(nu) && !dblIndices('e').includes(a.toIdx)) {
                used.add(unit);
                result.push({ type: 'switch', unit, toIdx: a.toIdx });
                return;
            }
        }

        let move = unit.moves[a.moveIdx] || unit.moves[0];
        if (move.cost > unit.energy) move = unit.moves[0];
        const targetIdx = (a.targetIdx === null || a.targetIdx === undefined) ? -1 : a.targetIdx;
        const target = CombatState.playerTeam[targetIdx];
        const validTarget = move.power > 0 && dblAlive(target) && dblIndices('p').includes(targetIdx) ? target : null;
        used.add(unit);
        result.push({ type: 'move', unit, move, target: validTarget });
    });

    dblActive('e').filter(dblAlive).forEach(u => {
        if (!used.has(u)) result.push({ type: 'move', unit: u, move: u.moves[0], target: null });
    });
    return result;
}

// Intervalo entre consultas: empieza rápido y se relaja si la espera se alarga (ahorra peticiones)
function netPollDelay(waitedMs) { return Math.min(2600, ONLINE_BATTLE_POLL_MS + Math.floor(waitedMs / 8)); }

function netPollFlags(started, state) {
    const now = Date.now();
    const beat = now - (state.lastBeat || 0) > 8000;
    if (beat) state.lastBeat = now;
    return { beat, checkAlive: now - started > 12000 };
}

function netWaitForOpponentAction(round, callback) {
    const net = CombatState.net;
    const started = Date.now();
    let deadSince = null;

    const tick = async () => {
        if (CombatState.isBattleOver) return;
        try {
            const r = await onlineCall('getAction', Object.assign({ matchId: net.matchId, role: net.role, round }, netPollFlags(started, net)));
            net.errors = 0;
            if (r.actions) { net.missed = 0; callback(r.actions); return; }
            if (r.oppAlive === false) deadSince = deadSince || Date.now(); else if (r.oppAlive === true) deadSince = null;
        } catch (e) {
            net.errors = (net.errors || 0) + 1;
            if (net.errors >= 8) { netConnectionLost(); return; }
        }

        const waited = Date.now() - started;
        const gone = deadSince && (Date.now() - deadSince > 30000);
        if (gone || waited > ONLINE_SELECT_MS + ONLINE_GRACE_MS) {
            net.missed = (net.missed || 0) + 1;
            if (gone || net.missed >= 3) { netOpponentLeft(); return; }
            addCombatLog('⏱️ El rival tardó demasiado: se usa una acción por defecto.');
            callback(null);
            return;
        }
        setTimeout(tick, netPollDelay(waited));
    };
    tick();
}

// ---------- Sincronización (invitado) ----------

function netGuestSubmit() {
    const net = CombatState.net;
    const actions = DoubleCombat.queue.map(a => ({
        type: a.type,
        unitIdx: CombatState.playerTeam.indexOf(a.unit),
        moveIdx: a.type === 'move' ? a.unit.moves.indexOf(a.move) : 0,
        targetIdx: a.target ? CombatState.enemyTeam.indexOf(a.target) : null,
        toIdx: a.type === 'switch' ? a.toIdx : 0
    }));

    DoubleCombat.phase = 'resolve';
    DoubleCombat.statusText = '⏳ Esperando al rival...';
    CombatState.turn = 'animating';
    renderDoubleArena();

    netSendWithRetry('action', { matchId: net.matchId, round: DoubleCombat.round, actions }).then(r => {
        if (CombatState.isBattleOver) return;
        if (!r) { netConnectionLost(); return; }
        netGuestWait();
    });
}

function swapLogSides(line) {
    return String(line).replace(/⟦([pe]):/g, (m, side) => `⟦${side === 'p' ? 'e' : 'p'}:`);
}

function applyGuestSnapshot(s) {
    // El estado llega desde el punto de vista del anfitrión: se le da la vuelta
    CombatState.playerTeam = s.enemyTeam;
    CombatState.enemyTeam = s.playerTeam;
    CombatState.activePlayerIndices = (s.activeEnemyIndices || []).slice();
    CombatState.activeEnemyIndices = (s.activePlayerIndices || []).slice();
    CombatState.weather = s.weather;
    CombatState.weatherTurns = s.weatherTurns;
    CombatState.terrain = s.terrain;
    CombatState.terrainTurns = s.terrainTurns;
    CombatState.logHistory = (s.logHistory || []).map(swapLogSides);
    DoubleCombat.round = s.round;
    dblSyncLegacyIndices();
}

function netGuestWait() {
    const net = CombatState.net;
    if (!net || net.waiting || CombatState.isBattleOver) return;
    net.waiting = true;
    let deadSince = null;
    const started = Date.now();

    const tick = async () => {
        if (CombatState.isBattleOver) { net.waiting = false; return; }
        try {
            const r = await onlineCall('getState', Object.assign({ matchId: net.matchId, role: net.role, after: net.lastSeq }, netPollFlags(started, net)));
            net.errors = 0;
            if (r.state) {
                net.waiting = false;
                net.lastSeq = r.state.seq;
                applyGuestSnapshot(r.state);
                if (r.state.over) {
                    finishBattle(!r.state.hostWon);
                } else {
                    beginSelection();
                }
                return;
            }
            if (r.oppAlive === false) deadSince = deadSince || Date.now(); else if (r.oppAlive === true) deadSince = null;
            if (deadSince && Date.now() - deadSince > 30000) { net.waiting = false; netOpponentLeft(); return; }
        } catch (e) {
            net.errors = (net.errors || 0) + 1;
            if (net.errors >= 8) { net.waiting = false; netConnectionLost(); return; }
        }
        setTimeout(tick, netPollDelay(Date.now() - started));
    };
    tick();
}

// ---------- Desconexiones ----------

function netOpponentLeft() {
    if (CombatState.isBattleOver) return;
    addCombatLog('📴 ¡El rival se ha desconectado! Ganas el combate.');
    dblConclude(true);
}

function netConnectionLost() {
    if (CombatState.isBattleOver) return;
    addCombatLog('📴 Se perdió la conexión con el servidor.');
    dblConclude(false);
}

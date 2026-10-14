// api/online.js - Servidor de matchmaking y sincronización de combates online (función serverless de Vercel)
//
// Guarda los datos en Redis (Upstash) mediante su API REST. Variables de entorno necesarias
// (Vercel las crea solas al conectar una base de datos "Upstash Redis" al proyecto):
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN     (o bien KV_REST_API_URL + KV_REST_API_TOKEN)
//
// Modelo: el jugador que espera en la cola es el ANFITRIÓN (host): su navegador simula el combate y publica
// el estado de cada ronda. El segundo jugador es el INVITADO (guest): envía sus acciones y recibe el estado.
// Una sola ruta con el parámetro "op" para no gastar funciones del plan gratuito.

const REDIS_URL = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const VALID_MODES = ['quick', 'strategy', 'double6', 'double4', 'ranked-single', 'ranked-double'];
const QUEUE_ALIVE_SECONDS = 25;      // un jugador en cola debe "dar señales" cada pocos segundos
const MATCH_TTL_SECONDS = 3600;
const MAX_STATE_BYTES = 400000;

async function redis(...cmd) {
    const url = REDIS_URL();
    const token = REDIS_TOKEN();
    if (!url || !token) throw new Error('REDIS_NOT_CONFIGURED');

    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd.map(x => (typeof x === 'number' ? String(x) : x)))
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.result;
}

function cleanText(value, max = 24) {
    return String(value === undefined || value === null ? '' : value).replace(/[<>&"'`\\]/g, '').trim().slice(0, max);
}

function cleanTeam(team) {
    if (!Array.isArray(team)) return [];
    return team.slice(0, 6).map(p => ({
        id: Number(p.id) || 1,
        name: cleanText(p.name, 30) || 'Pokémon',
        types: (Array.isArray(p.types) ? p.types : [p.type || 'Normal']).slice(0, 2).map(t => cleanText(t, 12)),
        type: cleanText(p.type || (p.types && p.types[0]) || 'Normal', 12),
        ability: cleanText(p.ability || 'none', 30).toLowerCase(),
        rarity: cleanText(p.rarity || 'comun', 12),
        level: Math.min(100, Math.max(1, Number(p.level) || 1)),
        stars: Math.min(7, Math.max(0, Number(p.stars) || 0)),
        perks: (p.perks && typeof p.perks === 'object') ? Object.fromEntries(Object.entries(p.perks).slice(0, 12).map(([k, v]) => [cleanText(k, 4), cleanText(v, 12)])) : {},
        sprite: /^https:\/\//.test(String(p.sprite || '')) ? String(p.sprite).slice(0, 300) : '',
        baseStats: ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'].reduce((acc, k) => {
            acc[k] = Math.min(255, Math.max(1, Number(p.baseStats && p.baseStats[k]) || 50));
            return acc;
        }, {})
    }));
}

function newId() {
    // El id del combate actúa como "llave secreta" compartida por los dos jugadores
    return require('crypto').randomBytes(12).toString('hex');
}

function validMatchId(id) { return typeof id === 'string' && /^[a-f0-9]{24}$/.test(id); }

function roleOf(match, playerId) {
    if (match.host.playerId === playerId) return 'host';
    if (match.guest.playerId === playerId) return 'guest';
    return null;
}

async function loadMatch(matchId, playerId) {
    if (!validMatchId(matchId)) return { error: 'BAD_MATCH' };
    const raw = await redis('GET', `m:${matchId}`);
    if (!raw) return { error: 'MATCH_NOT_FOUND' };
    const match = JSON.parse(raw);
    const role = roleOf(match, playerId);
    if (!role) return { error: 'FORBIDDEN' };
    return { match, role };
}

async function touchHeartbeat(matchId, role) {
    await redis('SET', `hb:${matchId}:${role}`, '1', 'EX', 40);
}

async function opponentAlive(matchId, role) {
    const other = role === 'host' ? 'guest' : 'host';
    return !!(await redis('GET', `hb:${matchId}:${other}`));
}

// ---------- Operaciones ----------

async function opJoin(body) {
    const playerId = cleanText(body.playerId, 60);
    const mode = String(body.mode || '');
    if (!playerId || !VALID_MODES.includes(mode)) return { ok: false, error: 'BAD_REQUEST' };

    const me = { playerId, name: cleanText(body.name, 16) || 'Entrenador', team: cleanTeam(body.team), ts: Date.now() };
    if (me.team.length === 0) return { ok: false, error: 'EMPTY_TEAM' };

    await redis('SET', `qs:${playerId}`, '1', 'EX', QUEUE_ALIVE_SECONDS);
    await redis('DEL', `pm:${playerId}`);

    for (let i = 0; i < 12; i++) {
        const raw = await redis('LPOP', `q:${mode}`);
        if (!raw) break;

        let entry;
        try { entry = JSON.parse(raw); } catch (e) { continue; }
        if (!entry || entry.playerId === playerId) continue;

        const alive = await redis('GET', `qs:${entry.playerId}`);
        if (!alive) continue;                       // se fue o canceló

        await redis('DEL', `qs:${entry.playerId}`);
        await redis('DEL', `qs:${playerId}`);

        const matchId = newId();
        const match = { id: matchId, mode, createdAt: Date.now(), host: entry, guest: me };
        await redis('SET', `m:${matchId}`, JSON.stringify(match), 'EX', MATCH_TTL_SECONDS);
        await redis('SET', `pm:${entry.playerId}`, matchId, 'EX', 120);

        return { ok: true, status: 'matched', matchId, role: 'guest', opponent: { name: entry.name, team: entry.team } };
    }

    await redis('RPUSH', `q:${mode}`, JSON.stringify(me));
    await redis('EXPIRE', `q:${mode}`, 300);
    return { ok: true, status: 'waiting' };
}

async function matchedResponseFor(playerId) {
    const matchId = await redis('GET', `pm:${playerId}`);
    if (!matchId) return null;
    const raw = await redis('GET', `m:${matchId}`);
    if (!raw) return null;
    const match = JSON.parse(raw);
    await redis('DEL', `pm:${playerId}`);
    return { ok: true, status: 'matched', matchId, role: 'host', opponent: { name: match.guest.name, team: match.guest.team } };
}

async function opPoll(body) {
    const playerId = cleanText(body.playerId, 60);
    if (!playerId) return { ok: false, error: 'BAD_REQUEST' };
    await redis('SET', `qs:${playerId}`, '1', 'EX', QUEUE_ALIVE_SECONDS);
    return (await matchedResponseFor(playerId)) || { ok: true, status: 'waiting' };
}

async function opCancel(body) {
    const playerId = cleanText(body.playerId, 60);
    if (!playerId) return { ok: false, error: 'BAD_REQUEST' };
    await redis('DEL', `qs:${playerId}`);
    return (await matchedResponseFor(playerId)) || { ok: true, status: 'cancelled' };
}

async function opAction(body) {
    const playerId = cleanText(body.playerId, 60);
    const loaded = await loadMatch(body.matchId, playerId);
    if (loaded.error) return { ok: false, error: loaded.error };

    const round = Math.floor(Number(body.round));
    if (!(round >= 1 && round < 10000)) return { ok: false, error: 'BAD_ROUND' };
    const actions = Array.isArray(body.actions) ? body.actions.slice(0, 2).map(a => ({
        type: a.type === 'switch' ? 'switch' : 'move',
        unitIdx: Math.floor(Number(a.unitIdx)),
        moveIdx: Math.floor(Number(a.moveIdx)) || 0,
        targetIdx: a.targetIdx === null || a.targetIdx === undefined ? null : Math.floor(Number(a.targetIdx)),
        toIdx: Math.floor(Number(a.toIdx))
    })) : [];

    await redis('SET', `a:${loaded.match.id}:${round}:${loaded.role}`, JSON.stringify(actions), 'EX', 900);
    await touchHeartbeat(loaded.match.id, loaded.role);
    return { ok: true };
}

// Lecturas baratas: no comprueban al jugador (la llave es el id secreto del combate) y solo escriben
// el "latido" o consultan al rival de vez en cuando (beat / checkAlive) para ahorrar comandos de Redis.
async function opGetAction(body) {
    const matchId = body.matchId;
    const role = body.role === 'guest' ? 'guest' : (body.role === 'host' ? 'host' : null);
    if (!validMatchId(matchId) || !role) return { ok: false, error: 'BAD_REQUEST' };

    const round = Math.floor(Number(body.round));
    const other = role === 'host' ? 'guest' : 'host';
    const raw = await redis('GET', `a:${matchId}:${round}:${other}`);
    if (body.beat) await redis('SET', `hb:${matchId}:${role}`, '1', 'EX', 40);
    const oppAlive = body.checkAlive ? await opponentAlive(matchId, role) : null;
    return { ok: true, actions: raw ? JSON.parse(raw) : null, oppAlive };
}

async function opPublish(body) {
    const playerId = cleanText(body.playerId, 60);
    const loaded = await loadMatch(body.matchId, playerId);
    if (loaded.error) return { ok: false, error: loaded.error };
    if (loaded.role !== 'host') return { ok: false, error: 'ONLY_HOST' };

    const state = body.state;
    if (!state || typeof state !== 'object' || !Number.isFinite(Number(state.seq))) return { ok: false, error: 'BAD_STATE' };
    const text = JSON.stringify(state);
    if (text.length > MAX_STATE_BYTES) return { ok: false, error: 'STATE_TOO_BIG' };

    await redis('SET', `s:${loaded.match.id}`, text, 'EX', MATCH_TTL_SECONDS);
    await touchHeartbeat(loaded.match.id, loaded.role);
    return { ok: true };
}

async function opGetState(body) {
    const matchId = body.matchId;
    const role = body.role === 'guest' ? 'guest' : (body.role === 'host' ? 'host' : null);
    if (!validMatchId(matchId) || !role) return { ok: false, error: 'BAD_REQUEST' };

    const after = Number(body.after) || 0;
    const raw = await redis('GET', `s:${matchId}`);
    if (body.beat) await redis('SET', `hb:${matchId}:${role}`, '1', 'EX', 40);

    let state = null;
    if (raw) {
        const parsed = JSON.parse(raw);
        if (Number(parsed.seq) > after) state = parsed;
    }
    const oppAlive = body.checkAlive ? await opponentAlive(matchId, role) : null;
    return { ok: true, state, oppAlive };
}

const OPS = { join: opJoin, poll: opPoll, cancel: opCancel, action: opAction, getAction: opGetAction, publish: opPublish, getState: opGetState };

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
        return;
    }

    try {
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body || '{}');
        body = body || {};

        const op = OPS[body.op];
        if (!op) { res.status(400).json({ ok: false, error: 'UNKNOWN_OP' }); return; }

        const result = await op(body);
        res.status(result.ok ? 200 : 400).json(result);
    } catch (e) {
        const notConfigured = e && e.message === 'REDIS_NOT_CONFIGURED';
        res.status(notConfigured ? 503 : 500).json({ ok: false, error: notConfigured ? 'REDIS_NOT_CONFIGURED' : 'SERVER_ERROR' });
    }
};

// Para pruebas locales
module.exports._internals = { cleanTeam, cleanText };

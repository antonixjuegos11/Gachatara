// profile.js - Perfil del jugador: nombre editable, foto (cualquier Pokémon que tengas), título y estadísticas

const PROFILE_KEY = 'gachatara_profile';

function getProfile() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    return {
        name: saved.name || 'Entrenador',
        avatarId: saved.avatarId || null,
        title: saved.title || null,
        stats: Object.assign({ battles: 0, wins: 0, losses: 0, quick: 0, strategy: 0, streak: 0, bestStreak: 0 }, saved.stats || {})
    };
}

function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// Se llama desde finishBattle() al terminar cada combate
function recordBattleResult(hasWon, mode) {
    const profile = getProfile();
    const s = profile.stats;
    s.battles += 1;
    if (hasWon) {
        s.wins += 1;
        s.streak += 1;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
    } else {
        s.losses += 1;
        s.streak = 0;
    }
    if (mode === 'strategy') s.strategy += 1; else s.quick += 1;
    saveProfile(profile);
    renderProfileChip();
}

function escapeProfileText(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getAvatarSprite(profile) {
    if (!profile.avatarId || typeof userInventory === 'undefined') return null;
    const p = userInventory.find(x => Number(x.id) === Number(profile.avatarId));
    return p ? p.sprite : null;
}

// ---------- Esquina superior (chip del jugador) ----------

function renderProfileChip() {
    injectProfileStyles();
    const chip = document.getElementById('profile-chip');
    if (!chip) return;

    const profile = getProfile();
    const sprite = getAvatarSprite(profile);

    chip.innerHTML = `
        <div class="pf-avatar">${sprite ? `<img src="${sprite}" alt="avatar">` : '🧑'}</div>
        <div class="pf-info">
            <span class="pf-name">${escapeProfileText(profile.name)}</span>
            <span class="pf-title">${profile.title ? escapeProfileText(profile.title) : 'Sin título'}</span>
        </div>
    `;
    chip.onclick = openProfileModal;
}

// ---------- Menú del jugador ----------

function injectProfileStyles() {
    if (document.getElementById('profile-styles')) return;
    const st = document.createElement('style');
    st.id = 'profile-styles';
    st.textContent = `
    .profile-chip { display: flex; align-items: center; gap: 8px; cursor: pointer; background: rgba(0,242,254,0.08); border: 1px solid rgba(0,242,254,0.35); border-radius: 30px; padding: 4px 14px 4px 4px; margin-left: 14px; transition: background .2s; }
    .profile-chip:hover { background: rgba(0,242,254,0.18); }
    .pf-avatar { width: 38px; height: 38px; border-radius: 50%; background: #0f172a; border: 2px solid #00f2fe; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 20px; flex-shrink: 0; }
    .pf-avatar img { width: 100%; height: 100%; object-fit: contain; }
    .pf-info { display: flex; flex-direction: column; line-height: 1.15; }
    .pf-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; color: #fff; }
    .pf-title { font-size: 11px; color: #fbbf24; }
    .pf-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); z-index: 10040; display: none; align-items: center; justify-content: center; padding: 15px; }
    .pf-box { background: #0f172a; border: 1px solid rgba(0,242,254,0.4); border-radius: 12px; width: 100%; max-width: 640px; max-height: 92vh; overflow-y: auto; padding: 20px; color: #e2e8f0; position: relative; }
    .pf-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    .pf-box h2 { font-family: 'Orbitron', sans-serif; color: #00f2fe; margin: 0 0 14px 0; font-size: 1.2rem; }
    .pf-box h3 { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: #7bed9f; margin: 16px 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; }
    .pf-top { display: flex; gap: 14px; align-items: center; }
    .pf-big-avatar { width: 84px; height: 84px; border-radius: 50%; background: #1e293b; border: 3px solid #00f2fe; display: flex; align-items: center; justify-content: center; font-size: 40px; overflow: hidden; flex-shrink: 0; }
    .pf-big-avatar img { width: 100%; height: 100%; object-fit: contain; }
    .pf-row { display: flex; gap: 6px; margin-bottom: 6px; }
    .pf-row input, .pf-row select { flex: 1; background: #1e293b; border: 1px solid #334155; color: #fff; border-radius: 6px; padding: 7px 9px; font-size: 14px; }
    .pf-row button { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; border-radius: 6px; padding: 7px 12px; font-weight: 700; cursor: pointer; color: #0f172a; }
    .pf-avatars { display: grid; grid-template-columns: repeat(auto-fill, minmax(54px, 1fr)); gap: 6px; max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 8px; }
    .pf-avatars img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #1e293b; border-radius: 8px; border: 2px solid transparent; cursor: pointer; }
    .pf-avatars img:hover { border-color: #00f2fe; }
    .pf-avatars img.sel { border-color: #fbbf24; }
    .pf-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 8px; }
    .pf-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px; text-align: center; }
    .pf-stat b { display: block; font-size: 18px; color: #fff; }
    .pf-stat span { font-size: 11px; color: #94a3b8; }
    `;
    document.head.appendChild(st);
}

function openProfileModal() {
    injectProfileStyles();
    let modal = document.getElementById('profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'pf-overlay';
        modal.addEventListener('click', e => { if (e.target === modal) closeProfileModal(); });
        document.body.appendChild(modal);
    }
    renderProfileModal();
    modal.style.display = 'flex';
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

function renderProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    const profile = getProfile();
    const s = profile.stats;
    const inv = typeof userInventory !== 'undefined' ? userInventory : [];
    const sprite = getAvatarSprite(profile);

    // Estadísticas de Pokémon
    const dexTotal = (typeof DATABASE !== 'undefined')
        ? Object.values(DATABASE).reduce((sum, arr) => sum + arr.length, 0) || 1074
        : 1074;
    const totalCopies = inv.reduce((sum, p) => sum + (p.count || 1), 0);
    const legendarios = inv.filter(p => p.rarity === 'legendario').length;
    const secretos = inv.filter(p => p.rarity === 'secreto').length;
    const maxLevel = inv.reduce((m, p) => Math.max(m, Number(p.level) || 1), 0);
    const lvl100 = inv.filter(p => (Number(p.level) || 1) >= 100).length;
    const maxStars = inv.reduce((m, p) => Math.max(m, p.stars || 0), 0);
    const perksChosen = inv.reduce((sum, p) => sum + Object.keys(p.perks || {}).length, 0);
    const winRate = s.battles > 0 ? Math.round((s.wins / s.battles) * 100) : 0;

    const titles = typeof getPlayerTitles === 'function' ? getPlayerTitles() : [];
    const titleOptions = ['<option value="">Sin título</option>']
        .concat(titles.map(t => `<option value="${escapeProfileText(t)}" ${profile.title === t ? 'selected' : ''}>${escapeProfileText(t)}</option>`))
        .join('');

    const avatars = inv.slice().sort((a, b) => a.id - b.id).map(p =>
        `<img src="${p.sprite}" alt="${escapeProfileText(p.name)}" title="${escapeProfileText(p.name)}"
              class="${Number(profile.avatarId) === Number(p.id) ? 'sel' : ''}" onclick="setProfileAvatar(${p.id})">`
    ).join('');

    modal.innerHTML = `
        <div class="pf-box">
            <button class="pf-close" onclick="closeProfileModal()">✖</button>
            <h2>👤 PERFIL DEL JUGADOR</h2>

            <div class="pf-top">
                <div class="pf-big-avatar">${sprite ? `<img src="${sprite}" alt="avatar">` : '🧑'}</div>
                <div style="flex:1;">
                    <div class="pf-row">
                        <input id="pf-name-input" type="text" maxlength="16" value="${escapeProfileText(profile.name)}" placeholder="Nombre">
                        <button onclick="saveProfileName()">Guardar</button>
                    </div>
                    <div class="pf-row">
                        <select id="pf-title-select" onchange="setProfileTitle(this.value)">${titleOptions}</select>
                    </div>
                    <div style="font-size:11px; color:#94a3b8;">${titles.length === 0 ? 'Lleva un Pokémon al nivel 100 para desbloquear tu primer título.' : `Títulos desbloqueados: ${titles.length}`}</div>
                </div>
            </div>

            <h3>Foto de perfil (elige uno de tus Pokémon)</h3>
            ${inv.length ? `<div class="pf-avatars">${avatars}</div>` : '<div style="color:#94a3b8; font-size:13px;">Aún no tienes Pokémon. ¡Invoca el primero!</div>'}

            <h3>⚔️ Estadísticas de combate</h3>
            <div class="pf-stats">
                <div class="pf-stat"><b>${s.battles}</b><span>Combates</span></div>
                <div class="pf-stat"><b>${s.wins}</b><span>Victorias</span></div>
                <div class="pf-stat"><b>${s.losses}</b><span>Derrotas</span></div>
                <div class="pf-stat"><b>${winRate}%</b><span>% de victorias</span></div>
                <div class="pf-stat"><b>${s.streak}</b><span>Racha actual</span></div>
                <div class="pf-stat"><b>${s.bestStreak}</b><span>Mejor racha</span></div>
                <div class="pf-stat"><b>${s.quick}</b><span>Partidas rápidas</span></div>
                <div class="pf-stat"><b>${s.strategy}</b><span>Partidas estratégicas</span></div>
            </div>

            <h3>📖 Estadísticas de Pokémon</h3>
            <div class="pf-stats">
                <div class="pf-stat"><b>${inv.length} / ${dexTotal}</b><span>Pokémon distintos</span></div>
                <div class="pf-stat"><b>${totalCopies}</b><span>Copias totales</span></div>
                <div class="pf-stat"><b>${legendarios}</b><span>Legendarios</span></div>
                <div class="pf-stat"><b>${secretos}</b><span>Megas / Secretos</span></div>
                <div class="pf-stat"><b>${maxLevel}</b><span>Nivel más alto</span></div>
                <div class="pf-stat"><b>${lvl100}</b><span>Pokémon nivel 100</span></div>
                <div class="pf-stat"><b>${maxStars}★</b><span>Estrellas máximas</span></div>
                <div class="pf-stat"><b>${perksChosen}</b><span>Nodos de árbol elegidos</span></div>
            </div>
        </div>
    `;
}

function saveProfileName() {
    const input = document.getElementById('pf-name-input');
    if (!input) return;
    const name = input.value.trim().slice(0, 16);
    if (!name) { alert('El nombre no puede estar vacío.'); return; }
    const profile = getProfile();
    profile.name = name;
    saveProfile(profile);
    renderProfileChip();
    renderProfileModal();
}

function setProfileAvatar(pokemonId) {
    const profile = getProfile();
    profile.avatarId = Number(pokemonId);
    saveProfile(profile);
    renderProfileChip();
    renderProfileModal();
}

function setProfileTitle(title) {
    const profile = getProfile();
    profile.title = title || null;
    saveProfile(profile);
    renderProfileChip();
    renderProfileModal();
}

document.addEventListener('DOMContentLoaded', renderProfileChip);

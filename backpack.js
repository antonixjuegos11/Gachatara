// backpack.js - Mochila del jugador (secciones: Objetos de combate y Consumibles)
//
// Datos: localStorage 'gachatara_backpack' = { combat: { itemId: cantidad }, consumables: { itemId: cantidad } }
// Este archivo es autónomo: se puede cargar también en ajustes.html (solo usa las funciones de datos).

const BACKPACK_KEY = 'gachatara_backpack';

const BACKPACK_SECTIONS = [
    { id: 'combat',      name: 'Objetos de combate', icon: '⚔️', empty: 'No tienes objetos de combate todavía.' },
    { id: 'consumables', name: 'Consumibles',        icon: '🧪', empty: 'No tienes consumibles. Los Caramelos Raros se venderán en la tienda.' }
];

// Catálogo de objetos por sección (los objetos de combate llegarán más adelante)
const BACKPACK_ITEMS = {
    combat: {},
    consumables: {
        rare_candy: { name: 'Caramelo Raro', icon: '🍬', desc: 'Sube 1 nivel a un Pokémon (hasta el nivel 100).' }
    }
};

let currentBackpackSection = 'consumables';

// ---------- Datos ----------

function getBackpack() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(BACKPACK_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    return { combat: saved.combat || {}, consumables: saved.consumables || {} };
}

function saveBackpack(bp) {
    localStorage.setItem(BACKPACK_KEY, JSON.stringify(bp));
}

function getItemCount(section, itemId) {
    return Number(getBackpack()[section][itemId]) || 0;
}

function addBackpackItem(section, itemId, amount) {
    const bp = getBackpack();
    bp[section][itemId] = (Number(bp[section][itemId]) || 0) + amount;
    saveBackpack(bp);
}

function removeBackpackItem(section, itemId, amount) {
    const bp = getBackpack();
    const left = (Number(bp[section][itemId]) || 0) - amount;
    if (left > 0) bp[section][itemId] = left; else delete bp[section][itemId];
    saveBackpack(bp);
}

// Para pruebas desde Ajustes
function addRareCandies(amount) {
    addBackpackItem('consumables', 'rare_candy', amount);
    return getItemCount('consumables', 'rare_candy');
}

// ---------- Uso del Caramelo Raro ----------

function useRareCandy(pokemonId, amount = 1) {
    if (typeof userInventory === 'undefined') return;
    const p = userInventory.find(x => Number(x.id) === Number(pokemonId));
    if (!p) return;

    p.level = Number(p.level) || 1;
    p.xp = Number(p.xp) || 0;

    const available = getItemCount('consumables', 'rare_candy');
    if (available <= 0) { showBackpackToast('No te quedan Caramelos Raros.'); return; }
    if (p.level >= 100) { showBackpackToast(`${p.name} ya está al nivel máximo.`); return; }

    const n = Math.min(amount, available, 100 - p.level);
    const oldLevel = p.level;
    p.level += n;
    removeBackpackItem('consumables', 'rare_candy', n);

    if (typeof saveStorage === 'function') saveStorage();
    if (typeof renderInventory === 'function') renderInventory();

    const newNodes = Math.floor(p.level / 10) - Math.floor(oldLevel / 10);
    showBackpackToast(`🍬 ${p.name} sube del Nv. ${oldLevel} al Nv. ${p.level}${newNodes > 0 ? ' · 🌳 ¡nodo nuevo en el árbol!' : ''}`);

    renderBackpack();
    renderCandyPicker();

    const pm = document.getElementById('pokemon-modal');
    if (pm && pm.style.display === 'flex' && typeof openPokemonModal === 'function') {
        openPokemonModal(p.id);
    }
}

// ---------- Interfaz ----------

function injectBackpackStyles() {
    if (document.getElementById('backpack-styles')) return;
    const st = document.createElement('style');
    st.id = 'backpack-styles';
    st.textContent = `
    .bp-tabs { display: flex; gap: 10px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
    .bp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; margin-top: 10px; }
    .bp-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(0,242,254,0.25); border-radius: 10px; padding: 14px; text-align: center; color: #e2e8f0; }
    .bp-item .bp-icon { font-size: 38px; }
    .bp-item h4 { margin: 6px 0 2px 0; font-family: 'Rajdhani', sans-serif; font-size: 17px; color: #fff; }
    .bp-item .bp-qty { color: #fbbf24; font-weight: 700; }
    .bp-item p { font-size: 12px; color: #94a3b8; margin: 6px 0 10px 0; min-height: 30px; }
    .bp-use { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #0f172a; font-weight: 700; padding: 7px 16px; border-radius: 6px; cursor: pointer; }
    .bp-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
    .bp-empty .bp-empty-icon { font-size: 52px; opacity: .6; }
    .bp-toast { position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); background: #0f172a; border: 1px solid #00f2fe; color: #fff; padding: 10px 18px; border-radius: 8px; z-index: 10100; font-size: 14px; box-shadow: 0 0 15px rgba(0,242,254,0.4); }
    .bp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 10030; display: none; align-items: center; justify-content: center; padding: 15px; }
    .bp-box { background: #0f172a; border: 1px solid rgba(0,242,254,0.4); border-radius: 12px; width: 100%; max-width: 520px; max-height: 90vh; display: flex; flex-direction: column; padding: 16px; color: #e2e8f0; position: relative; }
    .bp-box h3 { margin: 0 0 4px 0; font-family: 'Orbitron', sans-serif; color: #00f2fe; font-size: 1rem; }
    .bp-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
    .bp-search { background: #1e293b; border: 1px solid #334155; color: #fff; border-radius: 6px; padding: 8px 10px; margin: 8px 0; font-size: 14px; }
    .bp-list { overflow-y: auto; flex: 1; }
    .bp-row { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .bp-row img { width: 42px; height: 42px; object-fit: contain; }
    .bp-row .bp-name { flex: 1; font-size: 14px; }
    .bp-row .bp-name small { display: block; color: #94a3b8; font-size: 11px; }
    .bp-row button { background: #1e293b; border: 1px solid #00f2fe; color: #00f2fe; border-radius: 6px; padding: 4px 9px; cursor: pointer; font-weight: 700; }
    .bp-row button:disabled { opacity: .35; cursor: not-allowed; border-color: #334155; color: #64748b; }
    `;
    document.head.appendChild(st);
}

function showBackpackToast(message) {
    injectBackpackStyles();
    const old = document.getElementById('bp-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'bp-toast';
    t.className = 'bp-toast';
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

function switchBackpackSection(sectionId) {
    currentBackpackSection = sectionId;
    renderBackpack();
}

function renderBackpack() {
    const container = document.getElementById('backpack-content');
    if (!container) return;
    injectBackpackStyles();

    const bp = getBackpack();

    const tabs = BACKPACK_SECTIONS.map(sec => {
        const total = Object.values(bp[sec.id]).reduce((a, b) => a + (Number(b) || 0), 0);
        return `<button class="banner-btn ${sec.id === currentBackpackSection ? 'active' : ''}" onclick="switchBackpackSection('${sec.id}')">${sec.icon} ${sec.name} (${total})</button>`;
    }).join('');

    const section = BACKPACK_SECTIONS.find(s => s.id === currentBackpackSection) || BACKPACK_SECTIONS[0];
    const entries = Object.entries(bp[section.id]).filter(([id, qty]) => qty > 0 && BACKPACK_ITEMS[section.id][id]);

    let body;
    if (entries.length === 0) {
        body = `<div class="bp-empty"><div class="bp-empty-icon">🎒</div><p>${section.empty}</p></div>`;
    } else {
        body = `<div class="bp-grid">` + entries.map(([id, qty]) => {
            const item = BACKPACK_ITEMS[section.id][id];
            const usable = id === 'rare_candy';
            return `
                <div class="bp-item">
                    <div class="bp-icon">${item.icon}</div>
                    <h4>${item.name}</h4>
                    <div class="bp-qty">x${qty}</div>
                    <p>${item.desc}</p>
                    ${usable ? `<button class="bp-use" onclick="openCandyPicker()">Usar</button>` : ''}
                </div>`;
        }).join('') + `</div>`;
    }

    container.innerHTML = `<div class="bp-tabs">${tabs}</div>${body}`;
}

// Selector de Pokémon para usar caramelos
function openCandyPicker() {
    injectBackpackStyles();
    let modal = document.getElementById('candy-picker');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'candy-picker';
        modal.className = 'bp-overlay';
        modal.addEventListener('click', e => { if (e.target === modal) closeCandyPicker(); });
        document.body.appendChild(modal);
    }
    modal.dataset.query = '';
    modal.style.display = 'flex';
    renderCandyPicker(true);
}

function closeCandyPicker() {
    const modal = document.getElementById('candy-picker');
    if (modal) modal.style.display = 'none';
}

function renderCandyPicker(rebuild = false) {
    const modal = document.getElementById('candy-picker');
    if (!modal || modal.style.display === 'none' || typeof userInventory === 'undefined') return;

    const candies = getItemCount('consumables', 'rare_candy');
    const query = (document.getElementById('candy-search') ? document.getElementById('candy-search').value : '')
        .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (candies <= 0) { closeCandyPicker(); return; }

    const rows = userInventory.slice().sort((a, b) => Number(a.id) - Number(b.id))
        .filter(p => !query || p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query) || String(p.id) === query.replace('#', ''))
        .map(p => {
            const lvl = Number(p.level) || 1;
            const maxed = lvl >= 100;
            return `
                <div class="bp-row">
                    <img src="${p.sprite}" alt="${p.name}">
                    <div class="bp-name">${p.name}<small>Nv. ${lvl}</small></div>
                    <button ${maxed ? 'disabled' : ''} onclick="useRareCandy(${p.id}, 1)">+1</button>
                    <button ${maxed || candies < 2 ? 'disabled' : ''} onclick="useRareCandy(${p.id}, 10)">+10</button>
                </div>`;
        }).join('');

    if (rebuild || !document.getElementById('candy-list')) {
        modal.innerHTML = `
            <div class="bp-box">
                <button class="bp-close" onclick="closeCandyPicker()">✖</button>
                <h3>🍬 Usar Caramelo Raro</h3>
                <div id="candy-count" style="font-size:12px; color:#fbbf24;">Te quedan: ${candies}</div>
                <input id="candy-search" class="bp-search" type="text" placeholder="🔍 Buscar Pokémon..." oninput="renderCandyPicker()" autocomplete="off">
                <div id="candy-list" class="bp-list">${rows || '<div class="bp-empty">No tienes Pokémon.</div>'}</div>
            </div>`;
    } else {
        document.getElementById('candy-count').textContent = `Te quedan: ${candies}`;
        document.getElementById('candy-list').innerHTML = rows || '<div class="bp-empty">Sin resultados.</div>';
    }
}

document.addEventListener('DOMContentLoaded', renderBackpack);

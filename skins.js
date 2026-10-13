// skins.js - Skins de Pokémon: catálogos, tienda diaria, compra y equipar
//
// Una skin cambia el aspecto (sprite) de un Pokémon tuyo en todo el juego.
// Catálogos: de momento solo "Shinys". Para añadir otro catálogo basta con
// añadir una entrada a SKIN_CATALOGS (nombre, precios, cuántas salen al día y cómo se obtiene su sprite).
// Se pagan con 💎 Esquirlas Coloridas (la moneda de skins).

const SKINS_KEY = 'gachatara_skins';

const SKIN_CATALOGS = {
    shiny: {
        id: 'shiny',
        name: 'Shinys',
        buttonLabel: '✨ Shiny',
        icon: '✨',
        perDay: 25,
        // Precio en 💎 según la categoría del Pokémon
        prices: { comun: 100, raro: 200, epico: 400, legendario: 1000 },
        spriteFor: id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
    }
};

// ---------- Datos ----------

function getSkinsState() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(SKINS_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    const today = getTodayString();
    const daily = (saved.daily && saved.daily.date === today) ? saved.daily : { date: today, bought: {} };
    return { owned: saved.owned || {}, daily };
}

function saveSkinsState(state) {
    localStorage.setItem(SKINS_KEY, JSON.stringify(state));
}

function ownsSkin(catalogId, pokemonId) {
    const owned = getSkinsState().owned[catalogId] || [];
    return owned.includes(Number(pokemonId));
}

function getOwnedSkinsFor(pokemonId) {
    return Object.keys(SKIN_CATALOGS).filter(cid => ownsSkin(cid, pokemonId));
}

function skinPrice(catalogId, pkmn) {
    const cat = SKIN_CATALOGS[catalogId];
    return cat.prices[pkmn.rarity] || Math.max(...Object.values(cat.prices));
}

// Skins del día de un catálogo: mismas durante todo el día, ordenadas por Pokédex
function getDailySkinOffers(catalogId) {
    const cat = SKIN_CATALOGS[catalogId];
    if (!cat || typeof DATABASE === 'undefined') return null;

    const pool = [].concat(DATABASE.comun || [], DATABASE.raro || [], DATABASE.epico || [], DATABASE.legendario || [])
        .sort((a, b) => a.id - b.id);
    if (pool.length === 0) return null;

    const rng = seededRandom(hashString(`${getTodayString()}-skins-${catalogId}`));
    const copy = pool.slice();
    const picked = [];
    while (picked.length < cat.perDay && copy.length > 0) {
        picked.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    }
    return picked.sort((a, b) => a.id - b.id);
}

function buySkin(catalogId, pokemonId) {
    const offers = getDailySkinOffers(catalogId);
    const pkmn = offers ? offers.find(p => Number(p.id) === Number(pokemonId)) : null;
    if (!pkmn) return;

    const state = getSkinsState();
    const owned = state.owned[catalogId] || [];
    if (owned.includes(pkmn.id)) return;

    const price = skinPrice(catalogId, pkmn);
    const currencies = getCurrencies();
    if ((currencies.shards || 0) < price) {
        showShopToast(`Te faltan ${price - (currencies.shards || 0)} 💎 para esta skin.`);
        return;
    }

    currencies.shards -= price;
    saveCurrencies(currencies);

    owned.push(pkmn.id);
    state.owned[catalogId] = owned;
    state.daily.bought[catalogId] = (state.daily.bought[catalogId] || []).concat(pkmn.id);
    saveSkinsState(state);

    const hasPokemon = typeof userInventory !== 'undefined' && userInventory.some(x => Number(x.id) === Number(pkmn.id));
    showShopToast(`✅ Skin ${SKIN_CATALOGS[catalogId].name.replace(/s$/, '')} de ${pkmn.name} comprada${hasPokemon ? ': equípala desde su menú' : ' (la verás en cuanto consigas al Pokémon)'}`);
    renderShop();
}

// ---------- Equipar ----------

// catalogId = null → vuelve al aspecto original
function equipSkin(pokemonId, catalogId) {
    if (typeof userInventory === 'undefined') return;
    const inv = userInventory.find(x => Number(x.id) === Number(pokemonId));
    if (!inv) return;

    if (catalogId) {
        if (!ownsSkin(catalogId, inv.id)) return;
        if (!inv.baseSprite) inv.baseSprite = inv.sprite;
        inv.sprite = SKIN_CATALOGS[catalogId].spriteFor(inv.id);
        inv.skin = catalogId;
    } else {
        if (inv.baseSprite) inv.sprite = inv.baseSprite;
        delete inv.skin;
    }

    // Los equipos guardan copias de los Pokémon: se actualizan también
    ['strategy', 'fast', 'quad'].forEach(mode => {
        const arr = typeof getTeamArray === 'function' ? getTeamArray(mode) : null;
        if (!Array.isArray(arr)) return;
        arr.forEach(p => {
            if (Number(p.id) === Number(inv.id)) {
                p.sprite = inv.sprite;
                if (inv.skin) p.skin = inv.skin; else delete p.skin;
            }
        });
    });

    if (typeof saveStorage === 'function') saveStorage();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderActiveTeamSlots === 'function') renderActiveTeamSlots();
    if (typeof renderProfileChip === 'function') renderProfileChip();

    const pm = document.getElementById('pokemon-modal');
    if (pm && pm.style.display === 'flex' && typeof openPokemonModal === 'function') openPokemonModal(inv.id);
}

// Fila de skins para el menú del Pokémon
function getSkinRowHtml(pkmn) {
    const owned = getOwnedSkinsFor(pkmn.id);
    if (owned.length === 0) return '';

    const btn = (label, active, onclick) => `
        <button onclick="${onclick}" style="background: ${active ? '#fbbf24' : '#1e293b'}; color: ${active ? '#0f172a' : '#e2e8f0'}; border: 1px solid ${active ? '#fbbf24' : '#334155'}; border-radius: 6px; padding: 6px 12px; font-weight: 700; cursor: pointer;">${label}</button>`;

    return `
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.35); border-radius: 8px; padding: 8px 12px;">
            <span style="flex: 1 1 80px; font-size: 13px;">🎨 Skins</span>
            ${btn('Original', !pkmn.skin, `equipSkin(${pkmn.id}, null)`)}
            ${owned.map(cid => btn(SKIN_CATALOGS[cid].buttonLabel, pkmn.skin === cid, `equipSkin(${pkmn.id}, '${cid}')`)).join('')}
        </div>`;
}

// ---------- Tienda ----------

function renderShopSkins() {
    const shards = getCurrencies().shards || 0;
    const state = getSkinsState();

    return Object.values(SKIN_CATALOGS).map(cat => {
        const offers = getDailySkinOffers(cat.id);
        if (!offers) {
            return '<div class="shop-empty"><div class="shop-empty-icon">⏳</div><p>Cargando la base de datos de Pokémon... vuelve a entrar en unos segundos.</p></div>';
        }
        const owned = state.owned[cat.id] || [];
        const bought = state.daily.bought[cat.id] || [];

        return `
            <p class="shop-note">🎨 Catálogo <b>${cat.name}</b> · ${cat.perDay} skins al día, rotan cada 24 h (próxima rotación en <b>${timeUntilRotation()}</b>) · Tienes <b>${shards}</b> 💎</p>
            <div class="shop-grid">
                ${offers.map(p => {
                    const price = skinPrice(cat.id, p);
                    const has = owned.includes(p.id);
                    const rarityClass = String(p.rarity || 'comun').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const haveMon = typeof userInventory !== 'undefined' && userInventory.some(x => Number(x.id) === Number(p.id));
                    return `
                        <div class="pokemon-card card-pokemon ${rarityClass} shop-card">
                            <div class="card-id">#${String(p.id).padStart(4, '0')}</div>
                            <img src="${cat.spriteFor(p.id)}" alt="${p.name} ${cat.name}" loading="lazy" onerror="this.src='${p.sprite}'">
                            <div class="card-name">${p.name}</div>
                            <div class="card-rarity">${cat.icon} ${String(p.rarity).toUpperCase()}</div>
                            <div class="shop-owned">${has ? '✔ Ya la tienes' : (haveMon ? 'Tienes al Pokémon' : 'No tienes al Pokémon')}</div>
                            <button class="shop-buy" ${has || shards < price ? 'disabled' : ''} onclick="buySkin('${cat.id}', ${p.id})">
                                ${has ? 'Comprada' : `${price} 💎`}
                            </button>
                        </div>`;
                }).join('')}
            </div>`;
    }).join('');
}

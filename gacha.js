// gacha.js - Sistema de Banners por Generación Garantizado

let currentGen = 1;

// Rangos de IDs por Generación
const GEN_RANGES = {
    1: { min: 1, max: 151, megas: ["Mega Venusaur", "Mega Charizard X", "Mega Charizard Y", "Mega Blastoise", "Mega Alakazam", "Mega Gengar", "Mega Kangaskhan", "Mega Pinsir", "Mega Gyarados", "Mega Aerodactyl", "Mega Mewtwo X", "Mega Mewtwo Y", "Mega Beedrill", "Mega Pidgeot", "Mega Slowbro"] },
    2: { min: 152, max: 251, megas: ["Mega Ampharos", "Mega Scizor", "Mega Heracross", "Mega Houndoom", "Mega Tyranitar"] },
    3: { min: 252, max: 386, megas: ["Mega Blaziken", "Mega Gardevoir", "Mega Mawile", "Mega Aggron", "Mega Medicham", "Mega Manectric", "Mega Banette", "Mega Absol", "Mega Sceptile", "Mega Swampert", "Mega Sableye", "Mega Sharpedo", "Mega Camerupt", "Mega Altaria", "Mega Glalie", "Mega Salamence", "Mega Metagross", "Mega Latias", "Mega Latios", "Groudon Primigenio", "Kyogre Primigenio", "Mega Rayquaza"] },
    4: { min: 387, max: 493, megas: ["Mega Garchomp", "Mega Lucario", "Mega Abomasnow", "Mega Lopunny"] },
    5: { min: 494, max: 649, megas: ["Mega Audino"] },
    6: { min: 650, max: 721, megas: ["Mega Diancie"] },
    7: { min: 722, max: 809, megas: [] },
    8: { min: 810, max: 905, megas: [] },
    9: { min: 906, max: 1025, megas: [] }
};

// Cambiar banner activo
function selectBanner(genNumber) {
    currentGen = genNumber;
    
    document.querySelectorAll('.banner-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-gen-${genNumber}`);
    if (activeBtn) activeBtn.classList.add('active');

    const bannerTitle = document.getElementById('banner-title');
    if (bannerTitle) {
        bannerTitle.innerText = `BANNER GENERACIÓN ${genNumber}`;
    }
}

// Determinar rareza (%)
function rollRarity() {
    const rand = Math.random() * 100;
    
    if (rand < 3) return "secreto";       // 3% Mega / Secreto
    if (rand < 8) return "legendario";    // 5% Legendario
    if (rand < 25) return "epico";        // 17% Épico
    if (rand < 55) return "raro";         // 30% Raro
    return "comun";                       // 45% Común
}

// Obtener un Pokémon con garantías
function getRandomPokemonFromGen(rarity) {
    if (typeof DATABASE === 'undefined') return null;

    const range = GEN_RANGES[currentGen] || GEN_RANGES[1];
    let pool = DATABASE[rarity] || [];

    // Filtrar Pokémon pertenecientes a la gen activa
    let filtered = pool.filter(pkmn => {
        if (!pkmn) return false;
        if (rarity === 'secreto') {
            return range.megas.some(m => m.toLowerCase().trim() === pkmn.name.toLowerCase().trim());
        }
        return pkmn.id >= range.min && pkmn.id <= range.max;
    });

    // FALLBACKS DE SEGURIDAD (Para no dejar ningún hueco nulo nunca)
    if (filtered.length === 0) {
        if (rarity === 'secreto') {
            // Si la Gen activa no tiene Megas (o aun están cargando), busca una Mega global
            filtered = DATABASE.secreto || [];
        }
        if (filtered.length === 0) {
            filtered = (DATABASE.legendario || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        if (filtered.length === 0) {
            filtered = (DATABASE.comun || []).filter(pkmn => pkmn && pkmn.id >= range.min && pkmn.id <= range.max);
        }
        if (filtered.length === 0) {
            filtered = DATABASE.comun || [];
        }
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex] || null;
}

// Tirada individual con reintento forzado
function executeSinglePull() {
    let rarity = rollRarity();
    let result = getRandomPokemonFromGen(rarity);

    // Si diera nulo por retardo de red, intenta forzar con común de DATABASE
    if (!result && DATABASE.comun && DATABASE.comun.length > 0) {
        result = DATABASE.comun[Math.floor(Math.random() * DATABASE.comun.length)];
    }

    return result;
}

// Tirada x10 garantizando exactamente 10 elementos siempre
function executeMultiPull() {
    const pulls = [];
    while (pulls.length < 10) {
        const pkmn = executeSinglePull();
        if (pkmn) {
            pulls.push(pkmn);
        }
    }
    return pulls;
}
/* style.css - Corrección de Grid y Cartas Invisibles */

/* Contenedor principal de los resultados */
#gacha-results {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr) !important; /* Fuerza 5 columnas x 2 filas */
    gap: 15px;
    width: 100%;
    max-width: 1000px;
    margin: 20px auto 0 auto;
    justify-content: center;
    align-items: center;
}

/* Base de la carta del Pokémon */
.card-pokemon {
    background: rgba(18, 24, 38, 0.85);
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 160px;
    position: relative;
    box-sizing: border-box;

    /* REGLA CRÍTICA: Forzar visibilidad inmediata por si falla el Keyframe */
    opacity: 1 !important;
    visibility: visible !important;
    animation: cardAppear 0.3s ease-out forwards;
}

/* Animación de entrada suave sin ocultar las cartas si falla */
@keyframes cardAppear {
    0% {
        transform: translateY(15px) scale(0.95);
    }
    100% {
        transform: translateY(0) scale(1);
    }
}

/* Estilos de Imagen y Texto */
.card-pokemon img {
    width: 75px;
    height: 75px;
    object-fit: contain;
    margin-bottom: 6px;
}

.card-pokemon h4 {
    margin: 4px 0 2px 0;
    font-size: 0.95rem;
    color: #ffffff;
    font-weight: 700;
}

.card-rarity {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-top: 2px;
}

/* --- BORDES Y NEONES POR RAREZA --- */

/* COMÚN */
.card-pokemon.comun {
    border: 1.5px solid #6c757d;
    box-shadow: 0 0 8px rgba(108, 117, 125, 0.2);
}
.card-pokemon.comun .card-rarity { color: #a0a6ac; }

/* RARO */
.card-pokemon.raro {
    border: 1.5px solid #00f2fe;
    box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}
.card-pokemon.raro .card-rarity { color: #00f2fe; }

/* ÉPICO */
.card-pokemon.epico {
    border: 1.5px solid #a855f7;
    box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
}
.card-pokemon.epico .card-rarity { color: #a855f7; }

/* LEGENDARIO */
.card-pokemon.legendario {
    border: 1.5px solid #ffb703;
    box-shadow: 0 0 15px rgba(255, 183, 3, 0.5);
}
.card-pokemon.legendario .card-rarity { color: #ffb703; }

/* SECRETO (MEGAS) */
.card-pokemon.secreto {
    border: 2px solid #ff0055;
    box-shadow: 0 0 20px rgba(255, 0, 85, 0.7);
    animation: secretGlow 1.5s infinite alternate, cardAppear 0.3s ease-out forwards;
}
.card-pokemon.secreto .card-rarity { color: #ff0055; }

@keyframes secretGlow {
    from { box-shadow: 0 0 10px rgba(255, 0, 85, 0.5); }
    to { box-shadow: 0 0 22px rgba(255, 0, 85, 0.9); }
}

/* Ajuste responsive para pantallas pequeñas */
@media (max-width: 850px) {
    #gacha-results {
        grid-template-columns: repeat(2, 1fr) !important;
    }
}
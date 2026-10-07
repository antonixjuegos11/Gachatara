// habilidades.js - Motor Inteligente y Completo de Habilidades Pokémon

const ABILITIES_DB = {
    // --- CLASE: ENTRADA AL CAMPO (onEnter) ---
    "intimidate": {
        name: "Intimidación",
        trigger: "onEnter",
        description: "Baja un 15% el Ataque del rival al entrar en combate.",
        execute: (owner, opponent) => {
            opponent.attack = Math.floor(opponent.attack * 0.85);
            return `👁️ ¡La Intimidación de ${owner.name} redujo el Ataque de ${opponent.name}!`;
        }
    },
    "pressure": {
        name: "Presión",
        trigger: "onEnter",
        description: "Ejerce una presión asfixiante sobre el rival al entrar en combate.",
        execute: (owner, opponent) => {
            return `⚡ ¡${owner.name} ejerce una gran Presión sobre ${opponent.name}!`;
        }
    },
    "drizzle": {
        name: "Llovizna",
        trigger: "onEnter",
        description: "Invoca Lluvia al entrar al campo.",
        execute: (owner, opponent, battleState) => {
            if (battleState) battleState.weather = "rain";
            return `🌧️ ¡La Llovizna de ${owner.name} hizo empezar a llover!`;
        }
    },
    "drought": {
        name: "Sequía",
        trigger: "onEnter",
        description: "Invoca Sol Abrasador al entrar al campo.",
        execute: (owner, opponent, battleState) => {
            if (battleState) battleState.weather = "sun";
            return `☀️ ¡La Sequía de ${owner.name} hizo intensificar la luz solar!`;
        }
    },
    "download": {
        name: "Descarga",
        trigger: "onEnter",
        description: "Aumenta un stat ofensivo según las defensas del rival.",
        execute: (owner, opponent) => {
            if (opponent.defense < opponent.spDef) {
                owner.attack = Math.floor(owner.attack * 1.3);
                return `💻 ¡Descarga aumentó el Ataque Físico de ${owner.name}!`;
            } else {
                owner.spAtk = Math.floor(owner.spAtk * 1.3);
                return `💻 ¡Descarga aumentó el Ataque Especial de ${owner.name}!`;
            }
        }
    },

    // --- CLASE: MODIFICADORES DE DAÑO (onDamage / onReceiveDamage) ---
    "blaze": {
        name: "Mar Llamas",
        trigger: "onDamage",
        description: "Potencia los movimientos de Fuego con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Fuego' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🔥 ¡Mar Llamas potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "torrent": {
        name: "Torrente",
        trigger: "onDamage",
        description: "Potencia los movimientos de Agua con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Agua' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🌊 ¡Torrente potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "overgrow": {
        name: "Espesura",
        trigger: "onDamage",
        description: "Potencia los movimientos de Planta con poca salud.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Planta' && owner.currentHp <= owner.maxHp * 0.33) {
                return { damage: Math.floor(currentDamage * 1.5), message: `🌿 ¡Espesura potenció el ataque de ${owner.name}!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "levitate": {
        name: "Levitación",
        trigger: "onDamage",
        description: "Inmunidad total frente a ataques de tipo Tierra.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Tierra') {
                return { damage: 0, message: `🕊️ ¡${owner.name} levita y evade el ataque de Tierra!` };
            }
            return { damage: currentDamage, message: null };
        }
    },
    "sturdy": {
        name: "Robustez",
        trigger: "onReceiveDamage",
        description: "Aguanta un golpe mortal si tiene la salud al máximo.",
        execute: (owner, attacker, move, damage) => {
            if (owner.currentHp === owner.maxHp && damage >= owner.maxHp) {
                return { damage: owner.maxHp - 1, message: `🛡️ ¡${owner.name} aguantó el golpe gracias a Robustez!` };
            }
            return { damage: damage, message: null };
        }
    },

    // --- CLASE: FIN DE TURNO (onTurnEnd) ---
    "rain-dish": {
        name: "Cura Lluvia",
        trigger: "onTurnEnd",
        description: "Recupera HP al final de cada turno.",
        execute: (owner) => {
            if (owner.currentHp < owner.maxHp) {
                const heal = Math.floor(owner.maxHp * 0.06);
                owner.currentHp = Math.min(owner.maxHp, owner.currentHp + heal);
                return `💧 ${owner.name} recuperó +${heal} HP gracias a Cura Lluvia.`;
            }
            return null;
        }
    },
    "speed-boost": {
        name: "Impulso",
        trigger: "onTurnEnd",
        description: "Aumenta la velocidad progresivamente en cada turno.",
        execute: (owner) => {
            owner.speed = Math.floor(owner.speed * 1.1);
            return `⚡ ¡La velocidad de ${owner.name} aumentó gracias a Impulso!`;
        }
    }
};

/**
 * Motor de Activación con Respaldo Inteligente (Fallback)
 * Si la habilidad viene de la PokéAPI y no está programada a mano, 
 * el motor detecta su nombre y le asigna un comportamiento coherente.
 */
function triggerAbility(triggerType, owner, target, move = null, damage = 0, battleState = null) {
    if (!owner || !owner.ability || owner.ability === 'none') return null;

    const abilityKey = owner.ability.toLowerCase().trim();
    
    // 1. Buscar en la base de datos manual
    if (ABILITIES_DB[abilityKey]) {
        const ability = ABILITIES_DB[abilityKey];
        if (ability.trigger === triggerType) {
            return ability.execute(owner, target, move, damage, battleState);
        }
        return null;
    }

    // 2. Sistema Inteligente de Respaldo (Fallback para cualquier otra habilidad de la API)
    // Si la habilidad contiene palabras clave en inglés de la PokéAPI, les damos vida automática:
    if (triggerType === 'onEnter') {
        // Habilidades que mencionan "shield", "guard", "armor" o similares al entrar
        if (abilityKey.includes('shield') || abilityKey.includes('armor')) {
            owner.defense = Math.floor(owner.defense * 1.1);
            return `🛡️ ¡La habilidad ${owner.ability} de ${owner.name} fortificó su defensa al entrar!`;
        }
        // Mensaje genérico de activación para habilidades de entrada oficiales (como Presión de Zapdos)
        return `✨ ¡${owner.name} despliega su habilidad ${owner.ability}!`;
    }

    return null;
}
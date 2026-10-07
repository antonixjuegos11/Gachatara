// habilidades.js - Motor General de Habilidades Pasivas Pokémon

const ABILITIES_DB = {
    // === DISPARADOR: AL ENTRAR AL CAMPO (onEnter) ===
    "intimidate": {
        name: "Intimidación",
        trigger: "onEnter",
        description: "Baja un 15% el Ataque del rival al entrar en combate.",
        execute: (owner, opponent) => {
            opponent.attack = Math.floor(opponent.attack * 0.85);
            return `👁️ ¡La Intimidación de ${owner.name} redujo el Ataque de ${opponent.name}!`;
        }
    },
    "download": {
        name: "Descarga",
        trigger: "onEnter",
        description: "Aumenta Ataque Físico o Especial según la menor defensa rival.",
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

    // === DISPARADOR: AL ATACAR (onDamage) ===
    "blaze": {
        name: "Mar Llamas",
        trigger: "onDamage",
        description: "Aumenta un 50% el daño de Fuego si el HP es menor al 33%.",
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
        description: "Aumenta un 50% el daño de Agua si el HP es menor al 33%.",
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
        description: "Aumenta un 50% el daño de Planta si el HP es menor al 33%.",
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
        description: "Inmunidad total contra ataques de tipo Tierra.",
        execute: (owner, defender, move, currentDamage) => {
            if (move.type === 'Tierra') {
                return { damage: 0, message: `🕊️ ¡${owner.name} levita y el ataque Tierra no le afecta!` };
            }
            return { damage: currentDamage, message: null };
        }
    },

    // === DISPARADOR: AL RECIBIR DAÑO (onReceiveDamage) ===
    "sturdy": {
        name: "Robustez",
        trigger: "onReceiveDamage",
        description: "Evita ser debilitado de un solo golpe con la salud al máximo.",
        execute: (owner, attacker, move, damage) => {
            if (owner.currentHp === owner.maxHp && damage >= owner.maxHp) {
                return { damage: owner.maxHp - 1, message: `🛡️ ¡${owner.name} aguantó el golpe gracias a Robustez!` };
            }
            return { damage: damage, message: null };
        }
    },

    // === DISPARADOR: FIN DE TURNO (onTurnEnd) ===
    "rain-dish": {
        name: "Cura Lluvia",
        trigger: "onTurnEnd",
        description: "Recupera un 6% de HP al final de cada turno.",
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
        description: "Aumenta la Velocidad al final de cada turno.",
        execute: (owner) => {
            owner.speed = Math.floor(owner.speed * 1.1);
            return `⚡ ¡La velocidad de ${owner.name} aumentó gracias a Impulso!`;
        }
    }
};

/**
 * Función principal para ejecutar habilidades según el evento (trigger)
 */
function triggerAbility(triggerType, owner, target, move = null, damage = 0, battleState = null) {
    if (!owner || !owner.ability) return null;

    const abilityKey = owner.ability.toLowerCase();
    const ability = ABILITIES_DB[abilityKey];

    if (!ability || ability.trigger !== triggerType) {
        return null;
    }

    return ability.execute(owner, target, move, damage, battleState);
}
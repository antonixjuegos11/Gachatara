// Fondo de Partículas
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: 35 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3
}));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
    
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(animate);
}
animate();

// =========================================
// BASE DE DATOS Y LÓGICA GACHA
// =========================================

// Pool de Pokémon de ejemplo
const pokemonPool = [
    { name: "Pikachu", rarity: "rare", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
    { name: "Charizard", rarity: "ultra-rare", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" },
    { name: "Mewtwo", rarity: "legendary", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png" },
    { name: "Rattata", rarity: "common", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png" },
    { name: "Pidgey", rarity: "common", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png" }
];

function executeSinglePull() {
    const randomIndex = Math.floor(Math.random() * pokemonPool.length);
    return pokemonPool[randomIndex];
}

function executeMultiPull() {
    const pulls = [];
    for (let i = 0; i < 10; i++) {
        pulls.push(executeSinglePull());
    }
    return pulls;
}

// =========================================
// LÓGICA DE NAVEGACIÓN
// =========================================

function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Ejecutar tiradas Gacha con Animación Escalonada
function pullGacha(amount) {
    const resultsContainer = document.getElementById('gacha-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ''; // Limpiar tiradas anteriores

    let pulls = [];
    if (amount === 1) {
        pulls.push(executeSinglePull());
    } else {
        pulls = executeMultiPull();
    }

    // Dibujar las cartas con un retraso animado entre cada una
    pulls.forEach((pkmn, index) => {
        const card = document.createElement('div');
        card.className = `card-pokemon ${pkmn.rarity}`;
        
        // Retraso de animación corregido
        card.style.animationDelay = `${index * 0.12}s`;

        card.innerHTML = `
            <img src="${pkmn.sprite}" alt="${pkmn.name}">
            <h4>${pkmn.name}</h4>
            <div class="card-rarity">${pkmn.rarity}</div>
        `;
        resultsContainer.appendChild(card);
    });
}
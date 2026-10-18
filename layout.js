// layout.js - Calcula la altura real de la cabecera fija para que el contenido nunca quede tapado
(function () {
    function updateHeaderHeight() {
        const header = document.querySelector('.top-header');
        if (!header) return;
        document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }

    function init() {
        updateHeaderHeight();
        const header = document.querySelector('.top-header');
        if (header && window.ResizeObserver) {
            new ResizeObserver(updateHeaderHeight).observe(header);
        }
    }

    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('load', updateHeaderHeight);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// ---------- Bloqueo del scroll del fondo cuando hay un menú abierto ----------
// Mientras un menú (Pokémon, perfil, árbol, objetos, resultado del combate...) está abierto, la rueda del ratón
// mueve solo el contenido del menú y la página de fondo se queda quieta.
(function () {
    const OVERLAY_SELECTOR = '.pokemon-modal-overlay, .st-overlay, .pf-overlay, .it-overlay, .bp-overlay, .post-battle-backdrop, #spark-overlay, #online-overlay';

    function injectScrollStyles() {
        if (document.getElementById('scroll-lock-styles')) return;
        const st = document.createElement('style');
        st.id = 'scroll-lock-styles';
        st.textContent = `
            html { scrollbar-gutter: stable; }
            html.modal-open, html.modal-open body { overflow: hidden !important; }
            .pokemon-modal-content { max-height: 90vh; overflow-y: auto; overscroll-behavior: contain; }
            .post-battle-card { max-height: 90vh; overflow-y: auto; overscroll-behavior: contain; }
            .st-box, .pf-box, .it-box, .bp-box, .it-list, .bp-list { overscroll-behavior: contain; }
        `;
        (document.head || document.documentElement).appendChild(st);
    }

    function isOverlayOpen() {
        return Array.from(document.querySelectorAll(OVERLAY_SELECTOR)).some(el => {
            const cs = window.getComputedStyle(el);
            return cs.display !== 'none' && cs.visibility !== 'hidden';
        });
    }

    function updateScrollLock() {
        document.documentElement.classList.toggle('modal-open', isOverlayOpen());
    }

    let scheduled = false;
    function scheduleUpdate() {
        if (scheduled) return;
        scheduled = true;
        const run = () => { scheduled = false; updateScrollLock(); };
        if (window.requestAnimationFrame) window.requestAnimationFrame(run); else setTimeout(run, 16);
    }

    function init() {
        injectScrollStyles();
        updateScrollLock();
        if (window.MutationObserver && document.body) {
            new MutationObserver(scheduleUpdate).observe(document.body, {
                subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class']
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

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

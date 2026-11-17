(function () {
    const configuredApiBase = window.SUBLI_API_BASE;
    const hostname = window.location.hostname;
    const isLocalHost = ["localhost", "127.0.0.1", "192.168.100.28"].includes(hostname);
    const defaultApiBase = isLocalHost
        ? `${window.location.protocol}//${hostname}:8080`
        : window.location.origin;

    window.SUBLI_API_BASE = (configuredApiBase || defaultApiBase).replace(/\/+$/, "");

    window.SUBLI_WHATSAPP_NUMBER = "51912689377";
    window.SUBLI_WHATSAPP_URL = `https://wa.me/${window.SUBLI_WHATSAPP_NUMBER}`;

    window.escapeHTML = function (value) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return String(value ?? "").replace(/[&<>"']/g, character => entities[character]);
    };

    document.querySelectorAll("a[data-whatsapp-link]").forEach(link => {
        link.href = window.SUBLI_WHATSAPP_URL;
    });
})();

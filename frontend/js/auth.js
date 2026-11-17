(function () {
    const apiBase = window.SUBLI_API_BASE;
    const loginPath = "/api/auth/login";
    const safeMethods = ["GET", "HEAD", "OPTIONS", "TRACE"];
    let csrf = null;

    class SubliAuthError extends Error {
        constructor(status, message) {
            super(message);
            this.name = "SubliAuthError";
            this.status = status;
        }
    }

    function redirectToLogin() {
        if (window.location.pathname.endsWith("/admin.html")) {
            window.location.replace("login.html");
        }
    }

    async function refreshCsrfToken() {
        const response = await fetch(`${apiBase}/api/auth/csrf`, {
            method: "GET",
            credentials: "include",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new SubliAuthError(response.status, "No se pudo obtener el token CSRF.");
        }

        csrf = await response.json();
        return csrf;
    }

    async function request(path, options = {}, csrfRetry = false) {
        const method = (options.method || "GET").toUpperCase();
        const headers = new Headers(options.headers || {});

        if (!safeMethods.includes(method)) {
            if (!csrf) {
                await refreshCsrfToken();
            }
            headers.set(csrf.headerName, csrf.token);
        }

        const response = await fetch(`${apiBase}${path}`, {
            ...options,
            method,
            headers,
            credentials: "include"
        });

        if (response.status === 401 && path !== loginPath) {
            csrf = null;
            redirectToLogin();
            throw new SubliAuthError(401, "La sesión administrativa expiró.");
        }

        if (response.status === 403 && !safeMethods.includes(method)) {
            if (!csrfRetry) {
                csrf = null;
                await refreshCsrfToken();
                return request(path, options, true);
            }
            throw new SubliAuthError(403, "La solicitud fue rechazada por CSRF o falta de permisos.");
        }

        if (response.status === 403) {
            throw new SubliAuthError(403, "No tienes permiso para realizar esta operación.");
        }

        return response;
    }

    async function login(username, password) {
        csrf = null;
        const form = new URLSearchParams({ username, password });
        const response = await request(loginPath, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form
        });

        if (response.ok) {
            await refreshCsrfToken();
        }

        return response;
    }

    async function logout() {
        const response = await request("/logout", { method: "POST" });
        csrf = null;
        return response;
    }

    window.SubliAuth = {
        apiBase,
        SubliAuthError,
        login,
        logout,
        refreshCsrfToken,
        request
    };
})();

const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

window.subliAdminSessionReady = window.SubliAuth.request("/api/auth/session")
    .then(response => {
        if (!response.ok) {
            throw new window.SubliAuth.SubliAuthError(response.status, "No se pudo verificar la sesión.");
        }
        return true;
    })
    .catch(error => {
        if (error.status !== 401) {
            console.error(error);
            alert(Number.isInteger(error.status)
                ? `El servidor respondió con un error (${error.status}) al verificar el panel.`
                : "No se pudo conectar para verificar el acceso al panel.");
        }
        return false;
    });

btnCerrarSesion.addEventListener("click", async function () {
    btnCerrarSesion.disabled = true;
    try {
        const response = await window.SubliAuth.logout();
        if (!response.ok) {
            throw new window.SubliAuth.SubliAuthError(response.status, "No se pudo cerrar la sesión.");
        }
        window.location.replace("login.html");
    } catch (error) {
        btnCerrarSesion.disabled = false;
        console.error(error);
        alert(error.status === 403
            ? "No se pudo validar la solicitud de cierre de sesión. Recarga el panel e intenta otra vez."
            : Number.isInteger(error.status)
                ? `El servidor respondió con un error (${error.status}) al cerrar la sesión.`
                : "No se pudo conectar para cerrar la sesión.");
    }
});

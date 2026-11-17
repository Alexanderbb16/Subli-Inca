const formularioLogin = document.getElementById("login-form");
const mensajeError = document.getElementById("login-error");

formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();
    mensajeError.textContent = "";

    window.SubliAuth.login(
        document.getElementById("usuario").value,
        document.getElementById("contrasena").value
    )
        .then(response => {
            if (!response.ok) {
                throw new window.SubliAuth.SubliAuthError(
                    response.status,
                    "No se pudo completar el inicio de sesión."
                );
            }
            window.location.href = "admin.html";
        })
        .catch(error => {
            if (error.status === 401) {
                mensajeError.textContent = "Usuario o contraseña incorrectos.";
            } else if (error.status === 403) {
                mensajeError.textContent = "No se pudo validar la solicitud segura. Recarga e intenta otra vez.";
            } else if (Number.isInteger(error.status)) {
                mensajeError.textContent = `El servidor respondió con un error (${error.status}). Intenta más tarde.`;
            } else {
                mensajeError.textContent = "No se pudo conectar con el servidor. Verifica la configuración e intenta otra vez.";
            }
        });
});

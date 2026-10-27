// =====================================================
// LOGIN - SUBLI-INCA
// =====================================================

console.log("LOGIN.JS SE ESTA EJECUTANDO");

const formularioLogin = document.getElementById("login-form");
const mensajeError = document.getElementById("login-error");

formularioLogin.addEventListener("submit", function (event) {

    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    const credenciales =
        "Basic " + btoa(usuario + ":" + contrasena);

    fetch("http://localhost:8080/api/productos", {
        method: "GET",
        headers: {
            "Authorization": credenciales
        }
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Credenciales incorrectas");
        }

        return response.json();
    })
    .then(() => {

        sessionStorage.setItem(
            "credencialesAdmin",
            credenciales
        );

        window.location.href = "admin.html";
    })
    .catch(error => {

        console.error(error);

        mensajeError.textContent =
            "Usuario o contraseña incorrectos.";
    });

});
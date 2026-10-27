// =====================================================
// PROTECCIÓN DEL PANEL DE ADMINISTRACIÓN
// =====================================================

const credencialesAdmin =
    sessionStorage.getItem("credencialesAdmin");

if (!credencialesAdmin) {

    window.location.href = "login.html";

}

const btnCerrarSesion =
    document.getElementById("btn-cerrar-sesion");

btnCerrarSesion.addEventListener("click", function () {

    sessionStorage.removeItem("credencialesAdmin");

    window.location.href = "login.html";

});
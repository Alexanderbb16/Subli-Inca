// =====================================================
// PANEL DE ADMINISTRACIÓN - SUBLI-INCA
// =====================================================

function fetchAdmin(path, opciones = {}) {
    return window.subliAdminSessionReady.then(isAuthenticated => {
        if (!isAuthenticated) {
            throw new Error("La sesión administrativa no está activa.");
        }
        return window.SubliAuth.request(path, opciones);
    });
}


const adminProductosContainer = document.getElementById(
    "admin-productos-container"
);


// =====================================================
// CARGAR PRODUCTOS
// =====================================================

fetchAdmin("/api/productos/admin")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "No se pudieron obtener los productos"
            );
        }

        return response.json();

    })
    .then(productos => {

                // =====================================================
        // ACTUALIZAR RESUMEN DEL INVENTARIO
        // =====================================================

        const totalProductos = productos.length;

        const totalActivos =
            productos.filter(producto => producto.activo).length;

        const totalInactivos =
            productos.filter(producto => !producto.activo).length;

        

        document.getElementById("total-productos").textContent =
            totalProductos;

        document.getElementById("total-activos").textContent =
            totalActivos;

        document.getElementById("total-inactivos").textContent =
            totalInactivos;



        productos.forEach(producto => {


            const tarjeta = document.createElement("article");


            tarjeta.classList.add(
                "admin-product-card"
            );

            tarjeta.dataset.categoria =
                producto.categoria;


            tarjeta.innerHTML = `

                <div class="admin-product-image">

                    <img
                        src="assets/${window.escapeHTML(producto.imagen)}"
                        alt="${window.escapeHTML(producto.nombre)}"
                    >

                </div>


                <div class="admin-product-info">

                    <h3>
                        ${window.escapeHTML(producto.nombre)}
                    </h3>


                    <p>
                        ${window.escapeHTML(producto.descripcion)}
                    </p>


                    <p>
                        <strong>Precio:</strong>
                        S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                    </p>




                    <p class="${window.escapeHTML(producto.activo ? "producto-activo" : "producto-inactivo")}">
                        <strong>Estado:</strong>
                        ${window.escapeHTML(producto.activo ? "Activo 🟢" : "Inactivo 🔴")}
                    </p>


                    <button
                        type="button"
                        class="admin-edit-button"
                        data-id="${window.escapeHTML(producto.id)}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="admin-toggle-button"
                        data-id="${window.escapeHTML(producto.id)}"
                        data-activo="${window.escapeHTML(Boolean(producto.activo))}"
>
                        ${window.escapeHTML(producto.activo ? "🔴 Desactivar" : "🟢 Activar")}
</button>

<button
    type="button"
    class="admin-delete-button"
    data-id="${window.escapeHTML(producto.id)}"
>
    🗑️ Eliminar
</button>

                </div>

            `;


            adminProductosContainer.appendChild(
                tarjeta
            );


        });


    })
    .catch(error => {


        console.error(error);


        adminProductosContainer.innerHTML = `

            <p>
                No se pudieron cargar los productos.
            </p>

        `;


    });

    // =====================================================
// MOSTRAR Y OCULTAR FORMULARIO
// =====================================================

const btnAgregarProducto = document.getElementById(
    "btn-agregar-producto"
);

const formularioProducto = document.getElementById(
    "formulario-producto"
);

const btnCancelarProducto = document.getElementById(
    "btn-cancelar-producto"
);

let productoEditandoId = null;
let imagenActual = null;

// MOSTRAR FORMULARIO

btnAgregarProducto.addEventListener("click", function () {

    formAgregarProducto.reset();

    productoEditandoId = null;

    imagenActual = null;

    document.getElementById("imagen-actual").textContent =
    "No hay imagen seleccionada.";

    formularioProducto.querySelector("h2").textContent =
        "Agregar producto";

    formAgregarProducto.querySelector(
        'button[type="submit"]'
    ).textContent = "Guardar producto";

    formularioProducto.style.display = "block";

});


// OCULTAR FORMULARIO

btnCancelarProducto.addEventListener("click", function () {

    formAgregarProducto.reset();

    productoEditandoId = null;

    imagenActual = null;

    formularioProducto.querySelector("h2").textContent =
        "Agregar producto";

    formAgregarProducto.querySelector(
        'button[type="submit"]'
    ).textContent = "Guardar producto";

    formularioProducto.style.display = "none";

});



// =====================================================
// GUARDAR NUEVO PRODUCTO
// =====================================================

const formAgregarProducto = document.getElementById(
    "form-agregar-producto"
);

formAgregarProducto.addEventListener("submit", function (event) {

    event.preventDefault();


    const nuevoProducto = {

        nombre: document.getElementById("nombre").value,

        categoria: document.getElementById("categoria").value,

        descripcion: document.getElementById("descripcion").value,

        precio: Number(
            document.getElementById("precio").value
        ),


        activo: true

    };

    const archivoImagen =
    document.getElementById("imagen").files[0];


// =====================================================
// SI ESTAMOS EDITANDO Y NO HAY NUEVA IMAGEN
// =====================================================

if (productoEditandoId && !archivoImagen) {

    nuevoProducto.imagen = imagenActual;

    guardarProducto(nuevoProducto);

    return;
}


// =====================================================
// SI ES PRODUCTO NUEVO, LA IMAGEN ES OBLIGATORIA
// =====================================================

if (!archivoImagen) {

    alert("Selecciona una imagen para el producto.");

    return;
}


// =====================================================
// SUBIR IMAGEN
// =====================================================

const datosImagen = new FormData();

datosImagen.append("imagen", archivoImagen);


fetchAdmin("/api/productos/imagen", {

    method: "POST",

    body: datosImagen

})

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "No se pudo subir la imagen"
            );

        }

        return response.text();

    })

    .then(nombreImagen => {

        nuevoProducto.imagen = nombreImagen;

        guardarProducto(nuevoProducto);

    })

    .catch(error => {

        console.error(error);

        alert(
            "Ocurrió un error al guardar la imagen."
        );

    });

    });


// =====================================================
// FUNCIÓN PARA GUARDAR EL PRODUCTO
// =====================================================

function guardarProducto(producto) {

    const url = productoEditandoId
        ? `/api/productos/${productoEditandoId}`
        : "/api/productos";


    const metodo = productoEditandoId
        ? "PUT"
        : "POST";


    fetchAdmin(url, {

        method: metodo,

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(producto)

    })

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "No se pudo guardar el producto"
                );

            }

            return response.json();

        })

        .then(productoGuardado => {

            alert(
                productoEditandoId
                    ? "Producto actualizado correctamente."
                    : "Producto guardado correctamente."
            );


            formAgregarProducto.reset();

            formularioProducto.style.display = "none";

            productoEditandoId = null;

            imagenActual = null;

            location.reload();

        })

        .catch(error => {

            console.error(error);

            alert(
                "Ocurrió un error al guardar el producto."
            );

        });
        

}


// =====================================================
// EDITAR PRODUCTO
// =====================================================

document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("admin-edit-button")) {
        return;
    }


    const idProducto = Number(
        event.target.dataset.id
    );


    fetchAdmin(
    "/api/productos/admin"
)

        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo consultar el producto.");
            }
            return response.json();
        })

        .then(productos => {


            const producto = productos.find(
                producto => producto.id === idProducto
            );


            if (!producto) {
                return;
            }


            productoEditandoId = producto.id;


            // Abrir formulario

            formularioProducto.style.display = "block";


            // Cambiar título

            formularioProducto.querySelector("h2").textContent =
                "Editar producto";


            // Cambiar texto del botón

            formAgregarProducto.querySelector(
                'button[type="submit"]'
            ).textContent = "Guardar cambios";


            // Cargar datos actuales

            document.getElementById("nombre").value =
                producto.nombre;

            document.getElementById("categoria").value =
                producto.categoria;

            document.getElementById("descripcion").value =
                producto.descripcion;

            document.getElementById("precio").value =
                producto.precio;


            imagenActual = producto.imagen;

            document.getElementById("imagen-actual").textContent =
    "Imagen actual: " + producto.imagen;    


            // Llevar al formulario

            formularioProducto.scrollIntoView({
                behavior: "smooth"
            });


        })

        .catch(error => {

            console.error(error);

            alert(
                "No se pudo cargar el producto."
            );

        });

});



// =====================================================
// ACTIVAR / DESACTIVAR PRODUCTO
// =====================================================

document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("admin-toggle-button")) {
        return;
    }


    const idProducto = Number(
        event.target.dataset.id
    );


    const estadoActual =
        event.target.dataset.activo === "true";


    const nuevoEstado = !estadoActual;


    fetchAdmin(
        `/api/productos/${idProducto}/estado`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                activo: nuevoEstado
            })
        }
    )

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "No se pudo cambiar el estado del producto"
            );
        }

        return response.json();

    })

    .then(() => {

        alert(
            nuevoEstado
                ? "Producto activado correctamente."
                : "Producto desactivado correctamente."
        );

        location.reload();

    })

    .catch(error => {

        console.error(error);

        alert(
            "No se pudo cambiar el estado del producto."
        );

    });

});

// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("admin-delete-button")) {
        return;
    }

    const idProducto = Number(
        event.target.dataset.id
    );

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmar) {
        return;
    }

    fetchAdmin(
        `/api/productos/${idProducto}`,
        {
            method: "DELETE"
        }
    )

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "No se pudo eliminar el producto"
            );
        }

        alert("Producto eliminado correctamente.");

        location.reload();

    })

    .catch(error => {

        console.error(error);

        alert(
            "No se pudo eliminar el producto."
        );

    });

});


// =====================================================
// BUSCADOR Y FILTRO DE PRODUCTOS
// =====================================================

const buscadorAdmin =
    document.getElementById("buscar-producto-admin");

const filtroCategoriaAdmin =
    document.getElementById("filtro-categoria-admin");

function filtrarProductosAdmin() {

    const texto =
        buscadorAdmin.value.toLowerCase().trim();

    const categoria =
        filtroCategoriaAdmin.value;

    const tarjetas =
        document.querySelectorAll(".admin-product-card");

    tarjetas.forEach(tarjeta => {

        const nombre =
            tarjeta.querySelector("h3").textContent.toLowerCase();

        const categoriaProducto =
            tarjeta.dataset.categoria;

        const coincideNombre =
            nombre.includes(texto);

        const coincideCategoria =
            categoria === "Todos" ||
            categoriaProducto === categoria;

        if (coincideNombre && coincideCategoria) {

            tarjeta.style.display = "";

        } else {

            tarjeta.style.display = "none";

        }

    });

}


buscadorAdmin.addEventListener(
    "input",
    filtrarProductosAdmin
);


filtroCategoriaAdmin.addEventListener(
    "change",
    filtrarProductosAdmin
);

console.log("SCRIPT.JS SE ESTA EJECUTANDO");

const contenedorProductos = document.getElementById("productos-container");
let buscando = false;
fetch(`${window.SUBLI_API_BASE}/api/productos`, {
    method: "GET",
    headers: {
        "Accept": "application/json"
    }
})
    .then(response => {

        if (!response.ok) {
            throw new Error("No se pudieron obtener los productos");
        }

        return response.json();
    })
    .then(productos => {

        console.log("PRODUCTOS RECIBIDOS:", productos);

                const categorias = document.querySelectorAll(".category-card");

        categorias.forEach(categoria => {

            categoria.addEventListener("click", function(event) {

                event.preventDefault();

                document.getElementById("catalogo-completo").style.display = "block";

                const categoriaSeleccionada = this.dataset.categoria;

                const filtrosCatalogo = document.querySelectorAll(".catalog-filter");

filtrosCatalogo.forEach(boton => {
    boton.classList.remove("active");
});

const filtroCorrespondiente = Array.from(filtrosCatalogo).find(
    boton => boton.dataset.categoria === categoriaSeleccionada
);

if (filtroCorrespondiente) {
    filtroCorrespondiente.classList.add("active");
}

                const productosFiltrados = productos.filter(producto =>
                    producto.activo === true &&
                    producto.categoria === categoriaSeleccionada
);

                catalogoContainer.innerHTML = "";

                productosFiltrados.forEach(producto => {

                    const tarjeta = document.createElement("article");

                    tarjeta.classList.add("product-card");

                    tarjeta.innerHTML = `
                        <div class="product-image">

                            <img 
                                src="assets/${window.escapeHTML(producto.imagen)}"
                                alt="${window.escapeHTML(producto.nombre)}"
                            >

                        </div>

                        <div class="product-info">

                            <h3>${window.escapeHTML(producto.nombre)}</h3>

                            <p>${window.escapeHTML(producto.descripcion)}</p>

                            <span class="product-price">
                                S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                            </span>

                            <a href="#" class="product-button" data-id="${window.escapeHTML(producto.id)}">
    Ver producto
</a>

                        </div>
                    `;

                    catalogoContainer.appendChild(tarjeta);

                });

                document.getElementById("catalogo-completo").scrollIntoView({
                    behavior: "smooth"
                });

            });

        });

        if (!buscando) {
        const productosDestacados = productos
    .filter(producto => producto.activo === true)
    .slice(0, 3);

    console.log("PRODUCTOS DESTACADOS:", productosDestacados);

        productosDestacados.forEach(producto => {

            const tarjeta = document.createElement("article");

            tarjeta.classList.add("product-card");

            tarjeta.innerHTML = `
                <div class="product-image">

                    <img 
                        src="assets/${window.escapeHTML(producto.imagen)}"
                        alt="${window.escapeHTML(producto.nombre)}"
                    >

                </div>

                <div class="product-info">

                    <h3>${window.escapeHTML(producto.nombre)}</h3>

                    <p>${window.escapeHTML(producto.descripcion)}</p>

                    <span class="product-price">
                        S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                    </span>

                    <a href="#" class="product-button" data-id="${window.escapeHTML(producto.id)}">
    Ver producto
</a>

                </div>
            `;

            contenedorProductos.appendChild(tarjeta);
            console.log("TARJETA AGREGADA:", producto.nombre);

        });
}
    })

    

    .catch(error => {

    console.error(error);


    contenedorProductos.innerHTML = `
        <p>
            No se pudieron cargar los productos.
        </p>
    `;

});


    // =====================================================
// DETALLE DEL PRODUCTO
// =====================================================

const modal = document.getElementById("product-modal");

const modalClose = document.getElementById("modal-close");

const modalImage = document.getElementById("modal-product-image");

const modalName = document.getElementById("modal-product-name");

const modalDescription = document.getElementById("modal-product-description");

const modalPrice = document.getElementById("modal-product-price");


const modalAgregarCarrito =
    document.getElementById("modal-agregar-carrito");

const modalCantidad = document.getElementById("modal-cantidad");

const modalTotal =
    document.getElementById("modal-product-total");

const modalPersonalizacion =
    document.getElementById("modal-personalizacion");


// =====================================================
// ABRIR DETALLE DEL PRODUCTO
// =====================================================

document.addEventListener("click", function (event) {

    if (event.target.classList.contains("product-button")) {

        event.preventDefault();

        const idProducto = Number(event.target.dataset.id);

        fetch(`${window.SUBLI_API_BASE}/api/productos`)
            .then(response => response.json())
            .then(productos => {

                const producto = productos.find(
                    producto => producto.id === idProducto
                );

                if (!producto) {
                    return;
                }

                modalImage.src = "assets/" + producto.imagen;

                modalImage.alt = producto.nombre;

                modalName.textContent = producto.nombre;

                modalDescription.textContent = producto.descripcion;

                modalPrice.textContent =
                    "S/ " + producto.precio.toFixed(2);


                    modalCantidad.value = 1;

                    modalTotal.textContent =
                            "S/ " + producto.precio.toFixed(2);

                    modalPersonalizacion.value = "";

const mensajeWhatsapp =
    "Hola, estoy interesado en realizar un pedido en SUBLI-INCA:\n\n" +
    "Producto: " + producto.nombre + "\n" +
    "Precio unitario: S/ " + producto.precio.toFixed(2) + "\n" +
    "Cantidad: " + modalCantidad.value + "\n" +
    "Personalización: " +
    (modalPersonalizacion.value.trim() || "Por coordinar") +
    "\n\n" +
    "Quisiera coordinar los detalles de mi pedido.";

modalAgregarCarrito.onclick = function () {

    const cantidad =
        Number(modalCantidad.value);

    if (!Number.isInteger(cantidad) || cantidad < 1) {

        alert(
            "La cantidad debe ser como mínimo 1."
        );

        return;
    }


    const personalizacion =
        modalPersonalizacion.value.trim() ||
        "Por coordinar";


    const productoCarrito = {

        id: producto.id,

        nombre: producto.nombre,

        precio: producto.precio,

        cantidad: cantidad,

        personalizacion: personalizacion,

        imagen: producto.imagen

    };


    const productoExistente =
        carrito.find(
            item => item.id === producto.id
        );


    if (productoExistente) {

        productoExistente.cantidad += cantidad;

        productoExistente.personalizacion =
            personalizacion;

    } else {

        carrito.push(productoCarrito);

    }


    actualizarContadorCarrito();

    mostrarCarrito();


    modal.style.display = "none";
document.body.style.overflow = "";

alert(
    "Producto agregado al carrito."
);
};
                modal.style.display = "flex";
document.body.style.overflow = "hidden";

            })
            .catch(error => {

                console.error(error);

            });

    }

});


// =====================================================
// CALCULAR TOTAL
// =====================================================

modalCantidad.addEventListener("input", function () {

    const cantidad = Number(this.value);

    const precioTexto =
        modalPrice.textContent.replace("S/ ", "");

    const precio = Number(precioTexto);

    if (cantidad >= 1 && !isNaN(precio)) {

        const total = precio * cantidad;

        modalTotal.textContent =
            "S/ " + total.toFixed(2);

    }

});

// =====================================================
// CERRAR MODAL
// =====================================================

modalClose.addEventListener("click", function () {
    modal.style.display = "none";
    document.body.style.overflow = "";
});


// Cerrar al hacer clic fuera de la ventana

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
});


    // =====================================================
// BUSCADOR
// =====================================================

const buscador = document.getElementById("buscador");
const btnBuscar = document.getElementById("btn-buscar");

btnBuscar.addEventListener("click", function () {

    const texto = buscador.value.toLowerCase().trim();
    buscando = true;
    document.getElementById("catalogo-completo").style.display = "none";
    if (texto === "") {
    location.reload();
    return;
}

    fetch(`${window.SUBLI_API_BASE}/api/productos`)
        .then(response => response.json())
        .then(productos => {

            const productosEncontrados = productos.filter(producto => {

    if (producto.activo !== true) {
        return false;
    }

    const nombre = producto.nombre.toLowerCase();

    const categoria = producto.categoria
        ? producto.categoria.toLowerCase()
        : "";

    const descripcion = producto.descripcion
        ? producto.descripcion.toLowerCase()
        : "";

    return (
        nombre.includes(texto) ||
        categoria.includes(texto) ||
        descripcion.includes(texto)
    );

});

            contenedorProductos.innerHTML = "";

            productosEncontrados.forEach(producto => {

                const tarjeta = document.createElement("article");

                tarjeta.classList.add("product-card");

                tarjeta.innerHTML = `
                    <div class="product-image">

                        <img 
                            src="assets/${window.escapeHTML(producto.imagen)}"
                            alt="${window.escapeHTML(producto.nombre)}"
                        >

                    </div>

                    <div class="product-info">

                        <h3>${window.escapeHTML(producto.nombre)}</h3>

                        <p>${window.escapeHTML(producto.descripcion)}</p>

                        <span class="product-price">
                            S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                        </span>

                        <a 
                            href="#" 
                            class="product-button"
                            data-id="${window.escapeHTML(producto.id)}"
                        >
                            Ver producto
                        </a>

                    </div>
                `;

                contenedorProductos.appendChild(tarjeta);

            });

            document.getElementById("productos").scrollIntoView({
                behavior: "smooth"
            });

        });

});

// =====================================================
// CATÁLOGO COMPLETO
// =====================================================

const catalogoContainer = document.getElementById("catalogo-container");

const btnCatalogoCompleto = document.querySelector(".products-more .btn-primary");

btnCatalogoCompleto.addEventListener("click", function (event) {

    event.preventDefault();

    document.getElementById("catalogo-completo").style.display = "block";

    const filtrosCatalogo = document.querySelectorAll(".catalog-filter");

filtrosCatalogo.forEach(boton => {
    boton.classList.remove("active");
});

document
    .querySelector('.catalog-filter[data-categoria="Todos"]')
    .classList.add("active");

    fetch(`${window.SUBLI_API_BASE}/api/productos`)
        .then(response => {

            if (!response.ok) {
                throw new Error("No se pudieron obtener los productos");
            }

            return response.json();

        })
        .then(productos => {

            catalogoContainer.innerHTML = "";

            productos
                    .filter(producto => producto.activo === true)
                    .forEach(producto => {

                const tarjeta = document.createElement("article");

                tarjeta.classList.add("product-card");

                tarjeta.innerHTML = `
                    <div class="product-image">

                        <img 
                            src="assets/${window.escapeHTML(producto.imagen)}"
                            alt="${window.escapeHTML(producto.nombre)}"
                        >

                    </div>

                    <div class="product-info">

                        <h3>${window.escapeHTML(producto.nombre)}</h3>

                        <p>${window.escapeHTML(producto.descripcion)}</p>

                        <span class="product-price">
                            S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                        </span>

                        <a 
                            href="#" 
                            class="product-button"
                            data-id="${window.escapeHTML(producto.id)}"
                        >
                            Ver producto
                        </a>

                    </div>
                `;

                catalogoContainer.appendChild(tarjeta);

            });

            document.getElementById("catalogo-completo").scrollIntoView({
                behavior: "smooth"
            });

        })
        .catch(error => {

            console.error(error);

            catalogoContainer.innerHTML = `
                <p>
                    No se pudieron cargar los productos.
                </p>
            `;

        });

});

// =====================================================
// FILTROS DEL CATÁLOGO COMPLETO
// =====================================================

const filtrosCatalogo = document.querySelectorAll(".catalog-filter");

filtrosCatalogo.forEach(filtro => {

    filtro.addEventListener("click", function () {

        const categoriaSeleccionada = this.dataset.categoria;

        // Cambiar botón activo

        filtrosCatalogo.forEach(boton => {
            boton.classList.remove("active");
        });

        this.classList.add("active");


        // Obtener productos

        fetch(`${window.SUBLI_API_BASE}/api/productos`)
            .then(response => response.json())
            .then(productos => {

                const productosActivos = productos.filter(
                    producto => producto.activo === true
                );


                let productosFiltrados;


                if (categoriaSeleccionada === "Todos") {

                    productosFiltrados = productosActivos;

                } else {

                    productosFiltrados = productosActivos.filter(
                        producto =>
                            producto.categoria === categoriaSeleccionada
                    );

                }


                catalogoContainer.innerHTML = "";


                // Si no existen productos

                if (productosFiltrados.length === 0) {

                    catalogoContainer.innerHTML = `
                        <div class="no-products">

                            <h3>
                                No hay productos disponibles
                            </h3>

                            <p>
                                Actualmente no tenemos productos
                                disponibles en esta categoría.
                            </p>

                        </div>
                    `;

                    return;
                }


                // Mostrar productos

                productosFiltrados.forEach(producto => {

                    const tarjeta = document.createElement("article");

                    tarjeta.classList.add("product-card");

                    tarjeta.innerHTML = `
                        <div class="product-image">

                            <img 
                                src="assets/${window.escapeHTML(producto.imagen)}"
                                alt="${window.escapeHTML(producto.nombre)}"
                            >

                        </div>

                        <div class="product-info">

                            <h3>
                                ${window.escapeHTML(producto.nombre)}
                            </h3>

                            <p>
                                ${window.escapeHTML(producto.descripcion)}
                            </p>

                            <span class="product-price">
                                S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                            </span>

                            <a 
                                href="#" 
                                class="product-button"
                                data-id="${window.escapeHTML(producto.id)}"
                            >
                                Ver producto
                            </a>

                        </div>
                    `;

                    catalogoContainer.appendChild(tarjeta);

                });

            })
            .catch(error => {

                console.error(error);

            });

    });

});


// =====================================================
// CARRITO DE COMPRAS
// =====================================================

const CLAVE_CARRITO = "subli_inca_carrito";
let carrito = [];

try {
    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);
    const carritoParseado = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    carrito = Array.isArray(carritoParseado) ? carritoParseado : [];
} catch (error) {
    console.warn("No se pudo recuperar el carrito guardado.", error);
    carrito = [];
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.warn("No se pudo guardar el carrito.", error);
    }
}

const btnCarrito =
    document.getElementById("btn-carrito");

const carritoContador =
    document.getElementById("carrito-contador");

const cartModal =
    document.getElementById("cart-modal");

const cartClose =
    document.getElementById("cart-close");

const carritoProductos =
    document.getElementById("carrito-productos");

const carritoUnidades =
    document.getElementById("carrito-unidades");

const carritoTotal =
    document.getElementById("carrito-total");


// =====================================================
// ABRIR CARRITO
// =====================================================

btnCarrito.addEventListener("click", function () {
    cartModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    mostrarCarrito();
});


// =====================================================
// CERRAR CARRITO
// =====================================================

cartClose.addEventListener("click", function () {
    cartModal.style.display = "none";
    document.body.style.overflow = "";
});


// Cerrar al hacer clic fuera del carrito

cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
        document.body.style.overflow = "";
    }
});


// =====================================================
// ACTUALIZAR CONTADOR
// =====================================================

function actualizarContadorCarrito() {

    const unidades = carrito.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );

    carritoContador.textContent = unidades;
    guardarCarrito();

}


// =====================================================
// MOSTRAR CARRITO
// =====================================================

function mostrarCarrito() {

    carritoProductos.innerHTML = "";

    if (carrito.length === 0) {

        carritoProductos.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>
        `;

        carritoUnidades.textContent = "0";

        carritoTotal.textContent = "S/ 0.00";

        return;
    }


    let totalUnidades = 0;
    let totalCompra = 0;


    carrito.forEach((producto, indice) => {

        const subtotal =
            producto.precio * producto.cantidad;

        totalUnidades += producto.cantidad;

        totalCompra += subtotal;


        const item = document.createElement("div");

        item.classList.add("cart-item");


        item.innerHTML = `

            <div class="cart-item-info">

                <h3>
                    ${window.escapeHTML(producto.nombre)}
                </h3>

                <p>
                    Precio unitario:
                    S/ ${window.escapeHTML(producto.precio.toFixed(2))}
                </p>

                <div class="cart-quantity">

    <button
        type="button"
        class="cart-quantity-btn cart-decrease"
        data-indice="${window.escapeHTML(indice)}"
    >
        −
    </button>

    <span class="cart-quantity-number">
        ${window.escapeHTML(producto.cantidad)}
    </span>

    <button
        type="button"
        class="cart-quantity-btn cart-increase"
        data-indice="${window.escapeHTML(indice)}"
    >
        +
    </button>

</div>

                <p>
                    Subtotal:
                    <strong>
                        S/ ${window.escapeHTML(subtotal.toFixed(2))}
                    </strong>
                </p>

                <p>
                    Personalización:
                    ${window.escapeHTML(producto.personalizacion || "Por coordinar")}
                </p>

            </div>


            <button
                type="button"
                class="cart-remove"
                data-indice="${window.escapeHTML(indice)}"
            >
                🗑️ Eliminar
            </button>

        `;


        carritoProductos.appendChild(item);

    });


    carritoUnidades.textContent =
        totalUnidades;

    carritoTotal.textContent =
        "S/ " + totalCompra.toFixed(2);


    // =================================================
    // BOTONES ELIMINAR
    // =================================================

    const botonesEliminar =
        document.querySelectorAll(".cart-remove");


    botonesEliminar.forEach(boton => {

        boton.addEventListener("click", function () {

            const indice =
                Number(this.dataset.indice);

            carrito.splice(indice, 1);

            actualizarContadorCarrito();

            mostrarCarrito();

        });

    });

    // =================================================
// BOTONES AUMENTAR CANTIDAD
// =================================================

const botonesAumentar =
    document.querySelectorAll(".cart-increase");

botonesAumentar.forEach(boton => {

    boton.addEventListener("click", function () {

        const indice =
            Number(this.dataset.indice);

        carrito[indice].cantidad++;

        actualizarContadorCarrito();

        mostrarCarrito();

    });

});


// =================================================
// BOTONES DISMINUIR CANTIDAD
// =================================================

const botonesDisminuir =
    document.querySelectorAll(".cart-decrease");

botonesDisminuir.forEach(boton => {

    boton.addEventListener("click", function () {

        const indice =
            Number(this.dataset.indice);

        if (carrito[indice].cantidad > 1) {

    carrito[indice].cantidad--;

}

        actualizarContadorCarrito();

        mostrarCarrito();

    });

});

}

// Restaurar también el contador y el contenido del modal al cargar la página.
actualizarContadorCarrito();
mostrarCarrito();


// =====================================================
// FINALIZAR PEDIDO POR WHATSAPP
// =====================================================

const btnFinalizarPedido =
    document.getElementById("btn-finalizar-pedido");

btnFinalizarPedido.addEventListener("click", function () {

    if (carrito.length === 0) {

        alert(
            "Tu carrito está vacío."
        );

        return;
    }


    let mensajeWhatsapp =
        "Hola, estoy interesado en realizar un pedido en SUBLI-INCA:\n\n";

    mensajeWhatsapp +=
        "🛍️ DETALLE DEL PEDIDO\n\n";


    let totalUnidades = 0;
    let totalCompra = 0;


    carrito.forEach((producto, indice) => {

        const subtotal =
            producto.precio * producto.cantidad;

        totalUnidades += producto.cantidad;

        totalCompra += subtotal;


        mensajeWhatsapp +=
            (indice + 1) + ". " +
            producto.nombre + "\n";

        mensajeWhatsapp +=
            "Cantidad: " +
            producto.cantidad + "\n";

        mensajeWhatsapp +=
            "Precio unitario: S/ " +
            producto.precio.toFixed(2) + "\n";

        mensajeWhatsapp +=
            "Subtotal: S/ " +
            subtotal.toFixed(2) + "\n";

        mensajeWhatsapp +=
            "Personalización: " +
            (producto.personalizacion || "Por coordinar") +
            "\n\n";

    });


    mensajeWhatsapp +=
        "TOTAL DE UNIDADES: " +
        totalUnidades + "\n";

    mensajeWhatsapp +=
        "TOTAL DEL PEDIDO: S/ " +
        totalCompra.toFixed(2) + "\n\n";

    mensajeWhatsapp +=
        "Quisiera coordinar los detalles de mi pedido.";


    const urlWhatsapp =
        `${window.SUBLI_WHATSAPP_URL}?text=` +
        encodeURIComponent(mensajeWhatsapp);


    window.open(
        urlWhatsapp,
        "_blank",
        "noopener,noreferrer"
    );

});

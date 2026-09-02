const token = localStorage.getItem("token");


// =========================
// VERIFICAR TOKEN
// =========================

if (!token) {

    window.location.href = "index.html";

}


// =========================
// OBTENER CARRITO
// =========================

let carrito =
    JSON.parse(localStorage.getItem("carrito")) || [];


// =========================
// MOSTRAR CARRITO
// =========================

async function obtenerProductosCarrito() {

    try {

        const listaCarrito =
            document.getElementById("listaCarrito");


        // Verificar si el carrito está vacío
        if (carrito.length === 0) {

            listaCarrito.innerHTML = `
                <p>
                    Tu carrito está vacío.
                </p>
            `;


            document.getElementById(
                "totalCarrito"
            ).textContent = "$0";


            return;
        }


        // Limpiar carrito
        listaCarrito.innerHTML = "";


        // Variable para el total
        let total = 0;


        // =========================
        // RECORRER CARRITO
        // =========================

        for (const item of carrito) {

            const respuesta = await fetch(
                `http://localhost:3000/productos/${item.id}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            const resultado =
                await respuesta.json();


            // Verificar respuesta
            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    "No se pudo obtener el producto"
                );

            }


            // Obtener información del producto
            const producto =
                resultado.producto;


            console.log(
                "Producto obtenido:",
                producto
            );


            // =========================
            // CALCULAR SUBTOTAL
            // =========================

            const subtotal =
                Number(producto.precio) *
                item.cantidad;


            // Acumular total
            total += subtotal;


            // =========================
            // CREAR TARJETA
            // =========================

            const tarjeta =
                document.createElement("article");


            tarjeta.classList.add(
                "producto-carrito"
            );


            tarjeta.innerHTML = `

                <h3>
                    ${producto.nombre}
                </h3>


                <p>
                    <strong>
                        Marca:
                    </strong>

                    ${producto.marca}
                </p>


                <p>
                    <strong>
                        Precio:
                    </strong>

                    $${producto.precio}
                </p>


                <div class="cantidad">

                    <strong>
                        Cantidad:
                    </strong>


                    <button
                        type="button"
                        class="btn-disminuir"
                        data-id="${producto.id}"
                    >
                        −
                    </button>


                    <span>
                        ${item.cantidad}
                    </span>


                    <button
                        type="button"
                        class="btn-aumentar"
                        data-id="${producto.id}"
                    >
                        +
                    </button>

                </div>


                <p>
                    <strong>
                        Subtotal:
                    </strong>

                    $${subtotal}
                </p>


                <button
                    type="button"
                    class="btn-eliminar"
                    data-id="${producto.id}"
                >
                    Eliminar producto
                </button>

            `;


            // Agregar tarjeta
            listaCarrito.appendChild(
                tarjeta
            );

        }


        // =========================
        // MOSTRAR TOTAL
        // =========================

        document.getElementById(
            "totalCarrito"
        ).textContent = `$${total}`;


        // =========================
        // ACTIVAR BOTONES
        // =========================

        activarBotones();


    } catch (error) {

        console.error(
            "Error obteniendo productos del carrito:",
            error
        );


        document.getElementById(
            "listaCarrito"
        ).innerHTML = `
            <p>
                No se pudieron cargar
                los productos del carrito.
            </p>
        `;

    }

}


// =========================
// ACTIVAR BOTONES
// =========================

function activarBotones() {


    // =========================
    // BOTÓN AUMENTAR
    // =========================

    const botonesAumentar =
        document.querySelectorAll(
            ".btn-aumentar"
        );


    botonesAumentar.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            boton.dataset.id
                        );


                    aumentarCantidad(id);

                }
            );

        }
    );


    // =========================
    // BOTÓN DISMINUIR
    // =========================

    const botonesDisminuir =
        document.querySelectorAll(
            ".btn-disminuir"
        );


    botonesDisminuir.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            boton.dataset.id
                        );


                    disminuirCantidad(id);

                }
            );

        }
    );


    // =========================
    // BOTÓN ELIMINAR
    // =========================

    const botonesEliminar =
        document.querySelectorAll(
            ".btn-eliminar"
        );


    botonesEliminar.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            boton.dataset.id
                        );


                    eliminarProducto(id);

                }
            );

        }
    );

}


// =========================
// AUMENTAR CANTIDAD
// =========================

function aumentarCantidad(id) {

    const producto =
        carrito.find(
            item => item.id === id
        );


    if (!producto) {

        return;

    }


    producto.cantidad++;


    guardarCarrito();

}


// =========================
// DISMINUIR CANTIDAD
// =========================

function disminuirCantidad(id) {

    const producto =
        carrito.find(
            item => item.id === id
        );


    if (!producto) {

        return;

    }


    // Si hay más de una unidad
    if (producto.cantidad > 1) {

        producto.cantidad--;

    } else {

        // Si solo queda una unidad
        eliminarProducto(id);

        return;

    }


    guardarCarrito();

}


// =========================
// ELIMINAR PRODUCTO
// =========================

function eliminarProducto(id) {

    carrito =
        carrito.filter(
            item => item.id !== id
        );


    guardarCarrito();

}


// =========================
// GUARDAR CARRITO
// =========================

function guardarCarrito() {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


    // Volver a mostrar el carrito
    obtenerProductosCarrito();

}


// =========================
// CERRAR SESIÓN
// =========================

document.getElementById(
    "cerrarSesion"
).addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        localStorage.removeItem("token");

        localStorage.removeItem("usuario");


        window.location.href =
            "index.html";

    }
);


// =========================
// EJECUTAR
// =========================

obtenerProductosCarrito();
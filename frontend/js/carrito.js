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

async function aumentarCantidad(id) {

    const producto =
        carrito.find(
            item => item.id === id
        );


    if (!producto) {

        return;

    }


    try {

        // Consultar producto en el backend
        const respuesta = await fetch(
            `http://localhost:3000/productos/${id}`,
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
                "No se pudo consultar el producto"
            );

        }


        // Producto obtenido desde PostgreSQL
        const productoBD =
            resultado.producto;


        // =========================
        // VERIFICAR STOCK
        // =========================

        if (
            producto.cantidad >=
            Number(productoBD.cantidad)
        ) {

            alert(
                "No hay más unidades disponibles."
            );

            return;

        }


        // Aumentar cantidad
        producto.cantidad++;


        // Guardar carrito
        guardarCarrito();


    } catch (error) {

        console.error(
            "Error verificando stock:",
            error
        );

    }

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
 // FINALIZAR COMPRA
 // =========================

 async function finalizarCompra() {

     if (carrito.length === 0) {

         alert("El carrito está vacío.");
         return;

     }

     const boton =
         document.getElementById("btnFinalizarCompra");

     // Evitar crear otro pedido si ya existe
     // uno pendiente de registrar su pago.

     const pedidoPendiente =
         localStorage.getItem("pedidoPendientePago");

     if (pedidoPendiente) {

         alert(
             "Ya tienes un pedido creado pendiente de continuar su proceso de pago."
         );

         window.location.href = "pagar-pedido.html";

         return;
     }

     let pedidoCreado = null;

     try {

         boton.disabled = true;
         boton.textContent = "Procesando compra...";

         // =========================
         // CREAR PEDIDO
         // =========================

         const respuestaPedido = await fetch(
             "http://localhost:3000/pedidos",
             {
                 method: "POST",

                 headers: {
                     "Authorization": `Bearer ${token}`,
                     "Content-Type": "application/json"
                 },

                 body: JSON.stringify({
                     carrito: carrito
                 })
             }
         );

         const datosPedido =
             await respuestaPedido.json();

         if (!respuestaPedido.ok) {

             throw new Error(
                 datosPedido.mensaje ||
                 "No se pudo crear el pedido"
             );
         }

         pedidoCreado = datosPedido.pedido;

         // Guardar ID del pedido creado
         // antes de continuar con el pago.

         localStorage.setItem(
             "pedidoPendientePago",
             String(pedidoCreado.id)
         );

         // El pedido ya quedó creado en PostgreSQL.
         // Vaciar el carrito para evitar repetirlo.

         carrito = [];

         localStorage.removeItem("carrito");

         obtenerProductosCarrito();

         // =========================
         // REGISTRAR PAGO PENDIENTE
         // =========================

         const respuestaPago = await fetch(
             "http://localhost:3000/pagos",
             {
                 method: "POST",

                 headers: {
                     "Authorization": `Bearer ${token}`,
                     "Content-Type": "application/json"
                 },

                 body: JSON.stringify({
                     pedido_id: pedidoCreado.id,
                     metodo_pago: "transferencia"
                 })
             }
         );

         const datosPago =
             await respuestaPago.json();

         if (!respuestaPago.ok) {

             throw new Error(
                 datosPago.mensaje ||
                 "El pedido se creó, pero no se pudo registrar el pago."
             );
         }

         console.log(
             "Pago pendiente registrado:",
             datosPago
         );

         // =========================
         // CONTINUAR AL PAGO
         // =========================

         window.location.href =
             "pagar-pedido.html";

     } catch (error) {

         console.error(
             "Error durante el proceso de compra:",
             error
         );

         if (pedidoCreado) {

             alert(
                 "El pedido ya fue creado, pero no se pudo completar el registro del pago.\n\n" +
                 "No vuelvas a crear el pedido. Conservaremos su número para continuar posteriormente.\n\n" +
                 `Pedido #${pedidoCreado.id}`
             );

         } else {

             alert(
                 error.message ||
                 "No se pudo crear el pedido."
             );

         }

     } finally {

         boton.disabled = false;

         boton.textContent = "Finalizar compra";

     }

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
// BOTÓN FINALIZAR COMPRA
// =========================

const botonFinalizarCompra =
    document.getElementById(
        "btnFinalizarCompra"
    );


if (botonFinalizarCompra) {

    botonFinalizarCompra.addEventListener(
        "click",
        finalizarCompra
    );

}


// =========================
// EJECUTAR
// =========================

obtenerProductosCarrito();
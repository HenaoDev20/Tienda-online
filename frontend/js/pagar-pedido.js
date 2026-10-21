
// =========================
// CONFIGURACIÓN
// =========================

const API_URL = "http://localhost:3000";

const token = localStorage.getItem("token");

const numeroPedido =
    document.getElementById("numeroPedido");

const totalPedido =
    document.getElementById("totalPedido");

const estadoPago =
    document.getElementById("estadoPago");

const mensajePago =
    document.getElementById("mensajePago");

const formularioNotificacion =
    document.getElementById("formularioNotificacion");

const btnNotificar =
    document.getElementById("btnNotificar");

let pagoActual = null;


// =========================
// FORMATEAR PRECIO
// =========================

function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(valor));

}


// =========================
// SOLICITUDES A LA API
// =========================

async function solicitarAPI(ruta, opciones = {}) {

    const respuesta = await fetch(
        `${API_URL}${ruta}`,
        {
            ...opciones,

            headers: {
                "Authorization": `Bearer ${token}`,
                ...(opciones.headers || {})
            }
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {

        throw new Error(
            datos.mensaje || "Error al consultar el servidor"
        );

    }

    return datos;

}


// =========================
// CONSULTAR PAGO DEL PEDIDO
// =========================

async function consultarPago(pedidoId) {

    const datos = await solicitarAPI(
        "/pagos/mis-pagos"
    );

    return datos.pagos.find(
        pago => Number(pago.pedido_id) === pedidoId
    ) || null;

}


// =========================
// MOSTRAR ESTADO DEL PAGO
// =========================

function mostrarEstado() {

    formularioNotificacion.hidden = true;

    if (!pagoActual) {

        estadoPago.textContent = "Sin registrar";
        return;

    }

    const estado = pagoActual.estado;

    if (estado === "aprobado") {

        estadoPago.textContent = "Aprobado";

        mensajePago.textContent =
            "Tu pago fue aprobado por la tienda.";

        localStorage.removeItem("pedidoPendientePago");

        return;

    }

    if (estado === "rechazado") {

        estadoPago.textContent = "Rechazado";

        mensajePago.textContent =
            "Tu pago fue rechazado. Contacta a la tienda.";

        localStorage.removeItem("pedidoPendientePago");

        return;

    }

    if (estado === "pendiente") {

        estadoPago.textContent = "Pendiente";

        if (pagoActual.notificado_en) {

            mensajePago.textContent =
                "Ya notificaste tu transferencia. " +
                "Estamos esperando la verificación del administrador.";

        } else {

            mensajePago.textContent =
                "Cuando realices la transferencia, " +
                "puedes notificarla desde aquí.";

            formularioNotificacion.hidden = false;

        }

    }

}


// =========================
// REGISTRAR PAGO SI NO EXISTE
// =========================

async function asegurarPago(pedidoId) {

    let pago = await consultarPago(pedidoId);

    if (pago) {
        return pago;
    }

    // El pedido existe, pero todavía no tiene
    // un pago registrado. No creamos otro pedido.

    try {

        const datos = await solicitarAPI(
            "/pagos",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pedido_id: pedidoId,
                    metodo_pago: "transferencia"
                })
            }
        );

        return datos.pago;

    } catch (error) {

        // Si hubo un conflicto por pago existente,
        // volver a consultar el registro real.

        const pagoExistente =
            await consultarPago(pedidoId);

        if (pagoExistente) {
            return pagoExistente;
        }

        throw error;

    }

}


// =========================
// CARGAR PÁGINA DE PAGO
// =========================

async function cargarPago() {

    if (!token) {

        window.location.href = "index.html";
        return;

    }

    const pedidoId = Number(
        localStorage.getItem("pedidoPendientePago")
    );

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {

        mensajePago.textContent =
            "No hay un pedido seleccionado para pagar.";

        return;

    }

    try {

        mensajePago.textContent =
            "Consultando información del pedido...";

        // Verificar que el pedido pertenece al usuario
        const datosPedido = await solicitarAPI(
            `/pedidos/${pedidoId}`
        );

        const pedido = datosPedido.pedido;

        numeroPedido.textContent = `#${pedido.id}`;

        totalPedido.textContent =
            formatearPrecio(pedido.total);

        // Buscar o registrar el pago pendiente
        pagoActual = await asegurarPago(pedidoId);

        mostrarEstado();

    } catch (error) {

        console.error(
            "Error cargando pago:",
            error
        );

        mensajePago.textContent =
            error.message +
            " Puedes recargar la página para intentarlo nuevamente.";

    }

}


// =========================
// NOTIFICAR TRANSFERENCIA
// =========================

formularioNotificacion.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        if (!pagoActual || pagoActual.estado !== "pendiente") {
            return;
        }

        const referencia =
            document.getElementById("referencia")
                .value.trim();

        const confirmado = window.confirm(
            "¿Confirmas que ya realizaste la transferencia bancaria?"
        );

        if (!confirmado) {
            return;
        }

        try {

            btnNotificar.disabled = true;

            btnNotificar.textContent =
                "Enviando notificación...";

            const datos = await solicitarAPI(
                `/pagos/${pagoActual.id}/notificar`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        referencia: referencia || null
                    })
                }
            );

            pagoActual = datos.pago;

            mostrarEstado();

        } catch (error) {

            console.error(
                "Error notificando transferencia:",
                error
            );

            // Consultar de nuevo por si el servidor
            // guardó la notificación antes de un error.

            try {

                const pagoReciente =
                    await consultarPago(
                        Number(pagoActual.pedido_id)
                    );

                if (pagoReciente) {
                    pagoActual = pagoReciente;
                    mostrarEstado();
                }

            } catch (errorConsulta) {

                console.error(
                    "Error consultando estado:",
                    errorConsulta
                );

            }

            if (
                !pagoActual ||
                !pagoActual.notificado_en
            ) {

                mensajePago.textContent = error.message;

            }

        } finally {

            btnNotificar.disabled = false;

            btnNotificar.textContent =
                "Ya realicé la transferencia";

        }

    }
);


// =========================
// EJECUTAR
// =========================

cargarPago();

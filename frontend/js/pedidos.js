console.log("PEDIDOS.JS FUNCIONANDO");

const tokenPedidos = localStorage.getItem("token");

// =========================
// VERIFICAR TOKEN
// =========================

if (!tokenPedidos) {
    window.location.href = "index.html";
}

function formatearPrecio(valor) {

    return Number(valor).toLocaleString(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }
    );

}

function formatearFecha(fecha) {

    return new Date(fecha).toLocaleString(
        "es-CO",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


// =========================
// OBTENER MIS PEDIDOS
// =========================

async function obtenerMisPedidos() {

    try {

        const listaPedidos =
            document.getElementById("listaPedidos");


        const respuesta = await fetch(
            "http://localhost:3000/pedidos/mis-pedidos",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${tokenPedidos}`
                }
            }
        );


        const resultado =
            await respuesta.json();


        // =========================
        // VERIFICAR RESPUESTA
        // =========================

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener los pedidos"
            );

        }


        // =========================
        // OBTENER PEDIDOS
        // =========================

        const pedidos =
            resultado.pedidos;


        // =========================
        // SIN PEDIDOS
        // =========================

        if (pedidos.length === 0) {

            listaPedidos.innerHTML = `
                <p>
                    Aún no tienes pedidos.
                </p>
            `;

            return;
        }


        // =========================
        // LIMPIAR CONTENEDOR
        // =========================

        listaPedidos.innerHTML = "";


        // =========================
        // MOSTRAR PEDIDOS
        // =========================

        pedidos.forEach(pedido => {

            const tarjeta =
                document.createElement("article");


            tarjeta.classList.add(
                "pedido"
            );


            tarjeta.innerHTML = `
                <h3>
                    Pedido #${pedido.id}
                </h3>

                <p>
                    <strong>
                        Fecha:
                    </strong>
                    ${formatearFecha(pedido.fecha)}
                </p>

                <p>
                    <strong>
                        Total:
                    </strong>
                    ${formatearPrecio(pedido.total)}
                </p>

                <p>
                    <strong>
                        Estado:
                    </strong>
                    ${pedido.estado}
                </p>

               
            `;


            listaPedidos.appendChild(
                tarjeta
            );

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedidos:",
            error
        );


        document.getElementById(
            "listaPedidos"
        ).innerHTML = `
            <p>
                No se pudieron cargar
                los pedidos.
            </p>
        `;

    }

}





// =========================
// EJECUTAR
// =========================

obtenerMisPedidos();
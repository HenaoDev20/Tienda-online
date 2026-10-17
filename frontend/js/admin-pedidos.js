
 // =========================
 // CONFIGURACIÓN
 // =========================

 const API_URL = "http://localhost:3000";

 const token = localStorage.getItem("token");

 const tablaPedidos =
     document.getElementById("tablaPedidos");

 const mensajePedidos =
     document.getElementById("mensajePedidos");

 const seccionDetalle =
     document.getElementById("seccionDetalle");

 const informacionPedido =
     document.getElementById("informacionPedido");

 const tablaDetalle =
     document.getElementById("tablaDetalle");

 const totalDetalle =
     document.getElementById("totalDetalle");

 let pedidos = [];
 let pedidoSeleccionadoId = null;
 let actualizandoEstado = false;


 // =========================
 // FORMATEAR VALORES
 // =========================

 function formatearPrecio(valor) {

     return new Intl.NumberFormat("es-CO", {
         style: "currency",
         currency: "COP",
         maximumFractionDigits: 0
     }).format(Number(valor));

 }

 function formatearFecha(fecha) {

     return new Date(fecha).toLocaleString("es-CO", {
         dateStyle: "medium",
         timeStyle: "short"
     });

 }


 // =========================
 // ESTADOS DE LOS PEDIDOS
 // =========================

 function obtenerSiguienteEstado(estadoActual) {

     const transiciones = {
         pendiente: "confirmado",
         confirmado: "enviado",
         enviado: "entregado"
     };

     return transiciones[estadoActual] || null;

 }

 function obtenerTextoBoton(estadoActual) {

     const textos = {
         pendiente: "Confirmar pedido",
         confirmado: "Marcar como enviado",
         enviado: "Marcar como entregado"
     };

     return textos[estadoActual] || "";

 }


 // =========================
 // VERIFICAR ADMINISTRADOR
 // =========================

 async function verificarAdministrador() {

     if (!token) {

         window.location.href = "index.html";
         return false;

     }

     try {

         const respuesta = await fetch(
             `${API_URL}/usuarios/perfil`,
             {
                 headers: {
                     "Authorization": `Bearer ${token}`
                 }
             }
         );

         if (!respuesta.ok) {

             localStorage.removeItem("token");

             window.location.href = "index.html";

             return false;

         }

         const datos = await respuesta.json();

         if (datos.usuario.rol !== "admin") {

             window.location.href = "perfil.html";

             return false;

         }

         return true;

     } catch (error) {

         console.error(
             "Error verificando administrador:",
             error
         );

         mensajePedidos.textContent =
             "No se pudo verificar la sesión.";

         return false;

     }

 }


 // =========================
 // OBTENER TODOS LOS PEDIDOS
 // =========================

 async function obtenerPedidos() {

     try {

         mensajePedidos.textContent =
             "Cargando pedidos...";

         const respuesta = await fetch(
             `${API_URL}/pedidos/admin/todos`,
             {
                 method: "GET",

                 headers: {
                     "Authorization": `Bearer ${token}`
                 }
             }
         );

         if (!respuesta.ok) {

             throw new Error(
                 "No se pudieron obtener los pedidos"
             );

         }

         const datos = await respuesta.json();

         pedidos = datos.pedidos;

         mostrarPedidos();

         // Mantener actualizado el detalle abierto

         if (pedidoSeleccionadoId !== null) {

             const pedidoActualizado = pedidos.find(
                 pedido => pedido.id === pedidoSeleccionadoId
             );

             if (pedidoActualizado) {

                 mostrarDetalle(pedidoActualizado, false);

             } else {

                 pedidoSeleccionadoId = null;
                 seccionDetalle.hidden = true;

             }

         }

         mensajePedidos.textContent =
             pedidos.length === 0
                 ? "Todavía no hay pedidos registrados."
                 : "";

         return true;

     } catch (error) {

         console.error(
             "Error obteniendo pedidos:",
             error
         );

         mensajePedidos.textContent =
             "No se pudieron cargar los pedidos.";

         return false;

     }

 }


 // =========================
 // MOSTRAR PEDIDOS
 // =========================

 function mostrarPedidos() {

     tablaPedidos.replaceChildren();

     for (const pedido of pedidos) {

         const fila = document.createElement("tr");

         const valores = [
             `#${pedido.id}`,
             pedido.cliente.nombre,
             formatearFecha(pedido.fecha),
             formatearPrecio(pedido.total),
             pedido.estado
         ];

         for (const valor of valores) {

             const celda = document.createElement("td");

             celda.textContent = valor;

             fila.appendChild(celda);

         }

         // =========================
         // BOTÓN VER DETALLE
         // =========================

         const celdaAccion =
             document.createElement("td");

         const botonDetalle =
             document.createElement("button");

         botonDetalle.textContent =
             "Ver detalle";

         botonDetalle.className =
             "btn-detalle";

         botonDetalle.addEventListener(
             "click",
             () => {
                 mostrarDetalle(pedido);
             }
         );

         celdaAccion.appendChild(botonDetalle);

         // =========================
         // BOTÓN CAMBIAR ESTADO
         // =========================

         const siguienteEstado =
             obtenerSiguienteEstado(pedido.estado);

         if (siguienteEstado) {

             const botonEstado =
                 document.createElement("button");

             botonEstado.textContent =
                 obtenerTextoBoton(pedido.estado);

             botonEstado.className =
                 "btn-estado";

             botonEstado.disabled = actualizandoEstado;

             botonEstado.addEventListener(
                 "click",
                 () => {
                     actualizarEstadoPedido(
                         pedido.id,
                         siguienteEstado
                     );
                 }
             );

             celdaAccion.appendChild(botonEstado);

         }

         fila.appendChild(celdaAccion);

         tablaPedidos.appendChild(fila);

     }

 }


 // =========================
 // ACTUALIZAR ESTADO DEL PEDIDO
 // =========================

 async function actualizarEstadoPedido(id, nuevoEstado) {

     if (actualizandoEstado) {
         return;
     }

     const confirmado = window.confirm(
         `¿Deseas cambiar el pedido #${id} a "${nuevoEstado}"?`
     );

     if (!confirmado) {
         return;
     }

     actualizandoEstado = true;
     mostrarPedidos();

     try {

         const respuesta = await fetch(
             `${API_URL}/pedidos/admin/${id}/estado`,
             {
                 method: "PATCH",

                 headers: {
                     "Content-Type": "application/json",
                     "Authorization": `Bearer ${token}`
                 },

                 body: JSON.stringify({
                     estado: nuevoEstado
                 })
             }
         );

         const datos = await respuesta.json();

         if (!respuesta.ok) {

             throw new Error(
                 datos.mensaje ||
                 "No se pudo actualizar el estado"
             );

         }

         // Consultar nuevamente los pedidos

         const cargados = await obtenerPedidos();

         if (cargados) {

             mensajePedidos.textContent =
                 "Estado actualizado correctamente.";

         } else {

             mensajePedidos.textContent =
                 "El estado se actualizó, pero no se pudo recargar la lista. Actualiza la página.";

         }

     } catch (error) {

         console.error(
             "Error actualizando estado:",
             error
         );

         mensajePedidos.textContent =
             error.message;

     } finally {

         actualizandoEstado = false;
         mostrarPedidos();

     }

 }


 // =========================
 // MOSTRAR DETALLE DEL PEDIDO
 // =========================

 function mostrarDetalle(pedido, desplazar = true) {

     pedidoSeleccionadoId = pedido.id;

     seccionDetalle.hidden = false;

     informacionPedido.replaceChildren();

     tablaDetalle.replaceChildren();

     // Información general

     const informacion = [
         ["Número de pedido", `#${pedido.id}`],
         ["Fecha", formatearFecha(pedido.fecha)],
         ["Estado", pedido.estado],
         ["Cliente", pedido.cliente.nombre],
         ["Correo electrónico", pedido.cliente.email]
     ];

     for (const [titulo, valor] of informacion) {

         const parrafo = document.createElement("p");

         const etiqueta = document.createElement("strong");

         etiqueta.textContent = `${titulo}: `;

         parrafo.appendChild(etiqueta);

         parrafo.appendChild(
             document.createTextNode(valor)
         );

         informacionPedido.appendChild(parrafo);

     }

     // =========================
     // PRODUCTOS DEL PEDIDO
     // =========================

     for (const producto of pedido.productos) {

         const fila = document.createElement("tr");

         const valores = [
             producto.nombre ?? "Producto no disponible",
             producto.marca ?? "Sin marca",
             producto.cantidad,
             formatearPrecio(producto.precio),
             formatearPrecio(producto.subtotal)
         ];

         for (const valor of valores) {

             const celda = document.createElement("td");

             celda.textContent = valor;

             fila.appendChild(celda);

         }

         tablaDetalle.appendChild(fila);

     }

     // Total general

     totalDetalle.textContent =
         `Total del pedido: ${formatearPrecio(pedido.total)}`;

     if (desplazar) {

         seccionDetalle.scrollIntoView({
             behavior: "smooth",
             block: "start"
         });

     }

 }


 // =========================
 // INICIALIZAR
 // =========================

 async function iniciarPagina() {

     const esAdministrador =
         await verificarAdministrador();

     if (!esAdministrador) {
         return;
     }

     await obtenerPedidos();

 }

 iniciarPagina();

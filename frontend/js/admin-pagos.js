
 // =========================
 // CONFIGURACIÓN
 // =========================

 const API_URL = "http://localhost:3000";

 const token = localStorage.getItem("token");

 const tablaPagos =
     document.getElementById("tablaPagos");

 const mensajePagos =
     document.getElementById("mensajePagos");

 let pagos = [];

 let actualizandoPago = false;


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
 // FORMATEAR FECHA
 // =========================

 function formatearFecha(fecha) {

     if (!fecha) {
         return "Sin registrar";
     }

     return new Date(fecha).toLocaleString("es-CO", {
         dateStyle: "medium",
         timeStyle: "short"
     });

 }


 // =========================
 // CREAR ETIQUETA DE ESTADO
 // =========================

 function crearEtiquetaEstado(estado) {

     const etiqueta =
         document.createElement("span");

     etiqueta.textContent = estado;

     etiqueta.className = "estado";

     const estadosValidos = [
         "pendiente",
         "aprobado",
         "rechazado"
     ];

     if (estadosValidos.includes(estado)) {

         etiqueta.classList.add(
             `estado-${estado}`
         );

     }

     return etiqueta;

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

         mensajePagos.textContent =
             "No se pudo verificar la sesión.";

         return false;

     }

 }


 // =========================
 // OBTENER TODOS LOS PAGOS
 // =========================

 async function obtenerPagos() {

     try {

         mensajePagos.textContent =
             "Cargando pagos...";

         const respuesta = await fetch(
             `${API_URL}/pagos/admin/todos`,
             {
                 method: "GET",

                 headers: {
                     "Authorization": `Bearer ${token}`
                 }
             }
         );

         if (!respuesta.ok) {

             throw new Error(
                 "No se pudieron obtener los pagos"
             );

         }

         const datos = await respuesta.json();

         pagos = datos.pagos;

         mostrarPagos();

         mensajePagos.textContent =
             pagos.length === 0
                 ? "No hay pagos registrados."
                 : "";

         return true;

     } catch (error) {

         console.error(
             "Error obteniendo pagos:",
             error
         );

         mensajePagos.textContent =
             "No se pudieron cargar los pagos.";

         return false;

     }

 }


 // =========================
 // MOSTRAR PAGOS
 // =========================

 function mostrarPagos() {

     tablaPagos.replaceChildren();

     for (const pago of pagos) {

         const fila = document.createElement("tr");

         // Información general

         const valores = [
             `#${pago.id}`,
             `#${pago.pedido_id}`,
             pago.cliente_nombre,
             pago.cliente_email,
             formatearPrecio(pago.monto),
             pago.metodo_pago,
             formatearFecha(pago.creado_en)
         ];

         for (const valor of valores) {

             const celda =
                 document.createElement("td");

             celda.textContent = valor;

             fila.appendChild(celda);

         }


         // =========================
         // ESTADO CON COLOR
         // =========================

         const celdaEstado =
             document.createElement("td");

         celdaEstado.appendChild(
             crearEtiquetaEstado(pago.estado)
         );

         fila.appendChild(celdaEstado);


         // =========================
         // ACCIONES
         // =========================

         const celdaAcciones =
             document.createElement("td");

         celdaAcciones.className = "acciones";


         if (pago.estado === "pendiente") {

             // BOTÓN APROBAR

             const botonAprobar =
                 document.createElement("button");

             botonAprobar.textContent =
                 "Aprobar";

             botonAprobar.className =
                 "btn-aprobar";

             botonAprobar.disabled =
                 actualizandoPago;

             botonAprobar.addEventListener(
                 "click",
                 () => {

                     actualizarEstadoPago(
                         pago.id,
                         "aprobado"
                     );

                 }
             );

             celdaAcciones.appendChild(
                 botonAprobar
             );


             // BOTÓN RECHAZAR

             const botonRechazar =
                 document.createElement("button");

             botonRechazar.textContent =
                 "Rechazar";

             botonRechazar.className =
                 "btn-rechazar";

             botonRechazar.disabled =
                 actualizandoPago;

             botonRechazar.addEventListener(
                 "click",
                 () => {

                     actualizarEstadoPago(
                         pago.id,
                         "rechazado"
                     );

                 }
             );

             celdaAcciones.appendChild(
                 botonRechazar
             );

         } else {

             // Pago ya procesado

             const texto =
                 document.createElement("span");

             texto.textContent =
                 "Verificado";

             texto.className =
                 "texto-verificado";

             celdaAcciones.appendChild(texto);

         }

         fila.appendChild(celdaAcciones);

         tablaPagos.appendChild(fila);

     }

 }


 // =========================
 // ACTUALIZAR ESTADO DEL PAGO
 // =========================

 async function actualizarEstadoPago(id, nuevoEstado) {

     if (actualizandoPago) {
         return;
     }

     const mensajeConfirmacion =
         nuevoEstado === "aprobado"
             ? `¿Verificaste en la cuenta bancaria que el pago #${id} fue recibido?`
             : `¿Deseas rechazar el pago #${id}?`;

     const confirmado =
         window.confirm(mensajeConfirmacion);

     if (!confirmado) {
         return;
     }

     actualizandoPago = true;

     mostrarPagos();

     try {

         const respuesta = await fetch(
             `${API_URL}/pagos/admin/${id}/estado`,
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
                 "No se pudo actualizar el pago"
             );

         }

         // Volver a consultar los pagos

         const cargados = await obtenerPagos();

         if (cargados) {

             mensajePagos.textContent =
                 `Pago ${nuevoEstado} correctamente.`;

         } else {

             mensajePagos.textContent =
                 "El pago se actualizó, pero no se pudo recargar la lista. Actualiza la página.";

         }

     } catch (error) {

         console.error(
             "Error actualizando pago:",
             error
         );

         mensajePagos.textContent =
             error.message;

     } finally {

         actualizandoPago = false;

         mostrarPagos();

     }

 }


 // =========================
 // INICIALIZAR PÁGINA
 // =========================

 async function iniciarPagina() {

     const esAdministrador =
         await verificarAdministrador();

     if (!esAdministrador) {
         return;
     }

     await obtenerPagos();

 }

 iniciarPagina();

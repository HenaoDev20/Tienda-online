const nombreUsuario = document.getElementById("nombreUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const mensaje = document.getElementById("mensaje");
const cerrarSesion = document.getElementById("cerrarSesion");


// Obtener token almacenado
const token = localStorage.getItem("token");


// Verificar si existe una sesión
if (!token) {

    mensaje.textContent = "No tienes una sesión activa";

} else {

    cargarPerfil();

}


// Obtener información del usuario
async function cargarPerfil() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/usuarios/perfil",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);


        // Si el servidor devuelve un error
        if (!respuesta.ok) {

            mensaje.textContent = datos.mensaje;

            return;
        }


        // Mostrar información del usuario
        nombreUsuario.textContent =
            `Nombre: ${datos.usuario.nombre}`;

        emailUsuario.textContent =
            `Email: ${datos.usuario.email}`;


    } catch (error) {

        console.error("Error:", error);

        mensaje.textContent =
            "No se pudo conectar con el servidor";

    }

}


// Cerrar sesión
cerrarSesion.addEventListener("click", function () {

    // Eliminar JWT
    localStorage.removeItem("token");

    // Eliminar información del usuario
    localStorage.removeItem("usuario");

    // Volver al login
    window.location.href = "index.html";

});
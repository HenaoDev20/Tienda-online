const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

registroForm.addEventListener("submit", async function (event) {

    // Evitar que el formulario recargue la página
    event.preventDefault();

    // Obtener datos del formulario
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        // Enviar datos al backend
        const respuesta = await fetch(
            "http://localhost:3000/usuarios",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nombre: nombre,
                    email: email,
                    password: password
                })
            }
        );

        // Convertir respuesta a JSON
        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);

        // Si ocurrió algún error
        if (!respuesta.ok) {

            mensaje.textContent = datos.mensaje;

            return;
        }

        // Registro exitoso
        mensaje.textContent = datos.mensaje;

        console.log(
            "Usuario creado correctamente:",
            datos.usuario
        );

        // Limpiar formulario
        registroForm.reset();

    } catch (error) {

        console.error("Error:", error);

        mensaje.textContent =
            "No se pudo conectar con el servidor";
    }

});
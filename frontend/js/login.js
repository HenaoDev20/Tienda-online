const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async function (event) {

    // Evitar que el formulario recargue la página
    event.preventDefault();

    // Obtener los datos del formulario
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        // Enviar los datos al backend
        const respuesta = await fetch(
            "http://localhost:3000/usuarios/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        // Convertir la respuesta del servidor a JSON
        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);

        // Si el servidor devuelve un error
        if (!respuesta.ok) {

            mensaje.textContent = datos.mensaje;

            return;
        }

        // Login exitoso
        mensaje.textContent = datos.mensaje;

        // Guardar el token JWT
        localStorage.setItem(
            "token",
            datos.token
        );

        // Guardar los datos del usuario
        localStorage.setItem(
            "usuario",
            JSON.stringify(datos.usuario)
        );

        //Redirigir al perfil
             if (datos.usuario.rol === "admin") {

            // Administrador
            window.location.href = "admin-productos.html";

        } else {

            // Usuario normal
            window.location.href = "perfil.html";

        }


        // Mostrar información en consola
        console.log("Sesión iniciada correctamente");
        console.log("Token:", datos.token);
        console.log("Usuario:", datos.usuario);

    } catch (error) {

        console.error("Error:", error);

        mensaje.textContent =
            "No se pudo conectar con el servidor";
    }

});
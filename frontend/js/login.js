const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

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

        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);

        if (!respuesta.ok) {

            mensaje.textContent = datos.mensaje;

            return;
        }

        mensaje.textContent = datos.mensaje;

        console.log("Token:", datos.token);
        console.log("Usuario:", datos.usuario);

    } catch (error) {

        console.error("Error:", error);

        mensaje.textContent =
            "No se pudo conectar con el servidor";
    }

});
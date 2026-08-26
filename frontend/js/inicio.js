const token = localStorage.getItem("token");


// Verificar que exista un token
if (!token) {

    window.location.href = "index.html";

}


// Obtener información del usuario
function mostrarUsuario() {

    const usuarioGuardado =
        localStorage.getItem("usuario");


    if (!usuarioGuardado) {

        window.location.href = "index.html";

        return;

    }


    const usuario =
        JSON.parse(usuarioGuardado);


    // Verificar que NO sea administrador
    if (usuario.rol === "admin") {

        window.location.href =
            "dashboard.html";

        return;

    }


    // Mostrar nombre
    document.getElementById(
        "nombreUsuario"
    ).textContent =
        `Bienvenido, ${usuario.nombre}`;

}


// Botón ver productos
document.getElementById(
    "btnProductos"
).addEventListener(
    "click",
    () => {

        window.location.href =
            "productos.html";

    }
);


// Cerrar sesión
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


// Ejecutar
mostrarUsuario();
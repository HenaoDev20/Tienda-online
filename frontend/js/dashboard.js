const token = localStorage.getItem("token");



// VERIFICAR TOKEN


if (!token) {

    window.location.href = "index.html";

}


// OBTENER PERFIL

async function obtenerPerfil() {

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


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            localStorage.removeItem("token");

            window.location.href = "index.html";

            return;
        }


        // Verificar que sea administrador
        if (resultado.usuario.rol !== "admin") {

            window.location.href = "perfil.html";

            return;
        }


        // Mostrar nombre
        document.getElementById(
            "nombreAdministrador"
        ).textContent =
            `Bienvenido, ${resultado.usuario.nombre}`;


    } catch (error) {

        console.error(
            "Error obteniendo perfil:",
            error
        );

        localStorage.removeItem("token");

        window.location.href = "index.html";

    }

}


// CERRAR SESIÓN

const cerrarSesion =
    document.getElementById("cerrarSesion");


cerrarSesion.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href = "index.html";

    }
);


// PRODUCTOS

const btnProductos =
    document.getElementById("btnProductos");


btnProductos.addEventListener(
    "click",
    () => {

        window.location.href =
            "admin-productos.html";

    }
);


// PEDIDOS

const btnPedidos =
    document.getElementById("btnPedidos");


btnPedidos.addEventListener(
    "click",
    () => {

        alert(
            "El módulo de pedidos estará disponible próximamente."
        );

    }
);


// CLIENTES

const btnClientes =
    document.getElementById("btnClientes");


btnClientes.addEventListener(
    "click",
    () => {

        window.location.href =
            "clientes.html";

    }
);


// PAGOS

const btnPagos =
    document.getElementById("btnPagos");


btnPagos.addEventListener(
    "click",
    () => {

        alert(
            "El módulo de pagos estará disponible próximamente."
        );

    }
);

async function obtenerEstadisticas() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/dashboard",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const datos = await respuesta.json();


        if (!respuesta.ok) {

            console.error(
                "Error obteniendo estadísticas:",
                datos
            );

            return;
        }


        // Mostrar productos
        document.getElementById(
            "totalProductos"
        ).textContent = datos.productos;


        // Mostrar usuarios
        document.getElementById(
            "totalUsuarios"
        ).textContent = datos.usuarios;


    } catch (error) {

        console.error(
            "Error obteniendo estadísticas:",
            error
        );

    }

}


// EJECUTAR

obtenerPerfil();
obtenerEstadisticas();
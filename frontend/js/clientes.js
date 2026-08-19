const token = localStorage.getItem("token");


// Verificar que exista un token
if (!token) {

    window.location.href = "index.html";

}


// Obtener clientes
async function obtenerClientes() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/usuarios/clientes",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const resultado = await respuesta.json();


        // Verificar respuesta
        if (!respuesta.ok) {

            if (respuesta.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("usuario");

                window.location.href = "index.html";

                return;
            }


            if (respuesta.status === 403) {

                alert(
                    "No tienes permisos para acceder a esta página"
                );

                window.location.href = "perfil.html";

                return;
            }


            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener los clientes"
            );

        }


        console.log(
            "Clientes recibidos:",
            resultado
        );


        // Obtener contenedor
        const listaClientes =
            document.getElementById("listaClientes");


        // Limpiar mensaje de carga
        listaClientes.innerHTML = "";


        // Verificar si existen clientes
        if (
            !resultado.clientes ||
            resultado.clientes.length === 0
        ) {

            listaClientes.innerHTML = `
                <p>
                    No hay clientes registrados.
                </p>
            `;

            return;
        }


        // Crear cada cliente
        resultado.clientes.forEach(cliente => {

            const tarjeta =
                document.createElement("div");


            tarjeta.classList.add(
                "cliente"
            );


            tarjeta.innerHTML = `

                <h3>
                    ${cliente.nombre}
                </h3>

                <p>
                    <strong>
                        Correo:
                    </strong>

                    ${cliente.email}
                </p>

            `;


            listaClientes.appendChild(
                tarjeta
            );

        });


    } catch (error) {

        console.error(
            "Error obteniendo clientes:",
            error
        );


        document.getElementById(
            "listaClientes"
        ).innerHTML = `
            <p>
                No se pudieron cargar los clientes.
            </p>
        `;

    }

}


// Mostrar nombre del administrador
function mostrarAdministrador() {

    const usuario =
        localStorage.getItem("usuario");


    if (!usuario) {
        return;
    }


    const datosUsuario =
        JSON.parse(usuario);


    // Verificar que sea administrador
    if (datosUsuario.rol !== "admin") {

        window.location.href =
            "perfil.html";

        return;
    }


    document.getElementById(
        "nombreAdministrador"
    ).textContent =
        `Bienvenido, ${datosUsuario.nombre}`;

}


// Volver al dashboard
document.getElementById(
    "volverDashboard"
).addEventListener(
    "click",
    () => {

        window.location.href =
            "dashboard.html";

    }
);


// Cerrar sesión
document.getElementById(
    "cerrarSesion"
).addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href =
            "index.html";

    }
);


// Ejecutar
mostrarAdministrador();

obtenerClientes();
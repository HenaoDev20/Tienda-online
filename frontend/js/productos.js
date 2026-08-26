const token = localStorage.getItem("token");


// Verificar que exista un token
if (!token) {

    window.location.href = "index.html";

}


// Obtener productos
async function obtenerProductos() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/productos",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const resultado = await respuesta.json();


        // Verificar respuesta del servidor
        if (!respuesta.ok) {

            if (respuesta.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("usuario");

                window.location.href = "index.html";

                return;
            }


            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener los productos"
            );

        }


        console.log(
            "Productos recibidos:",
            resultado
        );


        // Obtener contenedor
        const listaProductos =
            document.getElementById("listaProductos");


        // Limpiar mensaje de carga
        listaProductos.innerHTML = "";


        // Verificar si existen productos
        if (
            !resultado.productos ||
            resultado.productos.length === 0
        ) {

            listaProductos.innerHTML = `
                <p>
                    No hay productos disponibles.
                </p>
            `;

            return;
        }


        // Recorrer productos
        resultado.productos.forEach(producto => {

            const tarjeta =
                document.createElement("article");


            tarjeta.classList.add(
                "producto"
            );


            tarjeta.innerHTML = `

                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    <strong>
                        Marca:
                    </strong>

                    ${producto.marca}
                </p>

                <p>
                    <strong>
                        Precio:
                    </strong>

                    $${producto.precio}
                </p>

                <p>
                    <strong>
                        Disponibles:
                    </strong>

                    ${producto.cantidad}
                </p>

            `;


            listaProductos.appendChild(
                tarjeta
            );

        });


    } catch (error) {

        console.error(
            "Error obteniendo productos:",
            error
        );


        document.getElementById(
            "listaProductos"
        ).innerHTML = `
            <p>
                No se pudieron cargar los productos.
            </p>
        `;

    }

}


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
obtenerProductos();
const token = localStorage.getItem("token");

let productoEditandoId = null;


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


        // Verificar respuesta del servidor
        if (!respuesta.ok) {

            if (respuesta.status === 401) {

                localStorage.removeItem("token");

                window.location.href = "index.html";

                return;
            }

            throw new Error("No se pudieron obtener los productos");
        }


        // Convertir respuesta a JSON
        const productos = await respuesta.json();

        console.log("Productos recibidos:", productos);


        // Obtener contenedor
        const listaProductos = document.getElementById("listaProductos");


        // Limpiar mensaje "Cargando productos..."
        listaProductos.innerHTML = "";


        // Recorrer productos
        productos.productos.forEach(producto => {

            const tarjeta = document.createElement("div");

            tarjeta.classList.add("producto");


            tarjeta.innerHTML = `
                
                <h3>${producto.nombre}</h3>

                <p>
                    <strong>Marca:</strong>
                    ${producto.marca}
                </p>

                <p>
                    <strong>Precio:</strong>
                    $${producto.precio}
                </p>

                <p>
                    <strong>Cantidad:</strong>
                    ${producto.cantidad}
                </p>

                <button 
                    class="btn-editar" 
                    data-id="${producto.id}">
                    Editar
                </button>

                <button 
                    class="btn-eliminar" 
                    data-id="${producto.id}">
                    Eliminar
                </button>

            `;


            // Agregar tarjeta al contenedor
            listaProductos.appendChild(tarjeta);

        });


        
        // BOTONES EDITAR
        

        const botonesEditar =
            document.querySelectorAll(".btn-editar");


        // Agregar evento a cada botón Editar
        botonesEditar.forEach(boton => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                editarProducto(id);

            });

        });


       
        // BOTONES ELIMINAR
      

        const botonesEliminar =
            document.querySelectorAll(".btn-eliminar");


        // Agregar evento a cada botón Eliminar
        botonesEliminar.forEach(boton => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                eliminarProducto(id);

            });

        });


    } catch (error) {

        console.error(
            "Error obteniendo productos:",
            error
        );

        document.getElementById("listaProductos").innerHTML = `
            <p>
                No se pudieron cargar los productos.
            </p>
        `;

    }

}



// EDITAR PRODUCTO


async function editarProducto(id) {

    try {

        const respuesta = await fetch(
            `http://localhost:3000/productos/${id}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo obtener el producto"
            );

            return;
        }


        const producto = resultado.producto;


        // Guardar ID del producto que estamos editando
        productoEditandoId = producto.id;


        // Cargar datos en el formulario
        document.getElementById("nombre").value =
            producto.nombre;

        document.getElementById("marca").value =
            producto.marca;

        document.getElementById("precio").value =
            producto.precio;

        document.getElementById("cantidad").value =
            producto.cantidad;

        document.getElementById("imagen").value =
            producto.imagen;


        // Cambiar texto del botón
        document.getElementById("btnGuardarProducto").textContent =
            "Guardar cambios";


        // Llevar al usuario al formulario
        document.getElementById("formProducto").scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Error obteniendo producto:",
            error
        );

        alert(
            "No se pudo obtener el producto"
        );

    }

}



// ELIMINAR PRODUCTO


async function eliminarProducto(id) {

    // Confirmar eliminación
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
    );


    // Si el usuario cancela
    if (!confirmar) {

        return;

    }


    try {

        const respuesta = await fetch(
            `http://localhost:3000/productos/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const resultado = await respuesta.json();


        console.log(
            "Respuesta del servidor:",
            resultado
        );


        // Verificar respuesta
        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "Error eliminando producto"
            );

            return;

        }


        // Mostrar mensaje
        alert(
            "Producto eliminado correctamente"
        );


        // Actualizar lista de productos
        obtenerProductos();


    } catch (error) {

        console.error(
            "Error eliminando producto:",
            error
        );

        alert(
            "No se pudo conectar con el servidor"
        );

    }

}



// FORMULARIO PRODUCTO


const formProducto =
    document.getElementById("formProducto");


formProducto.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const nombre =
            document.getElementById("nombre").value;

        const marca =
            document.getElementById("marca").value;

        const precio =
            document.getElementById("precio").value;

        const cantidad =
            document.getElementById("cantidad").value;

        const imagen =
            document.getElementById("imagen").value;


        const producto = {

            nombre,
            marca,
            precio,
            cantidad,
            imagen

        };


        try {

            let respuesta;


          
            // CREAR PRODUCTO
            

            if (productoEditandoId === null) {

                respuesta = await fetch(
                    "http://localhost:3000/productos",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify(producto)
                    }
                );

            }


            
            // ACTUALIZAR PRODUCTO
          

            else {

                respuesta = await fetch(
                    `http://localhost:3000/productos/${productoEditandoId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify(producto)
                    }
                );

            }


            const resultado = await respuesta.json();


            console.log(
                "Respuesta del servidor:",
                resultado
            );


            // Verificar respuesta
            if (!respuesta.ok) {

                alert(
                    resultado.mensaje ||
                    "Error guardando producto"
                );

                return;

            }


            
            // MENSAJE
            

            if (productoEditandoId === null) {

                alert(
                    "Producto creado correctamente"
                );

            } else {

                alert(
                    "Producto actualizado correctamente"
                );

            }


            // Limpiar formulario
            formProducto.reset();


            // Volver al modo crear
            productoEditandoId = null;


            // Restaurar texto del botón
            document
                .getElementById("btnGuardarProducto")
                .textContent = "Guardar producto";


            // Actualizar productos
            obtenerProductos();


        } catch (error) {

            console.error(
                "Error guardando producto:",
                error
            );

            alert(
                "No se pudo conectar con el servidor"
            );

        }

    }
);

//boton cerrar sesion
const cerrarSesion = document.getElementById("cerrarSesion");

cerrarSesion.addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location.href = "index.html";

});

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

            if (respuesta.status === 401) {

                localStorage.removeItem("token");

                window.location.href = "index.html";

                return;
            }

            throw new Error(
                "No se pudo obtener el perfil"
            );
        }


        console.log(
            "Perfil del administrador:",
            resultado
        );


        // Obtener elemento del HTML
        const nombreAdministrador =
            document.getElementById("nombreAdministrador");


        // Mostrar nombre
        nombreAdministrador.textContent =
            `Bienvenido, ${resultado.usuario.nombre}`;


    } catch (error) {

        console.error(
            "Error obteniendo perfil:",
            error
        );

        document.getElementById(
            "nombreAdministrador"
        ).textContent =
            "No se pudo cargar el administrador";

    }

}


// EJECUTAR AL CARGAR LA PÁGINA

obtenerPerfil();
obtenerProductos();
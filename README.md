# Tienda Online

Aplicación web de comercio electrónico construida con un **frontend en HTML/CSS/JavaScript puro** y un **backend en Node.js + Express**, con base de datos **PostgreSQL**. Incluye autenticación con JWT, control de roles (usuario y administrador), catálogo de productos, carrito de compras y gestión de pedidos.

---

## Tecnologías utilizadas

| Capa          | Tecnologías                                                              |
| ------------- | ------------------------------------------------------------------------ |
| **Backend**   | Node.js, Express 5, JSON Web Token (JWT), bcrypt, PostgreSQL (node-postgres) |
| **Frontend**  | HTML5, CSS3, JavaScript (vanilla / Fetch API)                            |
| **Herramientas de desarrollo** | Nodemon, dotenv, CORS                                        |

---

## Características actuales

### Autenticación y usuarios
- Registro de usuarios con contraseña encriptada mediante **bcrypt**.
- Inicio de sesión con generación de **token JWT** (expiración de 1 hora).
- Redirección automática según el **rol** del usuario (`admin` → panel de administración, `usuario` → inicio).
- Perfil de usuario que muestra nombre, email y el historial de pedidos.

### Control de roles
- Middleware de autenticación (`verificarToken`) que protege todas las rutas privadas.
- Middleware de autorización (`verificarAdmin`) que restringe las acciones administrativas únicamente al rol `admin`.

### Productos
- CRUD completo de productos (crear, listar, consultar por ID, actualizar y eliminar).
- Los endpoints de escritura están protegidos y son exclusivos para administradores.
- Panel de administración para gestionar el catálogo desde el navegador.

### Carrito de compras
- Carrito persistente en `localStorage` (agregar, aumentar, disminuir y eliminar productos).
- Verificación de **stock disponible** antes de aumentar cantidades.

### Pedidos
- Creación de pedidos con **transacciones SQL** (verificación de existencia, stock, cálculos de subtotal/total y actualización de inventario).
- Historial "Mis pedidos" para el usuario autenticado.
- Consulta de un pedido con sus detalle individuales.

### Dashboard administrativo
- Estadísticas generales (total de productos y usuarios registrados).
- Acceso directo a la gestión de productos y clientes.

---

## Estructura del proyecto

```
Tienda_Online/
├── backend/                     # API REST
│   ├── src/
│   │   ├── app.js               # Configuración de Express, CORS y rutas
│   │   ├── server.js            # Punto de entrada (puerto 3000)
│   │   ├── config/
│   │   │   └── database.js      # Pool de conexión a PostgreSQL
│   │   ├── controllers/         # Lógica de negocio
│   │   │   ├── dashboard.controller.js
│   │   │   ├── pedidos.controller.js
│   │   │   ├── productos.controller.js
│   │   │   └── usuarios.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # Verificación de token JWT
│   │   │   └── role.middleware.js   # Verificación de rol admin
│   │   └── routes/
│   │       ├── dashboard.routes.js
│   │       ├── pedidos.routes.js
│   │       ├── productos.routes.js
│   │       └── usuarios.routes.js
│   └── package.json
│
└── frontend/                    # Interfaz de usuario (multipágina)
    ├── *.html                   # Vistas (una página por módulo)
    ├── css/                     # Hojas de estilo por vista
    └── js/                      # Lógica del cliente (Fetch API)
```

---

## API REST (endpoints)

### Autenticación y usuarios — `/usuarios`
| Método | Ruta           | Acceso | Descripción                                    |
| ------ | -------------- | ------ | ---------------------------------------------- |
| POST   | `/`            | Público | Registrar un nuevo usuario                     |
| POST   | `/login`       | Público | Iniciar sesión y obtener un token JWT          |
| GET    | `/perfil`      | Usuario | Obtener los datos del usuario autenticado      |
| GET    | `/clientes`    | Admin   | Listar los clientes registrados                |

### Productos — `/productos`
| Método | Ruta        | Acceso | Descripción                     |
| ------ | ----------- | ------ | ------------------------------- |
| GET    | `/`         | Usuario | Listar todos los productos     |
| GET    | `/:id`      | Usuario | Obtener un producto por su ID  |
| POST   | `/`         | Admin   | Crear un producto              |
| PUT    | `/:id`      | Admin   | Actualizar un producto         |
| DELETE | `/:id`      | Admin   | Eliminar un producto           |

### Pedidos — `/pedidos`
| Método | Ruta          | Acceso | Descripción                          |
| ------ | ------------- | ------ | ------------------------------------ |
| POST   | `/`           | Usuario | Crear un pedido desde el carrito    |
| GET    | `/mis-pedidos`| Usuario | Obtener el historial del usuario    |
| GET    | `/:id`        | Usuario | Obtener un pedido con sus detalles  |

### Dashboard — `/dashboard`
| Método | Ruta | Acceso | Descripción                    |
| ------ | ---- | ------ | ------------------------------ |
| GET    | `/`  | Admin   | Estadísticas (productos y usuarios) |

> Todas las rutas protegidas exigen el encabezado `Authorization: Bearer <token>`.

---

## Modelo de datos

Las tablas utilizadas por el backend son las siguientes:

- **usuarios**: `id`, `nombre`, `email`, `password` (hash), `rol` (`admin` / `usuario`).
- **productos**: `id`, `nombre`, `marca`, `precio`, `cantidad` (stock), `imagen`.
- **pedidos**: `id`, `usuario_id`, `fecha`, `total`, `estado`.
- **detalle_pedido**: `id`, `pedido_id`, `producto_id`, `cantidad`, `precio`, `subtotal`.

---

## Configuración e instalación

### 1. Requisitos previos
- Node.js (versión reciente) y npm.
- PostgreSQL en ejecución con la base de datos creada.

### 2. Variables de entorno

Crea un archivo `.env` dentro de `backend/` con las siguientes variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tienda_online
DB_USER=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install
```

El frontend no requiere dependencias, funciona directamente en el navegador.

### 4. Levantar el servidor

```bash
cd backend
npm run dev
```

El servidor se ejecutará en `http://localhost:3000` y verificará la conexión a PostgreSQL al iniciar.

### 5. Abrir la aplicación

Sirve la carpeta `frontend/` desde un servidor estático (o ábrela directamente) y navega a `index.html` para iniciar sesión.

---

## Vistas del frontend

| Vista               | Ruta                  | Descripción                                     |
| ------------------- | --------------------- | ----------------------------------------------- |
| Iniciar sesión      | `index.html`          | Login con redirección según rol                 |
| Crear cuenta        | `registro.html`       | Registro de nuevos usuarios                     |
| Inicio              | `inicio.html`         | Página principal del cliente cuenta iniciada    |
| Productos           | `productos.html`      | Catálogo de productos con agregar al carrito    |
| Carrito             | `carrito.html`        | Carrito de compras y finalización de pedido     |
| Mi perfil           | `perfil.html`         | Datos del usuario y historial de pedidos        |
| Dashboard           | `dashboard.html`      | Panel administrativo con estadísticas           |
| Administrar productos | `admin-productos.html` | CRUD de productos (solo admin)               |
| Clientes            | `clientes.html`       | Lista de clientes registrados (solo admin)      |

---

## Estado del proyecto y próximos pasos

**Implementado:**
- [x] Módulo de autenticación con JWT.
- [x] Control de roles (usuario / admin).
- [x] CRUD de productos.
- [x] Carrito de compras.
- [x] Creación de pedidos con transacciones y descuento de stock.
- [x] Historial de pedidos por usuario.
- [x] Perfil de usuario.
- [x] Dashboard con estadísticas.
- [x] Listado de clientes.

**En desarrollo / pendiente:**
- [ ] Módulo de pedidos para administración (gestión de estados).
- [ ] Módulo de pagos.
- [ ] Sección de productos destacados en el inicio.
- [ ] Vista del lado del cliente de productos.
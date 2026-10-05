const parametros = new URLSearchParams(
    window.location.search
);

const token = parametros.get("token");

console.log(
    "Token recibido:",
    token
);

if (!token) {
    console.log("No se recibió ningún token");
} else {
    console.log("El token está disponible para enviarlo al backend");
}
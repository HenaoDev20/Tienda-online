function obtenerProductos(req, res){

    res.json([
        {
            id:1,
            nombre:"Laptop",
            precio:3500000
        },
        {
            id:2,
            nombre:"Mouse",
            precio:80000
        }
    ]);

}

function crearProducto(req, res) {

    const { nombre, precio } = req.body;

    console.log("Nombre:", nombre);
    console.log("Precio:", precio);

    res.json({
        mensaje: "Producto recibido correctamente",
        producto: {
            nombre,
            precio
        }
    });

}
module.exports = {
    obtenerProductos,
    crearProducto
};
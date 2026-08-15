require("dotenv").config();

const app = require("./app");

require("./config/database");

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
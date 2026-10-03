require("dotenv").config();

const app = require("./app");

require("./config/database");

const PORT = 3000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log("SERVIDOR CORRECTO EJECUTÁNDOSE");
    console.log("PUERTO:", PORT);
    console.log("=================================");
});
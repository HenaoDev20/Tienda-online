const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

pool.query("SELECT NOW()", (error, result) => {

    if (error) {
        console.error("Error conectando a PostgreSQL:", error);
        return;
    }

    console.log("Conexión exitosa a PostgreSQL");
    console.log("Fecha del servidor:", result.rows[0].now);
});

module.exports = pool;
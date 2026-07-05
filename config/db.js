const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "praktika_leto",
    password: "pena1488",
    port: 5432
});

module.exports = pool;
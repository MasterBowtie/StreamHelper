import mysql from "mysql2/promise"

export function buildDatabase() {
    const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
    });

    async function initialize() {
        const connection = await pool.getConnection();

        try {
            await connection.query("SELECT 1");
            console.log("Database connected");
        } finally {
            connection.release();
        }
    }

    async function close() {
        await pool.end();
    }


    return {
        initialize,
        close,
        pool,
    };
}

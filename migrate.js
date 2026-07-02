import fs from "fs";
import path from "path";
import mysql from "mysql2/promise"

const MIGRATIONS_DIR = "./server/database/migrations";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

async function getAppliedMigrations() {
    const [rows] = await pool.query(
        "SELECT filename FROM schema_migrations"
    );
    return new Set(rows.map(r => r.filename));
}

async function markAsApplied(filename) {
    await pool.query(
        `INSERT INTO schema_migrations (filename) VALUES (?)`,
        [filename]
    );
}

async function runMigration(file) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Running: ${file}`);

    await pool.query(sql);
    await markAsApplied(file);

    console.log(`Done: ${file}`);
}

async function main() {
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith(".sql"))
        .sort();
    
    const applied = await getAppliedMigrations();
        
    for (const file of files) {
        if (!applied.has(file)) {
            await runMigration(file);
        } else {
            console.log(`Skipping: ${file}`)
        }
    }

    console.log("All migrations complete.");
    process.exit(0);
}

main().catch(error => {
    console.error("Migration failed:");
    console.error(error);
    process.exit(1);
});
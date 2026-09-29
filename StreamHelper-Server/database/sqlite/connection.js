import { DatabaseSync } from "node:sqlite"

export function buildDatabase() {
    const databasePath = process.env.DB_PATH || "./data/streamhelper.db";
    const db = new DatabaseSync(databasePath, { enableForeignKeyConstraints: true}); 

    function initialize() {
        db.exec("SELECT 1");
        console.log(`SQLite database connected`)
    }

    function close() {
        db.close();
    }

    return {
        initialize,
        close,
        db,
    }
}
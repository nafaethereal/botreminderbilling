const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function runMigration() {
    let connection

    try {
        console.log("🔄 Connecting to MySQL...")

        // Koneksi ke MySQL (tanpa database tertentu dulu)
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            multipleStatements: true
        })

        console.log("✅ Connected to MySQL")

        // Baca file schema.sql
        const schemaPath = path.join(__dirname, "schema.sql")
        const schemaSql = fs.readFileSync(schemaPath, "utf8")

        console.log("📄 Running schema.sql...")
        await connection.query(schemaSql)
        console.log("✅ Schema created successfully!")

        // Tutup koneksi
        await connection.end()

        console.log("\n✨ Migration completed successfully!")
        console.log("\nDatabase: dummy_reminder")
        console.log("Tables created:")
        console.log("  - pelunasan (with reminder fields)")
        console.log("  - client_responses")
        console.log("\n5 dummy records inserted into pelunasan table")

    } catch (err) {
        console.error("❌ Migration failed:", err.message)
        if (connection) await connection.end()
        process.exit(1)
    }
}

runMigration()

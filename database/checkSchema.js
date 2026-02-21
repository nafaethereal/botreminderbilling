const mysql = require("mysql2/promise")

async function checkDatabase() {
    let connection

    try {
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "dummy_reminder"
        })

        console.log("✅ Connected to dummy_reminder")

        // Cek struktur tabel pelunasan
        const [columns] = await connection.query(`
      SHOW COLUMNS FROM pelunasan
    `)

        console.log("\n📋 Struktur tabel pelunasan:")
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Key: col.Key,
            Default: col.Default
        })))

        // Cek apakah tabel client_responses ada
        const [tables] = await connection.query(`
      SHOW TABLES LIKE 'client_responses'
    `)

        if (tables.length > 0) {
            console.log("\n✅ Tabel client_responses exists")

            const [respColumns] = await connection.query(`
        SHOW COLUMNS FROM client_responses
      `)

            console.log("\n📋 Struktur tabel client_responses:")
            console.table(respColumns.map(col => ({
                Field: col.Field,
                Type: col.Type
            })))
        } else {
            console.log("\n❌ Tabel client_responses NOT FOUND")
        }

        await connection.end()

    } catch (err) {
        console.error("❌ Error:", err.message)
        if (connection) await connection.end()
    }
}

checkDatabase()

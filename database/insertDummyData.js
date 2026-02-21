const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function insertDummyData() {
    let connection

    try {
        console.log("🔄 Connecting to database...")

        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "dummy_reminder",
            multipleStatements: true
        })

        console.log("✅ Connected to dummy_reminder database")

        // Baca file insert_dummy_data.sql
        const insertPath = path.join(__dirname, "insert_dummy_data.sql")
        const insertSql = fs.readFileSync(insertPath, "utf8")

        console.log("📄 Inserting dummy data...")
        await connection.query(insertSql)
        console.log("✅ Dummy data inserted successfully!")

        // Tutup koneksi
        await connection.end()

        console.log("\n✨ Done! Run 'node dbTest.js' to view the data")

    } catch (err) {
        console.error("❌ Insert failed:", err.message)
        if (connection) await connection.end()
        process.exit(1)
    }
}

insertDummyData()

const mysql = require("mysql2/promise")

async function alterPelunasanTable() {
    let connection

    try {
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "dummy_reminder",
            multipleStatements: true
        })

        console.log("✅ Connected to dummy_reminder")
        console.log("🔄 Adding new columns to pelunasan table...\n")

        // Tambah kolom satu per satu
        const alterStatements = [
            {
                name: "due_date",
                sql: "ALTER TABLE pelunasan ADD COLUMN due_date DATE NULL COMMENT 'Tanggal jatuh tempo pembayaran'"
            },
            {
                name: "last_reminder_sent",
                sql: "ALTER TABLE pelunasan ADD COLUMN last_reminder_sent DATETIME NULL COMMENT 'Waktu terakhir reminder dikirim'"
            },
            {
                name: "reminder_count",
                sql: "ALTER TABLE pelunasan ADD COLUMN reminder_count INT DEFAULT 0 COMMENT 'Jumlah reminder yang sudah dikirim'"
            },
            {
                name: "last_reminder_type",
                sql: "ALTER TABLE pelunasan ADD COLUMN last_reminder_type VARCHAR(10) NULL COMMENT 'Tipe reminder terakhir (H-7, H-3, H-1, H0, H+1, dll)'"
            },
            {
                name: "created_at",
                sql: "ALTER TABLE pelunasan ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu record dibuat'"
            },
            {
                name: "updated_at",
                sql: "ALTER TABLE pelunasan ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu terakhir diupdate'"
            }
        ]

        for (const stmt of alterStatements) {
            try {
                await connection.query(stmt.sql)
                console.log(`✅ Added column: ${stmt.name}`)
            } catch (err) {
                if (err.message.includes("Duplicate column name")) {
                    console.log(`⚠️  Column ${stmt.name} already exists, skipping...`)
                } else {
                    throw err
                }
            }
        }

        console.log("\n🔄 Adding indexes...")

        const indexStatements = [
            "ALTER TABLE pelunasan ADD INDEX idx_due_date (due_date)",
            "ALTER TABLE pelunasan ADD INDEX idx_status (status)",
            "ALTER TABLE pelunasan ADD INDEX idx_last_reminder_sent (last_reminder_sent)"
        ]

        for (const sql of indexStatements) {
            try {
                await connection.query(sql)
                console.log("✅ Index added")
            } catch (err) {
                if (err.message.includes("Duplicate key name")) {
                    console.log("⚠️  Index already exists, skipping...")
                } else {
                    throw err
                }
            }
        }

        await connection.end()

        console.log("\n✨ Migration completed successfully!")
        console.log("Run 'node database/checkSchema.js' to verify the changes")

    } catch (err) {
        console.error("\n❌ Migration failed:", err.message)
        if (connection) await connection.end()
        process.exit(1)
    }
}

alterPelunasanTable()

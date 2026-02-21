const mysql = require("mysql2/promise")

async function updateDueDates() {
    let connection

    try {
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "dummy_reminder"
        })

        console.log("✅ Connected to dummy_reminder")
        console.log("🔄 Updating due_date untuk testing reminder...\n")

        // Update due_date untuk berbagai skenario reminder
        const updates = [
            {
                website: "okosukses.com",
                due_date: "DATE_SUB(CURDATE(), INTERVAL 7 DAY)", // H-7 (sudah lewat 7 hari)
                desc: "H-7 (sudah lewat 7 hari - untuk test reminder H+7)"
            },
            {
                website: "kulinerhits.co",
                due_date: "DATE_SUB(CURDATE(), INTERVAL 3 DAY)", // H-3 (sudah lewat 3 hari)
                desc: "H-3 (sudah lewat 3 hari - untuk test reminder H+3)"
            },
            {
                website: "travelceria.net",
                due_date: "DATE_SUB(CURDATE(), INTERVAL 1 DAY)", // H-1 (kemarin)
                desc: "H-1 (kemarin - untuk test reminder H+1)"
            },
            {
                website: "pelanjamurah.store",
                due_date: "CURDATE()", // H0 (hari ini)
                desc: "H0 (hari ini - jatuh tempo)"
            },
            {
                website: "asadesain.id",
                due_date: "DATE_ADD(CURDATE(), INTERVAL 30 DAY)", // H+30 (masih lama)
                desc: "H+30 (masih 30 hari lagi - tidak akan dapat reminder)"
            }
        ]

        for (const update of updates) {
            await connection.query(
                `UPDATE pelunasan 
         SET due_date = ${update.due_date},
             last_reminder_sent = NULL,
             reminder_count = 0,
             last_reminder_type = NULL
         WHERE nama_website = ?`,
                [update.website]
            )
            console.log(`✅ ${update.website}: ${update.desc}`)
        }

        console.log("\n📊 Current data:")
        const [rows] = await connection.query(`
      SELECT 
        nama_website,
        nomor_telepon,
        status,
        due_date,
        DATEDIFF(due_date, CURDATE()) AS selisih_hari,
        last_reminder_sent,
        reminder_count
      FROM pelunasan
      WHERE status = 'menunggu_pembayaran'
      ORDER BY due_date ASC
    `)

        console.table(rows)

        await connection.end()

        console.log("\n✨ Done! Sekarang jalankan bot dengan: node index.js")
        console.log("Bot akan langsung kirim reminder untuk record dengan due_date yang sudah lewat atau hari ini")

    } catch (err) {
        console.error("❌ Error:", err.message)
        if (connection) await connection.end()
        process.exit(1)
    }
}

updateDueDates()

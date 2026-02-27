const db = require('../db');

async function addClient() {
    try {
        const query = `
      INSERT INTO pelunasan (nama_website, nomor_telepon, paket, harga_renewal, status, due_date, created_at)
      VALUES (?, ?, ?, ?, ?, CURDATE(), NOW())
    `;
        const values = ['Client Baru', '6285710383098', 'hemat', 750000, 'menunggu_pembayaran'];

        const [result] = await db.query(query, values);
        console.log(`✅ New client added with ID: ${result.insertId}`);

        // Check if it will be picked up today
        const [check] = await db.query(`
      SELECT nama_website, nomor_telepon, due_date, DATEDIFF(due_date, CURDATE()) as diff 
      FROM pelunasan WHERE id = ?
    `, [result.insertId]);

        console.log("Verification Data:", JSON.stringify(check[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding client:", err);
        process.exit(1);
    }
}

addClient();

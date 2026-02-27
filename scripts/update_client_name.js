const db = require('../db');

async function updateClient() {
    try {
        const query = `
      UPDATE pelunasan SET nama_website = ? WHERE nomor_telepon = ?
    `;
        const values = ['yusniastore.com', '6285710383098'];

        const [result] = await db.query(query, values);
        console.log(`✅ Client updated. Affected rows: ${result.affectedRows}`);

        // Verification
        const [check] = await db.query(`
      SELECT nama_website, nomor_telepon FROM pelunasan WHERE nomor_telepon = ?
    `, ['6285710383098']);

        console.log("Updated Data:", JSON.stringify(check[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating client:", err);
        process.exit(1);
    }
}

updateClient();

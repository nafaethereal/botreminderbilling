/**
 * Run database migration for admin payment confirmation feature.
 * - Adds paid_amount, remaining_amount to pelunasan
 * - Creates pending_confirmations table
 */
const db = require('../db')

async function migrate() {
    try {
        // 1. Add paid_amount column
        try {
            await db.query(`ALTER TABLE pelunasan ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Jumlah yang sudah dibayar'`)
            console.log('✅ Added: paid_amount')
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('⏭️  Skipped: paid_amount (already exists)')
            else throw e
        }

        // 2. Add remaining_amount column
        try {
            await db.query(`ALTER TABLE pelunasan ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Sisa tagihan yang belum dibayar'`)
            console.log('✅ Added: remaining_amount')
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('⏭️  Skipped: remaining_amount (already exists)')
            else throw e
        }

        // 3. Create pending_confirmations table
        await db.query(`
      CREATE TABLE IF NOT EXISTS pending_confirmations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor_telepon_client VARCHAR(20) NOT NULL COMMENT 'Nomor telepon client yang mengirim transfer',
        nama_website VARCHAR(255) NOT NULL COMMENT 'Nama website/klien',
        jumlah_transfer DECIMAL(10,2) DEFAULT 0 COMMENT 'Nominal transfer yang dideteksi AI (0 jika tidak terdeteksi)',
        harga_renewal DECIMAL(10,2) DEFAULT 0 COMMENT 'Total tagihan client',
        is_valid TINYINT(1) DEFAULT 0 COMMENT 'Apakah bukti transfer valid menurut AI',
        awaiting_amount TINYINT(1) DEFAULT 0 COMMENT 'Bot menunggu admin mengetikkan nominal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL COMMENT 'Konfirmasi hangus setelah waktu ini',
        INDEX idx_nomor (nomor_telepon_client),
        INDEX idx_nama_website (nama_website)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
        console.log('✅ Created: pending_confirmations table')

        console.log('\n🎉 Migration completed!')
    } catch (err) {
        console.error('❌ Migration failed:', err.message)
    } finally {
        process.exit()
    }
}

migrate()

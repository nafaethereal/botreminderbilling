/**
 * Format angka ke format Rupiah dengan pemisah ribuan
 * Contoh: 1200000 -> "Rp 1.200.000"
 */
function formatRupiah(amount) {
    // Pastikan amount adalah number
    const num = typeof amount === 'string' ? parseInt(amount) : amount

    // Format dengan pemisah ribuan
    return `Rp ${num.toLocaleString('id-ID')}`
}

module.exports = { formatRupiah }

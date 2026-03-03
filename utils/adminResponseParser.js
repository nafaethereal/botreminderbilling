/**
 * Parse jawaban admin untuk konfirmasi pembayaran.
 * 
 * Opsi jawaban admin:
 *   "sudah"  → { type: 'sudah' }
 *   "belum"  → { type: 'belum' }
 *   "250000" → { type: 'amount', amount: 250000 }  (saat bot meminta nominal manual)
 *   lainnya  → { type: 'unknown' }
 */
function parseAdminResponse(text) {
    const normalized = text.trim().toLowerCase()

    if (normalized === 'sudah' || normalized === 'ya' || normalized === 'iya') {
        return { type: 'sudah' }
    }

    if (normalized === 'belum' || normalized === 'tidak' || normalized === 'blm') {
        return { type: 'belum' }
    }

    // Cek apakah admin mengetikkan angka (nominal saat AI gagal deteksi)
    const numMatch = normalized.replace(/[.,\s]/g, '').match(/^\d+$/)
    if (numMatch) {
        const amount = parseInt(numMatch[0], 10)
        if (amount > 0) {
            return { type: 'amount', amount }
        }
    }

    return { type: 'unknown' }
}

module.exports = { parseAdminResponse }

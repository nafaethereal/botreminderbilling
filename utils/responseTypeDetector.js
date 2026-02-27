/**
 * Deteksi tipe balasan klien berdasarkan kata kunci
 */

function detectResponseType(messageText) {
    const text = messageText.toLowerCase()

    // Kategori 1: Stop Berlangganan
    const stopKeywords = [
        'stop', 'berhenti', 'tidak lanjut', 'ga lanjut', 'cancel',
        'tutup', 'nonaktif', 'matikan', 'putus'
    ]
    if (stopKeywords.some(keyword => text.includes(keyword))) {
        return 'stop_berlangganan'
    }

    // Kategori 2: Janji Bayar / Nanti / Besok
    const promiseKeywords = [
        'nanti', 'besok', 'iya nanti', 'nanti saya tf', 'sebentar lagi',
        'tunggu', 'segera', 'akan bayar', 'bakal bayar', 'gajian', 'dana cair',
        'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu',
        'tgl', 'tanggal', 'habis dzuhur', 'nanti siang', 'nanti sore', 'nanti malam'
    ]
    if (promiseKeywords.some(keyword => text.includes(keyword))) {
        return 'janji_bayar'
    }

    // Kategori 3: Konfirmasi Pembayaran (sudah bayar)
    const paymentKeywords = [
        'sudah bayar', 'udah bayar', 'dah bayar', 'sdh bayar', 'saya bayar',
        'sudah transfer', 'udah transfer', 'sdh transfer', 'saya transfer',
        'sudah tf', 'udah tf', 'dah tf', 'sdh tf', 'saya tf', 'done', 'beres',
        'lunas', 'bukti', 'struk', 'berhasil kirim', 'terkirim', 'sent', 'sudah ya', 'udah ya'
    ]
    if (paymentKeywords.some(keyword => text.includes(keyword))) {
        return 'konfirmasi_bayar'
    }

    // Kategori 4: Kendala / Masalah / Komplain
    const complaintKeywords = [
        'kendala', 'masalah', 'keluhan', 'error', 'bantuan', 'tolong',
        'perlu bantuan', 'ada masalah', 'rusak', 'tidak bisa', 'ga bisa',
        'gangguan', 'bermasalah', 'mahal', 'keberatan', 'komplain',
        'limit', 'saldo', 'atm jauh', 'mbanking', 'm-banking', 'token'
    ]
    if (complaintKeywords.some(keyword => text.includes(keyword))) {
        return 'kendala'
    }

    // Kategori 5: Minta Perpanjangan Waktu (resmi)
    const extensionKeywords = [
        'perpanjang', 'extend', 'tambah waktu', 'minta waktu',
        'belum bisa', 'minggu depan', 'bulan depan', 'tunda'
    ]
    if (extensionKeywords.some(keyword => text.includes(keyword))) {
        return 'minta_perpanjangan'
    }

    // Kategori 6: Konfirmasi Sederhana
    const confirmKeywords = [
        'ok', 'oke', 'baik', 'siap', 'terima kasih', 'thanks', 'makasih',
        'noted', 'mengerti', 'paham', 'iya', 'yoi', 'sip', 'mantap'
    ]
    if (confirmKeywords.some(keyword => text.includes(keyword))) {
        return 'konfirmasi'
    }

    // Kategori 7: Pertanyaan
    const questionKeywords = [
        '?', 'bagaimana', 'gimana', 'kapan', 'berapa', 'apa', 'kenapa',
        'cara', 'bisa', 'boleh', 'apakah', 'tanya', 'mau tanya', 'brp',
        'mana', 'kah', 'norek', 'no rek', 'total', 'biaya', 'diskon', 'promo', 'rekening'
    ]
    if (questionKeywords.some(keyword => text.includes(keyword))) {
        return 'pertanyaan'
    }

    // Default: Umum
    return 'umum'
}

module.exports = { detectResponseType }

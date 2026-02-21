/**
 * Format tanggal ke format Indonesia
 * Contoh: "Selasa, 12 Februari 2026"
 */

function formatToIndonesianDate(dateInput) {
    // Konversi input ke Date object
    const date = new Date(dateInput)

    // Nama hari dalam Bahasa Indonesia
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

    // Nama bulan dalam Bahasa Indonesia
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const dayName = days[date.getDay()]
    const day = date.getDate()
    const monthName = months[date.getMonth()]
    const year = date.getFullYear()

    return `${dayName}, ${day} ${monthName} ${year}`
}

module.exports = { formatToIndonesianDate }

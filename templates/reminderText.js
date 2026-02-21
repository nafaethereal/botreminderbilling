/**
 * Template pesan reminder untuk billing bot
 */

const { formatRupiah } = require('../utils/currencyFormatter')

function getReminderText(clientName, dueDate, service, amount, daysDiff) {
  // Format amount ke Rupiah
  const formattedAmount = formatRupiah(amount)
  if (daysDiff === 7) {
    return `Halo kak 👋 ${clientName},
Perkenalkan, kami dari CV. Vodeco Digital Mediatama ingin mengingatkan secara awal terkait tagihan layanan ${service} sebesar ${formattedAmount}, yang akan jatuh tempo pada ${dueDate} (7 hari lagi).

Pengingat ini kami kirimkan lebih awal agar Kakak memiliki waktu yang cukup untuk mempersiapkan pembayarannya dengan nyaman 😊

📌 *Informasi Pembayaran:*
*BCA* : 3624500500
A.N *Vodeco Digital Mediatama*

*Mandiri* : 1390001188113
A.N *Vodeco Digital Mediatama*

Jika Kakak sudah memiliki rencana pembayaran di tanggal tertentu atau membutuhkan informasi tambahan, silakan hubungi kami kapan saja.

Terima kasih atas kepercayaan Kakak menggunakan layanan kami 🙏
Salam hangat,
CV. Vodeco Digital Mediatama`
  }

  if (daysDiff === 3) {
    return `Halo ${clientName},

Kami dari CV. Vodeco Digital Mediatama ingin mengingatkan kembali terkait tagihan layanan ${service} sebesar ${formattedAmount}, yang akan jatuh tempo dalam 3 hari, yaitu pada ${dueDate}.

Pesan ini kami sampaikan sebagai pengingat agar tidak terlewat 😊

📌 *Informasi Pembayaran:*
*BCA* : 3624500500
A.N *Vodeco Digital Mediatama*

*Mandiri* : 1390001188113
A.N *Vodeco Digital Mediatama*

Apabila pembayaran sudah dilakukan, mohon abaikan pesan ini ya Kak.
Namun jika masih ada kendala atau pertanyaan terkait pembayaran maupun layanan, kami siap membantu.

Terima kasih atas kerja samanya 🙏`
  }

  if (daysDiff === 1) {
    return `Halo ${clientName},

Kami dari CV. Vodeco Digital Mediatama ingin menginformasikan bahwa tagihan layanan ${service} sebesar ${formattedAmount} akan jatuh tempo besok (${dueDate}).

Pengingat ini kami kirimkan untuk membantu Kakak agar jadwal pembayaran tidak terlewat.

📌 *Informasi Pembayaran:*
*BCA* : 3624500500
A.N *Vodeco Digital Mediatama*

*Mandiri* : 1390001188113
A.N *Vodeco Digital Mediatama*

Jika pembayaran sudah dilakukan, kami ucapkan terima kasih 🙏
Apabila Kakak membutuhkan detail pembayaran atau ada kendala tertentu, silakan hubungi kami.

Terima kasih atas perhatiannya ya Kak 😊
CV. Vodeco Digital Mediatama`
  }

  if (daysDiff === 0) {
    return `Halo ${clientName},

Kami dari CV. Vodeco Digital Mediatama ingin mengingatkan bahwa hari ini (${dueDate}) merupakan tanggal jatuh tempo untuk tagihan layanan ${service}, dengan total ${formattedAmount}.

📌 *Informasi Pembayaran:*
*BCA* : 3624500500
A.N *Vodeco Digital Mediatama*

*Mandiri* : 1390001188113
A.N *Vodeco Digital Mediatama*

Jika Kakak sudah melakukan pembayaran hari ini, kami ucapkan terima kasih banyak 🙏
Namun apabila belum, kami sangat menghargai jika pembayaran dapat dilakukan hari ini agar layanan dapat terus berjalan dengan lancar.

Jika ada kendala atau membutuhkan bantuan, jangan ragu untuk menghubungi kami ya 😊
Hormat kami,
CV. Vodeco Digital Mediatama`
  }

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff)
    return `Halo ${clientName},

Kami dari CV. Vodeco Digital Mediatama ingin menginformasikan bahwa hingga hari ini, pembayaran untuk layanan ${service} sebesar ${formattedAmount}, yang jatuh tempo pada ${dueDate}, masih belum kami terima.

Pesan ini kami sampaikan dengan itikad baik untuk membantu Kakak melakukan pengecekan.

📌 *Informasi Pembayaran:*
*BCA* : 3624500500
A.N *Vodeco Digital Mediatama*

*Mandiri* : 1390001188113
A.N *Vodeco Digital Mediatama*

Apabila pembayaran sebenarnya sudah dilakukan, mohon konfirmasi agar kami dapat segera melakukan pengecekan di sistem 🙏

Jika Kakak mengalami kendala atau membutuhkan waktu tambahan, silakan komunikasikan kepada kami. Kami sangat terbuka untuk berdiskusi dan mencari solusi terbaik 😊

Terima kasih atas perhatian dan kerja samanya.
Hormat kami,
CV. Vodeco Digital Mediatama`
  }

  return null
}

module.exports = { getReminderText }

/**
 * Template pesan reminder untuk billing bot
 */

const { formatRupiah } = require('../utils/currencyFormatter')

const companyName = process.env.COMPANY_NAME || "CV. Vodeco Digital Mediatama";
const bankBca = (process.env.BANK_BCA_INFO || "*BCA* : 3624500500\nA.N *Vodeco Digital Mediatama*").replace(/\\n/g, '\n');
const bankMandiri = (process.env.BANK_MANDIRI_INFO || "*Mandiri* : 1390001188113\nA.N *Vodeco Digital Mediatama*").replace(/\\n/g, '\n');

function getReminderText(clientName, dueDate, service, totalAmount, daysDiff, paidAmount = 0, remainingAmount = null) {
  // Determine actual amount to show
  const actualAmount = (remainingAmount !== null && remainingAmount > 0) ? remainingAmount : totalAmount;
  const formattedAmount = formatRupiah(actualAmount);
  const isPartial = (paidAmount > 0 && remainingAmount > 0);
  const totalText = isPartial ? ` (sisa dari total ${formatRupiah(totalAmount)})` : "";
  if (daysDiff === 7) {
    return `Halo ${clientName},
Perkenalkan, kami dari ${companyName} ingin mengingatkan secara awal terkait tagihan layanan ${service} sebesar ${formattedAmount}${totalText}, yang akan jatuh tempo pada ${dueDate} (7 hari lagi).

Pengingat ini kami kirimkan lebih awal agar Kakak memiliki waktu yang cukup untuk mempersiapkan pembayarannya dengan nyaman 😊

📌 *Informasi Pembayaran:*
${bankBca}

${bankMandiri}

Jika Kakak sudah memiliki rencana pembayaran di tanggal tertentu atau membutuhkan informasi tambahan, silakan hubungi kami kapan saja.

Terima kasih atas kepercayaan Kakak menggunakan layanan kami 🙏
Salam hangat,
${companyName}`
  }

  if (daysDiff === 3) {
    return `Halo ${clientName},

Kami dari ${companyName} ingin mengingatkan kembali terkait tagihan layanan ${service} sebesar ${formattedAmount}${totalText}, yang akan jatuh tempo dalam 3 hari, yaitu pada ${dueDate}.

Pesan ini kami sampaikan sebagai pengingat agar tidak terlewat 😊

📌 *Informasi Pembayaran:*
${bankBca}

${bankMandiri}

Apabila pembayaran sudah dilakukan, mohon abaikan pesan ini ya Kak.
Namun jika masih ada kendala atau pertanyaan terkait pembayaran maupun layanan, kami siap membantu.

Terima kasih atas kerja samanya 🙏`
  }

  if (daysDiff === 1) {
    return `Halo ${clientName},

Kami dari ${companyName} ingin menginformasikan bahwa tagihan layanan ${service} sebesar ${formattedAmount}${totalText} akan jatuh tempo besok (${dueDate}).

Pengingat ini kami kirimkan untuk membantu Kakak agar jadwal pembayaran tidak terlewat.

📌 *Informasi Pembayaran:*
${bankBca}

${bankMandiri}

Jika pembayaran sudah dilakukan, kami ucapkan terima kasih 🙏
Apabila Kakak membutuhkan detail pembayaran atau ada kendala tertentu, silakan hubungi kami.

Terima kasih atas perhatiannya ya Kak 😊
${companyName}`
  }

  if (daysDiff === 0) {
    return `Halo ${clientName},

Kami dari ${companyName} ingin mengingatkan bahwa hari ini (${dueDate}) merupakan tanggal jatuh tempo untuk tagihan layanan ${service}, dengan total ${formattedAmount}${totalText}.

📌 *Informasi Pembayaran:*
${bankBca}

${bankMandiri}

Jika Kakak sudah melakukan pembayaran hari ini, kami ucapkan terima kasih banyak 🙏
Namun apabila belum, kami sangat menghargai jika pembayaran dapat dilakukan hari ini agar layanan dapat terus berjalan dengan lancar.

Jika ada kendala atau membutuhkan bantuan, jangan ragu untuk menghubungi kami ya 😊
Hormat kami,
${companyName}`
  }

  if (daysDiff < 0) {
    return `Halo ${clientName},

Kami dari ${companyName} ingin menginformasikan bahwa hingga hari ini, pembayaran untuk layanan ${service} sebesar ${formattedAmount}${totalText}, yang jatuh tempo pada ${dueDate}, masih belum kami terima.

Pesan ini kami sampaikan dengan itikad baik untuk membantu Kakak melakukan pengecekan.

📌 *Informasi Pembayaran:*
${bankBca}

${bankMandiri}

Apabila pembayaran sebenarnya sudah dilakukan, mohon konfirmasi agar kami dapat segera melakukan pengecekan di sistem 🙏

Jika Kakak mengalami kendala atau membutuhkan waktu tambahan, silakan komunikasikan kepada kami. Kami sangat terbuka untuk berdiskusi dan mencari solusi terbaik 😊

Terima kasih atas perhatian dan kerja samanya.
Hormat kami,
${companyName}`
  }

  return null
}

module.exports = { getReminderText }

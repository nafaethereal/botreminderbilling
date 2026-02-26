const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Menganalisis gambar untuk menentukan apakah itu bukti transfer bank.
 * @param {Buffer} buffer - Buffer gambar
 * @param {string} mimeType - Tipe MIME gambar (misal: 'image/jpeg')
 * @returns {Promise<boolean>} - True jika bukti transfer, false jika bukan.
 */
async function isTransferProof(buffer, mimeType) {
    try {
        const prompt = `Analisis gambar ini secara SANGAT KETAT seolah-olah Anda adalah mesin pemeriksa data.

Tujuan: Memverifikasi BUKTI TRANSFER BANK untuk "Vodeco Digital Mediatama".

Kriteria Wajib (SEMUA HARUS TERPENUHI):
1. Nama Penerima: Harus tertulis "Vodeco" atau "Vodeco Digital Mediatama".
   - **PERINGATAN KERAS**: Ejaan harus TEPAT (V-O-D-E-C-O). 
   - JIKA tertulis "Wodeco" (dengan 'W'), "Vodeko" (dengan 'k'), atau variasi ejaan lainnya, MAKA NYATAKAN SEBAGAI TIDAK. Jangan memberikan toleransi terhadap kesalahan ejaan sedikitpun.
2. Nomor Rekening Tujuan: Harus sesuai dengan salah satu dari:
   - 3624500500 (BCA)
   - 1390001188113 (Mandiri)
3. Status Transaksi: Harus 'Berhasil', 'Sukses', 'Selesai', atau 'Berhasil Terkirim'.
4. Tipe Transaksi: Harus Transfer Bank.
   - TOLAK/TIDAK jika gambar adalah: Isi Pulsa, Beli Token Listrik, Top-up E-wallet (OVO, Dana, dll), atau transfer ke rekening SELAIN yang disebutkan di atas.

Jawab hanya dengan satu kata: "YA" (jika semua kriteria tepat terpenuhi) atau "TIDAK" (jika ada salah satu saja yang meleset atau salah eja).`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType
                },
            },
        ]);

        const response = await result.response;
        const text = response.text().trim().toUpperCase();

        console.log(`🤖 AI Decision for Vodeco Proof: ${text}`);
        return text.includes("YA");
    } catch (error) {
        console.error("❌ AI Validation Error:", error.message);
        // Jika AI error, kita default ke true agar tidak melewatkan bukti penting (amanah)
        return true;
    }
}

module.exports = { isTransferProof };

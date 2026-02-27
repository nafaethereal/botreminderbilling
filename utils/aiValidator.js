const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Menganalisis gambar untuk menentukan apakah itu bukti transfer bank.
 * @param {Buffer} buffer - Buffer gambar
 * @param {string} mimeType - Tipe MIME gambar (misal: 'image/jpeg')
 * @returns {Promise<{isValid: boolean, reason: string, amount: number | null, isUnrelated: boolean}>} - Status, alasan, jumlah, dan apakah tidak terkait.
 */
async function isTransferProof(buffer, mimeType) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = `Analisis gambar ini secara SANGAT KETAT seolah-olah Anda adalah mesin pemeriksa data.

Tujuan: Memverifikasi BUKTI TRANSFER BANK untuk "Vodeco Digital Mediatama".

Kriteria Wajib (SEMUA HARUS TERPENUHI):
1. Nama Penerima: Harus tertulis "Vodeco" atau "Vodeco Digital Mediatama".
   - **PERINGATAN KERAS**: Ejaan harus TEPAT (V-O-D-E-C-O). 
   - JIKA tertulis "Wodeco" (dengan 'W'), "Vodeko" (dengan 'k'), atau variasi ejaan lainnya, MAKA NYATAKAN SEBAGAI TIDAK.
2. Nomor Rekening Tujuan: Harus sesuai dengan salah satu dari:
   - 3624500500 (BCA)
   - 1390001188113 (Mandiri)
3. Status Transaksi: Harus 'Berhasil', 'Sukses', 'Selesai', atau 'Berhasil Terkirim'.
4. Tipe Transaksi: Harus Transfer Bank.
   - TOLAK jika gambar adalah: Isi Pulsa, Beli Token Listrik, Top-up E-wallet (OVO, Dana, dll), atau transfer ke rekening SELAIN yang disebutkan di atas.

Klasifikasi Gambar:
- "YA": Gambar ADALAH bukti transfer bank yang valid dan memenuhi semua kriteria.
- "TIDAK": Gambar ADALAH dokumen transaksi keuangan (struk ATM, m-banking, struk mutasi) TAPI gagal memenuhi kriteria (misal: nama penerima bukan Vodeco, rekening salah, atau status gagal).
- "UNRELATED": Gambar SAMA SEKALI BUKAN dokumen transaksi keuangan. Contoh: Tangkapan layar game (Mobile Legends, dll), foto wajah, pemandangan, makanan, meme, atau chat biasa.

Tugas Tambahan: Ekstrak jumlah nominal (angka saja) yang ditransfer jika statusnya "YA".

Format Jawaban: [YA/TIDAK/UNRELATED]; [Alasan singkat]; [Jumlah Nominal Angka Saja atau 0]
Contoh: YA; Bukti m-banking sesuai; 1500000
Contoh: TIDAK; Struk ATM tapi nama penerima bukan Vodeco; 0
Contoh: UNRELATED; Tangkapan layar game; 0`;

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
            const text = response.text().trim();
            const parts = text.split(';');

            const status = (parts[0] || "").trim().toUpperCase();
            const reason = (parts[1] || "").trim() || "Tidak ada alasan spesifik.";
            let amount = null;

            if (parts[2]) {
                const rawAmount = parts[2].replace(/[^0-9]/g, '');
                amount = rawAmount ? parseInt(rawAmount) : null;
            }

            console.log(`🤖 AI Decision (Attempt ${attempt}): ${status} | Reason: ${reason} | Amount: ${amount}`);

            return {
                isValid: status.includes("YA"),
                isUnrelated: status.includes("UNRELATED"),
                reason: reason,
                amount: amount
            };
        } catch (error) {
            lastError = error;
            console.error(`⚠️ Attempt ${attempt} failed: ${error.message}`);

            if (attempt < maxRetries) {
                const waitTime = attempt * 2000; // 2s, 4s, 6s...
                console.log(`📡 Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // Final Fail-safe after all retries
    console.error("❌ All AI validation attempts failed.");
    return {
        isValid: true,
        isUnrelated: false,
        reason: `Terjadi kesalahan pada AI setelah ${maxRetries} percobaan (${lastError?.message}). (Sistem default ke valid).`,
        amount: null
    };
}

module.exports = { isTransferProof };

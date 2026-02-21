const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")

const db = require("./db")
const { sendSafe } = require("./rateLimit")
const { getReminderText } = require("./templates/reminderText")
const { formatToIndonesianDate } = require("./utils/dateFormatter")

// ===== GLOBAL STATE =====
let sock = null
let isConnected = false
let reminderInterval = null
let isReminderRunning = false // lock supaya tidak jalan paralel
const lidToPhoneMap = {} // mapping LID -> nomor telepon

// ===== LOAD LID MAPPINGS FROM DATABASE =====
async function loadLidMappings() {
  try {
    // Buat tabel kalau belum ada
    await db.query(`
      CREATE TABLE IF NOT EXISTS lid_mapping (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lid VARCHAR(50) NOT NULL UNIQUE,
        nomor_telepon VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lid (lid),
        INDEX idx_nomor_telepon (nomor_telepon)
      )
    `)

    const [rows] = await db.query('SELECT lid, nomor_telepon FROM lid_mapping')
    for (const row of rows) {
      lidToPhoneMap[row.lid] = row.nomor_telepon
    }
    console.log(chalk.green(`📎 Loaded ${rows.length} LID mapping(s) from database`))
  } catch (err) {
    console.error(chalk.red('❌ Failed to load LID mappings:'), err.message)
  }
}

// ===== SAVE LID MAPPING TO DATABASE =====
async function saveLidMapping(lid, nomorTelepon) {
  try {
    await db.query(
      `INSERT INTO lid_mapping (lid, nomor_telepon) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE nomor_telepon = VALUES(nomor_telepon), updated_at = NOW()`,
      [lid, nomorTelepon]
    )
  } catch (err) {
    console.error(chalk.red('❌ Failed to save LID mapping:'), err.message)
  }
}

async function startBot() {
  console.log(chalk.blue("🚀 Starting WhatsApp Bot"))

  // Load LID mappings dari database supaya persist antar restart
  await loadLidMappings()

  const { state, saveCreds } = await useMultiFileAuthState("./LenwySesi")

  sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["BillingBot", "Chrome", "1.0.0"]
  })

  // simpan session
  sock.ev.on("creds.update", saveCreds)

  // ===== CONNECTION / QR =====
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log(chalk.yellow("📱 Scan QR WhatsApp - QR Code akan tetap ditampilkan sampai berhasil di-scan"))
      console.log(chalk.cyan("Tip: Perbesar terminal untuk melihat QR code dengan lebih jelas"))
      qrcode.generate(qr, { small: false })
    }

    if (connection === "open") {
      console.log(chalk.green("✔ WhatsApp Connected"))
      isConnected = true

      // mulai reminder HANYA SEKALI
      if (!reminderInterval) {
        console.log(chalk.cyan("⏱ Starting reminder loop"))
        startReminderLoop()
      }
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
      const reason = lastDisconnect?.error?.output?.statusCode || 'unknown'

      console.log(chalk.red("❌ Disconnected (stop reminder)"))
      console.log(chalk.yellow(`Reason: ${reason}`))
      console.log(chalk.yellow(`Should reconnect: ${shouldReconnect}`))

      isConnected = false

      // hentikan reminder kalau koneksi putus
      if (reminderInterval) {
        clearInterval(reminderInterval)
        reminderInterval = null
      }

      // Auto reconnect jika bukan error 401 (logout)
      if (shouldReconnect) {
        console.log(chalk.cyan("🔄 Reconnecting in 5 seconds..."))
        setTimeout(() => startBot(), 5000)
      } else {
        console.log(chalk.red("⚠️ Logged out. Please delete LenwySesi folder and restart."))
      }
    }
  })

  // ===== HANDLE INCOMING MESSAGES (SAVE CLIENT RESPONSES) =====
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    // PENTING: Abaikan pesan dari bot sendiri!
    if (msg.key.fromMe) return

    const messageType = Object.keys(msg.message)[0]
    if (messageType === 'protocolMessage' || messageType === 'senderKeyDistributionMessage') {
      return
    }

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // Ekstrak nomor telepon (handle @s.whatsapp.net DAN @lid)
    let senderId = from.replace("@s.whatsapp.net", "").replace("@lid", "")
    const isLidFormat = from.endsWith("@lid")

    const logToFile = (msg) => {
      const fs = require('fs');
      const timestamp = new Date().toISOString();
      fs.appendFileSync('debug.log', `[${timestamp}] ${msg}\n`);
      console.log(msg);
    }

    logToFile(`\n📨 Incoming message from: ${senderId} (Raw: ${from}, LID: ${isLidFormat})`)
    if (text) logToFile(`📝 Message text: ${text.substring(0, 100)}`)

    // Simpan balasan klien ke database
    if (text && isConnected) {
      try {
        // Auto-detect response type
        const { detectResponseType } = require('./utils/responseTypeDetector')
        const responseType = detectResponseType(text)

        // Coba cari client di database
        let matchedClient = null
        let resolvedPhone = senderId

        // STEP 1: Kalau ini format LID, cek mapping dulu (memory + database)
        if (isLidFormat) {
          if (lidToPhoneMap[senderId]) {
            resolvedPhone = lidToPhoneMap[senderId]
            logToFile(`📎 LID ${senderId} mapped to phone (memory): ${resolvedPhone}`)
          } else {
            // Fallback: cek di database
            try {
              const [lidRows] = await db.query(
                'SELECT nomor_telepon FROM lid_mapping WHERE lid = ?',
                [senderId]
              )
              if (lidRows.length > 0) {
                resolvedPhone = lidRows[0].nomor_telepon
                lidToPhoneMap[senderId] = resolvedPhone // simpan ke memory juga
                logToFile(`📎 LID ${senderId} mapped to phone (database): ${resolvedPhone}`)
              }
            } catch (dbErr) {
              logToFile(`⚠️ Failed to lookup LID in database: ${dbErr.message}`)
            }
          }
        }

        // STEP 2: Normalisasi nomor HP
        let phoneNumber0 = resolvedPhone
        if (resolvedPhone.startsWith('62')) {
          phoneNumber0 = '0' + resolvedPhone.substring(2)
        }
        let phoneNumber62 = resolvedPhone
        if (resolvedPhone.startsWith('0')) {
          phoneNumber62 = '62' + resolvedPhone.substring(1)
        }

        // STEP 3: Cari di database pelunasan
        const [clients] = await db.query(
          "SELECT nama_website, nomor_telepon FROM pelunasan WHERE nomor_telepon IN (?, ?, ?)",
          [resolvedPhone, phoneNumber0, phoneNumber62]
        )

        if (clients.length > 0) {
          matchedClient = clients[0]
          logToFile(`✅ Client found: ${matchedClient.nama_website}`)
        } else {
          logToFile(`⚠️ No client match for ${resolvedPhone} (LID: ${isLidFormat})`)
        }

        // STEP 4: SIMPAN SEMUA pesan (matched atau tidak)
        const namaWebsite = matchedClient ? matchedClient.nama_website : `UNKNOWN_${senderId}`
        const [saveResult] = await db.query(
          `INSERT INTO client_responses 
          (nama_website, nomor_telepon, message_text, response_type, received_at) 
          VALUES (?, ?, ?, ?, NOW())`,
          [namaWebsite, resolvedPhone, text, responseType]
        )

        logToFile(`💬 Response saved [${responseType}] from ${namaWebsite}. ID: ${saveResult.insertId}`)

      } catch (err) {
        logToFile(`❌ Error saving client response: ${err.message}`)
        console.error(err.stack)
      }
    }

    // Manual test (PING)
    if (text.toLowerCase() === "ping" && isConnected) {
      await sendSafe(sock, from, { text: "pong 🏓 bot aktif" })
    }
  })
}

// ===== REMINDER LOOP (AMAN) =====
async function checkAndSendReminders() {
  if (!isConnected) return
  if (isReminderRunning) {
    console.log(chalk.gray("⏳ Previous reminder cycle still running, skipping..."))
    return
  }

  isReminderRunning = true
  try {
    console.log(chalk.cyan("🔍 Checking for pending reminders..."))

    const [rows] = await db.query(`
      SELECT *,
      DATEDIFF(due_date, CURDATE()) AS diff
      FROM pelunasan
      WHERE status = 'menunggu_pembayaran'
        AND due_date IS NOT NULL
        AND (last_reminder_sent IS NULL OR DATE(last_reminder_sent) < CURDATE())
        AND (DATEDIFF(due_date, CURDATE()) IN (7, 3, 1, 0) OR DATEDIFF(due_date, CURDATE()) < 0)
    `)
    if (!rows.length) {
      console.log(chalk.gray("📭 No pending reminders right now."))
      return
    }

    console.log(chalk.yellow(`📋 Found ${rows.length} client(s) to remind`))

    for (const row of rows) {
      if (!isConnected) break

      // format tanggal ke format Indonesia
      const formattedDate = formatToIndonesianDate(row.due_date)

      // gunakan template dari reminderText.js
      const text = getReminderText(row.nama_website, formattedDate, row.paket, row.harga_renewal, row.diff)

      if (!text) continue

      const jid = `${row.nomor_telepon}@s.whatsapp.net`

      // kirim HANYA saat koneksi siap
      const sendResult = await sendSafe(sock, jid, { text })

      // Simpan LID mapping jika ada (untuk tracking balasan)
      if (sendResult && sendResult.key && sendResult.key.remoteJid) {
        const replyJid = sendResult.key.remoteJid
        if (replyJid.endsWith('@lid')) {
          const lid = replyJid.replace('@lid', '')
          lidToPhoneMap[lid] = row.nomor_telepon
          await saveLidMapping(lid, row.nomor_telepon) // persist ke database!
          console.log(chalk.cyan(`📎 LID mapped & saved: ${lid} -> ${row.nomor_telepon}`))
        }
      }

      // Update tracking fields
      await db.query(
        `UPDATE pelunasan 
        SET last_reminder_sent = NOW(), 
            reminder_count = reminder_count + 1,
            last_reminder_type = ?,
            updated_at = NOW()
        WHERE nama_website = ?`,
        [`H${row.diff >= 0 ? '+' : ''}${row.diff}`, row.nama_website]
      )

      console.log(chalk.green(`📤 Reminder sent to ${row.nama_website} (H${row.diff >= 0 ? '+' : ''}${row.diff})`))
    }
  } catch (err) {
    console.error("❌ Reminder error:", err.message)
  } finally {
    isReminderRunning = false
  }
}

function startReminderLoop() {
  // Langsung cek pertama kali (jangan tunggu 60 detik)
  checkAndSendReminders()

  // Lalu cek setiap 60 detik
  reminderInterval = setInterval(checkAndSendReminders, 60_000)
}


// ===== START =====
startBot()

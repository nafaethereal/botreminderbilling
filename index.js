const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require("@whiskeysockets/baileys")

const fs = require("fs")
const path = require("path")
const pino = require("pino")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")

const db = require("./db")
const { sendSafe } = require("./rateLimit")
const { getReminderText } = require("./templates/reminderText")
const { formatToIndonesianDate } = require("./utils/dateFormatter")
const { detectResponseType } = require('./utils/responseTypeDetector')
const { isTransferProof } = require('./utils/aiValidator')

// ===== GLOBAL STATE =====
let sock = null
let isConnected = false
let reminderInterval = null
let isReminderRunning = false
let isInitialized = false // Flag untuk satu kali init
let waVersion = null
const lidToPhoneMap = {}

// ===== LOAD LID MAPPINGS =====
async function loadLidMappings() {
  try {
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

    // Hanya log pertama kali
    if (!isInitialized) {
      console.log(chalk.green(`📎 Loaded ${rows.length} LID mapping(s) from database`))
    }
  } catch (err) {
    console.error(chalk.red('❌ Failed to load LID mappings:'), err.message)
  }
}

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
  // 1. One-time Initialization
  if (!isInitialized) {
    console.log(chalk.blue("🚀 Starting WhatsApp Bot"))
    await loadLidMappings()
    const { version } = await fetchLatestBaileysVersion()
    waVersion = version
    console.log(chalk.cyan(`📡 WA Version: v${waVersion.join('.')}`))
    isInitialized = true
  }

  const { state, saveCreds } = await useMultiFileAuthState("./session-data")

  sock = makeWASocket({
    version: waVersion,
    logger: pino({ level: "silent" }),
    auth: state,
    syncFullHistory: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log(chalk.yellow("📱 Scan QR WhatsApp..."))
      qrcode.generate(qr, { small: false })
    }

    if (connection === "open") {
      if (!isConnected) {
        console.log(chalk.green("✔ WhatsApp Connected"))
        isConnected = true
        if (!reminderInterval) startReminderLoop()
      }
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const isLogout = [401, 405].includes(statusCode)

      isConnected = false

      if (!isLogout) {
        // Silent reconnect tanpa log startup lagi
        setTimeout(() => startBot(), 5000)
      } else {
        console.log(chalk.red(`❌ Connection Error (${statusCode}). Please delete "./session-data" and restart.`))
      }
    }
  })

  // ===== INCOMING MESSAGES =====
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const imageMsg = msg.message.imageMessage
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.buttonsResponseMessage?.selectedButtonId || imageMsg?.caption || ""

    // Always log incoming messages for visibility
    console.log(chalk.gray(`📥 Incoming message from ${from}: "${text.length > 50 ? text.substring(0, 50) + '...' : text}" ${imageMsg ? '[IMAGE]' : ''}`))

    let senderId = from.replace("@s.whatsapp.net", "").replace("@lid", "")
    const isLidFormat = from.endsWith("@lid")

    try {
      let resolvedPhone = senderId
      let namaWebsite = "UNKNOWN"

      // Resolve Phone from LID
      if (isLidFormat) {
        if (lidToPhoneMap[senderId]) {
          resolvedPhone = lidToPhoneMap[senderId]
        } else {
          const [lidRows] = await db.query('SELECT nomor_telepon FROM lid_mapping WHERE lid = ?', [senderId])
          if (lidRows.length > 0) {
            resolvedPhone = lidRows[0].nomor_telepon
            lidToPhoneMap[senderId] = resolvedPhone
          }
        }
      }

      // Find Client Name
      const [clients] = await db.query(
        "SELECT nama_website FROM pelunasan WHERE nomor_telepon IN (?, ?, ?)",
        [resolvedPhone, resolvedPhone.startsWith('62') ? '0' + resolvedPhone.substring(2) : resolvedPhone, resolvedPhone.startsWith('0') ? '62' + resolvedPhone.substring(1) : resolvedPhone]
      )

      if (clients.length > 0) namaWebsite = clients[0].nama_website
      else if (namaWebsite === "UNKNOWN") namaWebsite = `UNKNOWN_${senderId}`

      // IF IMAGE RECEIVED (POTENTIAL TRANSFER PROOF)
      if (imageMsg) {
        console.log(chalk.bgMagenta.white.bold(` 📸 Media Received `))
        console.log(chalk.magenta(`    ├─ From     : ${resolvedPhone}`))
        console.log(chalk.magenta(`    ├─ Web      : ${namaWebsite}`))
        console.log(chalk.magenta(`    └─ Downloading for AI check...`))

        try {
          const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
            logger: pino({ level: 'silent' }),
            reuploadRequest: sock.updateMediaMessage
          })

          // AI VALIDATION
          const mimeType = imageMsg.mimetype || 'image/jpeg'
          const isValid = await isTransferProof(buffer, mimeType)

          if (isValid) {
            // Ensure the 'transfers' directory exists
            const transfersDir = path.join(__dirname, 'transfers');
            if (!fs.existsSync(transfersDir)) {
              fs.mkdirSync(transfersDir);
            }

            const fileName = `proof_${resolvedPhone}_${Date.now()}.jpg`
            const filePath = path.join(transfersDir, fileName)
            fs.writeFileSync(filePath, buffer)

            // Save to transfer proofs table
            await db.query(
              `INSERT INTO client_transfer_proofs (nomor_telepon, nama_website, file_path, caption) VALUES (?, ?, ?, ?)`,
              [resolvedPhone, namaWebsite, filePath, text]
            )

            console.log(chalk.green(`    ✅ AI Verified: Valid Transfer Proof. Saved to transfers/`))
          } else {
            console.log(chalk.yellow(`    🗑️ AI Rejected: Invalid Proof. Storing for review...`))

            // Ensure the 'transfers/invalid' directory exists
            const invalidDir = path.join(__dirname, 'transfers', 'invalid');
            if (!fs.existsSync(invalidDir)) {
              fs.mkdirSync(invalidDir, { recursive: true });
            }

            const fileName = `invalid_${resolvedPhone}_${Date.now()}.jpg`
            const filePath = path.join(invalidDir, fileName)
            fs.writeFileSync(filePath, buffer)

            // Save to invalid transfer proofs table
            await db.query(
              `INSERT INTO invalid_transfer_proofs (nomor_telepon, nama_website, file_path, caption) VALUES (?, ?, ?, ?)`,
              [resolvedPhone, namaWebsite, filePath, text]
            )
            console.log(chalk.red(`    📁 Saved to transfers/invalid/${fileName}`))
          }
        } catch (downloadErr) {
          console.error(chalk.red(`    ❌ Failed to process media: ${downloadErr.message}`))
        }
      }

      // IF TEXT RECEIVED (NORMAL RESPONSE)
      if (text && !imageMsg) {
        const responseType = detectResponseType(text)

        // HIGH VISIBILITY LOG
        console.log(chalk.bgMagenta.white.bold(` 📩 New Reply `))
        console.log(chalk.magenta(`    ├─ Client   : ${resolvedPhone}`))
        console.log(chalk.magenta(`    ├─ Website  : ${namaWebsite}`))
        console.log(chalk.magenta(`    ├─ Category : [${responseType}]`))
        console.log(chalk.magenta(`    └─ Message  : "${text}"`))
        console.log("")

        // Save to database
        await db.query(
          `INSERT INTO client_responses (nama_website, nomor_telepon, message_text, response_type, received_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [namaWebsite, resolvedPhone, text, responseType]
        )
      }

    } catch (err) {
      console.error(chalk.red("❌ Error processing message:"), err.message)
    }

    if (text.toLowerCase() === "ping") await sendSafe(sock, from, { text: "pong 🏓" })
  })
}

async function checkAndSendReminders() {
  if (!isConnected || isReminderRunning) return
  isReminderRunning = true
  try {
    console.log(chalk.cyan("🔍 Checking for pending reminders..."))
    const [rows] = await db.query(`
      SELECT *, DATEDIFF(due_date, CURDATE()) AS diff FROM pelunasan
      WHERE status = 'menunggu_pembayaran' AND due_date IS NOT NULL
        AND (last_reminder_sent IS NULL OR DATE(last_reminder_sent) < CURDATE())
        AND DATEDIFF(due_date, CURDATE()) IN (7, 3, 1, 0, -3)
    `)

    if (!rows.length) {
      console.log(chalk.gray("📭 No pending reminders."))
      return
    }

    for (const row of rows) {
      const text = getReminderText(row.nama_website, formatToIndonesianDate(row.due_date), row.paket, row.harga_renewal, row.diff)
      const sendResult = await sendSafe(sock, `${row.nomor_telepon}@s.whatsapp.net`, { text })

      if (sendResult?.key?.remoteJid?.endsWith('@lid')) {
        const lid = sendResult.key.remoteJid.replace('@lid', '')
        lidToPhoneMap[lid] = row.nomor_telepon
        await saveLidMapping(lid, row.nomor_telepon)
      }

      await db.query(
        `UPDATE pelunasan SET last_reminder_sent = NOW(), reminder_count = reminder_count + 1, last_reminder_type = ?, updated_at = NOW() WHERE nama_website = ?`,
        [`H${row.diff >= 0 ? '+' : ''}${row.diff}`, row.nama_website]
      )
      console.log(chalk.green(`📤 Reminder sent to ${row.nama_website} (H${row.diff})`))
    }
  } catch (err) {
    // console.error("❌ Reminder error:", err.message)
  } finally {
    isReminderRunning = false
  }
}

function startReminderLoop() {
  checkAndSendReminders()
  reminderInterval = setInterval(checkAndSendReminders, 60_000)
}

startBot()

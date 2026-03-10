require("dotenv").config()

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
const { parseAdminResponse } = require('./utils/adminResponseParser')

// ===== GLOBAL STATE =====
let sock = null
let isConnected = false
let reminderInterval = null
let isReminderRunning = false
let isInitialized = false // Flag untuk satu kali init
let waVersion = null
const lidToPhoneMap = {}
const sentMessageMap = {} // Track sent reminder: { messageId: phoneNumber }
const adminNumber = `${process.env.ADMIN_NUMBER}@s.whatsapp.net`

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

    await db.query(`
      CREATE TABLE IF NOT EXISTS unrelated_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor_telepon VARCHAR(20) NOT NULL,
        nama_website VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        caption TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      } else {
        // Re-open without being previously closed (Baileys quirk)
        console.log(chalk.blue("ℹ WhatsApp Connection Re-synced"))
      }
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason = lastDisconnect?.error?.message || "Unknown reason"
      const isLogout = [401, 405].includes(statusCode)

      if (isConnected) {
        console.log(chalk.yellow(`📡 Connection Closed: ${reason} (Status: ${statusCode})`))
      }

      isConnected = false

      if (!isLogout) {
        // Silent reconnect tanpa log startup lagi
        console.log(chalk.gray("🔄 Reconnecting in 5s..."))
        setTimeout(() => startBot(), 5000)
      } else {
        console.log(chalk.red(`❌ Connection Error (${statusCode}). Please delete "./session-data" and restart.`))
      }
    }
  })

  // ===== CAPTURE LID FROM CONTACTS EVENTS =====
  sock.ev.on('contacts.update', (contacts) => {
    for (const contact of contacts) {
      if (contact.id?.endsWith('@lid') && contact.name) {
        console.log(chalk.cyan(`📎 contacts.update: LID=${contact.id}, name=${contact.name}`))
      }
    }
  })

  sock.ev.on('contacts.upsert', (contacts) => {
    for (const contact of contacts) {
      if (contact.id?.endsWith('@lid')) {
        console.log(chalk.cyan(`📎 contacts.upsert: LID=${contact.id}, name=${contact.notify || contact.name || 'unknown'}`))
      }
    }
  })

  // ===== CAPTURE LID FROM MESSAGE STATUS UPDATES (delivered/read) =====
  sock.ev.on('messages.update', (updates) => {
    for (const update of updates) {
      const remoteJid = update.key?.remoteJid
      const msgId = update.key?.id
      if (remoteJid?.endsWith('@lid') && msgId && sentMessageMap[msgId]) {
        const lid = remoteJid.replace('@lid', '')
        if (!lidToPhoneMap[lid]) {
          const phone = sentMessageMap[msgId]
          lidToPhoneMap[lid] = phone
          saveLidMapping(lid, phone)
          console.log(chalk.green(`📎 messages.update: Mapped LID ${lid} → ${phone}`))
          delete sentMessageMap[msgId]
        }
      }
    }
  })

  sock.ev.on('message-receipt.update', (updates) => {
    for (const update of updates) {
      const remoteJid = update.key?.remoteJid
      const msgId = update.key?.id
      if (remoteJid?.endsWith('@lid') && msgId && sentMessageMap[msgId]) {
        const lid = remoteJid.replace('@lid', '')
        if (!lidToPhoneMap[lid]) {
          const phone = sentMessageMap[msgId]
          lidToPhoneMap[lid] = phone
          saveLidMapping(lid, phone)
          console.log(chalk.green(`📎 message-receipt: Mapped LID ${lid} → ${phone}`))
          delete sentMessageMap[msgId]
        }
      }
    }
  })

  // ===== INCOMING MESSAGES =====
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    // Capture LID mapping from bot's own sent messages
    if (msg.key.fromMe) {
      const remoteJid = msg.key.remoteJid
      if (remoteJid?.endsWith('@lid')) {
        const lid = remoteJid.replace('@lid', '')
        // Cek apakah message ID ini ada di sentMessageMap
        const msgId = msg.key.id
        if (sentMessageMap[msgId] && !lidToPhoneMap[lid]) {
          const phone = sentMessageMap[msgId]
          lidToPhoneMap[lid] = phone
          saveLidMapping(lid, phone)
          delete sentMessageMap[msgId]
          console.log(chalk.green(`📎 fromMe: Mapped LID ${lid} → ${phone}`))
        }
      }
      return
    }

    const from = msg.key.remoteJid

    // FILTER: Ignore Status WA, Group Messages, and Bot's own number
    if (from === 'status@broadcast' || from.endsWith('@g.us')) {
      // console.log(chalk.gray(`🔇 DEBUG: Ignored broadcast/group: ${from}`))
      return
    }

    // Ignore messages from the bot's own number
    const botNumber = sock.user?.id?.replace(/:\d+@/, '@') || ''
    if (from === botNumber) {
      // console.log(chalk.gray(`🔇 DEBUG: Ignored own number: ${from}`))
      return
    }

    // ===== HANDLER: Admin Reply for Payment Confirmation =====
    // Resolve sender's phone number to handle both @s.whatsapp.net and @lid formats
    const adminPhone = adminNumber.replace('@s.whatsapp.net', '')
    const senderPhone = from.includes('@lid') ? (lidToPhoneMap[from.replace('@lid', '')] || null) : from.replace('@s.whatsapp.net', '')
    const isAdmin = senderPhone === adminPhone
    console.log(chalk.cyan(`🔍 DEBUG: from=${from}, senderPhone=${senderPhone}, adminPhone=${adminPhone}, isAdmin=${isAdmin}`))

    if (isAdmin) {
      const adminText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
      console.log(`👮 Admin message detected from ${from}: "${adminText}"`)
      if (!adminText && !msg.message?.imageMessage) return // Only ignore if truly empty and NOT an image

      // Resolve the quoted message ID (if admin replied to a specific message)
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.buttonsResponseMessage?.contextInfo || null
      const quotedStanzaId = contextInfo?.stanzaId || null

      // Check for a pending confirmation (Prefer matching quotedStanzaId, fall back to latest)
      let pending = null
      if (quotedStanzaId) {
        const [matchedRows] = await db.query(
          'SELECT * FROM pending_confirmations WHERE last_notify_msg_id = ? LIMIT 1',
          [quotedStanzaId]
        )
        if (matchedRows.length > 0) pending = matchedRows[0]
      }

      if (!pending) {
        const [latestRows] = await db.query(
          'SELECT * FROM pending_confirmations ORDER BY created_at DESC LIMIT 1'
        )
        if (latestRows.length > 0) pending = latestRows[0]
      }

      if (pending) {
        const parsed = parseAdminResponse(adminText)

        // Case A: Awaiting specific amount (from previous interaction)
        if (pending.awaiting_amount === 1) {
          if (parsed.type === 'amount') {

            const nominal = Number(parsed.amount || 0)
            const namaWeb = pending.nama_website

            const [rows] = await db.query(
              'SELECT paid_amount, harga_renewal FROM pelunasan WHERE nama_website = ?',
              [namaWeb]
            )
            if (rows.length > 0) {

              const currentPaid = Number(rows[0].paid_amount || 0)
              const harga = Number(rows[0].harga_renewal || 0)

              const newPaid = currentPaid + nominal
              const newRemaining = harga - newPaid > 0 ? harga - newPaid : 0

              const newStatus = newRemaining === 0 ? 'sudah_bayar' : 'kurang_bayar'
              const isComplete = newRemaining === 0 ? 1 : 0
              await db.query(
                `UPDATE pelunasan 
         SET paid_amount = ?,
             remaining_amount = ?,
             status = ?,
             is_complete = ?,
             updated_at = NOW() 
         WHERE nama_website = ?`,
                [newPaid, newRemaining, newStatus, isComplete, namaWeb]
              )
            }
            // Fetch final state for notification
            const [updated] = await db.query('SELECT harga_renewal, paid_amount, remaining_amount, status FROM pelunasan WHERE nama_website = ?', [namaWeb])

            if (updated.length > 0) {
              const final = updated[0]
              const formattedNominal = nominal.toLocaleString('id-ID')
              const formattedTotal = parseFloat(final.paid_amount).toLocaleString('id-ID')
              const formattedHarga = parseFloat(final.harga_renewal).toLocaleString('id-ID')
              const formattedSisa = parseFloat(final.remaining_amount).toLocaleString('id-ID')

              if (final.status === 'sudah_bayar') {
                await sendSafe(sock, from, { text: `✅ *Status Diperbarui: LUNAS*\n\n🏢 Client: ${namaWeb}\n💵 Transfer Baru: Rp ${formattedNominal}\n💰 Total Dibayar: Rp ${formattedTotal}\n✔ Pembayaran penuh terkonfirmasi.` })
              } else {
                await sendSafe(sock, from, { text: `⚠️ *Status Diperbarui: KURANG BAYAR*\n\n🏢 Client: ${namaWeb}\n💵 Transfer Baru: Rp ${formattedNominal}\n💰 Total Dibayar: Rp ${formattedTotal}\n📉 Tagihan: Rp ${formattedHarga}\n🔴 Sisa Tagihan: Rp ${formattedSisa}` })
              }
            }

            await db.query('DELETE FROM pending_confirmations WHERE id = ?', [pending.id])
            console.log(chalk.green(`✅ Admin provided amount ${nominal} for ${namaWeb}`))
            return
          }
        }

        // Case B: Final Confirmation (Sudah/Belum)
        if (pending.awaiting_amount === 0) {
          if (parsed.type === 'sudah') {
            const nominal = parseFloat(pending.jumlah_transfer)
            const namaWeb = pending.nama_website

            // Edge case: AI did not detect amount
            if (nominal === 0) {
              await db.query('UPDATE pending_confirmations SET awaiting_amount = 1 WHERE id = ?', [pending.id])
              await sendSafe(sock, from, { text: `🔢 Nominal tidak terdeteksi dari bukti transfer *${namaWeb}*.\n\nBerapa jumlah yang sudah masuk? (ketik angka, contoh: 500000)` })
              console.log(chalk.yellow(`⚠️ AI amount=0 for ${namaWeb}, asking admin for amount`))
              return
            }

            // 1. Fetch current state
            const [rows] = await db.query('SELECT paid_amount, harga_renewal FROM pelunasan WHERE nama_website = ?', [namaWeb])
            if (rows.length > 0) {
              const currentPaid = parseFloat(rows[0].paid_amount || 0)
              const harga = parseFloat(rows[0].harga_renewal || 0)
              const newPaid = currentPaid + nominal
              const newRemaining = Math.max(0, harga - newPaid)
              const newStatus = newPaid >= harga ? 'sudah_bayar' : 'kurang_bayar'
              const isComplete = newPaid >= harga ? 1 : 0

              // 2. Update with calculated values
              await db.query(
                `UPDATE pelunasan 
                 SET paid_amount = ?,
                     remaining_amount = ?,
                     status = ?,
                     is_complete = ?,
                     updated_at = NOW() 
                 WHERE nama_website = ?`,
                [newPaid, newRemaining, newStatus, isComplete, namaWeb]
              )
            }

            // Fetch final state for notification
            const [updated] = await db.query('SELECT harga_renewal, paid_amount, remaining_amount, status FROM pelunasan WHERE nama_website = ?', [namaWeb])

            if (updated.length > 0) {
              const final = updated[0]
              const formattedNominal = nominal.toLocaleString('id-ID')
              const formattedTotal = parseFloat(final.paid_amount).toLocaleString('id-ID')
              const formattedHarga = parseFloat(final.harga_renewal).toLocaleString('id-ID')
              const formattedSisa = parseFloat(final.remaining_amount).toLocaleString('id-ID')

              if (final.status === 'sudah_bayar') {
                await sendSafe(sock, from, { text: `✅ *Status Diperbarui: LUNAS*\n\n🏢 Client: ${namaWeb}\n💵 Transfer: Rp ${formattedNominal}\n💰 Total Dibayar: Rp ${formattedTotal}\n✔ Pembayaran penuh terkonfirmasi.` })
              } else {
                await sendSafe(sock, from, { text: `⚠️ *Status Diperbarui: KURANG BAYAR*\n\n🏢 Client: ${namaWeb}\n💵 Transfer: Rp ${formattedNominal}\n💰 Total Dibayar: Rp ${formattedTotal}\n📉 Tagihan: Rp ${formattedHarga}\n🔴 Sisa Tagihan: Rp ${formattedSisa}` })
              }
            }

            await db.query('DELETE FROM pending_confirmations WHERE id = ?', [pending.id])
            console.log(chalk.green(`✅ Admin confirmed payment for ${namaWeb}`))
            return

          } else if (parsed.type === 'belum') {
            await db.query('DELETE FROM pending_confirmations WHERE id = ?', [pending.id])
            await sendSafe(sock, from, { text: `📋 Dicatat. Status *${pending.nama_website}* tetap menunggu pembayaran.` })
            console.log(chalk.yellow(`⚠️ Admin confirmed NOT received for ${pending.nama_website}`))
            return
          }
          // If type is 'unknown', fall through (admin sent something else)
        }
      }
    }
    // ===== END ADMIN HANDLER =====

    const imageMsg = msg.message.imageMessage
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.buttonsResponseMessage?.selectedButtonId || imageMsg?.caption || ""

    let senderId = from.replace("@s.whatsapp.net", "").replace("@lid", "")
    const isLidFormat = from.endsWith("@lid")

    try {
      let resolvedPhone = senderId
      let namaWebsite = ""
      let hasHistory = false

      // 1. Resolve Phone & Check History from LID
      if (isLidFormat) {
        if (lidToPhoneMap[senderId]) {
          resolvedPhone = lidToPhoneMap[senderId]
          hasHistory = true
        } else {
          const [lidRows] = await db.query('SELECT nomor_telepon FROM lid_mapping WHERE lid = ?', [senderId])
          if (lidRows.length > 0) {
            resolvedPhone = lidRows[0].nomor_telepon
            lidToPhoneMap[senderId] = resolvedPhone
            hasHistory = true
          } else {
            // LID tidak ada di mapping — coba resolve dari contextInfo (reply ke reminder)
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || null
            const quotedStanzaId = contextInfo?.stanzaId

            if (quotedStanzaId && sentMessageMap[quotedStanzaId]) {
              // Client membalas reminder kita! Match LID dari stanzaId
              resolvedPhone = sentMessageMap[quotedStanzaId]
              lidToPhoneMap[senderId] = resolvedPhone
              await saveLidMapping(senderId, resolvedPhone)
              delete sentMessageMap[quotedStanzaId]
              hasHistory = true
              console.log(chalk.green(`📎 Resolved LID from reply: ${senderId} → ${resolvedPhone}`))
            } else {
              // Last resort: cek apakah hanya ada 1 client yang belum punya LID mapping
              const [unmapped] = await db.query(`
                SELECT p.nomor_telepon, p.nama_website FROM pelunasan p 
                WHERE p.status IN ('menunggu_pembayaran', 'kurang_bayar')
                  AND p.nomor_telepon NOT IN (SELECT nomor_telepon FROM lid_mapping)
              `)
              if (unmapped.length === 1) {
                resolvedPhone = unmapped[0].nomor_telepon
                lidToPhoneMap[senderId] = resolvedPhone
                await saveLidMapping(senderId, resolvedPhone)
                hasHistory = true
                console.log(chalk.green(`📎 Auto-mapped LID (only 1 unmapped client): ${senderId} → ${resolvedPhone} (${unmapped[0].nama_website})`))
              } else {
                console.log(chalk.yellow(`⚠️ Unknown LID ${senderId} — ${unmapped.length} unmapped clients, cannot auto-resolve`))
              }
            }
          }
        }
      } else {
        // Also check history for non-LID senders (in case they are in the mapping table)
        const [lidRows] = await db.query('SELECT nomor_telepon FROM lid_mapping WHERE nomor_telepon = ?', [senderId])
        if (lidRows.length > 0) hasHistory = true
      }

      // 2. Find Client Name and Package Info from pelunasan
      const [clients] = await db.query(
        "SELECT nama_website, paket, harga_renewal FROM pelunasan WHERE nomor_telepon IN (?, ?, ?)",
        [resolvedPhone, resolvedPhone.startsWith('62') ? '0' + resolvedPhone.substring(2) : resolvedPhone, resolvedPhone.startsWith('0') ? '62' + resolvedPhone.substring(1) : resolvedPhone]
      )

      // 3. APPLY FILTER: Only process if active client OR has historical reminder record
      console.log(chalk.cyan(`🔍 DEBUG: resolvedPhone=${resolvedPhone}, clients.length=${clients.length}, hasHistory=${hasHistory}`))

      const isSpecialNumber = resolvedPhone === '6287862070932' || resolvedPhone === adminPhone;

      if (clients.length === 0 && !hasHistory && !isSpecialNumber) {
        console.log(chalk.yellow(`🔇 DEBUG: ⚠️ DROPPED! Client not found in pelunasan & no LID history. resolvedPhone=${resolvedPhone}, from=${from}`))
        return
      }

      // Log only after validation
      console.log(chalk.gray(`📥 Incoming message from ${from}: "${text.length > 50 ? text.substring(0, 50) + '...' : text}" ${imageMsg ? '[IMAGE]' : ''}`))

      let clientPackage = "N/A"
      let renewalPrice = 0
      if (clients.length > 0) {
        namaWebsite = clients[0].nama_website
        clientPackage = clients[0].paket || "N/A"
        renewalPrice = clients[0].harga_renewal || 0
      } else {
        namaWebsite = `ALUMNI_${resolvedPhone}` // Past client not in current pelunasan
      }

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
          const { isValid, isUnrelated, reason, amount: aiAmount } = await isTransferProof(buffer, mimeType)

          // CASE 1: Completely Unrelated Image (Not a transaction document)
          if (isUnrelated) {
            console.log(chalk.yellow(`    ⏭️ AI Filter: Unrelated image detected. Saving to trash...`))

            const unrelatedDir = path.join(__dirname, 'transfers', 'unrelated');
            if (!fs.existsSync(unrelatedDir)) {
              fs.mkdirSync(unrelatedDir, { recursive: true });
            }

            const fileName = `unrelated_${resolvedPhone}_${Date.now()}.jpg`
            const filePath = path.join(unrelatedDir, fileName)
            fs.writeFileSync(filePath, buffer)

            // Save to unrelated_images table
            await db.query(
              `INSERT INTO unrelated_images (nomor_telepon, nama_website, file_path, caption, reason) VALUES (?, ?, ?, ?, ?)`,
              [resolvedPhone, namaWebsite, filePath, text, reason]
            )
            return // Stop here, do not notify admin
          }

          // ADMIN NOTIFICATION MESSAGE
          const billedAmount = Math.floor(renewalPrice)
          const transferredAmount = aiAmount || 0
          const formattedBilled = billedAmount.toLocaleString('id-ID')
          const formattedTransferred = transferredAmount.toLocaleString('id-ID')

          // Fetch LATEST payment status for the notification context
          const [currentStatus] = await db.query('SELECT paid_amount, remaining_amount, harga_renewal FROM pelunasan WHERE nama_website = ?', [namaWebsite])
          const existingPaid = currentStatus.length > 0 ? parseFloat(currentStatus[0].paid_amount || 0) : 0

          let currentRemaining = billedAmount;
          if (currentStatus.length > 0) {
            // If we have a record, use remaining_amount if NOT NULL, else calc from paid
            if (currentStatus[0].remaining_amount !== null) {
              currentRemaining = parseFloat(currentStatus[0].remaining_amount);
            } else {
              currentRemaining = billedAmount - existingPaid;
            }
          }

          if (isValid) {
            const diffAfterThis = currentRemaining - transferredAmount
            if (diffAfterThis <= 0) {
              paymentStatusText = `✅ *Status:* LUNAS (Setelah konfirmasi)`
            } else {
              paymentStatusText = `⚠️ *Status:* KURANG BAYAR\n🔴 *Sisa Tagihan:* Rp ${diffAfterThis.toLocaleString('id-ID')}\n💰 *Sudah Terbayar:* Rp ${existingPaid.toLocaleString('id-ID')}`
            }
          } else {
            paymentStatusText = `❌ *Bukti Tidak Valid* (Sisa Tagihan: Rp ${currentRemaining.toLocaleString('id-ID')})`
          }

          const headerText = isValid ? 'NOTIFIKASI TRANSFER BARU (TRANSFER VALID)' : 'NOTIFIKASI TRANSFER BARU (TRANSFER TIDAK VALID)'

          const adminNotifyText = `📢 *${headerText}*

👤 *Client:* ${namaWebsite}
📱 *No WA:* ${resolvedPhone}
📦 *Paket:* ${clientPackage}
💰 *Jumlah Tagihan:* Rp ${formattedBilled}
💵 *Jumlah Transfer:* Rp ${aiAmount ? formattedTransferred : 'Tidak terdeteksi'}

${paymentStatusText}

📝 *Caption:* ${text || '-'}
📑 *Status Transfer:* ${isValid ? 'Bukti Transfer Valid ✅' : 'Bukti Transfer Tidak Valid ❌'}
💬 *Alasan:* ${reason}`

          if (isValid) {
            // Ensure the 'transfers/valid' directory exists
            const validDir = path.join(__dirname, 'transfers', 'valid');
            if (!fs.existsSync(validDir)) {
              fs.mkdirSync(validDir, { recursive: true });
            }

            const fileName = `proof_${resolvedPhone}_${Date.now()}.jpg`
            const filePath = path.join(validDir, fileName)
            fs.writeFileSync(filePath, buffer)

            // Save to transfer proofs table
            await db.query(
              `INSERT INTO client_transfer_proofs (nomor_telepon, nama_website, file_path, caption) VALUES (?, ?, ?, ?)`,
              [resolvedPhone, namaWebsite, filePath, text]
            )

            console.log(chalk.green(`    ✅ AI Verified: Valid Transfer Proof. Saved to transfers/valid/`))
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

          // Send to Admin with confirmation prompt
          const confirmationPrompt = `
💬 *Konfirmasi Pembayaran*
Sudah masuk ke rekening?

✏️ Balas: *Sudah* atau *Belum*
_(Bot akan otomatis mengakumulasi ke sisa tagihan)_`

          const sentAdminMsg = await sock.sendMessage(adminNumber, {
            image: buffer,
            caption: adminNotifyText + confirmationPrompt
          })

          const lastNotifyId = sentAdminMsg?.key?.id || null

          // Save to pending_confirmations for admin reply tracking
          await db.query(
            `INSERT INTO pending_confirmations (nomor_telepon_client, nama_website, jumlah_transfer, harga_renewal, is_valid, last_notify_msg_id, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
            [resolvedPhone, namaWebsite, aiAmount || 0, billedAmount, isValid ? 1 : 0, lastNotifyId]
          )

          console.log(chalk.blue(`    📲 Admin notified via WhatsApp (${adminNumber}) [msgId=${lastNotifyId}]. Awaiting confirmation.`))
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
        console.log(chalk.green(`💾 DEBUG: Saving to client_responses → website=${namaWebsite}, phone=${resolvedPhone}, type=${responseType}`))
        await db.query(
          `INSERT INTO client_responses (nama_website, nomor_telepon, message_text, response_type, received_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [namaWebsite, resolvedPhone, text, responseType]
        )
        console.log(chalk.green(`✅ DEBUG: client_responses INSERT success!`))
      }

    } catch (err) {
      console.error(chalk.red("❌ Error processing message:"), err.message, err.stack)
    }

    if (text.toLowerCase() === "ping") await sendSafe(sock, from, { text: "pong 🏓" })
  })
}

async function checkAndSendReminders() {
  if (!isConnected || isReminderRunning) return
  isReminderRunning = true
  try {
    console.log(chalk.cyan("🔍 Checking for pending reminders..."))

    const reminderDays = (process.env.REMINDER_DAYS || "7,3,1,0,-3").split(",").map(d => parseInt(d.trim()))
    const [rows] = await db.query(`
      SELECT *, DATEDIFF(due_date, CURDATE()) AS diff FROM pelunasan
      WHERE status IN ('menunggu_pembayaran', 'kurang_bayar') AND due_date IS NOT NULL
        AND (last_reminder_sent IS NULL OR DATE(last_reminder_sent) < CURDATE())
        AND DATEDIFF(due_date, CURDATE()) IN (?)
    `, [reminderDays])

    if (!rows.length) {
      console.log(chalk.gray("📭 No pending reminders."))
      return
    }

    for (const row of rows) {
      // Pass paid_amount and remaining_amount to getReminderText
      const text = getReminderText(
        row.nama_website,
        formatToIndonesianDate(row.due_date),
        row.paket,
        row.harga_renewal,
        row.diff,
        parseFloat(row.paid_amount || 0),
        parseFloat(row.remaining_amount || 0)
      )
      const sendResult = await sendSafe(sock, `${row.nomor_telepon}@s.whatsapp.net`, { text })

      // Track message ID untuk LID mapping via reply/fromMe
      if (sendResult?.key?.id) {
        sentMessageMap[sendResult.key.id] = row.nomor_telepon
        console.log(chalk.cyan(`    📎 Tracking msgId=${sendResult.key.id} → ${row.nomor_telepon}`))
      }

      // Langsung capture LID jika ada di sendResult
      if (sendResult?.key?.remoteJid?.endsWith('@lid')) {
        const lid = sendResult.key.remoteJid.replace('@lid', '')
        if (!lidToPhoneMap[lid]) {
          lidToPhoneMap[lid] = row.nomor_telepon
          await saveLidMapping(lid, row.nomor_telepon)
          console.log(chalk.green(`    📎 LID Mapping from sendResult: ${lid} → ${row.nomor_telepon}`))
        }
      }

      const reminderLabel = row.diff === 0 ? 'H0' : (row.diff < 0 ? `H+${Math.abs(row.diff)}` : `H-${row.diff}`)
      let reminderCounts = { '7': 1, '3': 2, '1': 3, '0': 4, '-3': 5 }
      try {
        if (process.env.REMINDER_COUNTS_JSON) {
          reminderCounts = JSON.parse(process.env.REMINDER_COUNTS_JSON)
        }
      } catch (err) {
        console.error(chalk.red("❌ Failed to parse REMINDER_COUNTS_JSON:"), err.message)
      }
      const newCount = reminderCounts[row.diff.toString()] || (row.reminder_count + 1)

      await db.query(
        `UPDATE pelunasan SET last_reminder_sent = NOW(), reminder_count = ?, last_reminder_type = ?, updated_at = NOW() WHERE nama_website = ?`,
        [newCount, reminderLabel, row.nama_website]
      )
      console.log(chalk.green(`📤 Reminder sent to ${row.nama_website} (${reminderLabel}) [Count: ${newCount}]`))
    }
  } catch (err) {
    // console.error("❌ Reminder error:", err.message)
  } finally {
    isReminderRunning = false
  }
}

async function checkAndDeactivateClients() {
  if (!isConnected) return
  try {
    const deactivationDays = parseInt(process.env.DEACTIVATION_THRESHOLD_DAYS || "3")
    const [rows] = await db.query(`
      SELECT p.id, p.nama_website, p.nomor_telepon FROM pelunasan p
      LEFT JOIN client_responses r ON p.nama_website = r.nama_website 
         AND r.received_at > p.last_reminder_sent
      WHERE p.status IN ('menunggu_pembayaran', 'kurang_bayar') 
        AND DATEDIFF(p.due_date, CURDATE()) < ?
        AND p.last_reminder_sent IS NOT NULL
        AND r.response_id IS NULL
    `, [-deactivationDays])

    for (const row of rows) {
      await db.query("UPDATE pelunasan SET status = 'nonaktif', updated_at = NOW() WHERE id = ?", [row.id])
      console.log(chalk.red(`🚫 Automatically deactivated ${row.nama_website} (No response after H+3)`))

      // Notify Admin
      await sendSafe(sock, adminNumber, { text: `🚫 *NONAKTIF OTOMATIS*\n\nClient *${row.nama_website}* (${row.nomor_telepon}) telah dinonaktifkan karena tidak ada respon setelah reminder H+3.` })
    }
  } catch (err) {
    console.error(chalk.red("❌ Deactivation loop error:"), err.message)
  }
}

function startReminderLoop() {
  checkAndSendReminders()
  checkAndDeactivateClients()
  const interval = parseInt(process.env.REMINDER_LOOP_MS || "60000")
  reminderInterval = setInterval(() => {
    checkAndSendReminders()
    checkAndDeactivateClients()
  }, interval)
}

startBot()

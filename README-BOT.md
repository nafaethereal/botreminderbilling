# Bot Reminder - Panduan Menjalankan Bot Terus Menerus

## 🚀 Cara Menjalankan Bot di Background

### Opsi 1: Menggunakan PM2 (Recommended)

PM2 adalah process manager yang akan menjaga bot tetap hidup, auto-restart jika crash, dan bisa jalan di background.

**Langkah-langkah:**

1. **Jalankan script otomatis:**
   ```bash
   start-background.bat
   ```
   Script ini akan:
   - Install PM2 (jika belum ada)
   - Start bot di background
   - Bot akan auto-restart jika crash

2. **Perintah berguna:**
   ```bash
   pm2 logs botreminder      # Lihat log real-time
   pm2 status                # Cek status bot
   pm2 restart botreminder   # Restart bot
   pm2 stop botreminder      # Stop bot
   pm2 delete botreminder    # Hapus dari PM2
   ```

3. **Auto-start saat Windows boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Opsi 2: Manual dengan Node.js

Jika tidak mau pakai PM2, bisa jalankan manual:

```bash
npm start
```

**Catatan:** Terminal harus tetap terbuka. Jika ditutup, bot akan mati.

---

## 📋 File yang Dibuat

| File | Fungsi |
|------|--------|
| `ecosystem.config.js` | Konfigurasi PM2 |
| `start-background.bat` | Start bot di background |
| `stop-bot.bat` | Stop bot |
| `start-fresh.bat` | Hapus session & start fresh |

---

## ⚙️ Konfigurasi PM2

File `ecosystem.config.js` sudah dikonfigurasi dengan:
- ✅ Auto-restart jika crash
- ✅ Max memory 500MB (restart jika lebih)
- ✅ Log file di folder `logs/`
- ✅ Restart delay 5 detik

---

## 🔍 Monitoring

### Lihat Log
```bash
pm2 logs botreminder
```

### Lihat Status
```bash
pm2 status
```

Output:
```
┌─────┬──────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ restart │ uptime   │
├─────┼──────────────┼─────────┼─────────┼──────────┤
│ 0   │ botreminder  │ online  │ 0       │ 2h       │
└─────┴──────────────┴─────────┴─────────┴──────────┘
```

---

## 🛠️ Troubleshooting

### Bot tidak start
```bash
# Cek error di log
pm2 logs botreminder --err

# Restart bot
pm2 restart botreminder
```

### Bot crash terus
```bash
# Lihat log error
pm2 logs botreminder --lines 50

# Hapus session dan restart
pm2 stop botreminder
rmdir /s /q LenwySesi
pm2 start botreminder
```

### Ingin scan QR ulang
```bash
# Stop bot
pm2 stop botreminder

# Hapus session
rmdir /s /q LenwySesi

# Start lagi
pm2 start botreminder

# Lihat QR di log
pm2 logs botreminder
```

---

## 📊 Interval Reminder

Saat ini: **1 menit** (untuk testing)

Untuk production, edit `index.js` line 135:
```javascript
}, 60_000)      // 1 menit
}, 3600_000)    // 1 jam
}, 21600_000)   // 6 jam
}, 86400_000)   // 24 jam
```

Setelah edit, restart bot:
```bash
pm2 restart botreminder
```

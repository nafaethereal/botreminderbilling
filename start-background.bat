@echo off
echo ========================================
echo   Bot Reminder - Start Background
echo ========================================
echo.
echo Menginstall PM2 (jika belum ada)...
call npm install -g pm2
echo.
echo Memulai bot di background...
call pm2 start ecosystem.config.js
echo.
echo ✅ Bot berjalan di background!
echo.
echo Perintah berguna:
echo   pm2 logs botreminder    - Lihat log
echo   pm2 status              - Cek status
echo   pm2 restart botreminder - Restart bot
echo   pm2 stop botreminder    - Stop bot
echo.
pause

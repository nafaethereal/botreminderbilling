@echo off
echo ========================================
echo   WhatsApp Bot - Fresh Start
echo ========================================
echo.
echo Menghapus session lama...
rmdir /s /q LenwySesi 2>nul
echo Session dihapus!
echo.
echo Memulai bot...
echo.
node index.js

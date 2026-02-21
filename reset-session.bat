@echo off
echo Resetting WhatsApp Session...
echo.

REM Stop bot jika sedang berjalan
taskkill /F /IM node.exe 2>nul

REM Hapus folder session
if exist "LenwySesi" (
    echo Deleting old session folder...
    rmdir /S /Q "LenwySesi"
    echo Session folder deleted.
) else (
    echo No session folder found.
)

echo.
echo Session reset complete!
echo Now run: node index.js
echo Then scan the QR code with WhatsApp
pause

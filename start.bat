@echo off

start "" /min cmd /c "cd /d StreamHelper-Server && npm run server"
start "" /min cmd /c "cd /d StreamHelper-Client && npm run dev"
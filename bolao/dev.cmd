@echo off
rem Inicia o servidor de desenvolvimento do bolao
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
npm run dev

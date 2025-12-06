@echo off
REM Script para ejecutar la aplicación MediCit Spring Boot
REM Asegura que la aplicación se ejecute correctamente desde el directorio correcto

cd /d "%~dp0"
echo Directorio actual: %cd%
echo.
echo Ejecutando aplicacion Spring Boot...
echo.

call mvnw.cmd spring-boot:run

pause

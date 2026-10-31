@echo off
echo ================================================
echo   Attenda - Student Management System Startup
echo ================================================
echo.

rem Ensure Java 17 is selected
if exist "C:\Program Files\Java\jdk-17" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    set "PATH=C:\Program Files\Java\jdk-17\bin;%PATH%"
)

rem Add MySQL to PATH if present
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin" (
    set "PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin;%PATH%"
)

echo [1/3] Starting MySQL check...
mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS attenda_db CHARACTER SET utf8mb4;" 2>nul
if %errorlevel% neq 0 (
    echo [Info] MySQL command line check finished or skipped. Ensure MySQL service is running.
)

echo [2/3] Starting Backend (Spring Boot)...
start "Attenda Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak > nul

echo [3/3] Starting Frontend (React)...
start "Attenda Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ================================================
echo   App will open at: http://localhost:3000
echo   Backend API at:   http://localhost:8080/api
echo.
echo   Login: admin / admin123  (Admin)
echo          teacher / teacher123  (Teacher)
echo          STU1001 / DOB (Student: Aarav Sharma)
echo ================================================
echo.
pause

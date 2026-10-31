# 🎓 Student Management & Attendance System

A full-stack web application built with **React.js** (frontend), **Java Spring Boot** (backend), and **MySQL** (database).

---

## 📁 Project Structure

```
attenda/
├── frontend/          ← React.js application
├── backend/           ← Spring Boot application
└── README.md
```

---

## 🚀 Quick Setup in VS Code

### Prerequisites
- Node.js 18+ → https://nodejs.org
- Java JDK 17+ → https://adoptium.net
- Maven 3.8+ → https://maven.apache.org
- MySQL 8.0+ → https://dev.mysql.com/downloads/
- VS Code → https://code.visualstudio.com

### VS Code Extensions (Install These)
1. **Extension Pack for Java** (Microsoft)
2. **Spring Boot Extension Pack** (VMware)
3. **ES7+ React/Redux/React-Native snippets**
4. **MySQL** (cweijan)

---

## 🗄️ Step 1: Database Setup

Open MySQL Workbench or terminal and run:
```sql
CREATE DATABASE attenda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
The tables are auto-created by Spring Boot (JPA `ddl-auto=update`).

---

## ⚙️ Step 2: Backend Setup

```bash
cd backend
# Edit src/main/resources/application.properties with your MySQL credentials
mvn spring-boot:run
```
Backend runs at: **http://localhost:8080**

---

## 🌐 Step 3: Frontend Setup

```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role    | Username | Password  |
|---------|----------|-----------|
| Admin   | admin    | admin123  |
| Teacher | teacher  | teacher123|

---

## 📱 SMS Configuration (Optional - Twilio)

Edit `backend/src/main/resources/application.properties`:
```properties
twilio.account.sid=YOUR_ACCOUNT_SID
twilio.auth.token=YOUR_AUTH_TOKEN
twilio.phone.number=+1XXXXXXXXXX
sms.enabled=true
```
Without configuration, SMS runs in **simulation mode** (logged to console).

---

## ✨ Features

- 📊 **Dashboard** - Stats, class/section grid, live attendance
- 👥 **Student Management** - CRUD with photo upload
- 📋 **Attendance** - Mark present/absent, bulk actions
- 📱 **SMS Notifications** - Auto-notify parents (Twilio/Simulated)
- 📈 **Reports** - PDF & Excel downloads
- 🔐 **Auth** - Role-based access (Admin/Teacher)
- 📱 **Responsive** - Mobile-friendly design

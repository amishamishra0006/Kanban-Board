# 🚀 Collaborative Kanban Board (Google Apps Script)

A **real-time collaborative Kanban board** built entirely using **Google Apps Script + Google Sheets**, simulating live multi-user updates without WebSockets or external servers.

---

## 📌 Project Overview

This project is a **Trello-style task management system** where multiple users can:

* Create, update, delete tasks
* Drag & drop tasks across columns
* See updates from other users in near real-time

💡 **Key Highlight**
Real-time sync is achieved using **lightweight polling + timestamp comparison** —
❌ No WebSockets
❌ No external backend
❌ No database hosting

---

## ✨ Core Features

* 🧲 Drag & Drop (Sortable.js)
* 🔄 Real-time sync (every 4 seconds)
* 🧠 Conflict detection (multi-user safe)
* 📊 Google Sheets as live database
* ✏️ Full CRUD operations
* 🎯 Priority levels (High / Medium / Low)
* 👤 Assignee system with avatars
* 🔍 Search & filter tasks
* 📱 Responsive UI (mobile + desktop)
* 🔔 Toast notifications for actions

---

## 🏗️ System Architecture

| Layer     | Technology            | Responsibility         |
| --------- | --------------------- | ---------------------- |
| Frontend  | HTML, CSS, JavaScript | UI, drag-drop, modals  |
| Transport | `google.script.run`   | Client ↔ Server bridge |
| Backend   | Google Apps Script    | Logic, locking, APIs   |
| Database  | Google Sheets         | Persistent storage     |
| Sync      | Polling (4s interval) | Real-time updates      |

---

## 🗄️ Database Schema (Google Sheets)

Sheet Name: **Tasks**

| Column | Field       | Type      | Example                      |
| ------ | ----------- | --------- | ---------------------------- |
| A      | TaskID      | String    | TASK-1777323742801           |
| B      | Title       | String    | Design UI                    |
| C      | Description | String    | Create mockups               |
| D      | Status      | Enum      | Backlog / In-Progress / Done |
| E      | LastUpdated | Timestamp | 2026-04-27T18:32:11          |
| F      | Priority    | Enum      | high / medium / low          |
| G      | Assignee    | String    | Alice                        |

---

## 🔄 Real-Time Sync Logic

Instead of WebSockets, the app uses **2-step polling strategy**:

### 1. Lightweight Poll (Every 4s)

```javascript
getLastUpdated()
```
* Only checks latest timestamp
* Very low cost

### 2. Full Refresh (Only when needed)

```javascript
getTasks()
```
Triggered **only if data changed**

✅ Efficient
✅ Reduces API usage
✅ Near real-time UX

---

## ⚠️ Concurrency Handling

### 🔐 Layer 1 — LockService

Prevents simultaneous writes:

```javascript
LockService.getScriptLock()
```

---

### ⏱️ Layer 2 — Timestamp Check

```javascript
if (clientTs !== serverTs) → conflict
```

If conflict:

* ❌ Update rejected
* ⚠️ Warning shown
* 🔄 Auto reload

---

## ⚙️ Backend API

| Function             | Description              |
| -------------------- | ------------------------ |
| `doGet()`            | Serves web app           |
| `getTasks()`         | Fetch all tasks          |
| `getLastUpdated()`   | Returns latest timestamp |
| `addTask()`          | Create new task          |
| `updateTaskStatus()` | Move task                |
| `editTask()`         | Update task              |
| `deleteTask()`       | Delete task              |
| `setupSheet()`       | Initialize sheet         |

---

## ⚡ Performance Optimisations

* 🟢 Timestamp-only polling
* 🟢 Poll guard (no duplicate calls)
* 🟢 Optimistic UI updates
* 🟢 Debounced search
* 🟢 Lock timeout handling

---

## 🚀 Setup Guide

### 1️⃣ Create Google Sheet

* Create new sheet
* Rename to **Tasks**
* Copy Sheet ID

---

### 2️⃣ Setup Apps Script

* Go to https://script.google.com
* Create new project
* Add:

```
Code.gs
index.html
```

---

### 3️⃣ Add Sheet ID

```javascript
var SHEET_ID = "YOUR_SHEET_ID";
```

---

### 4️⃣ Initialize Database

Run:

```javascript
setupSheet()
```

---

### 5️⃣ Deploy Web App

* Deploy → Web App
* Execute as: **Me**
* Access: **Anyone**

---

## 🌐 Live Demo

👉 **Web App:**
(Add your deployed link here)

👉 **Google Sheet:**
(Add your sheet link here)

---

## 📁 Project Structure

```
kanban-board/
│
├── Code.gs
├── index.html
└── README.md
```

---

## 🧠 Technologies Used

* Google Apps Script
* Google Sheets
* Sortable.js
* HTML / CSS / JavaScript

---

## 🎯 Key Learning Outcomes

* Serverless architecture design
* Real-time sync without WebSockets
* Concurrency control in distributed systems
* Efficient polling strategies
* UI + backend integration

---

## 👩‍💻 Author

**Amisha Mishra**
B.Tech CSE — KIIT University

---

# 📚 Collaborative Study Platform

A full-stack collaborative learning platform built using the **MERN Stack** that enables students to collaborate in real time through **chat, file sharing, collaborative whiteboard, and WebRTC-based audio/video calling**.

---

## 🚀 Live Demo

🌐 **Frontend:**  
https://collaborative-study-platform-jet.vercel.app/

⚙️ **Backend:**  
https://collaborative-study-platform.onrender.com

---

# ✨ Features

## 🔐 Authentication
- User Registration & Login
- JWT Authentication
- Secure Password Hashing using bcrypt
- Protected Routes

## 👥 Study Rooms
- Create Study Rooms
- Join Existing Rooms
- Invite Members
- Admin Controls
- Remove Members
- Online/Offline Member Status

## 💬 Real-Time Chat
- Instant Messaging
- Socket.IO Powered Communication
- Real-Time Updates

## 📁 File Sharing
- Upload Files
- Download Shared Files
- Shared Resources Within Rooms

## 🎨 Collaborative Whiteboard
- Draw Together in Real Time
- Adjustable Brush Size
- Multiple Colors
- Eraser Tool
- Clear Canvas
- Download Whiteboard as Image

## 📞 Audio & Video Calling
- One-to-One Audio Calls
- One-to-One Video Calls
- WebRTC Peer-to-Peer Communication
- STUN Server Integration

---

# 🛠 Tech Stack

### Frontend
- React.js
- Bootstrap
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- JWT
- Multer

### Real-Time Communication
- WebRTC
- Socket.IO
- Google STUN Server

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# 📂 Project Structure

```text
Collaborative-Study-Platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   │
│   └── package.json
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── server1.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Vaishnavi-A-Das/Collaborative-Study-Platform.git

cd Collaborative-Study-Platform
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

Create a `.env` file inside the frontend directory.

```env
REACT_APP_API_URL=http://localhost:5000

REACT_APP_SOCKET_URL=http://localhost:5000
```

---

# 📡 Architecture

```text
                +--------------------+
                |     React App      |
                +--------------------+
                         |
        -----------------|------------------
        |                |                 |
        |                |                 |
     REST API       Socket.IO          WebRTC
        |                |                 |
        |                |           Audio/Video
        |                |
+--------------------+    |
| Express Backend    |<---+
+--------------------+
        |
        |
   MongoDB Atlas
```

---

# 🔐 Authentication Flow

```text
User Login/Register
        │
        ▼
JWT Token Generated
        │
        ▼
Stored in Browser
        │
        ▼
Authenticated API Requests
```

---

# 📞 WebRTC Signaling Flow

```text
Caller
   │
Socket.IO Signaling
   │
Offer
   │
Receiver
   │
Answer
   │
ICE Candidate Exchange
   │
Peer-to-Peer Connection
```

---

# 📸 Screenshots

> Add screenshots of:
- Login Page
- Dashboard
- Study Room
- Chat
- Whiteboard
- Video Call
- Members Panel

---

# 🌱 Future Enhancements

- TURN Server Integration
- Group Audio/Video Calls
- Screen Sharing
- Chat Notifications
- Message Reactions
- Collaborative Notes
- Dark Mode
- AI Study Assistant
- Mobile Responsive UI Improvements

---

# 👨‍💻 Author

**Vaishnavi A Das**

GitHub:  
https://github.com/Vaishnavi-A-Das


---
# Demo
Home page 
<img width="1535" height="720" alt="image" src="https://github.com/user-attachments/assets/0e300b67-9f65-4b86-bfbb-09368f0de549" />

Sign up/login
<img width="427" height="596" alt="image" src="https://github.com/user-attachments/assets/491cc481-938b-4286-ae9f-709f90cd6187" />

Calls
<img width="300" height="500" alt="image" src="https://github.com/user-attachments/assets/8eb331a8-3c6f-4d34-81d0-6e250efd8e97" />
<img width="300" height="500" alt="image" src="https://github.com/user-attachments/assets/1fda6922-da77-4084-82a8-7c7ea1f8b3ea" />

Screenshare
<img width="867" height="537" alt="image" src="https://github.com/user-attachments/assets/086c54de-af17-4996-b79a-be00315ab677" />

Chatarea-consists of ROOMS INFO-**whiteboard,join room ,create room** ; CHATAREA-**react to message,attach files,pin message,delete for me and delete for everyone specifically for admin** an interactive **Chatbot** and member list showing **online and offline users**
<img width="1529" height="701" alt="image" src="https://github.com/user-attachments/assets/9b2336df-fcf4-4bfe-a798-3eaa9209ac03" />

require("dotenv").config();
<<<<<<< HEAD

=======
>>>>>>> 8a0e0284 (const baseUrl = `${req.protocol}://${req.get("host")}`;#)



const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const authRoutes = require("./routes/auth");
const auth =require("./middleware/auth");
const Message =require("./models/Message");
const askGemini =require("./services/gemini");
const userRoutes =
require("./routes/users");
const roomRoutes =
require("./routes/rooms");

const app = express();
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch((err) => {
  console.error("❌ MongoDB Error:", err);
});


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    req.method,
    req.url
  );
  next();
});

app.use("/api/auth", authRoutes);
app.use(
 "/api/users",
 userRoutes
);
app.use(
 "/api/rooms",
 roomRoutes
);

app.get(
  "/api/protected",
  auth,
  (req, res) => {
    res.json({
      message:
        "Protected route works",
      user: req.user,
    });
  }
);

// --- Ensure uploads folder exists ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- Serve uploads ---
app.use('/uploads', express.static(uploadDir));

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- File upload route ---
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
const baseUrl = `${req.protocol}://${req.get("host")}`;
res.json({
  url: `${baseUrl}/uploads/${req.file.filename}`,
  type: req.body.type || "file",
});
});

// --- Create server & Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// --- In-memory stores ---
let roomMessages = {};
let roomUsers = {};
let userSockets = {};

// --- Socket.IO connections ---
io.on(
  "connection",
  (socket) => {

    console.log(
      "RAW CONNECTION"
    );

    console.log(
      "AUTH:",
      socket.handshake.auth
    );

    const {
      userId,
      username
    } =
    socket.handshake.auth;

    console.log(
      "USER ID:",
      userId
    );

    console.log(
      "USERNAME:",
      username
    );

    if (
      !userId ||
      !username
    ) {

      console.log(
        "❌ INVALID SOCKET"
      );

      return socket.disconnect();
    }

    console.log(
      "✅ USER CONNECTED:",
      username
    );
  userSockets[userId] = socket.id;

  socket.on(
  "sendInvitation",
  ({
    invitedUserId,
    invitation,
  }) => {

    const targetSocket =
      userSockets[
        invitedUserId
      ];

    if (targetSocket) {
      io.to(
        targetSocket
      ).emit(
        "newInvitation",
        invitation
      );
    }
  }
);


      // --------------------
// ----------------------
// CALL EVENTS
// ----------------------
socket.on(
  "getOnlineUsers",
  () => {

    io.emit(
      "onlineUsers",
      Object.keys(
        userSockets
      )
    );
  }
);

// Start call
socket.on(
  "callUser",
  ({
    toId,
    type,
    roomId,
  }) => {
    console.log(
  "CALL ATTEMPT:",
  {
    from:
      userId,
    to:
      toId,
  }
);

console.log(
  "TARGET SOCKET:",
  userSockets[
    toId
  ]
);
const targetSocket =
  userSockets[toId];

if (targetSocket) {

  io.to(
    targetSocket
  ).emit(
    "incomingCall",
    {
      fromId:
        userId,

      fromName:
        username,

      type,
    }
  );

} else {

  // missed call
  io.to(
    socket.id
  ).emit(
    "userOffline",
    {
      userId:
        toId,
    }
  );
}
  }
);


// Accept call
socket.on(
  "acceptCall",
  ({
    toId,
  }) => {

    const targetSocket =
      userSockets[
        toId
      ];

    if (
      targetSocket
    ) {
      io.to(
        targetSocket
      ).emit(
        "callAccepted",
        {
          fromId:
            userId,
        }
      );
    }
  }
);


// Reject call
socket.on(
  "rejectCall",
  ({
    toId,
  }) => {

    const targetSocket =
      userSockets[
        toId
      ];

    if (
      targetSocket
    ) {
      io.to(
        targetSocket
      ).emit(
        "callRejected",
        {
          fromId:
            userId,

          fromName:
            username,
        }
      );
    }
  }
);


// Offer
socket.on(
  "offer",
  ({
    toId,
    offer,
  }) => {

    const targetSocket =
      userSockets[
        toId
      ];

    if (
      targetSocket
    ) {
      io.to(
        targetSocket
      ).emit(
        "offer",
        {
          fromId:
            userId,

          offer,
        }
      );
    }
  }
);


// Answer
socket.on(
  "answer",
  ({
    toId,
    answer,
  }) => {

    const targetSocket =
      userSockets[
        toId
      ];

    if (
      targetSocket
    ) {
      io.to(
        targetSocket
      ).emit(
        "answer",
        {
          fromId:
            userId,

          answer,
        }
      );
    }
  }
);


// ICE candidates
socket.on(
  "iceCandidate",
  ({
    toId,
    candidate,
  }) => {

    const targetSocket =
      userSockets[
        toId
      ];

    if (
      targetSocket
    ) {
      io.to(
        targetSocket
      ).emit(
        "iceCandidate",
        {
          fromId:
            userId,

          candidate,
        }
      );
    }
  }
);


// End call
socket.on(
  "endCall",
  ({
    roomId,
  }) => {

    socket.to(
      roomId
    ).emit(
      "userEndedCall",
      {
        fromId:
          userId,
      }
    );
  }
);
  

  // Example: joinRoom
socket.on(
  "joinRoom",
  async ({
    roomId
  }) => {

    console.log(
      "📥 JOIN ROOM:",
      roomId
    );

    socket.join(
      roomId
    );

    const messages =
      await Message.find({
        roomId
      }).sort({
        created_at: 1
      });

    console.log(
      "📨 FOUND MSGS:",
      messages.length
    );

    socket.emit(
      "loadMessages",
      messages
    );

    console.log(
      "📤 SENT loadMessages"
    );


 /*  io.to(roomId).emit(
      "updateUsers",
      Object.values(
        roomUsers[roomId]
      )
    );

    io.to(roomId).emit(
      "userJoined",
      {
        username,
        userId,
      }
    ); */

  }
);

  // --- Send message ---
 socket.on(
  "sendMessage",
  async ({ roomId, message }) => {
    if (!message?.content)
      return;

    try {
      // Save user message
      const newMessage =
        new Message({
          roomId,

          content:
            message.content,

          user_id:
            userId,

          display_name:
            username,

          is_pinned:
            false,

          reactions:
            [],

          type:
            message.type ||
            "text",

          replyTo:
            message.replyTo ||
            null,
        });

      await newMessage.save();

      // emit user msg
      io.to(roomId).emit(
        "newMessage",
        newMessage.toJSON()
      );

      // -----------------------
      // StudyBot trigger
      // -----------------------

      const isBotReply =
        message.replyTo?.username
          ?.toLowerCase()
          .includes(
            "studybot"
          );

      const isBotMention =
        message.content
          .toLowerCase()
          .startsWith(
            "@bot"
          );

      if (
        isBotMention ||
        isBotReply
      ) {
        let prompt =
          message.content
            .replace(
              "@bot",
              ""
            )
            .trim();

        // Follow-up reply to bot
        if (
          isBotReply &&
          message.replyTo
        ) {
          prompt = `
Student is replying to:

"${message.replyTo.content}"

Follow-up question:

${message.content}
          `;
        }

        // Room history
        const history =
          await Message.find({
            roomId,
          })
            .sort({
              created_at:
                -1,
            })
            .limit(20);

        // Ask AI
        const aiResponse =
          await askGemini(
            prompt,
            history.reverse()
          );

        // Save bot response
        const botMessage =
          new Message({
            roomId,

            content:
              aiResponse,

            user_id:
              "studybot",

            display_name:
              "StudyBot 🤖",

            is_pinned:
              false,

            reactions:
              [],

            type:
              "text",
          });

        await botMessage.save();

        // emit bot msg
        io.to(roomId).emit(
          "newMessage",
          botMessage.toJSON()
        );
      }
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );
    }
  }
);

   
// --- Pin message ---
socket.on(
  "pinMessage",
  async ({ roomId, messageId }) => {
    try {
      const message =
        await Message.findById(
          messageId
        );

        

      if (!message) return;

      message.is_pinned =
        !message.is_pinned;

      await message.save();

      io.to(roomId).emit(
        "messagePinned",
        {
          messageId,
          isPinned:
            message.is_pinned,
        }
      ); 
  console.log(
  "PIN EVENT:",
  roomId,
  messageId
);
    } catch (err) {
      console.error(
        "Pin error:",
        err
      );
    }
  }
);

// --- Delete message ---
socket.on(
  "deleteMessage",
  async ({ roomId, messageId }) => {
    try {
      await Message.findByIdAndDelete(
        messageId
      );

      io.to(roomId).emit(
        "messageDeleted",
        messageId
      );
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );
    }
  }
);

// --- React to message ---
socket.on(
  "reactToMessage",
  async ({
    roomId,
    messageId,
    emoji,
    userId,
  }) => {
    try {
      const message =
        await Message.findById(
          messageId
        );

      if (!message) return;

      const existingReaction =
        message.reactions.find(
          (r) =>
            r.userId ===
              userId &&
            r.emoji === emoji
        );

      if (existingReaction) {
        message.reactions =
          message.reactions.filter(
            (r) =>
              !(
                r.userId ===
                  userId &&
                r.emoji === emoji
              )
          );
      } else {
        message.reactions.push({
          emoji,
          userId,
        });
      }

      await message.save();

      io.to(roomId).emit(
        "reactionUpdated",
        {
          messageId,
          reactions:
            message.reactions,
        }
      );
    } catch (err) {
      console.error(
        "Reaction error:",
        err
      );
    }
  }
);

// --- Handle file upload ---
socket.on(
  "fileUploaded",
  async ({
    roomId,
    fileUrl,
    fileType,
  }) => {
    try {
      const newMessage =
        new Message({
          roomId,
          content: fileUrl,
          user_id: userId,
          display_name:
            username,
          is_pinned: false,
          reactions: [],
          type:
            fileType ||
            "file",
        });

      await newMessage.save();

      io.to(roomId).emit(
        "newMessage",
        newMessage
      );
    } catch (err) {
      console.error(
        "File upload error:",
        err
      );
    }
  }
);
io.emit(
  "onlineUsers",
  Object.keys(
    userSockets
  )
);
  // --- Disconnect ---
  socket.on('disconnect', () => {
    delete userSockets[userId];
    io.emit(
  "onlineUsers",
  Object.keys(
    userSockets
  )
);
    Object.keys(roomUsers).forEach(roomId => {
      if (roomUsers[roomId][socket.id]) {
        delete roomUsers[roomId][socket.id];
        io.to(roomId).emit('updateUsers', Object.values(roomUsers[roomId]));
        io.to(roomId).emit('userLeft', { username, userId });
      }
    });
    console.log(`❌ ${username} (${userId}) disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT,"0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));

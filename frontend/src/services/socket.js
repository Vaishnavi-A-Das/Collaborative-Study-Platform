import { io } from "socket.io-client";

let socket;

export const getSocket = (userId, username) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: {
        userId,
        username,
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });
  }

  return socket;
};

export const initSocket = getSocket;

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
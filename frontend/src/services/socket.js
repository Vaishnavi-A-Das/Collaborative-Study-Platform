import { io } from "socket.io-client";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL||"http://localhost:5000";
let socket;

export const getSocket = (
  userId,
  username
) => {

  if (
    !userId ||
    !username
  ) {

    console.log(
      "❌ Missing socket auth"
    );

    return socket;
  }

  // reuse existing socket
  if (socket) {

    if (
      socket.connected
    ) {
      return socket;
    }

    socket.auth = {
      userId,
      username,
    };

    socket.connect();

    return socket;
  }

  socket = io(
    SOCKET_URL,
    {
      auth: {
        userId,
        username,
      },

      transports: [
        "websocket",
        "pooling"
      ],

      autoConnect: true,
    }
  );

  console.log(
    "SOCKET INIT",
    {
      userId,
      username
    }
  );

  socket.on(
    "connect",
    () => {
      console.log(
        "✅ Connected:",
        socket.id
      );
    }
  );

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        "❌ Disconnected:",
        reason
      );
    }
  );

  socket.on(
    "connect_error",
    (err) => {
      console.error(
        "❌ Socket Error:",
        err.message
      );
    }
  );

  return socket;
};

export const initSocket =
  getSocket;

export const closeSocket =
  () => {

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
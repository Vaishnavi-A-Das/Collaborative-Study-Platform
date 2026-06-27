import { io } from "socket.io-client";

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
    "http://192.168.1.7:5000",
    {
      auth: {
        userId,
        username,
      },

      transports: [
        "websocket"
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
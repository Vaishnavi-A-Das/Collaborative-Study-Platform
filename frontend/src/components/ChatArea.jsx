import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dropdown, Spinner, Modal, Button } from "react-bootstrap";
import { toast } from "sonner";
import { getSocket } from "../services/socket";
import Whiteboard from "./Whiteboard";
import EmojiPicker from "emoji-picker-react";
const COMMON_EMOJIS = ["👍", "❤️", "😊", "🎉", "🔥", "👏", "✅"];
const API_URL = process.env.REACT_APP_API_URL;
const ChatArea = ({ roomId, userId, userRole, roomName, isMember,callRequest,
    clearCallRequest }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [uploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile,setSelectedFile] =useState(null);
  const [previewUrl,setPreviewUrl] =useState(null);
  const [
  deletedForMe,
  setDeletedForMe
] = useState([]);

  // Call states
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remotePeers, setRemotePeers] = useState({});

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const peerConnections = useRef({});
  const socketRef =
  useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceCandidates = useRef({});
  const prepareOffer = async (fromId) => {
    return await createPeerConnection(fromId, false);
};

const user =
  JSON.parse(
    localStorage.getItem(
      "user"
    )
  );

const username =
  user?.username ||
  user?.email;
const localStreamRef =
  useRef(null);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const [replyingTo,setReplyingTo] =useState(null);
  useEffect(() => {
    if (!callRequest) return;

    startCall(
        callRequest.type,
        String(
            callRequest.member.user_id?._id ||
            callRequest.member.user_id
        )
    );

    clearCallRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [callRequest]);
  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Join room and handle socket events
  // Join room and handle socket events
useEffect(() => {

  if (!roomId)
    return;

  console.log(
    "JOIN ROOM EFFECT",
    {
      roomId,
      isMember
    }
  );
  

  if (!isMember)
    return;


  if (!user) {
    console.error("No logged-in user found");
    return;
  }

  const socket = getSocket(
    user._id,
    user.username || user.email
  );
  socketRef.current =
  socket;

  if (!socket) return;
//join room
socket.on(
  "loadMessages",
  (msgs) => {

    console.log(
      "📥 RECEIVED MSGS:",
      msgs
    );

    setMessages(
      msgs
    );
  }
);

console.log(
 "📤 JOINING ROOM:",
 roomId
);

socket.emit(
 "joinRoom",
 { roomId }
);
  socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  socket.on("messagePinned", ({ messageId, isPinned }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, is_pinned: isPinned }
          : msg
      )
    );
  });

  socket.on("messageDeleted", (messageId) => {
    setMessages((prev) =>
      prev.filter((msg) => msg.id !== messageId)
    );
  });

  socket.on("reactionUpdated", ({ messageId, reactions }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions }
          : msg
      )
    );
  });

  // Typing
  socket.on(
    "userTyping",
    ({ username, userId: typingUserId, isTyping }) => {
      if (typingUserId === userId) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username)
            ? prev
            : [...prev, username];
        }

        return prev.filter((u) => u !== username);
      });
    }
  );

  // Users
  socket.on("updateUsers", (users) => {
    setOnlineUsers(users);
  });

  socket.on("userJoined", ({ username }) => {
    toast.success(`${username} joined`);
  });

  socket.on("userLeft", ({ username }) => {
    toast.info(`${username} left`);
  });

  

  // WebRTC events
  socket.on("incomingCall", handleIncomingCall);
  socket.on("callAccepted", handleCallAccepted);
  socket.on("callRejected", handleCallRejected);
  socket.on("iceCandidate", handleIceCandidate);
  socket.on("offer", handleOffer);
  socket.on("answer", handleAnswer);
  socket.on("userEndedCall", handleUserEndedCall);
  socket.on("screenShareStarted", handleScreenShareStarted);
  socket.on("screenShareStopped", handleScreenShareStopped);

  // Cleanup
  return () => {
    socket.emit("leaveRoom", { roomId });

    socket.off("loadMessages");
    socket.off("newMessage");
    socket.off("messagePinned");
    socket.off("messageDeleted");
    socket.off("reactionUpdated");
    socket.off("userTyping");
    socket.off("updateUsers");
    socket.off("userJoined");
    socket.off("userLeft");
    socket.off("incomingCall");
    socket.off("callAccepted");
    socket.off("callRejected");
    socket.off("iceCandidate");
    socket.off("offer");
    socket.off("answer");
    socket.off("userEndedCall");
    socket.off("screenShareStarted");
    socket.off("screenShareStopped");
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [roomId, isMember, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Attach local media stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  //bind local media to stream
  useEffect(() => {

  // ONLY for video calls
  if (
    activeCall?.type !==
    "video"
  ) return;

  if (
    localVideoRef.current &&
    localStream
  ) {

    localVideoRef.current
      .srcObject =
      isScreenSharing &&
      screenStream
        ? screenStream
        : localStream;

    localVideoRef.current
      .play()
      .catch(
        console.error
      );
  }

}, [
  localStream,
  screenStream,
  isScreenSharing,
  activeCall
]);
  // Attach screen share stream
  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // WebRTC handlers
  const handleIncomingCall = ({ fromId, fromName, type }) => {
    setIncomingCall({ fromId, fromName, type });
  };

const handleCallAccepted =
  async ({
    fromId
  }) => {

    console.log(
      "CALL ACCEPTED"
    );

    setActiveCall(
      (prev) => ({
        ...prev,
        status:
          "active",
      })
    );
const stream =
  activeCall?.stream ||
  localStreamRef.current;

console.log(
  "CALLER STREAM:",
  stream
);

setActiveCall(
  (prev) => ({
    ...prev,
    status: "active",
  })
);
};

  const handleCallRejected = ({ fromId, fromName }) => {
    toast.error(`${fromName} declined your call`);
    if (peerConnections.current[fromId]) {
      peerConnections.current[fromId].close();
      delete peerConnections.current[fromId];
    }
  };
 

  const handleIceCandidate = async ({ fromId, candidate }) => {
    console.log(
 "🧊 RECEIVED ICE"
);
    const pc = peerConnections.current[fromId];
    if (pc && candidate) {
      try {
        if (!pc.remoteDescription) {

    if (!pendingIceCandidates.current[fromId])
        pendingIceCandidates.current[fromId] = [];

    pendingIceCandidates.current[fromId].push(candidate);

    return;
}

await pc.addIceCandidate(
    new RTCIceCandidate(candidate)
);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };
  
  const processOffer = async (pc, fromId, offer, roomId,mediaStream) => {

    await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
    );
    const pending =
    pendingIceCandidates.current[fromId] || [];

for (const candidate of pending) {

    await pc.addIceCandidate(
        new RTCIceCandidate(candidate)
    );
}

delete pendingIceCandidates.current[fromId];

    const stream =
  mediaStream ||
  localStreamRef.current;


    stream.getTracks().forEach(track => {

        const alreadyAdded =
            pc.getSenders().some(
                sender => sender.track === track
            );

        if (!alreadyAdded)
            pc.addTrack(track, mediaStream);

    });

    const answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);

    socketRef.current.emit("answer", {
        toId: fromId,
        answer,
        roomId
    });
};

const handleOffer = async ({ fromId, offer, roomId }) => {

    const pc = await prepareOffer(fromId);

    if (!localStreamRef.current) {

        pendingOfferRef.current = {
            pc,
            fromId,
            offer,
            roomId
        };

        console.log("Buffered offer");

        return;
    }

    await processOffer(pc, fromId, offer, roomId);
};
  const handleAnswer = async ({ fromId, answer }) => {
    console.log(
 "ANSWER DATA:",
 {
  fromId,
  answer
 }
);
    const pc = peerConnections.current[fromId];
    console.log(
  "📥 ANSWER RECEIVED"
);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setActiveCall(
  (prev) => ({
    ...prev,
    status: "active",
  })
);
      } 
      catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  const handleUserEndedCall = ({ fromId }) => {
    if (peerConnections.current[fromId]) {
      peerConnections.current[fromId].close();
      delete peerConnections.current[fromId];
    }
    setRemotePeers((prev) => {
      const newPeers = { ...prev };
      delete newPeers[fromId];
      return newPeers;
    });
    
    if (Object.keys(peerConnections.current).length === 0) {
      endCall();
      toast.info("Call ended");
    }
  };

  const handleScreenShareStarted = ({ fromId, fromName }) => {
    toast.info(`${fromName} started screen sharing`);
  };

  const handleScreenShareStopped = ({ fromId, fromName }) => {
    toast.info(`${fromName} stopped screen sharing`);
  };

  // Create peer connection
const createPeerConnection =
 async (
   peerId,
   isInitiator,
   providedStream = null
 ) => {
    
    // Prevent duplicates
if (
  peerConnections.current[
    peerId
  ]
) {

  console.log(
    "USING EXISTING PC"
  );

  return peerConnections
    .current[
      peerId
    ];
}
    console.log(
 "CREATING PC",
 peerId,
 isInitiator
);
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[peerId] = pc;

    // Add local stream tracks
    const stream =
  providedStream ||
  localStreamRef.current ||
  localStream;

 console.log(
 "STREAM EXISTS?",
 !!stream,
 stream
);

if (
  stream
) {

  console.log(
    "ADDING TRACKS"
  );

  stream
    .getTracks()
    .forEach(
      (track) => {

      pc.addTrack(
        track,
        stream
      );
    });
}
    // Handle incoming tracks
    pc.ontrack = (event) => {
  const stream = event.streams[0];

  console.log("🎥 TRACK KIND:", event.track.kind);
  console.log("STREAM ACTIVE:", stream.active);

  const videoTracks = stream.getVideoTracks();
  const audioTracks = stream.getAudioTracks();

  console.log("VIDEO TRACKS:", videoTracks);
  console.log("AUDIO TRACKS:", audioTracks);

  if (videoTracks.length > 0) {
    console.log("VIDEO TRACK DETAILS:", {
      enabled: videoTracks[0].enabled,
      muted: videoTracks[0].muted,
      readyState: videoTracks[0].readyState,
      id: videoTracks[0].id,
    });
  }

  if (audioTracks.length > 0) {
    console.log("AUDIO TRACK DETAILS:", {
      enabled: audioTracks[0].enabled,
      muted: audioTracks[0].muted,
      readyState: audioTracks[0].readyState,
      id: audioTracks[0].id,
    });
  }

  setRemotePeers(prev => ({
    ...prev,
    [peerId]: stream,
  }));
};
    // Handle ICE candidates
    pc.onicecandidate = (event) => { 
      if (event.candidate) {
        console.log(
 "🧊 SENDING ICE"
);
        const socket = socketRef.current;
        socket.emit("iceCandidate", {
          toId: peerId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        handleUserEndedCall({ fromId: peerId });
      }
    };

    // Create and send offer if initiator
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const socket = socketRef.current;
        socket.emit("offer", { toId: peerId, offer, roomId });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }

    return pc;
  };

  // Start call
 const startCall = async (
    type,
    targetUserId = null
) => {
    const socket = socketRef.current;
    if (!socket) return;

    const usersToCall =
targetUserId
    ? [{ userId: targetUserId }]
    : onlineUsers.filter(
          u => u.userId !== userId
      );
    if (usersToCall.length === 0) {
      toast.info("No other members online to call");
      return;
    }

    try {
      const stream =
 await navigator
 .mediaDevices
 .getUserMedia({
   video:
     type ===
     "video",

   audio:
     true,
 });

setLocalStream(
  stream
);

// SAVE STREAM IMMEDIATELY
localStreamRef.current =
  stream;
for (const user of usersToCall) {

    await createPeerConnection(
      user.userId,
      true,
      stream
    );

  console.log(
    "📤 CALL OFFER CREATED",
    user.userId
  );
}
setActiveCall({
  type,
  status:
    "calling",
});
    

      // Emit call to all users in the room
      usersToCall.forEach((user) => {
        socket.emit("callUser", {
          toId: user.userId,

          type,
          roomId,
        });
      });

      toast.success(`Calling ${usersToCall.length} member(s)...`);
    } catch (error) {
      toast.error("Failed to access camera/microphone");
      console.error(error);
    }
  };

  // Answer call
  const answerCall = async (accept) => {
    const socket = socketRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
    video: incomingCall.type === "video",
    audio: true,
    });
setLocalStream(stream);
localStreamRef.current = stream;
    if (pendingOfferRef.current) {

    const {
        pc,
        fromId,
        offer,
        roomId
    } = pendingOfferRef.current;

    pendingOfferRef.current = null;

    await processOffer(
        pc,
        fromId,
        offer,
        roomId,
        stream
    );
    
}
    if (!socket || !incomingCall) return;

    if (accept) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: incomingCall.type === "video",
          audio: true,
        });
        setLocalStream(stream);
        localStreamRef.current =
  stream;
        setActiveCall({
          type: incomingCall.type,
          status: "active",
        });

        socket.emit("acceptCall", {
          toId: incomingCall.fromId,
          roomId,
        });
      } catch (error) {
        toast.error("Failed to access camera/microphone");
        socket.emit("rejectCall", {
          toId: incomingCall.fromId,
          roomId,
        });
      }
    } else {
      socket.emit("rejectCall", {
        toId: incomingCall.fromId,
        roomId,
      });
    }

    setIncomingCall(null);
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Replace video track in all peer connections
      const videoTrack = stream.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Notify others
      const socket = socketRef.current;
      socket.emit("screenShareStarted", { roomId });

      // Handle screen share stop
      videoTrack.onended = () => {
        stopScreenShare();
      };

      toast.success("Screen sharing started");
    } catch (error) {
      toast.error("Failed to start screen sharing");
      console.error(error);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);

    // Replace back to camera video
    if (localStream) {
      const videoTrack =
  localStreamRef.current
    ?.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
    }

    // Notify others
    const socket = socketRef.current;
    socket.emit("screenShareStopped", { roomId });

    toast.info("Screen sharing stopped");
  };

  // End call
  const endCall = () => {
    if (localStream) {
      localStreamRef.current
  ?.getTracks()
  .forEach(
    (track) =>
      track.stop()
  );
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    
    // Close all peer connections
    Object.keys(peerConnections.current).forEach((peerId) => {
      peerConnections.current[peerId].close();
    });
    peerConnections.current = {};

    const socket = socketRef.current;
    if (socket && activeCall) {
      socket.emit("endCall", { roomId });
    }

    setActiveCall(null);
    setRemotePeers({});
    setIsScreenSharing(false);
  };

  // Typing handler
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = socketRef.current;
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { roomId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", { roomId, isTyping: false });
    }, 1000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;
    const socket = socketRef.current;
    if (!socket) return toast.error("Not connected to server");
    let uploadedFileUrl =
  null;

if (selectedFile) {
  const formData =
    new FormData();

  formData.append(
    "file",
    selectedFile
  );

  formData.append(
    "type",
    selectedFile.type.startsWith(
      "image"
    )
      ? "image"
      : "file"
  );

  const response =
  await fetch(
    `${API_URL}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

const data =
  await response.json();

uploadedFileUrl =
  data.url;
  }

    socket.emit(
  "sendMessage",
  {
    roomId,

    message: {
      content:
        newMessage.trim(),

      image:
        uploadedFileUrl,

      type:
        uploadedFileUrl
          ? "image"
          : "text",

      replyTo:
        replyingTo,
    },
  }
);
setSelectedFile(
  null
);

setPreviewUrl(
  null
);
    setNewMessage("");
    setReplyingTo(null)
    setIsTyping(false);
    socket.emit("typing", { roomId, isTyping: false });
  };
   

  // File upload
const handleFileSelect =
  (e) => {
    const file =
      e.target.files[0];

    if (!file) return;

    setSelectedFile(
      file
    );

    setPreviewUrl(
      URL.createObjectURL(
        file
      )
    );
  };
  // Reactions
 const handleReaction = (
  messageId,
  emoji
) => {
  const socket = socketRef.current;

  if (!socket) return;

  socket.emit("reactToMessage", {
    roomId,
    messageId,
    emoji,
    userId,
  });
};
  // Admin actions
  const handlePinMessage =
  (messageId) => {

    const socket =
      socketRef.current;

    if (!socket)
      return;

    socket.emit(
      "pinMessage",
      {
        roomId,
        messageId,
      }
    );
};

  const handleDeleteMessage =
  (message) => {

    const isOwnMessage =
      String(
        message.user_id
      ) === userId;

    const canDelete =
      userRole ===
        "admin" ||
      isOwnMessage;

    if (!canDelete) {
      toast.error(
        "You can only delete your own messages"
      );
      return;
    }

    const socket =
      socketRef.current;

    if (!socket)
      return;

    socket.emit(
      "deleteMessage",
      {
        roomId,
        messageId:
          message.id,
      }
    );
};

const handleDeleteForMe =
  (messageId) => {

    setDeletedForMe(
      (prev) => [
        ...prev,
        messageId,
      ]
    );

    toast.success(
      "Message hidden"
    );
};

  if (!roomId)
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center text-muted">
          <div style={{ fontSize: "4rem", opacity: 0.5 }}>#</div>
          <p className="fs-5">Select a room to start chatting</p>
        </div>
      </div>
    );

  if (!isMember)
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center text-muted">
          <div style={{ fontSize: "4rem", opacity: 0.5 }}>🔒</div>
          <p className="fs-5">You are not a member of this room</p>
          <p className="small">Request to join from the sidebar</p>
        </div>
      </div>
    );

  return (
    <div className="flex-grow-1 d-flex flex-column bg-white">
      {/* Header */}
      <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
          <span className="text-primary">#</span>
          {roomName}
          <span className="badge bg-success">{onlineUsers.length} online</span>
        </h5>
        <div className="d-flex gap-2">
          {!activeCall && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => startCall("audio")}
              >
                🎤 Audio Call
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => startCall("video")}
              >
                📹 Video Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Call */}
      {activeCall && (
        <div className="p-3 bg-dark text-white">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                {activeCall.type === "video" ? "📹 Video Call" : "🎤 Audio Call"} - {Object.keys(remotePeers).length} participant(s)
              </h6>
              <div className="d-flex gap-2">
                {activeCall.type === "video" && (
                  <button
                    className={`btn btn-sm ${isScreenSharing ? "btn-warning" : "btn-info"}`}
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  >
                    {isScreenSharing ? "🛑 Stop Share" : "🖥️ Share Screen"}
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={endCall}>
                  End Call
                </button>
              </div>
            </div>

            {activeCall.type === "video" && (
              <div className="d-flex gap-2 flex-wrap">
                {/* Local video */}
                <div className="position-relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "200px",
                      height: "150px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "2px solid #fff",
                    }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 rounded"
                    style={{ fontSize: "0.75rem" }}
                  >
                    You {isScreenSharing && "(Screen)"}
                  </div>
                </div>

                {/* Screen share video */}
                {isScreenSharing && screenStream && (
                  <div className="position-relative">
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: "300px",
                        height: "225px",
                        borderRadius: "8px",
                        objectFit: "contain",
                        border: "2px solid #ffc107",
                        background: "#000",
                      }}
                    />
                    <div
                      className="position-absolute bottom-0 start-0 m-2 px-2 py-1 bg-warning text-dark rounded"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Your Screen
                    </div>
                  </div>
                )}

                {/* Remote videos */}
                {Object.entries(remotePeers).map(([peerId, stream]) => (
                  <div key={peerId} className="position-relative">
                    <video
  key={`${peerId}-${stream?.id}`}
  autoPlay
  muted={false}
  playsInline
  ref={(el) => {

    if (
      !el ||
      !stream
    ) return;

    setTimeout(() => {

      if (
        el.srcObject !==
        stream
      ) {

        console.log(
          "🎬 ATTACHING VIDEO",
          peerId
        );

        el.srcObject =
          stream;

        el.play()
          .then(() =>
            console.log(
              "▶ VIDEO PLAYING"
            )
          )
          .catch(
            console.error
          );
      }

    }, 100);
  }}
  style={{
    width: "200px",
    height: "150px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid #fff",
    background: "#000",
  }}
/>
                    <div
                      className="position-absolute bottom-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 rounded"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Remote User
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCall.type === "audio" && (
              <div className="text-center py-3">
                <p className="mb-0">🎤 Audio Call in Progress</p>
                <audio ref={localAudioRef} autoPlay muted />
                {Object.entries(remotePeers).map(([peerId, stream]) => (
                  <audio
                    key={peerId}
                    autoPlay
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="mx-auto" style={{ maxWidth: "900px" }}>
          {messages.length === 0 ? (
            <div className="text-center text-muted mt-5">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages
  .filter(
    (message) =>
      !deletedForMe.includes(
        message.id
      )
  )
  .map((message) => {
              const reactions = message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {});
              return (
                <div key={message.id} className="mb-3 message-group">
                  <div className="d-flex align-items-start gap-2">
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
                    >
                      {message.display_name[0].toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-baseline gap-2 mb-1">
                        <span className="fw-semibold small">{message.display_name}</span>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        {message.is_pinned && <span className="badge bg-warning text-dark">📌 Pinned</span>}
                      </div>
                      {message.replyTo && (
                      <div
                      className="border-start ps-2 mb-1 text-muted small"
                      >
                      <strong>
                      {
                      message.replyTo.username
                      }
                      </strong>

                      <div>
                     {
                      message.replyTo
                      .content
                      }
                      </div>
                     </div>
                    )}
                      {message.type === "image" ? (
                        <img
                          src={message.content}
                          alt="upload"
                          style={{ maxWidth: "300px", borderRadius: "8px" }}
                        />
                      ) : message.type === "file" ? (
                        <a
                          href={message.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          📎 Download File
                        </a>
                      ) : (
                        <p className="mb-2 small">{message.content}</p>
                      )}
                      {Object.keys(reactions).length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {Object.entries(reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className={`btn btn-sm d-flex align-items-center gap-1 ${
                                message.reactions.some((r) => r.user_id === userId && r.emoji === emoji)
                                  ? "btn-primary"
                                  : "btn-outline-secondary"
                              }`}
                              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
<div className="message-actions d-flex gap-1">

  {/* Emoji */}
  <Dropdown>
    <Dropdown.Toggle
      variant="light"
      size="sm"
      className="py-0 px-2"
    >
      😊
    </Dropdown.Toggle>

    <Dropdown.Menu>
      {COMMON_EMOJIS.map(
        (emoji) => (
          <Dropdown.Item
            key={emoji}
            onClick={() =>
              handleReaction(
                message.id,
                emoji
              )
            }
          >
            {emoji}
          </Dropdown.Item>
        )
      )}
    </Dropdown.Menu>
  </Dropdown>

  {/* Reply - everyone */}
  <button
    className="btn btn-light btn-sm py-0 px-2"
    onClick={() =>
      setReplyingTo({
        id:
          message.id,
        content:
          message.content,
        username:
          message.display_name,
      })
    }
    title="Reply"
  >
    ↩
  </button>

  {/* Pin - everyone */}
  <button
    className="btn btn-light btn-sm py-0 px-2"
    onClick={() =>
      handlePinMessage(
        message.id
      )
    }
    title="Pin"
  >
    📌
  </button>

 {/* Delete for everyone */}
{(userRole ===
  "admin" ||
  String(
    message.user_id
  ) === userId) && (
  <button
    className="btn btn-light btn-sm py-0 px-2"
    onClick={() =>
      handleDeleteMessage(
        message
      )
    }
    title="Delete for everyone"
  >
    🗑️
  </button>
)}

{/* Delete for me */}
<button
  className="btn btn-outline-secondary btn-sm py-0 px-2"
  onClick={() =>
    handleDeleteForMe(
      message.id
    )
  }
  title="Delete for me"
>
  🙈
</button>
</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {typingUsers.length > 0 && (
          <div className="text-muted small ps-3">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-3 border-top bg-light position-relative">
               {replyingTo && (
          <div
          className="border rounded p-2 mb-2 bg-light"
          >
          <small>
          Replying to{" "}
          <strong>
          {
          replyingTo.username
          }
          </strong>
          </small>

          <div
          className="text-muted small"
          >
      {
        replyingTo.content
      }
    </div>
    
    <button
      className="btn btn-sm btn-danger"
      onClick={() =>
        setReplyingTo(
          null
        )
      }
    >
      ✕
    </button>
  </div>
)}

{selectedFile && (
  <div className="border rounded p-2 mb-2 bg-white">

    <div className="d-flex justify-content-between align-items-start">

      <div>

        <strong>
          Selected:
        </strong>{" "}
        {
          selectedFile.name
        }

        {previewUrl && (
          <div className="mt-2">
            <img
              src={
                previewUrl
              }
              alt="preview"
              style={{
                maxWidth:
                  "150px",
                borderRadius:
                  "8px",
              }}
            />
          </div>
        )}
      </div>

      <button
        className="btn btn-sm btn-danger"
        onClick={() => {
          setSelectedFile(
            null
          );

          setPreviewUrl(
            null
          );
        }}
      >
        ✕
      </button>

    </div>
  </div>
)}

        <div className="d-flex gap-2 mx-auto" style={{ maxWidth: "900px" }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Upload file"
          >
            {uploading ? <Spinner animation="border" size="sm" /> : "📎"}
          </button>

          <div className="position-relative">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Add Emoji"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div
                className="position-absolute bottom-100 mb-2 p-2 bg-white border rounded"
                style={{ zIndex: 1000 }}
              >
                <div className="d-flex justify-content-end mb-1">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => setShowEmojiPicker(false)}
                    style={{ fontWeight: "bold", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewMessage((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  theme="light"
                />
              </div>
            )}
          </div>
   
          <input
            type="text"
            className="form-control"
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
          />

          <button className="btn btn-primary" onClick={handleSendMessage}>
            Send
          </button>
        </div>

        
      </div>

      <Whiteboard
  roomId={roomId}
  userId={userId}
  username={username}
/>

      {/* Incoming Call Modal */}
      <Modal show={!!incomingCall} onHide={() => answerCall(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Incoming {incomingCall?.type} call</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{incomingCall?.fromName} is calling you.</p>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="success" onClick={() => answerCall(true)}>
              Accept
            </Button>
            <Button variant="danger" onClick={() => answerCall(false)}>
              Decline
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChatArea;

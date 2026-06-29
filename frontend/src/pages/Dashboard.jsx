import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import MembersList from "../components/MembersList";
import JoinRoomModal from "../components/JoinRoomModal";
import PendingRequestsModal from "../components/PendingRequestsModal";
import InviteMembersModal from "../components/InviteMembersModal";
import InvitationsModal from "../components/InvitationsModal";
import { initSocket} from "../services/socket";
import { toast } from "sonner";


const API_URL = process.env.REACT_APP_API_URL;
const Dashboard = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
const [
  user,
  setUser
] = useState(null);

useEffect(() => {

  const storedUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  setUser(
    storedUser
  );

}, []);


const [
  onlineUserIds,
  setOnlineUserIds
] = useState([]);

const userId =
  user?._id ||
  user?.id;

const currentUserName =
  user?.username ||
  user?.email;
  const [rooms, setRooms] = useState([]);

  const [callRequest, setCallRequest] = useState(null);
  
  // Room memberships - tracks which users are in which rooms
  const [roomMemberships, setRoomMemberships] = useState({});

  // Pending join requests (users requesting to join)
  const [pendingRequests, setPendingRequests] = useState({});

  // Pending invitations (admins inviting users)
  const [pendingInvitations, setPendingInvitations] = useState({});

  // All users in the system
  const [
 allUsers,
 setAllUsers
] = useState([]);

useEffect(() => {
  const fetchUsers =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/users`
          );

        const data =
          await response.json();

        setAllUsers(
          data
        );
      } catch (err) {
        console.error(
          "Failed to fetch users:",
          err
        );
      }
    };

  fetchUsers();
}, []);

useEffect(() => {

  const fetchRooms =
    async () => {
      try {

        if (!userId)
          return;

        const response =
          await fetch(
            `${API_URL}/api/rooms/${userId}`
          );

        const data =
          await response.json();

        console.log(
          "FETCHED ROOMS:",
          data
        );

        setRooms(data);

      } catch (err) {
        console.error(
          "ROOM FETCH ERROR:",
          err
        );
      }
    };

  fetchRooms();

}, [userId]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);

  // Initialize Socket.IO connection
 useEffect(() => {

  if (
    !userId ||
    !currentUserName
  ) return;
const socket =
  initSocket(
    userId,
    currentUserName
  );

if (!socket)
  return;

socket.emit(
  "getOnlineUsers"
);

socket.on(
  "onlineUsers",
    (users) => {

      setOnlineUserIds(
        users
      );
    }
  );

  return () => {
    socket.off(
      "onlineUsers"
    );
  };

}, [
  userId,
  currentUserName
]);;


  // Get rooms where current user is a member
  const userRooms =
  rooms.filter(
    (room) =>
      room.members?.some(
        (member) =>
          String(
  member.user_id?._id ||
  member.user_id
) === userId
      )
  );

  // Get all available rooms (for joining)
  const availableRooms =
  rooms.filter(
    (room) =>
      !room.members?.some(
        (member) =>
          String(
  member.user_id?._id ||
  member.user_id
) === userId
      )
  );

  // Check if current user is admin of selected room
 const isAdmin =
  selectedRoomId
    ? rooms
        .find(
          (r) =>
            r._id ===
            selectedRoomId
        )
        ?.members?.find(
          (m) =>
           String(
  m.user_id?._id ||
  m.user_id
) === userId
        )?.role ===
      "admin"
    : false;
  // Count pending requests for admin rooms
  const pendingRequestsCount =
  Object.keys(
    pendingRequests
  ).reduce(
    (
      count,
      roomId
    ) => {

      const room =
        rooms.find(
          (r) =>
            r._id ===
            roomId
        );

      const isAdminOfRoom =
        room?.members?.find(
          (m) =>
            String(
  m.user_id?._id ||
  m.user_id
) === userId
        )?.role ===
        "admin";

      return isAdminOfRoom
        ? count +
            (
              pendingRequests[
                roomId
              ]?.length ||
              0
            )
        : count;

    },
    0
  );
  // Count pending invitations for current user
  const myInvitationsCount = pendingInvitations[userId]?.length || 0;

  const handleRoomCreated = (newRoom) => {
    setRooms([newRoom, ...rooms]);
    // Creator automatically becomes admin
    setRoomMemberships({
      ...roomMemberships,
      [newRoom._id]: [{ user_id: userId, display_name: currentUserName, role: "admin", status: "online" }],
    });
    setPendingRequests({ ...pendingRequests, [newRoom._id]: [] });
  };

  const handleJoinRequest = (roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    if (!room) return;

    // Add to pending requests
    setPendingRequests({
      ...pendingRequests,
      [roomId]: [
        ...(pendingRequests[roomId] || []),
        {
          user_id: userId,
          display_name: currentUserName,
          requested_at: new Date().toISOString(),
        },
      ],
    });

    setShowJoinModal(false);
  };

  const handleApproveRequest = (roomId, requestUserId) => {
    const request = pendingRequests[roomId]?.find((r) => r.user_id === requestUserId);
    if (!request) return;

    const user = allUsers.find((u) => u.id === requestUserId);

    // Add user to room members
    setRoomMemberships({
      ...roomMemberships,
      [roomId]: [
        ...(roomMemberships[roomId] || []),
        { 
          user_id: request.user_id, 
          display_name: request.display_name, 
          role: "member",
          status: user?.status || "offline"
        },
      ],
    });

    // Remove from pending requests
    setPendingRequests({
      ...pendingRequests,
      [roomId]: pendingRequests[roomId].filter((r) => r.user_id !== requestUserId),
    });
  };

  const handleRejectRequest = (roomId, requestUserId) => {
    setPendingRequests({
      ...pendingRequests,
      [roomId]: pendingRequests[roomId].filter((r) => r.user_id !== requestUserId),
    });
  };

 const handleInviteUsers =
  (roomId, userIds) => {
    const room =
      rooms.find(
        (r) =>
          r._id === roomId
      );

    if (!room) return;

    const updatedInvitations =
      {
        ...pendingInvitations,
      };

    userIds.forEach(
      (invitedUserId) => {
        const invitation =
          {
            room_id:
              roomId,

            room_name:
              room.name,

            invited_by:
              currentUserName,

            invited_at:
              new Date().toISOString(),
          };

        // create array if missing
        if (
          !updatedInvitations[
            invitedUserId
          ]
        ) {
          updatedInvitations[
            invitedUserId
          ] = [];
        }

        updatedInvitations[
          invitedUserId
        ].push(
          invitation
        );
        const socket =
  initSocket(
    userId,
    currentUserName
  );

socket.emit(
  "sendInvitation",
  {
    invitedUserId,

    invitation,
  }
);

      } 
    );
  console.log(
 updatedInvitations
);
    setPendingInvitations(
      updatedInvitations
    );

    setShowInviteModal(
      false
    );
  };

  useEffect(() => {
    console.log({
  userId,
  currentUserName
});

  const socket =
  initSocket(
    userId,
    currentUserName
  );

if (!socket)
  return;

socket.on(
  "newInvitation",
    (invitation) => {
      setPendingInvitations(
        (prev) => ({
          ...prev,

          [userId]: [
            ...(prev[
              userId
            ] || []),

            invitation,
          ],
        })
      );
    }
  );
 

  socket.on(
  "userOffline",
  () => {

    toast.info(
      "User is offline. Missed call notification sent."
    );
  }
);

  return () => {
    socket.off(
      "newInvitation"
    );
     socket.off(
      "incomingCall"
    );
      socket.off(
    "userOffline"
  );

  };
}, [
  userId,
  currentUserName,
]);
const handleAcceptInvitation =
  async (
    roomId
  ) => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/rooms/join`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                roomId,
                userId,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.error
        );
      }
  // REFRESH ROOMS
      const roomsResponse =
        await fetch(
          `${API_URL}/api/rooms/${userId}`
        );

      const updatedRooms =
        await roomsResponse.json();

      setRooms(
        updatedRooms
      );

      // remove invite
      setPendingInvitations(
        (prev) => ({
          ...prev,

          [userId]:
            prev[
              userId
            ]?.filter(
              (inv) =>
                inv.room_id !==
                roomId
            ) || [],
        })
      );

      setShowInvitationsModal(
        false
      );

    } catch (err) {

      console.error(
        "ACCEPT ERROR:",
        err
      );
    }
  };
  const handleDeclineInvitation = (roomId) => {
    setPendingInvitations({
      ...pendingInvitations,
      [userId]: pendingInvitations[userId].filter((inv) => inv.room_id !== roomId),
    });
  };

  

  const handleRemoveMember = (roomId, memberId) => {
    if (!isAdmin) return;

    setRoomMemberships({
      ...roomMemberships,
      [roomId]: roomMemberships[roomId].filter((m) => m.user_id !== memberId),
    });
  };


  const selectedRoom = rooms.find((r) => r._id === selectedRoomId);
  const currentRoomMembers =
  selectedRoomId
    ? (
        rooms.find(
          (r) =>
            r._id ===
            selectedRoomId
        )?.members || []
      ).map(
        (member) => {

          const user =
            allUsers.find(
              (u) =>
                u._id ===
                String(
  member.user_id?._id ||
  member.user_id
) 
            );

          return {
            ...member,

            display_name:
              user?.username ||
              "Unknown User",

            status:
              "offline",
          };
        }
      )
    : [];
  // Check if user is member of selected room
  const isMemberOfRoom =
  selectedRoomId
    ? rooms
        .find(
          (r) =>
            r._id ===
            selectedRoomId
        )
        ?.members?.some(
          (m) =>
            String(
  m.user_id?._id ||
  m.user_id
) === userId
        )
    : false;

  // Get available users to invite (not already in the room and no pending invitation)
const availableUsersToInvite =
  selectedRoomId
    ? allUsers.filter(
        (user) => {

          const room =
            rooms.find(
              (r) =>
                r._id ===
                selectedRoomId
            );

    const isAlreadyMember =
  room?.members?.some(
    (m) =>
      String(
        m.user_id?._id ||
        m.user_id
      ) === user._id
  );

          const hasPendingInvitation =
            pendingInvitations[
              user._id
            ]?.some(
              (inv) =>
                inv.room_id ===
                selectedRoomId
            );

          return (
            !isAlreadyMember &&
            !hasPendingInvitation &&
            user._id !==
              userId
          );
        }
      )
    : [];

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar
        selectedRoomId={selectedRoomId}
        onRoomSelect={setSelectedRoomId}
        userId={userId}
        rooms={userRooms}
        onRoomCreated={handleRoomCreated}
        onJoinRoom={() => setShowJoinModal(true)}
        pendingRequestsCount={pendingRequestsCount}
        myInvitationsCount={myInvitationsCount}
        onShowPendingRequests={() => setShowPendingModal(true)}
        onShowInvitations={() => setShowInvitationsModal(true)}
        isAdmin={isAdmin}
      />
      <ChatArea
        roomId={selectedRoomId}
        userId={userId}
        userRole={isAdmin ? "admin" : "member"}
        roomName={selectedRoom?.name || ""}
        isMember={isMemberOfRoom}
        callRequest={callRequest}
        clearCallRequest={() => setCallRequest(null)}
      />
      <MembersList
        roomId={selectedRoomId}
        members={currentRoomMembers}
        onlineUserIds={onlineUserIds}
        isAdmin={isAdmin}
        currentUserId={userId}
        onRemoveMember={handleRemoveMember}
        onInviteMembers={() => setShowInviteModal(true)}
        onCallMember={(member, type) =>
        setCallRequest({ member, type })
    }
    
      />

      <JoinRoomModal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        rooms={availableRooms}
        onJoinRequest={handleJoinRequest}
      />

      <PendingRequestsModal
        show={showPendingModal}
        onHide={() => setShowPendingModal(false)}
        rooms={rooms}
        pendingRequests={pendingRequests}
        roomMemberships={roomMemberships}
        currentUserId={userId}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      <InviteMembersModal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        roomId={selectedRoomId}
        roomName={selectedRoom?.name || ""}
        availableUsers={availableUsersToInvite}
        onInvite={handleInviteUsers}
      />

      <InvitationsModal
        show={showInvitationsModal}
        onHide={() => setShowInvitationsModal(false)}
        invitations={pendingInvitations[userId] || []}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
      />
      
    </div>
  );
};

export default Dashboard;
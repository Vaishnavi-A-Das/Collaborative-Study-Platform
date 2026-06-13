import { useState } from "react";
import { Modal } from "react-bootstrap";

const InviteMembersModal = ({
  show,
  onHide,
  roomId,
  roomName,
  availableUsers,
  onInvite,
}) => {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedUsers,
    setSelectedUsers] =
    useState([]);

  // Filter users safely
  const filteredUsers =
    availableUsers.filter(
      (user) => {
        const query =
          searchQuery.toLowerCase();

        return (
          (
            user.username ||
            ""
          )
            .toLowerCase()
            .includes(query) ||
          (
            user.email ||
            ""
          )
            .toLowerCase()
            .includes(query)
        );
      }
    );

  const handleToggleUser =
    (userId) => {
      if (
        selectedUsers.includes(
          userId
        )
      ) {
        setSelectedUsers(
          selectedUsers.filter(
            (id) =>
              id !== userId
          )
        );
      } else {
        setSelectedUsers([
          ...selectedUsers,
          userId,
        ]);
      }
    };

  const handleInvite = () => {
    if (
      selectedUsers.length ===
      0
    )
      return;

    onInvite(
      roomId,
      selectedUsers
    );

    setSelectedUsers([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Invite Members to #
          {roomName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
          />
        </div>

        {/* Selected count */}
        {selectedUsers.length >
          0 && (
          <div className="alert alert-info py-2">
            {
              selectedUsers.length
            }{" "}
            user
            {selectedUsers.length >
            1
              ? "s"
              : ""}{" "}
            selected
          </div>
        )}

        {/* Users list */}
        <div
          style={{
            maxHeight:
              "400px",
            overflowY:
              "auto",
          }}
        >
          {filteredUsers.length ===
          0 ? (
            <p className="text-muted text-center mt-3">
              {searchQuery
                ? "No users found"
                : "No users available to invite"}
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredUsers.map(
                (user) => (
                  <div
                    key={
                      user._id
                    }
                    className={`d-flex align-items-center gap-3 p-3 border rounded ${
                      selectedUsers.includes(
                        user._id
                      )
                        ? "border-primary bg-light"
                        : ""
                    }`}
                    onClick={() =>
                      handleToggleUser(
                        user._id
                      )
                    }
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(
                        user._id
                      )}
                      onChange={() =>
                        handleToggleUser(
                          user._id
                        )
                      }
                      className="form-check-input"
                    />

                    {/* Avatar */}
                    <div>
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width:
                            "40px",
                          height:
                            "40px",
                        }}
                      >
                        {(
                          user.username?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium">
                        {
                          user.username
                        }
                      </p>

                      <p className="mb-0 text-muted small">
                        {
                          user.email
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          className="btn btn-secondary"
          onClick={
            handleClose
          }
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={
            handleInvite
          }
          disabled={
            selectedUsers.length ===
            0
          }
        >
          Invite
          {selectedUsers.length >
            0 &&
            ` (${selectedUsers.length})`}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default InviteMembersModal;
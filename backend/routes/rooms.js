const express =
  require("express");

const router =
  express.Router();

const Room =
  require("../models/Room");

const mongoose =
  require("mongoose");


// CREATE ROOM
// CREATE ROOM
router.post(
  "/create",
  async (req, res) => {
    try {

      const {
        name,
        description,
        userId,
      } = req.body;

      console.log(
        "CREATE ROOM BODY:",
        req.body
      );

      if (
        !mongoose.Types
          .ObjectId
          .isValid(
            userId
          )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid user ID",
          });
      }

      const objectUserId =
        new mongoose.Types.ObjectId(
          userId
        );

      const room =
        new Room({
          name,
          description,

          owner_id:
            objectUserId,

          members: [
            {
              user_id:
                objectUserId,

              role:
                "admin",
            },
          ],
        });

      await room.save();

      console.log(
        "ROOM SAVED:",
        room
      );

      res.json(
        room
      );

    } catch (err) {

      console.error(
        "CREATE ROOM ERROR:",
        err
      );

      res.status(500)
        .json({
          error:
            err.message,
        });
    }
  }
);
// GET MY ROOMS
router.get(
  "/:userId",
  async (req, res) => {
    try {

      const userId =
        req.params.userId;

      console.log(
        "USER ID PARAM:",
        userId
      );

      // Validate ObjectId
      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid user ID",
            received:
              userId,
          });
      }

      const rooms =
        await Room.find({
          "members.user_id":
            new mongoose.Types.ObjectId(
              userId
            ),
        });

      res.json(
        rooms
      );

    } catch (err) {
      console.error(
        "ROOM FETCH ERROR:",
        err
      );

      res.status(500)
        .json({
          error:
            err.message,
        });
    }
  }
);

// ACCEPT INVITATION / JOIN ROOM
router.post(
  "/join",
  async (req, res) => {
    try {

      const {
        roomId,
        userId,
      } = req.body;

      const room =
        await Room.findById(
          roomId
        );

      if (!room) {
        return res
          .status(404)
          .json({
            error:
              "Room not found",
          });
      }

      const alreadyMember =
        room.members.some(
          (m) =>
            String(
  m.user_id?._id ||
  m.user_id
) === userId
        );

      if (
        alreadyMember
      ) {
        return res
          .json(room);
      }

      room.members.push({
        user_id:
          new mongoose.Types.ObjectId(
            userId
          ),

        role:
          "member",
      });

      await room.save();

      res.json(room);

    } catch (err) {

      console.error(
        "JOIN ROOM ERROR:",
        err
      );

      res.status(500)
        .json({
          error:
            err.message,
        });
    }
  }
);
module.exports =
  router;
  
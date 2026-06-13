const mongoose =
  require("mongoose");

const roomSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        default: "",
      },

      owner_id: {
        type:
          mongoose.Schema
            .Types
            .ObjectId,

        ref: "User",

        required: true,
      },

      members: [
        {
          user_id: {
            type:
              mongoose.Schema
                .Types
                .ObjectId,

            ref: "User",
          },

          role: {
            type: String,

            enum: [
              "admin",
              "member",
            ],

            default:
              "member",
          },

          joined_at: {
            type: Date,
            default:
              Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Room",
    roomSchema
  );
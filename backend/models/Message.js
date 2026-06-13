const mongoose =
  require("mongoose");

const messageSchema =
  new mongoose.Schema(
    {
      roomId: {
        type: String,
        required: true,
      },

      content: {
        type: String,
        required: true,
      },

      user_id: {
        type: String,
        required: true,
      },

      display_name: {
        type: String,
        required: true,
      },

      created_at: {
        type: Date,
        default: Date.now,
      },

      is_pinned: {
        type: Boolean,
        default: false,
      },

      reactions: [
        {
          emoji: String,
          userId: String,
        },
      ],

      type: {
        type: String,
        default: "text",
      },

      replyTo: {
        type: Object,
        default: null,
      },
    },
    {
      toJSON: {
        virtuals: true,
        transform: (
          doc,
          ret
        ) => {
          ret.id =
            ret._id.toString();

          delete ret._id;
          delete ret.__v;

          return ret;
        },
      },
    }
  );

module.exports =
  mongoose.model(
    "Message",
    messageSchema
  );
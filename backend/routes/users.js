const express =
require("express");

const router =
express.Router();

const User =
require("../models/User");

// Get all users
router.get(
  "/",
  async (req, res) => {
    try {
      const users =
        await User.find(
          {},
          "username email"
        );

      res.json(users);
    } catch (err) {
      console.error(err);

      res
        .status(500)
        .json({
          error:
            "Failed to fetch users",
        });
    }
  }
);

module.exports =
  router;
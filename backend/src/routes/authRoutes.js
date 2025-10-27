const express = require("express");
const AuthController = require("../controllers/AuthController");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login",    AuthController.login);

// Debug de token
router.get("/me", auth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

module.exports = router;

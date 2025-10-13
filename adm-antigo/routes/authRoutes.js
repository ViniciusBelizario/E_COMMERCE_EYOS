//routes\authRoutes.js
const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    res.render("auth/login");  // Certifique-se de que o caminho corresponde à pasta `views/auth/login.ejs`
});

module.exports = router;

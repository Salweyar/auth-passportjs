const express = require("express");

const router = express.Router();

const { ensureAuthenticated } = require("../config/auth");

//welcome page
router.get("/", (req, res) => res.render("../views/welcome"));

//dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("../views/dashboard", {
    name: req.user.name,
  })
);

module.exports = router;

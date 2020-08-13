const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");

//User model
const User = require("../models/Users");

//Login Page
router.get("/login", (req, res) => res.render("login"));

//Register Page
router.get("/register", (req, res) => res.render("register"));

//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //Check password match
  if (password !== password2) {
    errors.push({ msg: "Password do not match" });
  }

  //Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    //Validation passed

    //Mongo DB config
    const db = require("../config/keys").MongoURI;

    //connect to Mongo
    const client = new MongoClient(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    client.connect((err) => {
      if (err) throw err;

      client
        .db("salweyar")
        .collection("test")
        .findOne({ email: email })
        .then((user) => {
          if (user) {
            //User exists
            errors.push({ msg: "Email is already registered" });
            res.render("register", {
              errors,
              name,
              email,
              password,
              password2,
            });
          } else {
            const newUser = new User({
              password,
            });

            //Hash password
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;

                const sec = new User({
                  name,
                  email,
                  password: hash,
                });

                client
                  .db("salweyar")
                  .collection("test")
                  .insertOne(sec, function (err, res) {
                    if (err) throw err;

                    console.log("1 document inserted");
                  });
              })
            );

            req.flash("success_msg", "You are now registered!");
            res.redirect("/users/login");
          }
        })
        .catch((err) => console.log(err));
    });
  }
});

//Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//Logout handle
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "Successfully Logout");
  res.redirect("/users/login");
});

module.exports = router;

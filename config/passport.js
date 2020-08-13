const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const MongoClient = require("mongodb").MongoClient;

//Load User Model
const User = require("../models/Users");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //Match User and Mongo DB config
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
            if (!user) {
              return done(null, false, {
                message: "That email is not registered!",
              });
            }

            //Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
          })
          .catch((err) => console.log(err));
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};

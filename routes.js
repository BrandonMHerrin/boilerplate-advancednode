const bcrypt = require("bcrypt");
const passport = require("passport");

module.exports = function (app, myDataBase) {
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }

  app.route("/").get((req, res) => {
    res.render("./pug/index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
    });
  });
  app.route("/auth/github").get(passport.authenticate("github"));
  app
    .route("/auth/github/callback")
    .get(
      passport.authenticate("github", { failureRedirect: "/" }),
      (req, res, next) => {
        res.redirect("/profile");
      }
    );
  app.route("/register").post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          myDataBase.insertOne(
            {
              username: req.body.username,
              password: hash,
            },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );
  app.route("/login").post(
    passport.authenticate("local", {
      failureRedirect: "/",
    }),
    (req, res) => {
      res.redirect("/profile");
    }
  );
  app.route("/logout").get((req, res) => {
    req.logout({}, (err) => {
      res.redirect("/");
    });
  });
  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render("./pug/profile", { username: req.user.username });
  });
};

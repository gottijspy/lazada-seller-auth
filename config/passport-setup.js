const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const OAuth2Strategy = require("passport-oauth2");
const keys = require("./keys");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      // options for the google strategy
      callbackURL: "/auth/google/redirect",
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      // check if user already exists in our db
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // already have the user
          console.log("user is: " + currentUser);
          done(null, currentUser);
        } else {
          // if not, create user in our db
          new User({
            username: profile.displayName,
            googleId: profile.id,
          })
            .save()
            .then((newUser) => {
              console.log("new user created: " + newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://auth.lazada.com/oauth/authorize",
      //tokenURL: "https://lazada-server.herokuapp.com/CreateToken",
      tokenURL: "https://auth.lazada.com/rest/auth/token/create",
      clientID: keys.lazada.clientID,
      clientSecret: keys.lazada.clientSecret,
      callbackURL: "/auth/lazada/redirect",
      passReqToCallback: true,
    },
    // passport callback function
    (req, accessToken, refreshToken, profile, done) => {
      console.log(req);
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);

      new User({
        username: profile.account,
        googleId: profile.account,
      })
        .save()
        .then((newUser) => {
          console.log("new user created: " + newUser);
          done(null, newUser);
        });
      // check if user already exists in our db
      // User.findOne({ googleId: profile.id }).then((currentUser) => {
      //   if (currentUser) {
      //     // already have the user
      //     console.log("user is: " + currentUser);
      //     done(null, currentUser);
      //   } else {
      //     // if not, create user in our db
      //     new User({
      //       username: profile.displayName,
      //       googleId: profile.id,
      //     })
      //       .save()
      //       .then((newUser) => {
      //         console.log("new user created: " + newUser);
      //         done(null, newUser);
      //       });
      //   }
      // });
    }
    // function (accessToken, refreshToken, profile, cb) {
    //   User.findOrCreate({ exampleId: profile.id }, function (err, user) {
    //     return cb(err, user);
    //   });
    // }
  )
);

//"https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true"

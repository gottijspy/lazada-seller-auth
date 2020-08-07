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
      tokenURL: "https://auth.lazada.com/rest/auth/token/create",
      clientID: keys.lazada.clientID,
      //clientSecret: EXAMPLE_CLIENT_SECRET,
      //callbackURL: "https://fastapicallback.herokuapp.com/body",
      callbackURL: "/auth/lazada/redirect",
    },
    () => {
      // passport callback function
    }
    // function (accessToken, refreshToken, profile, cb) {
    //   User.findOrCreate({ exampleId: profile.id }, function (err, user) {
    //     return cb(err, user);
    //   });
    // }
  )
);

//"https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true"

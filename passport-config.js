
const LocalStrategy = require('passport-local').Strategy;
const database = require('./bace/DataBace');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://morok-1.onrender.com/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    const existingUser = await database.findUserByEmail(profile.emails[0].value);
    if (existingUser) {
      return done(null, existingUser);
    } else {
      const newUser = await database.registerGoogleUser(profile.name.givenName, profile.name.familyName, profile.emails[0].value);
      return done(null, newUser);
    }
  }
));

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await database.loginUser(email, password);
            if (!user) {
                return done(null, false, { message: 'Неправильний email або пароль.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await database.findUserById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

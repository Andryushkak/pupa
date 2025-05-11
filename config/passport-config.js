// config/passport-config.js
const LocalStrategy = require('passport-local').Strategy;
const { findUserByEmail } = require('../bace/DataBace');

function initialize(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await findUserByEmail(email);
        if (!user) return done(null, false, { message: 'No user with that email' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
    }));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        const { User } = require('../bace/DataBace');
        const user = await User.findById(id);
        done(null, user);
    });
}

module.exports = initialize;

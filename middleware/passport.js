const passport = require('passport');
const crypto = require('crypto');
const userModel = require('../model/user');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleClientId = process.env.Google_Client_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.Google_Client_Secret || process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.callbackURL || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3333/api/v1/auth/google/callback';

let profile = (req, res, next) => next();
let loginProfile = (req, res, next) => next();

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profileData, cb) => {
        try {
          let foundUser = await userModel.findOne({ email: profileData._json.email });
          if (!foundUser) {
            foundUser = new userModel({
              firstName: profileData._json.given_name,
              lastName: profileData._json.family_name,
              phoneNumber: `${Math.floor(Math.random() * 1e11)}`,
              email: profileData._json.email,
              password: crypto.randomBytes(32).toString('hex'),
              isVerified: profileData._json.email_verified,
              profilePicture: {
                url: profileData._json.picture,
              },
            });

            await foundUser.save();
          }
          return cb(null, foundUser);
        } catch (error) {
          console.log(error);
          return cb(error);
        }
      }
    )
  );

  profile = passport.authenticate('google', { scope: ['profile', 'email'] });
  loginProfile = passport.authenticate('google', { failureRedirect: '/login' });
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await userModel.findById(id);
    if (!foundUser) {
      return done(new Error('User not found'), null);
    }
    done(null, foundUser);
  } catch (error) {
    done(error, null);
  }
});

module.exports = { passport, profile, loginProfile };
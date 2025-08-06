const passport = require("passport");
const model = require("../models/index");
require("dotenv").config();
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const secret = process.env.JWT_SECRET;
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await model.user.findByPk(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;

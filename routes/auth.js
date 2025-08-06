const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const controller = require("../controller/index")

// Example protected route
router.get("/profile", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ user: req.user });
});
router.delete("/delete/:id",passport.authenticate('jwt', {session: false}), controller.user.deleteProfile)

module.exports = router;

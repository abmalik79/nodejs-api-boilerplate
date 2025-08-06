var express = require('express');
var router = express.Router();
const controller = require("../controller/index")

router.post("/register", controller.user.register)
router.post("/otp-verification", controller.user.verifyOTP)
router.post("/login", controller.user.login)

module.exports = router;

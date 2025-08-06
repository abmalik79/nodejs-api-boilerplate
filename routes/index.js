var express = require('express');
var router = express.Router();

const unauthRoute = require("./unauth")
const authRoute = require("./auth")

router.use("/home", unauthRoute)
router.use("/auth", authRoute)

module.exports = router;

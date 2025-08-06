// controllers/authController.js
const model = require('../models/index');
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const {
    isValidName,
    isValidEmail,
    isValidPassword,
    isValidRollNo
} = require('../utils/validator');
const sendMail = require("../utils/sendEmail")
const { and } = require('sequelize');
const { user } = require('.');

const register = async (req, res) => {
  try {
    const { name, rollNo, email, password, role } = req.body;
    console.log("req.body:  ", req.body);
    // 🔍 Validate input
    if (!isValidName(name)) {
      return res
        .status(400)
        .json({ message: "Invalid name. Min 3 chars required." });
    }

    if (!isValidRollNo(rollNo)) {
      return res.status(400).json({ message: "Roll number is required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // 🔁 Check if user already exists
    const userCheck = await model.user.findOne({ where: { email } });
    if (userCheck) {
      return res
        .status(409)
        .json({ message: "This user is already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString() ;
    const otpExpiry = new Date(Date.now() + 10*60*1000)

    // ✅ Create user
    const newUser = await model.user.create({
      name,
      rollNo,
      email,
      password: hashedPassword,
      role,
      otpCode: otp,
      otpExpiry,
    });
    await sendMail({
     to: newUser.email,
      subject: "Email Verification",
      text: `<h2>Hey ${newUser.name}!</h2>
             <p>Thanks for registering with us. <br/>Your verification code is :  <b>${otp}</b></p>
             <p>It expires in 10 minutes!</p>`
  });

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      userdata: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await model.user.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "this user is already verifed!" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "invalid OTP" });
    }
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully !" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
    try {
        const {email , password } = req.body;

        // console.log("req.body:", req.body);
        // console.log("Email from login:", email);
        // console.log("Valid:", isValidEmail(email));

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Check if user exists
        const user = await model.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isVerified) {
          return res.status(400).json({message: "please verify email before login!"})
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
 
        // Generate JWT token
        const jwt_payload =  {
                id: user.id,
                email: user.email,
                role: user.role
            }
        const token = jwt.sign(
            jwt_payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await model.user.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.id !== Number(id)) {
      return res.status(403).json({
        message: "you cant delete user profile !",
      });
    }
    await sendMail({
  to: user.email,
  subject: "Goodbye from this fucking world 👋",
  text: `<p>Your account has been deleted. We're sad to see you go.</p>`,
});

    await user.destroy();
    return res.status(200).json({
      message: "your profile is successfully deleted!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { register , login , deleteProfile , verifyOTP };

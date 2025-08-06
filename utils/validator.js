// utils/validators.js

const isValidName = (name) => {
    return typeof name === "string" && name.trim().length >= 3;
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === "string" && emailRegex.test(email);
};

const isValidPassword = (password) => {
    return typeof password === "string" && password.length >= 6;
};

const isValidRollNo = (rollNo) => {
    return typeof rollNo === "string" && rollNo.trim().length > 0;
};

module.exports = {
    isValidName,
    isValidEmail,
    isValidPassword,
    isValidRollNo
};

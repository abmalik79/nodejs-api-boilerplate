
const { Sequelize } = require("sequelize");

const user = 'root';
const password = '';
const dbName = 'node_backend';
const host = "localhost";

const sequelize = new Sequelize(dbName, user, password, {
    host: host,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected");
        await sequelize.sync({ alter: true });
    } catch (err) {
        console.error("DB connection error:", err);
    }
};

connectDB();

module.exports = sequelize;

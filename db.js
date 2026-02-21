const mysql = require("mysql2/promise")

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",        // default Laragon
  database: "dummy_reminder",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
})

module.exports = db

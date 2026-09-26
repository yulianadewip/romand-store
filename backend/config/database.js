require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});

const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "romand_store",
  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((error, connection) => {
  if (error) {
    console.error("❌ Gagal terhubung ke MySQL:", error.message);
    return;
  }

  console.log("✅ Berhasil terhubung ke MySQL!");
  connection.release();
});

module.exports = db;

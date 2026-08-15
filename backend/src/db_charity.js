// src/db_charity.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Tạo một kết nối cho database mvp_charity (nay đã dùng chung)
export const charityPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME, // Dùng chung db từ .env
    waitForConnections: true,
    connectionLimit: 10,
});
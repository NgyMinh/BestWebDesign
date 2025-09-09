// src/db_charity.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Tạo một kết nối riêng cho database mvp_charity
export const charityPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: 'mvp_charity', // Chỉ định rõ database ở đây
    waitForConnections: true,
    connectionLimit: 10,
});
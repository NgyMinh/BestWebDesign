import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./src/authRoutes.js";
import volunteerRoutes from "./src/volunteerRoutes.js"; // <-- 1. IMPORT ROUTE MỚI


dotenv.config();

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] YÊU CẦU ĐẾN: ${req.method} ${req.originalUrl}`);
    next();
});

// Để sử dụng __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN.split(","),
        credentials: true,
    })
);

// Serve static files từ thư mục frontend
app.use(express.static(path.join(__dirname, '../../')));

app.use("/api/auth", authRoutes);
app.use(volunteerRoutes); // <-- 2. SỬ DỤNG ROUTE MỚI

// Serve index.html cho tất cả request không phải /api
app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "../index.html"));
    } else {
        next();
    }
});

// Code mới, có xử lý lỗi
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Lỗi: Cổng ${PORT} đã được sử dụng. Hãy đóng chương trình đang dùng cổng này hoặc đợi một lát rồi thử lại.`);
    } else {
        console.error('Lỗi server:', err);
    }
});
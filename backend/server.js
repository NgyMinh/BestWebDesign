import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./src/authRoutes.js";

dotenv.config();

const app = express();

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
app.use(express.static(path.join(__dirname, '../')));

app.use("/api/auth", authRoutes);

// Serve index.html cho tất cả request không phải /api
app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "../index.html"));
    } else {
        next();
    }
});

app.listen(process.env.PORT, () => {
    console.log(`✅ Server chạy tại http://localhost:${process.env.PORT}`);
});
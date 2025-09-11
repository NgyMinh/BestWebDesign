// src/authRoutes.js

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // Import thư viện bcrypt
import { pool } from "./db.js";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

// --- ĐĂNG KÝ (PHIÊN BẢN HOÀN THIỆN VỚI MÃ HÓA) ---
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Kiểm tra email đã tồn tại chưa
        const [exist] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (exist.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt); // Mật khẩu đã được mã hóa an toàn

        // 3. Lưu user vào database với đúng tên cột `password_hash`
        await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, passwordHash] // Lưu mật khẩu đã mã hóa
        );

        res.status(201).json({ message: "Đăng ký thành công" });

    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});


// --- ĐĂNG NHẬP (PHIÊN BẢN HOÀN THIỆN VỚI MÃ HÓA) ---
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Tìm user bằng email
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const user = rows[0];

        // 2. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        // Sửa `user.password` thành `user.password_hash`
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        // 3. Tạo token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 4. Gửi token về cho client qua cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Chuyển thành true nếu dùng HTTPS
            sameSite: "lax",
        });

        // 5. Gửi thông tin user về cho client
        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Lấy thông tin user hiện tại
router.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});

// Đăng xuất
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Đã đăng xuất" });
});

export default router;
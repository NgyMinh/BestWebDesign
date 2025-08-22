import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const [exist] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (exist.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
            username,
            email,
            password, // thực tế nên hash
        ]);

        res.json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }
        const user = rows[0];

        if (user.password !== password) {
            return res.status(400).json({ message: "Sai mật khẩu" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        // QUAN TRỌNG: Trả về thông tin user
        res.json({
            message: "Đăng nhập thành công",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Lấy thông tin user
router.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});

// Đăng xuất
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Đã đăng xuất" });
});

export default router;
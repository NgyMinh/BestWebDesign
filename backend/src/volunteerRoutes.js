// src/volunteerRoutes.js
import express from "express";
import { charityPool } from "./db_charity.js";

const router = express.Router();

// THAY ĐỔI Ở ĐÂY: Khai báo đường dẫn đầy đủ
router.post("/api/volunteers/register", async (req, res) => {
    console.log("--- BẮT ĐẦU XỬ LÝ ROUTE MỚI ---");
    console.log("Dữ liệu nhận được:", req.body);

    try {
        const {
            fullName, dob, email, phone,
            location, interest, availability, skills,
        } = req.body;

        if (!fullName || !dob || !email || !phone || !location || !interest || !availability) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ các trường bắt buộc." });
        }

        const sql = `
            INSERT INTO volunteers (full_name, dob, email, phone, location, interest, availability, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [fullName, dob, email, phone, location, interest, availability, skills || null];

        await charityPool.query(sql, values);
        console.log("Thực thi SQL query THÀNH CÔNG!");

        res.status(201).json({ message: "Đăng ký tình nguyện viên thành công! Cảm ơn bạn." });

    } catch (error) {
        console.error("!!! LỖI NGHIÊM TRỌNG TRONG VOLUNTEER ROUTE:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi phía máy chủ." });
    }
});

export default router;
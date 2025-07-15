const pool = require('../config/db');

exports.registerVolunteer = async (req, res) => {
    const { fullName, dob, email, phone, location, interest, availability } = req.body;

    try {
        await pool.query(
            'INSERT INTO volunteers (full_name, dob, email, phone, location, interest, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [fullName, dob, email, phone, location, interest, availability]
        );
        res.status(201).json({ message: 'Đăng ký tình nguyện viên thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
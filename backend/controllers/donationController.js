const pool = require('../config/db');

exports.createDonation = async (req, res) => {
    const { country, project, amount, date, name, email, phone, address, paymentMethod } = req.body;

    try {
        await pool.query(
            'INSERT INTO donations (country, project, amount, date, name, email, phone, address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [country, project, amount, date, name, email, phone, address, paymentMethod]
        );
        res.status(201).json({ message: 'Quyên góp thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

exports.getDonations = async (req, res) => {
    try {
        const [donations] = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
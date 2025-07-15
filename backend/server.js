// server.js
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mvp_donation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Smart contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function donate(string memory _project, string memory _message, bool _isAnonymous) public payable",
    "function getDonation(uint256 _donationId) public view returns (address, uint256, string, string, uint256, bool)",
    "function getLatestDonations(uint256 _count) public view returns (uint256[], address[], uint256[], string[], uint256[], bool[])",
    "function totalDonations() public view returns (uint256)",
    "function donationCount() public view returns (uint256)",
    "function getProjectTotal(string memory _project) public view returns (uint256)",
    "event DonationMade(uint256 indexed donationId, address indexed donor, uint256 amount, string project, string message, bool isAnonymous)"
];

// Provider cho việc đọc data từ blockchain
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Routes

// Lấy thông tin contract
app.get('/api/contract-info', async (req, res) => {
    try {
        const totalDonations = await contract.totalDonations();
        const donationCount = await contract.donationCount();

        res.json({
            success: true,
            data: {
                contractAddress: CONTRACT_ADDRESS,
                totalDonations: ethers.utils.formatEther(totalDonations),
                donationCount: donationCount.toString()
            }
        });
    } catch (error) {
        console.error('Error getting contract info:', error);
        res.status(500).json({ success: false, error: 'Failed to get contract info' });
    }
});

// Lấy danh sách donations từ blockchain
app.get('/api/crypto-donations', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;

        const donationCount = await contract.donationCount();
        const totalCount = parseInt(donationCount.toString());

        if (totalCount === 0) {
            return res.json({
                success: true,
                data: {
                    donations: [],
                    totalCount: 0,
                    currentPage: page,
                    totalPages: 0
                }
            });
        }

        const startIndex = Math.max(0, totalCount - (page * limit));
        const endIndex = Math.min(totalCount, totalCount - ((page - 1) * limit));
        const count = endIndex - startIndex;

        const [ids, donors, amounts, projects, timestamps, isAnonymous] =
            await contract.getLatestDonations(count);

        const donations = [];
        for (let i = 0; i < ids.length; i++) {
            donations.push({
                id: ids[i].toString(),
                donor: isAnonymous[i] ? 'Ẩn danh' : donors[i],
                amount: ethers.utils.formatEther(amounts[i]),
                project: projects[i],
                timestamp: new Date(timestamps[i].toNumber() * 1000).toLocaleString('vi-VN'),
                isAnonymous: isAnonymous[i]
            });
        }

        res.json({
            success: true,
            data: {
                donations,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Error getting crypto donations:', error);
        res.status(500).json({ success: false, error: 'Failed to get crypto donations' });
    }
});

// Lấy thông tin tổng quyên góp theo project
app.get('/api/project-stats/:project', async (req, res) => {
    try {
        const project = req.params.project;
        const total = await contract.getProjectTotal(project);

        res.json({
            success: true,
            data: {
                project,
                totalAmount: ethers.utils.formatEther(total)
            }
        });
    } catch (error) {
        console.error('Error getting project stats:', error);
        res.status(500).json({ success: false, error: 'Failed to get project stats' });
    }
});

// Lưu transaction hash khi user donate
app.post('/api/crypto-donation', async (req, res) => {
    try {
        const { txHash, donor, amount, project, message, isAnonymous } = req.body;

        // Lưu vào database để tracking
        await pool.execute(`
            INSERT INTO crypto_donations (tx_hash, donor_address, amount, project, message, is_anonymous, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [txHash, donor, amount, project, message || '', isAnonymous || false]);

        res.json({
            success: true,
            message: 'Crypto donation recorded successfully',
            txHash
        });
    } catch (error) {
        console.error('Error recording crypto donation:', error);
        res.status(500).json({ success: false, error: 'Failed to record crypto donation' });
    }
});

// Kiểm tra trạng thái transaction
app.get('/api/transaction-status/:txHash', async (req, res) => {
    try {
        const txHash = req.params.txHash;
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return res.json({
                success: true,
                data: {
                    status: 'pending',
                    message: 'Transaction is still pending'
                }
            });
        }

        const status = receipt.status === 1 ? 'success' : 'failed';

        res.json({
            success: true,
            data: {
                status,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                message: status === 'success' ? 'Transaction successful' : 'Transaction failed'
            }
        });
    } catch (error) {
        console.error('Error checking transaction status:', error);
        res.status(500).json({ success: false, error: 'Failed to check transaction status' });
    }
});

// Combine donations (traditional + crypto)
app.get('/api/all-donations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Lấy traditional donations
        const [traditionalRows] = await pool.execute(`
            SELECT id, name as donor, amount, created_at as timestamp, 'VND' as currency
            FROM donations 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        // Lấy crypto donations
        const donationCount = await contract.donationCount();
        const totalCrypto = parseInt(donationCount.toString());

        let cryptoDonations = [];
        if (totalCrypto > 0) {
            const [ids, donors, amounts, projects, timestamps, isAnonymous] =
                await contract.getLatestDonations(Math.min(limit, totalCrypto));

            cryptoDonations = ids.map((id, index) => ({
                id: `crypto_${id.toString()}`,
                donor: isAnonymous[index] ? 'Ẩn danh' : donors[index],
                amount: ethers.utils.formatEther(amounts[index]),
                timestamp: new Date(timestamps[index].toNumber() * 1000),
                currency: 'ETH'
            }));
        }

        // Combine và sort
        const allDonations = [...traditionalRows, ...cryptoDonations]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        res.json({
            success: true,
            data: {
                donations: allDonations,
                currentPage: page,
                totalPages: Math.ceil((traditionalRows.length + totalCrypto) / limit)
            }
        });
    } catch (error) {
        console.error('Error getting all donations:', error);
        res.status(500).json({ success: false, error: 'Failed to get all donations' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Database schema
const createTables = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS crypto_donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tx_hash VARCHAR(66) UNIQUE NOT NULL,
                donor_address VARCHAR(42) NOT NULL,
                amount DECIMAL(20, 8) NOT NULL,
                project VARCHAR(255) NOT NULL,
                message TEXT,
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();
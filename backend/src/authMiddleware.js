import jwt from "jsonwebtoken";

// Middleware kiểm tra authentication
export const requireAuth = (req, res, next) => {
    const token = req.cookies.token;

    console.log("🔍 Token nhận được:", token);

    if (!token) {
        return res.status(401).json({ message: "Không có token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decoded:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("❌ Token error:", error.message);
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};
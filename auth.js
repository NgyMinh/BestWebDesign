// auth.js - Fixed version
const API_URL = "http://localhost:3000/api/auth"; // backend server

// Đăng ký
async function register(email, password, username) {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username }),
            credentials: "include"
        });
        return await res.json();
    } catch (err) {
        console.error("Register error:", err);
        return { message: "Lỗi kết nối server" };
    }
}

// Đăng nhập
async function login(email, password) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });
        return await res.json();
    } catch (err) {
        console.error("Login error:", err);
        return { message: "Lỗi kết nối server" };
    }
}

// Lấy thông tin user hiện tại
async function getCurrentUser() {
    try {
        const res = await fetch(`${API_URL}/me`, {
            method: "GET",
            credentials: "include"
        });
        return await res.json();
    } catch (err) {
        console.error("Get user error:", err);
        return null;
    }
}

// Kiểm tra user khi load trang - Fixed function name
async function checkUser() {
    try {
        console.log("🔍 Checking user authentication...");
        const res = await fetch(`${API_URL}/me`, {
            method: "GET",
            credentials: "include"
        });

        console.log("📡 Response status:", res.status);
        const data = await res.json();
        console.log("📦 Response data:", data);

        const authLinks = document.getElementById("auth-links");
        const userInfo = document.getElementById("user-info");
        const usernameElement = document.getElementById("username");

        if (!authLinks || !userInfo || !usernameElement) {
            console.error("❌ Required DOM elements not found");
            return;
        }

        if (res.ok && data.user) {
            console.log("✅ User authenticated:", data.user.username);
            authLinks.style.display = "none";
            userInfo.style.display = "block";
            usernameElement.textContent = data.user.username;
        } else {
            console.log("🚫 User not authenticated");
            authLinks.style.display = "block";
            userInfo.style.display = "none";
        }
    } catch (err) {
        console.error("❌ Auth check failed:", err);
        // Show login links on error
        const authLinks = document.getElementById("auth-links");
        const userInfo = document.getElementById("user-info");
        if (authLinks && userInfo) {
            authLinks.style.display = "block";
            userInfo.style.display = "none";
        }
    }
}

// Đăng xuất
async function logout() {
    try {
        console.log("🚪 Logging out...");
        await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include"
        });
        console.log("✅ Logout successful");
        location.reload();
    } catch (err) {
        console.error("❌ Logout error:", err);
        // Force reload anyway
        location.reload();
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { register, login, getCurrentUser, checkUser, logout };
} else {
    // Browser environment - attach to window
    window.authFunctions = { register, login, getCurrentUser, checkUser, logout };
}

// Auto-check authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM loaded, starting auth check...");
    checkUser();

    // Add logout event listener
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
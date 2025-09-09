// Fixed auth.js - Final Version
const API_URL = "http://localhost:3000/api/auth";

// Unified login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        const data = await response.json();

        // === SỬA LỖI TẠI ĐÂY ===
        // Logic mới: Chỉ cần kiểm tra server trả về "OK" (200), không cần kiểm tra data.token nữa.
        // Vì token đã được server gửi về dưới dạng HttpOnly cookie.
        if (response.ok) {
            // Lấy thông tin user từ `data.user` hoặc trực tiếp từ `data`
            const userFromServer = data.user || data;

            const userData = {
                // Cung cấp giá trị mặc định nếu server không trả về username
                username: userFromServer.username || email.split('@')[0],
                email: userFromServer.email || email,
                loginTime: new Date().toISOString()
                // Chúng ta không lưu token vào localStorage nữa vì nó đã được trình duyệt quản lý an toàn.
            };

            localStorage.setItem('currentUser', JSON.stringify(userData));
            return { success: true, user: userData };
        } else {
            return { success: false, message: data.message || "Đăng nhập thất bại" };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Lỗi kết nối server" };
    }
}

// Register function
async function register(email, password, username) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username }),
            credentials: "include"
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, ...data };
        } else {
            return { success: false, message: data.message || "Đăng ký thất bại" };
        }
    } catch (error) {
        console.error("Register error:", error);
        return { success: false, message: "Lỗi kết nối server" };
    }
}

// Check user authentication status
function checkUser() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            updateUIForLoggedInUser(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            logout();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

// Update UI when user is logged in
function updateUIForLoggedInUser(userData) {
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const usernameElement = document.getElementById('username');

    if (authLinks) authLinks.style.display = 'none';
    if (userInfo && usernameElement) {
        usernameElement.textContent = userData.username;
        userInfo.style.display = 'block';
    }
}

// Update UI when user is logged out
function updateUIForLoggedOutUser() {
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');

    if (authLinks) authLinks.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    if (!window.location.pathname.includes('login_register.html')) {
        window.location.reload();
    } else {
        updateUIForLoggedOutUser();
    }
}

// Setup logout button event listener
function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Initialize authentication on page load
function initAuth() {
    checkUser();
    setupLogoutButton();
}

// Make functions globally available and auto-initialize
if (typeof window !== 'undefined') {
    window.login = login;
    window.register = register;
    window.logout = logout;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
}
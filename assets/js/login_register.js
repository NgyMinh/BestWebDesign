document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "http://localhost:3000/api/auth"; // backend

    const signupForm = document.querySelector(".signup form");
    const loginForm = document.querySelector(".login form");

    // Đăng ký
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = signupForm.querySelector('input[name="txt"]').value.trim();
        const email = signupForm.querySelector('input[name="email"]').value.trim();
        const password = signupForm.querySelector('input[name="pswd"]').value.trim();

        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");

            alert("Đăng ký thành công! Hãy đăng nhập.");
            signupForm.reset();
            document.getElementById("chk").checked = true; // chuyển sang tab login
        } catch (err) {
            alert(err.message);
        }
    });

    // Đăng nhập
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[name="email"]').value.trim();
        const password = loginForm.querySelector('input[name="pswd"]').value.trim();

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

            alert(`Chào mừng ${data.username}!`);
            window.location.href = "index.html"; // quay về trang chủ
        } catch (err) {
            alert(err.message);
        }
    });
});

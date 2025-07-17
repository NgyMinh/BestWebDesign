// auth-validation.js

document.addEventListener("DOMContentLoaded", () => {
	function showAlert(message, type = "danger") {
		const existingAlert = document.querySelector(".validation-alert");
		if (existingAlert) existingAlert.remove();

		const alertDiv = document.createElement("div");
		alertDiv.className = `alert alert-${type} alert-dismissible fade show validation-alert`;
		alertDiv.style.cssText = `
	    position: fixed;
	    top: 20px; /* Đẩy sát mép trên */
	    left: 50%;
	    transform: translateX(-50%); /* Chỉ dịch ngang */
	    z-index: 9999;
	    min-width: 300px;
	    max-width: 500px;
	    text-align: center;
	    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	    font-size: 16px;
	    font-weight: 500;
    `;

		alertDiv.innerHTML = `
		<i class="fas fa-bell me-2"></i>
		<strong>Thông báo:</strong><br> ${message}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="position:absolute; top:10px; right:15px;"></button>
	`;
		document.body.appendChild(alertDiv);

		setTimeout(() => {
			if (alertDiv?.parentNode) {
				alertDiv.classList.remove("show");
				setTimeout(() => alertDiv.remove(), 150);
			}
		}, 4000);
	}

	function isValidEmail(email) {
		return /^\S+@\S+\.\S+$/.test(email);
	}

	function isValidPassword(password) {
		return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
	}

	// Detect if this is register or login
	const isRegister = document.querySelector("p")?.textContent.includes("Đăng ký");

	const form = document.querySelector("form");
	const submitBtn = form.querySelector("a.button-register") || form.querySelector("a");

	submitBtn?.addEventListener("click", (e) => {
		e.preventDefault();
		const inputs = form.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
		const values = Array.from(inputs).map((i) => i.value.trim());
		let errors = [];

		if (isRegister) {
			const [name, email, password, confirm] = values;
			const checkbox = form.querySelector("input[type='checkbox']");
			if (!name) errors.push("• Vui lòng nhập họ và tên");
			if (!email || !isValidEmail(email)) errors.push("• Vui lòng nhập email hợp lệ");
			if (!isValidPassword(password)) errors.push("• Mật khẩu phải từ 6 ký tự, bao gồm cả chữ và số");
			if (confirm !== password) errors.push("• Mật khẩu nhập lại không khớp");
			if (!checkbox?.checked) errors.push("• Vui lòng đồng ý với điều khoản");

			if (errors.length > 0) {
				showAlert(errors.join("<br>"));
			} else {
				showAlert("Đăng ký thành công!", "success");
				setTimeout(() => {
					window.location.href = "index.html";
				}, 3000);
			}
		} else {
			const [email, password] = values;
			if (!email || !isValidEmail(email)) errors.push("• Vui lòng nhập email hợp lệ");
			if (!isValidPassword(password)) errors.push("• Mật khẩu phải từ 6 ký tự, bao gồm cả chữ và số");

			if (errors.length > 0) {
				showAlert(errors.join("<br>"));
			} else {
				showAlert("Đăng nhập thành công!", "success");
				setTimeout(() => {
					window.location.href = "index.html";
				}, 3000);
			}
		}
	});
});

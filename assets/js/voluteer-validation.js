// volunteer-validation.js

document.addEventListener("DOMContentLoaded", function () {
	const form = document.querySelector(".volunteer-card-form");

	form.addEventListener("submit", function (e) {
		e.preventDefault();

		const fullName = document.getElementById("fullName");
		const dob = document.getElementById("dob");
		const email = document.getElementById("email");
		const phone = document.getElementById("phone");
		const location = document.getElementById("location");
		const interest = document.getElementById("interest");
		const availability = document.getElementById("availability");
		const privacyPolicy = document.getElementById("privacyPolicy");

		let isValid = true;
		const errors = [];

		clearErrors();

		if (!fullName.value.trim()) {
			showError(fullName, "Vui lòng nhập họ và tên.");
			errors.push("• Vui lòng nhập họ và tên");
			isValid = false;
		}

		if (!isValidDate(dob.value.trim(), dob.type)) {
			showError(dob, "Vui lòng nhập ngày sinh hợp lệ (DD-MM-YYYY hoặc dùng lịch).");
			errors.push("• Vui lòng nhập ngày sinh hợp lệ (DD-MM-YYYY hoặc dùng lịch)");
			isValid = false;
		}

		if (!validateEmail(email.value)) {
			showError(email, "Email không hợp lệ.");
			errors.push("• Vui lòng nhập địa chỉ email hợp lệ (ví dụ: example@gmail.com)");
			isValid = false;
		}

		if (!validatePhone(phone.value.trim())) {
			showError(phone, "Số điện thoại phải gồm 10-11 chữ số.");
			errors.push("• Số điện thoại phải có từ 10-11 chữ số (ví dụ: 0123456789)");
			isValid = false;
		}

		if (!location.value) {
			showError(location, "Vui lòng chọn khu vực.");
			errors.push("• Vui lòng chọn khu vực");
			isValid = false;
		}

		if (!interest.value) {
			showError(interest, "Vui lòng chọn lĩnh vực.");
			errors.push("• Vui lòng chọn lĩnh vực quan tâm");
			isValid = false;
		}

		if (!availability.value.trim()) {
			showError(availability, "Vui lòng nhập thời gian/kỹ năng tham gia.");
			errors.push("• Vui lòng nhập thời gian/kỹ năng tham gia");
			isValid = false;
		}

		if (!privacyPolicy.checked) {
			showError(privacyPolicy, "Bạn cần đồng ý với chính sách bảo mật.");
			errors.push("• Vui lòng đọc và đồng ý với chính sách bảo mật");
			isValid = false;
		}

		if (!isValid) {
			showAlert('Vui lòng kiểm tra lại thông tin:<br>' + errors.join('<br>'));
		} else {
			showAlert('Đăng ký tình nguyện viên thành công! Cảm ơn bạn đã tham gia.', 'success');
			// Reset form after successful submission
			setTimeout(() => {
				form.reset();
				clearErrors();
			}, 2000);
		}
	});

	// Bootstrap Alert Function (giống như trong donate-validation.js)
	function showAlert(message, type = 'danger') {
		// Remove existing alert if any
		const existingAlert = document.querySelector('.validation-alert');
		if (existingAlert) {
			existingAlert.remove();
		}

		// Create new alert
		const alertDiv = document.createElement('div');
		alertDiv.className = `alert alert-${type} alert-dismissible fade show validation-alert`;
		alertDiv.style.cssText = `
			position: fixed;
			top: 90px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 9999;
			min-width: 300px;
			max-width: 500px;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		`;

		const iconClass = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
		alertDiv.innerHTML = `
			<i class="${iconClass} me-2"></i>
			<strong>Thông báo:</strong> ${message}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		`;

		// Add to page
		document.body.appendChild(alertDiv);

		// Auto dismiss after 5 seconds
		setTimeout(() => {
			if (alertDiv && alertDiv.parentNode) {
				alertDiv.classList.remove('show');
				setTimeout(() => alertDiv.remove(), 150);
			}
		}, 5000);
	}

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email.toLowerCase());
	}

	function validatePhone(phone) {
		// Cho phép 10-11 chữ số, có thể bắt đầu bằng 0
		const re = /^0?[0-9]{9,10}$/;
		return re.test(phone);
	}

	function isValidDate(dateStr, type = "") {
		if (type === "date") return dateStr !== ""; // native HTML5 date input, chỉ kiểm tra không rỗng

		if (!dateStr) return false;

		// Format: DD-MM-YYYY
		const regex = /^\d{2}-\d{2}-\d{4}$/;
		if (!regex.test(dateStr)) return false;

		const [day, month, year] = dateStr.split("-").map(Number);

		// Kiểm tra năm hợp lệ (không quá xa trong quá khứ hoặc tương lai)
		const currentYear = new Date().getFullYear();
		if (year < 1900 || year > currentYear) return false;

		const date = new Date(year, month - 1, day);
		return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
	}

	function showError(input, message) {
		const parent = input.closest(".col-6, .col-12") || input.parentElement;
		let error = parent.querySelector(".error-message");

		if (!error) {
			error = document.createElement("div");
			error.className = "error-message";
			error.style.color = "#dc3545"; // Đổi màu từ #ffc107 thành đỏ Bootstrap
			error.style.fontSize = "0.875rem";
			error.style.marginTop = "4px";
			error.setAttribute("role", "alert");
			parent.appendChild(error);
		}

		error.textContent = message;
		input.classList.add("is-invalid");
		input.setAttribute("aria-describedby", "error-" + input.id);
		error.id = "error-" + input.id;
	}

	function clearErrors() {
		document.querySelectorAll(".error-message").forEach((el) => el.remove());
		document.querySelectorAll(".is-invalid").forEach((el) => {
			el.classList.remove("is-invalid");
			el.removeAttribute("aria-describedby");
		});
	}
});
// voluteer-validation.js

document.addEventListener("DOMContentLoaded", function () {
	const form = document.querySelector(".volunteer-card-form");

	// Thêm "async" để có thể sử dụng "await" cho fetch
	form.addEventListener("submit", async function (e) {
		e.preventDefault();

		const fullName = document.getElementById("fullName");
		const dob = document.getElementById("dob");
		const email = document.getElementById("email");
		const phone = document.getElementById("phone");
		const location = document.getElementById("location");
		const interest = document.getElementById("interest");
		const availability = document.getElementById("availability");
		const skills = document.getElementById("skills"); // Lấy thêm trường skills
		const privacyPolicy = document.getElementById("privacyPolicy");

		let isValid = true;
		const errors = [];

		clearErrors();

		// --- PHẦN VALIDATION GIỮ NGUYÊN ---
		if (!fullName.value.trim()) {
			showError(fullName, "Vui lòng nhập họ và tên.");
			errors.push("• Vui lòng nhập họ và tên");
			isValid = false;
		}

		if (!isValidDate(dob.value.trim(), dob.type)) {
			showError(dob, "Vui lòng nhập ngày sinh hợp lệ.");
			errors.push("• Vui lòng nhập ngày sinh hợp lệ");
			isValid = false;
		}

		if (!validateEmail(email.value)) {
			showError(email, "Email không hợp lệ.");
			errors.push("• Vui lòng nhập địa chỉ email hợp lệ");
			isValid = false;
		}

		if (!validatePhone(phone.value.trim())) {
			showError(phone, "Số điện thoại phải gồm 10-11 chữ số.");
			errors.push("• Số điện thoại phải có từ 10-11 chữ số");
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
		// --- KẾT THÚC VALIDATION ---

		if (!isValid) {
			showAlert('Vui lòng kiểm tra lại thông tin:<br>' + errors.join('<br>'));
		} else {
			// Nếu form hợp lệ, tạo đối tượng dữ liệu và gửi lên server
			const formData = {
				fullName: fullName.value.trim(),
				dob: dob.value.trim(),
				email: email.value.trim(),
				phone: phone.value.trim(),
				location: location.value,
				interest: interest.value,
				availability: availability.value.trim(),
				skills: skills.value.trim(),
			};

			try {
				// Sử dụng fetch để gửi yêu cầu POST đến backend
				const response = await fetch('http://localhost:3000/api/volunteers/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData)
				});

				const result = await response.json(); // Đọc kết quả JSON từ server

				if (response.ok) { // Nếu request thành công (status code 200-299)
					showAlert(result.message, 'success');
					setTimeout(() => {
						form.reset();
						clearErrors();
					}, 2000);
				} else { // Nếu có lỗi từ server (status code 400-599)
					showAlert(result.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'danger');
				}
			} catch (error) {
				// Bắt lỗi nếu không thể kết nối đến server
				console.error('Fetch error:', error);
				showAlert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.', 'danger');
			}
		}
	});

	// --- CÁC HÀM HELPER GIỮ NGUYÊN ---
	function showAlert(message, type = 'danger') {
		const existingAlert = document.querySelector('.validation-alert');
		if (existingAlert) {
			existingAlert.remove();
		}
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
		document.body.appendChild(alertDiv);
		setTimeout(() => {
			if (alertDiv && alertDiv.parentNode) {
				alertDiv.classList.remove('show');
				setTimeout(() => alertDiv.remove(), 150);
			}
		}, 5000);
	}

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}

	function validatePhone(phone) {
		const re = /^0?[0-9]{9,10}$/;
		return re.test(phone);
	}

	function isValidDate(dateStr, type = "") {
		if (type === "date") return dateStr !== "";
		if (!dateStr) return false;
		const regex = /^\d{4}-\d{2}-\d{2}$/; // Sửa lại regex cho chuẩn YYYY-MM-DD của input type="date"
		if (!regex.test(dateStr)) return false;
		const date = new Date(dateStr);
		const timestamp = date.getTime();
		if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
			return false;
		}
		return date.toISOString().startsWith(dateStr);
	}

	function showError(input, message) {
		const parent = input.closest(".col-6, .col-12") || input.parentElement;
		let error = parent.querySelector(".error-message");
		if (!error) {
			error = document.createElement("div");
			error.className = "error-message";
			error.style.color = "#dc3545";
			error.style.fontSize = "0.875rem";
			error.style.marginTop = "4px";
			error.setAttribute("role", "alert");
			parent.appendChild(error);
		}
		error.textContent = message;
		input.classList.add("is-invalid");
	}

	function clearErrors() {
		document.querySelectorAll(".error-message").forEach((el) => el.remove());
		document.querySelectorAll(".is-invalid").forEach((el) => {
			el.classList.remove("is-invalid");
		});
	}
});
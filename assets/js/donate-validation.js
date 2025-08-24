document.addEventListener("DOMContentLoaded", () => {
	console.log("donate-validation.js loaded");

	// Select form elements for each step
	const step1Form = document.querySelector("#step1");
	const step2Form = document.querySelector("#step2");
	const step3Form = document.querySelector("#step3");
	const donationAmountInput = document.getElementById("donationAmount");

	// 👉 SỬA Ở ĐÂY: dùng class "donate-input-with-icon-1" thay vì "form-control"
	const countrySelect = document.querySelector("#step1 select.donate-input-with-icon-1");
	const projectSelect = document.querySelector("#step1 select.donate-input-with-icon-2");
	const nameInput = document.querySelector('#step2 input[placeholder="Họ và tên"]');
	const phoneInput = document.querySelector('#step2 input[placeholder="Số điện thoại"]');
	const addressInput = document.querySelector('#step2 input[placeholder="Địa chỉ"]');
	const paymentOptions = document.querySelectorAll("#payment-methods .payment-option");
	const termsCheckbox = document.querySelector("#step3 .form-check-input");
	const nextButtons = document.querySelectorAll(".btn-next");
	const backButtons = document.querySelectorAll(".btn-back");

	// QR Toggle
	function showQRInfo() {
		document.querySelector("#contact-info .contact-box").style.display = "none";
		document.getElementById("qr-info").style.display = "block";
	}

	function hideQRInfo() {
		document.querySelector("#contact-info .contact-box").style.display = "block";
		document.getElementById("qr-info").style.display = "none";
	}

	// Bootstrap Alert Function
	function showAlert(message, type = "danger") {
		// Remove existing alert if any
		const existingAlert = document.querySelector(".validation-alert");
		if (existingAlert) {
			existingAlert.remove();
		}

		// Create new alert
		const alertDiv = document.createElement("div");
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

		alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Thông báo:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

		// Add to page
		document.body.appendChild(alertDiv);

		// Auto dismiss after 5 seconds
		setTimeout(() => {
			if (alertDiv && alertDiv.parentNode) {
				alertDiv.classList.remove("show");
				setTimeout(() => alertDiv.remove(), 150);
			}
		}, 5000);
	}

	// Validation helpers
	function isValidDate(dateString) {
		const regex = /^\d{2}-\d{2}-\d{4}$/;
		if (!regex.test(dateString)) return false;
		const [day, month, year] = dateString.split("-").map(Number);
		const date = new Date(year, month - 1, day);
		return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
	}

	function isValidPhone(phone) {
		return /^\d{10}$/.test(phone);
	}

	function isValidAmount(amount) {
		const num = parseInt(amount.replace(/[^0-9]/g, ""), 10);
		return !isNaN(num) && num > 1000;
	}

	// Step 1 validation
	// function validateStep1() {
	// 	const errors = [];

	// 	if (!countrySelect || !countrySelect.value) {
	// 		errors.push("• Vui lòng chọn quốc gia");
	// 	}

	// 	if (!projectSelect || !projectSelect.value) {
	// 		errors.push("• Vui lòng chọn dự án đóng góp");
	// 	}

	// 	const isCustomAmount = document.getElementById("customAmountInput")?.style.display !== "none";
	// 	const amountInput = isCustomAmount ? document.querySelector("#customAmountInput input") : donationAmountInput;

	// 	if (!amountInput || !amountInput.value || !isValidAmount(amountInput.value)) {
	// 		errors.push("• Vui lòng nhập số tiền hợp lệ (lớn hơn 1.000 VND)");
	// 	}

	// 	if (errors.length > 0) {
	// 		showAlert("Vui lòng kiểm tra lại thông tin:<br>" + errors.join("<br>"));
	// 		return false;
	// 	}

	// 	return true;
	// }

	// Step 2 validation
	// function validateStep2() {
	// 	const errors = [];

	// 	if (!nameInput?.value.trim()) {
	// 		errors.push("• Vui lòng nhập họ và tên");
	// 	}

	// 	if (!phoneInput?.value.trim() || !isValidPhone(phoneInput.value)) {
	// 		errors.push("• Số điện thoại phải có đúng 10 chữ số (ví dụ: 0123456789)");
	// 	}

	// 	if (!addressInput?.value.trim()) {
	// 		errors.push("• Vui lòng nhập địa chỉ liên hệ");
	// 	}

	// 	if (errors.length > 0) {
	// 		showAlert("Vui lòng kiểm tra lại thông tin:<br>" + errors.join("<br>"));
	// 		return false;
	// 	}

	// 	return true;
	// }

	// Step 3 validation
	// function validateStep3() {
	// 	const errors = [];

	// 	const selected = Array.from(paymentOptions).some((el) => el.classList.contains("active"));
	// 	if (!selected) {
	// 		errors.push("• Vui lòng chọn một phương thức thanh toán");
	// 	}

	// 	if (!termsCheckbox?.checked) {
	// 		errors.push("• Vui lòng đọc và đồng ý với các điều khoản");
	// 	}

	// 	if (errors.length > 0) {
	// 		showAlert("Vui lòng kiểm tra lại thông tin:<br>" + errors.join("<br>"));
	// 		return false;
	// 	}

	// 	return true;
	// }

	// Step Navigation
	function goToStep(stepNumber) {
		for (let i = 1; i <= 4; i++) {
			document.getElementById(`step${i}`).classList.add("hidden");
			document.getElementById(`circle${i}`).classList.remove("active");
			document.getElementById(`label${i}`).classList.remove("active");
		}
		document.getElementById(`step${stepNumber}`).classList.remove("hidden");
		document.getElementById(`circle${stepNumber}`).classList.add("active");
		document.getElementById(`label${stepNumber}`).classList.add("active");
	}

	nextButtons.forEach((btn, idx) => {
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			let isValid = false;
			if (idx === 0) isValid = validateStep1();
			if (idx === 1) isValid = validateStep2();
			if (idx === 2) isValid = validateStep3();
			if (idx === 3) {
				goToStep(1);
				hideQRInfo();
				showAlert("Cảm ơn bạn đã hoàn thành quyên góp! Form đã được reset.", "success");
				return;
			}
			if (isValid) {
				goToStep(idx + 2);
				if (idx === 1 || idx === 2) showQRInfo();
			}
		});
	});

	backButtons.forEach((btn, idx) => {
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			goToStep(idx + 1);
			hideQRInfo();
		});
	});

	// Country log
	countrySelect?.addEventListener("change", () => {
		console.log("Country selected:", countrySelect.value);
	});
});

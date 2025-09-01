// ======== QR Code Functions ========
function showQRInfo() {
	const qrInfo = document.getElementById("qr-info");
	if (qrInfo) qrInfo.style.display = "block";
}

function hideQRInfo() {
	const qrInfo = document.getElementById("qr-info");
	if (qrInfo) qrInfo.style.display = "none";
}

// Cập nhật QR động theo số tiền
function updateQRCode(selectedAmount, bankId, accountNo, addInfo) {
	const amount = selectedAmount || document.getElementById("donationAmount").value || "";
	const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${addInfo}`;
	const qrImg = document.getElementById("qr-code");
	if (qrImg) qrImg.src = qrUrl;
}

// Gắn sự kiện cho các phương thức thanh toán
function setupQRCodeListeners(selectedAmountVar, bankIdVar, accountNoVar, addInfoVar) {
	const paymentOptions = document.querySelectorAll("#payment-methods .payment-option");
	paymentOptions.forEach((option) => {
		option.addEventListener("click", () => {
			paymentOptions.forEach((o) => o.classList.remove("active"));
			option.classList.add("active");

			if (option.textContent.includes("Mã QR")) {
				showQRInfo();
				updateQRCode(selectedAmountVar, bankIdVar, accountNoVar, addInfoVar);
			} else {
				hideQRInfo();
			}
		});
	});
}

// Khởi tạo QR code khi load
document.addEventListener("DOMContentLoaded", () => {
	// Nhớ truyền biến từ donate.js
	setupQRCodeListeners(selectedAmount, bankId, accountNo, addInfo);
});

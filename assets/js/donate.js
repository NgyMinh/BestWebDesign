// ======== Khai báo biến toàn cục ========
let selectedAmount = "";
let donationInput = null;
let clickCount = 0;
const totalSteps = 3;
let currentStep = 1;

// Thông tin ngân hàng
const bankId = "970436";
const accountNo = "1039764872";
const addInfo = "UngHoTreEmVungCao";

// ======== Step Navigation & Confetti ========

function updateStepper(step) {
	step = Math.max(1, Math.min(totalSteps, Number(step) || 1));
	currentStep = step;

	// Hiển thị đúng step content
	for (let s = 1; s <= totalSteps; s++) {
		const stepEl = document.getElementById(`step${s}`);
		if (stepEl) stepEl.classList.toggle("hidden", s !== step);
	}

	// Cập nhật circle / label / line
	for (let i = 1; i <= totalSteps; i++) {
		const circle = document.getElementById(`circle${i}`);
		const label = document.getElementById(`label${i}`);
		const line = document.getElementById(`line${i}`);

		if (circle) circle.classList.toggle("active", i <= step);
		if (label) label.classList.toggle("active", i <= step);
		if (line) line.classList.toggle("active", i < step);
	}
}

function goToStep(step) {
	step = Math.max(1, Math.min(totalSteps, Number(step) || 1));

	if (clickCount >= 3 && step === totalSteps) {
		alert("Cứ bấm đi, máy tính đang cười thầm đó 🤣🤣🤣");
		location.reload();
		return;
	}

	if (step === currentStep) {
		if (step === totalSteps) {
			clickCount++;
			launchFireworks();
		}
		return;
	}

	// Khi chuyển qua step 2, hiển thị số tiền
	if (step === 2) {
		const orderSummary = document.getElementById("order-summary");
		const orderAmount = document.getElementById("order-amount");
		if (orderSummary && orderAmount) {
			let finalAmount = selectedAmount || (donationInput ? donationInput.value : "");
			orderAmount.textContent = finalAmount || "0";
			orderSummary.style.display = "block";
		}

		// Chạy countdown (chỉ 1 lần)
		const display = document.querySelector(".order-timer");
		if (display && !display.dataset.started) {
			display.dataset.started = "true";
			let fifteenMinutes = 60 * 15;
			startCountdown(fifteenMinutes, display);
		}
	}

	updateStepper(step);

	if (step === totalSteps) {
		clickCount++;
		launchFireworks();
	}

	currentStep = step;
}

function launchFireworks() {
	const duration = 3000;
	const end = Date.now() + duration;

	(function frame() {
		if (typeof confetti === "function") {
			confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 } });
			confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 } });
		}
		if (Date.now() < end) requestAnimationFrame(frame);
	})();
}

// ======== Payment Methods & Tabs ========

function setupPaymentOptions() {
	const options = document.querySelectorAll("#payment-methods .payment-option");
	options.forEach((option) => {
		option.addEventListener("click", () => {
			options.forEach((o) => o.classList.remove("active"));
			option.classList.add("active");
		});
	});
}

function switchDonateTab(tab) {
	const traditional = document.getElementById("donate-traditional");
	const blockchain = document.getElementById("donate-blockchain");
	const buttons = document.querySelectorAll(".tab-btn");

	// Ẩn cả hai
	traditional.classList.add("hidden");
	blockchain.classList.add("hidden");
	buttons.forEach((btn) => btn.classList.remove("active"));

	// Hiện đúng tab
	if (tab === "traditional") {
		traditional.classList.remove("hidden");
		buttons[0].classList.add("active");
	} else {
		blockchain.classList.remove("hidden");
		buttons[1].classList.add("active");
	}
}

// ======== Countdown Timer ========

function startCountdown(duration, display) {
	let timer = duration,
		minutes,
		seconds;
	let countdown = setInterval(function () {
		minutes = Math.floor(timer / 60);
		seconds = timer % 60;
		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;
		display.textContent = minutes + ":" + seconds;

		if (--timer < 0) {
			clearInterval(countdown);
			display.textContent = "Hết giờ";
			display.style.color = "red";
		}
	}, 1000);
}

// ======== QR Code Toggle ========

function showQRInfo() {
	const qrInfo = document.getElementById("qr-info");
	const qrImg = document.getElementById("qr-code");
	const bankInfo = document.getElementById("bank-info");
	if (qrInfo && qrImg && bankInfo) {
		qrInfo.style.display = "block";
		bankInfo.style.display = "none";

		qrImg.onload = () => {
			bankInfo.style.display = "block";
		};
	}
}

function hideQRInfo() {
	const qrInfo = document.getElementById("qr-info");
	const bankInfo = document.getElementById("bank-info");

	if (qrInfo && bankInfo) {
		qrInfo.style.display = "none";
		bankInfo.style.display = "none";
	}
}

// Gắn sự kiện cho payment option để hiển thị QR
document.querySelectorAll("#payment-methods .payment-option").forEach((option) => {
	option.addEventListener("click", () => {
		document.querySelectorAll("#payment-methods .payment-option").forEach((o) => o.classList.remove("active"));
		option.classList.add("active");

		const openGuideBtn = document.getElementById("open-guide");

		if (option.textContent.includes("Mã QR")) {
			showQRInfo();
			const amount = selectedAmount || document.getElementById("donationAmount").value || "";
			const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${amount}&addInfo=${addInfo}`;
			document.getElementById("qr-code").src = qrUrl;
			// Hiển thị nút hướng dẫn
			if (openGuideBtn) openGuideBtn.style.display = "inline-block";
		} else {
			hideQRInfo();

			// Ẩn nút hướng dẫn khi chọn phương thức khác
			if (openGuideBtn) openGuideBtn.style.display = "none";
		}
	});
});

/* POPUP HƯỚNG DẪN */
document.addEventListener("DOMContentLoaded", () => {
	const modal = document.getElementById("guide-modal");
	const openBtn = document.getElementById("open-guide");
	if (!modal) return;

	// đảm bảo modal là con trực tiếp của <body>
	if (modal.parentNode !== document.body) document.body.appendChild(modal);

	const setShow = (show) => {
		modal.classList.toggle("show", !!show);
		document.body.style.overflow = show ? "hidden" : "";
	};

	openBtn?.addEventListener("click", (e) => {
		e.preventDefault();
		setShow(true);
	});
	modal.querySelector(".close")?.addEventListener("click", () => setShow(false));

	// đóng khi click ra ngoài hoặc bấm Esc
	window.addEventListener("click", (ev) => ev.target === modal && setShow(false));
	window.addEventListener("keydown", (ev) => ev.key === "Escape" && modal.classList.contains("show") && setShow(false));
});

// ======== Step 1: Chọn số tiền ========

document.querySelectorAll(".donate-btn-money").forEach((btn) => {
	btn.addEventListener("click", function () {
		document.querySelectorAll(".donate-btn-money").forEach((b) => b.classList.remove("active"));
		this.classList.add("active");

		const customInputDiv = document.getElementById("customAmountInput");
		if (this.id === "customAmountBtn") {
			if (customInputDiv) customInputDiv.style.display = "block";
			selectedAmount = "";
		} else {
			if (customInputDiv) customInputDiv.style.display = "none";
			let rawValue = this.innerText.replace(/\D/g, "");
			document.getElementById("donationAmount").value = rawValue;
			selectedAmount = rawValue;
		}
	});
});

document.getElementById("customAmountField")?.addEventListener("input", function () {
	let rawValue = this.value.replace(/\D/g, "");
	document.getElementById("donationAmount").value = rawValue;
	selectedAmount = rawValue;
});

// ======== On Load Initialization ========

window.onload = () => {
	setupPaymentOptions();
	updateStepper(1);

	// Nút Next / Back
	document.querySelectorAll(".btn-next").forEach((btn) =>
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			goToStep(Math.min(totalSteps, currentStep + 1));
		})
	);

	document.querySelectorAll(".btn-back").forEach((btn) =>
		btn.addEventListener("click", (e) => {
			e.preventDefault();
			goToStep(Math.max(1, currentStep - 1));
		})
	);

	// Chọn số tiền
	const buttons = document.querySelectorAll(".donate-btn-money");
	const customInputDiv = document.getElementById("customAmountInput");
	donationInput = document.getElementById("donationAmount");

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const value = button.textContent.trim();
			buttons.forEach((btn) => btn.classList.remove("active"));

			if (value === "CON SỐ KHÁC") {
				if (customInputDiv) customInputDiv.style.display = "block";
				if (donationInput) {
					donationInput.value = "";
					donationInput.focus();
				}
			} else {
				button.classList.add("active");
				if (customInputDiv) customInputDiv.style.display = "none";
				if (donationInput) donationInput.value = value;
				selectedAmount = value.replace(/\./g, "");
			}
		});
	});
};

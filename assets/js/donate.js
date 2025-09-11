// ======== Khai báo biến toàn cục ========
let selectedAmount = "";
let donationInput = null;
let clickCount = 0;
const totalSteps = 3;
let currentStep = 1;
const creditCardForm = document.getElementById("credit-card-form");
const MAX_AMOUNT = 100000000;
let donationData = {
	name: "",
	email: "",
	amount: "",
	method: "",
	code: "",
	date: "",
};

// Thông tin ngân hàng
const bankId = "970436";
const accountNo = "1039764872";
const addInfo = "UngHoTreEm";

// Tự động xuống dòng trong form
document.addEventListener("keydown", function (e) {
	const el = e.target;
	if (e.key !== "Enter") return;

	// Nếu đang focus vào textarea, giữ Enter để xuống dòng
	if (el.tagName === "TEXTAREA") return;

	// Nếu đang focus vào input hoặc các trường khác
	e.preventDefault();

	const form = el.closest("form");
	if (!form) return;

	// Lấy tất cả input, select, textarea trong form (hiển thị)
	const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter((f) => !f.disabled && f.offsetParent !== null);

	const index = fields.indexOf(el);
	if (index === -1) return;

	if (index < fields.length - 1) {
		fields[index + 1].focus(); // chuyển sang trường tiếp theo
	} else {
		form.submit(); // cuối cùng submit form
	}
});

function wrapText(font, text, fontSize, maxWidth) {
	const words = text.split(/\s+/);
	const lines = [];
	let current = "";

	for (let word of words) {
		const test = current ? current + " " + word : word;
		const width = font.widthOfTextAtSize(test, fontSize);
		if (width <= maxWidth) {
			current = test;
		} else {
			if (current) lines.push(current);
			// nếu 1 từ quá dài -> cắt theo ký tự
			if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
				let part = "";
				for (let ch of word) {
					const t = part + ch;
					if (font.widthOfTextAtSize(t, fontSize) <= maxWidth) part = t;
					else {
						lines.push(part);
						part = ch;
					}
				}
				if (part) current = part;
				else current = "";
			} else {
				current = word;
			}
		}
	}
	if (current) lines.push(current);
	return lines;
}

// ====== select ======
(function () {
	// ====== Hàm tạo danh sách option cho select ======
	function taoDanhSachDuAn() {
		const select = document.getElementById("donation-project");
		if (!select) {
			console.warn("⚠️ donate.js: Không tìm thấy #donation-project trong DOM");
			return false;
		}

		// Check for project data from window.sharedData
		if (!window.sharedData || !Array.isArray(window.sharedData)) {
			console.warn("⚠️ donate.js: window.sharedData chưa sẵn sàng hoặc không đúng định dạng");
			return false;
		}

		// Reset default option
		select.innerHTML = `<option value="" selected disabled hidden>Dự án đóng góp (*)</option>`;

		// Add options from project data
		window.sharedData.forEach((project, i) => {
			const opt = document.createElement("option");
			const titleKey = project.title; // e.g., "story_1_title"

			// Get the Vietnamese title from the translations object
			// Add a fallback in case the translation is missing
			const translatedTitle = (translations[titleKey] && translations[titleKey].vi)
				|| titleKey
				|| `Dự án ${i + 1}`;

			opt.value = titleKey || `project-${i}`;
			opt.textContent = translatedTitle; // Use the translated title here
			select.appendChild(opt);
		});

		return true;
	}

	// ====== Hàm khởi tạo Select2 ======
	function khoiTaoSelect2NeuCo() {
		// Chỉ chạy khi có jQuery + Select2
		if (window.jQuery && jQuery.fn && jQuery.fn.select2) {
			try {
				const $select = jQuery("#donation-project");

				// Nếu đã init trước đó thì hủy để tránh lỗi
				if ($select.data("select2")) $select.select2("destroy");

				// Khởi tạo lại
				$select.select2({
					placeholder: "Dự án đóng góp (*)",
					width: "100%",
					dropdownAutoWidth: true,
					allowClear: true,
					minimumResultsForSearch: 0, // luôn hiện ô search
					matcher: function (params, data) {
						// nếu không có từ khóa
						if ($.trim(params.term) === "") {
							return data;
						}

						// so khớp theo "bắt đầu bằng"
						if (data.text.toLowerCase().startsWith(params.term.toLowerCase())) {
							return data;
						}

						// không match thì loại bỏ
						return null;
					},
				});

				// Khi mở dropdown thì thêm placeholder cho ô tìm kiếm
				$select.on("select2:open", function () {
					let searchBox = document.querySelector(".select2-search__field");
					if (searchBox) {
						searchBox.placeholder = "Nhập để tìm kiếm dự án...";
					}
				});

				// Kích hoạt sự kiện change để đồng bộ
				$select.trigger("change");

				console.log("✅ donate.js: Select2 đã khởi tạo thành công");
			} catch (err) {
				console.error("❌ donate.js: Lỗi khi khởi tạo Select2:", err);
			}
			return true;
		}
		return false;
	}

	// ====== Chạy khi DOM sẵn sàng ======
	document.addEventListener("DOMContentLoaded", () => {
		const ok = taoDanhSachDuAn();
		if (!ok) return;

		// Thử init ngay, nếu Select2 chưa load thì đợi đến window.load
		if (!khoiTaoSelect2NeuCo()) {
			window.addEventListener("load", () => {
				if (!khoiTaoSelect2NeuCo()) {
					console.warn("⚠️ donate.js: Select2 chưa load — kiểm tra thứ tự script (jquery → select2 → donate.js)");
				}
			});
		}
	});
})();

function resetOrderSummary() {
	const summaries = document.querySelectorAll("#order-summary, #order-summary-momo, #order-summary-zalo");
	summaries.forEach((el) => {
		el.style.display = "none"; // ẩn
		// Nếu muốn reset nội dung, dùng: el.innerHTML = "";
	});
}

function showConfirmation() {
	// Lấy dữ liệu từ step 1
	donationData.name = document.getElementById("donor-name")?.value?.trim() || "Ẩn danh";
	donationData.email = document.getElementById("donor-email")?.value?.trim() || "[N/A]";
	donationData.amount = selectedAmount || (donationInput ? donationInput.value.replace(/\D/g, "") : "0");
	donationData.method = document.querySelector(".payment-option.active")?.innerText.trim() || "[N/A]";
	donationData.code = "DG" + Date.now();

	// Ví dụ: bạn có project cố định -> sau này có thể lấy động
	donationData.project = document.getElementById("donation-project")?.value || "Quỹ vì trẻ em";

	// Format số tiền
	let formattedAmount = new Intl.NumberFormat("vi-VN").format(Number(donationData.amount) || 0);

	// Format ngày giờ
	function formatDateTime(date) {
		const d = String(date.getDate()).padStart(2, "0");
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const y = date.getFullYear();

		const h = String(date.getHours()).padStart(2, "0");
		const min = String(date.getMinutes()).padStart(2, "0");
		const s = String(date.getSeconds()).padStart(2, "0");

		return `${d}/${m}/${y} - ${h}:${min}:${s}`;
	}

	// Trong showConfirmation()
	donationData.date = formatDateTime(new Date());

	// Hiển thị ra step 3
	document.getElementById("cf-name").innerText = donationData.name;
	document.getElementById("cf-email").innerText = donationData.email;
	document.getElementById("cf-code").innerText = donationData.code;
	document.getElementById("cf-amount").innerText = formattedAmount + " VNĐ";
	document.getElementById("cf-method").innerText = donationData.method;
	document.getElementById("cf-project").innerText = donationData.project;
	document.getElementById("cf-date").innerText = donationData.date;
}

// ======== Hàm xử lý animation chuyển bước ========

// Hàm làm bước hiện tại lướt ra ngoài (từ phải về trái)
function chuyenStepRa(stepEl, callback) {
	if (!stepEl) return callback();

	stepEl.style.transition = "transform 0.6s ease, opacity 0.6s ease";
	stepEl.style.transform = "translateX(0)";
	stepEl.style.opacity = "1";

	// Sau một tick nhỏ mới chạy animation
	setTimeout(() => {
		stepEl.style.transform = "translateX(-100%)";
		stepEl.style.opacity = "0";
	}, 10);

	// Sau khi xong thì ẩn hẳn và gọi callback
	stepEl.addEventListener(
		"transitionend",
		() => {
			stepEl.classList.add("hidden");
			// Giữ trạng thái cuối để không bị nhảy ngược lại
			stepEl.style.transition = "";
			stepEl.style.transform = "";
			stepEl.style.opacity = "";
			callback();
		},
		{ once: true }
	);
}

// Hàm làm bước mới lướt vào (từ phải về trái)
function chuyenStepVao(stepEl) {
	if (!stepEl) return;

	// Bắt đầu ở ngoài + mờ
	stepEl.style.transition = "transform 0.6s ease, opacity 0.6s ease";
	stepEl.style.transform = "translateX(100%)";
	stepEl.style.opacity = "0";
	stepEl.classList.remove("hidden");

	// Lướt vào + hiện dần
	setTimeout(() => {
		stepEl.style.transform = "translateX(0)";
		stepEl.style.opacity = "1";
	}, 10);

	// Sau khi xong thì dọn transition, nhưng giữ nguyên trạng thái (0, 1)
	stepEl.addEventListener(
		"transitionend",
		() => {
			stepEl.style.transition = "";
			stepEl.style.transform = "";
			stepEl.style.opacity = "";
		},
		{ once: true }
	);
}

// ======== Step Navigation & Confetti ========

function updateStepper(step) {
	step = Math.max(1, Math.min(totalSteps, Number(step) || 1));
	const prevStepEl = document.getElementById(`step${currentStep}`);
	const newStepEl = document.getElementById(`step${step}`);

	// Cập nhật circle / label / line
	for (let i = 1; i <= totalSteps; i++) {
		const circle = document.getElementById(`circle${i}`);
		const label = document.getElementById(`label${i}`);
		const line = document.getElementById(`line${i}`);

		if (circle) circle.classList.toggle("active", i <= step);
		if (label) label.classList.toggle("active", i <= step);
		if (line) line.classList.toggle("active", i < step);
	}

	// Nếu không cần animation (chuyển về bước nhỏ hơn hoặc cùng bước)
	if (step <= currentStep) {
		if (prevStepEl) {
			prevStepEl.classList.add("hidden");
			// Dọn dẹp các thuộc tính animation
			prevStepEl.style.transition = "";
			prevStepEl.style.transform = "";
			prevStepEl.style.opacity = "";
		}
		if (newStepEl) {
			newStepEl.classList.remove("hidden");
			// Đảm bảo bước mới hiển thị đúng
			newStepEl.style.transition = "";
			newStepEl.style.transform = "translateX(0)";
			newStepEl.style.opacity = "1";
		}
		currentStep = step;
		return;
	}

	// Thực hiện animation khi chuyển sang bước lớn hơn
	chuyenStepRa(prevStepEl, () => {
		chuyenStepVao(newStepEl);
		currentStep = step;
	});
}

function goToStep(step) {
	step = Number(step);

	// Giới hạn step trong khoảng 1..totalSteps
	step = Math.min(totalSteps, Number(step) || 1);

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
		// MoMo
		const orderAmountMomo = document.getElementById("order-amount-momo");
		const orderAmountWordsMomo = document.getElementById("order-amount-words-momo");

		// Zalo
		const orderAmountZalo = document.getElementById("order-amount-zalo");
		const orderAmountWordsZalo = document.getElementById("order-amount-words-zalo");

		let rawAmount = selectedAmount || (donationInput ? donationInput.value.replace(/\D/g, "") : "");
		let finalAmount = Number(rawAmount) || 0;
		let formattedAmount = new Intl.NumberFormat("vi-VN").format(finalAmount);

		// Cập nhật MoMo
		if (orderAmountMomo) orderAmountMomo.textContent = formattedAmount + " VNĐ";
		if (orderAmountWordsMomo) orderAmountWordsMomo.textContent = finalAmount > 0 ? (numberToVietnameseText(finalAmount) + " đồng").toUpperCase() : "Không Có Số Tiền";

		// Cập nhật Zalo
		if (orderAmountZalo) orderAmountZalo.textContent = formattedAmount + " VNĐ";
		if (orderAmountWordsZalo) orderAmountWordsZalo.textContent = finalAmount > 0 ? (numberToVietnameseText(finalAmount) + " đồng").toUpperCase() : "Không Có Số Tiền";

		// Chạy countdown (chỉ 1 lần)
		const display = document.querySelector(".order-timer");
		if (display && !display.dataset.started) {
			display.dataset.started = "true";
			let fifteenMinutes = 60 * 15;
			startCountdown(fifteenMinutes, display);
		}
	}

	if (step === 3) {
		showConfirmation(); // chỉ xử lý cho truyền thống
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

// === Alert
function showAlert(type, title, message) {
	const container = document.getElementById("alert-container");
	if (!container) return;

	const box = document.createElement("div");
	box.className = `alert-box ${type}`;
	box.innerHTML = `
    <div class="alert-left">
      <span class="alert-icon">${type === "success" ? "😊" : "☹️"}</span>
    </div>
    <div class="alert-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <div class="alert-progress"></div>
  `;

	container.appendChild(box);

	// đồng bộ với CSS: progress animation length (ms)
	const lifetime = 3000; // tương ứng với @keyframes shrink (3s)
	const fadeDuration = 400; // CSS slideOut 0.4s

	// sau lifetime: bắt đầu slide out, rồi remove khi animation kết thúc
	setTimeout(() => {
		box.classList.add("hide");
		box.addEventListener("animationend", () => box.remove(), { once: true });
	}, lifetime);
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

// ======= Phương thức Ví điện tử ======
document.querySelectorAll("#payment-methods .payment-option").forEach((option) => {
	option.addEventListener("click", () => {
		resetOrderSummary();

		// Ẩn tất cả nội dung khác
		document.getElementById("qr-info").style.display = "none";
		document.getElementById("credit-card-form").style.display = "none";
		document.getElementById("momo-info").style.display = "none";
		document.getElementById("zalopay-info").style.display = "none";
		document.querySelector(".wallets-tabs-container").style.display = "none";
		document.querySelector(".order-wrapper").style.display = "none";
		document.getElementById("atm-bank-list").style.display = "none";
		document.getElementById("atm-payment-form").style.display = "none";
		document.getElementById("order-summary-momo").style.display = "none";
		document.getElementById("order-summary-zalo").style.display = "none";

		// Nếu chọn Ví Điện Tử
		if (option.textContent.includes("Ví Điện Tử")) {
			document.querySelector(".wallets-tabs-container").style.display = "block";
			document.getElementById("momo-info").style.display = "block";
			document.getElementById("order-summary-momo").style.display = "block";
		}

		// Reset active cho payment option
		document.querySelectorAll("#payment-methods .payment-option").forEach((o) => o.classList.remove("active"));
		option.classList.add("active");

		// Xử lý từng phương thức
		if (option.textContent.includes("Mã VietQR")) {
			document.querySelector(".order-wrapper").style.display = "block";
			document.getElementById("order-summary").style.display = "block";
		} else if (option.textContent.includes("Thẻ Tín Dụng")) {
			document.getElementById("credit-card-form").style.display = "block";
			document.getElementById("order-summary-card").style.display = "block";
		} else if (option.textContent.includes("Ví Điện Tử")) {
			document.querySelector(".wallets-tabs-container").style.display = "block";
			document.getElementById("momo-info").style.display = "block";
		} else if (option.textContent.includes("ATM")) {
			document.getElementById("atm-bank-list").style.display = "block";
			document.getElementById("order-summary-atm").style.display = "none";
		}
	});
});

// ======= Tabs trong Ví điện tử ======
document.querySelectorAll(".wallet-tab-btn").forEach((tab) => {
	tab.addEventListener("click", () => {
		resetOrderSummary(); // ✅ thêm dòng này đầu tiên

		// Ẩn hết các info ví
		document.getElementById("momo-info").style.display = "none";
		document.getElementById("zalopay-info").style.display = "none";

		// Bỏ active cũ
		document.querySelectorAll(".wallet-tab-btn").forEach((btn) => btn.classList.remove("active"));

		// Set active cho tab hiện tại
		tab.classList.add("active");

		// Hiển thị đúng nội dung
		if (tab.dataset.tab === "momo") {
			document.getElementById("momo-info").style.display = "block";
			document.getElementById("order-summary-momo").style.display = "block";
		} else if (tab.dataset.tab === "zalopay") {
			document.getElementById("zalopay-info").style.display = "block";
			document.getElementById("order-summary-zalo").style.display = "block";
		}
	});
});

// ====== Phương thức: ATM
document.addEventListener("DOMContentLoaded", () => {
	const bankItems = document.querySelectorAll(".bank-item");
	const atmForm = document.getElementById("atm-payment-form");
	const orderSummaryAtm = document.getElementById("order-summary-atm"); // thêm dòng này

	// Ẩn order-summary-atm lúc đầu
	if (orderSummaryAtm) orderSummaryAtm.style.display = "none";

	const bankTitle = document.getElementById("bank-atm-title");
	const bankLogo = document.getElementById("bank-logo");

	bankItems.forEach((item) => {
		item.addEventListener("click", () => {
			// Xóa active ở tất cả
			bankItems.forEach((i) => i.classList.remove("active"));

			// Thêm active cho cái được chọn
			item.classList.add("active");

			// Lấy tên và logo
			const img = item.querySelector("img");
			const bankName = img.alt;
			const bankSrc = img.src;

			// Cập nhật form
			bankTitle.textContent = `Bạn đang thanh toán qua ngân hàng ${bankName}`;
			bankLogo.src = bankSrc;

			// Hiện form
			atmForm.style.display = "block";

			// Hiện order summary khi chọn ngân hàng
			if (orderSummaryAtm) orderSummaryAtm.style.display = "block";
		});
	});
});

// Gắn sự kiện cho payment option để hiển thị
document.querySelectorAll("#payment-methods .payment-option").forEach((option) => {
	option.addEventListener("click", () => {
		document.querySelectorAll("#payment-methods .payment-option").forEach((o) => o.classList.remove("active"));
		option.classList.add("active");

		// Phương thức thẻ tín dụng
		if (creditCardForm) {
			if (option.textContent.includes("Thẻ Tín Dụng")) {
				creditCardForm.style.display = "block";
			} else {
				creditCardForm.style.display = "none";
			}
		}

		const openGuideBtn = document.getElementById("open-guide");

		if (option.textContent.includes("Mã VietQR")) {
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

	// === Ẩn ví điện tử mặc định khi load trang ===
	const walletTabs = document.querySelector(".wallets-tabs-container");
	if (walletTabs) walletTabs.style.display = "none";

	const momoInfo = document.getElementById("momo-info");
	if (momoInfo) momoInfo.style.display = "none";

	const zalopayInfo = document.getElementById("zalopay-info");
	if (zalopayInfo) zalopayInfo.style.display = "none";
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

// === Chuyển tiền số thành chữ
function numberToVietnameseText(n) {
	if (!n) return "0";
	const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
	const nums = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
	let str = "";
	let i = 0;

	while (n > 0) {
		let part = n % 1000;
		if (part !== 0) {
			str = readThreeDigits(part) + (units[i] ? " " + units[i] : "") + " " + str;
		}
		n = Math.floor(n / 1000);
		i++;
	}
	return str.trim();

	function readThreeDigits(num) {
		let hundred = Math.floor(num / 100);
		let ten = Math.floor((num % 100) / 10);
		let one = num % 10;
		let s = "";

		if (hundred > 0) s += nums[hundred] + " trăm ";
		if (ten > 1) s += nums[ten] + " mươi ";
		else if (ten === 1) s += "mười ";
		else if (hundred > 0 && one > 0) s += "lẻ ";

		if (one > 0) {
			if (ten >= 1 && one === 1) s += "mốt ";
			else if (ten >= 1 && one === 5) s += "lăm ";
			else s += nums[one] + " ";
		}
		return s.trim();
	}
}

// ======== On Load Initialization ========
window.onload = () => {
	setupPaymentOptions();
	updateStepper(1);

	// Nút Next / Back
	document.querySelectorAll(".btn-next").forEach((btn) =>
		btn.addEventListener("click", (e) => {
			e.preventDefault();

			// Nếu không ở step 1 thì giữ hành vi mặc định: chuyển bước
			if (currentStep !== 1) {
				goToStep(Math.min(totalSteps, currentStep + 1));
				return;
			}

			// Lấy dữ liệu từ các trường
			const project = document.getElementById("donation-project")?.value || "";
			const donorName = document.getElementById("donor-name")?.value?.trim() || "";
			const donorEmail = document.getElementById("donor-email")?.value?.trim() || "";
			const donationInputEl = document.getElementById("donationAmount");
			let rawAmount = selectedAmount || (donationInputEl ? donationInputEl.value : "");
			// loại bỏ mọi ký tự không phải số
			const amount = parseInt(String(rawAmount).replace(/\D/g, ""), 10) || 0;

			// Validate Họ và Tên
			if (donorName) {
				if (donorName.length < 2 || donorName.length > 50) {
					Swal.fire({
						title: "Họ và tên không hợp lệ",
						text: "Họ và tên phải chứa từ 2 đến 50 ký tự",
						icon: "info",
						confirmButtonText: "Tôi đã hiểu !!!",
						customClass: {
							popup: "my-swal-popup",
							title: "my-swal-title",
							htmlContainer: "my-swal-text",
							confirmButton: "my-swal-confirm",
							icon: "my-swal-icon",
						},
						scrollbarPadding: false,
						heightAuto: false,
					});
					return;
				}
			}

			// Validate Email
			if (donorEmail) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(donorEmail)) {
					Swal.fire({
						title: "Email không hợp lệ",
						text: "Vui lòng nhập địa chỉ email đúng định dạng",
						icon: "info",
						confirmButtonText: "Tôi đã hiểu !!!",
						customClass: {
							popup: "my-swal-popup",
							title: "my-swal-title",
							htmlContainer: "my-swal-text",
							confirmButton: "my-swal-confirm",
							icon: "my-swal-icon",
						},
						scrollbarPadding: false,
						heightAuto: false,
					});
					return;
				}
			}

			// 1) Chưa chọn dự án => báo và dừng
			if (!project) {
				Swal.fire({
					title: "Chưa chọn dự án",
					text: "Vui lòng chọn dự án quyên góp",
					icon: "info",
					confirmButtonText: "Tôi đã hiểu !!!",
					customClass: {
						popup: "my-swal-popup",
						title: "my-swal-title",
						htmlContainer: "my-swal-text",
						confirmButton: "my-swal-confirm",
						icon: "my-swal-icon",
					},
					scrollbarPadding: false,
					heightAuto: false,
				});
				return;
			}

			// 2) Chưa chọn / nhập số tiền hợp lệ => báo và dừng
			if (!amount || amount <= 0) {
				Swal.fire({
					title: "Chưa chọn số tiền",
					text: "Vui lòng nhập hoặc chọn số tiền quyên góp",
					icon: "info",
					confirmButtonText: "Tôi đã hiểu !!!",
					customClass: {
						popup: "my-swal-popup",
						title: "my-swal-title",
						htmlContainer: "my-swal-text",
						confirmButton: "my-swal-confirm",
						icon: "my-swal-icon",
					},
					scrollbarPadding: false,
					heightAuto: false,
				});
				return;
			}

			// 3) Nếu > MAX_AMOUNT => hỏi confirm, chỉ chuyển khi confirm
			if (amount > MAX_AMOUNT) {
				const amountText = numberToVietnameseText(amount);
				Swal.fire({
					title: "Cẩn thận với số tiền lớn!",
					html: `Bạn đang quyên góp với số tiền <b>${amountText} </b> đồng<br>Bạn có chắc chắn muốn tiếp tục?`,
					icon: "warning",
					showCancelButton: true,
					confirmButtonText: "Vẫn tiếp tục",
					cancelButtonText: "Tôi sẽ xem lại",

					customClass: {
						popup: "my-swal-popup",
						title: "my-swal-title",
						htmlContainer: "my-swal-text",
						confirmButton: "my-swal-confirm",
						cancelButton: "my-swal-cancel",
						icon: "my-swal-icon",
					},
					scrollbarPadding: false,
					heightAuto: false,
				}).then((result) => {
					if (result.isConfirmed) {
						goToStep(Math.min(totalSteps, currentStep + 1));
					}
				});
				return; // bắt buộc dừng ở đây
			}

			// 4) Đã chọn dự án + số tiền hợp lệ ≤ MAX_AMOUNT -> chuyển bước
			goToStep(Math.min(totalSteps, currentStep + 1));
		})
	);

	document.addEventListener("click", (e) => {
		if (e.target.classList.contains("btn-back")) {
			e.preventDefault();

			// Nếu đang ở step 1 → chỉ hiện alert, KHÔNG gọi goToStep
			if (currentStep === 1) {
				showAlert("error", "Bạn đang ở bước đầu tiên!", "Không thể quay lại nữa");
				return; // DỪNG HẲN, không gọi goToStep
			}

			// Nếu step > 1 → gọi goToStep bình thường
			goToStep(currentStep - 1);
		}
	});

	// Chọn số tiền
	const buttons = document.querySelectorAll(".donate-btn-money");
	const customInputDiv = document.getElementById("customAmountInput");
	donationInput = document.getElementById("donationAmount");
	function formatCurrency(value) {
		// Bỏ hết ký tự không phải số
		value = value.replace(/\D/g, "");
		if (!value) return "";
		// Thêm dấu chấm phân cách nghìn
		return new Intl.NumberFormat("vi-VN").format(value);
	}

	// Khi nhập
	donationInput.addEventListener("input", () => {
		let rawValue = donationInput.value.replace(/\D/g, "");
		donationInput.value = formatCurrency(rawValue);
		selectedAmount = rawValue;
	});

	donationInput.addEventListener("blur", () => {
		if (donationInput.value) {
			donationInput.value = donationInput.value + " VNĐ";
		}
	});

	donationInput.addEventListener("focus", () => {
		donationInput.value = donationInput.value.replace(" VNĐ", "");
	});

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const value = button.textContent.trim();
			buttons.forEach((btn) => btn.classList.remove("active"));

			if (value === "Chọn số tiền khác") {
				if (customInputDiv) customInputDiv.style.display = "block";
				if (donationInput) {
					donationInput.value = "";
					donationInput.focus();
				}
			} else {
				button.classList.add("active");
				if (customInputDiv) customInputDiv.style.display = "none";
				if (donationInput) donationInput.value = value;
				selectedAmount = value.replace(/\D/g, "");
			}
		});
	});

	// ==== Nhập lại ====
	document.querySelector(".btn-reset").addEventListener("click", () => {
		const step1 = document.querySelector("#step1");
		if (!step1) return;

		// Kiểm tra xem có dữ liệu nào không
		let hasData = false;
		const inputs = step1.querySelectorAll("input, select, textarea");
		inputs.forEach((input) => {
			if ((input.type === "checkbox" || input.type === "radio") && input.checked) {
				hasData = true;
			} else if (input.tagName.toLowerCase() === "select" && input.selectedIndex > 0) {
				hasData = true;
			} else if (!(input.type === "checkbox" || input.type === "radio") && input.value.trim() !== "") {
				hasData = true;
			}
		});

		// Nếu không có dữ liệu -> thoát luôn, không hiện Swal
		if (!hasData) return;

		// Nếu có dữ liệu -> hỏi xác nhận
		Swal.fire({
			title: "Bạn có chắc chắn?",
			text: "Toàn bộ thông tin ở bước 1 sẽ bị xóa!",
			icon: "warning", //succes/error/warning/info/question
			// footer: "<small>Bạn có thể nhập lại thông tin mới sau khi reset.</small>",
			showCancelButton: true,
			confirmButtonText: "Okee, chắc chắn",
			cancelButtonText: "Chưa chắc lắm!",
			confirmButtonColor: "#a4c639",
			cancelButtonColor: "#f0625d",
			scrollbarPadding: false,
			heightAuto: false,
			// Đặt class chung
			customClass: {
				popup: "my-swal-popup",
				title: "my-swal-title",
				htmlContainer: "my-swal-text",
				confirmButton: "my-swal-confirm",
				cancelButton: "my-swal-cancel",
				icon: "my-swal-icon",
			},
		}).then((result) => {
			if (result.isConfirmed) {
				// Reset dữ liệu
				inputs.forEach((input) => {
					if (input.type === "checkbox" || input.type === "radio") {
						input.checked = false;
					} else if (input.tagName.toLowerCase() === "select") {
						input.selectedIndex = 0;
					} else {
						input.value = "";
					}
				});

				// Bỏ chọn số tiền
				const buttons = step1.querySelectorAll(".donate-btn-money");
				buttons.forEach((btn) => btn.classList.remove("active"));

				// Ẩn ô nhập số tiền khác
				const customInputDiv = document.getElementById("customAmountInput");
				if (customInputDiv) {
					customInputDiv.style.display = "none";
				}

				// Reset biến JS nếu có
				if (typeof selectedAmount !== "undefined") {
					selectedAmount = "";
				}
			}
		});
	});

	// Card Visa
	document.getElementById("card-number").addEventListener("input", function () {
		let val = this.value.replace(/\D/g, "").substring(0, 16);
		val = val.replace(/(.{4})/g, "$1 ").trim();
		this.value = val;
		document.getElementById("preview-number").textContent = val || "---- ---- ---- ----";
	});

	document.getElementById("card-expiry").addEventListener("input", function () {
		let val = this.value.replace(/\D/g, "").substring(0, 4);
		if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
		this.value = val;
		document.getElementById("preview-expiry").textContent = val || "--/--";
	});

	document.getElementById("card-name").addEventListener("input", function () {
		let val = this.value.toUpperCase();
		document.getElementById("preview-name").textContent = val || "NGUYEN VAN A";
	});
	// Hướng dẫn nhập visa modal
	// Chức năng khi người dùng click vào ảnh hỏi
	document.querySelectorAll(".tooltip-image").forEach((img) => {
		img.addEventListener("click", (e) => {
			const title = e.target.getAttribute("data-title");
			const content = e.target.getAttribute("data-content");

			// Cập nhật nội dung modal
			document.getElementById("helpTitle").textContent = title;
			document.getElementById("helpContent").textContent = content;
		});
	});
	// Ảnh img
	const tooltipImages = document.querySelectorAll(".tooltip-image");

	tooltipImages.forEach((image) => {
		image.addEventListener("click", function () {
			const title = image.getAttribute("data-title");
			const content = image.getAttribute("data-content");
			const imgSrc = image.getAttribute("data-img"); // Lấy đường dẫn ảnh từ data-img

			// Cập nhật tiêu đề modal
			document.getElementById("helpTitle").textContent = title;

			// Cập nhật nội dung modal, sử dụng innerHTML để cho phép <br> hiển thị
			document.getElementById("helpContent").innerHTML = content;

			// Cập nhật ảnh trong modal
			document.getElementById("helpImg").src = imgSrc; // Cập nhật đường dẫn ảnh
		});
	});
};
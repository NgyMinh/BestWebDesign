// ======== Khai báo biến toàn cục cho Blockchain ========
let buocHienTaiBlockchain = 1;
const tongSoBuocBlockchain = 3;
let bcDonationData = {
	hoTen: "",
	email: "",
	duAn: "",
	token: "",
	soLuong: "",
	soTienQuyDoi: "",
	diaChiVi: "",
	idGiaoDich: "",
	ngayGio: "",
};

function layGiaToken(tokenId, donVi = "VND") {
	if (!allCoins || allCoins.length === 0) return 0;

	// So sánh không phân biệt chữ hoa/chữ thường
	const coin = allCoins.find((c) => (c.id || "").toLowerCase() === (tokenId || "").toLowerCase());
	if (!coin) return 0;

	if (donVi === "USD") return coin.current_price || 0;
	if (donVi === "VND") return vndData[coin.id]?.vnd || 0;
	return 0;
}

// ======== Hàm quy đổi tiền tệ ========
function quyDoiTienTe(token, soLuong, donVi) {
	if (!token || !soLuong || soLuong <= 0) return "0 " + donVi;

	const gia = layGiaToken(token, donVi);
	if (!gia) return "0 " + donVi;

	const ketQua = soLuong * gia;
	return donVi === "VND" ? new Intl.NumberFormat("vi-VN").format(ketQua) + " VNĐ" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(ketQua);
}

// Hàm lấy thông danh sách token từ token.js
function capNhatDanhSachToken() {
	const select = document.getElementById("crypto-token");
	if (!select) return;
	select.innerHTML = `<option value="" disabled selected>Chọn loại tiền điện tử</option>`;

	allCoins.forEach((c) => {
		const opt = document.createElement("option");
		opt.value = (c.id || "").toUpperCase();

		// Sử dụng innerHTML với icon + tên đậm + symbol nhạt
		opt.innerHTML = `
		<img src="${c.image}" alt="${c.symbol}" style="width: 18px; height: 18px; margin-right: 6px; vertical-align: middle;">
		<strong>${c.name}</strong> <span style="color: #888;">(${(c.symbol || "").toUpperCase()})</span>
	`;

		// Cần thêm thuộc tính 'data-*' để custom hiển thị
		opt.setAttribute("data-image", c.image);
		opt.setAttribute("data-name", c.name);
		opt.setAttribute("data-symbol", (c.symbol || "").toUpperCase());

		select.appendChild(opt);
	});
}

// ======== Hàm tạo danh sách dự án ========
function taoDanhSachDuAnBlockchain() {
	const select = document.getElementById("bc-donation-project");
	if (!select) return false;
	if (!window.sharedData || !Array.isArray(window.sharedData)) return false;

	select.innerHTML = `<option value="" selected disabled hidden>Chọn 1 dự án muốn quyên góp (*)</option>`;
	window.sharedData.forEach((project, i) => {
		const opt = document.createElement("option");
		opt.value = project.title || `project-${i}`;
		opt.textContent = project.title || `Dự án ${i + 1}`;
		select.appendChild(opt);
	});
	return true;
}

// ======== Hàm khởi tạo Select2 cho dự án ========
function khoiTaoSelect2Blockchain() {
	if (window.jQuery && jQuery.fn && jQuery.fn.select2) {
		const $select = jQuery("#bc-donation-project");
		if ($select.data("select2")) $select.select2("destroy");
		$select.select2({
			placeholder: "Chọn 1 dự án muốn quyên góp (*)",
			width: "100%",
			dropdownAutoWidth: true,
			allowClear: true,
			minimumResultsForSearch: 0,
			matcher: function (params, data) {
				if ($.trim(params.term) === "") return data;
				if (data.text.toLowerCase().startsWith(params.term.toLowerCase())) return data;
				return null;
			},
		});
		$select.on("select2:open", function () {
			let searchBox = document.querySelector(".select2-search__field");
			if (searchBox) searchBox.placeholder = "Nhập để tìm kiếm dự án...";
		});
		$select.trigger("change");
		return true;
	}
	return false;
}

// ======== Hàm khởi tạo Select2 cho Token & Đơn vị tiền tệ ========
function khoiTaoSelect2TokenVaDonVi() {
	if (window.jQuery && jQuery.fn && jQuery.fn.select2) {
		// Token
		const $tokenSelect = jQuery("#crypto-token");
		if ($tokenSelect.length) {
			if ($tokenSelect.data("select2")) $tokenSelect.select2("destroy");
			$tokenSelect.select2({
				placeholder: "Chọn loại tiền điện tử",
				width: "100%",
				dropdownAutoWidth: true,
				allowClear: true,
				minimumResultsForSearch: 0,

				// Hiển thị trong dropdown
				templateResult: function (data) {
					if (!data.id) return data.text;

					const image = $(data.element).attr("data-image");
					const name = $(data.element).attr("data-name");
					const symbol = $(data.element).attr("data-symbol");

					return $(`
		<div class="custom-token-option">
			<img src="${image}" class="custom-token-icon" alt="${symbol}">
			<div class="custom-token-text">
				<strong>${name}</strong> <span class="custom-token-symbol">(${symbol})</span>
			</div>
		</div>
	`);
				},

				// Hiển thị token đã chọn
				templateSelection: function (data) {
					if (!data.id) return data.text;
					const symbol = $(data.element).attr("data-symbol");
					return symbol; // Hiển thị mã token như "BTC", "ETH"
				},
			});

			$tokenSelect.trigger("change");
		}

		// Đơn vị tiền tệ
		const $unitSelect = jQuery("#currency-unit");
		if ($unitSelect.length) {
			if ($unitSelect.data("select2")) $unitSelect.select2("destroy");
			$unitSelect.select2({
				placeholder: "Chọn đơn vị để xem kết quả",
				width: "100%",
				dropdownAutoWidth: true,
				minimumResultsForSearch: Infinity, // không cần search cho ít option
			});
			$unitSelect.trigger("change");
		}
	}
}

// ======== Hàm chuyển bước cho Blockchain ========
function chuyenBuocBlockchain(buoc) {
	buoc = Math.max(1, Math.min(tongSoBuocBlockchain, Number(buoc) || 1));
	const buocTruoc = document.getElementById(`bc-step${buocHienTaiBlockchain}`);
	const buocMoi = document.getElementById(`bc-step${buoc}`);

	if (buocTruoc) {
		buocTruoc.style.transform = "";
		buocTruoc.style.marginLeft = "";
		buocTruoc.style.opacity = "1";
	}
	if (buocMoi) {
		buocMoi.style.transform = "";
		buocMoi.style.marginLeft = "";
		buocMoi.style.opacity = "1";
	}

	capNhatStepperBlockchain(buoc);

	if (buoc <= buocHienTaiBlockchain) {
		if (buocTruoc) buocTruoc.classList.add("hidden");
		if (buocMoi) buocMoi.classList.remove("hidden");
		buocHienTaiBlockchain = buoc;
		return;
	}

	luotRaBlockchain(buocTruoc, () => {
		luotVaoBlockchain(buocMoi);
		if (buocTruoc) {
			buocTruoc.style.transform = "";
			buocTruoc.style.marginLeft = "";
		}
		if (buocMoi) {
			buocMoi.style.transform = "";
			buocMoi.style.marginLeft = "";
		}
		buocHienTaiBlockchain = buoc;
	});

	if (buoc === 3) {
		hienThiXacNhanBlockchain();
	}
}

// ======== Hàm cập nhật stepper cho Blockchain ========
function capNhatStepperBlockchain(buoc) {
	for (let i = 1; i <= tongSoBuocBlockchain; i++) {
		const vongTron = document.getElementById(`bc-circle${i}`);
		const nhan = document.getElementById(`bc-label${i}`);
		const duongKe = document.getElementById(`bc-line${i}`);

		if (vongTron) vongTron.classList.toggle("active", i <= buoc);
		if (nhan) nhan.classList.toggle("active", i <= buoc);
		if (duongKe) duongKe.classList.toggle("active", i < buoc);
	}
}

// ======== Hàm animation lướt ra cho Blockchain ========
function luotRaBlockchain(buocEl, callback) {
	if (!buocEl) return callback();
	buocEl.style.transition = "transform 0.5s";
	buocEl.style.transform = "translateX(0)";

	setTimeout(() => {
		buocEl.style.transform = "translateX(-100%)";
	}, 10);

	buocEl.addEventListener(
		"transitionend",
		() => {
			buocEl.classList.add("hidden");
			buocEl.style.transition = "";
			buocEl.style.transform = "";
			callback();
		},
		{ once: true }
	);
}

// ======== Hàm animation lướt vào cho Blockchain ========
function luotVaoBlockchain(buocEl) {
	if (!buocEl) return;
	buocEl.style.transition = "transform 0.5s";
	buocEl.style.transform = "translateX(100%)";
	buocEl.classList.remove("hidden");

	setTimeout(() => {
		buocEl.style.transform = "translateX(0)";
	}, 10);

	buocEl.addEventListener(
		"transitionend",
		() => {
			buocEl.style.transition = "";
			buocEl.style.transform = "";
		},
		{ once: true }
	);
}

// ======== Hàm hiển thị xác nhận cho Blockchain ========
function hienThiXacNhanBlockchain() {
	bcDonationData.hoTen = document.getElementById("bc-donor-name")?.value?.trim() || "Ẩn danh";
	bcDonationData.email = document.getElementById("bc-donor-email")?.value?.trim() || "Không có";
	bcDonationData.duAn = document.getElementById("bc-donation-project")?.value || "Quỹ vì trẻ em";
	bcDonationData.token = document.getElementById("crypto-token").value || "ETH";
	bcDonationData.soLuong = document.getElementById("token-amount").value || "0";
	const quyDoiEl = document.getElementById("converted-amount-display");
	bcDonationData.soTienQuyDoi = quyDoiEl.value || quyDoiEl.textContent || "0 VNĐ";
	bcDonationData.diaChiVi = "0xYourCharityWalletAddressHere";
	bcDonationData.idGiaoDich = "---";
	bcDonationData.ngayGio = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

	document.getElementById("bc-cf-name").textContent = bcDonationData.hoTen;
	document.getElementById("bc-cf-email").textContent = bcDonationData.email;
	document.getElementById("bc-cf-project").textContent = bcDonationData.duAn;
	document.getElementById("bc-cf-token").textContent = bcDonationData.token;
	document.getElementById("bc-cf-amount").textContent = bcDonationData.soLuong;
	document.getElementById("bc-cf-converted").textContent = bcDonationData.soTienQuyDoi;
	document.getElementById("bc-cf-address").textContent = bcDonationData.diaChiVi;
	document.getElementById("bc-cf-txid").textContent = bcDonationData.idGiaoDich;
	document.getElementById("bc-cf-date").textContent = bcDonationData.ngayGio;
}

// ======== Hàm validate email ========
function kiemTraEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

// ======== Khởi tạo sự kiện khi DOM sẵn sàng ========
document.addEventListener("DOMContentLoaded", () => {
	// Chỉ áp dụng cho tab Blockchain
	const tabBlockchain = document.getElementById("donate-blockchain");
	if (!tabBlockchain) return;

	// Khởi tạo danh sách dự án
	const ok = taoDanhSachDuAnBlockchain();
	if (ok && !khoiTaoSelect2Blockchain()) {
		window.addEventListener("load", () => khoiTaoSelect2Blockchain());
	}

	// Khởi tạo Select2 cho Token + Đơn vị
	khoiTaoSelect2TokenVaDonVi();

	jQuery("#crypto-token").trigger("change");
	jQuery("#currency-unit").trigger("change");

	// Khởi tạo stepper
	capNhatStepperBlockchain(1);

	// Xử lý nhập số lượng & quy đổi tiền tệ
	const tokenSelect = document.getElementById("crypto-token");
	const soLuongInput = document.getElementById("token-amount");
	const donViSelect = document.getElementById("currency-unit");
	const quyDoiDisplay = document.getElementById("converted-amount-display");

	// Khi nhập số lượng, tự cập nhật quy đổi
	soLuongInput.addEventListener("input", () => {
		soLuongInput.value = formatTokenValue(soLuongInput.value);
		capNhatQuyDoi();
	});

	// Khi nhấn Enter trên ô số lượng
	soLuongInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			capNhatQuyDoi();
		}
	});

	// Khi chọn token (Select2)
	jQuery("#crypto-token").on("change", () => {
		capNhatQuyDoi();
	});

	// Khi chọn đơn vị tiền tệ (Select2)
	jQuery("#currency-unit").on("change", () => {
		capNhatQuyDoi();
	});

	// Format số token cho phép thập phân (tối đa 4 số sau dấu .)
	function formatTokenValue(value) {
		value = value.replace(/[^0-9.]/g, ""); // chỉ cho số & dấu .

		// Nếu nhập nhiều dấu . thì giữ dấu đầu tiên
		const parts = value.split(".");
		if (parts.length > 2) {
			value = parts[0] + "." + parts.slice(1).join("");
		}

		// Giới hạn tối đa 4 số sau dấu .
		if (parts[1]) {
			parts[1] = parts[1].slice(0, 4);
			value = parts[0] + "." + parts[1];
		}

		return value;
	}

	// Lấy giá trị số thật
	function layGiaTriSoLuong() {
		return parseFloat(soLuongInput.value) || 0;
	}

	function docSoThanhChu(number) {
		const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

		if (number === 0) return "không";

		let result = "";
		let numStr = number.toString();
		let length = numStr.length;

		for (let i = 0; i < length; i++) {
			const n = parseInt(numStr[i]);
			const viTri = length - i; // vị trí hàng
			if (n !== 0) result += chuSo[n] + " ";
			if (viTri % 3 === 1 && i !== length - 1) result += " ";
		}

		return result.trim();
	}

	// Cập nhật quy đổi
	function capNhatQuyDoi() {
		const token = tokenSelect.value;
		const soLuong = layGiaTriSoLuong();
		const donVi = jQuery("#currency-unit").val();

		// Nếu chưa đủ dữ liệu, ẩn text đỏ
		if (!token || !donVi || soLuong <= 0) {
			quyDoiDisplay.value = "";
			document.getElementById("token-equivalent-text").style.display = "none";
			return;
		}

		// Tính kết quả quy đổi
		const quyDoi = quyDoiTienTe(token, soLuong, donVi);
		quyDoiDisplay.value = quyDoi;

		// Hiển thị text đỏ
		const textDiv = document.getElementById("token-equivalent-text");
		if (textDiv) {
			textDiv.style.display = "block";
			textDiv.innerHTML = `Kết quả quy đổi là: <strong>${soLuong} ${token} ≈ ${quyDoi}</strong>`;
		}
	}

	// Sự kiện nút "Tiếp tục"
	document.querySelectorAll(".hero-btn.bc-btn-next").forEach((nut) =>
		nut.addEventListener("click", (e) => {
			e.preventDefault();
			const hoTen = document.getElementById("bc-donor-name")?.value?.trim();
			const email = document.getElementById("bc-donor-email")?.value?.trim();
			const duAn = document.getElementById("bc-donation-project")?.value;
			const token = tokenSelect.value;
			const soLuong = parseFloat(soLuongInput.value);

			if (email && !kiemTraEmail(email)) {
				Swal.fire({
					title: "Email không hợp lệ",
					text: "Vui lòng nhập email đúng định dạng!",
					icon: "error",
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

			if (!duAn) {
				Swal.fire({
					title: "Chưa chọn dự án",
					text: "Vui lòng chọn dự án quyên góp!",
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

			if (!token || !soLuong || soLuong <= 0) {
				Swal.fire({
					title: "Dữ liệu không hợp lệ",
					text: "Vui lòng chọn loại token và nhập số lượng hợp lệ!",
					icon: "error",
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

			if (buocHienTaiBlockchain < tongSoBuocBlockchain) {
				chuyenBuocBlockchain(buocHienTaiBlockchain + 1);
			} else if (buocHienTaiBlockchain === tongSoBuocBlockchain) {
				Swal.fire({
					title: "Quyên góp thành công!",
					text: "Bạn có muốn quay về trang chủ không?",
					icon: "success",
					showCancelButton: true,
					confirmButtonText: "Có, quay về",
					cancelButtonText: "Ở lại",
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
						window.location.href = "/";
					}
				});
			}
		})
	);

	// Sự kiện nút "Quay lại"
	document.querySelectorAll(".hero-btn.bc-btn-back").forEach((nut) =>
		nut.addEventListener("click", (e) => {
			e.preventDefault();
			if (buocHienTaiBlockchain === 1) {
				Swal.fire({
					title: "Bạn đang ở bước đầu tiên!",
					text: "Không thể quay lại nữa",
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
			chuyenBuocBlockchain(buocHienTaiBlockchain - 1);
		})
	);

	// Sự kiện nút "Tạo Ví Mới"
	document.getElementById("create-wallet-btn")?.addEventListener("click", () => {
		Swal.fire({
			title: "Thành công",
			text: "Ví mới đã được tạo! Vui lòng kiểm tra địa chỉ ví.",
			icon: "success",
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
	});
});

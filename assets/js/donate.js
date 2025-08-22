// ----------- Step Navigation & Confetti ----------
let clickCount = 0;

function goToStep(step) {
	const totalSteps = 4;

	if (clickCount >= 3) {
		alert("Cứ bấm đi, máy tính đang cười thầm đó 🤣🤣🤣");
		location.reload();
		return;
	}

	for (let i = 1; i <= totalSteps; i++) {
		document.getElementById(`step${i}`)?.classList.add("hidden");
		document.getElementById(`circle${i}`)?.classList.remove("active");
		document.getElementById(`label${i}`)?.classList.remove("active");
		document.getElementById(`line${i - 1}`)?.classList.remove("active");
	}

	document.getElementById(`step${step}`)?.classList.remove("hidden");

	for (let i = 1; i <= step; i++) {
		document.getElementById(`circle${i}`)?.classList.add("active");
		document.getElementById(`label${i}`)?.classList.add("active");
		if (i > 1) document.getElementById(`line${i - 1}`)?.classList.add("active");
	}

	if (step === 4) {
		clickCount++;
		launchFireworks();
	}
}

function launchFireworks() {
	const duration = 3000;
	const end = Date.now() + duration;

	(function frame() {
		confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 } });
		confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 } });
		if (Date.now() < end) requestAnimationFrame(frame);
	})();
}

// ----------- Donation Table & Pagination ----------
const donations = [
	{ name: "Sơn Tùng MTP", amount: "10.000.000đ", time: "13:15:07 - 10/05/2025", du_an: "Học bổng cho trẻ em vùng cao" },
	{ name: "Trịnh Trần Phương Tuấn", amount: "3.500.000đ", time: "08:58:24 - 10/05/2025", du_an: "Mang lớp học đến vùng cao Điện Biên" },
	{ name: "Mono", amount: "7.500.000đ", time: "09:07:34 - 08/05/2025", du_an: "Mùa hè ý nghĩa cùng lớp học tình nguyện" },
	{ name: "Phạm Thị Duyên", amount: "90.000đ", time: "00:42:04 - 08/05/2025", du_an: "Quên góp sách vở cho trẻ em nghèo" },
	{ name: "Đỗ Minh Hòa", amount: "1.000.000đ", time: "19:41:10 - 06/05/2025", du_an: "Khóa học kỹ năng sống cho trẻ em" },
	{ name: "Ngô Quang Huy", amount: "150.000đ", time: "10:59:22 - 06/05/2025", du_an: "Hỗ trợ dinh dưỡng cho trẻ vùng cao" },
	{ name: "Vũ Thị Hạnh", amount: "5.000.000đ", time: "10:49:29 - 06/05/2025", du_an: "Xây dựng thư viện cộng đồng tại Cao Bằng" },
	{ name: "Bùi Văn Khang", amount: "800.000đ", time: "23:42:58 - 05/05/2025", du_an: "Hỗ trợ áo ấm mùa đông cho trẻ em " },
	{ name: "Tạ Thị Linh", amount: "50.000đ", time: "12:31:23 - 04/05/2025", du_an: "Trại hè kỹ năng cho trẻ em miền núi" },
	{ name: "Mai Văn Mạnh", amount: "20.000.000đ", time: "15:37:02 - 03/05/2025", du_an: "Học bổng cho trẻ em vùng cao" },
	{ name: "Lý Hải Nam", amount: "3.000.000đ", time: "10:00:00 - 03/05/2025", du_an: "Mang lớp học đến vùng cao Điện Biên" },
	{ name: "Trịnh Xuân Nhật", amount: "600.000đ", time: "09:00:00 - 03/05/2025", du_an: "Mùa hè ý nghĩa cùng lớp học tình nguyện" },
	{ name: "Dương Thị Oanh", amount: "12.000đ", time: "08:00:00 - 03/05/2025", du_an: "Quyên góp sách vở cho trẻ em nghèo" },
	{ name: "Hoàng Văn Phúc", amount: "1.200.000đ", time: "07:30:00 - 02/05/2025", du_an: "Khóa học kỹ năng sống cho trẻ em nghèo" },
	{ name: "Nguyễn Thị Quỳnh", amount: "25.000.000đ", time: "06:15:00 - 02/05/2025", du_an: "Hỗ trợ dinh dưỡng cho trẻ em vùng cao" },
	{ name: "Phan Hữu Sang", amount: "70.000đ", time: "05:00:00 - 02/05/2025", du_an: "Xây dựng thư viện cộng đồng tại Cao Bằng" },
	{ name: "Trần Minh Thắng", amount: "180.000đ", time: "04:45:00 - 02/05/2025", du_an: "Hỗ trợ áo ấm mùa đông cho trẻ em nghèo" },
	{ name: "Vũ Thị Uyên", amount: "350.000đ", time: "03:20:00 - 02/05/2025", du_an: "Trại hè kỹ năng cho trẻ em miền núi" },
	{ name: "Nguyễn Văn Vinh", amount: "11.000.000đ", time: "02:10:00 - 01/05/2025", du_an: "Quên góp sách vở cho trẻ em nghèo" },
	{ name: "Phạm Thị Xuân", amount: "950.000đ", time: "01:00:00 - 01/05/2025", du_an: "Hỗ trợ dinh dưỡng cho trẻ em vùng cao" },
	{ name: "Lê Hồng Yến", amount: "45.000đ", time: "00:30:00 - 01/05/2025", du_an: "Mang lớp học đến vùng cao Điện Biên" },
	{ name: "Đoàn Trọng Nam", amount: "5.000.000đ", time: "21:00:00 - 30/04/2025", du_an: "Xây dựng thư viện cộng đồng tại Cao Bằng" },
];

const rowsPerPage = 8;
let currentPage = 1;
let filteredDonations = [...donations];

function handleSearch() {
	const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

	filteredDonations = donations.filter((donation) => {
		const nameMatch = donation.name.toLowerCase().includes(keyword);
		const dateMatch = donation.time.toLowerCase().includes(keyword);
		const du_anMatch = donation.du_an.toLowerCase().includes(keyword);
		const costMatch = donation.amount.toLowerCase().includes(keyword);
		return nameMatch || dateMatch || du_anMatch || costMatch;
	});

	currentPage = 1;
	renderTable(currentPage);
	renderPagination();
}

function renderTable(page) {
	const start = (page - 1) * rowsPerPage;
	const end = start + rowsPerPage;
	const sliced = filteredDonations.slice(start, end);

	const tbody = document.getElementById("donationTableBody");
	tbody.innerHTML = "";
	sliced.forEach((d, index) => {
		const stt = start + index + 1;
		tbody.innerHTML += `<tr>
			<td>${stt}</td>
			<td>${d.name}</td>
			<td>${d.amount}</td>
			<td>${d.time}</td>
			<td>${d.du_an}</td>
		</tr>`;
	});
}

function renderPagination() {
	const pageCount = Math.ceil(donations.length / rowsPerPage);
	const pagination = document.getElementById("pagination");
	pagination.innerHTML = "";

	for (let i = 1; i <= pageCount; i++) {
		pagination.innerHTML += `
			<li class="page-item ${i === currentPage ? "active" : ""}">
				<a class="page-link" href="#" onclick="event.preventDefault();goToPage(${i})">${i}</a>
			</li>`;
	}
}

function goToPage(page) {
	currentPage = page;
	renderTable(page);
	renderPagination();
}

// ----------- Payment Method Click ----------
function setupPaymentOptions() {
	const options = document.querySelectorAll("#payment-methods .payment-option");
	options.forEach((option) => {
		option.addEventListener("click", () => {
			options.forEach((o) => o.classList.remove("active"));
			option.classList.add("active");
		});
	});
}

// ----------- QR Toggle ----------
function showQRInfo() {
	document.querySelector("#contact-info .contact-box").style.display = "none";
	document.getElementById("qr-info").style.display = "block";
}

function hideQRInfo() {
	document.querySelector("#contact-info .contact-box").style.display = "block";
	document.getElementById("qr-info").style.display = "none";
}

// ----------- On Load ----------
window.onload = () => {
	renderTable(currentPage);
	renderPagination();
	setupPaymentOptions();

	// Gắn sự kiện tìm kiếm
	const searchInput = document.getElementById("searchInput");
	if (searchInput) {
		searchInput.addEventListener("input", handleSearch);
	}

	// Chọn số tiền
	const buttons = document.querySelectorAll(".donate-btn-money");
	const customInputDiv = document.getElementById("customAmountInput");
	const donationInput = document.getElementById("donationAmount");

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const value = button.textContent.trim();

			buttons.forEach((btn) => btn.classList.remove("active"));

			if (value === "CON SỐ KHÁC") {
				customInputDiv.style.display = "block";
				donationInput.value = "";
				donationInput.focus();
			} else {
				button.classList.add("active");
				customInputDiv.style.display = "none";
				donationInput.value = value;
			}
		});
	});
};

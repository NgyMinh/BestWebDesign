document.addEventListener("DOMContentLoaded", () => {
	// Tạo nút toggle
	const toggleBtn = document.createElement("button");
	toggleBtn.classList.add("toggle-btn");
	toggleBtn.innerHTML = "<span></span>";
	document.querySelector(".header").appendChild(toggleBtn);

	// Tạo menu di động
	const mobileMenu = document.createElement("div");
	mobileMenu.classList.add("mobile-menu");
	document.body.appendChild(mobileMenu);

	// Di chuyển navbar và right-header vào menu di động
	const navbar = document.querySelector(".header .navbar");
	const rightHeader = document.querySelector(".header .right-header");
	mobileMenu.appendChild(navbar.cloneNode(true));
	mobileMenu.appendChild(rightHeader.cloneNode(true));

	// Tạo lớp phủ (overlay)
	const overlay = document.createElement("div");
	overlay.classList.add("mobile-menu-overlay");
	document.body.appendChild(overlay);

	// Chức năng toggle
	toggleBtn.addEventListener("click", () => {
		toggleBtn.classList.toggle("active");
		mobileMenu.classList.toggle("active");
		overlay.classList.toggle("active");
	});

	// Đóng menu khi nhấn vào lớp phủ
	overlay.addEventListener("click", () => {
		toggleBtn.classList.remove("active");
		mobileMenu.classList.remove("active");
		overlay.classList.remove("active");
	});
});

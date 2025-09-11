document.addEventListener("DOMContentLoaded", () => {
	// Tạo nút toggle
	const toggleBtn = document.createElement("button");
	toggleBtn.classList.add("toggle-btn");
	toggleBtn.innerHTML = "<span></span>";
	document.querySelector(".header").appendChild(toggleBtn);

	// Tạo menu di động
	const mobileMenu = document.createElement("div");
	mobileMenu.classList.add("mobile-menu");
	mobileMenu.style.display = "none"; // Ẩn hẳn ban đầu
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

	// Hàm mở menu
	const openMenu = () => {
		mobileMenu.style.display = "flex";
		requestAnimationFrame(() => {
			toggleBtn.classList.add("active");
			mobileMenu.classList.add("active");
			overlay.classList.add("active");
		});
	};

	// Hàm đóng menu
	const closeMenu = () => {
		toggleBtn.classList.remove("active");
		mobileMenu.classList.remove("active");
		overlay.classList.remove("active");

		// Đợi animation xong rồi mới ẩn hẳn
		mobileMenu.addEventListener(
			"transitionend",
			() => {
				if (!mobileMenu.classList.contains("active")) {
					mobileMenu.style.display = "none";
				}
			},
			{ once: true }
		);
	};

	// Toggle khi bấm nút
	toggleBtn.addEventListener("click", () => {
		if (mobileMenu.classList.contains("active")) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	// Đóng khi click overlay
	overlay.addEventListener("click", closeMenu);
});

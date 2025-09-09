const nutAnHeader = document.getElementById("hideHeaderBtn");
const iconHeader = document.getElementById("iconHeader");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const header = document.querySelector(".header");

// Biến lưu trạng thái header.scrolled đang ẩn hay hiện
let daAnHeaderScrolled = false;

nutAnHeader.addEventListener("click", () => {
	if (!header.classList.contains("scrolled")) return;

	daAnHeaderScrolled = !daAnHeaderScrolled;

	if (daAnHeaderScrolled) {
		header.style.transform = "translateY(-150%)";
		header.style.opacity = "0";
		iconHeader.classList.replace("fa-eye", "fa-eye-slash");
	} else {
		header.style.transform = "translateY(0)";
		header.style.opacity = "1";
		iconHeader.classList.replace("fa-eye-slash", "fa-eye");
	}
});

// ----- Thay handler scroll-to-top ở đây -----
scrollTopBtn.addEventListener("click", (e) => {
	e.preventDefault();

	smoothScrollToTop(0);
});

function smoothScrollToTop(duration = 5000) {
	const startY = window.scrollY || window.pageYOffset;
	if (startY === 0) return;

	const startTime = performance.now();

	// easing mượt: easeInOutCubic
	function easeInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	let cancelled = false;
	const onUserScroll = () => {
		cancelled = true;
		window.removeEventListener("wheel", onUserScroll);
		window.removeEventListener("touchstart", onUserScroll);
		window.removeEventListener("keydown", onUserScroll);
	};

	// nếu người dùng tương tác (cuộn/chạm/nhấn) -> dừng auto scroll
	window.addEventListener("wheel", onUserScroll, { passive: true });
	window.addEventListener("touchstart", onUserScroll, { passive: true });
	window.addEventListener("keydown", onUserScroll, { passive: true });

	function frame(now) {
		if (cancelled) return;
		const elapsed = now - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const eased = easeInOutCubic(progress);
		const y = Math.round(startY * (1 - eased));
		window.scrollTo(0, y);

		if (elapsed < duration) {
			requestAnimationFrame(frame);
		} else {
			// cleanup
			window.removeEventListener("wheel", onUserScroll);
			window.removeEventListener("touchstart", onUserScroll);
			window.removeEventListener("keydown", onUserScroll);
		}
	}

	requestAnimationFrame(frame);
}
// -------------------------------------------

window.addEventListener("scroll", () => {
	const scrollY = window.scrollY;

	if (scrollY > 50) {
		header.classList.add("scrolled");

		// Nếu header chưa bị ẩn, hiển thị bình thường
		if (!daAnHeaderScrolled) {
			header.style.transform = "translateY(0)";
			header.style.opacity = "1";
		}
	} else {
		header.classList.remove("scrolled");

		// Khi scroll lên top, luôn hiện header
		header.style.transform = "";
		header.style.opacity = "";
		daAnHeaderScrolled = false; // reset trạng thái nút
		iconHeader.classList.replace("fa-eye-slash", "fa-eye");
	}

	// Hiện/ẩn nút toggle và scroll top
	if (scrollY > 250) {
		nutAnHeader.classList.add("show");
		scrollTopBtn.classList.add("show");
	} else {
		nutAnHeader.classList.remove("show");
		scrollTopBtn.classList.remove("show");
	}
});

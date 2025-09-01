const header = document.querySelector(".header");
const toggleBtn = document.getElementById("toggleHeaderBtn");

// Xử lý khi scroll để thêm class 'scrolled'
window.addEventListener("scroll", () => {
	if (window.scrollY > 50) {
		header.classList.add("scrolled");
	} else {
		header.classList.remove("scrolled");
	}
});

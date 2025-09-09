document.addEventListener("DOMContentLoaded", () => {
	const content = document.querySelector(".page-wrapper"); // chỉ thay phần nội dung chính

	// Chặn click menu
	document.addEventListener("click", async (e) => {
		const a = e.target.closest("a[href]");
		if (!a) return;

		const href = a.getAttribute("href");
		if (!href || href.startsWith("#") || a.target === "_blank") return;

		if (a.hostname === location.hostname) {
			e.preventDefault();

			// Fade out
			content.classList.add("fade-out");

			try {
				const res = await fetch(href);
				const text = await res.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(text, "text/html");

				// Lấy nội dung mới trong .page-wrapper
				const newContent = doc.querySelector(".page-wrapper").innerHTML;

				setTimeout(() => {
					content.innerHTML = newContent; // chỉ thay phần chính
					content.classList.remove("fade-out");
					content.classList.add("fade-in");

					history.pushState(null, "", href);

					setTimeout(() => {
						content.classList.remove("fade-in");
					}, 300);
				}, 300);
			} catch (err) {
				console.error("Lỗi load trang:", err);
				location.href = href; // fallback
			}
		}
	});

	// Back/Forward
	window.addEventListener("popstate", async () => {
		const url = location.href;
		const res = await fetch(url);
		const text = await res.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");
		const newContent = doc.querySelector(".page-wrapper").innerHTML;
		content.innerHTML = newContent;
	});
});

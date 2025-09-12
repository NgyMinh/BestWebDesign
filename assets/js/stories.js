// Đợi sharedData load
function waitForData(callback) {
	if (window.sharedData) {
		console.log("window.sharedData loaded:", window.sharedData);
		callback();
	} else {
		console.log("Waiting for window.sharedData...");
		setTimeout(() => waitForData(callback), 100);
	}
}

function showStories() {
	const storiesSection = document.getElementById("storiesSection");
	const storiesList = document.getElementById("storiesList");

	if (!storiesSection || !storiesList) {
		console.error("Không tìm thấy storiesSection hoặc storiesList");
		return;
	}

	if (!window.sharedData || window.sharedData.length === 0) {
		console.error("window.sharedData không tồn tại hoặc rỗng");
		storiesList.innerHTML = '<p class="text-center">Không có dự án nào để hiển thị.</p>';
		return;
	}

	const ITEMS_PER_LOAD = 6;
	let displayedCount = 0;

	// Cắt chữ để hiển thị summary + more
	function splitText(text, maxChars) {
		if (text.length <= maxChars) return [text, ""];
		let trimmed = text.substring(0, maxChars);
		const lastSpace = trimmed.lastIndexOf(" ");
		if (lastSpace > 0) trimmed = trimmed.substring(0, lastSpace);
		return [trimmed, text.substring(trimmed.length)];
	}

	// Hiển thị các dự án
	function displayStories(startIndex, count) {
		const endIndex = Math.min(startIndex + count, window.sharedData.length);
		const storiesToShow = window.sharedData.slice(startIndex, endIndex);

		const htmlToAppend = storiesToShow
			.map((story, index) => {
				const slug = story.title
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");

				const percent = Math.min(100, Math.round((story.current / story.goal) * 100));
				const [summary, more] = splitText(story.description, 130);

				return `
<div id="${slug}" class="col-md-6 col-lg-4">
  <div class="story-card">
    <div class="image-wrapper">
      ${
			story.source
				? `<a href="${story.source}"><img src="${story.image}" alt="${story.title}" onerror="this.src='../assets/img/welcome-section.jpeg'" /></a>`
				: `<img src="${story.image}" alt="${story.title}" onerror="this.src='../assets/img/welcome-section.jpeg'" />`
		}
      <div class="progress-overlay">
        <div class="progress-content">
          <div class="progress-info">
            <span class="amount">${story.current.toLocaleString("vi-VN")} đ</span>
            <span class="percent">${percent}%</span>
          </div>
          <div class="progress-bar-stories">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
        </div>
        <div class="progress-icon">
          <img src="assets/img/money.png" alt="">
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="card-text">
        <h3>${story.title}</h3>
        <p>
          <span class="summary">${summary}</span>
          <span class="more-content" style="display:none;">${more}</span>
          <span class="toggle-more">
            <i class="fa-solid fa-chevron-down"></i>
          </span>
        </p>
        ${story.source ? `<a class="link-original" href="${story.source}" style="display:none;">Xem bài gốc</a>` : ""}
      </div>
      <a href="donate.html?story_id=${encodeURIComponent(story.title)}#donate" class="common-btn">Quyên góp ngay</a>
    </div>
  </div>
</div>
`;
			})
			.join("");

		storiesList.insertAdjacentHTML("beforeend", htmlToAppend);
		displayedCount = endIndex;
		updateLoadMoreButton();
	}

	// Nút Xem thêm
	function updateLoadMoreButton() {
		let loadMoreBtn = document.getElementById("loadMoreBtn");
		if (!loadMoreBtn) {
			loadMoreBtn = document.createElement("button");
			loadMoreBtn.id = "loadMoreBtn";
			loadMoreBtn.className = "load-more-btn";
			loadMoreBtn.textContent = "Xem thêm";
			storiesSection.appendChild(loadMoreBtn);

			loadMoreBtn.addEventListener("click", () => {
				const remaining = window.sharedData.length - displayedCount;
				if (remaining <= 0) return;

				const overlay = document.querySelector(".fullscreen-loader");
				overlay.style.display = "flex"; // hiện loader fullscreen
				loadMoreBtn.disabled = true;

				setTimeout(() => {
					displayStories(displayedCount, remaining);
					overlay.style.display = "none";
					loadMoreBtn.disabled = false;
				}, 1000);
			});
		}

		loadMoreBtn.style.display = displayedCount >= window.sharedData.length ? "none" : "block";
	}

	// Hiển thị ban đầu
	storiesList.innerHTML = "";
	displayStories(0, ITEMS_PER_LOAD);

	// Scroll theo hash nếu có
	const hash = window.location.hash;
	if (hash) {
		const target = document.querySelector(hash);
		if (target) target.scrollIntoView({ behavior: "smooth" });
	}
}

// Cuộn xuống
(function () {
	const hint = document.getElementById("scroll-hint");
	if (!hint) return;

	const THRESHOLD = 120;
	const SHOW_DURATION = 5000; // ms hiển thị (6s)
	let lastY = window.scrollY || 0;
	let shown = false;
	let timeoutId = null;

	function showOnce() {
		if (shown) return;
		shown = true;
		hint.classList.add("show");
		// ẩn sau SHOW_DURATION
		timeoutId = setTimeout(() => {
			hint.classList.remove("show");
		}, SHOW_DURATION);
	}

	window.addEventListener(
		"scroll",
		() => {
			const y = window.scrollY || 0;
			const isScrollingDown = y > lastY;
			// Nếu đang kéo xuống, vượt ngưỡng và chưa show => show
			if (!shown && isScrollingDown && y > THRESHOLD) {
				showOnce();
			}
			lastY = y;
		},
		{ passive: true }
	);

	// Nếu muốn: người dùng click/touch cũng có thể trigger (bỏ nếu không cần)
	hint.addEventListener("click", () => {
		hint.classList.remove("show");
		clearTimeout(timeoutId);
	});
})();

// Toggle Xem thêm / Xem ít
document.addEventListener("click", function (e) {
	const toggle = e.target.closest(".toggle-more");
	if (!toggle) return;

	const more = toggle.previousElementSibling;
	const summary = more.previousElementSibling;
	const link = toggle.parentElement.nextElementSibling;
	const icon = toggle.querySelector("i");

	if (more.style.display === "none") {
		more.style.display = "inline";
		if (link) link.style.display = "block";
		icon.classList.remove("fa-chevron-down");
		icon.classList.add("fa-chevron-up");
	} else {
		more.style.display = "none";
		if (link) link.style.display = "none";
		icon.classList.remove("fa-chevron-up");
		icon.classList.add("fa-chevron-down");
	}
});

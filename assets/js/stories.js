// Đợi sharedData load
function waitForData(callback) {
	if (window.sharedData) {
		callback();
	} else {
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
		storiesList.innerHTML = '<p class="text-center" data-lang-key="no_projects"></p>';
		if (window.languageSwitcher) {
			window.languageSwitcher.updateContent();
		}
		return;
	}

	const ITEMS_PER_LOAD = 6;
	let displayedCount = 0;

	function setupReadMore() {
		const storyDescriptions = document.querySelectorAll(".story-card .card-text p");
		storyDescriptions.forEach((p) => {
			if (p.querySelector(".toggle-more")) return;

			const maxChars = 130;
			const fullText = p.textContent.trim();

			if (fullText.length > maxChars) {
				let summaryText = fullText.substring(0, maxChars);
				const lastSpace = summaryText.lastIndexOf(" ");
				if (lastSpace > 0) summaryText = summaryText.substring(0, lastSpace);

				const moreText = fullText.substring(summaryText.length);

				p.innerHTML = `
          <span class="summary">${summaryText}</span>
          <span class="more-content" style="display:none;">${moreText}</span>
          <span class="toggle-more"><i class="fa-solid fa-chevron-down"></i></span>
        `;
			}
		});
	}

	function displayStories(startIndex, count) {
		const endIndex = Math.min(startIndex + count, window.sharedData.length);
		const storiesToShow = window.sharedData.slice(startIndex, endIndex);

		const htmlToAppend = storiesToShow
			.map((story) => {
				const slug = story.title
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/[^\w\s-]/g, "")
					.replace(/\s+/g, "-");

				const percent = Math.min(100, Math.round((story.current / story.goal) * 100));

				return `
<div id="${slug}" class="col-md-6 col-lg-4">
  <div class="story-card">
    <div class="image-wrapper">
      ${
					story.source
						? `<a href="${story.source}" target="_blank" rel="noopener noreferrer"><img src="${story.image}" alt="" onerror="this.src='../assets/img/welcome-section.jpeg'" loading="lazy"/></a>`
						: `<img src="${story.image}" alt="" onerror="this.src='../assets/img/welcome-section.jpeg'" loading="lazy"/>`
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
        <h3 data-lang-key="${story.title}"></h3>
        <p data-lang-key="${story.description}"></p>
        ${story.source ? `<a class="link-original" href="${story.source}" target="_blank" rel="noopener noreferrer" style="display:none;" data-lang-key="view_source"></a>` : ""}
      </div>
      <a href="donate.html#donate" class="common-btn" data-lang-key="donate_now"></a>
    </div>
  </div>
</div>`;
			})
			.join("");

		storiesList.insertAdjacentHTML("beforeend", htmlToAppend);
		displayedCount = endIndex;

		if (window.languageSwitcher) {
			window.languageSwitcher.updateContent();
		}

		updateLoadMoreButton();
	}

	function updateLoadMoreButton() {
		let loadMoreBtn = document.getElementById("loadMoreBtn");
		if (!loadMoreBtn) {
			loadMoreBtn = document.createElement("button");
			loadMoreBtn.id = "loadMoreBtn";
			loadMoreBtn.className = "load-more-btn";
			loadMoreBtn.setAttribute("data-lang-key", "load_more");
			storiesSection.appendChild(loadMoreBtn);

			loadMoreBtn.addEventListener("click", () => {
				const overlay = document.querySelector(".fullscreen-loader");
				if(overlay) overlay.style.display = "flex";
				loadMoreBtn.disabled = true;

				setTimeout(() => {
					displayStories(displayedCount, ITEMS_PER_LOAD);
					if(overlay) overlay.style.display = "none";
					loadMoreBtn.disabled = false;
				}, 1000);
			});
		}
		loadMoreBtn.style.display = displayedCount >= window.sharedData.length ? "none" : "block";
	}

	storiesList.innerHTML = "";
	displayStories(0, ITEMS_PER_LOAD);

	document.addEventListener("languageChanged", () => {
		setTimeout(setupReadMore, 50);
	});
}

(function () {
	const hint = document.getElementById("scroll-hint");
	if (!hint) return;
	const THRESHOLD = 120;
	const SHOW_DURATION = 5000;
	let lastY = window.scrollY || 0;
	let shown = false;
	let timeoutId = null;

	function showOnce() {
		if (shown) return;
		shown = true;
		hint.classList.add("show");
		timeoutId = setTimeout(() => hint.classList.remove("show"), SHOW_DURATION);
	}

	window.addEventListener( "scroll", () => {
			const y = window.scrollY || 0;
			if (!shown && (y > lastY) && y > THRESHOLD) showOnce();
			lastY = y;
		}, { passive: true }
	);
	hint.addEventListener("click", () => {
		hint.classList.remove("show");
		clearTimeout(timeoutId);
	});
})();

document.addEventListener("click", function (e) {
	const toggle = e.target.closest(".toggle-more");
	if (!toggle) return;

	const more = toggle.previousElementSibling;
	const cardText = toggle.closest(".card-text");
	const link = cardText.querySelector(".link-original");
	const icon = toggle.querySelector("i");

	if (more.style.display === "none") {
		more.style.display = "inline";
		if (link) link.style.display = "block";
		icon.classList.replace("fa-chevron-down", "fa-chevron-up");
	} else {
		more.style.display = "none";
		if (link) link.style.display = "none";
		icon.classList.replace("fa-chevron-up", "fa-chevron-down");
	}
});

waitForData(showStories);
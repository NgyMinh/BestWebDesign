const toggle = document.getElementById("searchToggle");
const container = document.querySelector(".search");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
let storiesData = window.sharedData || [];

toggle.addEventListener("click", function (e) {
	e.preventDefault();
	container.classList.toggle("active");

	const input = container.querySelector("input");
	if (container.classList.contains("active")) {
		setTimeout(() => input.focus(), 100);
	}
});

// Đóng dropdown khi click ra ngoài
document.addEventListener("click", function (e) {
	if (!container.contains(e.target)) {
		container.classList.remove("active");
		searchResults.innerHTML = ""; // Xóa kết quả khi đóng
	}
});

// ✅ Hàm tạo ID slug giống stories.js (đã sửa)
function createSlug(title) {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
		.replace(/[^\w\s-]/g, "") // Loại ký tự đặc biệt
		.replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu -
}

// ✅ Hàm cuộn đến câu chuyện tương ứng (đã sửa để dùng createSlug)
function scrollToStory(title) {
	const storyId = createSlug(title);
	const storyElement = document.getElementById(storyId);
	if (storyElement) {
		storyElement.scrollIntoView({ behavior: "smooth" });
		container.classList.remove("active");
		searchResults.innerHTML = "";
	} else {
		console.warn(`Không tìm thấy phần tử cho tiêu đề: ${title}`);
	}
}

// Theo dõi thay đổi dữ liệu khi có thêm câu chuyện
function updateStoriesData() {
	storiesData = window.sharedData || [];
	performSearch(searchInput.value);
}

// Tìm kiếm theo tiêu đề và tags
function performSearch(query) {
	const searchQuery = query.toLowerCase().trim();
	searchResults.innerHTML = "";

	if (searchQuery.length > 0) {
		const filteredStories = storiesData.filter((story) => story.title.toLowerCase().includes(searchQuery) || (story.tags && story.tags.some((tag) => tag.toLowerCase().includes(searchQuery))));

		if (filteredStories.length > 0) {
			filteredStories.forEach((story) => {
				const resultItem = document.createElement("div");
				resultItem.className = "search-result-item";

				const storyId = createSlug(story.title); // ✅ dùng createSlug thay vì replace thường
				resultItem.innerHTML = `<a href="stories.html#${storyId}">${story.title}</a>`;
				searchResults.appendChild(resultItem);
			});
		} else {
			searchResults.innerHTML = "<div class='search-result-item'>Không tìm thấy kết quả</div>";
		}
	}
}

searchInput.addEventListener("input", function () {
	performSearch(this.value);
});

// Theo dõi thay đổi trong window.sharedData
Object.defineProperty(window, "sharedData", {
	set: function (newValue) {
		storiesData = newValue || [];
		performSearch(searchInput.value);
	},
	get: function () {
		return storiesData;
	},
});

// Gọi lại tìm kiếm khi dữ liệu thay đổi
window.addEventListener("sharedDataUpdated", updateStoriesData);

// Khởi tạo lần đầu
performSearch("");

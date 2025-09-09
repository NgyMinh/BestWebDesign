// Sự kiện khi modal mở
$("#myModal").on("show.bs.modal", function (e) {
	var button = $(e.relatedTarget);
	var title = button.data("title");
	var number = button.data("number");
	var desc = button.data("desc");
	var danger = button.data("danger");
	var img = button.data("img"); // <== ví dụ: data-img="link.jpg"

	// Lấy phần tử danger
	var dangerEl = $(this).find(".modal-body .danger");

	// Thay đổi tiêu đề modal
	$(this).find(".modal-title").text(title);

	// Cập nhật nội dung modal
	$(this)
		.find(".modal-body .number")
		.text("Số lượng tồn kho: " + number);

	if (number !== undefined && parseInt(number, 10) < 10) {
		dangerEl.text(danger).show();
	} else {
		dangerEl.hide();
	}

	// Nội dung desc
	$(this).find(".modal-body .desc").text(desc);

	// Nội dung danger
	$(this)
		.find(".modal-body .danger")
		.text("Mua ngay kẻo hết!" + danger);

	// Nội dung img
	$(this).find(".modal-img").attr("src", img);
});

// Hàm phóng to ảnh khi người dùng nhấn vào ảnh trong modal
function openLargeImage(imgElement) {
	var imgSrc = imgElement.src; // Lấy src của ảnh được nhấn
	var modal = document.createElement("div");
	modal.style.position = "fixed";
	modal.style.top = "0";
	modal.style.left = "0";
	modal.style.width = "100vw";
	modal.style.height = "100vh";
	modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
	modal.style.display = "flex";
	modal.style.alignItems = "center";
	modal.style.justifyContent = "center";
	modal.style.zIndex = "10000";

	// Thêm ảnh phóng to vào modal
	var largeImage = document.createElement("img");
	largeImage.src = imgSrc;
	largeImage.style.maxWidth = "90%";
	largeImage.style.maxHeight = "90%";
	modal.appendChild(largeImage);

	// Thêm sự kiện đóng modal khi nhấn vào modal
	modal.onclick = function () {
		document.body.removeChild(modal);
	};

	// Thêm modal vào body
	document.body.appendChild(modal);
}

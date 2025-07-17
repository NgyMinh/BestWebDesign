(function () {
	let cartCount = 0;
	let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

	function calculateCartCount() {
		return cartItems.reduce((total, item) => total + item.quantity, 0);
	}

	function updateCartCount() {
		cartCount = calculateCartCount();
		document.getElementById("cart-count").textContent = cartCount;
		localStorage.setItem("cartCount", cartCount);
	}

	document.addEventListener("DOMContentLoaded", function () {
		updateCartCount();

		$("#myModal").on("shown.bs.modal", function () {
			const buyBtn = document.querySelector("#myModal .btn-success");
			if (buyBtn) {
				buyBtn.removeEventListener("click", handleBuyClick);
				buyBtn.addEventListener("click", handleBuyClick);
			}
		});

		document.querySelectorAll(".shop-btn").forEach((btn) => {
			btn.addEventListener("click", function () {
				const title = this.dataset.title;
				const number = this.dataset.number;
				const danger = this.dataset.danger;
				const desc = this.dataset.desc;
				const img = this.dataset.img;
				const price = parseInt(this.dataset.price) || 0;

				// Gán nội dung modal
				document.querySelector("#myModal .modal-title").textContent = title;
				document.querySelector("#myModal .number").textContent = `Số lượng: ${number}`;
				document.querySelector("#myModal .danger").textContent = danger;
				document.querySelector("#myModal .desc").textContent = desc;
				document.querySelector("#myModal .modal-img").src = img;

				// Gán giá vào nút mua trong modal
				document.querySelector("#myModal .btn-success").setAttribute("data-price", price);
			});
		});
	});

	function handleBuyClick() {
		const modalImage = document.querySelector("#myModal .modal-img");
		const title = document.querySelector("#myModal .modal-title").textContent;
		const buyBtn = document.querySelector("#myModal .btn-success");
		const price = parseInt(buyBtn?.dataset.price) || 0;

		if (modalImage) {
			const newItem = { title, image: modalImage.src, price, quantity: 1 };
			const existingItemIndex = cartItems.findIndex((item) => item.title === title);

			if (existingItemIndex > -1) {
				cartItems[existingItemIndex].quantity += 1;
			} else {
				cartItems.push(newItem);
			}

			updateCartCount();
			localStorage.setItem("cartItems", JSON.stringify(cartItems));
			updateCartSidebar();
			alert("Đã thêm sản phẩm vào giỏ hàng!");

			// Hiệu ứng bay
			const modalRect = modalImage.getBoundingClientRect();
			const flyingItem = document.createElement("img");
			flyingItem.src = modalImage.src;
			flyingItem.classList.add("flying-item");
			flyingItem.style.left = `${modalRect.left + modalRect.width / 2}px`;
			flyingItem.style.top = `${modalRect.top + modalRect.height / 2}px`;
			document.body.appendChild(flyingItem);

			const cartIcon = document.querySelector("#cart-count");
			const cartRect = cartIcon.getBoundingClientRect();
			const targetX = cartRect.left + cartRect.width / 2 - 25;
			const targetY = cartRect.top + cartRect.height / 2 - 25;

			setTimeout(() => {
				flyingItem.style.transform = `translate(${targetX - modalRect.left - modalRect.width / 2}px, ${targetY - modalRect.top - modalRect.height / 2}px) scale(0.5)`;
				flyingItem.style.opacity = "0";
			}, 10);

			setTimeout(() => {
				flyingItem.remove();
			}, 500);
		}

		$("#myModal").modal("hide");
	}

	// Cần export để gọi ngoài file
	window.updateCartSidebar = updateCartSidebar;

	window.toggleCartPopup = function (event) {
		event.preventDefault();
		const sidebar = document.getElementById("cart-sidebar");
		if (sidebar.classList.contains("show")) {
			sidebar.classList.remove("show");
		} else {
			updateCartSidebar();
			sidebar.classList.add("show");
		}
	};

	function updateCartSidebar() {
		const cartItemsList = document.getElementById("cart-items");
		const cartTotal = document.getElementById("cart-total");
		cartItemsList.innerHTML = "";

		if (cartItems.length === 0) {
			cartItemsList.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
		} else {
			let total = 0;
			cartItems.forEach((item) => {
				const li = document.createElement("li");
				li.innerHTML = `
					<img src="${item.image}" alt="${item.title}">
					<div class="item-details">
						<p>${item.title} (x${item.quantity})</p>
						<span class="item-price">${item.price.toLocaleString()} VNĐ</span>
					</div>
				`;
				cartItemsList.appendChild(li);
				total += item.price * item.quantity;
			});
			cartTotal.textContent = total.toLocaleString() + " VNĐ";
		}
	}

	document.addEventListener("click", function (e) {
		const sidebar = document.getElementById("cart-sidebar");
		const cartIcon = document.querySelector(".cart a");
		if (sidebar.classList.contains("show") && !sidebar.contains(e.target) && !cartIcon.contains(e.target)) {
			sidebar.classList.remove("show");
		}
	});

	document.addEventListener("DOMContentLoaded", () => {
		const checkoutBtn = document.querySelector(".checkout-btn");

		if (checkoutBtn) {
			checkoutBtn.addEventListener("click", () => {
				if (cartItems.length === 0) {
					alert("Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.");
				} else {
					alert("🎉 Cảm ơn bạn đã thanh toán! Đơn hàng của bạn đang được xử lý.");

					// Xoá giỏ hàng
					cartItems = [];
					localStorage.removeItem("cartItems");
					updateCartCount();
					updateCartSidebar();

					// Ẩn giỏ hàng
					document.getElementById("cart-sidebar").classList.remove("show");
				}
			});
		}
	});
})();

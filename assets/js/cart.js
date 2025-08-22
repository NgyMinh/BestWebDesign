console.log("Cart script loading...");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Toggle cart popup
function toggleCartPopup(event) {
	if (event) event.preventDefault();

	const cartSidebar = document.getElementById("cart-sidebar");
	const cartOverlay = document.querySelector(".cart-overlay");

	if (!cartSidebar || !cartOverlay) return;

	if (cartSidebar.classList.contains("show")) {
		cartSidebar.classList.remove("show");
		cartOverlay.style.display = "none";
	} else {
		updateCartDisplay();
		cartSidebar.classList.add("show");
		cartOverlay.style.display = "block";
	}
}

// Close cart sidebar
function closeCartSidebar() {
	const cartSidebar = document.getElementById("cart-sidebar");
	const cartOverlay = document.querySelector(".cart-overlay");

	if (cartSidebar) cartSidebar.classList.remove("show");
	if (cartOverlay) cartOverlay.style.display = "none";
}

// Add item to cart
function addToCart(item) {
	if (!item || !item.title || !item.price) return;

	const existingItem = cart.find(cartItem => cartItem.title === item.title);

	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		cart.push({ ...item, quantity: 1 });
	}

	localStorage.setItem("cart", JSON.stringify(cart));
	updateCartCount();
	updateCartDisplay();
	showCartMessage("Đã thêm vào giỏ hàng!");
}

// Remove item
function removeFromCart(title) {
	cart = cart.filter(item => item.title !== title);
	localStorage.setItem("cart", JSON.stringify(cart));
	updateCartCount();
	updateCartDisplay();
	showCartMessage("Đã xóa khỏi giỏ hàng!");
}

// Update cart count
function updateCartCount() {
	const cartCount = document.getElementById("cart-count");
	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

	if (cartCount) {
		cartCount.textContent = totalItems;
		cartCount.style.display = totalItems > 0 ? "flex" : "none";
	}
}

// Update cart sidebar
function updateCartDisplay() {
	const cartItems = document.getElementById("cart-items");
	const cartTotal = document.getElementById("cart-total");

	if (!cartItems || !cartTotal) return;

	cartItems.innerHTML = "";
	let total = 0;

	if (cart.length === 0) {
		cartItems.innerHTML = '<li class="empty-cart">Giỏ hàng trống</li>';
	} else {
		cart.forEach(item => {
			total += item.price * item.quantity;
			const li = document.createElement("li");
			li.className = "cart-item";
			li.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.img || ''}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h5>${item.title}</h5>
                        <p>${item.price.toLocaleString("vi-VN")} VNĐ x ${item.quantity}</p>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.title}')">×</button>
            `;
			cartItems.appendChild(li);
		});
	}

	cartTotal.textContent = total.toLocaleString("vi-VN") + " VNĐ";
}

// Message hiển thị khi thêm/xóa
function showCartMessage(message) {
	const messageEl = document.createElement("div");
	messageEl.className = "cart-message";
	messageEl.textContent = message;
	Object.assign(messageEl.style, {
		position: "fixed", top: "20px", right: "20px",
		background: "#28a745", color: "white",
		padding: "10px 20px", borderRadius: "5px",
		zIndex: 10000, fontSize: "14px", opacity: 0,
		transition: "opacity 0.3s ease"
	});

	document.body.appendChild(messageEl);

	setTimeout(() => messageEl.style.opacity = 1, 10);
	setTimeout(() => {
		messageEl.style.opacity = 0;
		setTimeout(() => messageEl.remove(), 300);
	}, 2500);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
	updateCartCount();
	updateCartDisplay();

	const cartOverlay = document.querySelector(".cart-overlay");
	if (cartOverlay) {
		cartOverlay.addEventListener("click", closeCartSidebar);
	}
});

// Xuất ra global
window.toggleCartPopup = toggleCartPopup;
window.closeCartSidebar = closeCartSidebar;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

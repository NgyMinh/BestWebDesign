(function () {
	let sốLượngGiỏHàng = 0;
	let danhSáchSảnPhẩm = JSON.parse(localStorage.getItem("cartItems")) || [];
	let thôngTinHóaĐơn = null;

	function tínhTổngSốLượng() {
		return danhSáchSảnPhẩm.reduce((tổng, sảnPhẩm) => tổng + sảnPhẩm.quantity, 0);
	}

	function cậpNhậtSốLượngGiỏHàng() {
		sốLượngGiỏHàng = tínhTổngSốLượng();
		const cartCountElement = document.getElementById("cart-count");
		if (cartCountElement) {
			cartCountElement.textContent = sốLượngGiỏHàng;
		} else {
			console.warn("Không tìm thấy phần tử #cart-count");
		}
		localStorage.setItem("cartCount", sốLượngGiỏHàng);
	}

	function tạoSốHóaĐơn() {
		return `HD${Math.floor(100000 + Math.random() * 900000)}`;
	}

	function tạoHóaĐơn() {
		const ngàyLập = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
		const sốHóaĐơn = tạoSốHóaĐơn();
		let tổngTiền = 0;
		const thuếGTGT = 0.1; // Thuế suất 10%

		if (!danhSáchSảnPhẩm || danhSáchSảnPhẩm.length === 0) {
			console.warn("Danh sách sản phẩm trống, không thể tạo hóa đơn");
			return "";
		}

		let html = `
    <h2>HÓA ĐƠN ĐIỆN TỬ</h2>
    <p><strong>Số hóa đơn:</strong> ${sốHóaĐơn}</p>
    <p><strong>Ngày lập:</strong> ${ngàyLập}</p> 
    <p><strong>Tên người mua:</strong> Khách lẻ</p>
	<p><strong>Địa chỉ:</strong> 123 Đường Lê Lợi, Quận 1, TP.HCM</p>
    <hr>
    <h3>Chi tiết đơn hàng</h3>
    <table>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>Số lượng</th>
          <th>Đơn giá (VNĐ)</th>
          <th>Thành tiền (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
  `;

		danhSáchSảnPhẩm.forEach((item) => {
			const thànhTiền = item.price * item.quantity;
			tổngTiền += thànhTiền;
			html += `
      <tr>
        <td>${item.title}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td>${item.price.toLocaleString()}</td>
        <td>${thànhTiền.toLocaleString()}</td>
      </tr>
    `;
		});

		const tiềnThuế = tổngTiền * thuếGTGT;
		const tổngCộng = tổngTiền + tiềnThuế;

		html += `
      </tbody>
    </table>
    <p><strong>Tổng tiền hàng:</strong> ${tổngTiền.toLocaleString()} VNĐ</p>
    <p><strong>Thuế GTGT (10%):</strong> ${tiềnThuế.toLocaleString()} VNĐ</p>
    <p><strong>Tổng cộng:</strong><span style="color: var(--color-primary-2)"; font-weight: 700;> ${tổngCộng.toLocaleString()} VNĐ</span></p>
    <p><strong>Ghi chú:</strong> <i>Hóa đơn được xuất tự động theo Nghị định 123/2020/NĐ-CP</i></p>
  `;

		thôngTinHóaĐơn = { html, sốHóaĐơn, danhSáchSảnPhẩm: [...danhSáchSảnPhẩm] };
		console.log("Nội dung hóa đơn:", html); // Debug
		return html;
	}

	window.hiểnThịHóaĐơn = function () {
		const modal = document.getElementById("invoice-modal");
		const content = document.getElementById("invoice-content");
		if (modal && content) {
			const html = tạoHóaĐơn();
			if (!html) {
				console.warn("Hóa đơn trống, không thể hiển thị");
				alert("Không thể hiển thị hóa đơn vì giỏ hàng trống!");
				return;
			}
			content.innerHTML = html;
			console.log("Nội dung hóa đơn sau khi gán:", content.innerHTML); // Debug
			modal.style.display = "flex";
		} else {
			console.warn("Không tìm thấy #invoice-modal hoặc #invoice-content");
		}
	};

	window.tảiHóaĐơnPDF = async function () {
		const element = document.getElementById("invoice-content");
		const modal = document.getElementById("invoice-modal");
		const modalContent = document.querySelector(".invoice-modal-content");
		const downloadButton = modalContent ? modalContent.querySelector("button") : null;

		if (!element || !modal) {
			console.warn("Không tìm thấy #invoice-content hoặc #invoice-modal");
			return;
		}

		// Nếu chưa có thôngTinHóaĐơn, tạo và hiển thị
		if (!thôngTinHóaĐơn || !thôngTinHóaĐơn.html) {
			hiểnThịHóaĐơn?.();
		}

		// Hiển thị modal tạm thời để html2canvas render
		const wasHidden = window.getComputedStyle(modal).display === "none";
		if (wasHidden) modal.style.display = "flex";
		element.style.visibility = "visible";

		if (modalContent) {
			modalContent.style.overflowY = "visible";
			modalContent.style.maxHeight = "none";
		}
		if (downloadButton) downloadButton.style.display = "none";

		console.log("Đang chờ font...");
		try {
			await document.fonts.ready;
		} catch (e) {
			console.warn("document.fonts.ready lỗi:", e);
		}
		console.log("Fonts ready");

		// Đợi ảnh bên trong element (nếu có)
		const imgs = Array.from(element.querySelectorAll("img"));
		await Promise.all(
			imgs
				.map((img) => {
					if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
					try {
						img.crossOrigin = "anonymous";
					} catch (e) {}
					return new Promise((resolve) => {
						img.addEventListener("load", () => setTimeout(resolve, 50), { once: true });
						img.addEventListener("error", () => setTimeout(resolve, 50), { once: true });
					});
				})
				.concat([Promise.resolve()])
		);

		// Chờ DOM ổn định
		await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 600)));

		if (!element.innerHTML || element.innerHTML.trim().length === 0) {
			console.error("Nội dung hóa đơn rỗng khi chuẩn bị render PDF");
			alert("Không thể xuất PDF: nội dung hóa đơn rỗng.");
			if (wasHidden) modal.style.display = "none";
			if (downloadButton) downloadButton.style.display = "";
			return;
		}

		const opt = {
			margin: 10,
			filename: `HoaDon_${(thôngTinHóaĐơn && thôngTinHóaĐơn.sốHóaĐơn) || Date.now()}.pdf`,
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2, useCORS: true, logging: true, allowTaint: false },
			jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
		};

		try {
			const worker = html2pdf().from(element).set(opt);
			await worker
				.toPdf()
				.get("pdf")
				.then(function (pdf) {
					const blob = pdf.output("blob");
					const url = URL.createObjectURL(blob);
					window.open(url, "_blank"); // mở PDF ở tab mới để bạn kiểm tra
				});
			console.log("PDF đã được tạo (mở tab mới)");
		} catch (err) {
			console.error("Lỗi khi tạo PDF:", err);
			alert("Lỗi khi tạo PDF. Kiểm tra console để xem chi tiết.");
		} finally {
			// khôi phục UI
			if (wasHidden) modal.style.display = "none";
			if (modalContent) {
				modalContent.style.overflowY = "";
				modalContent.style.maxHeight = "";
			}
			if (downloadButton) downloadButton.style.display = "";
		}
	};

	window.đóngModalHóaĐơn = function () {
		const modal = document.getElementById("invoice-modal");
		if (modal) {
			modal.style.display = "none";
		}
	};

	document.addEventListener("DOMContentLoaded", function () {
		cậpNhậtSốLượngGiỏHàng();

		const cartIcon = document.querySelector(".cart a");
		if (cartIcon) {
			cartIcon.addEventListener("click", mởĐóngGiỏHàng);
		} else {
			console.warn("Không tìm thấy biểu tượng giỏ hàng (.cart a)");
		}

		$("#myModal").on("shown.bs.modal", function () {
			const nútMua = document.querySelector("#myModal .btn-success");
			if (nútMua) {
				nútMua.removeEventListener("click", xửLýNútMua);
				nútMua.addEventListener("click", xửLýNútMua);
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

				document.querySelector("#myModal .modal-title").textContent = title;
				document.querySelector("#myModal .number").textContent = `Số lượng: ${number}`;
				document.querySelector("#myModal .danger").textContent = danger;
				document.querySelector("#myModal .desc").textContent = desc;
				document.querySelector("#myModal .modal-img").src = img;

				document.querySelector("#myModal .btn-success").setAttribute("data-price", price);
			});
		});
	});

	function xửLýNútMua() {
		const modalImage = document.querySelector("#myModal .modal-img");
		const title = document.querySelector("#myModal .modal-title").textContent;
		const buyBtn = document.querySelector("#myModal .btn-success");
		const price = parseInt(buyBtn?.dataset.price) || 0;

		if (modalImage) {
			const newItem = { title, image: modalImage.src, price, quantity: 1 };
			const existingItemIndex = danhSáchSảnPhẩm.findIndex((item) => item.title === title);

			if (existingItemIndex > -1) {
				danhSáchSảnPhẩm[existingItemIndex].quantity += 1;
			} else {
				danhSáchSảnPhẩm.push(newItem);
			}

			cậpNhậtSốLượngGiỏHàng();
			localStorage.setItem("cartItems", JSON.stringify(danhSáchSảnPhẩm));
			cậpNhậtThanhGiỏHàng();
			alert("Đã thêm sản phẩm vào giỏ hàng!");

			const modalRect = modalImage.getBoundingClientRect();
			const flyingItem = document.createElement("img");
			flyingItem.src = modalImage.src;
			flyingItem.classList.add("flying-item");
			flyingItem.style.left = `${modalRect.left + modalRect.width / 2}px`;
			flyingItem.style.top = `${modalRect.top + modalRect.height / 2}px`;
			document.body.appendChild(flyingItem);

			const cartIcon = document.querySelector("#cart-count");
			if (cartIcon) {
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
		}

		$("#myModal").modal("hide");
	}

	window.tăngSốLượng = function (index, event) {
		event.stopPropagation();
		danhSáchSảnPhẩm[index].quantity += 1;
		localStorage.setItem("cartItems", JSON.stringify(danhSáchSảnPhẩm));
		cậpNhậtSốLượngGiỏHàng();
		cậpNhậtThanhGiỏHàng();
	};

	window.giảmSốLượng = function (index, event) {
		event.stopPropagation();
		if (danhSáchSảnPhẩm[index].quantity > 1) {
			danhSáchSảnPhẩm[index].quantity -= 1;
		} else {
			danhSáchSảnPhẩm.splice(index, 1);
		}
		localStorage.setItem("cartItems", JSON.stringify(danhSáchSảnPhẩm));
		cậpNhậtSốLượngGiỏHàng();
		cậpNhậtThanhGiỏHàng();
	};

	window.xóaSảnPhẩm = function (index, event) {
		event.stopPropagation();
		danhSáchSảnPhẩm.splice(index, 1);
		localStorage.setItem("cartItems", JSON.stringify(danhSáchSảnPhẩm));
		cậpNhậtSốLượngGiỏHàng();
		cậpNhậtThanhGiỏHàng();
	};

	window.cậpNhậtThanhGiỏHàng = function () {
		const cartItemsList = document.getElementById("cart-items");
		const cartTotal = document.getElementById("cart-total");
		if (cartItemsList && cartTotal) {
			cartItemsList.innerHTML = "";

			if (danhSáchSảnPhẩm.length === 0) {
				cartItemsList.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
			} else {
				let total = 0;
				danhSáchSảnPhẩm.forEach((item, index) => {
					const li = document.createElement("li");
					li.innerHTML = `
                        <img src="${item.image}" alt="${item.title}">
                        <div class="item-details">
                            <p>${item.title}</p>
                            <span class="item-price">${(item.price * item.quantity).toLocaleString()} VNĐ</span>
                            <div class="quantity-controls">
                                <button onclick="giảmSốLượng(${index}, event)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="tăngSốLượng(${index}, event)">+</button>
                                <button class="remove-btn" onclick="xóaSảnPhẩm(${index}, event)"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
					cartItemsList.appendChild(li);
					total += item.price * item.quantity;
				});
				cartTotal.textContent = total.toLocaleString() + " VNĐ";
			}
		} else {
			console.warn("Không tìm thấy #cart-items hoặc #cart-total");
		}
	};

	window.mởĐóngGiỏHàng = function (event) {
		event.preventDefault();
		const sidebar = document.getElementById("cart-sidebar");
		if (sidebar) {
			if (sidebar.classList.contains("show")) {
				sidebar.classList.remove("show");
			} else {
				cậpNhậtThanhGiỏHàng();
				sidebar.classList.add("show");
			}
		} else {
			console.warn("Không tìm thấy #cart-sidebar");
		}
	};

	document.addEventListener("click", function (e) {
		const sidebar = document.getElementById("cart-sidebar");
		const cartIcon = document.querySelector(".cart a");
		const isClickInsideControls = e.target.closest(".quantity-controls") || e.target.closest(".remove-btn");
		if (sidebar && sidebar.classList.contains("show") && !sidebar.contains(e.target) && cartIcon && !cartIcon.contains(e.target) && !isClickInsideControls) {
			sidebar.classList.remove("show");
		}
	});

	document.addEventListener("DOMContentLoaded", () => {
		const checkoutBtn = document.querySelector(".checkout-btn");
		if (checkoutBtn) {
			checkoutBtn.addEventListener("click", (event) => {
				event.stopPropagation();
				if (danhSáchSảnPhẩm.length === 0) {
					alert("Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.");
				} else {
					alert("🎉 Cảm ơn bạn đã thanh toán! Đơn hàng của bạn đang được xử lý.");
					hiểnThịHóaĐơn(); // Tạo và hiển thị hóa đơn trước
					// Xóa giỏ hàng sau khi hiển thị hóa đơn
					danhSáchSảnPhẩm = [];
					localStorage.removeItem("cartItems");
					cậpNhậtSốLượngGiỏHàng();
					cậpNhậtThanhGiỏHàng();
					document.getElementById("cart-sidebar").classList.remove("show");
				}
			});
		} else {
			console.warn("Không tìm thấy .checkout-btn");
		}
	});
})();

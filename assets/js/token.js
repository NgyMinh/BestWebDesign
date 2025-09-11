let allCoins = [];
let vndData = {};
const chartMap = new Map(); // lưu Chart instances (key = spark-{coinId})

// debounce helper
function debounce(fn, wait = 200) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), wait);
	};
}

/* --- 1) renderInitial: tạo DOM rows + chart 1 lần --- */
function renderInitial(coins) {
	const tbody = document.getElementById("market-body");
	if (!tbody) return;
	tbody.innerHTML = "";

	coins.forEach((c, index) => {
		const canvasId = `spark-${c.id}`;
		const vndRaw = vndData[c.id]?.vnd;
		const vndText = vndRaw !== undefined && vndRaw !== null ? `${Number(vndRaw).toLocaleString("vi-VN")} VNĐ` : "-";
		const usdText = c.current_price !== undefined && c.current_price !== null ? `$${Number(c.current_price).toLocaleString("en-US")}` : "-";

		const p1h = c.price_change_percentage_1h_in_currency;
		const p24h = c.price_change_percentage_24h_in_currency;
		const p7d = c.price_change_percentage_7d_in_currency;
		const p30d = c.price_change_percentage_30d_in_currency;

		const safePct = (v) => (v === undefined || v === null || Number.isNaN(v) ? "-" : `${Number(v).toFixed(2)}%`);

		const tr = document.createElement("tr");
		tr.dataset.coinId = c.id;
		tr.dataset.name = (c.name || "").toLowerCase();
		tr.dataset.symbol = (c.symbol || "").toLowerCase();
		tr.dataset.price = String(c.current_price || 0);
		tr.innerHTML = `
		<td>${(currentPage - 1) * PAGE_SIZE + index + 1}</td>
      <td style="text-align:left; padding-left:8px;">
        <img src="${c.image || ""}" width="20" style="vertical-align:middle; margin-right:8px;" />
		<span style="font-weight:600">${c.name}</span> <span style="color:#888; font-size:13px;">${(c.symbol || "").toUpperCase()}</span>
      </td>
	  <td>
    	<button class="buy-button" data-coin="${c.id}">Buy</button>
	  </td>
      <td class="usd">${usdText}</td>
      <td class="vnd">${vndText}</td>
      <td class="p1h" style="color:${p1h >= 0 ? "green" : "red"}">${safePct(p1h)}</td>
      <td class="p24h" style="color:${p24h >= 0 ? "green" : "red"}">${safePct(p24h)}</td>
      <td class="p7d" style="color:${p7d >= 0 ? "green" : "red"}">${safePct(p7d)}</td>
      <td class="col-30d" style="display:none">${safePct(p30d)}</td>
      <td><canvas id="${canvasId}" width="120" height="40"></canvas></td>
   
    `;
		tbody.appendChild(tr);

		// Vẽ chart 1 lần
		setTimeout(() => {
			const canvas = document.getElementById(canvasId);
			const sparkData = c.sparkline_in_7d?.price;
			if (!canvas || !Array.isArray(sparkData) || sparkData.length === 0) return;
			try {
				const ctx = canvas.getContext("2d");
				const ch = new Chart(ctx, {
					type: "line",
					data: { labels: sparkData.map((_, i) => i), datasets: [{ data: sparkData, borderColor: p7d >= 0 ? "green" : "red", borderWidth: 1, fill: false, pointRadius: 0, tension: 0.3 }] },
					options: { responsive: false, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } },
				});
				chartMap.set(canvasId, ch);
			} catch (e) {
				console.warn("Chart draw error:", e);
			}
		}, 30);
	});
}

function updateSTT() {
	const rows = document.querySelectorAll("#market-body tr");
	let i = 1;
	rows.forEach((tr) => {
		if (tr.style.display !== "none") {
			tr.querySelector("td:first-child").textContent = i++;
		}
	});
}

/* --- 2) updateRowData: cập nhật text + chart.data (k rebuild DOM) --- */
function updateRowData(coins) {
	coins.forEach((c) => {
		const tr = document.querySelector(`#market-body tr[data-coin-id="${c.id}"]`);
		if (!tr) return;
		const vndRaw = vndData[c.id]?.vnd;
		const vndText = vndRaw !== undefined && vndRaw !== null ? `${Number(vndRaw).toLocaleString("vi-VN")} VNĐ` : "-";
		tr.querySelector(".usd").innerText = c.current_price !== undefined ? `$${Number(c.current_price).toLocaleString("en-US")}` : "-";
		tr.querySelector(".vnd").innerText = vndText;
		tr.querySelector(".p1h").innerText = c.price_change_percentage_1h_in_currency === undefined ? "-" : `${Number(c.price_change_percentage_1h_in_currency).toFixed(2)}%`;
		tr.querySelector(".p24h").innerText = c.price_change_percentage_24h_in_currency === undefined ? "-" : `${Number(c.price_change_percentage_24h_in_currency).toFixed(2)}%`;
		tr.querySelector(".p7d").innerText = c.price_change_percentage_7d_in_currency === undefined ? "-" : `${Number(c.price_change_percentage_7d_in_currency).toFixed(2)}%`;
		tr.dataset.price = String(c.current_price || 0);
		// tr.querySelector(".time").innerText = new Date().toLocaleTimeString("vi-VN");

		// update chart nếu có
		const canvasId = `spark-${c.id}`;
		const ch = chartMap.get(canvasId);
		const sparkData = c.sparkline_in_7d?.price;
		if (ch && Array.isArray(sparkData) && sparkData.length) {
			try {
				ch.data.datasets[0].data = sparkData;
				ch.update();
			} catch (e) {}
		}
	});
}

/* --- 3) filterRows: show/hide dựa trên input (KHÔNG rebuild) --- */
function filterRows() {
	const q = document.getElementById("searchToken")?.value?.trim().toLowerCase() || "";
	document.querySelectorAll("#market-body tr").forEach((tr) => {
		const name = tr.dataset.name || "";
		const symbol = tr.dataset.symbol || "";
		tr.style.display = !q || name.includes(q) || symbol.includes(q) ? "" : "none";
	});
}

/* --- 4) sortRows: chỉ reorder các <tr> hiện có (appendChild) --- */
function sortRows(order = "desc") {
	const tbody = document.getElementById("market-body");
	const rows = Array.from(tbody.querySelectorAll("tr"));
	const visible = rows.filter((r) => r.style.display !== "none");
	visible.sort((a, b) => {
		const pa = parseFloat(a.dataset.price || "0");
		const pb = parseFloat(b.dataset.price || "0");
		return order === "asc" ? pa - pb : pb - pa;
	});
	visible.forEach((r) => tbody.appendChild(r));
	updateSTT();
}

/* --- 5) fetchMarketOptimized: fetch + renderInitial hoặc updateRowData --- */
async function fetchMarketOptimized() {
	try {
		// ⏳ Hiện "Đang tải..."
		document.getElementById("loading").style.display = "block";
		document.getElementById("market-table").style.display = "none";

		const perPage = document.getElementById("rowsSelect")?.value || 30;
		const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d`;
		const res = await fetch(url);
		allCoins = await res.json();

		const ids = allCoins.map((c) => c.id).join(",");
		if (ids) {
			const resVND = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=vnd`);
			vndData = await resVND.json();
		} else vndData = {};

		if (window.capNhatDanhSachToken) capNhatDanhSachToken();

		const tbody = document.getElementById("market-body");
		if (!tbody) return;
		if (tbody.children.length === 0) {
			renderPage(1);
		} else {
			updateRowData(allCoins);
		}

		// ✅ Sau khi xong thì ẩn loading, hiện bảng
		document.getElementById("loading").style.display = "none";
		document.getElementById("market-table").style.display = "";
	} catch (e) {
		console.error("fetchMarketOptimized error:", e);
	}
}

const PAGE_SIZE = 25;
let currentPage = 1;

function renderPage(page = 1) {
	currentPage = page;
	const start = (page - 1) * PAGE_SIZE;
	const end = start + PAGE_SIZE;
	const coinsSlice = allCoins.slice(start, end);
	renderInitial(coinsSlice);
	updatePaginationUI();
}

function updatePaginationUI() {
	const totalPages = Math.ceil(allCoins.length / PAGE_SIZE);
	const container = document.getElementById("pagination");
	container.innerHTML = "";

	for (let i = 1; i <= totalPages; i++) {
		const btn = document.createElement("button");
		btn.textContent = i;
		btn.style.margin = "0 4px";
		btn.disabled = i === currentPage;
		btn.addEventListener("click", () => renderPage(i));
		container.appendChild(btn);
	}
}

/* ========== Event listeners ========== */
const debouncedFilter = debounce(() => {
	filterRows();
	const sort = document.getElementById("sortPrice")?.value || "";
	if (sort) sortRows(sort);
	updateSTT();
}, 200);

document.getElementById("searchToken")?.addEventListener("input", debouncedFilter);
document.getElementById("sortPrice")?.addEventListener("change", () => {
	const val = document.getElementById("sortPrice").value;
	sortRows(val || "desc");
});
document.getElementById("rowsSelect")?.addEventListener("change", () => fetchMarketOptimized());
document.getElementById("toggle30d")?.addEventListener("change", function () {
	document.querySelectorAll(".col-30d").forEach((td) => (td.style.display = this.checked ? "" : "none"));
});

/* ========== Start ========== */
fetchMarketOptimized();
setInterval(fetchMarketOptimized, 120000); // refresh mỗi 60s

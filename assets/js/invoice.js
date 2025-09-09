// helper wrapText (giữ nguyên)
function wrapText(font, text, size, maxWidth) {
	const words = String(text || "").split(/\s+/);
	const lines = [];
	let currentLine = "";

	for (const word of words) {
		const testLine = currentLine ? currentLine + " " + word : word;
		const testWidth = font.widthOfTextAtSize(testLine, size);
		if (testWidth > maxWidth && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	}
	if (currentLine) lines.push(currentLine);
	return lines;
}

async function exportInvoicePdfLib() {
	try {
		// 1) Lấy dữ liệu DOM
		const name = document.getElementById("cf-name")?.innerText || "Ẩn danh";
		const email = document.getElementById("cf-email")?.innerText || "-----";
		const project = document.getElementById("cf-project")?.innerText || "Quỹ";
		const amount = document.getElementById("cf-amount")?.innerText || "0 VNĐ";
		const code = document.getElementById("cf-code")?.innerText || "XXXX";
		const method = document.getElementById("cf-method")?.innerText || "-----";

		// Ngày hiện tại (chỉ dd/mm/yyyy)
		const dateObj = new Date();
		const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/` + `${String(dateObj.getMonth() + 1).padStart(2, "0")}/` + `${dateObj.getFullYear()}`;

		const org = "Quỹ Hy Vọng Việt MVP";

		// 2) Tạo PDF và nhúng font
		const { PDFDocument, rgb } = PDFLib;
		const pdfDoc = await PDFDocument.create();
		// bắt buộc: register fontkit (fontkit phải đã import)
		pdfDoc.registerFontkit(fontkit);

		const loraRegularBytes = await (await fetch("/assets/font/Lora-Regular.ttf")).arrayBuffer();
		const loraRegular = await pdfDoc.embedFont(loraRegularBytes);
		const loraBoldBytes = await (await fetch("/assets/font/Lora-Bold.ttf")).arrayBuffer();
		const loraBold = await pdfDoc.embedFont(loraBoldBytes);

		// 3) Tạo trang A4
		let page = pdfDoc.addPage([595.28, 841.89]);
		const { width, height } = page.getSize();

		// layout chung
		const marginTop = 60;
		const marginLeft = 40;
		const bottomMargin = 40;
		let cursorY = height - marginTop;

		const titleSize = 18;
		const labelSize = 12;
		const valueSize = 12;
		const rowLineGap = 6; // khoảng cách giữa các dòng trong cùng một cell
		const rowBlockGap = 10; // khoảng cách giữa các hàng

		// Title
		const titleText = "GIẤY CHỨNG NHẬN QUYÊN GÓP";
		const titleW = loraBold.widthOfTextAtSize(titleText, titleSize);
		page.drawText(titleText, {
			x: (width - titleW) / 2,
			y: cursorY,
			size: titleSize,
			font: loraBold,
			color: rgb(0, 0, 0),
		});
		cursorY -= titleSize + 18;

		// Bảng - 2 cột, nằm giữa
		const contentMaxWidth = width - marginLeft * 2;
		const tableWidth = Math.min(520, contentMaxWidth); // tổng chiều rộng bảng
		const tableX = (width - tableWidth) / 2;
		const labelColumnWidth = 160; // chỉnh nếu cần
		const valueColumnWidth = tableWidth - labelColumnWidth;

		const items = [
			["Người quyên góp", name],
			["Email", email],
			["Quyên góp vào dự án", project],
			["Số tiền quyên góp", amount],
			["Mã quyên góp", code],
			["Phương thức quyên góp", method],
			["Tổ chức thụ hưởng", org],
			["Thời gian quyên góp", formattedDate],
		];

		// (tuỳ chọn) vẽ khung bảng nhẹ - comment nếu không muốn
		// page.drawRectangle({ x: tableX - 6, y: cursorY + 6, width: tableWidth + 12, height: -0.1, color: rgb(1,1,1) });

		for (const [label, value] of items) {
			// Tính wrap cho giá trị (cột phải)
			const wrappedValue = wrapText(loraRegular, String(value || ""), valueSize, valueColumnWidth - 6); // -6 padding

			// Tính chiều cao block sẽ chiếm (số dòng * lineHeight)
			const lineHeight = valueSize + rowLineGap;
			const blockHeight = Math.max(1, wrappedValue.length) * lineHeight;

			// Nếu không đủ chỗ, sang trang mới
			if (cursorY - blockHeight - rowBlockGap < bottomMargin) {
				page = pdfDoc.addPage([595.28, 841.89]);
				cursorY = height - marginTop;
			}

			// Vẽ nhãn (ở cột trái), đặt trên dòng đầu
			const labelX = tableX + 6; // padding trong ô nhãn
			const labelY = cursorY;
			page.drawText(label + ":", {
				x: labelX,
				y: labelY,
				size: labelSize,
				font: loraBold,
				color: rgb(0, 0, 0),
			});

			// Vẽ các dòng của value (bắt đầu cùng y với label)
			const valueX = tableX + labelColumnWidth + 6; // padding trong ô giá trị
			for (let i = 0; i < wrappedValue.length; i++) {
				const yLine = cursorY - i * lineHeight;
				page.drawText(wrappedValue[i], {
					x: valueX,
					y: yLine,
					size: valueSize,
					font: loraRegular,
					color: rgb(0, 0, 0),
				});
			}

			// Sau khi vẽ block, giảm cursorY bằng blockHeight + khoảng cách giữa hàng
			cursorY -= blockHeight + rowBlockGap;
		}

		// Chữ ký / cảm ơn ở giữa hoặc bên trái tùy ý
		const thanksText = "Cảm ơn bạn đã đồng hành cùng chúng tôi";
		const thanksW = loraBold.widthOfTextAtSize(thanksText, valueSize);
		page.drawText(thanksText, {
			x: tableX + (tableWidth - thanksW) / 2,
			y: cursorY - 10,
			size: valueSize,
			font: loraBold,
			color: rgb(0, 0, 0),
		});

		// 4) Xuất file
		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], { type: "application/pdf" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `hoa-don.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error("Lỗi khi xuất PDF:", err);
		alert("Lỗi khi xuất PDF: " + (err.message || err));
	}
}

// gắn nút
document.getElementById("btnExportPdf")?.addEventListener("click", exportInvoicePdfLib);

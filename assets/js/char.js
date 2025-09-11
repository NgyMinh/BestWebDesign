const xValues = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const yValues = [100, 89, 140, 170, 150, 177, 99, 150, 120, 160, 200, 145];
const barColors = ["red", "green", "blue", "orange", "brown", "red", "green", "blue", "orange", "brown", "red", "green"];

new Chart("myChart", {
	type: "bar",
	data: {
		labels: xValues,
		datasets: [
			{
				backgroundColor: barColors,
				data: yValues,
			},
		],
	},
	options: {
		legend: { display: false },
		scales: {
			yAxes: [
				{
					ticks: {
						beginAtZero: true,
					},
				},
			],
		},

		title: {
			display: true,
			text: "Tiền mạnh thường quân ủng hộ các dự án trong năm 2024 (Triệu Đồng)",
		},
	},
});

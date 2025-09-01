fetch("../html/modal/modals.html")
	.then((response) => response.text())
	.then((data) => {
		document.getElementById("modal-container").innerHTML = data;
	});

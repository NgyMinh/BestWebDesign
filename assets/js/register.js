const modal = document.getElementById("termsModal");
const openBtn = document.getElementById("openTerms");
const closeBtn = document.querySelector(".close");
const closeModalBtn = document.getElementById("closeBtn");

openBtn.onclick = function (e) {
	e.preventDefault();
	modal.style.display = "block";
};

closeBtn.onclick = closeModalBtn.onclick = function () {
	modal.style.display = "none";
};

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};

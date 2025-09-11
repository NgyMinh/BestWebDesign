// assets/js/featured-stories.js
document.addEventListener("DOMContentLoaded", function () {
	var swiper = new Swiper(".featured-stories-slider", {
		slidesPerView: 3,
		slidesPerGroup: 3, // Chuyển 3 card/lần
		spaceBetween: 20,
		loop: true,
		speed: 4500,
		autoplay: {
			delay: 6000, 
			disableOnInteraction: false, 
		},
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		breakpoints: {
			0: { slidesPerView: 1, slidesPerGroup: 1 },
			768: { slidesPerView: 2, slidesPerGroup: 2 },
			992: { slidesPerView: 3, slidesPerGroup: 3 },
		},
	});
});

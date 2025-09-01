const counters = document.querySelectorAll(".impact-title");
let animated = false;

const animateCount = () => {
	counters.forEach((counter, index) => {
		const target = +counter.getAttribute("data-target");
		let count = 0;
		const duration = 2200;
		const startTime = performance.now();

		const updateCount = (currentTime) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			count = Math.floor(progress * target);
			counter.innerText = count + "+";

			if (progress < 1) {
				requestAnimationFrame(updateCount);
			} else {
				counter.innerText = target + "+";
			}
		};

		// Delay mỗi số 200ms để tạo hiệu ứng bậc thang
		setTimeout(() => {
			requestAnimationFrame(updateCount);
		}, index * 100);
	});
};

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting && !animated) {
				animateCount();
				animated = true;
			}
		});
	},
	{ threshold: 0.5 }
);

const impactSection = document.querySelector(".impact-section");
if (impactSection) {
	observer.observe(impactSection);
}

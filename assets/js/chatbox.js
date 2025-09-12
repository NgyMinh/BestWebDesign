const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".send-btn"); // sửa thành button gửi
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
	const chatLi = document.createElement("li");
	chatLi.classList.add("chat", className);
	let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
	chatLi.innerHTML = chatContent;
	chatLi.querySelector("p").textContent = message;
	return chatLi;
};

const generateResponse = (incomingChatli) => {
	const messageElement = incomingChatli.querySelector("p");

	fetch("https://bestwebdesign-1.onrender.com/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ message: userMessage }),
	})
		.then(async (res) => {
			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Server error");
			}
			return res.json();
		})
		.then((data) => {
			if (data && data.reply) {
				messageElement.textContent = data.reply;
			} else if (data.error) {
				messageElement.textContent = `Error: ${data.error || "Unknown error"}`;
			} else {
				messageElement.textContent = "No response from server.";
			}
		})
		.catch(() => {
			messageElement.classList.add("error");
			messageElement.textContent = "Oops! Something went wrong. Please try again.";
		})
		.finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const handleChat = () => {
	userMessage = chatInput.value.trim();
	if (!userMessage) return;
	chatInput.value = "";
	chatInput.style.height = `${inputInitHeight}px`;

	chatbox.appendChild(createChatLi(userMessage, "outgoing"));
	chatbox.scrollTo(0, chatbox.scrollHeight);

	setTimeout(() => {
		const incomingChatli = createChatLi("Đang suy nghĩ...", "incoming");
		chatbox.appendChild(incomingChatli);
		chatbox.scrollTo(0, chatbox.scrollHeight);
		generateResponse(incomingChatli);
	}, 600);
};

chatInput.addEventListener("input", () => {
	chatInput.style.height = `${inputInitHeight}px`;
	chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
	if (e.key == "Enter" && !e.shiftKey && window.innerWidth > 800) {
		e.preventDefault();
		handleChat();
	}
});

// Xử lý gửi ảnh
const imageInput = document.getElementById("imageInput");

imageInput.addEventListener("change", function (event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		const imageBase64 = e.target.result;

		// Hiển thị ảnh người dùng gửi
		const li = document.createElement("li");
		li.classList.add("chat", "outgoing");

		const img = document.createElement("img");
		img.src = imageBase64;
		img.alt = "Ảnh người dùng gửi";
		img.style.maxWidth = "200px";
		img.style.borderRadius = "10px";

		li.appendChild(img);
		chatbox.appendChild(li);
		chatbox.scrollTo(0, chatbox.scrollHeight);

		// Hiển thị trạng thái xử lý ảnh
		const incomingLi = createChatLi("Đang xử lý ảnh...", "incoming");
		chatbox.appendChild(incomingLi);
		chatbox.scrollTo(0, chatbox.scrollHeight);

		fetch("https://bestwebdesign-1.onrender.com/image", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ image: imageBase64 }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.reply) {
					incomingLi.querySelector("p").textContent = data.reply;
				} else {
					incomingLi.querySelector("p").textContent = "Không có phản hồi từ server.";
				}
			})
			.catch(() => {
				incomingLi.querySelector("p").classList.add("error");
				incomingLi.querySelector("p").textContent = "Lỗi xử lý ảnh.";
			})
			.finally(() => {
				chatbox.scrollTo(0, chatbox.scrollHeight);
			});
	};

	reader.readAsDataURL(file);
});

chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

sendChatBtn.addEventListener("click", handleChat);

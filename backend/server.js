import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// Dán API key Gemini vào đây
const genAI = new GoogleGenerativeAI("AIzaSyD9fBsAYMEnFgXMXTuLQJy6AAoc3LLI1us");

// POST /chat
app.post("/chat", async (req, res) => {
	try {
		const userMessage = req.body.message;

		// chọn model Gemini 1.5 hoặc 1.0 tuỳ bạn
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const result = await model.generateContent(userMessage);
		const responseText = result.response.text();

		res.json({ reply: responseText });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong with Gemini API" });
	}
});

app.listen(3000, () => console.log("✅ Server chạy tại http://localhost:3000"));

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Validate environment key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY in .env");
      return new Response("Missing GEMINI_API_KEY", { status: 500 });
    }

    if (!prompt || prompt.trim() === "") {
      return new Response("Missing prompt", { status: 400 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return Response.json({ response: text });
  } catch (error) {
    console.error("❌ Error generating content:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

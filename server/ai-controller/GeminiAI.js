// geminiClient.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function GeminiResponse(prompt, system, instruction) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const context = `
System Instruction: ${system}
Extra Instruction: ${instruction}
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: context + "\nUser Prompt: " + prompt }],
        },
      ],
    });

    const text = result.response.text();

    return text;
  } catch (error) {
    console.error("❌ Error generating response:", error);
    throw error;
  }
}

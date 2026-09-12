import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "Shahenshah AI"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    const safeMessages = messages
      .filter(
        m =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-20)
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 12000)
      }));

    if (
      safeMessages.length === 0 ||
      safeMessages[safeMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        error: "Please send a user message."
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "You are Shahenshah AI, a helpful, friendly and accurate AI assistant. " +
        "Answer clearly and honestly. If you are unsure, say so instead of inventing facts.",
      input: safeMessages
    });

    res.json({
      reply: response.output_text || "I could not generate a response."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI request failed. Check your API key and server."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Shahenshah AI running at http://localhost:${PORT}`);
});

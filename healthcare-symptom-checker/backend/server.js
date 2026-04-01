import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || "5001", 10);

const dataFile = path.join(__dirname, "symptom_queries.json");

function loadQueries() {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveQueries(rows) {
  fs.writeFileSync(dataFile, JSON.stringify(rows, null, 2), "utf8");
}

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Assignment: LLM should suggest possible conditions + next steps with educational disclaimer (not medical advice).
const SYSTEM_PROMPT = `You are a medical education assistant. For each user message, based on the symptoms they describe, suggest possible conditions and recommended next steps, and always include an educational disclaimer (this is not professional medical advice).

You must also follow these rules:
- You are NOT a doctor. This is educational only.
- Users should consult a qualified healthcare professional for diagnosis and treatment.
- In an emergency, they should call emergency services.

List 2–4 possible conditions ordered by likelihood. For each: name, short description, why it might match, severity (Mild / Moderate / Serious / Emergency), likelihood (High / Medium / Low).
Give recommended next steps and any red-flag symptoms that need urgent care.

Respond in valid JSON only, with this shape:
{
  "disclaimer": "string with the educational disclaimer",
  "conditions": [
    {
      "name": "Condition Name",
      "description": "Brief description",
      "matchReason": "Why this matches the symptoms",
      "severity": "Mild | Moderate | Serious | Emergency",
      "likelihood": "High | Medium | Low"
    }
  ],
  "recommendations": ["list of recommended next steps"],
  "redFlags": ["list of red-flag symptoms to watch for"],
  "summary": "A brief overall summary of the assessment"
}`;

app.post("/api/check-symptoms", async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ error: "Symptoms are required." });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (
      !apiKey ||
      apiKey === "your_anthropic_api_key_here" ||
      apiKey === "sk-ant-xxxxx"
    ) {
      return res.status(500).json({
        error:
          "Missing Anthropic API key. Copy backend/.env.example to backend/.env and set ANTHROPIC_API_KEY.",
      });
    }

    let userMessage = `Symptoms: ${symptoms.trim()}`;
    if (age) userMessage += `\nAge: ${age}`;
    if (gender) userMessage += `\nGender: ${gender}`;
    if (duration) userMessage += `\nDuration: ${duration}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const responseText = message.content[0].text;

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      parsed = {
        disclaimer:
          "This is for educational purposes only. Please consult a healthcare professional.",
        summary: responseText,
        conditions: [],
        recommendations: ["Please consult a healthcare professional."],
        redFlags: [],
      };
    }

    const id = randomUUID();
    const rows = loadQueries();
    rows.push({
      id,
      symptoms,
      age: age || null,
      gender: gender || null,
      duration: duration || null,
      response: JSON.stringify(parsed),
      created_at: new Date().toISOString(),
    });
    saveQueries(rows);

    res.json({ id, ...parsed });
  } catch (err) {
    console.error("check-symptoms:", err);
    const msg =
      err?.message?.slice(0, 240) || "Failed to process symptoms. Please try again.";
    res.status(500).json({ error: msg });
  }
});

app.get("/api/history", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sorted = [...loadQueries()].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const page = sorted.slice(0, limit);

    const history = page.map((row) => ({
      ...row,
      response: JSON.parse(row.response),
    }));

    res.json(history);
  } catch (err) {
    console.error("history list:", err);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

app.get("/api/history/:id", (req, res) => {
  try {
    const row = loadQueries().find((r) => r.id === req.params.id);

    if (!row) {
      return res.status(404).json({ error: "Query not found." });
    }

    res.json({ ...row, response: JSON.parse(row.response) });
  } catch (err) {
    console.error("history get:", err);
    res.status(500).json({ error: "Failed to fetch query." });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    const rows = loadQueries();
    const next = rows.filter((r) => r.id !== req.params.id);
    if (next.length === rows.length) {
      return res.status(404).json({ error: "Query not found." });
    }
    saveQueries(next);

    res.json({ message: "Query deleted successfully." });
  } catch (err) {
    console.error("history delete:", err);
    res.status(500).json({ error: "Failed to delete query." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const server = app.listen(port, () => {
  console.log(`API at http://localhost:${port} (health: GET /api/health)`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Set PORT in backend/.env to a free port and update frontend/vite.config.js proxy target to match, or stop the other process.`
    );
    process.exit(1);
  }
  throw err;
});

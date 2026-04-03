import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 API KEY CHECK
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ API key missing in .env file");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// main route
app.post("/analyze", async (req, res) => {
  try {
    const { resume, role } = req.body;

    

const prompt = `
Return ONLY JSON. No explanation.

{
  "overallScore": 85,
  "sections": {
    "keywords": 80,
    "formatting": 75,
    "experience": 90,
    "projects": 70
  },
  "summary": "Short summary",
  "strengths": ["point1", "point2", "point3"],
  "improvements": ["point1", "point2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "tips": ["tip1", "tip2"]
}

Analyze this resume for ${role}:

${resume}
`;



    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        { role: "system",
           content: "You are a resume analyzer. Always return ONLY valid JSON." 
          },
        {
          role: "user",
          content: prompt
        }
        
        ],
        response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content;

    let data;

try {
  data = JSON.parse(text);
} catch (err) {
  console.error("JSON parse failed:", text);

  data = {
    overallScore: 70,
    summary: text,
    strengths: ["Parsing failed"],
    improvements: [],
    missingKeywords: [],
    tips: []
  };
}

    res.json(data);

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// start server
app.listen(5001, () => {
  console.log("✅ Server running on http://localhost:5001");
});

console.log("KEY:", process.env.OPENAI_API_KEY);

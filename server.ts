import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
let dbInitError: string | null = null;
try {
  let config: any = {};
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    console.error("Could not read firebase config:", e);
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: config.projectId || process.env.GOOGLE_CLOUD_PROJECT,
  });
  
  if (config.firestoreDatabaseId) {
    db = getFirestore(admin.app(), config.firestoreDatabaseId);
  } else {
    db = getFirestore();
  }
  
  console.log("Firebase Admin initialized.");
} catch (error: any) {
  dbInitError = error.message || String(error);
  console.error("Failed to initialize Firebase Admin:", error);
}

const app = express();
app.use(express.json());
const PORT = 3000;

import { GoogleGenAI, Type } from "@google/genai";
import { FieldValue } from "firebase-admin/firestore";

// ============================================================================
// API ROUTES
// ============================================================================

app.get("/api/status", (req, res) => {
  console.log("GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT);
  console.log("Config Project ID:", config.projectId);
  res.json({
    db: !!db,
    dbInitError,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "unknown",
  });
});

app.post("/api/rag-search", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  const { structural_skeleton, embedding, modern_title } = req.body;

  if (!structural_skeleton || !embedding || !modern_title) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Vector Search in Firestore
    const archivesRef = db.collection("historical_archives");
    const vectorQuery = archivesRef.findNearest("embedding", FieldValue.vector(embedding), {
      limit: 10,
      distanceMeasure: "COSINE"
    });

    const snapshot = await vectorQuery.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "No historical parallels found in the database." });
    }

    const candidates = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        year: data.year,
        description: data.description
      };
    });

    // 2. AI Judge: Pick the best parallel
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert historian and geopolitical analyst.
    I have a modern event and its structural skeleton, along with a list of ${candidates.length} potential historical parallels retrieved from our database.
    
    Modern Event: ${modern_title}
    Modern Skeleton: ${structural_skeleton}
    
    Historical Candidates:
    ${candidates.map((c, i) => `[Candidate ${i + 1}] Title: ${c.title}\nYear: ${c.year}\nDescription: ${c.description}`).join("\n\n")}
    
    Your task:
    1. Select the BEST historical parallel from the candidates provided.
    2. Explain the 'Shadow Motive' (the hidden driver or actual outcome based on this specific historical precedent).
    
    Return the result as JSON.`;

    const synthesisResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selected_candidate_index: { type: Type.INTEGER, description: "The 1-based index of the selected candidate." },
            historical_parallel: { type: Type.STRING, description: "The title of the selected historical event." },
            historical_description: { type: Type.STRING, description: "A brief description of how it parallels the modern event." },
            shadow_motive: { type: Type.STRING, description: "The hidden driver or actual outcome based on the historical precedent." }
          },
          required: ["selected_candidate_index", "historical_parallel", "historical_description", "shadow_motive"]
        }
      }
    });

    const synthesis = JSON.parse(synthesisResponse.text || "{}");
    
    res.json({
      historical_parallel: synthesis.historical_parallel,
      historical_description: synthesis.historical_description,
      shadow_motive: synthesis.shadow_motive,
      candidates_reviewed: candidates.length
    });

  } catch (error: any) {
    console.error("RAG Search Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/seed", async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const goldenSet = [
      {
        title: "The Fall of the Roman Empire",
        year: "476 AD",
        archetype: "Imperial Overstretch",
        description: "The collapse of the Western Roman Empire due to a combination of internal decay, economic instability, military overstretch, and external pressure from migrating tribes."
      },
      {
        title: "The French Revolution",
        year: "1789",
        archetype: "Populist Uprising",
        description: "A period of radical political and societal change in France that began with the Estates General of 1789, leading to the abolition of the monarchy and the rise of radical political factions."
      },
      {
        title: "The Industrial Revolution",
        year: "1760-1840",
        archetype: "Technological Paradigm Shift",
        description: "The transition to new manufacturing processes in Great Britain, continental Europe, and the United States, marking a major turning point in history with profound social and economic impacts."
      },
      {
        title: "The Peloponnesian War",
        year: "431-404 BC",
        archetype: "Thucydides Trap",
        description: "An ancient Greek war fought by the Delian League led by Athens against the Peloponnesian League led by Sparta, demonstrating the inevitable conflict when a rising power threatens an established hegemon."
      },
      {
        title: "The Cuban Missile Crisis",
        year: "1962",
        archetype: "Brinkmanship",
        description: "A 13-day confrontation between the United States and the Soviet Union initiated by the American discovery of Soviet ballistic missile deployment in Cuba, the closest the Cold War came to escalating into a full-scale nuclear war."
      }
    ];

    const eventsWithEmbeddings = [];
    for (const event of goldenSet) {
      const embeddingResponse = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: event.description
      });
      
      const vector = embeddingResponse.embeddings?.[0]?.values;
      if (vector) {
        eventsWithEmbeddings.push({
          ...event,
          embedding: vector
        });
      }
    }

    res.json({ events: eventsWithEmbeddings });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/seed-tier2", async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Use today's date for the Wikipedia "On this day" API
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`);
    if (!wikiRes.ok) throw new Error("Failed to fetch from Wikipedia API");

    const wikiData = await wikiRes.json();
    const events = wikiData.events || [];

    // Limit to 15 events to avoid overwhelming the embedding API in one go
    const sampleEvents = events.slice(0, 15);
    const eventsWithEmbeddings = [];

    for (const event of sampleEvents) {
      const title = event.pages?.[0]?.normalizedtitle || event.pages?.[0]?.title || "Historical Event";
      const year = event.year?.toString() || "Unknown Year";
      const description = event.text;

      const embeddingResponse = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: description
      });
      
      const vector = embeddingResponse.embeddings?.[0]?.values;
      if (vector) {
        eventsWithEmbeddings.push({
          title,
          year,
          archetype: "Historical Event",
          description,
          embedding: vector,
          source: "Wikipedia Tier 2"
        });
      }
    }

    res.json({ events: eventsWithEmbeddings });
  } catch (error: any) {
    console.error("Tier 2 Seeding Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ============================================================================
// VITE MIDDLEWARE & SERVER START
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

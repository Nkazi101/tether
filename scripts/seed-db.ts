import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
try {
  let config: any = {};
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
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
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

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

async function seedDatabase() {
  if (!db) return;

  console.log("Starting database seeding...");
  const archivesRef = db.collection("historical_archives");

  for (const event of goldenSet) {
    console.log(`Processing: ${event.title}`);
    
    // Generate embedding for the description
    const embeddingResponse = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: event.description
    });
    
    const vector = embeddingResponse.embeddings?.[0]?.values;
    
    if (!vector) {
      console.error(`Failed to generate embedding for ${event.title}`);
      continue;
    }

    // Store in Firestore
    await archivesRef.add({
      title: event.title,
      year: event.year,
      archetype: event.archetype,
      description: event.description,
      embedding: FieldValue.vector(vector),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Successfully seeded: ${event.title}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seedDatabase();

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

// ============================================================================
// API ROUTES
// ============================================================================

app.get("/api/status", (req, res) => {
  res.json({
    db: !!db,
    dbInitError,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "unknown",
  });
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

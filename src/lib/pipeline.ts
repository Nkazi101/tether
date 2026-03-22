import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { fetchTopNews } from "./news";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function processNewsPipeline() {
  console.log("Starting Frontend Newsroom Pipeline...");
  const ai = getAI();
  
  try {
    const news = await fetchTopNews();
    const echoesList = [];
    
    // If no news fetched, use fallback
    const articlesToProcess = news.length > 0 ? news : [
      {
        title: "Tech Giant Faces Antitrust Lawsuit Over App Store Monopoly",
        description: "Regulators are cracking down on the company's 30% fee and restrictive policies for third-party developers.",
        link: "https://example.com/news/1"
      },
      {
        title: "Global Supply Chain Crisis Worsens as Key Strait Blocked",
        description: "Shipping routes are completely halted after a major geopolitical incident in the vital trade corridor.",
        link: "https://example.com/news/2"
      }
    ];

    for (const article of articlesToProcess) {
      // 1. Abstract: Get Structural Skeleton (Remove Proper Nouns)
      const abstractionResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze this news event and extract its structural skeleton. 
        Remove ALL proper nouns (names, countries, companies). 
        Use generic archetypal roles (e.g., [Hegemon], [Challenger], [Resource]).
        
        News: ${article.title} - ${article.description}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              structural_skeleton: { type: Type.STRING, description: "The abstracted narrative skeleton." },
              archetype: { type: Type.STRING, description: "The core archetype (e.g., 'The Monopoly Squeeze', 'The Chokepoint Crisis')" },
              actors: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of generic roles involved."
              }
            },
            required: ["structural_skeleton", "archetype", "actors"]
          }
        }
      });

      const abstraction = JSON.parse(abstractionResponse.text || "{}");
      
      // 2. Embed: Vectorize the Structural Skeleton
      const embeddingResponse = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: abstraction.structural_skeleton
      });
      
      const vector = embeddingResponse.embeddings?.[0]?.values;

      // 3. Search: Find Historical Parallels using Vector Search (Simulated for now if DB is empty)
      
      // 4. Synthesize: The "Shadow Motive" Agentic Workflow
      const synthesisResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Based on this modern event and its structural skeleton, identify the 'Shadow Motive' (the hidden driver or actual outcome based on historical precedent).
        
        Modern Event: ${article.title}
        Skeleton: ${abstraction.structural_skeleton}
        
        Provide a historical parallel and the shadow motive.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              historical_parallel: { type: Type.STRING },
              historical_description: { type: Type.STRING },
              shadow_motive: { type: Type.STRING }
            },
            required: ["historical_parallel", "historical_description", "shadow_motive"]
          }
        }
      });

      const synthesis = JSON.parse(synthesisResponse.text || "{}");

      // 5. Prepare Echo
      const echoDoc = {
        modern_title: article.title,
        modern_description: article.description,
        structural_skeleton: abstraction.structural_skeleton,
        archetype: abstraction.archetype,
        actors: abstraction.actors,
        historical_parallel: synthesis.historical_parallel,
        historical_description: synthesis.historical_description,
        shadow_motive: synthesis.shadow_motive,
        embedding: vector || []
      };
      
      echoesList.push(echoDoc);
    }
    
    // 6. Store: Save to Firestore as a daily echo document
    const today = new Date().toISOString().split('T')[0];
    try {
      if (db) {
        await setDoc(doc(db, "daily_echoes", today), {
          date: today,
          echoes: echoesList,
          createdAt: serverTimestamp()
        });
        console.log(`Processed and stored daily echoes for ${today}`);
      }
    } catch (dbError) {
      console.warn(`Could not store in DB: ${dbError}`);
      throw dbError;
    }
    
    console.log("Pipeline complete.");
    return echoesList;
  } catch (error) {
    console.error("Pipeline error:", error);
    throw error;
  }
}

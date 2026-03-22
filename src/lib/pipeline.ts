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

      // 3 & 4. Search and Synthesize: Call our RAG backend endpoint
      let synthesis = {
        historical_parallel: "Awaiting database population",
        historical_description: "The vector database is currently empty. Please run the seeding script.",
        shadow_motive: "N/A"
      };

      try {
        const ragResponse = await fetch("/api/rag-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            modern_title: article.title,
            structural_skeleton: abstraction.structural_skeleton,
            embedding: vector
          })
        });

        if (ragResponse.ok) {
          synthesis = await ragResponse.json();
        } else {
          const errorData = await ragResponse.json();
          console.warn("RAG Search returned an error:", errorData.error);
          
          // Fallback if DB is empty or error occurs
          if (ragResponse.status === 404) {
             console.log("Vector DB is empty. Falling back to Gemini's internal knowledge.");
             const fallbackResponse = await ai.models.generateContent({
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
            synthesis = JSON.parse(fallbackResponse.text || "{}");
          }
        }
      } catch (err) {
         console.error("Failed to call RAG endpoint:", err);
      }

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

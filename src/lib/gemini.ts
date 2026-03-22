import { GoogleGenAI, Type } from "@google/genai";

export interface HistoricalParallel {
  id: string;
  title: string;
  historicalEvent: string;
  modernEvent: string;
  description: string;
  confidenceScore: number;
  tags: string[];
}

export interface DeepDiveData {
  coreParallel: {
    title: string;
    tags: string[];
  };
  historical: {
    title: string;
    description: string;
    ripples: { title: string; description: string }[];
    ultimateOutcome: { title: string; description: string };
  };
  modern: {
    title: string;
    description: string;
    ripples: { title: string; description: string }[];
    projectedTrajectory: { title: string; description: string };
  };
  aiInsight: string;
}

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function searchHistoricalParallels(query: string): Promise<HistoricalParallel[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Find 3 historical parallels for: "${query}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              historicalEvent: { type: Type.STRING },
              modernEvent: { type: Type.STRING },
              description: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "historicalEvent", "modernEvent", "description", "confidenceScore", "tags"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching parallels:", error);
    throw error;
  }
}

export async function generateDeepDive(historicalEvent: string, modernEvent: string): Promise<DeepDiveData> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Create a detailed comparative analysis between the historical event "${historicalEvent}" and the modern event "${modernEvent}".
      Analyze the structural similarities, focusing on cause-and-effect ripples.
      Crucially, include the ultimate historical conclusion of the past event, and a projected trajectory for the modern event based on that historical precedent.
      Maintain a scholarly, objective, and slightly detached tone.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreParallel: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Combined title, e.g., 'Peloponnesian War / Iran-Israel Shadow War'" },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 high-level tags" }
              },
              required: ["title", "tags"]
            },
            historical: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING, description: "Summary of the historical situation" },
                ripples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  },
                  description: "3-4 specific domino effects or consequences leading up to the conclusion"
                },
                ultimateOutcome: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING, description: "How the historical event ultimately concluded or resolved" }
                  },
                  required: ["title", "description"]
                }
              },
              required: ["title", "description", "ripples", "ultimateOutcome"]
            },
            modern: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING, description: "Summary of the modern situation" },
                ripples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  },
                  description: "3-4 specific modern consequences mirroring the historical ones"
                },
                projectedTrajectory: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING, description: "A projection of where the modern event might lead, based on the historical outcome" }
                  },
                  required: ["title", "description"]
                }
              },
              required: ["title", "description", "ripples", "projectedTrajectory"]
            },
            aiInsight: { type: Type.STRING, description: "A single, profound synthesized insight connecting the two, written as a quote." }
          },
          required: ["coreParallel", "historical", "modern", "aiInsight"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating deep dive:", error);
    throw error;
  }
}

export interface FeedEcho {
  id: string | number;
  modernTitle: string;
  historicalTitle: string;
  modernEvent: string;
  historicalEvent: string;
  description: string;
  structuralSkeleton?: string;
  imageUrl: string;
  imageAlt: string;
  highlight: string;
  layout: string;
  link?: string;
}

export interface CollectionData {
  featured: {
    title: string;
    description: string;
    imageUrl: string;
    volumeName: string;
  };
  filters: string[];
  volumes: {
    title: string;
    description: string;
    events: {
      tag: string;
      title: string;
      description: string;
      imageUrl: string;
    }[];
  }[];
}

export async function fetchDynamicCollections(): Promise<CollectionData> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Act as a RAG engine over a global knowledge graph of history (Wikipedia + GDELT). 
      Generate a dynamic 'Collections' page data structure.
      Include 1 'Featured Parallel' comparing a major modern event to a historical one.
      Include 5 filter categories (e.g., 'Tech Bubbles', 'Ego Battles').
      Include 2 'Volumes' (Archetypes, e.g., 'Ego Battles', 'Resource Wars').
      For each Volume, provide 4 specific historical-to-modern parallel events.
      Make the data highly specific, nuanced, and scholarly.
      For imageUrls, use descriptive keywords like 'https://picsum.photos/seed/[keyword]/800/600'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            featured: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                volumeName: { type: Type.STRING }
              },
              required: ["title", "description", "imageUrl", "volumeName"]
            },
            filters: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            volumes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        tag: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        imageUrl: { type: Type.STRING }
                      },
                      required: ["tag", "title", "description", "imageUrl"]
                    }
                  }
                },
                required: ["title", "description", "events"]
              }
            }
          },
          required: ["featured", "filters", "volumes"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating dynamic collections:", error);
    throw error;
  }
}

export interface ExploreData {
  trendingTopics: string[];
  trendingArchetypes: {
    title: string;
    description: string;
  }[];
  aiSynthesisPulse: string;
  recommendedPathways: {
    type: "card" | "full";
    matchScore: string;
    archetype: string;
    title: string;
    description: string;
    echoesLinked: number;
    imageUrl: string;
  }[];
}

export async function fetchExploreRecommendations(): Promise<ExploreData> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Act as a RAG engine over a global knowledge graph of history (Wikipedia + GDELT). 
      Generate dynamic 'Explore' page recommendations.
      Include 4 'trendingTopics' (short search queries).
      Include 3 'trendingArchetypes' (title and description of structural historical patterns).
      Include 1 'aiSynthesisPulse' (a profound, data-driven synthesis quote).
      Include 3 'recommendedPathways' (2 'card' type, 1 'full' type). These are deep structural parallels between history and today.
      Make the data highly specific, nuanced, and scholarly.
      For imageUrls, use descriptive keywords like 'https://picsum.photos/seed/[keyword]/800/600'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trendingTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            trendingArchetypes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            },
            aiSynthesisPulse: { type: Type.STRING },
            recommendedPathways: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  matchScore: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  echoesLinked: { type: Type.NUMBER },
                  imageUrl: { type: Type.STRING }
                },
                required: ["type", "matchScore", "archetype", "title", "description", "echoesLinked", "imageUrl"]
              }
            }
          },
          required: ["trendingTopics", "trendingArchetypes", "aiSynthesisPulse", "recommendedPathways"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating explore recommendations:", error);
    throw error;
  }
}


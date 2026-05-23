import { GoogleGenAI, Type } from "@google/genai";
import { Entity, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeConnections(entities: Entity[]): Promise<AnalysisResult> {
  if (entities.length < 2) {
    throw new Error("At least two entities are required for connection analysis.");
  }

  const prompt = `
    TASK: Perform a high-precision connection analysis between these specific points of interest.
    
    STRICT INVESTIGATIVE PROTOCOLS:
    1. DIRECT LINKS ONLY: For every finding or connection, you MUST provide a direct URL to the public record or source. Do NOT provide generic search URLs. If you cannot find a direct link, state that the link is unavailable in the description, but still prioritize direct source evidence.
    2. FACTUAL INTEGRITY: Do NOT hallucinate connections. If multiple people share a name, you MUST use the provided Address, Phone, or Context to verify it is the correct individual. If you cannot confirm they are the same person, do NOT report a connection.
    3. NO SPECULATION: If there is no documented relationship between the entities in public databases, report "NO VERIFIABLE CONNECTION FOUND" in the summary and return an empty connections/overlaps array. Being honest about a lack of data is mandatory.
    4. DATA TYPES: Look for commonalities in: Residence history (Property records), Employment (SEC filings, LinkedIn, Business registries), and Social Media (Public interactions).

    PARAMETERS (Points of Interest):
    ${entities.map(e => `- ID: ${e.id}\n  - Name: ${e.name || 'DATA MISSING'}\n  - Address: ${e.address || 'DATA MISSING'}\n  - Phone: ${e.phone || 'DATA MISSING'}\n  - Context: ${e.context || 'None'}`).join('\n')}

    OUTPUT REQUIREMENTS:
    - Summary: A professional PI sitrep. If no links are found, state this clearly.
    - Evidence: Cite specific, verifiable public records.
    - URL: A DIRECT web link to the specific record, article, or profile used as proof.
    - Confidence: A score from 0 to 100 based on how well the link confirms the specific relationship between the EXACT subjects provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a Licensed Private Investigator with access to global public data. You are strictly banned from making up information. You only report what is explicitly cross-referenced and verified through direct links. Accuracy is your primary metric. Use the Google Search tool to find exact matching records and direct URLs for every claim.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A high-level summary of the findings." },
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceId: { type: Type.STRING, description: "The name or index of the source entity." },
                  targetId: { type: Type.STRING, description: "The name or index of the target entity." },
                  type: { type: Type.STRING, enum: ["address", "employer", "social", "other"] },
                  description: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  url: { type: Type.STRING, description: "Direct URL to the evidence if available." },
                  confidence: { type: Type.NUMBER, description: "Confidence score from 0-100." }
                },
                required: ["sourceId", "targetId", "type", "description", "evidence", "confidence"]
              }
            },
            overlaps: {
              type: Type.ARRAY,
              description: "Specific data points shared by 2 or more entities (e.g., same address, same phone, same boss).",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "e.g., 'Address', 'Employer', 'Phone'" },
                  value: { type: Type.STRING, description: "The shared value (e.g., the address string)" },
                  entities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names/IDs of entities sharing this." },
                  description: { type: Type.STRING, description: "Detailed intel on the overlap." }
                },
                required: ["type", "value", "entities", "description"]
              }
            }
          },
          required: ["summary", "connections"]
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Map indices back to entity IDs if needed
    return {
      entities,
      connections: (result.connections || []).map((c: any) => ({
        ...c,
        sourceId: findEntityId(c.sourceId, entities),
        targetId: findEntityId(c.targetId, entities)
      })),
      overlaps: (result.overlaps || []).map((o: any) => ({
        ...o,
        entities: o.entities.map((eName: string) => findEntityId(eName, entities))
      })),
      summary: result.summary
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

function findEntityId(identifier: string, entities: Entity[]): string {
  if (!identifier) return '';
  const search = identifier.toLowerCase();
  
  const match = entities.find(e => 
    e.id === identifier ||
    (e.name && (e.name.toLowerCase().includes(search) || search.includes(e.name.toLowerCase()))) ||
    (e.address && (e.address.toLowerCase().includes(search) || search.includes(e.address.toLowerCase())))
  );
  return match ? match.id : identifier;
}

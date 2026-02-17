import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "@/types/analysis";
import { buildAnalysisPrompt } from "./prompts";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function cleanJsonString(text: string): string {
  // Remove markdown code block markers
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

  // Extract the JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("ไม่พบ JSON ในผลลัพธ์");
  }
  cleaned = jsonMatch[0];

  // Fix trailing commas before ] or }
  cleaned = cleaned.replace(/,\s*]/g, "]");
  cleaned = cleaned.replace(/,\s*}/g, "}");

  // Fix common issues: remove control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (match) => {
    if (match === "\n" || match === "\r" || match === "\t") return match;
    return "";
  });

  return cleaned;
}

export async function analyzeWithFileUri(
  fileUri: string,
  mimeType: string,
  lessonPlanText: string
): Promise<AnalysisResult> {
  console.log("=== Analyzing with Gemini ===");
  console.log(`fileUri: ${fileUri}`);
  const prompt = buildAnalysisPrompt(lessonPlanText);

  const result = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseMimeType: "application/json",
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: mimeType,
              fileUri: fileUri,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  const text = result.text || "";
  console.log("Received response from Gemini, length:", text.length);

  // Try to parse JSON with cleaning
  try {
    const cleaned = cleanJsonString(text);
    const analysisResult: AnalysisResult = JSON.parse(cleaned);
    console.log("Analysis complete! Overall score:", analysisResult.overallScore);
    return analysisResult;
  } catch (firstError) {
    console.error("First parse failed:", firstError);
    console.error("Raw response (first 1000 chars):", text.substring(0, 1000));

    // Second attempt: try to fix truncated JSON by finding balanced braces
    try {
      const jsonStart = text.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON found");

      let depth = 0;
      let lastValidEnd = -1;

      for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") {
          depth--;
          if (depth === 0) {
            lastValidEnd = i;
            break;
          }
        }
      }

      if (lastValidEnd > jsonStart) {
        let jsonStr = text.substring(jsonStart, lastValidEnd + 1);
        jsonStr = jsonStr.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");
        const analysisResult: AnalysisResult = JSON.parse(jsonStr);
        console.log("Second attempt parse succeeded! Score:", analysisResult.overallScore);
        return analysisResult;
      }
    } catch (secondError) {
      console.error("Second parse also failed:", secondError);
    }

    throw new Error(
      "ไม่สามารถแปลงผลลัพธ์จาก AI ได้ กรุณาลองใหม่อีกครั้ง"
    );
  }
}

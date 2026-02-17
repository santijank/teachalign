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

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Raw response:", text.substring(0, 500));
    throw new Error("ไม่สามารถแปลงผลลัพธ์จาก AI ได้ กรุณาลองใหม่อีกครั้ง");
  }

  const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0]);
  console.log("Analysis complete! Overall score:", analysisResult.overallScore);
  return analysisResult;
}

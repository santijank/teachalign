import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "@/types/analysis";
import { buildAnalysisPrompt } from "./prompts";
import fs from "fs";
import path from "path";
import os from "os";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function saveBufferToTemp(buffer: Buffer, extension: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `teachalign_video_${Date.now()}.${extension}`);
  fs.writeFileSync(tempFile, buffer);
  console.log(`File saved: ${(buffer.length / 1024 / 1024).toFixed(1)} MB → ${tempFile}`);
  return tempFile;
}

async function uploadToGemini(filePath: string, mimeType: string): Promise<string> {
  const fileSize = fs.statSync(filePath).size;
  console.log(`Uploading to Gemini File API (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  const uploadResult = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  const fileName = uploadResult.name!;
  console.log(`Uploaded: ${fileName}, state: ${uploadResult.state}`);

  // Wait for processing to complete
  let fileInfo = uploadResult;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (fileInfo.state === "PROCESSING" && attempts < maxAttempts) {
    attempts++;
    console.log(`Processing... (${attempts * 5}s)`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    fileInfo = await ai.files.get({ name: fileName });
  }

  if (fileInfo.state === "FAILED") {
    console.error("File processing failed:", JSON.stringify(fileInfo));
    throw new Error("Gemini ไม่สามารถประมวลผลวิดีโอได้ กรุณาตรวจสอบว่าไฟล์เป็นวิดีโอจริง");
  }

  if (fileInfo.state === "PROCESSING") {
    throw new Error("วิดีโอใช้เวลาประมวลผลนานเกินไป กรุณาลองใช้คลิปที่สั้นลง");
  }

  console.log("Video processing complete!");
  return fileInfo.uri!;
}

export async function analyzeTeaching(
  videoBuffer: Buffer,
  videoMimeType: string,
  lessonPlanText: string
): Promise<AnalysisResult> {
  let tempFilePath: string | null = null;

  try {
    // Step 1: Save video buffer to temp file
    console.log("=== Step 1: Save Video ===");
    const ext = videoMimeType.includes("mp4") ? "mp4" : videoMimeType.split("/")[1] || "mp4";
    tempFilePath = await saveBufferToTemp(videoBuffer, ext);

    // Step 2: Upload to Gemini File API
    console.log("=== Step 2: Upload to Gemini ===");
    const fileUri = await uploadToGemini(tempFilePath, videoMimeType);

    // Step 3: Analyze with Gemini
    console.log("=== Step 3: Analyze ===");
    const prompt = buildAnalysisPrompt(lessonPlanText);

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: videoMimeType,
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
  } finally {
    // Cleanup temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Temp file cleaned up");
    }
  }
}

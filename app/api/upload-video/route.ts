import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
  "video/quicktime",
];

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get("videoFile") as File;

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดไฟล์วิดีโอ" },
        { status: 400 }
      );
    }

    const videoType = videoFile.type || "video/mp4";
    if (!ALLOWED_VIDEO_TYPES.includes(videoType) && !videoType.startsWith("video/")) {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดไฟล์วิดีโอ (เช่น .mp4, .mov, .avi, .webm)" },
        { status: 400 }
      );
    }

    // Save to temp file
    console.log(`Saving video: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`);
    const ext = videoType.includes("mp4") ? "mp4" : videoType.split("/")[1] || "mp4";
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `teachalign_video_${Date.now()}.${ext}`);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    fs.writeFileSync(tempFilePath, videoBuffer);

    // Upload to Gemini File API
    console.log("Uploading to Gemini File API...");
    const ai = new GoogleGenAI({ apiKey });
    const uploadResult = await ai.files.upload({
      file: tempFilePath,
      config: { mimeType: videoType },
    });

    const fileName = uploadResult.name!;
    console.log(`Uploaded: ${fileName}, state: ${uploadResult.state}`);

    // Wait for processing
    let fileInfo = uploadResult;
    let attempts = 0;
    const maxAttempts = 60;

    while (fileInfo.state === "PROCESSING" && attempts < maxAttempts) {
      attempts++;
      console.log(`Processing video... (${attempts * 5}s)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      fileInfo = await ai.files.get({ name: fileName });
    }

    if (fileInfo.state === "FAILED") {
      console.error("File processing failed:", JSON.stringify(fileInfo));
      return NextResponse.json(
        { success: false, error: "Gemini ไม่สามารถประมวลผลวิดีโอได้ กรุณาตรวจสอบไฟล์" },
        { status: 500 }
      );
    }

    if (fileInfo.state === "PROCESSING") {
      return NextResponse.json(
        { success: false, error: "วิดีโอใช้เวลาประมวลผลนานเกินไป กรุณาลองใช้คลิปสั้นลง" },
        { status: 500 }
      );
    }

    console.log("Video ready! URI:", fileInfo.uri);

    return NextResponse.json({
      success: true,
      fileUri: fileInfo.uri,
      mimeType: videoType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log("Temp file cleaned up");
    }
  }
}

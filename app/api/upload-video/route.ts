import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { trackUsage } from "@/lib/usageTracker";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  // Use SSE streaming to keep connection alive and avoid Render 30s timeout
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      let startTime = Date.now();
      let videoSizeMB = 0;

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          sendEvent({ type: "error", error: "GEMINI_API_KEY is not configured" });
          controller.close();
          return;
        }

        const formData = await request.formData();
        const videoFile = formData.get("videoFile") as File;

        if (!videoFile) {
          sendEvent({ type: "error", error: "กรุณาอัปโหลดไฟล์วิดีโอหรือเสียง" });
          controller.close();
          return;
        }

        // Detect mime type - support both video and audio files
        let mediaType = videoFile.type || "video/mp4";
        const fileName = videoFile.name.toLowerCase();

        // Fix mime type based on file extension if browser didn't detect correctly
        if (fileName.endsWith(".mp3")) mediaType = "audio/mpeg";
        else if (fileName.endsWith(".m4a")) mediaType = "audio/mp4";
        else if (fileName.endsWith(".wav")) mediaType = "audio/wav";
        else if (fileName.endsWith(".ogg")) mediaType = "audio/ogg";
        else if (fileName.endsWith(".flac")) mediaType = "audio/flac";

        const isAudio = mediaType.startsWith("audio/");
        const mediaLabel = isAudio ? "เสียง" : "วิดีโอ";

        startTime = Date.now();
        videoSizeMB = videoFile.size / 1024 / 1024;
        sendEvent({ type: "progress", message: `กำลังบันทึก${mediaLabel}...` });

        // Save to temp file
        const extMap: Record<string, string> = {
          "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/wav": "wav",
          "audio/ogg": "ogg", "audio/flac": "flac", "video/mp4": "mp4",
          "video/quicktime": "mov", "video/x-msvideo": "avi", "video/webm": "webm",
        };
        const ext = extMap[mediaType] || mediaType.split("/")[1] || "mp4";
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `teachalign_media_${Date.now()}.${ext}`);
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        fs.writeFileSync(tempFilePath, videoBuffer);

        sendEvent({
          type: "progress",
          message: `กำลังอัปโหลด${mediaLabel}ไปยัง Gemini (${(videoBuffer.length / 1024 / 1024).toFixed(0)} MB)...`,
        });

        // Upload to Gemini File API
        const ai = new GoogleGenAI({ apiKey });
        const uploadResult = await ai.files.upload({
          file: tempFilePath,
          config: { mimeType: mediaType },
        });

        const geminiFileName = uploadResult.name!;
        sendEvent({ type: "progress", message: `อัปโหลดสำเร็จ กำลังประมวลผล${mediaLabel}...` });

        // Wait for processing - send keep-alive events
        let fileInfo = uploadResult;
        let attempts = 0;

        while (fileInfo.state === "PROCESSING" && attempts < 60) {
          attempts++;
          sendEvent({
            type: "progress",
            message: `Gemini กำลังประมวลผล${mediaLabel}... (${attempts * 5} วินาที)`,
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
          fileInfo = await ai.files.get({ name: geminiFileName });
        }

        if (fileInfo.state === "FAILED") {
          sendEvent({ type: "error", error: `Gemini ไม่สามารถประมวลผล${mediaLabel}ได้ กรุณาตรวจสอบไฟล์` });
          controller.close();
          return;
        }

        if (fileInfo.state === "PROCESSING") {
          sendEvent({ type: "error", error: `${mediaLabel}ใช้เวลาประมวลผลนานเกินไป กรุณาลองใช้ไฟล์ที่สั้นลง` });
          controller.close();
          return;
        }

        trackUsage({
          timestamp: Date.now(),
          type: "upload",
          videoSizeMB,
          durationMs: Date.now() - startTime,
          success: true,
        });

        sendEvent({
          type: "done",
          fileUri: fileInfo.uri,
          mimeType: mediaType,
        });
        controller.close();
      } catch (error) {
        console.error("Upload error:", error);
        trackUsage({
          timestamp: Date.now(),
          type: "upload",
          videoSizeMB,
          durationMs: Date.now() - startTime,
          success: false,
        });
        const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
        sendEvent({ type: "error", error: message });
        controller.close();
      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

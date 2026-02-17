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
          sendEvent({ type: "error", error: "กรุณาอัปโหลดไฟล์วิดีโอ" });
          controller.close();
          return;
        }

        const videoType = videoFile.type || "video/mp4";
        startTime = Date.now();
        videoSizeMB = videoFile.size / 1024 / 1024;
        sendEvent({ type: "progress", message: "กำลังบันทึกวิดีโอ..." });

        // Save to temp file
        const ext = videoType.includes("mp4") ? "mp4" : videoType.split("/")[1] || "mp4";
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `teachalign_video_${Date.now()}.${ext}`);
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        fs.writeFileSync(tempFilePath, videoBuffer);

        sendEvent({
          type: "progress",
          message: `กำลังอัปโหลดไปยัง Gemini (${(videoBuffer.length / 1024 / 1024).toFixed(0)} MB)...`,
        });

        // Upload to Gemini File API
        const ai = new GoogleGenAI({ apiKey });
        const uploadResult = await ai.files.upload({
          file: tempFilePath,
          config: { mimeType: videoType },
        });

        const fileName = uploadResult.name!;
        sendEvent({ type: "progress", message: "อัปโหลดสำเร็จ กำลังประมวลผลวิดีโอ..." });

        // Wait for processing - send keep-alive events
        let fileInfo = uploadResult;
        let attempts = 0;

        while (fileInfo.state === "PROCESSING" && attempts < 60) {
          attempts++;
          sendEvent({
            type: "progress",
            message: `Gemini กำลังประมวลผลวิดีโอ... (${attempts * 5} วินาที)`,
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
          fileInfo = await ai.files.get({ name: fileName });
        }

        if (fileInfo.state === "FAILED") {
          sendEvent({ type: "error", error: "Gemini ไม่สามารถประมวลผลวิดีโอได้ กรุณาตรวจสอบไฟล์" });
          controller.close();
          return;
        }

        if (fileInfo.state === "PROCESSING") {
          sendEvent({ type: "error", error: "วิดีโอใช้เวลาประมวลผลนานเกินไป กรุณาลองใช้คลิปสั้นลง" });
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
          mimeType: videoType,
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

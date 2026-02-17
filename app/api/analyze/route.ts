import { NextRequest } from "next/server";
import { parseDocx } from "@/lib/docxParser";
import { analyzeWithFileUri } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // Keep-alive: send progress every 10s to prevent timeout
      const keepAlive = setInterval(() => {
        sendEvent({ type: "progress", message: "กำลังวิเคราะห์..." });
      }, 10000);

      try {
        const formData = await request.formData();
        const fileUri = formData.get("fileUri") as string;
        const mimeType = formData.get("mimeType") as string;
        const lessonPlanFile = formData.get("lessonPlanFile") as File;

        if (!fileUri || !mimeType) {
          sendEvent({ type: "error", error: "กรุณาอัปโหลดวิดีโอก่อน" });
          controller.close();
          return;
        }

        if (!lessonPlanFile) {
          sendEvent({ type: "error", error: "กรุณาอัปโหลดแผนการสอน" });
          controller.close();
          return;
        }

        const docxName = lessonPlanFile.name.toLowerCase();
        if (!docxName.endsWith(".docx")) {
          sendEvent({ type: "error", error: "กรุณาอัปโหลดไฟล์ .docx เท่านั้น" });
          controller.close();
          return;
        }

        sendEvent({ type: "progress", message: "กำลังอ่านแผนการสอน..." });
        const docxBuffer = Buffer.from(await lessonPlanFile.arrayBuffer());
        const lessonPlanText = await parseDocx(docxBuffer);

        if (!lessonPlanText.trim()) {
          sendEvent({ type: "error", error: "ไม่สามารถอ่านข้อความจากไฟล์แผนการสอนได้" });
          controller.close();
          return;
        }

        sendEvent({ type: "progress", message: "กำลังวิเคราะห์ด้วย AI..." });
        const result = await analyzeWithFileUri(fileUri, mimeType, lessonPlanText);

        sendEvent({ type: "done", data: result });
        controller.close();
      } catch (error) {
        console.error("Analysis error:", error);
        const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
        sendEvent({ type: "error", error: message });
        controller.close();
      } finally {
        clearInterval(keepAlive);
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

import { NextRequest, NextResponse } from "next/server";
import { parseDocx } from "@/lib/docxParser";
import { analyzeTeaching } from "@/lib/gemini";

export const maxDuration = 300; // Vercel function timeout 5 minutes

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
  try {
    const formData = await request.formData();
    const videoFile = formData.get("videoFile") as File;
    const lessonPlanFile = formData.get("lessonPlanFile") as File;

    // Validate inputs
    if (!videoFile || !lessonPlanFile) {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดทั้งวิดีโอและแผนการสอน" },
        { status: 400 }
      );
    }

    // Validate video file type
    const videoType = videoFile.type || "video/mp4";
    if (!ALLOWED_VIDEO_TYPES.includes(videoType) && !videoType.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาอัปโหลดไฟล์วิดีโอ (เช่น .mp4, .mov, .avi, .webm)",
        },
        { status: 400 }
      );
    }

    // Validate docx file type
    const docxName = lessonPlanFile.name.toLowerCase();
    if (!docxName.endsWith(".docx")) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาอัปโหลดไฟล์ .docx เท่านั้น (หากเป็น .doc ให้บันทึกเป็น .docx ก่อน)",
        },
        { status: 400 }
      );
    }

    // Parse the docx file
    console.log("Parsing lesson plan...");
    const docxBuffer = Buffer.from(await lessonPlanFile.arrayBuffer());
    const lessonPlanText = await parseDocx(docxBuffer);

    if (!lessonPlanText.trim()) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถอ่านข้อความจากไฟล์แผนการสอนได้ กรุณาตรวจสอบไฟล์" },
        { status: 400 }
      );
    }

    console.log(`Lesson plan parsed: ${lessonPlanText.length} characters`);

    // Read video file into buffer
    console.log(`Reading video: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    // Analyze with Gemini
    const result = await analyzeTeaching(videoBuffer, videoType, lessonPlanText);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Analysis error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

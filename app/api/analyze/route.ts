import { NextRequest, NextResponse } from "next/server";
import { parseDocx } from "@/lib/docxParser";
import { analyzeWithFileUri } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileUri = formData.get("fileUri") as string;
    const mimeType = formData.get("mimeType") as string;
    const lessonPlanFile = formData.get("lessonPlanFile") as File;

    // Validate inputs
    if (!fileUri || !mimeType) {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดวิดีโอก่อน" },
        { status: 400 }
      );
    }

    if (!lessonPlanFile) {
      return NextResponse.json(
        { success: false, error: "กรุณาอัปโหลดแผนการสอน" },
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
    console.log(`Using fileUri: ${fileUri}`);

    // Analyze with Gemini using pre-uploaded fileUri
    const result = await analyzeWithFileUri(fileUri, mimeType, lessonPlanText);

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

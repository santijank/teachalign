"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import GovHero from "@/components/GovHero";
import GovUploadForm from "@/components/GovUploadForm";
import GovLoadingState from "@/components/GovLoadingState";
import GovDashboard from "@/components/GovDashboard";
import { AnalysisResult, ApiResponse } from "@/types/analysis";

type AppState = "home" | "form" | "loading" | "result" | "error";

async function uploadVideoToGemini(
  videoFile: File,
  apiKey: string,
  onProgress: (msg: string) => void
): Promise<{ fileUri: string; mimeType: string }> {
  const mimeType = videoFile.type || "video/mp4";

  // Step 1: Start resumable upload
  onProgress("กำลังเตรียมอัปโหลดวิดีโอ...");
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(videoFile.size),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: { displayName: videoFile.name },
      }),
    }
  );

  const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) {
    throw new Error("ไม่สามารถเริ่มอัปโหลดได้ กรุณาลองใหม่");
  }

  // Step 2: Upload file data
  onProgress(`กำลังอัปโหลดวิดีโอ (${(videoFile.size / 1024 / 1024).toFixed(0)} MB)...`);
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": String(videoFile.size),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: videoFile,
  });

  const uploadData = await uploadRes.json();
  const fileName = uploadData?.file?.name;
  if (!fileName) {
    throw new Error("อัปโหลดวิดีโอล้มเหลว กรุณาลองใหม่");
  }

  // Step 3: Wait for processing
  onProgress("Gemini กำลังประมวลผลวิดีโอ...");
  let fileState = uploadData.file.state;
  let fileUri = uploadData.file.uri;
  let attempts = 0;

  while (fileState === "PROCESSING" && attempts < 60) {
    attempts++;
    onProgress(`ประมวลผลวิดีโอ... (${attempts * 5} วินาที)`);
    await new Promise((r) => setTimeout(r, 5000));

    const checkRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${apiKey}`
    );
    const checkData = await checkRes.json();
    fileState = checkData.state;
    fileUri = checkData.uri;
  }

  if (fileState === "FAILED") {
    throw new Error("Gemini ไม่สามารถประมวลผลวิดีโอได้ กรุณาตรวจสอบไฟล์");
  }
  if (fileState === "PROCESSING") {
    throw new Error("วิดีโอใช้เวลาประมวลผลนานเกินไป กรุณาลองใช้คลิปสั้นลง");
  }

  return { fileUri, mimeType };
}

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [currentPage, setCurrentPage] = useState("home");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleSubmit = async (videoFile: File, docxFile: File) => {
    setState("loading");
    setError("");

    try {
      // === Step 1: Get API key from server ===
      setLoadingMessage("กำลังเตรียมระบบ...");
      const keyRes = await fetch("/api/gemini-key");
      const keyData = await keyRes.json();
      if (!keyData.success) {
        throw new Error(keyData.error || "ไม่สามารถเชื่อมต่อระบบได้");
      }

      // === Step 2: Upload video directly to Gemini from browser ===
      const { fileUri, mimeType } = await uploadVideoToGemini(
        videoFile,
        keyData.apiKey,
        setLoadingMessage
      );

      console.log("Video uploaded! fileUri:", fileUri);

      // === Step 3: Analyze with fileUri + docx (lightweight request) ===
      setLoadingMessage("กำลังวิเคราะห์ความสอดคล้อง...");

      const analyzeFormData = new FormData();
      analyzeFormData.append("fileUri", fileUri);
      analyzeFormData.append("mimeType", mimeType);
      analyzeFormData.append("lessonPlanFile", docxFile);

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        body: analyzeFormData,
      });

      const analyzeData: ApiResponse = await analyzeResponse.json();

      if (analyzeData.success && analyzeData.data) {
        setResult(analyzeData.data);
        setState("result");
        setCurrentPage("dashboard");
      } else {
        setError(analyzeData.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setState("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      setError(msg);
      setState("error");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === "home") {
      setState("home");
    } else if (page === "analyze") {
      setState("form");
    } else if (page === "dashboard" || page === "report") {
      if (result) {
        setState("result");
      } else {
        setState("form");
        setCurrentPage("analyze");
      }
    }
  };

  const handleStartFromHero = () => {
    setState("form");
    setCurrentPage("analyze");
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleReset = () => {
    setState("form");
    setResult(null);
    setError("");
    setCurrentPage("analyze");
  };

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">
      <TopNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        showMenu={state !== "home"}
      />

      {/* Home / Hero */}
      {state === "home" && (
        <GovHero onStart={handleStartFromHero} />
      )}

      {/* Main Content (non-home states) */}
      {state !== "home" && (
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
          {state === "form" && (
            <GovUploadForm onSubmit={handleSubmit} isLoading={false} />
          )}

          {state === "loading" && <GovLoadingState message={loadingMessage} />}

          {state === "result" && result && (
            <GovDashboard
              result={result}
              onExportPdf={handleExportPdf}
              onReset={handleReset}
            />
          )}

          {state === "error" && (
            <div className="max-w-2xl mx-auto py-16">
              <div className="bg-gov-card border border-gov-border p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gov-danger flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gov-danger font-prompt mb-2">
                      เกิดข้อผิดพลาดในการวิเคราะห์
                    </h3>
                    <p className="text-sm text-gov-text-secondary font-prompt whitespace-pre-line mb-4">
                      {error}
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-gov-primary text-white text-sm font-prompt hover:bg-gov-primary-light transition-colors"
                    >
                      ลองใหม่อีกครั้ง
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-gov-border mt-auto bg-gov-card">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gov-text-muted font-prompt">
                สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครปฐม เขต 1
              </p>
              <p className="text-[10px] text-gov-text-muted font-prompt mt-0.5">
                TeachAlign &mdash; ระบบวิเคราะห์ความสอดคล้องการสอน
              </p>
            </div>
            <p className="text-[10px] text-gov-text-muted font-prompt">
              Powered by Gemini AI &bull; Bloom&apos;s Taxonomy &bull; Tyler&apos;s Model
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

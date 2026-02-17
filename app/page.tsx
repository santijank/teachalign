"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import GovHero from "@/components/GovHero";
import GovUploadForm from "@/components/GovUploadForm";
import GovLoadingState from "@/components/GovLoadingState";
import GovDashboard from "@/components/GovDashboard";
import { AnalysisResult } from "@/types/analysis";

type AppState = "home" | "form" | "loading" | "result" | "error";

// Upload video to server via SSE stream (keeps connection alive, avoids timeout)
async function uploadVideoViaStream(
  videoFile: File,
  onProgress: (msg: string) => void
): Promise<{ fileUri: string; mimeType: string }> {
  const formData = new FormData();
  formData.append("videoFile", videoFile);

  const response = await fetch("/api/upload-video", {
    method: "POST",
    body: formData,
  });

  if (!response.ok || !response.body) {
    throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: { fileUri: string; mimeType: string } | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "progress") {
          onProgress(data.message);
        } else if (data.type === "done") {
          result = { fileUri: data.fileUri, mimeType: data.mimeType };
        } else if (data.type === "error") {
          throw new Error(data.error);
        }
      } catch (e) {
        if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
          throw e;
        }
      }
    }
  }

  if (!result) {
    throw new Error("ไม่ได้รับผลลัพธ์จากการอัปโหลด กรุณาลองใหม่");
  }

  return result;
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
      // === Step 1: Upload video via streaming (avoids timeout) ===
      setLoadingMessage("กำลังเตรียมอัปโหลดวิดีโอ...");

      const { fileUri, mimeType } = await uploadVideoViaStream(
        videoFile,
        setLoadingMessage
      );

      console.log("Video uploaded! fileUri:", fileUri);

      // === Step 2: Analyze with fileUri + docx (SSE stream) ===
      setLoadingMessage("กำลังวิเคราะห์ความสอดคล้อง...");

      const analyzeFormData = new FormData();
      analyzeFormData.append("fileUri", fileUri);
      analyzeFormData.append("mimeType", mimeType);
      analyzeFormData.append("lessonPlanFile", docxFile);

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        body: analyzeFormData,
      });

      if (!analyzeResponse.ok || !analyzeResponse.body) {
        throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }

      // Read SSE stream from analyze API
      const analyzeReader = analyzeResponse.body.getReader();
      const analyzeDecoder = new TextDecoder();
      let analyzeBuf = "";
      let analyzeResult: AnalysisResult | null = null;

      while (true) {
        const { done, value } = await analyzeReader.read();
        if (done) break;

        analyzeBuf += analyzeDecoder.decode(value, { stream: true });
        const aLines = analyzeBuf.split("\n\n");
        analyzeBuf = aLines.pop() || "";

        for (const line of aLines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "progress") {
              setLoadingMessage(data.message);
            } else if (data.type === "done") {
              analyzeResult = data.data;
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              throw e;
            }
          }
        }
      }

      if (analyzeResult) {
        setResult(analyzeResult);
        setState("result");
        setCurrentPage("dashboard");
      } else {
        setError("ไม่ได้รับผลวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
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

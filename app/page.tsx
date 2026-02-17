"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import GovHero from "@/components/GovHero";
import GovUploadForm from "@/components/GovUploadForm";
import GovLoadingState from "@/components/GovLoadingState";
import GovDashboard from "@/components/GovDashboard";
import { AnalysisResult, ApiResponse } from "@/types/analysis";

type AppState = "home" | "form" | "loading" | "result" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [currentPage, setCurrentPage] = useState("home");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (videoFile: File, docxFile: File) => {
    setState("loading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("videoFile", videoFile);
      formData.append("lessonPlanFile", docxFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        setState("result");
        setCurrentPage("dashboard");
      } else {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setState("error");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
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

          {state === "loading" && <GovLoadingState />}

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

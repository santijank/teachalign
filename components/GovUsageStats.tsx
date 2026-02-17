"use client";

import { useState, useEffect } from "react";

interface UsageData {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalVideoUploadMB: number;
  totalUploadTime: number;
  totalAnalyzeTime: number;
  serverStartedAt: string;
  estimatedTokensUsed: number;
  estimatedCostUSD: number;
}

export default function GovUsageStats() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();
      if (data.success) setUsage(data.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
      const interval = setInterval(fetchUsage, 15000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <div className="no-print">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchUsage();
        }}
        className="text-[10px] text-gov-text-muted hover:text-gov-secondary transition-colors font-prompt flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        API Usage
      </button>

      {isOpen && usage && (
        <div className="mt-3 bg-gov-card border border-gov-border p-4 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gov-primary font-prompt text-sm">
              สถิติการใช้งาน API
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gov-text-muted hover:text-gov-danger"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Analyses */}
            <div className="bg-gov-bg p-3 text-center">
              <p className="text-lg font-bold text-gov-primary font-inter">
                {usage.totalAnalyses}
              </p>
              <p className="text-[10px] text-gov-text-muted font-prompt">วิเคราะห์ทั้งหมด</p>
            </div>

            {/* Success */}
            <div className="bg-gov-bg p-3 text-center">
              <p className="text-lg font-bold text-gov-success font-inter">
                {usage.successfulAnalyses}
              </p>
              <p className="text-[10px] text-gov-text-muted font-prompt">สำเร็จ</p>
            </div>

            {/* Video Upload */}
            <div className="bg-gov-bg p-3 text-center">
              <p className="text-lg font-bold text-gov-secondary font-inter">
                {usage.totalVideoUploadMB} <span className="text-xs">MB</span>
              </p>
              <p className="text-[10px] text-gov-text-muted font-prompt">อัปโหลดวิดีโอ</p>
            </div>

            {/* Estimated Cost */}
            <div className="bg-gov-bg p-3 text-center">
              <p className="text-lg font-bold text-amber-600 font-inter">
                ${usage.estimatedCostUSD}
              </p>
              <p className="text-[10px] text-gov-text-muted font-prompt">ค่า API โดยประมาณ</p>
            </div>
          </div>

          {/* Detail row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gov-text-muted font-prompt">
            <span>Tokens: ~{usage.estimatedTokensUsed.toLocaleString()}</span>
            <span>Upload: {usage.totalUploadTime}s</span>
            <span>Analyze: {usage.totalAnalyzeTime}s</span>
            <span>Failed: {usage.failedAnalyses}</span>
            <span>Server: {new Date(usage.serverStartedAt).toLocaleString("th-TH")}</span>
          </div>

          <p className="mt-2 text-[9px] text-gov-text-muted font-prompt italic">
            * ค่า API เป็นค่าประมาณการ จะรีเซ็ตเมื่อ server restart (Gemini 2.5 Flash: $0.15/1M input, $0.60/1M output tokens)
          </p>
        </div>
      )}
    </div>
  );
}

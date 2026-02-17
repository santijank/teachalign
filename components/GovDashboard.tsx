"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";

interface GovDashboardProps {
  result: AnalysisResult;
  onExportPdf: () => void;
  onReset: () => void;
}

type TabId = "overview" | "blooms" | "tyler" | "recommendations";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "ภาพรวม" },
  { id: "blooms", label: "Bloom's Taxonomy" },
  { id: "tyler", label: "Tyler Model" },
  { id: "recommendations", label: "ข้อเสนอแนะ" },
];

function getQualityLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: "ดีเยี่ยม", color: "text-gov-success", bg: "bg-gov-success" };
  if (score >= 80) return { label: "ดีมาก", color: "text-gov-success", bg: "bg-gov-success" };
  if (score >= 70) return { label: "ดี", color: "text-gov-secondary", bg: "bg-gov-secondary" };
  if (score >= 60) return { label: "พอใช้", color: "text-gov-warning", bg: "bg-gov-warning" };
  return { label: "ควรปรับปรุง", color: "text-gov-danger", bg: "bg-gov-danger" };
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-gov-success";
  if (score >= 60) return "bg-gov-warning";
  return "bg-gov-danger";
}

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const bloomLabels: Record<string, string> = {
  Remember: "จำได้",
  Understand: "เข้าใจ",
  Apply: "ประยุกต์ใช้",
  Analyze: "วิเคราะห์",
  Evaluate: "ประเมินค่า",
  Create: "สร้างสรรค์",
};

export default function GovDashboard({ result, onExportPdf, onReset }: GovDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const quality = getQualityLabel(result.overallScore);
  const tylerAvg = Math.round(
    (result.tylerAlignment.objectives + result.tylerAlignment.activities + result.tylerAlignment.assessment) / 3
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gov-primary font-prompt">
            ผลการวิเคราะห์ความสอดคล้อง
          </h2>
          <p className="text-sm text-gov-text-secondary mt-1 font-prompt">
            รายงานผลการประเมินตามกรอบทฤษฎี Bloom&apos;s Taxonomy และ Tyler&apos;s Model
          </p>
          <div className="h-[2px] bg-gov-primary w-16 mt-3"></div>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={onExportPdf}
            className="px-4 py-2 bg-gov-primary text-white text-sm font-prompt hover:bg-gov-primary-light transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ส่งออก PDF
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 border border-gov-border text-gov-text-secondary text-sm font-prompt hover:bg-gov-bg transition-colors"
          >
            วิเคราะห์ใหม่
          </button>
        </div>
      </div>

      {/* Section A: Executive Summary */}
      <div className="bg-gov-card border border-gov-border">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Big Score */}
            <div className="text-center md:border-r md:border-gov-border md:pr-8">
              <div className="relative w-36 h-36 mx-auto">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="62" fill="none" stroke="#F4F6F9" strokeWidth="8" />
                  <circle
                    cx="72" cy="72" r="62" fill="none"
                    strokeWidth="8" strokeLinecap="butt"
                    strokeDasharray={`${(result.overallScore / 100) * 389.56} 389.56`}
                    className={getBarColor(result.overallScore)}
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gov-primary font-inter">{result.overallScore}</span>
                  <span className="text-xs text-gov-text-muted font-prompt">คะแนน</span>
                </div>
              </div>
              <div className={`mt-3 inline-block px-3 py-1 text-xs font-semibold text-white font-prompt ${quality.bg}`}>
                {quality.label}
              </div>
            </div>

            {/* Summary Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="text-center p-4 bg-gov-bg">
                <p className="text-xs text-gov-text-muted font-prompt mb-1">Bloom&apos;s Taxonomy</p>
                <p className="text-2xl font-bold text-gov-primary font-inter">{result.bloomsAlignment.score}%</p>
                <p className="text-xs text-gov-text-secondary font-prompt mt-1">ความสอดคล้อง</p>
              </div>
              <div className="text-center p-4 bg-gov-bg">
                <p className="text-xs text-gov-text-muted font-prompt mb-1">Tyler&apos;s Model</p>
                <p className="text-2xl font-bold text-gov-primary font-inter">{tylerAvg}%</p>
                <p className="text-xs text-gov-text-secondary font-prompt mt-1">ความสอดคล้อง</p>
              </div>
              <div className="text-center p-4 bg-gov-bg">
                <p className="text-xs text-gov-text-muted font-prompt mb-1">ด้านเวลา</p>
                <p className="text-2xl font-bold text-gov-primary font-inter">{result.timeAlignment.score}%</p>
                <p className="text-xs text-gov-text-secondary font-prompt mt-1">
                  {result.timeAlignment.plannedMinutes} / {result.timeAlignment.actualMinutes} นาที
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section B: 3 Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bloom Card */}
        <div className="bg-gov-card border border-gov-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gov-text-primary font-prompt">Bloom&apos;s Taxonomy</h4>
            <span className="text-lg font-bold text-gov-primary font-inter">{result.bloomsAlignment.score}%</span>
          </div>
          <div className="w-full bg-gov-bg h-2 mb-3">
            <div className={`h-2 animate-progress ${getBarColor(result.bloomsAlignment.score)}`} style={{ width: `${result.bloomsAlignment.score}%` }}></div>
          </div>
          <p className="text-xs text-gov-text-secondary font-prompt leading-relaxed line-clamp-3">
            {result.bloomsAlignment.comment}
          </p>
        </div>

        {/* Tyler Card */}
        <div className="bg-gov-card border border-gov-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gov-text-primary font-prompt">Tyler&apos;s Model</h4>
            <span className="text-lg font-bold text-gov-primary font-inter">{tylerAvg}%</span>
          </div>
          <div className="w-full bg-gov-bg h-2 mb-3">
            <div className={`h-2 animate-progress ${getBarColor(tylerAvg)}`} style={{ width: `${tylerAvg}%` }}></div>
          </div>
          <p className="text-xs text-gov-text-secondary font-prompt leading-relaxed line-clamp-3">
            {result.tylerAlignment.comment}
          </p>
        </div>

        {/* Time Card */}
        <div className="bg-gov-card border border-gov-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gov-text-primary font-prompt">ความสอดคล้องเวลา</h4>
            <span className="text-lg font-bold text-gov-primary font-inter">{result.timeAlignment.score}%</span>
          </div>
          <div className="w-full bg-gov-bg h-2 mb-3">
            <div className={`h-2 animate-progress ${getBarColor(result.timeAlignment.score)}`} style={{ width: `${result.timeAlignment.score}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gov-text-secondary font-prompt">
            <span>แผน: {result.timeAlignment.plannedMinutes} นาที</span>
            <span>จริง: {result.timeAlignment.actualMinutes} นาที</span>
          </div>
        </div>
      </div>

      {/* Section C: Tab-based Detail */}
      <div className="bg-gov-card border border-gov-border">
        {/* Tab Header */}
        <div className="border-b border-gov-border flex overflow-x-auto no-print">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-prompt whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-gov-primary font-semibold tab-active"
                  : "text-gov-text-muted hover:text-gov-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gov-primary font-prompt mb-3">สรุปผลการวิเคราะห์</h4>
                <p className="text-sm text-gov-text-secondary font-prompt leading-relaxed whitespace-pre-line">
                  {result.detailedFeedback}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gov-success-light border border-gov-success/20 p-4">
                  <h5 className="text-sm font-semibold text-gov-success font-prompt mb-2">จุดแข็ง ({result.strengths.length} รายการ)</h5>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gov-text-secondary font-prompt flex items-start gap-2">
                        <span className="text-gov-success mt-0.5 flex-shrink-0">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gov-warning-light border border-gov-warning/20 p-4">
                  <h5 className="text-sm font-semibold text-amber-700 font-prompt mb-2">ข้อเสนอแนะ ({result.improvements.length} รายการ)</h5>
                  <ul className="space-y-1.5">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-gov-text-secondary font-prompt flex items-start gap-2">
                        <span className="text-gov-warning mt-0.5 flex-shrink-0">&#9888;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bloom's Tab */}
          {activeTab === "blooms" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gov-primary font-prompt mb-1">
                  Bloom&apos;s Taxonomy (Revised) — Anderson &amp; Krathwohl (2001)
                </h4>
                <p className="text-xs text-gov-text-muted font-prompt mb-4">
                  เปรียบเทียบระดับพุทธิพิสัยที่ระบุในแผนการสอน กับระดับที่ปรากฏจริงในคลิปวิดีโอ
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gov-bg">
                      <th className="text-left p-3 font-semibold text-gov-text-primary font-prompt border border-gov-border">ระดับพุทธิพิสัย</th>
                      <th className="text-center p-3 font-semibold text-gov-text-primary font-prompt border border-gov-border">ภาษาไทย</th>
                      <th className="text-center p-3 font-semibold text-gov-text-primary font-prompt border border-gov-border">แผนการสอน</th>
                      <th className="text-center p-3 font-semibold text-gov-text-primary font-prompt border border-gov-border">คลิปการสอนจริง</th>
                      <th className="text-center p-3 font-semibold text-gov-text-primary font-prompt border border-gov-border">ผลการเปรียบเทียบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloomLevels.map((level) => {
                      const inPlan = result.bloomsAlignment.planned.includes(level);
                      const inActual = result.bloomsAlignment.actual.includes(level);
                      const match = inPlan === inActual;
                      return (
                        <tr key={level} className="border-b border-gov-border">
                          <td className="p-3 font-inter font-medium text-gov-text-primary border border-gov-border">{level}</td>
                          <td className="p-3 text-center font-prompt text-gov-text-secondary border border-gov-border">{bloomLabels[level]}</td>
                          <td className="p-3 text-center border border-gov-border">
                            {inPlan ? (
                              <span className="inline-block w-6 h-6 bg-gov-secondary text-white text-xs leading-6">&#10003;</span>
                            ) : (
                              <span className="inline-block w-6 h-6 bg-gov-bg text-gov-text-muted text-xs leading-6">&mdash;</span>
                            )}
                          </td>
                          <td className="p-3 text-center border border-gov-border">
                            {inActual ? (
                              <span className="inline-block w-6 h-6 bg-gov-success text-white text-xs leading-6">&#10003;</span>
                            ) : (
                              <span className="inline-block w-6 h-6 bg-gov-bg text-gov-text-muted text-xs leading-6">&mdash;</span>
                            )}
                          </td>
                          <td className="p-3 text-center border border-gov-border">
                            {inPlan && inActual ? (
                              <span className="text-xs font-medium text-gov-success font-prompt">สอดคล้อง</span>
                            ) : inPlan && !inActual ? (
                              <span className="text-xs font-medium text-gov-danger font-prompt">ไม่ปรากฏ</span>
                            ) : !inPlan && inActual ? (
                              <span className="text-xs font-medium text-gov-secondary font-prompt">เกินแผน</span>
                            ) : (
                              <span className="text-xs text-gov-text-muted font-prompt">{match ? "—" : "—"}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Score */}
              <div className="bg-gov-bg p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gov-text-primary font-prompt">คะแนนความสอดคล้อง Bloom&apos;s Taxonomy</span>
                <span className="text-xl font-bold text-gov-primary font-inter">{result.bloomsAlignment.score}%</span>
              </div>

              {/* Analysis */}
              <div className="border-l-4 border-gov-primary pl-4">
                <h5 className="text-sm font-semibold text-gov-primary font-prompt mb-2">ผลการวิเคราะห์</h5>
                <p className="text-sm text-gov-text-secondary font-prompt leading-relaxed">
                  {result.bloomsAlignment.comment}
                </p>
              </div>
            </div>
          )}

          {/* Tyler Tab */}
          {activeTab === "tyler" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gov-primary font-prompt mb-1">
                  Tyler&apos;s Curriculum Model — Ralph Tyler (1949)
                </h4>
                <p className="text-xs text-gov-text-muted font-prompt mb-4">
                  ตรวจสอบความสอดคล้องของ 3 องค์ประกอบ: วัตถุประสงค์ → กิจกรรมการเรียนรู้ → การประเมินผล
                </p>
              </div>

              {/* 3 Horizontal Bars */}
              <div className="space-y-5">
                {[
                  { label: "วัตถุประสงค์ (Objectives)", score: result.tylerAlignment.objectives, desc: "ความชัดเจนและสอดคล้องของวัตถุประสงค์การเรียนรู้" },
                  { label: "กิจกรรมการเรียนรู้ (Activities)", score: result.tylerAlignment.activities, desc: "ความสอดคล้องของกิจกรรมกับวัตถุประสงค์ที่ตั้งไว้" },
                  { label: "การประเมินผล (Assessment)", score: result.tylerAlignment.assessment, desc: "ความสอดคล้องของวิธีประเมินผลกับวัตถุประสงค์" },
                ].map((item) => (
                  <div key={item.label} className="bg-gov-bg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gov-text-primary font-prompt">{item.label}</p>
                        <p className="text-xs text-gov-text-muted font-prompt">{item.desc}</p>
                      </div>
                      <span className="text-xl font-bold text-gov-primary font-inter ml-4">{item.score}%</span>
                    </div>
                    <div className="w-full bg-white h-3 border border-gov-border">
                      <div
                        className={`h-full animate-progress ${getBarColor(item.score)}`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Average */}
              <div className="bg-gov-primary text-white p-4 flex items-center justify-between">
                <span className="text-sm font-semibold font-prompt">คะแนนเฉลี่ย Tyler&apos;s Model</span>
                <span className="text-xl font-bold font-inter">{tylerAvg}%</span>
              </div>

              {/* Analysis */}
              <div className="border-l-4 border-gov-primary pl-4">
                <h5 className="text-sm font-semibold text-gov-primary font-prompt mb-2">ผลการวิเคราะห์</h5>
                <p className="text-sm text-gov-text-secondary font-prompt leading-relaxed">
                  {result.tylerAlignment.comment}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* Strengths */}
              <div className="border border-gov-success/30 bg-gov-success-light">
                <div className="bg-gov-success px-4 py-2">
                  <h4 className="text-sm font-semibold text-white font-prompt">
                    จุดแข็ง ({result.strengths.length} รายการ)
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  {result.strengths.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gov-success/10">
                      <div className="w-6 h-6 bg-gov-success text-white flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-inter font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gov-text-primary font-prompt leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="border border-gov-warning/30 bg-gov-warning-light">
                <div className="bg-amber-600 px-4 py-2">
                  <h4 className="text-sm font-semibold text-white font-prompt">
                    ข้อเสนอแนะเพื่อการพัฒนา ({result.improvements.length} รายการ)
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  {result.improvements.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gov-warning/10">
                      <div className="w-6 h-6 bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-inter font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gov-text-primary font-prompt leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="border border-gov-border">
                <div className="bg-gov-primary px-4 py-2">
                  <h4 className="text-sm font-semibold text-white font-prompt">ข้อเสนอแนะโดยละเอียด</h4>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gov-text-secondary font-prompt leading-relaxed whitespace-pre-line">
                    {result.detailedFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

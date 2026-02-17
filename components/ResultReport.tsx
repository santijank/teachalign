"use client";

import { AnalysisResult } from "@/types/analysis";
import ScoreGauge from "./ScoreGauge";

interface ResultReportProps {
  result: AnalysisResult;
  onExportPdf: () => void;
  onReset: () => void;
}

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export default function ResultReport({ result, onExportPdf, onReset }: ResultReportProps) {
  const tylerAvg = Math.round(
    (result.tylerAlignment.objectives +
      result.tylerAlignment.activities +
      result.tylerAlignment.assessment) /
      3
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ผลการวิเคราะห์ความสอดคล้อง
        </h2>
        <p className="text-gray-500">TeachAlign Report</p>
      </div>

      {/* Overall Score + Sub Scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <ScoreGauge score={result.overallScore} label="คะแนนรวม" size="lg" />
          <div className="flex gap-6">
            <ScoreGauge
              score={result.bloomsAlignment.score}
              label="Bloom's Taxonomy"
            />
            <ScoreGauge score={tylerAvg} label="Tyler's Model" />
            <ScoreGauge
              score={result.timeAlignment.score}
              label="เวลา"
            />
          </div>
        </div>
      </div>

      {/* Bloom's Taxonomy Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Bloom&apos;s Taxonomy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">ระดับที่วางแผน</p>
            <div className="flex flex-wrap gap-2">
              {bloomLevels.map((level) => (
                <span
                  key={`planned-${level}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    result.bloomsAlignment.planned.includes(level)
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">ระดับที่เกิดขึ้นจริง</p>
            <div className="flex flex-wrap gap-2">
              {bloomLevels.map((level) => (
                <span
                  key={`actual-${level}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    result.bloomsAlignment.actual.includes(level)
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          {result.bloomsAlignment.comment}
        </p>
      </div>

      {/* Tyler's Model Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tyler&apos;s Curriculum Model
        </h3>
        <div className="space-y-4">
          {[
            { label: "วัตถุประสงค์", score: result.tylerAlignment.objectives },
            { label: "กิจกรรมการเรียนรู้", score: result.tylerAlignment.activities },
            { label: "การประเมินผล", score: result.tylerAlignment.assessment },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800">{item.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    item.score >= 80
                      ? "bg-green-500"
                      : item.score >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-4">
          {result.tylerAlignment.comment}
        </p>
      </div>

      {/* Time Alignment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          ความสอดคล้องด้านเวลา
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {result.timeAlignment.plannedMinutes}
            </p>
            <p className="text-sm text-gray-500">นาที (แผน)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {result.timeAlignment.actualMinutes}
            </p>
            <p className="text-sm text-gray-500">นาที (จริง)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {result.timeAlignment.score}%
            </p>
            <p className="text-sm text-gray-500">สอดคล้อง</p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-green-700 mb-3">
          จุดแข็ง
        </h3>
        <ul className="space-y-2">
          {result.strengths.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-amber-700 mb-3">
          ข้อเสนอแนะ
        </h3>
        <ul className="space-y-2">
          {result.improvements.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          ข้อเสนอแนะโดยละเอียด
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {result.detailedFeedback}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onExportPdf}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ดาวน์โหลดรายงาน PDF
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          วิเคราะห์ใหม่
        </button>
      </div>
    </div>
  );
}

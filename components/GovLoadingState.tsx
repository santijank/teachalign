"use client";

import { useState, useEffect } from "react";

const steps = [
  { label: "กำลังอ่านแผนการสอน", desc: "แปลงไฟล์ .docx เป็นข้อความ" },
  { label: "กำลังอัปโหลดวิดีโอ", desc: "ส่งไฟล์ไปยัง Gemini File API" },
  { label: "กำลังประมวลผลวิดีโอ", desc: "ถอดเสียงและวิเคราะห์เนื้อหา" },
  { label: "กำลังเปรียบเทียบตาม Bloom's Taxonomy", desc: "ประเมินระดับพุทธิพิสัย" },
  { label: "กำลังประเมินตาม Tyler's Model", desc: "ตรวจสอบความสอดคล้องหลักสูตร" },
  { label: "กำลังสรุปผลการวิเคราะห์", desc: "รวบรวมและจัดทำรายงาน" },
];

export default function GovLoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 95);

  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-gov-card border border-gov-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 border-2 border-gov-primary mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gov-primary border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-gov-primary font-prompt">
            กำลังดำเนินการวิเคราะห์
          </h2>
          <p className="text-sm text-gov-text-secondary mt-1 font-prompt">
            กรุณารอสักครู่ ระบบกำลังประมวลผล
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gov-text-secondary font-prompt">ความคืบหน้า</span>
            <span className="text-xs font-semibold text-gov-primary font-inter">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gov-bg h-2">
            <div
              className="h-2 bg-gov-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 transition-all duration-300 ${
                index === currentStep
                  ? "bg-blue-50/50 border border-gov-secondary/20"
                  : index < currentStep
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {index < currentStep ? (
                  <svg className="w-5 h-5 text-gov-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : index === currentStep ? (
                  <div className="w-3 h-3 bg-gov-secondary animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-gov-text-muted"></div>
                )}
              </div>
              {/* Text */}
              <div>
                <p className={`text-sm font-prompt ${index <= currentStep ? "text-gov-text-primary font-medium" : "text-gov-text-muted"}`}>
                  {step.label}
                </p>
                {index === currentStep && (
                  <p className="text-xs text-gov-text-secondary font-prompt mt-0.5">{step.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-gov-border">
          <p className="text-xs text-gov-text-muted text-center font-prompt">
            การวิเคราะห์อาจใช้เวลา 1-5 นาที ขึ้นอยู่กับความยาวของวิดีโอ
          </p>
        </div>
      </div>
    </div>
  );
}

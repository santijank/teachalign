"use client";

import { useState, useEffect } from "react";

const steps = [
  "กำลังอ่านแผนการสอน...",
  "กำลังวิเคราะห์คลิปวิดีโอ...",
  "กำลังเปรียบเทียบตามทฤษฎี Bloom's Taxonomy...",
  "กำลังประเมินตาม Tyler's Model...",
  "กำลังสรุปผลการวิเคราะห์...",
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        กำลังวิเคราะห์...
      </h2>

      <div className="w-full max-w-md space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 transition-all duration-500 ${
              index <= currentStep ? "opacity-100" : "opacity-30"
            }`}
          >
            {index < currentStep ? (
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : index === currentStep ? (
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            )}
            <span className={`text-sm ${index <= currentStep ? "text-gray-700" : "text-gray-400"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500 text-center">
        การวิเคราะห์อาจใช้เวลา 1-3 นาที ขึ้นอยู่กับความยาวของวิดีโอ
      </p>
    </div>
  );
}

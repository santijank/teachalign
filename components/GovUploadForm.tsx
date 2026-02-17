"use client";

import { useState, useRef } from "react";

interface GovUploadFormProps {
  onSubmit: (videoFile: File, docxFile: File) => void;
  isLoading: boolean;
}

export default function GovUploadForm({ onSubmit, isLoading }: GovUploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoFile && docxFile) {
      onSubmit(videoFile, docxFile);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gov-primary font-prompt">
          วิเคราะห์ความสอดคล้องใหม่
        </h2>
        <p className="text-sm text-gov-text-secondary mt-1 font-prompt">
          อัปโหลดคลิปวิดีโอ/เสียงการสอนและแผนการสอนเพื่อเริ่มการวิเคราะห์
        </p>
        <div className="h-[2px] bg-gov-primary w-16 mt-3"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload Card */}
        <div className="bg-gov-card border border-gov-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gov-primary flex items-center justify-center">
              <span className="text-white text-xs font-inter font-bold">1</span>
            </div>
            <h3 className="text-sm font-semibold text-gov-text-primary font-prompt">
              คลิปวิดีโอ / เสียงการสอน
            </h3>
          </div>

          <div
            onClick={() => !isLoading && videoInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              videoFile
                ? "border-gov-success bg-gov-success-light"
                : "border-gov-border hover:border-gov-secondary hover:bg-blue-50/30"
            } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,audio/*,.mp3,.m4a,.wav,.ogg"
              onChange={(e) => e.target.files?.[0] && setVideoFile(e.target.files[0])}
              className="hidden"
              disabled={isLoading}
            />
            {videoFile ? (
              <div className="flex items-center justify-center gap-4">
                <svg className="w-8 h-8 text-gov-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-gov-text-primary font-prompt">{videoFile.name}</p>
                  <p className="text-xs text-gov-text-secondary font-inter">{formatSize(videoFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  className="ml-4 text-gov-text-muted hover:text-gov-danger transition-colors"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gov-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gov-text-secondary font-prompt">
                  คลิกเพื่อเลือกไฟล์วิดีโอหรือเสียง หรือลากไฟล์มาวาง
                </p>
                <p className="text-xs text-gov-text-muted mt-1 font-prompt">
                  รองรับ MP4, MOV, AVI, WEBM, MP3, M4A, WAV (สูงสุด 2 GB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Docx Upload Card */}
        <div className="bg-gov-card border border-gov-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gov-primary flex items-center justify-center">
              <span className="text-white text-xs font-inter font-bold">2</span>
            </div>
            <h3 className="text-sm font-semibold text-gov-text-primary font-prompt">
              แผนการสอน
            </h3>
          </div>

          <div
            onClick={() => !isLoading && docxInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              docxFile
                ? "border-gov-success bg-gov-success-light"
                : "border-gov-border hover:border-gov-secondary hover:bg-blue-50/30"
            } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={docxInputRef}
              type="file"
              accept=".docx"
              onChange={(e) => e.target.files?.[0] && setDocxFile(e.target.files[0])}
              className="hidden"
              disabled={isLoading}
            />
            {docxFile ? (
              <div className="flex items-center justify-center gap-4">
                <svg className="w-8 h-8 text-gov-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-gov-text-primary font-prompt">{docxFile.name}</p>
                  <p className="text-xs text-gov-text-secondary font-inter">{formatSize(docxFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocxFile(null);
                    if (docxInputRef.current) docxInputRef.current.value = "";
                  }}
                  className="ml-4 text-gov-text-muted hover:text-gov-danger transition-colors"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gov-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gov-text-secondary font-prompt">
                  คลิกเพื่อเลือกไฟล์แผนการสอน
                </p>
                <p className="text-xs text-gov-text-muted mt-1 font-prompt">
                  รองรับเฉพาะไฟล์ .docx
                </p>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!videoFile || !docxFile || isLoading}
            className="px-8 py-3 bg-gov-primary text-white text-sm font-semibold font-prompt hover:bg-gov-primary-light transition-colors disabled:bg-gov-text-muted disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isLoading ? "กำลังวิเคราะห์..." : "เริ่มวิเคราะห์"}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50/50 border border-gov-secondary/20 p-5">
        <h4 className="text-sm font-semibold text-gov-secondary font-prompt mb-2">
          คำแนะนำในการใช้งาน
        </h4>
        <ul className="text-xs text-gov-text-secondary space-y-1.5 font-prompt">
          <li className="flex items-start gap-2">
            <span className="text-gov-secondary mt-0.5">&#8226;</span>
            คลิปวิดีโอ/เสียงควรมีเสียงชัดเจน เพื่อให้ AI วิเคราะห์ได้แม่นยำ
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gov-secondary mt-0.5">&#8226;</span>
            แผนการสอนควรเป็นไฟล์ .docx ที่มีรายละเอียดครบถ้วน
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gov-secondary mt-0.5">&#8226;</span>
            การวิเคราะห์ใช้เวลาประมาณ 1-5 นาที ขึ้นอยู่กับความยาวของวิดีโอ
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gov-secondary mt-0.5">&#8226;</span>
            ระบบวิเคราะห์ตามกรอบทฤษฎี Bloom&apos;s Taxonomy และ Tyler&apos;s Model
          </li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";

interface UploadFormProps {
  onSubmit: (videoFile: File, docxFile: File) => void;
  isLoading: boolean;
}

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [docxDragActive, setDocxDragActive] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoFile && docxFile) {
      onSubmit(videoFile, docxFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Video Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          อัปโหลดคลิปวิดีโอการสอน
        </label>
        <div
          onDragEnter={(e) => { e.preventDefault(); setVideoDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setVideoDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setVideoDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("video/")) setVideoFile(file);
          }}
          onClick={() => videoInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            videoDragActive
              ? "border-blue-500 bg-blue-50"
              : videoFile
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setVideoFile(e.target.files[0]);
            }}
            className="hidden"
            disabled={isLoading}
          />
          {videoFile ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{videoFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(videoFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoFile(null);
                  if (videoInputRef.current) videoInputRef.current.value = "";
                }}
                className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">คลิกเพื่อเลือกวิดีโอ</span> หรือลากไฟล์มาวาง
              </p>
              <p className="text-xs text-gray-500 mt-1">รองรับ .mp4, .mov, .avi, .webm (สูงสุด 2 GB)</p>
            </>
          )}
        </div>
      </div>

      {/* Docx Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          อัปโหลดแผนการสอน (.docx)
        </label>
        <div
          onDragEnter={(e) => { e.preventDefault(); setDocxDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDocxDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDocxDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.name.toLowerCase().endsWith(".docx")) setDocxFile(file);
          }}
          onClick={() => docxInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            docxDragActive
              ? "border-blue-500 bg-blue-50"
              : docxFile
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={docxInputRef}
            type="file"
            accept=".docx"
            onChange={(e) => {
              if (e.target.files?.[0]) setDocxFile(e.target.files[0]);
            }}
            className="hidden"
            disabled={isLoading}
          />
          {docxFile ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{docxFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(docxFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDocxFile(null);
                  if (docxInputRef.current) docxInputRef.current.value = "";
                }}
                className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวาง
              </p>
              <p className="text-xs text-gray-500 mt-1">รองรับเฉพาะไฟล์ .docx</p>
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!videoFile || !docxFile || isLoading}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "กำลังวิเคราะห์..." : "วิเคราะห์ความสอดคล้อง"}
      </button>
    </form>
  );
}

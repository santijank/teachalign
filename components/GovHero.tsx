"use client";

import Image from "next/image";

interface GovHeroProps {
  onStart: () => void;
}

export default function GovHero({ onStart }: GovHeroProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Organization Header Banner */}
      <div className="bg-white border-b border-gov-border">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col items-center text-center">
            {/* Organization Logo */}
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="ตราสัญลักษณ์ สพป.นครปฐม เขต 1"
                width={120}
                height={120}
                className="h-24 md:h-28 w-auto object-contain"
                priority
              />
            </div>

            {/* Organization Name */}
            <h1 className="text-lg md:text-xl font-bold text-gov-primary font-prompt leading-snug">
              สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครปฐม เขต 1
            </h1>
            <p className="text-xs md:text-sm text-gov-text-secondary font-prompt mt-1">
              Nakhon Pathom Primary Educational Service Area Office 1
            </p>
            <div className="h-[2px] bg-gov-primary w-20 mt-3"></div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full">
          {/* System Title Card */}
          <div className="bg-white border border-gov-border shadow-sm mb-8">
            {/* Card Header */}
            <div className="bg-gov-primary px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white font-prompt">
                    TeachAlign
                  </h2>
                  <p className="text-xs text-white/70 font-prompt">
                    ระบบวิเคราะห์ความสอดคล้องระหว่างแผนการสอนกับการจัดการเรียนรู้
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-8">
              <p className="text-sm text-gov-text-secondary font-prompt leading-relaxed mb-6">
                ระบบวิเคราะห์ความสอดคล้องระหว่างแผนการสอนและคลิปวิดีโอการสอนจริง
                โดยใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) ตามกรอบทฤษฎี
                Bloom&apos;s Taxonomy และ Tyler&apos;s Curriculum Model
                เพื่อสนับสนุนการพัฒนาคุณภาพการจัดการเรียนรู้ของครูผู้สอน
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gov-bg p-4 border border-gov-border">
                  <div className="w-8 h-8 bg-gov-secondary text-white flex items-center justify-center mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gov-text-primary font-prompt mb-1">
                    Bloom&apos;s Taxonomy
                  </h4>
                  <p className="text-xs text-gov-text-muted font-prompt">
                    วิเคราะห์ระดับพุทธิพิสัย 6 ระดับตามที่ปรากฏในแผนและคลิป
                  </p>
                </div>

                <div className="bg-gov-bg p-4 border border-gov-border">
                  <div className="w-8 h-8 bg-gov-secondary text-white flex items-center justify-center mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gov-text-primary font-prompt mb-1">
                    Tyler&apos;s Model
                  </h4>
                  <p className="text-xs text-gov-text-muted font-prompt">
                    ตรวจสอบความสอดคล้อง วัตถุประสงค์ กิจกรรม และการประเมิน
                  </p>
                </div>

                <div className="bg-gov-bg p-4 border border-gov-border">
                  <div className="w-8 h-8 bg-gov-secondary text-white flex items-center justify-center mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gov-text-primary font-prompt mb-1">
                    AI วิเคราะห์อัตโนมัติ
                  </h4>
                  <p className="text-xs text-gov-text-muted font-prompt">
                    ประมวลผลด้วย Gemini AI รายงานผลภายใน 1-5 นาที
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gov-primary text-white text-sm font-semibold font-prompt hover:bg-gov-primary-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  เข้าสู่ระบบวิเคราะห์
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gov-border p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-gov-success-light border border-gov-success/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gov-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gov-text-primary font-prompt">ปลอดภัย</p>
                <p className="text-xs text-gov-text-muted font-prompt">ข้อมูลไม่ถูกจัดเก็บ ประมวลผลเสร็จลบทันที</p>
              </div>
            </div>
            <div className="bg-white border border-gov-border p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-50 border border-gov-secondary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gov-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gov-text-primary font-prompt">ฟรี ไม่มีค่าใช้จ่าย</p>
                <p className="text-xs text-gov-text-muted font-prompt">ใช้งานได้ 15 ครั้ง/วัน ภายใน Free Tier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

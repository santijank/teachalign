export function buildAnalysisPrompt(lessonPlanText: string): string {
  return `คุณเป็นผู้เชี่ยวชาญด้านการประเมินการสอน กรุณาวิเคราะห์ความสอดคล้องระหว่าง
แผนการสอนและคลิปวิดีโอการสอนที่ให้มา โดยใช้กรอบทฤษฎีดังนี้:

## ทฤษฎีที่ใช้ประเมิน

1. **Bloom's Taxonomy (Revised)** — Anderson & Krathwohl (2001)
   - เปรียบเทียบระดับพุทธิพิสัยที่ระบุในแผน vs ที่เกิดขึ้นจริงในคลิป
   - 6 ระดับ: Remember / Understand / Apply / Analyze / Evaluate / Create

2. **Tyler's Curriculum Model** — Ralph Tyler (1949)
   - ตรวจสอบความสอดคล้องของ: วัตถุประสงค์ → กิจกรรม → การประเมิน
   - "Rational Curriculum" — ทุกส่วนต้องเชื่อมโยงกัน

3. **Backward Design** — Wiggins & McTighe (2005)
   - เป้าหมายปลายทาง → หลักฐานที่ยอมรับได้ → แผนการเรียนรู้

## แผนการสอน (text):
${lessonPlanText}

## ถอดเสียงจากคลิปวิดีโอ (ดูจากวิดีโอแนบ):
[วิเคราะห์จากวิดีโอโดยตรง]

## รูปแบบผลลัพธ์:
ตอบเป็น JSON ตาม schema ด้านล่างเท่านั้น ไม่ต้องมีคำอธิบายนอก JSON
ห้ามใส่ markdown code block (\`\`\`) หรือข้อความใดๆ ก่อนหรือหลัง JSON

{
  "overallScore": <number 0-100>,
  "bloomsAlignment": {
    "planned": ["<Bloom's level ที่ระบุในแผน>"],
    "actual": ["<Bloom's level ที่ปรากฏในคลิป>"],
    "score": <number 0-100>,
    "comment": "<อธิบายเป็นภาษาไทย>"
  },
  "tylerAlignment": {
    "objectives": <number 0-100>,
    "activities": <number 0-100>,
    "assessment": <number 0-100>,
    "comment": "<อธิบายเป็นภาษาไทย>"
  },
  "timeAlignment": {
    "plannedMinutes": <number>,
    "actualMinutes": <number>,
    "score": <number 0-100>
  },
  "strengths": ["<จุดแข็ง เป็นภาษาไทย>"],
  "improvements": ["<ข้อเสนอแนะ เป็นภาษาไทย>"],
  "detailedFeedback": "<ข้อเสนอแนะละเอียด เป็นภาษาไทย>"
}`;
}

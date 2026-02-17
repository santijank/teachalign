export function buildAnalysisPrompt(lessonPlanText: string): string {
  return `คุณเป็นผู้เชี่ยวชาญด้านการประเมินการสอน กรุณาวิเคราะห์ความสอดคล้องระหว่าง
แผนการสอนและคลิปวิดีโอ/เสียงการสอนที่ให้มา โดยใช้กรอบทฤษฎีดังนี้:

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

## คลิปวิดีโอ/เสียงการสอน (ดูจากไฟล์แนบ):
[วิเคราะห์จากไฟล์วิดีโอหรือเสียงโดยตรง]

## ⚠️ คำสั่งสำคัญมากเรื่องเวลา (TIME ANALYSIS):

### วิธีหา actualMinutes:
1. ดู metadata ของไฟล์วิดีโอ/เสียงที่แนบมา เพื่อหา duration (ความยาว) จริง
2. ถ้าไม่สามารถอ่าน metadata ได้ ให้ประมาณจากเนื้อหาที่ดูได้ทั้งหมด
3. คลิปการสอนโดยทั่วไปจะมีความยาว 10-50 นาที (ไม่เกิน 60 นาที)
4. ⛔ ห้ามใส่ค่าเกิน 60 สำหรับ actualMinutes เด็ดขาด ยกเว้นมั่นใจจาก metadata จริงๆ
5. ⛔ ห้ามเอาขนาดไฟล์ (MB) หรือ bitrate มาคำนวณเป็นเวลา

### วิธีหา plannedMinutes:
- อ่านจากแผนการสอนที่ให้มา หาเวลาที่ระบุไว้ (เช่น "50 นาที", "1 ชั่วโมง")
- ถ้าแผนการสอนไม่ได้ระบุเวลา ให้ใส่ 50

### วิธีคำนวณ score:
- ถ้า actualMinutes ใกล้เคียง plannedMinutes = คะแนนสูง (80-100)
- ถ้าต่างกันมาก = คะแนนต่ำ
- สูตร: score = max(0, 100 - abs(actualMinutes - plannedMinutes) * 2)

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
    "plannedMinutes": <number จากแผนการสอน ถ้าไม่ระบุใส่ 50>,
    "actualMinutes": <number ความยาวจริงของวิดีโอ/เสียง ห้ามเกิน 60 ยกเว้นมั่นใจจาก metadata>,
    "score": <number 0-100 คำนวณจากสูตร: max(0, 100 - abs(actual - planned) * 2)>
  },
  "strengths": ["<จุดแข็ง เป็นภาษาไทย>"],
  "improvements": ["<ข้อเสนอแนะ เป็นภาษาไทย>"],
  "detailedFeedback": "<ข้อเสนอแนะละเอียด เป็นภาษาไทย>"
}`;
}

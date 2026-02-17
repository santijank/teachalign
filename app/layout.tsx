import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeachAlign — ระบบวิเคราะห์ความสอดคล้องการสอน",
  description:
    "ระบบวิเคราะห์ความสอดคล้องระหว่างแผนการสอนกับคลิปวิดีโอการสอน โดยใช้ทฤษฎี Bloom's Taxonomy และ Tyler's Model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-prompt antialiased bg-gov-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}

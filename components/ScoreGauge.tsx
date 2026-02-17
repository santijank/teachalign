"use client";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-yellow-500";
  return "stroke-red-500";
}

export default function ScoreGauge({ score, label, size = "sm" }: ScoreGaugeProps) {
  const isLarge = size === "lg";
  const svgSize = isLarge ? 160 : 100;
  const radius = isLarge ? 60 : 38;
  const strokeWidth = isLarge ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="-rotate-90"
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getScoreBg(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${isLarge ? "text-3xl" : "text-xl"} font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <span className={`${isLarge ? "text-base" : "text-sm"} text-gray-600 font-medium text-center`}>
        {label}
      </span>
    </div>
  );
}

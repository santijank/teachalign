// Simple in-memory usage tracker for API calls
// Note: Resets on server restart. For production, use a database.

interface UsageRecord {
  timestamp: number;
  type: "upload" | "analyze";
  videoSizeMB: number;
  durationMs: number;
  success: boolean;
}

interface UsageStats {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalVideoUploadMB: number;
  totalUploadTime: number;
  totalAnalyzeTime: number;
  recentRecords: UsageRecord[];
  serverStartedAt: string;
  estimatedTokensUsed: number;
  estimatedCostUSD: number;
}

const records: UsageRecord[] = [];
const serverStartedAt = new Date().toISOString();

export function trackUsage(record: UsageRecord) {
  records.push(record);
  // Keep last 100 records
  if (records.length > 100) {
    records.shift();
  }
}

export function getUsageStats(): UsageStats {
  const uploads = records.filter((r) => r.type === "upload");
  const analyses = records.filter((r) => r.type === "analyze");
  const successfulAnalyses = analyses.filter((r) => r.success);

  const totalVideoUploadMB = uploads.reduce((sum, r) => sum + r.videoSizeMB, 0);
  const totalUploadTime = uploads.reduce((sum, r) => sum + r.durationMs, 0);
  const totalAnalyzeTime = analyses.reduce((sum, r) => sum + r.durationMs, 0);

  // Estimate tokens used (rough estimate based on video size)
  // Gemini charges ~$0.075 per minute of video for 2.5 Flash
  // Rough estimate: 1MB video ≈ 0.5 minutes ≈ ~1000 tokens
  const estimatedTokensUsed = Math.round(totalVideoUploadMB * 1000);
  // Gemini 2.5 Flash: $0.15/1M input tokens, $0.60/1M output tokens
  const estimatedCostUSD = (estimatedTokensUsed * 0.15) / 1000000 + (successfulAnalyses.length * 2000 * 0.6) / 1000000;

  return {
    totalAnalyses: analyses.length,
    successfulAnalyses: successfulAnalyses.length,
    failedAnalyses: analyses.length - successfulAnalyses.length,
    totalVideoUploadMB: Math.round(totalVideoUploadMB * 10) / 10,
    totalUploadTime: Math.round(totalUploadTime / 1000),
    totalAnalyzeTime: Math.round(totalAnalyzeTime / 1000),
    recentRecords: [...records].reverse().slice(0, 10),
    serverStartedAt,
    estimatedTokensUsed,
    estimatedCostUSD: Math.round(estimatedCostUSD * 10000) / 10000,
  };
}

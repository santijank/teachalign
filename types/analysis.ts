export interface BloomsAlignment {
  planned: string[];
  actual: string[];
  score: number;
  comment: string;
}

export interface TylerAlignment {
  objectives: number;
  activities: number;
  assessment: number;
  comment: string;
}

export interface TimeAlignment {
  plannedMinutes: number;
  actualMinutes: number;
  score: number;
}

export interface AnalysisResult {
  overallScore: number;
  bloomsAlignment: BloomsAlignment;
  tylerAlignment: TylerAlignment;
  timeAlignment: TimeAlignment;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export interface AnalysisRequest {
  driveUrl: string;
  lessonPlanFile: File;
}

export interface ApiResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

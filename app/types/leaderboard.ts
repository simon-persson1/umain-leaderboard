export interface Score {
  id: string;
  name: string;
  score: number;
  createdAt: Date;
}

export interface LeaderboardResponse {
  scores: Score[];
  success: boolean;
}

export interface AddScoreRequest {
  name: string;
  score: number;
}

export interface AddScoreResponse {
  success: boolean;
  message: string;
  score?: Score;
}

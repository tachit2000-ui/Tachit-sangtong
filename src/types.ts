export interface H2HMatch {
  date: string;
  homeScore: number;
  awayScore: number;
  winner: "home" | "away" | "draw";
  competition: string;
}

export interface FormMatch {
  opponent: string;
  score: string;
  isHome: boolean;
  result: "W" | "D" | "L";
}

export interface TeamStats {
  homeAvgGoalsScored: number;
  homeAvgGoalsConceded: number;
  awayAvgGoalsScored: number;
  awayAvgGoalsConceded: number;
  homeCleanSheets: number;
  awayCleanSheets: number;
  homeOver25Pct: number;
  awayOver25Pct: number;
}

export interface Probabilities {
  homeWin: number;
  draw: number;
  awayWin: number;
}

export interface AiAnalysis {
  tactics: string;
  keyPlayers: string;
  verdict: string;
  predictedScore: string;
}

export interface MatchAnalysisResult {
  homeTeam: string;
  awayTeam: string;
  league: string;
  h2h: H2HMatch[];
  homeForm: FormMatch[];
  awayForm: FormMatch[];
  stats: TeamStats;
  probabilities: Probabilities;
  aiAnalysis: AiAnalysis;
  isAiGenerated?: boolean;
  note?: string;
}

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
}

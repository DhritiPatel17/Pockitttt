export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  role: 'Student' | 'Employed' | 'Other';
}

export interface MoneyCheckIn {
  monthlyIncome: number;
  monthlySpend: number;
}

export interface GoalAnalysisPlay {
  title: string;
  category?: string;
  risk: string;
  description: string;
  monthly_investment?: number;
  timeline: string;
  timeframe_label?: string;
  timeline_years?: number;
  interest_rate_pct?: number;
  projected_total_invested?: number;
  projected_returns?: number;
  projected_final_value?: number;
  return_note?: string;
  option_label: string;
  beginner_tip?: string;
  tax_note?: string;
  best_for?: string;
}

export interface GoalAnalysis {
  user_goal_summary?: string;
  plays: GoalAnalysisPlay[];
}

export interface MoneyLingoChapter {
  id: string;
  chapter: number;
  title: string;
  emoji: string;
  description: string;
}

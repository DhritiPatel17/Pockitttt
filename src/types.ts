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

export interface GoalAnalysis {
  yourNumbers: string;
  realityCheck: string;
  yourOptions: string;
  whatThisCouldLookLike: string;
  ifItDoesntFitYet: string;
  disclaimer: string;
}

export interface MoneyLingoChapter {
  id: string;
  chapter: number;
  title: string;
  emoji: string;
  description: string;
}

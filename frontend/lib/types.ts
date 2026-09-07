export interface Habit {
  id: number;
  name: string;
  color: string;
  emoji: string;
  createdAt: string;
  streak: number;
  bestStreak: number;
  alive: boolean;
  checkedToday: boolean;
  nextMilestone: number;
  dates: string[];
}

export interface HeatmapCell {
  date: string;
  count: number;
}

export interface HeatmapData {
  from: string;
  to: string;
  cells: HeatmapCell[];
}

export interface Stats {
  habits: number;
  totalChecks: number;
  streak: number;
  bestStreak: number;
  alive: boolean;
  checkedToday: boolean;
  milestones: number[];
}

export interface Milestone {
  milestone: number;
  message: string;
}

export interface CheckinResponse {
  habit: Habit;
  checkedIn: boolean;
  milestone: Milestone | null;
}
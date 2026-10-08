export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
  };
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  goal_id?: number | null;
  title: string;
  description?: string | null;
  task_date: string;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  duration?: number | null;
  status: 'pending' | 'completed' | 'cancelled';
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodaySummary {
  total: number;
  completed: number;
  pending: number;
  completion_percentage: number;
}

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  consistency_percentage: number;
  total_active_days: number;
}

export interface DashboardData {
  today: TodaySummary;
  streak: StreakSummary;
  today_tasks: Task[];
  active_goals: Goal[];
}

export interface HistorySummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  cancelled_tasks: number;
  total_duration_minutes: number;
}

export interface HistoryResponse {
  summary: HistorySummary;
  tasks: Task[];
}

export interface DailyMetric {
  date: string;
  completed: number;
  pending: number;
  total: number;
  completion_rate: number;
}

export interface CategoryMetric {
  category: string;
  total: number;
  completed: number;
  completion_rate: number;
}

export interface PriorityMetric {
  priority: string;
  total: number;
  completed: number;
  completion_rate: number;
}

export interface AnalyticsData {
  days_analyzed: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overall_completion_rate: number;
  daily_metrics: DailyMetric[];
  category_breakdown: CategoryMetric[];
  priority_breakdown: PriorityMetric[];
  streak: StreakSummary;
}

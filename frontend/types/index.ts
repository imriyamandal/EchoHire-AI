export type PersonaType = 'google' | 'amazon' | 'startup' | 'hr' | string;
export type DifficultyType = 'easy' | 'medium' | 'hard';
export type LanguageType = 'en' | 'hi' | 'hinglish';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_role: string;
  experience_level: string;
  target_company: string;
  interview_type: string;
  preferred_language: string;
  difficulty: string;
  is_onboarded: boolean;
  created_at?: string;
}

export interface PersonaMetadata {
  name: string;
  role: string;
  voice: string;
  description: string;
  avatarBg: string;
  badgeColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  interrupted?: boolean;
  latency_ms?: number;
  timestamp: number;
  speakerName?: string;
  was_pivot?: boolean;
}

export interface InterruptionEvent {
  interruption_id: string;
  timestamp: number;
  ai_phrase: string;
  user_phrase: string;
  stale_tokens_discarded: number;
  cancellation_latency_ms: number;
}

export interface SessionMetrics {
  wpm: number;
  total_words: number;
  total_filler_words: number;
  filler_breakdown: Record<string, number>;
  interruption_count: number;
  avg_latency_ms: number;
  duration_sec?: number;
}

export interface ScoringResult {
  overall_score: number;
  confidence_score: number;
  clarity_score: number;
  technical_score: number;
  star_score: number;
  communication_score?: number;
  wpm: number;
  filler_word_count: number;
  interruption_count: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  target_role?: string;
  target_company?: string;
  persona?: string;
  candidate_name?: string;
}

export interface SessionHistoryItem {
  id: string;
  user_id?: string;
  target_role: string;
  target_company: string;
  interview_type: string;
  difficulty: string;
  language: string;
  status: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  score?: ScoringResult;
}

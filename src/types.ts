export type View = 'dashboard' | 'ai-content' | 'library' | 'audit' | 'settings';
export type ChildView = 'home' | 'calendar' | 'honors' | 'wishlist' | 'profile' | 'vocabulary';
export type Mode = 'parent' | 'child';

export type TaskRecurrence = 'daily' | 'weekly' | 'quick';

export interface Task {
  id: string;
  title: string;
  desc: string; // Used to be description
  reward: number;
  category: string; // Used to be type
  requireAudio: boolean;
  requirePhoto: boolean;
  recurrence: TaskRecurrence;
  active: boolean;
  isQuickIn?: boolean;
  color: string;
  icon: any; // Using any for lucide components
  iconColor: string;
}

export type WordEvaluation = { score: number };
export type SentenceEvaluation = {
  overall: number;
  fluency: number;
  accuracy: number;
  completeness: number;
  words: Record<number, WordEvaluation>;
};

export interface ReadingEvaluationData {
  articleId: string;
  articleTitle: string;
  contentEn: string;
  evaluations: Record<number, SentenceEvaluation>;
}

export interface Submission {
  id: string;
  taskId: string;
  childId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  comment?: string;
  rating?: number;
  photoUrl?: string;
  audioUrl?: string; // If applicable
  readingData?: ReadingEvaluationData;
}

export type NotificationType = 'task_submitted' | 'task_approved' | 'task_rejected' | 'reward_redeemed' | 'new_wish_suggested' | 'wish_approved';

export interface AppNotification {
  id: string;
  recipient: 'child' | 'parent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: any; // Allow for dynamic notification types
  relatedId?: string;
}

export interface ChildProfile {
  id: string;
  nickname: string;
  birthDate: string;
  gender: 'boy' | 'girl' | 'other';
  avatarUrl?: string;
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
  relatedId?: string; // ID of task or reward
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: any;
  image: string;
  category: string;
  desc?: string;
  status: 'available' | 'locked' | 'redeemed';
  stock?: number;
  limitType?: 'none' | 'weekly' | 'monthly';
  limitCount?: number;
}

export interface Article {
  id: string;
  title: string;
  contentEn: string;
  contentZh: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface User {
  id: string;
  name: string;
  account: string;
  password?: string;
  avatar: string;
  role: 'parent' | 'child';
  isAdmin: boolean;
  createdAt: string;
}

export interface InvitationCode {
  code: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  createdBy: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  addedAt: string;
}

export interface SystemSettings {
  isRegistrationOpen: boolean;
  defaultPointsForNewChild: number;
}

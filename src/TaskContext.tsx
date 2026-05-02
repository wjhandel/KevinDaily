import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Task, Submission, AppNotification, ChildProfile, PointTransaction, Reward, User, InvitationCode, SystemSettings, Article, VocabularyWord } from './types';

const PB_URL = import.meta.env.VITE_PB_URL || 'http://localhost:8090';

const getPbToken = () => localStorage.getItem('pb_token');
const getPbUserId = () => localStorage.getItem('pb_user_id');

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
  updateSubmissionStatus: (id: string, status: 'approved' | 'rejected', extraData?: { rating?: number, comment?: string }) => void;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (recipient: 'child' | 'parent') => void;
  childProfile: ChildProfile | null;
  setChildProfile: (profile: ChildProfile | null) => void;
  updateChildProfile: (profile: ChildProfile) => void;
  points: number;
  setPoints: (points: number) => void;
  addPoints: (amount: number, reason?: string, relatedId?: string) => void;
  deductPoints: (amount: number, reason?: string, relatedId?: string) => void;
  pointHistory: PointTransaction[];
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
  addReward: (reward: Reward) => void;
  updateReward: (reward: Reward) => void;
  removeReward: (id: string) => void;

  // Auth & System
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  invitationCodes: InvitationCode[];
  generateInvitationCode: (maxUses: number, expiryDays: number) => string;
  validateInvitationCode: (code: string) => boolean;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  users: User[];
  registerUser: (userData: Omit<User, 'id' | 'isAdmin' | 'createdAt'>, invitationCode?: string) => { success: boolean; error?: string };

  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'publishedAt'>) => void;
  removeArticle: (id: string) => void;

  vocabulary: VocabularyWord[];
  addVocabulary: (word: string) => void;
  removeVocabulary: (id: string) => void;

  weeklyGiftConfig: { min: number; max: number };
  setWeeklyGiftConfig: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;

  badges: any[];
  setBadges: React.Dispatch<React.SetStateAction<any[]>>;
  childBadges: any[];
  setChildBadges: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [weeklyGiftConfig, setWeeklyGiftConfig] = useState({ min: 10, max: 100 });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    isRegistrationOpen: true,
    defaultPointsForNewChild: 100
  });
  const [badges, setBadges] = useState<any[]>([]);
  const [childBadges, setChildBadges] = useState<any[]>([]);

  const pbFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getPbToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${PB_URL}${url}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `Error: ${res.status}` }));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    return res.json();
  }, []);

  const refreshData = useCallback(async () => {
    const token = getPbToken();
    if (!token) return;

    try {
      // Load child profiles for current user
      const userId = getPbUserId();
      const childRes = await pbFetch('/api/collections/child_profiles/records');
      const childItems = (childRes.items || []).filter((c: any) => c.parent === userId || c.user === userId);
      if (childItems.length > 0) {
        const profile = childItems[0];
        setChildProfile({
          id: profile.id,
          nickname: profile.nickname || profile.name || '孩子',
          birthDate: profile.birthDate || '',
          gender: profile.gender || 'boy',
          avatarUrl: profile.avatarUrl || ''
        });
        setPoints(profile.points || 0);

        // Load tasks for this child
        const tasksRes = await pbFetch('/api/collections/tasks/records');
        const childTasks = (tasksRes.items || []).filter((t: any) => t.childId === profile.id || t.parent === userId);
        setTasks(childTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          desc: t.desc || t.description || '',
          reward: t.reward || t.pointValue || 0,
          category: t.category || '任务',
          requireAudio: t.requireAudio || false,
          requirePhoto: t.requirePhoto || false,
          recurrence: t.recurrence || t.limitType || 'daily',
          color: t.color || 'bg-blue-100',
          iconColor: t.iconColor || 'text-blue-600',
          active: t.active !== false,
          isQuickIn: t.isQuickIn || false
        })));

        // Load milestones (submissions)
        const milestonesRes = await pbFetch('/api/collections/milestones/records?sort=-occurredAt');
        const childMilestones = (milestonesRes.items || []).filter((m: any) => m.childId === profile.id);
        setSubmissions(childMilestones.map((m: any) => ({
          id: m.id,
          taskId: m.taskId || m.id,
          childId: m.childId || profile.id,
          status: 'approved' as const,
          submittedAt: m.occurredAt || m.created
        })));

        // Load child_badges
        const childBadgesRes = await pbFetch('/api/collections/child_badges/records');
        const myChildBadges = (childBadgesRes.items || []).filter((cb: any) => cb.childId === profile.id);
        setChildBadges(myChildBadges);
      }

      // Load badges
      const badgesRes = await pbFetch('/api/collections/badges/records');
      setBadges(badgesRes.items || []);

      // Load rewards
      const rewardsRes = await pbFetch('/api/collections/rewards/records');
      setRewards((rewardsRes.items || []).map((r: any) => ({
        id: r.id,
        title: r.title || r.name || '',
        desc: r.desc || r.description || '',
        cost: r.cost || r.pointsCost || 0,
        iconName: r.iconName || 'gift',
        image: r.image || '',
        category: r.category || '奖励',
        status: r.status || 'available',
        stock: r.stock || 999,
        active: r.status !== 'disabled'
      })));

    } catch (error) {
      console.error('Failed to load data from PocketBase:', error);
    }
  }, [pbFetch]);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser?.id, refreshData]);

  const updateChildProfile = async (profile: ChildProfile) => {
    setChildProfile(profile);
    try {
      await pbFetch(`/api/collections/child_profiles/records/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nickname: profile.nickname,
          birthDate: profile.birthDate,
          gender: profile.gender,
          avatarUrl: profile.avatarUrl
        })
      });
    } catch (error) {
      console.error('Failed to update child profile:', error);
    }
  };

  const addPoints = async (amount: number, reason: string = '任务奖励', relatedId?: string) => {
    setPoints(prev => prev + amount);
    setPointHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'earn',
      amount,
      reason,
      timestamp: new Date().toISOString(),
      relatedId
    }, ...prev]);

    // Sync to PocketBase
    if (childProfile) {
      try {
        await pbFetch(`/api/collections/child_profiles/records/${childProfile.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ points: points + amount })
        });
      } catch (error) {
        console.error('Failed to sync points to PocketBase:', error);
      }
    }
  };

  const deductPoints = async (amount: number, reason: string = '兑换奖励', relatedId?: string) => {
    setPoints(prev => Math.max(0, prev - amount));
    setPointHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'spend',
      amount,
      reason,
      timestamp: new Date().toISOString(),
      relatedId
    }, ...prev]);

    // Sync to PocketBase
    if (childProfile) {
      try {
        await pbFetch(`/api/collections/child_profiles/records/${childProfile.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ points: Math.max(0, points - amount) })
        });
      } catch (error) {
        console.error('Failed to sync points to PocketBase:', error);
      }
    }
  };

  const addSubmission = async (submission: Submission) => {
    setSubmissions((prev) => [...prev, submission]);

    // Sync to PocketBase - create milestone
    try {
      await pbFetch('/api/collections/milestones/records', {
        method: 'POST',
        body: JSON.stringify({
          title: submission.taskId,
          childId: submission.childId,
          occurredAt: submission.submittedAt
        })
      });
    } catch (error) {
      console.error('Failed to sync submission to PocketBase:', error);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected', extraData?: { rating?: number, comment?: string }) => {
    setSubmissions((prev) =>
      prev.map(sub => sub.id === id ? { ...sub, status, ...extraData } : sub)
    );
  };

  const generateInvitationCode = (maxUses: number, expiryDays: number) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const newCode: InvitationCode = {
      code,
      expiresAt: expiresAt.toISOString(),
      maxUses,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system'
    };

    setInvitationCodes(prev => [newCode, ...prev]);
    return code;
  };

  const validateInvitationCode = (code: string) => {
    const found = invitationCodes.find(c => c.code === code);
    if (!found) return false;

    const isExpired = new Date(found.expiresAt) < new Date();
    const isMaxed = found.usedCount >= found.maxUses;

    return !isExpired && !isMaxed;
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...settings }));
  };

  const registerUser = (userData: Omit<User, 'id' | 'isAdmin' | 'createdAt'>, invitationCode?: string) => {
    const isFirstUser = users.length === 0;

    if (!isFirstUser && !systemSettings.isRegistrationOpen) {
      return { success: false, error: '注册通道已关闭' };
    }

    if (!isFirstUser && !invitationCode) {
      return { success: false, error: '邀请码不能为空' };
    }

    if (!isFirstUser && invitationCode) {
      if (!validateInvitationCode(invitationCode)) {
        return { success: false, error: '邀请码无效或已过期' };
      }

      setInvitationCodes(prev => prev.map(c =>
        c.code === invitationCode ? { ...c, usedCount: c.usedCount + 1 } : c
      ));
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      isAdmin: isFirstUser,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const addArticle = (article: Omit<Article, 'id' | 'publishedAt'>) => {
    const newArticle: Article = {
      ...article,
      id: Math.random().toString(36).substr(2, 9),
      publishedAt: new Date().toISOString()
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const addVocabulary = (word: string) => {
    if (vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase())) return;
    setVocabulary(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      word,
      addedAt: new Date().toISOString()
    }, ...prev]);
  };

  const removeVocabulary = (id: string) => {
    setVocabulary(prev => prev.filter(v => v.id !== id));
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [{
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (recipient: 'child' | 'parent') => {
    setNotifications(prev => prev.map(n => n.recipient === recipient ? { ...n, read: true } : n));
  };

  const addReward = (reward: Reward) => {
    setRewards(prev => [reward, ...prev]);
  };

  const removeReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const updateReward = (reward: Reward) => {
    setRewards(prev => prev.map(r => r.id === reward.id ? reward : r));
  };

  return (
    <TaskContext.Provider value={{
      tasks, setTasks, submissions, addSubmission, updateSubmissionStatus,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      childProfile, setChildProfile, updateChildProfile, points, setPoints, addPoints, deductPoints, pointHistory,
      rewards, setRewards, addReward, updateReward, removeReward, weeklyGiftConfig, setWeeklyGiftConfig,
      currentUser, setCurrentUser, invitationCodes, generateInvitationCode, validateInvitationCode,
      systemSettings, updateSystemSettings, users, registerUser,
      articles, addArticle, removeArticle,
      vocabulary, addVocabulary, removeVocabulary,
      badges, setBadges, childBadges, setChildBadges,
      refreshData
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

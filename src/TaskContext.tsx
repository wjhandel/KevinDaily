import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Sun, Dumbbell, BookOpen, Languages, GraduationCap, Gamepad2, Pizza, Ticket, Gift, Coffee } from 'lucide-react';
import { Task, Submission, AppNotification, ChildProfile, PointTransaction, Reward, User, InvitationCode, SystemSettings, Article, VocabularyWord } from './types';

const PB_URL = import.meta.env.VITE_PB_URL || 'http://localhost:8090';

const getPbToken = () => localStorage.getItem('pb_token');

const INITIAL_TASKS: Task[] = [
  { id: '1', title: '早起打卡', desc: '早晨7:30前起床并整理床铺。', reward: 10, category: '习惯', requireAudio: false, requirePhoto: true, recurrence: 'daily', color: 'bg-orange-100', icon: Sun, iconColor: 'text-orange-600', active: true, isQuickIn: true },
  { id: '2', title: '跳绳 500 个', desc: '增强体质，提高手脚协调能力。', reward: 25, category: '运动', requireAudio: false, requirePhoto: false, recurrence: 'daily', color: 'bg-purple-100', icon: Dumbbell, iconColor: 'text-purple-600', active: true },
  { id: '3', title: 'Anki 单词复习', desc: '高效复习今日英语生词。', reward: 30, category: '学习', requireAudio: true, requirePhoto: false, recurrence: 'daily', color: 'bg-teal-100', icon: GraduationCap, iconColor: 'text-teal-600', active: false },
  { id: '4', title: '多邻国完成 1 单元', desc: '保持连胜！完成今日语言学习。', reward: 15, category: '学习', requireAudio: true, requirePhoto: false, recurrence: 'weekly', color: 'bg-emerald-100', icon: Languages, iconColor: 'text-emerald-600', active: true },
  { id: '5', title: '每日自主阅读', desc: '阅读课外书籍 20 分钟并记录心得。', reward: 12, category: '学习', requireAudio: true, requirePhoto: true, recurrence: 'quick', color: 'bg-amber-100', icon: BookOpen, iconColor: 'text-amber-600', active: true, isQuickIn: true },
  { id: '6', title: '整理书桌', desc: '保持学习环境整洁，养成好习惯。', reward: 5, category: '习惯', requireAudio: false, requirePhoto: true, recurrence: 'daily', color: 'bg-blue-100', icon: Sun, iconColor: 'text-blue-600', active: true, isQuickIn: true },
  { id: '7', title: '喝足 8 杯水', desc: '保证每日水分摄入，身体棒棒。', reward: 5, category: '习惯', requireAudio: false, requirePhoto: false, recurrence: 'daily', color: 'bg-cyan-100', icon: Sun, iconColor: 'text-cyan-600', active: true, isQuickIn: true },
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'lego_ninja', title: '乐高幻影忍者套装', cost: 1000, icon: Gamepad2, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0ef7?w=300&h=300&fit=crop', status: 'available', category: '玩具' },
  { id: 'pizza_night', title: '全家比萨之夜', cost: 300, icon: Pizza, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop', status: 'available', category: '美食' },
  { id: 'cinema_ticket', title: '周末电影票 2 张', cost: 450, icon: Ticket, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=300&fit=crop', status: 'available', category: '娱乐' },
  { id: 'switch_time', title: 'Switch 加玩 1 小时', cost: 200, icon: Gamepad2, image: 'https://images.unsplash.com/photo-1578303328216-8121f1fb695d?w=300&h=300&fit=crop', status: 'available', category: '时长' },
  { id: 'book_store', title: '书店挑选新书', cost: 500, icon: BookOpen, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=300&fit=crop', status: 'available', category: '教育' },
  { id: 'toy_mall', title: '带你去逛玩具反斗城', cost: 800, icon: Gift, image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?w=300&h=300&fit=crop', status: 'available', category: '玩具' },
];

const INITIAL_CHILD_PROFILE: ChildProfile = {
  id: 'child_1',
  nickname: '豆豆',
  birthDate: '2018-05-20',
  gender: 'boy',
  avatarUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=200&auto=format&fit=crop'
};

const INITIAL_TRANSACTIONS: PointTransaction[] = [
  { id: 't1', type: 'earn', amount: 2000, reason: '初始奖励积分', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 't2', type: 'earn', amount: 450, reason: '上周任务表现卓越', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
];

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
  childProfile: ChildProfile;
  updateChildProfile: (profile: ChildProfile) => void;
  points: number;
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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const INITIAL_SUBMISSIONS: Submission[] = [
  { id: 's1', taskId: '1', childId: 'child_1', status: 'approved', submittedAt: new Date().toISOString() },
  { id: 's2', taskId: '2', childId: 'child_1', status: 'approved', submittedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 's3', taskId: '3', childId: 'child_1', status: 'approved', submittedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [childProfile, setChildProfile] = useState<ChildProfile>(INITIAL_CHILD_PROFILE);
  const [points, setPoints] = useState<number>(2450);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>(INITIAL_TRANSACTIONS);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [weeklyGiftConfig, setWeeklyGiftConfig] = useState({ min: 10, max: 100 });

  // Auth & System State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 'a1',
      title: 'A Day at the Park',
      contentEn: 'Today, my little puppy and I went to the colorful park. He loves running on the green grass and catching butterflies.',
      contentZh: '今天，我和我的小狗去了五彩缤纷的公园。它喜欢在绿草地上奔跑，捕捉蝴蝶。',
      imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
      publishedAt: new Date().toISOString()
    },
    {
      id: 'a2',
      title: 'Never Give Up',
      contentEn: 'Failure is not terrible. Smile when you don’t succeed. Stand up and try once more. Every failure is a new lesson. You grow when you don’t give up. Tomorrow will be better.',
      contentZh: '失败并不可怕。当你不成功时微笑。站起来再试一次。每一次失败都是新的一课。当你不放弃时，你就会成长。明天会更好。',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
      publishedAt: new Date().toISOString()
    }
  ]);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    isRegistrationOpen: true,
    defaultPointsForNewChild: 100
  });

  const loadDataFromPocketBase = async () => {
    const token = getPbToken();
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      // Load child profiles
      const childRes = await fetch(`${PB_URL}/api/collections/child_profiles/records`, { headers });
      if (childRes.ok) {
        const childData = await childRes.json();
        const items = childData.items || [];
        if (items.length > 0) {
          const profile = items[0];
          setChildProfile({
            id: profile.id,
            nickname: profile.nickname || profile.name || '孩子',
            birthDate: profile.birthDate || '',
            gender: profile.gender || 'boy',
            avatarUrl: profile.avatar ? `${PB_URL}/api/files/child_profiles/${profile.id}/${profile.avatar}` : ''
          });
          setPoints(profile.points || 0);
        }
      }

      // Load tasks
      const tasksRes = await fetch(`${PB_URL}/api/collections/tasks/records`, { headers });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        const pbTasks = (tasksData.items || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          desc: t.description || '',
          reward: t.pointValue || 0,
          category: t.category || '任务',
          requireAudio: t.requireAudio || false,
          requirePhoto: t.requirePhoto || false,
          recurrence: t.limitType || 'daily',
          color: t.color || 'bg-blue-100',
          icon: Sun,
          iconColor: t.iconColor || 'text-blue-600',
          active: t.active !== false,
          isQuickIn: t.isQuickIn || false
        }));
        if (pbTasks.length > 0) {
          setTasks(pbTasks);
        }
      }

      // Load milestones (as submissions)
      const milestonesRes = await fetch(`${PB_URL}/api/collections/milestones/records?sort=-occurredAt`, { headers });
      if (milestonesRes.ok) {
        const milestonesData = await milestonesRes.json();
        const pbSubmissions: Submission[] = (milestonesData.items || []).map((m: any) => ({
          id: m.id,
          taskId: m.id,
          childId: m.childId || '',
          status: 'approved' as const,
          submittedAt: m.occurredAt || m.created
        }));
        if (pbSubmissions.length > 0) {
          setSubmissions(pbSubmissions);
        }
      }
    } catch (error) {
      console.error('Failed to load data from PocketBase:', error);
    }
  };

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadDataFromPocketBase();
    }
  }, [currentUser?.id]);

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

  const addPoints = (amount: number, reason: string = '任务奖励', relatedId?: string) => {
    setPoints(prev => prev + amount);
    setPointHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'earn',
      amount,
      reason,
      timestamp: new Date().toISOString(),
      relatedId
    }, ...prev]);
  };

  const deductPoints = (amount: number, reason: string = '兑换奖励', relatedId?: string) => {
    setPoints(prev => Math.max(0, prev - amount));
    setPointHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'spend',
      amount,
      reason,
      timestamp: new Date().toISOString(),
      relatedId
    }, ...prev]);
  };

  const updateChildProfile = (profile: ChildProfile) => {
    setChildProfile(profile);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [{
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }, ...prev]);
  };

  const addSubmission = (submission: Submission) => {
    setSubmissions((prev) => [...prev, submission]);
  };

  const updateSubmissionStatus = (id: string, status: 'approved' | 'rejected', extraData?: { rating?: number, comment?: string }) => {
    setSubmissions((prev) => 
      prev.map(sub => sub.id === id ? { ...sub, status, ...extraData } : sub)
    );
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
      childProfile, updateChildProfile, points, addPoints, deductPoints, pointHistory,
      rewards, setRewards, addReward, updateReward, removeReward, weeklyGiftConfig, setWeeklyGiftConfig,
      currentUser, setCurrentUser, invitationCodes, generateInvitationCode, validateInvitationCode,
      systemSettings, updateSystemSettings, users, registerUser,
      articles, addArticle, removeArticle,
      vocabulary, addVocabulary, removeVocabulary
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


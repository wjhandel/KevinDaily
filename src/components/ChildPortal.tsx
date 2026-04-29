import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Trophy,
  Gamepad2,
  BookOpen,
  Palette,
  Trash2,
  Volume2,
  Rocket,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  Home,
  Calendar,
  Award,
  Heart,
  User as UserIcon,
  ChevronRight,
  Flame,
  Medal,
  Gift,
  CircleDollarSign,
  Receipt,
  CreditCard,
  Mail,
  Lock,
  PartyPopper,
  Sparkles,
  Send,
  Play,
  Check,
  X,
  Plus,
  Activity,
  Brain,
  TreePine,
  BedDouble,
  Bell,
  LogOut,
  Dumbbell,
  Calculator,
  GraduationCap,
  CheckCircle,
  Brush,
  Upload,
} from 'lucide-react';
import { useTasks } from '../TaskContext';
import { ChildView } from '../types';
import { apiUpload } from '../lib/api';
import ReadingRecorder from './ReadingRecorder';

const getAvatarUrl = (avatarUrl?: string, nickname?: string, childProfileId?: string): string => {
  if (!avatarUrl) {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${nickname || 'Felix'}&backgroundColor=b6e3f4`;
  }
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  // Use localhost for PocketBase file URLs (works with Vite proxy in dev)
  return `http://127.0.0.1:8090/api/files/child_profiles/${childProfileId}/${avatarUrl}`;
};

export default function ChildPortal() {
  const [activeTab, setActiveTab ] = useState<ChildView>('home');
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [bonusNotification, setBonusNotification] = useState<any>(null);
  const [deductionNotification, setDeductionNotification] = useState<any>(null);
  const [activeTaskProcessing, setActiveTaskProcessing] = useState<any>(null);
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isRedemptionsModalOpen, setIsRedemptionsModalOpen] = useState(false);
  const [isNewWishModalOpen, setIsNewWishModalOpen] = useState(false);
  const [newWishTitle, setNewWishTitle] = useState('');
  const [newWishCost, setNewWishCost] = useState('');
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [openingGift, setOpeningGift] = useState(false);
  const [giftReward, setGiftReward] = useState<number | null>(null);
  const [claimedGiftThisWeek, setClaimedGiftThisWeek] = useState(false);
  const [isQuickCheckInOpen, setIsQuickCheckInOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [redeemingItem, setRedeemingItem] = useState<any>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryWishId, setPrimaryWishId] = useState<string | null>(null);
  const { 
    tasks: globalTasks, 
    submissions, 
    addSubmission, 
    addNotification, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    childProfile, 
    updateChildProfile,
    points,
    deductPoints,
    pointHistory,
    rewards,
    weeklyGiftConfig,
    addPoints,
    addReward,
    suggestWish,
    requestRedemption,
    updateReward,
    logout,
    vocabulary,
    removeVocabulary,
    childProfileId,
    earnedBadgeCount,
    badges,
    childBadges,
    milestones,
    generateMilestones,
  } = useTasks();

  useEffect(() => {
    if (childProfileId) {
      generateMilestones();
    }
  }, [childProfileId, childBadges.length, submissions.length]);

  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Flame, BookOpen, Trophy, Calculator, Dumbbell, Home, Brush, GraduationCap, CheckCircle, Award, Star, Activity
    };
    return icons[iconName] || Star;
  };

  const earnedBadgeIds = new Set(childBadges.map(cb => cb.badge));

  React.useEffect(() => {
    if (!childProfile) return;
    const bonusNotif = notifications.find(n =>
      n.recipient === 'child' &&
      (n.type === 'system' || n.type === 'bonus') && !n.read &&
      (n.title.includes('红包') || n.title.includes('惊喜礼物'))
    );
    if (bonusNotif) {
      setBonusNotification(bonusNotif);
    }
  }, [notifications, childProfile]);

  React.useEffect(() => {
    if (!childProfile) return;
    const dedNotif = notifications.find(n =>
      n.recipient === 'child' &&
      n.type === 'deduction' && !n.read
    );
    if (dedNotif) {
      setDeductionNotification(dedNotif);
    }
  }, [notifications, childProfile]);

  if (!childProfile) return null;

  const getRedemptionsCount = (rewardId: string, limitType: 'weekly' | 'monthly') => {
    const now = new Date();
    let startTime = new Date(now);
    
    if (limitType === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startTime.setDate(diff);
    } else {
      startTime.setDate(1);
    }
    startTime.setHours(0, 0, 0, 0);

    return pointHistory.filter(t => 
      t.type === 'spend' && 
      t.relatedId === rewardId && 
      new Date(t.timestamp) >= startTime
    ).length;
  };

  const calculateStreak = () => {
    if (submissions.length === 0) return 0;

    // Get unique dates of submissions (local time)
    const submissionDates = new Set(
      submissions.map(s => {
        const date = new Date(s.submittedAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    );

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    // If no submission today and no submission yesterday, streak is broken
    if (!submissionDates.has(todayStr) && !submissionDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    // Start counting from today if there's a submission today, otherwise start from yesterday
    let checkDate = new Date();
    if (!submissionDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    let checkDateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;

    while (submissionDates.has(checkDateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const childNotifications = notifications.filter(n => n.recipient === 'child');
  const unreadCount = childNotifications.filter(n => !n.read).length;

  const getWeeklyProgress = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekProgress = [];
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        const hasSubmission = submissions.some(s => {
          const sDate = new Date(s.submittedAt);
          const sDateStr = `${sDate.getFullYear()}-${sDate.getMonth() + 1}-${sDate.getDate()}`;
          return sDateStr === dateStr && s.status === 'approved';
        });

        const isToday = today.toDateString() === date.toDateString();
        const isPast = date < today && !isToday;

        weekProgress.push({
            day: days[i],
            dateStr,
            completed: hasSubmission,
            isToday,
            isPast
        });
    }
    return weekProgress;
  };

  const weekProgress = getWeeklyProgress();
  const completedCount = weekProgress.filter(d => d.completed).length;
  const isWeeklyGoalMet = completedCount === 7;

  const handleOpenGift = () => {
    if (!isWeeklyGoalMet || claimedGiftThisWeek) return;
    
    setOpeningGift(true);
    const amount = Math.floor(Math.random() * (weeklyGiftConfig.max - weeklyGiftConfig.min + 1)) + weeklyGiftConfig.min;
    
    setTimeout(() => {
      setGiftReward(amount);
      addPoints(amount, '本周达标大礼包');
      setClaimedGiftThisWeek(true);
      setOpeningGift(false);
    }, 2000);
  };

  const handleTaskStart = (task: any) => {
    if (task.requireAudio) {
      setRecordingTaskId(task.id);
    } else if (task.requirePhoto) {
      setActiveTaskProcessing(task);
      setUploadedPhotoUrl(null);
    } else {
      submitTask(task);
    }
  };

  const submitTask = (task: any, photoUrl?: string, readingData?: any) => {
    const submissionId = Math.random().toString(36).substr(2, 9);
    addSubmission({
      id: submissionId,
      taskId: task.id,
      childId: childProfileId || 'unknown',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      photoUrl: photoUrl,
      readingData: readingData
    });

    addNotification({
      recipient: 'parent',
      type: 'task_submitted',
      title: '有新的任务待审核',
      message: `${childProfile.nickname} 提交了任务：${task.title}`,
      relatedId: submissionId
    });
    
    setActiveTaskProcessing(null);
    setUploadedPhotoUrl(null);
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: '首页' },
    { id: 'calendar', icon: Calendar, label: '日历' },
    { id: 'honors', icon: Award, label: '荣誉墙' },
    { id: 'wishlist', icon: Heart, label: '心愿单' },
    { id: 'profile', icon: UserIcon, label: '我的' },
  ];

  const topReward = rewards.find(r => r.id === primaryWishId) || rewards[0];
  const goalPoints = topReward?.cost || 1000;
  const progressPercent = Math.min(100, (points / goalPoints) * 100);

  const startLongPress = () => {
    const timer = setTimeout(() => {
      setIsSettingPrimary(true);
    }, 800);
    setLongPressTimer(timer);
  };

  const endLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renderHome = () => (
    <div className="space-y-4 pb-24 pt-4">
      {/* Profile Info & Stars */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-100 border-2 border-white shadow-sm">
            <img
              src={getAvatarUrl(childProfile.avatarUrl, childProfile.nickname, childProfileId)}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-stone-800 tracking-tight">
              {childProfile.nickname}
            </h1>
            <p className="text-stone-500 font-bold text-sm mt-1">Lv. 5 探索者</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
            <Star size={20} className="text-orange-500 fill-current" />
            <span className="font-display font-black text-xl ml-2 text-orange-600">{points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Streak and Progress Stats */}
      <section className="flex gap-4">
        <div className="flex-1 bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm border border-stone-100 relative overflow-hidden group hover:border-orange-200 transition-all">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <Flame size={36} className="text-orange-500 fill-current mb-2 relative z-10" />
          <p className="font-bold text-stone-500 text-xs relative z-10">连续打卡</p>
          <p className="font-display font-black text-3xl text-stone-800 mt-1 relative z-10">{currentStreak} <span className="text-base">天</span></p>
        </div>
        <div className="flex-1 bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm border border-stone-100 relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          <Medal size={36} className="text-purple-500 fill-current mb-2 relative z-10" />
          <p className="font-bold text-stone-500 text-xs relative z-10">获得奖章</p>
          <p className="font-display font-black text-3xl text-stone-800 mt-1 relative z-10">{earnedBadgeCount} <span className="text-base">个</span></p>
        </div>
      </section>

      {/* Primary Wish Goal */}
      <section 
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={endLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 relative overflow-hidden mt-4 cursor-pointer touch-none select-none hover:border-purple-200 transition-colors"
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-display font-black text-xl text-stone-800 mb-1">当前心愿进度</h2>
            <p className="font-bold text-stone-500 text-sm">向着"{topReward?.title || '目标'}"前进！</p>
          </div>
          <Gift size={32} className="text-purple-500 fill-current" />
        </div>
        <div className="relative w-full h-5 bg-stone-100 rounded-full overflow-hidden mt-6 border border-stone-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" 
          ></motion.div>
        </div>
        <div className="flex justify-between items-center mt-3 font-bold text-xs text-stone-400">
          <span>{Math.round(progressPercent)}% 完成</span>
          <span>{points >= goalPoints ? '已抵达目标！' : `距离目标还有 ${goalPoints - points} 分`}</span>
        </div>
        <div className="absolute top-2 right-2 text-[8px] font-black text-purple-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
          长按设置目标
        </div>
      </section>

      {/* Set Primary Wish Modal */}
      <AnimatePresence>
        {isSettingPrimary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight mb-1">设置头号心愿</h3>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">选择你最想实现的那个愿望</p>
                </div>
                <button 
                  onClick={() => setIsSettingPrimary(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 no-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {rewards.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPrimaryWishId(item.id);
                        setIsSettingPrimary(false);
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                        primaryWishId === item.id || (!primaryWishId && rewards[0]?.id === item.id)
                          ? 'bg-purple-50 border-purple-400 shadow-md' 
                          : 'bg-stone-50 border-transparent hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-stone-800 font-display text-sm">{item.title}</h4>
                          <span className="text-[10px] font-bold text-stone-400">{item.cost} 积分</span>
                        </div>
                      </div>
                      {primaryWishId === item.id && <Check size={18} className="text-purple-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Mission */}
      <section className="mt-4">
        <h2 className="font-display font-black text-xl text-stone-800 mb-4 px-2">今日任务</h2>
        <div className="flex flex-col gap-4">
          {globalTasks
            .filter(t => {
              if (!t.active) return false;
              if (t.recurrence !== 'quick') return true;
              const todayStr = new Date().toLocaleDateString();
              return submissions.some(s =>
                s.taskId === t.id &&
                new Date(s.submittedAt).toLocaleDateString() === todayStr
              );
            })
            .map(task => {
              const todayStr = new Date().toLocaleDateString();
              const submission = submissions.find(s =>
                s.taskId === task.id &&
                new Date(s.submittedAt).toLocaleDateString() === todayStr
              );
              return { task, submission };
            })
            .sort((a, b) => {
              const aDone = a.submission?.status === 'approved' ? 1 : 0;
              const bDone = b.submission?.status === 'approved' ? 1 : 0;
              if (aDone !== bDone) return aDone - bDone;
              return (a.task.recurrence === 'weekly' ? 1 : 0) - (b.task.recurrence === 'weekly' ? 1 : 0);
            })
            .map(({ task, submission }) => {
              const isCompleted = submission?.status === 'approved';
              const isPending = submission?.status === 'pending';
              const isRejected = submission?.status === 'rejected';

              return (
              <div key={task.id} className={`bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border ${isCompleted ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-100 hover:border-orange-200'} transition-colors ${isCompleted ? '' : 'cursor-pointer group'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${task.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <task.icon size={20} className={task.iconColor} />
                </div>
                <div>
                  <h3 className={`font-display font-black text-lg ${isCompleted ? 'text-emerald-600' : 'text-stone-800'}`}>{task.title}</h3>
                  <p className="font-bold text-xs mt-1">
                    {isCompleted ? '太棒了！已完成' : isRejected ? '需改进，请重做' : `${task.reward} 积分奖励`}
                  </p>
                </div>
              </div>
              {isCompleted ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} className="text-emerald-500 fill-current" />
                </div>
              ) : isPending ? (
                <button disabled className="bg-stone-100 text-stone-400 font-black py-2.5 px-6 rounded-full shadow-sm text-sm shrink-0 cursor-not-allowed">
                  待审核
                </button>
              ) : isRejected ? (
                <button onClick={() => handleTaskStart(task)} className="bg-rose-500 hover:bg-rose-600 text-white font-black py-2.5 px-6 rounded-full shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-sm shrink-0">
                  重做
                </button>
              ) : (
                <button onClick={() => handleTaskStart(task)} className="bg-amber-700 hover:bg-amber-800 text-white font-black py-2.5 px-6 rounded-full shadow-lg shadow-amber-700/20 active:scale-95 transition-all text-sm shrink-0">
                  开始
                </button>
              )}
            </div>
            );
          })}
          {globalTasks.filter(t => t.active && t.recurrence !== 'quick').length === 0 &&
            globalTasks.filter(t => t.active && t.recurrence === 'quick').every(t => {
              const todayStr = new Date().toLocaleDateString();
              return !submissions.some(s =>
                s.taskId === t.id &&
                new Date(s.submittedAt).toLocaleDateString() === todayStr
              );
            }) && (
            <div className="text-center py-8 bg-white rounded-2xl border border-stone-100 border-dashed">
              <p className="text-stone-400 font-bold text-sm">今天没有安排任务哦，好好休息吧！</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-2 mb-2">
        <motion.div
          onClick={() => setIsQuickCheckInOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-orange-400 to-orange-600 p-5 rounded-[2rem] shadow-xl shadow-orange-500/20 relative overflow-hidden group cursor-pointer"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-white font-display font-black text-lg leading-tight">点击进行快速打卡</h3>
              <p className="text-orange-100 font-bold text-[10px]">开始你的夺星计划！✨</p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
              <Plus size={24} />
            </div>
          </div>
          <Rocket size={60} className="absolute -bottom-4 -right-4 text-white/10 rotate-12 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
        </motion.div>
      </section>

      {/* Quick Check-in Modal */}
      <AnimatePresence>
        {isQuickCheckInOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight mb-1">快速打卡</h3>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">选择任务，立即记录成长</p>
                </div>
                <button 
                  onClick={() => setIsQuickCheckInOpen(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 no-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {globalTasks.filter(t => t.active && t.recurrence === 'quick').map(task => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todaySubmissions = submissions.filter(s =>
                      s.taskId === task.id &&
                      new Date(s.submittedAt).toISOString().split('T')[0] === todayStr
                    );
                    const completedToday = todaySubmissions.filter(s => s.status === 'approved').length;
                    const pendingToday = todaySubmissions.filter(s => s.status === 'pending').length;

                    let remaining = null;
                    let limitReason = '';
                    let isLimited = false;
                    if (task.limitType === 'daily' && task.limitCount) {
                      remaining = Math.max(0, task.limitCount - completedToday);
                      isLimited = remaining <= 0;
                      if (isLimited) limitReason = `今日已达${task.limitCount}次上限`;
                    } else if (task.limitType === 'weekly' && task.limitCount) {
                      const weekStart = new Date();
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
                      weekStart.setHours(0, 0, 0, 0);
                      const weekSubmissions = submissions.filter(s =>
                        s.taskId === task.id &&
                        new Date(s.submittedAt) >= weekStart &&
                        s.status === 'approved'
                      );
                      remaining = Math.max(0, task.limitCount - weekSubmissions.length);
                      isLimited = remaining <= 0;
                      if (isLimited) limitReason = `本周已达${task.limitCount}次上限`;
                    }

                    const isDisabled = pendingToday > 0 || isLimited;

                    return (
                      <button
                        key={task.id}
                        onClick={() => !isDisabled && setSelectedTaskId(task.id)}
                        disabled={isDisabled}
                        className={`flex items-center justify-between p-5 rounded-3xl transition-all border-2 ${
                          selectedTaskId === task.id
                            ? 'bg-orange-50 border-orange-400 shadow-lg shadow-orange-500/5'
                            : isDisabled
                              ? 'bg-stone-50 border-transparent opacity-50'
                              : 'bg-stone-50 border-transparent hover:bg-stone-100 hover:border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${task.color} flex items-center justify-center`}>
                            <task.icon size={24} className={task.iconColor} />
                          </div>
                          <div className="text-left">
                            <h4 className={`font-black font-display ${isDisabled ? 'text-stone-400' : 'text-stone-800'}`}>{task.title}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                pendingToday > 0 ? 'bg-yellow-100 text-yellow-600' : 
                                isLimited ? 'bg-stone-100 text-stone-400' :
                                'bg-orange-100 text-orange-500'
                              }`}>
                                {pendingToday > 0 ? '待审核' : isLimited ? '已达上限' : `+${task.reward} 积分`}
                              </span>
                              {limitReason && (
                                <span className="text-[10px] font-bold text-stone-400">
                                  {limitReason}
                                </span>
                              )}
                              {!isDisabled && remaining !== null && (
                                <span className="text-[10px] font-bold text-stone-400">
                                  剩余 {remaining} {task.limitType === 'daily' ? '次/天' : '次/周'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isDisabled && (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            selectedTaskId === task.id ? 'bg-orange-500 border-orange-500' : 'border-stone-200'
                          }`}>
                            {selectedTaskId === task.id && <Check size={14} className="text-white" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-8 bg-stone-50 border-t border-stone-100">
                <button
                  disabled={!selectedTaskId || isSubmittingQuick}
                  onClick={() => {
                    if (!selectedTaskId) return;
                    setIsSubmittingQuick(true);
                    const task = globalTasks.find(t => t.id === selectedTaskId);
                    if (task) {
                      addSubmission({
                        id: Math.random().toString(36).substr(2, 9),
                        taskId: selectedTaskId,
                        childId: childProfileId || 'unknown',
                        status: 'pending',
                        submittedAt: new Date().toISOString(),
                        comment: '快速打卡'
                      });
                      addNotification({
                        recipient: 'parent',
                        type: 'task_submitted',
                        title: '新任务待审核',
                        message: `${childProfile.nickname} 提交了【${task.title}】的打卡`,
                        relatedId: selectedTaskId
                      });
                    }
                    setIsSubmittingQuick(false);
                    setIsQuickCheckInOpen(false);
                    setSelectedTaskId(null);
                  }}
                  className={`w-full py-5 rounded-full font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    selectedTaskId && !isSubmittingQuick
                      ? 'bg-orange-500 text-white shadow-orange-500/20 hover:brightness-110'
                      : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed'
                  }`}
                >
                  {isSubmittingQuick ? '提交中...' : '提交打卡'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderCalendar = () => {
    // Avoid mutating today
    const todayObj = new Date();
    const day = todayObj.getDay();
    const diff = todayObj.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(todayObj);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyStars = pointHistory
      .filter(t => t.type === 'earn' && new Date(t.timestamp) >= startOfWeek)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const getDailyPoints = () => {
      const weekDays = ['一', '二' , '三', '四', '五', '六', '日'];
      const dailyPoints = new Array(7).fill(0);
      
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + i);
        
        const dateStr = targetDate.toLocaleDateString();

        dailyPoints[i] = pointHistory
          .filter(t => t.type === 'earn' && new Date(t.timestamp).toLocaleDateString() === dateStr)
          .reduce((acc, curr) => acc + curr.amount, 0);
      }
      
      return weekDays.map((day, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return {
          day,
          points: dailyPoints[i],
          date: d.getDate(),
          fullDate: d,
          isToday: todayObj.toLocaleDateString() === d.toLocaleDateString(),
          isSelected: selectedDate.toLocaleDateString() === d.toLocaleDateString(),
          isUpcoming: d > todayObj && todayObj.toLocaleDateString() !== d.toLocaleDateString()
        };
      });
    };

    const getMonthPoints = () => {
      const year = todayObj.getFullYear();
      const month = todayObj.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const daysInMonth = lastDay.getDate();
      const result = [];
      
      const firstDayIdx = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
      for (let i = 0; i < firstDayIdx; i++) {
        result.push({ date: null, points: 0, isToday: false, isSelected: false, isUpcoming: false, fullDate: null });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const targetDate = new Date(year, month, i);
        const dateStr = targetDate.toLocaleDateString();

        const points = pointHistory
          .filter(t => t.type === 'earn' && new Date(t.timestamp).toLocaleDateString() === dateStr)
          .reduce((acc, curr) => acc + curr.amount, 0);

        result.push({
          date: i,
          points,
          fullDate: targetDate,
          isToday: todayObj.toLocaleDateString() === targetDate.toLocaleDateString(),
          isSelected: selectedDate.toLocaleDateString() === targetDate.toLocaleDateString(),
          isUpcoming: targetDate > todayObj && todayObj.toLocaleDateString() !== targetDate.toLocaleDateString()
        });
      }
      return result;
    };

    const weekData = getDailyPoints();
    const monthData = getMonthPoints();

    // Tasks for selected date
    const getTasksForSelectedDate = () => {
      const taskList = globalTasks.filter(t => t.active).map(task => {
        const submission = submissions.find(s => {
          const subDate = new Date(s.submittedAt);
          return s.taskId === task.id && subDate.toLocaleDateString() === selectedDate.toLocaleDateString();
        });
        return { task, submission };
      });

      return taskList.sort((a, b) => {
        const aDone = a.submission?.status === 'approved' ? 1 : 0;
        const bDone = b.submission?.status === 'approved' ? 1 : 0;
        return aDone - bDone;
      });
    };

    const selectedTasks = getTasksForSelectedDate();

    return (
      <div className="space-y-10 pb-16">
        {/* Hero Section / Encouraging Header */}
        <section className="relative mt-2">
          <div className="bg-purple-100/50 rounded-[2rem] p-8 overflow-hidden relative border-2 border-dashed border-purple-200 shadow-sm">
            <h2 className="text-3xl font-display font-black text-purple-900 mb-2 leading-tight">继续加油，{childProfile.nickname || '小探索者'}！</h2>
            <p className="text-purple-800/80 font-bold text-sm">本周你已获得 {weeklyStars} 颗星星，准备好迎接更多挑战了吗？</p>
            <div className="absolute -right-4 -top-4 opacity-20">
              <Rocket size={120} className="text-purple-600 fill-current -rotate-45" />
            </div>
          </div>
        </section>

      {/* Calendar Switcher */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <h3 className="text-xl font-display font-black text-stone-800">成长历程</h3>
            <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-wider">
              {selectedDate.toLocaleDateString() === todayObj.toLocaleDateString() ? '今天' : selectedDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex bg-stone-100 rounded-full p-1 shadow-inner border border-stone-200/50">
            <button 
              onClick={() => setCalendarView('week')}
              className={`px-5 py-1.5 rounded-full text-sm font-black transition-all ${calendarView === 'week' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              周
            </button>
            <button 
              onClick={() => setCalendarView('month')}
              className={`px-5 py-1.5 rounded-full text-sm font-black transition-all ${calendarView === 'month' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              月
            </button>
          </div>
        </div>

        {calendarView === 'week' ? (
          /* Grid Week - Show all 7 days with better fitting */
          <div className="grid grid-cols-7 gap-1">
            {weekData.map((dayInfo, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedDate(dayInfo.fullDate)}
                className={`flex flex-col items-center gap-2 transition-opacity ${dayInfo.isUpcoming ? 'opacity-30' : 'opacity-100'}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${dayInfo.isSelected ? 'text-orange-600' : 'text-stone-400'}`}>
                  {dayInfo.day}
                </span>
                {dayInfo.points > 0 ? (
                  <div className={`w-full aspect-[2/3] rounded-full flex flex-col items-center justify-center shadow-lg ring-2 transition-all ${
                    dayInfo.isSelected ? 'ring-primary' : 'ring-white'
                  } ${idx % 2 === 0 ? 'bg-orange-500 shadow-orange-500/30' : 'bg-purple-500 shadow-purple-500/30'}`}>
                    <span className="text-base font-display font-black text-white">{dayInfo.date}</span>
                    <Star size={10} className="text-white fill-current" />
                  </div>
                ) : (
                  <div className={`w-full aspect-[2/3] rounded-full flex flex-col items-center justify-center transition-all ${
                    dayInfo.isSelected ? 'bg-white border-2 border-orange-600 shadow-md shadow-orange-600/10' : 'bg-stone-50 border border-stone-200'
                  }`}>
                    <span className={`text-base font-display font-black ${dayInfo.isSelected ? 'text-orange-600' : 'text-stone-400'}`}>{dayInfo.date}</span>
                    {dayInfo.isToday && <div className="w-1 h-1 rounded-full bg-orange-600"></div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Month Grid View */
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
            <div className="grid grid-cols-7 gap-y-6 gap-x-2">
              {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-stone-300 uppercase">{d}</div>
              ))}
              {monthData.map((dayInfo, idx) => (
                <button 
                  key={idx} 
                  onClick={() => dayInfo.fullDate && setSelectedDate(dayInfo.fullDate)}
                  disabled={!dayInfo.fullDate}
                  className="flex flex-col items-center gap-1"
                >
                  {dayInfo.date ? (
                    <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      dayInfo.isSelected 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-primary ring-offset-2' 
                        : dayInfo.points > 0
                          ? 'bg-purple-100 text-purple-700'
                          : dayInfo.isToday
                            ? 'bg-stone-50 text-stone-800 border-2 border-stone-200'
                            : 'text-stone-500 hover:bg-stone-50'
                    } ${dayInfo.isUpcoming ? 'opacity-30' : ''}`}>
                      {dayInfo.date}
                      {dayInfo.points > 0 && !dayInfo.isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10"></div>
                  )}
                  {dayInfo.points > 0 && (
                    <span className="text-[10px] font-black text-stone-400">+{dayInfo.points}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Tasks List */}
      <section className="space-y-6">
        <h3 className="text-xl font-display font-black text-stone-800 px-2">
          {selectedDate.toLocaleDateString() === new Date().toLocaleDateString() ? '今日任务' : '历史轨迹'}
        </h3>
        
        <div className="flex flex-col gap-4">
          {selectedTasks.map(({ task, submission }) => {
            const isCompleted = submission?.status === 'approved';
            const isPending = submission?.status === 'pending';
            const isRejected = submission?.status === 'rejected';

            return (
              <div 
                key={task.id} 
                className={`relative bg-white rounded-3xl p-6 shadow-sm border border-stone-100 overflow-hidden transition-all ${
                  isCompleted ? 'opacity-60' : 'hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${task.color} flex items-center justify-center shrink-0`}>
                    <task.icon size={28} className={task.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-display font-black text-stone-800 ${isCompleted ? 'line-through decoration-stone-400 decoration-2' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs font-bold text-stone-500 mt-1">{task.desc}</p>
                  </div>
                  {isCompleted ? (
                    <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/20">
                      <Check size={24} />
                    </div>
                  ) : isPending ? (
                    <div className="bg-stone-100 text-stone-400 px-4 py-2 rounded-full text-xs font-black">
                      审核中
                    </div>
                  ) : (selectedDate.toLocaleDateString() === new Date().toLocaleDateString()) ? (
                    <button 
                      onClick={() => handleTaskStart(task)}
                      className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                      去挑战
                    </button>
                  ) : (
                    <div className="text-stone-300 text-xs font-bold">未完成</div>
                  )}
                </div>
              </div>
            );
          })}
          {selectedTasks.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-bold text-sm">这天没有安排任务哦~</p>
            </div>
          )}
        </div>
      </section>

      
    </div>
    );
  };

  const renderHonors = () => {
    const totalBadges = badges.length;
    const unlockedCount = childBadges.length;

    const displayMilestones = milestones.length > 0 ? milestones : [];

    return (
      <div className="space-y-10 pb-16 -mx-4 lg:-mx-8">
        {/* Level & XP Hero */}
        <section className="relative px-6 pt-12 pb-24 overflow-hidden rounded-b-[4rem] bg-stone-900 border-b-8 border-stone-800">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Rank Visual */}
            <div className="relative mb-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2"
              >
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)] border-2 border-white">
                  < Star size={24} className="text-white fill-current" />
                </div>
              </motion.div>
              <div className="w-28 h-28 rounded-full border-4 border-yellow-400 p-1 bg-white ring-8 ring-white/10 shadow-2xl">
                <img
                  src={getAvatarUrl(childProfile.avatarUrl, childProfile.nickname, childProfileId)}
                  alt="Avatar"
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-stone-900 font-display font-black px-4 py-1 rounded-full text-sm shadow-xl border-2 border-white">
                LV.12
              </div>
            </div>

            <h2 className="text-white text-2xl font-display font-black mb-1 tracking-tight">星际探索者</h2>
            <div className="flex items-center gap-2 text-stone-400 text-xs font-black uppercase tracking-widest mb-6">
               <Sparkles size={14} className="text-yellow-400" />
               <span>升级进度 75%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-3 bg-stone-800 rounded-full overflow-hidden p-0.5 ring-2 ring-stone-700 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              />
            </div>
          </div>
        </section>

        {/* Badges Grid */}
        <section className="px-6 -mt-16 relative z-20">
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-stone-300/40 border border-stone-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black text-stone-800 flex items-center gap-2">
                <Medal className="text-orange-500" />
                成就勋章
              </h3>
              <div className="px-3 py-1 bg-stone-100 rounded-full">
                <span className="text-stone-500 text-[10px] font-black">已习得 {unlockedCount}/{totalBadges}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-10 gap-x-6">
              {badges.filter(b => b.isActive).map((badge, idx) => {
                const isUnlocked = earnedBadgeIds.has(badge.id);
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`relative w-16 h-16 rounded-[1.5rem] ${isUnlocked ? badge.color : 'bg-stone-100'} flex items-center justify-center transition-all duration-500 ${isUnlocked ? 'shadow-lg shadow-current/20 rotate-3 group-hover:rotate-0 group-hover:scale-110' : 'grayscale border-2 border-stone-100'}`}>
                    <IconComponent size={28} className={`${isUnlocked ? 'text-white' : 'text-stone-300'}`} />
                    {!isUnlocked && <Lock size={12} className="absolute inset-0 m-auto text-stone-400" />}
                    {isUnlocked && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-stone-50">
                        <Check size={14} className="text-emerald-500" strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`text-[11px] font-black uppercase tracking-tight block ${isUnlocked ? 'text-stone-800' : 'text-stone-400'}`}>
                      {badge.name}
                    </span>
                    <span className="text-[9px] font-medium text-stone-400 leading-none">
                      {isUnlocked ? '已解锁' : '未达成'}
                    </span>
                  </div>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>

        {/* Highlight Showcase */}
        <section className="px-6">
          <h2 className="font-display font-black text-2xl flex items-center gap-2 text-stone-800 mb-6">
            <Play className="text-stone-800 fill-current" />
            高光记分牌
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 p-2">
              <div className="relative h-32 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=300&h=300&fit=crop" alt="Peppa Pig style" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-orange-600 fill-current ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-3 pb-1">
                <h3 className="font-bold text-sm text-stone-800">《小猪佩奇》</h3>
                <p className="text-[10px] text-stone-500 mt-1">配音评分：9.8分</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 p-2 relative">
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Star size={10} className="fill-current" />
                家长精选
              </div>
              <div className="relative h-32 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop" alt="Oxford Reading Tree" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-orange-600 fill-current ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-3 pb-1">
                <h3 className="font-bold text-sm text-stone-800">《牛津树》</h3>
                <p className="text-[10px] text-stone-500 mt-1">累计获赞：128</p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones Timeline */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-display font-black text-stone-800 flex items-center gap-2">
              <Rocket className="text-indigo-500" />
              成长里程碑
            </h3>
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
              <ChevronRight size={18} className="text-stone-400" />
            </div>
          </div>
          
          <div className="relative ml-8 space-y-8 pb-10">
            {/* Trail */}
            <div className="absolute left-[3px] top-6 bottom-6 w-[3px] bg-stone-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ height: 0 }}
                 whileInView={{ height: '100%' }}
                 viewport={{ once: true }}
                 transition={{ duration: 1 }}
                 className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent"
               />
            </div>
            
            {displayMilestones.map((m, idx) => {
              const MilestoneIcon = getBadgeIcon(m.icon);
              const dateStr = m.occurredAt ? new Date(m.occurredAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.') : '';
              return (
              <motion.div
                key={m.id || idx}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-10"
              >
                {/* Connector Node */}
                <div className={`absolute left-[-5px] top-2 w-5 h-5 bg-white rounded-full border-4 ${idx === 0 ? 'border-indigo-500 shadow-lg shadow-indigo-500/30' : 'border-stone-200'} z-10`} />

                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <MilestoneIcon size={22} className={m.color} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{dateStr}</span>
                      <h4 className="text-base font-display font-black text-stone-800 mt-1 leading-tight">{m.title}</h4>
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </section>

        {/* Action Call to Action */}
        <section className="px-6 mb-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
            <div className="relative z-10">
              <h4 className="text-white text-xl font-display font-black mb-2">准备好迎接新挑战了吗？</h4>
              <p className="text-indigo-100 text-sm mb-6">完成今天的任务，赢取更多勋章和星星！</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="bg-white text-indigo-600 font-black px-8 py-4 rounded-full shadow-lg active:scale-95 transition-all text-sm"
              >
                立即开始
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderWishlist = () => {
    const handleConfirmRedeem = () => {
      if (!redeemingItem) return;
      
      const item = rewards.find(r => r.id === redeemingItem.id);
      if (!item) return;

      // Double check constraints
      if (item.stock === 0) {
        alert('抱歉，这个奖品已经卖光了哦！');
        setRedeemingItem(null);
        return;
      }

      if (item.limitType && item.limitType !== 'none') {
        const count = getRedemptionsCount(item.id, item.limitType);
        if (count >= (item.limitCount || 1)) {
          alert(`抱歉，这个奖品在${item.limitType === 'weekly' ? '本周' : '本月'}已达到兑换上限了哦！`);
          setRedeemingItem(null);
          return;
        }
      }

      // 通过自定义路由：预扣积分 + status=redeeming + 通知家长审核
      requestRedemption(item.id);
      setRedeemingItem(null);
      alert('兑换申请已提交！等爸爸妈妈确认后就可以领取啦～🎉');
    };

    const handleRedeemClick = (item: any) => {
      if (points < item.cost) {
        alert('星星还不够哦，继续完成任务攒星星吧！');
        return;
      }

      if (item.stock === 0) {
        alert('抱歉，这个奖品已经卖光了哦！');
        return;
      }

      if (item.limitType && item.limitType !== 'none') {
        const count = getRedemptionsCount(item.id, item.limitType);
        if (count >= (item.limitCount || 1)) {
          alert(`抱歉，这个奖品在${item.limitType === 'weekly' ? '本周' : '本月'}已达到兑换上限了哦！`);
          return;
        }
      }

      setRedeemingItem(item);
    };

    return (
      <div className="space-y-10 pb-24">
        {/* Hero Section */}
        <div className="mt-2">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[3rem] p-10 pt-12 pb-14 relative overflow-hidden shadow-2xl shadow-purple-200">
            {/* Background Decorations */}
            <motion.div 
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                y: [0, -10, 0, 10, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none"
            >
              <Sparkles size={280} className="text-white fill-current" />
            </motion.div>
            
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-100">Magic Wishlist</span>
                  </div>
                </div>
                <h2 className="text-5xl font-display font-black mb-3 tracking-tight">我的愿望清单</h2>
                <p className="text-purple-100 font-bold text-base opacity-90 max-w-sm leading-relaxed">
                  存满星星，就能召唤心愿礼包哦！✨ 每个梦想都值得被星光照亮。
                </p>
                
                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => setIsNewWishModalOpen(true)}
                    className="bg-white text-indigo-600 shadow-lg px-8 py-4 rounded-2xl flex items-center gap-3 font-black hover:scale-105 active:scale-95 transition-all text-sm group"
                  >
                    <Plus size={22} className="text-indigo-500 group-hover:rotate-90 transition-transform duration-300" />
                    <span>投递新愿望</span>
                  </button>
                  <div className="h-14 w-px bg-white/20"></div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} className="w-full h-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-inner min-w-[140px]">
                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 transform -rotate-3">
                  <Star size={36} className="text-white fill-current" />
                </div>
                <div className="text-center">
                  <span className="text-white font-display font-black text-3xl tracking-tighter block">{points.toLocaleString()}</span>
                  <span className="text-purple-200 text-[10px] font-black uppercase tracking-widest mt-1 block">我的星资产</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 px-2">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-black text-stone-800 flex items-center gap-3">
                 <Gift className="text-orange-500" />
                 可兑换的宝藏
              </h3>
              <div className="px-4 py-1.5 bg-orange-100 rounded-full">
                 <span className="text-orange-700 text-xs font-black">
                    {rewards.filter(r => r.status === 'available' && points >= r.cost).length} 个可用
                 </span>
              </div>
           </div>

           <div className="grid gap-8">
             {rewards.filter(r => r.status === 'available').map((item, idx) => {
               const isRedeemable = points >= item.cost;
               const progress = Math.min(100, Math.round((points / item.cost) * 100));
               const diff = Math.max(0, item.cost - points);

               return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-white rounded-[2.5rem] p-6 relative overflow-visible border-2 transition-all group ${
                      isRedeemable 
                        ? 'border-orange-400 shadow-xl shadow-orange-500/10' 
                        : 'border-stone-100 shadow-sm opacity-90'
                    }`}
                  >
                    {isRedeemable && (points < item.cost + 50) && ( // Just show it if recently unlocked or similar
                      <div className="absolute -top-4 -left-4 bg-orange-500 text-white px-5 py-2 rounded-full text-[10px] font-black shadow-lg tracking-[0.2em] uppercase z-10 animate-bounce">
                        Ready!
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-32 h-32 rounded-3xl bg-stone-50 overflow-hidden shrink-0 relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isRedeemable ? 'grayscale' : ''}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                           <span className="text-[9px] text-white font-black uppercase text-center block whitespace-nowrap">{item.category}</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                            <h4 className="text-xl font-display font-black text-stone-800 leading-tight">{item.title}</h4>
                            <p className="text-[11px] text-stone-400 font-bold mt-1.5 leading-relaxed line-clamp-2">{item.desc || '爸爸妈妈为你准备的神秘密礼。'}</p>
                           </div>
                           {!isRedeemable && (
                              <div className="px-3 py-1 bg-stone-100 rounded-full shrink-0">
                                <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">还差 {diff} 🌟</span>
                              </div>
                           )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-orange-500 font-black text-sm">
                                <Star size={16} className="fill-current" />
                                <span>{points.toLocaleString()}</span>
                            </div>
                            <span className="text-stone-300 font-black text-sm">/</span>
                            <span className="text-stone-400 font-black text-sm">{item.cost.toLocaleString()} 星星</span>
                           </div>
                           <div className="flex gap-2">
                              {item.stock !== undefined && item.stock !== -1 && (
                                <span className="text-[9px] font-black text-indigo-500/60 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                  剩 {item.stock} 件
                                </span>
                              )}
                              {item.limitType && item.limitType !== 'none' && (
                                <span className="text-[9px] font-black text-purple-500/60 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                  {item.limitType === 'weekly' ? '本周' : '本月'}还剩 {Math.max(0, (item.limitCount || 1) - getRedemptionsCount(item.id, item.limitType))} 次
                                </span>
                              )}
                           </div>
                        </div>

                        <div className="space-y-4">
                          <div className="relative h-6 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/50 p-1">
                             <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${progress}%` }}
                               viewport={{ once: true }}
                               className={`h-full rounded-full transition-all ${
                                 isRedeemable 
                                   ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                                   : 'bg-stone-300'
                               }`}
                             />
                             <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-stone-500 pointer-events-none uppercase tracking-widest">
                               {progress}% {isRedeemable ? 'Unlocked' : ''}
                             </span>
                          </div>

                          <button 
                            onClick={() => handleRedeemClick(item)}
                            className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                              isRedeemable 
                                ? 'bg-orange-500 text-white shadow-orange-500/20 hover:brightness-110' 
                                : 'bg-stone-100 text-stone-400 shadow-none cursor-not-allowed'
                            }`}
                          >
                            {isRedeemable ? (
                               <>
                                 <PartyPopper size={18} />
                                 <span>立刻兑换！</span>
                               </>
                            ) : (
                               <>
                                 <Lock size={16} />
                                 <span>星星不足</span>
                               </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
               );
             })}
           </div>

           {/* Redeem Confirmation Modal */}
           <AnimatePresence>
             {redeemingItem && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6"
               >
                 <motion.div 
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 20 }}
                   className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl"
                 >
                   <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Gift size={40} className="text-orange-500" />
                   </div>
                   <h3 className="text-2xl font-black text-stone-800 font-display mb-2">确认兑换心愿吗？</h3>
                   <p className="text-stone-500 font-bold mb-8">
                     你将使用 <span className="text-orange-600 font-black">{redeemingItem.cost}</span> 颗星星来兑换<br/>
                     <span className="text-stone-800">"{redeemingItem.title}"</span>
                   </p>
                   <div className="flex flex-col gap-3">
                     <button 
                       onClick={handleConfirmRedeem}
                       className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                     >
                       没错！我也想要！
                     </button>
                     <button 
                       onClick={() => setRedeemingItem(null)}
                       className="w-full py-4 text-stone-400 font-black text-xs hover:text-stone-600 transition-colors"
                     >
                       再考虑一下
                     </button>
                   </div>
                 </motion.div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>
      </div>
    );
  };

  {/* New Wish Modal */}
  const renderNewWishModal = () => (
    <AnimatePresence>
      {isNewWishModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight mb-1">投递新愿望</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">让爸爸妈妈看到你的星动时刻</p>
              </div>
              <button 
                onClick={() => setIsNewWishModalOpen(false)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">我想要...</label>
                <input 
                  type="text" 
                  placeholder="比如：去游乐园玩、买一辆平衡车"
                  value={newWishTitle}
                  onChange={(e) => setNewWishTitle(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-indigo-400 rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">我觉得它值多少星星？</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="500"
                    value={newWishCost}
                    onChange={(e) => setNewWishCost(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-indigo-400 rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                  />
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!newWishTitle) return;
                  setIsSubmittingWish(true);
                  
                  // 通过自定义路由：创建 rewards 记录 + 通知家长
                  // 路由会原子地创建 rewards(suggestedBy='child', status='pending') + new_wish_suggested 通知
                  suggestWish(newWishTitle, parseInt(newWishCost) || 0, {
                    category: '心愿',
                  });
                  
                  setIsSubmittingWish(false);
                  setIsNewWishModalOpen(false);
                  setNewWishTitle('');
                  setNewWishCost('');
                  alert('投递成功！愿望已飞向爸爸妈妈的信箱啦～🚀');
                }}
                disabled={!newWishTitle || isSubmittingWish}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
              >
                {isSubmittingWish ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send size={20} />
                    <span>立即投递</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Hero Header: Lv.12 Knowledge Knight */}
      <section className="relative bg-white rounded-[2rem] p-6 flex flex-col items-center overflow-hidden shadow-sm border border-stone-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full -mr-12 -mt-12"></div>
        <div className="relative mb-4">
          <button onClick={() => setShowAvatarPicker(true)} className="block relative">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-400 animate-pulse">
              <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  src={getAvatarUrl(childProfile.avatarUrl, childProfile.nickname, childProfileId)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-lg whitespace-nowrap z-10 uppercase">
              知识骑士
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 rounded-full">
              <span className="text-white text-xs font-bold">点击修改</span>
            </div>
          </button>
        </div>
        <h1 className="font-display text-2xl font-black text-stone-800 mb-2 mt-2">{childProfile.nickname || '皮皮'}</h1>
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs font-black text-stone-400 mb-2 uppercase tracking-widest">
            <span>经验值 850</span>
            <span>1000</span>
          </div>
          <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            ></motion.div>
          </div>
        </div>
      </section>

      {/* Asset Dashboard */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center shadow-sm border border-stone-100 relative overflow-hidden group">
          <Star size={32} className="text-orange-500 fill-current mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-display font-black text-stone-800">{points.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-stone-500">星星总数</span>
        </div>
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center shadow-sm border border-stone-100 relative overflow-hidden group">
          <Flame size={32} className="text-red-500 fill-current mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-display font-black text-stone-800">{currentStreak} 天</span>
          <span className="text-[10px] font-bold text-stone-500">连续签到</span>
        </div>
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center shadow-sm border border-stone-100 relative overflow-hidden group">
          <Medal size={32} className="text-purple-500 fill-current mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-display font-black text-stone-800">8 枚</span>
          <span className="text-[10px] font-bold text-stone-500">荣誉勋章</span>
        </div>
      </section>

      {/* Progress Map */}
      <section className="bg-cyan-50 p-6 rounded-[2rem] relative overflow-hidden border border-cyan-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-black text-cyan-800 text-lg">本周进度</h2>
          <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-cyan-800 bg-white">
            {isWeeklyGoalMet 
              ? (claimedGiftThisWeek ? '本周奖励已领取！' : '大礼包已准备好！') 
              : `再过 ${7 - completedCount} 天开启礼包!`}
          </span>
        </div>
        <div className="flex justify-between items-end">
          {weekProgress.slice(0, 6).map((dayData, idx) => (
            <div key={idx} className={`flex flex-col items-center gap-2 ${!dayData.completed && !dayData.isToday ? 'opacity-40' : ''}`}>
              <div className={`w-10 h-10 ${dayData.completed ? 'bg-white' : (dayData.isToday ? 'bg-white/80 border-2 border-cyan-500' : 'bg-white/50')} rounded-full flex items-center justify-center shadow-sm relative`}>
                {dayData.completed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Star size={20} className="text-orange-500 fill-current" />
                  </motion.div>
                )}
                {!dayData.completed && dayData.isToday && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                )}
              </div>
              <span className={`text-[10px] font-bold ${dayData.isToday ? 'text-cyan-700' : (dayData.completed ? 'text-cyan-800/60' : 'text-cyan-800')}`}>
                {dayData.day}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <motion.button 
              onClick={handleOpenGift}
              disabled={!isWeeklyGoalMet || claimedGiftThisWeek}
              whileHover={isWeeklyGoalMet && !claimedGiftThisWeek ? { scale: 1.1, rotate: [-2, 2, -2] } : {}}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all relative ${
                isWeeklyGoalMet 
                  ? (claimedGiftThisWeek ? 'bg-stone-100 border-stone-200 opacity-60' : 'bg-gradient-to-br from-purple-400 to-indigo-500 border-2 border-white shadow-purple-200 cursor-pointer') 
                  : 'bg-purple-100/80 border-2 border-dashed border-purple-400 opacity-60'
              }`}
            >
              <Gift size={24} className={isWeeklyGoalMet && !claimedGiftThisWeek ? 'text-white' : 'text-purple-500'} />
              {isWeeklyGoalMet && !claimedGiftThisWeek && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                ></motion.div>
              )}
            </motion.button>
            <span className="text-[10px] font-bold text-cyan-800">日</span>
          </div>
        </div>
      </section>

      {/* Digital Archive */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border-b-4 border-orange-100 flex flex-col gap-2 relative overflow-hidden group hover:bg-orange-50 transition-colors">
          <Palette size={32} className="text-orange-500 mb-2" />
          <h3 className="font-display font-black text-lg text-stone-800">我的作品</h3>
          <p className="text-xs text-stone-500 font-bold">12 个已保存</p>
          <Palette size={80} className="absolute -right-4 -bottom-4 text-orange-500/10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-45" />
        </div>
        <div 
          onClick={() => setActiveTab('vocabulary')}
          className="bg-white p-5 rounded-3xl shadow-sm border-b-4 border-purple-100 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-purple-50 transition-colors"
        >
          <BookOpen size={32} className="text-purple-600 mb-2" />
          <h3 className="font-display font-black text-lg text-stone-800">生词本</h3>
          <p className="text-xs text-stone-500 font-bold">{vocabulary.length} 个单词</p>
          <BookOpen size={80} className="absolute -right-4 -bottom-4 text-purple-600/10 -rotate-12 transition-transform group-hover:scale-110 group-hover:-rotate-45" />
        </div>
      </section>

      {/* Utility List */}
      <section className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-100">
        <div className="p-5 border-b border-stone-100">
          <h3 className="font-display font-black text-stone-800">我的工具</h3>
        </div>
        <div className="divide-y divide-stone-50">
          {[
            { icon: CircleDollarSign, color: 'text-amber-500', bg: 'bg-amber-100', label: '积分记录', desc: '查看明细', onClick: () => setIsPointsModalOpen(true) },
            { icon: Receipt, color: 'text-teal-500', bg: 'bg-teal-100', label: '兑换记录', desc: '查看详情', onClick: () => setIsRedemptionsModalOpen(true) },
            { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-100', label: '补签卡仓库', desc: '1 张可用', onClick: () => {} },
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} className="flex items-center justify-between p-5 hover:bg-stone-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <span className="font-bold text-stone-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-400 font-bold">{item.desc}</span>
                <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parental Message */}
      <section className="bg-emerald-100/50 p-6 rounded-[2rem] relative border border-emerald-100 overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer">
        <div className="absolute -top-4 -left-2 bg-emerald-300/30 w-16 h-16 rounded-full blur-xl"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-emerald-100 flex items-center justify-center">
            <UserIcon size={24} className="text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="font-bold text-emerald-900 leading-relaxed text-sm">
              "宝贝，爸爸为你每天坚持读英语感到非常自豪！继续加油哦！"
            </p>
            <p className="text-emerald-700 font-display font-black text-xs">—— 爱你的爸爸</p>
          </div>
        </div>
        <Heart size={48} className="absolute bottom-2 right-4 text-emerald-500/10 rotate-12 fill-current" />
      </section>
    </div>
  );

  const renderVocabulary = () => {
    return (
      <div className="space-y-6 pb-24 pt-4 px-2">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div>
            <h1 className="font-display font-black text-3xl text-stone-800 flex items-center gap-2">
              <BookOpen className="text-purple-500" size={28} />
              生词本
            </h1>
            <p className="font-bold text-stone-500 text-sm mt-1">共收藏了 {vocabulary.length} 个单词</p>
          </div>
        </div>

        {vocabulary.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-stone-100 border-dashed">
            <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-bold">生词本空空如也，在英语阅读中添加吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {vocabulary.map((vocab) => (
              <div key={vocab.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100 relative group overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-black text-stone-800 mb-2 leading-tight break-all pr-2">{vocab.word}</h3>
                  </div>
                </div>
                <div className="flex gap-2 justify-between mt-4">
                  <button 
                    onClick={() => {
                        const u = new SpeechSynthesisUtterance(vocab.word);
                        u.lang = 'en-US';
                        window.speechSynthesis.speak(u);
                    }}
                    className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                  >
                    <Volume2 size={18} />
                  </button>
                  <button 
                    onClick={() => removeVocabulary(vocab.id)}
                    className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                    title="移除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'calendar': return renderCalendar();
      case 'honors': return renderHonors();
      case 'wishlist': return renderWishlist();
      case 'profile': return renderProfile();
      case 'vocabulary': return renderVocabulary();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-full pb-32">
      <AnimatePresence>
        {bonusNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-red-400 to-orange-500 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  markNotificationRead(bonusNotification.id);
                  setBonusNotification(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
              <div className="text-6xl mb-4">🧧</div>
              <h3 className="font-display font-black text-2xl text-white mb-2">惊喜红包</h3>
              <p className="text-white/90 text-sm mb-6">{bonusNotification.message}</p>
              <button
                onClick={() => {
                  markNotificationRead(bonusNotification.id);
                  setBonusNotification(null);
                }}
                className="bg-white text-red-500 font-black px-8 py-3 rounded-full shadow-lg hover:bg-red-50 transition-colors"
              >
                收下祝福
              </button>
            </motion.div>
          </motion.div>
        )}
        {deductionNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-red-100 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  markNotificationRead(deductionNotification.id);
                  setDeductionNotification(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📉</span>
              </div>
              <h3 className="font-display font-black text-2xl text-stone-800 mb-2">积分扣除</h3>
              <p className="text-stone-600 text-sm mb-2">{deductionNotification.message}</p>
              <button
                onClick={() => {
                  markNotificationRead(deductionNotification.id);
                  setDeductionNotification(null);
                }}
                className="bg-stone-800 text-white font-black px-8 py-3 rounded-full shadow-lg hover:bg-stone-900 transition-colors mt-4"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
        {activeTaskProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-black text-2xl text-stone-800">完成任务：{activeTaskProcessing.title}</h3>
                <button onClick={() => setActiveTaskProcessing(null)} className="p-2 text-stone-400 hover:text-stone-600">
                  <Check size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="font-bold text-stone-500 text-sm">此任务需要上传一张打卡照片哦！</p>
                
                <div 
                  onClick={() => setUploadedPhotoUrl("https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=600&auto=format&fit=crop")}
                  className="w-full aspect-video bg-stone-100 rounded-[2rem] border-4 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-stone-50 group transition-colors overflow-hidden"
                >
                  {uploadedPhotoUrl ? (
                    <img src={uploadedPhotoUrl} alt="Uploaded" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <Palette size={32} />
                      </div>
                      <p className="font-black text-stone-400 text-center px-4">点击拍照或从相册选择</p>
                    </>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTaskProcessing(null)}
                    className="flex-1 py-4 bg-stone-100 text-stone-500 font-black rounded-2xl"
                  >
                    取消
                  </button>
                  <button 
                    disabled={!uploadedPhotoUrl}
                    onClick={() => submitTask(activeTaskProcessing, uploadedPhotoUrl!)}
                    className={`flex-1 py-4 font-black rounded-2xl shadow-lg transition-all ${uploadedPhotoUrl ? 'bg-orange-500 text-white shadow-orange-500/20 active:scale-95' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                  >
                    提交审核
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openingGift && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-xl z-[200] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto border-4 border-white/20">
                  <Gift size={64} className="text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-black text-white font-display mb-2">正在召唤超级奖励...</h3>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {giftReward !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      scale: 0, 
                      x: 100, 
                      y: 100,
                      opacity: 1
                    }}
                    animate={{ 
                      scale: [0, 1.2, 0],
                      x: 100 + (Math.random() - 0.5) * 300,
                      y: 100 + (Math.random() - 0.5) * 300,
                      opacity: [1, 1, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: Math.random() * 0.5,
                      repeat: Infinity
                    }}
                    className="absolute"
                    style={{ left: '25%', top: '25%' }}
                  >
                    <Sparkles size={24} className="text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
              
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Star size={48} className="text-yellow-500 fill-current" />
              </div>
              
              <h3 className="text-3xl font-black text-stone-800 font-display mb-2">恭喜获得奖励！</h3>
              <p className="text-stone-500 font-bold mb-8 italic">"你的努力被星空刻下了印记"</p>
              
              <div className="bg-stone-50 rounded-3xl p-6 mb-8 border border-stone-100">
                <span className="text-stone-400 text-xs font-black uppercase tracking-widest block mb-1">获得经验/星星</span>
                <span className="text-5xl font-display font-black text-indigo-600">+{giftReward}</span>
              </div>
              
              <button 
                onClick={() => setGiftReward(null)}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-sm"
              >
                收下奖励，继续前进
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRedemptionsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-500">
                    <Receipt size={24} />
                  </div>
                  <h3 className="font-display font-black text-xl text-stone-800">兑换记录</h3>
                </div>
                <button 
                  onClick={() => setIsRedemptionsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 no-scrollbar">
                {pointHistory.filter(h => h.type === 'spend').length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <Gift size={32} className="text-stone-400" />
                    </div>
                    <p className="text-stone-400 font-bold">还没有兑换记录哦～<br/>快去完成任务赚星星吧！</p>
                  </div>
                ) : (
                  pointHistory
                    .filter(h => h.type === 'spend')
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 bg-opacity-50 rounded-xl flex items-center justify-center text-teal-600">
                          <Gift size={24} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-black text-stone-800 text-sm">{item.reason}</p>
                          <p className="text-[10px] text-stone-400 font-bold italic">
                          {new Date(item.timestamp).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-black text-lg text-stone-400">
                          -{item.amount}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">已申请</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 pt-4 bg-stone-50 border-t border-stone-100 text-center">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mb-2">兑换成功后请找爸爸妈妈发放奖励哦</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPointsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500">
                    <CircleDollarSign size={24} />
                  </div>
                  <h3 className="font-display font-black text-xl text-stone-800">积分明细</h3>
                </div>
                <button 
                  onClick={() => setIsPointsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-3 no-scrollbar">
                {pointHistory.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-stone-400 font-bold">还没有积分变动哦～</p>
                  </div>
                ) : (
                  pointHistory
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.reason.includes('红包') && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded-full">惊喜红包</span>
                          )}
                          <p className="font-bold text-stone-800 text-sm">{item.reason}</p>
                        </div>
                        <p className="text-[10px] text-stone-400 font-bold italic">
                          {new Date(item.timestamp).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className={`font-display font-black text-lg ${item.type === 'earn' ? 'text-orange-500' : 'text-stone-400'}`}>
                        {item.type === 'earn' ? '+' : '-'}{item.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 pt-4 bg-stone-50 border-t border-stone-100">
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200">
                  <span className="font-black text-stone-400 text-xs uppercase tracking-widest">当前余额</span>
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-orange-500 fill-current" />
                    <span className="text-2xl font-display font-black text-orange-600">{points.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Child Footer Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white rounded-t-[3rem] shadow-[0_-4px_20px_rgba(135,78,0,0.08)] z-50">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ChildView)}
              className={`flex flex-col items-center justify-center transition-all duration-200 ease-out ${
                isActive 
                  ? 'bg-orange-100 text-orange-700 rounded-full px-5 py-2 scale-110 shadow-sm' 
                  : 'text-stone-400 p-2 hover:bg-stone-50 rounded-full scale-90'
              }`}
            >
              <item.icon 
                size={24} 
                className={`mb-1 ${isActive ? 'fill-current' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="text-[12px] font-display font-semibold tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>


      {renderNewWishModal()}

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight">修改头像</h3>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-200 shadow-lg mb-4 bg-stone-100">
                    {isUploadingAvatar ? (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <img
                        src={getAvatarUrl(childProfile.avatarUrl, childProfile.nickname, childProfileId)}
                        alt="Current Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith('image/')) {
                      alert('请选择图片文件');
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      alert('图片大小不能超过 5MB');
                      return;
                    }

                    setIsUploadingAvatar(true);
                    try {
                      const formData = new FormData();
                      formData.append('avatar', file);

                      const token = localStorage.getItem('pb_token');
                      // Use relative path so Vite proxy handles it
                      const res = await fetch(`/api/collections/child_profiles/records/${childProfileId}`, {
                        method: 'PATCH',
                        headers: {
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: formData,
                      });

                      if (res.ok) {
                        const data = await res.json();
                        const filename = data.avatar;
                        if (filename) {
                          const avatarUrl = `${pbUrl}/api/files/child_profiles/${childProfileId}/${filename}`;
                          updateChildProfile({ ...childProfile, avatarUrl });
                          setShowAvatarPicker(false);
                          alert('头像上传成功！');
                        } else {
                          throw new Error('No avatar returned');
                        }
                      } else {
                        throw new Error('Upload failed');
                      }
                    } catch (err) {
                      console.error('Avatar upload error:', err);
                      alert('上传失败，请重试');
                    } finally {
                      setIsUploadingAvatar(false);
                    }
                  }}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      上传新头像
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-stone-400">支持 JPG、PNG、GIF 格式，最大 5MB</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recordingTaskId && (
          <ReadingRecorder 
            onClose={() => setRecordingTaskId(null)}
            onComplete={(readingData) => {
              const task = globalTasks.find(t => t.id === recordingTaskId);
              if (task) submitTask(task, undefined, readingData);
              setRecordingTaskId(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

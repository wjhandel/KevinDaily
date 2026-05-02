import React from 'react';
import {
  Rocket,
  Star,
  ClipboardList,
  CheckCircle2,
  Trophy,
  TrendingUp,
  BookOpen,
  Dumbbell,
  Brush,
  Gift,
  Send,
  Brain,
  Plus,
  CalendarDays,
  Flame,
  MinusCircle,
  X,
  Camera,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '../TaskContext';
import { View, DeductionItem } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { tasks, submissions, points, addPoints, deductPoints, addNotification, childProfile, deductionItems = [], applyDeduction, pointHistory } = useTasks();

  const [rewardAmount, setRewardAmount] = React.useState<string>('');
  const [rewardNote, setRewardNote] = React.useState<string>('');
  const [heatmapView, setHeatmapView] = React.useState<'week' | 'month' | 'quarter'>('month');
  const [selectedDeduction, setSelectedDeduction] = React.useState<DeductionItem | null>(null);
  const [deductionDate, setDeductionDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [deductionNote, setDeductionNote] = React.useState('');
  const [deductionPhoto, setDeductionPhoto] = React.useState<string | null>(null);

  if (!childProfile) return null;

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const getWeeklyStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weeklyStart = new Date(now);
    weeklyStart.setDate(diff);
    weeklyStart.setHours(0, 0, 0, 0);
    return weeklyStart;
  };

  const getDeductionCount = (item: DeductionItem, type: 'daily' | 'weekly') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = type === 'weekly' ? getWeeklyStart() : today;

    return pointHistory.filter(t =>
      t.reason.includes(`扣分：${item.title}`) &&
      new Date(t.timestamp) >= start
    ).length;
  };

  const getRemainingCount = (item: DeductionItem) => {
    const dailyCount = item.dailyLimit ? getDeductionCount(item, 'daily') : 0;
    const weeklyCount = item.weeklyLimit ? getDeductionCount(item, 'weekly') : 0;
    return { daily: item.dailyLimit ? item.dailyLimit - dailyCount : null, weekly: item.weeklyLimit ? item.weeklyLimit - weeklyCount : null };
  };

  const isDeductionAllowed = (item: DeductionItem) => {
    const remaining = getRemainingCount(item);
    if (remaining.daily !== null && remaining.daily <= 0) return false;
    if (remaining.weekly !== null && remaining.weekly <= 0) return false;
    return true;
  };

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  const totalDays = new Set(
    approvedSubmissions.map(s => getDateString(new Date(s.submittedAt)))
  ).size;

  const calculateConsecutiveDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const approvedDates = new Set(
      approvedSubmissions.map(s => getDateString(new Date(s.submittedAt)))
    );

    let consecutive = 0;
    let checkDate = new Date(today);

    while (approvedDates.has(getDateString(checkDate)) ||
           (consecutive === 0 && approvedDates.has(getDateString(new Date(checkDate.getTime() - 86400000))))) {
      const dateStr = getDateString(checkDate);
      if (approvedDates.has(dateStr)) {
        consecutive++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else if (consecutive === 0) {
        checkDate = new Date(checkDate.getTime() - 86400000);
        if (approvedDates.has(getDateString(checkDate))) {
          consecutive++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return consecutive;
  };

  const consecutiveDays = calculateConsecutiveDays();

  const firstRecordDate = approvedSubmissions.length > 0
    ? new Date(Math.min(...approvedSubmissions.map(s => new Date(s.submittedAt).getTime())))
    : null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.active && (t.recurrence === 'daily' || t.recurrence === 'quick'));
  const todayCompleted = todayTasks.filter(t =>
    submissions.some(s => s.taskId === t.id && s.status === 'approved' && getDateString(new Date(s.submittedAt)) === todayStr)
  ).length;
  const todayProgress = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

  const getHeatmapData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToShow = heatmapView === 'week' ? 7 : heatmapView === 'month' ? 30 : 90;
    const submissionsMap = new Map<string, number>();

    approvedSubmissions.forEach(s => {
      const dateStr = getDateString(new Date(s.submittedAt));
      submissionsMap.set(dateStr, (submissionsMap.get(dateStr) || 0) + 1);
    });

    const maxCount = Math.max(...Array.from(submissionsMap.values()), 1);
    const data: number[] = [];
    const monthLabels: string[] = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      const count = submissionsMap.get(dateStr) || 0;
      data.push(count > 0 ? Math.ceil((count / maxCount) * 4) : 0);

      if (i === daysToShow - 1 || date.getDate() === 1) {
        monthLabels.push(`${date.getMonth() + 1}月`);
      }
    }

    return { data, monthLabels, daysToShow };
  };

  const heatmapResult = getHeatmapData();

  const handleSendReward = () => {
    const amount = parseInt(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的奖励数额哦！');
      return;
    }
    
    addPoints(amount, rewardNote || '家长发放的额外奖励');
    addNotification({
      recipient: 'child',
      type: 'system',
      title: '🎉 收到一份惊喜礼物！',
      message: `家长给了你 ${amount} 积分奖励：${rewardNote || '表现太棒了！继续加油！'}`,
      relatedId: 'manual_reward'
    });
    
    alert(`已向 ${childProfile?.nickname || '孩子'} 发送 ${amount} 积分奖励！`);
    setRewardAmount('');
    setRewardNote('');
  };
  
  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Top Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bento-card p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2 font-display">累计打卡</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-on-background font-display tracking-tight">{totalDays}</span>
              <span className="text-stone-400 text-xs font-bold">天</span>
            </div>
            {firstRecordDate && (
              <p className="text-[10px] text-stone-400 mt-1 font-medium">
                从 {firstRecordDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} 开始记录
              </p>
            )}
          </div>
          <div className="p-4 bg-stone-100 rounded-3xl text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <CalendarDays size={32} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bento-card p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2 font-display">连续打卡</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-orange-500 font-display tracking-tight">{consecutiveDays}</span>
              <span className="text-stone-400 text-xs font-bold">天</span>
            </div>
            {consecutiveDays >= 7 && (
              <p className="text-[10px] text-orange-500 font-bold mt-1">达成"坚持不懈"小成就！</p>
            )}
          </div>
          <div className="p-4 bg-orange-50 rounded-3xl text-orange-500 animate-pulse">
            <Flame size={32} className="fill-current" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }} 
          className="bg-primary p-6 rounded-[2rem] shadow-xl shadow-primary/10 flex items-center justify-between relative overflow-hidden group"
        >
          <div className="z-10">
            <h3 className="text-on-primary/60 text-xs font-bold uppercase tracking-wider mb-2 font-display">今日进度</h3>
            <div className="text-4xl font-black text-on-primary font-display tracking-tight">{todayProgress}%</div>
            <p className="text-[10px] text-on-primary/80 mt-1 font-medium">
              {todayTasks.length - todayCompleted > 0 ? `还需完成 ${todayTasks.length - todayCompleted} 个任务` : '今日任务已全部完成！'}
            </p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-white/20" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" />
              <circle className="text-white" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * todayProgress) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket size={20} className="text-white fill-current" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bento-card p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2 font-display">孩子可用积分</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-secondary font-display tracking-tight">{points.toLocaleString()}</span>
              <span className="text-stone-400 text-xs font-bold">分</span>
            </div>
            <p className="text-[10px] text-secondary font-bold mt-1">孩子可用于兑换心愿</p>
          </div>
          <div className="p-4 bg-secondary-container rounded-3xl text-secondary group-hover:rotate-12 transition-transform">
            <Star size={32} className="fill-current" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }} 
          className="bg-tertiary-container p-6 rounded-[2rem] shadow-xl shadow-tertiary/10 flex items-center justify-between relative overflow-hidden group"
        >
          <div className="z-10">
            <h3 className="text-on-tertiary-container text-xs font-bold uppercase tracking-wider mb-2 font-display">待审核任务</h3>
            <div className="text-4xl font-black text-on-tertiary-container font-display tracking-tight">{pendingCount}</div>
            <button 
              onClick={() => onNavigate('audit')}
              className="mt-4 px-4 py-1.5 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-on-tertiary-container transition-all"
            >
              立即处理
            </button>
          </div>
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
            <ClipboardList size={32} className="text-on-tertiary-container" />
          </div>
        </motion.div>
      </div>

      {/* Growth Heatmap */}
      <section className="bento-card p-8 group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2 font-display">
              <TrendingUp size={24} className="text-primary" />
              成长热力图
            </h2>
            <p className="text-sm text-stone-400 font-medium mt-1">
              {heatmapView === 'week' ? '孩子过去一周的学习与任务完成频率' :
               heatmapView === 'month' ? '孩子过去一个月的学习与任务完成频率' :
               '孩子过去三个月的学习与任务完成频率'}
            </p>
          </div>
          <div className="flex gap-1.5 p-1 bg-surface-low rounded-full scale-90">
            <button
              onClick={() => setHeatmapView('week')}
              className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${heatmapView === 'week' ? 'bg-primary text-on-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >周</button>
            <button
              onClick={() => setHeatmapView('month')}
              className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${heatmapView === 'month' ? 'bg-primary text-on-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >月</button>
            <button
              onClick={() => setHeatmapView('quarter')}
              className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${heatmapView === 'quarter' ? 'bg-primary text-on-primary shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >季</button>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-x-auto no-scrollbar">
          <div className="grid gap-1.5 min-w-[600px] lg:min-w-0" style={{ gridTemplateColumns: `repeat(${heatmapResult.daysToShow}, minmax(0, 1fr))` }}>
            {heatmapResult.data.map((val, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm transition-all duration-300 scale-90 hover:scale-110 ${
                  val === 0 ? 'bg-surface-low' :
                  val === 1 ? 'bg-secondary/10' :
                  val === 2 ? 'bg-secondary/30' :
                  val === 3 ? 'bg-secondary/60' :
                  'bg-secondary'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-stone-400 tracking-wider">
            <div className="flex gap-4">
              {heatmapResult.monthLabels.slice(-6).map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 uppercase tracking-widest text-[9px]">
              <span>少</span>
              <div className="flex gap-0.5">
                {['bg-surface-low', 'bg-secondary/20', 'bg-secondary/50', 'bg-secondary/80', 'bg-secondary'].map((c, i) => (
                  <div key={i} className={`w-2 h-2 ${c} rounded-[1px]`} />
                ))}
              </div>
              <span>多</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Ops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bento-card p-8 group">
          <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 font-display">
            <MinusCircle size={24} className="text-secondary" />
            快速扣分
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {deductionItems.map((item) => {
              const remaining = getRemainingCount(item);
              const allowed = isDeductionAllowed(item);
              return (
              <button
                key={item.id}
                onClick={() => {
                  if (!allowed) return;
                  setSelectedDeduction(item);
                  setDeductionDate(new Date().toISOString().split('T')[0]);
                  setDeductionNote('');
                  setDeductionPhoto(null);
                }}
                className={`${item.color} ${allowed ? 'hover:opacity-80' : 'opacity-50 cursor-not-allowed'} p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all active:scale-98`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={item.iconColor} />
                  <span className="font-bold text-sm text-stone-700">{item.title}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`font-black text-lg ${item.iconColor}`}>-{item.amount}</span>
                  {remaining.daily !== null && (
                    <span className="text-[10px] text-stone-500">今日剩{Math.max(0, remaining.daily)}次</span>
                  )}
                  {remaining.weekly !== null && (
                    <span className="text-[10px] text-stone-500">本周剩{Math.max(0, remaining.weekly)}次</span>
                  )}
                </div>
              </button>
              );
            })}
          </div>
        </section>

        <section className="bento-card p-8 group">
          <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 font-display">
            <Gift size={24} className="text-tertiary" />
            发放惊喜红包
          </h3>
          <div className="space-y-4">
            <div className="bg-surface-low rounded-2xl p-1 focus-within:ring-2 focus-within:ring-tertiary/20 transition-all">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-inner-sm">
                <Star size={20} className="text-tertiary fill-current" />
                <input 
                  type="number" 
                  value={rewardAmount}
                  onChange={e => setRewardAmount(e.target.value)}
                  placeholder="输入积分数额" 
                  className="bg-transparent border-none focus:ring-0 text-xl font-black text-tertiary w-full outline-none font-display"
                />
              </div>
            </div>
            <textarea 
              value={rewardNote}
              onChange={e => setRewardNote(e.target.value)}
              placeholder="输入赞美的话语，给孩子一个惊喜！" 
              className="w-full h-24 bg-surface-low border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-tertiary/20 outline-none resize-none placeholder:italic"
            />
            <button 
              onClick={handleSendReward}
              className="w-full py-4 bg-gradient-to-r from-tertiary to-tertiary-container text-white font-black rounded-full shadow-lg shadow-tertiary/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Send size={18} />
              发送奖励
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-stone-900 rounded-[2.5rem] p-6 lg:p-8 text-white relative overflow-hidden"
          whileHover={{ scale: 0.99 }}
        >
          <div className="z-10 relative space-y-4">
            <span className="inline-block px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-black uppercase tracking-widest">AI 洞察</span>
            <h4 className="text-2xl font-bold tracking-tight font-display">孩子对“逻辑探索”类任务兴趣激增</h4>
            <p className="text-stone-400 text-xs leading-relaxed font-medium">基于最近 14 天的数据分析，孩子在解决数学谜题时的平均完成时间缩短了 20%，建议增加此类高阶挑战。</p>
            <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
              查看建议课程 
              <span className="text-[16px]">›</span>
            </button>
          </div>
          <Brain size={120} className="absolute right-0 bottom-0 text-white/5 translate-x-1/4 translate-y-1/4" />
        </motion.div>

        <div className="bento-card p-6 flex flex-col items-center justify-center text-center gap-4 group">
          <div className="w-16 h-16 bg-secondary-container rounded-[1.5rem] flex items-center justify-center text-secondary rotate-6 group-hover:rotate-0 transition-transform">
            <Trophy size={32} />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm font-display tracking-tight">本周勋章</h5>
            <p className="text-stone-400 text-[10px] font-bold italic">坚持阅读达人</p>
          </div>
        </div>

        <div className="bento-card p-6 flex flex-col justify-between">
          <h5 className="text-sm font-bold tracking-tight font-display mb-4">今日时间分配</h5>
          <div className="space-y-3">
            {[
              { w: '40%', c: 'bg-primary' },
              { w: '35%', c: 'bg-secondary' },
              { w: '25%', c: 'bg-tertiary' },
            ].map((bar, i) => (
              <div key={i} className="w-full bg-surface-low h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: bar.w }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`${bar.c} h-full`}
                />
              </div>
            ))}
          </div>
            <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-tighter text-stone-400 mt-4">
              <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-primary" /> 学习</span>
              <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-secondary" /> 家务</span>
              <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-tertiary" /> 创意</span>
            </div>
        </div>
      </div>

      {/* Deduction Detail Modal */}
      <AnimatePresence>
        {selectedDeduction && (
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
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${selectedDeduction.color} rounded-2xl flex items-center justify-center`}>
                    <selectedDeduction.icon size={28} className={selectedDeduction.iconColor} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight">{selectedDeduction.title}</h3>
                    <p className="text-lg font-black text-red-500">-{selectedDeduction.amount} 积分</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeduction(null)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 pt-4 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">选择日期</label>
                  <input
                    type="date"
                    value={deductionDate}
                    onChange={(e) => setDeductionDate(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">备注说明</label>
                  <textarea
                    value={deductionNote}
                    onChange={(e) => setDeductionNote(e.target.value)}
                    placeholder="描述扣分原因..."
                    className="w-full h-24 bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">上传照片</label>
                  <div className="relative">
                    {deductionPhoto ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                        <img src={deductionPhoto} alt="凭证" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setDeductionPhoto(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
                        <Camera size={32} className="text-stone-300 mb-2" />
                        <span className="text-sm text-stone-400 font-bold">点击上传照片</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setDeductionPhoto(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {selectedDeduction && (() => {
                const remaining = getRemainingCount(selectedDeduction);
                const allowed = isDeductionAllowed(selectedDeduction);
                return (
                  <div className="px-8 -mt-2">
                    {(remaining.daily !== null || remaining.weekly !== null) && (
                      <div className="flex gap-4 justify-center mb-4">
                        {remaining.daily !== null && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${remaining.daily > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            今日剩余 {Math.max(0, remaining.daily)} 次
                          </span>
                        )}
                        {remaining.weekly !== null && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${remaining.weekly > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            本周剩余 {Math.max(0, remaining.weekly)} 次
                          </span>
                        )}
                      </div>
                    )}
                    {!allowed && (
                      <p className="text-center text-sm text-red-500 font-bold mb-4">已达扣分上限，无法扣分</p>
                    )}
                  </div>
                );
              })()}

              <div className="p-8 pt-4 bg-stone-50 border-t border-stone-100">
                <button
                  onClick={() => {
                    if (selectedDeduction && isDeductionAllowed(selectedDeduction)) {
                      const reason = deductionNote.trim()
                        ? `扣分：${selectedDeduction.title}（${deductionNote}）`
                        : `扣分：${selectedDeduction.title}`;
                      deductPoints(selectedDeduction.amount, reason);
                      addNotification({
                        recipient: 'child',
                        type: 'deduction',
                        title: '积分扣除通知',
                        message: `${selectedDeduction.title}，扣除 ${selectedDeduction.amount} 积分`,
                      });
                    }
                    setSelectedDeduction(null);
                  }}
                  className="w-full py-5 bg-red-500 text-white font-black text-lg rounded-full shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  确认扣分 -{selectedDeduction?.amount} 积分
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

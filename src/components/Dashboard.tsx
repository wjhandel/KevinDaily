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
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTasks } from '../TaskContext';
import { View } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const heatmapData = Array.from({ length: 42 }).map(() => Math.floor(Math.random() * 5));
  const { tasks, submissions, points, addPoints, addNotification, childProfile } = useTasks();
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const [rewardAmount, setRewardAmount] = React.useState<string>('');
  const [rewardNote, setRewardNote] = React.useState<string>('');

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
    
    alert(`已向 ${childProfile.nickname} 发送 ${amount} 积分奖励！`);
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
              <span className="text-4xl font-black text-on-background font-display tracking-tight">156</span>
              <span className="text-stone-400 text-xs font-bold">天</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1 font-medium">从 2024 年 11 月开始记录</p>
          </div>
          <div className="p-4 bg-stone-100 rounded-3xl text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <CalendarDays size={32} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bento-card p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2 font-display">连续打卡</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-orange-500 font-display tracking-tight">12</span>
              <span className="text-stone-400 text-xs font-bold">天</span>
            </div>
            <p className="text-[10px] text-orange-500 font-bold mt-1">达成“坚持不懈”小成就！</p>
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
            <div className="text-4xl font-black text-on-primary font-display tracking-tight">75%</div>
            <p className="text-[10px] text-on-primary/80 mt-1 font-medium">还需完成 3 个任务</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-white/20" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" />
              <circle className="text-white" cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset="44" strokeLinecap="round" />
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
            <p className="text-sm text-stone-400 font-medium mt-1">孩子过去半年的学习与任务完成频率</p>
          </div>
          <div className="flex gap-1.5 p-1 bg-surface-low rounded-full scale-90">
            <button className="px-4 py-1 rounded-full text-[10px] font-bold text-stone-400">周</button>
            <button className="px-4 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold shadow-sm">月</button>
            <button className="px-4 py-1 rounded-full text-[10px] font-bold text-stone-400">季</button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 overflow-x-auto no-scrollbar">
          <div className="grid grid-cols-21 grid-rows-2 gap-1.5 min-w-[600px] lg:min-w-0">
            {heatmapData.map((val, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-sm transition-all duration-500 scale-90 hover:scale-110 ${
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
              <span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span>6月</span>
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
        <section className="bg-secondary-container/50 p-8 rounded-[2rem] relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-display">
              <CheckCircle2 size={24} className="text-secondary" />
              代孩子打卡
            </h3>
            <p className="text-stone-500/80 text-xs mb-6 max-w-xs font-medium leading-relaxed italic">
              孩子完成了离线任务？手动帮他同步进度，记录成长的每一小步。
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: '阅读 20 分钟', icon: BookOpen },
                { label: '晨间锻炼', icon: Dumbbell },
                { label: '整理房间', icon: Brush },
              ].map((op, i) => (
                <button key={i} className="bg-white/80 hover:bg-white p-4 rounded-2xl flex flex-col gap-2 items-start shadow-sm transition-all active:scale-95 group-hover:shadow-md">
                  <op.icon size={18} className="text-secondary" />
                  <span className="font-bold text-xs font-display">{op.label}</span>
                </button>
              ))}
              <button className="bg-white/30 border-2 border-dashed border-secondary/20 rounded-2xl flex items-center justify-center text-secondary/40 transition-all hover:bg-white/50">
                <Plus size={24} />
              </button>
            </div>
            <button className="w-full py-4 bg-secondary text-on-secondary font-extrabold rounded-full shadow-lg shadow-secondary/10 transition-all active:scale-98">
              确认代打卡
            </button>
          </div>
          <CheckCircle2 size={160} className="absolute -right-8 -bottom-8 text-secondary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
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
    </div>
  );
}

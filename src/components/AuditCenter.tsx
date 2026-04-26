import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Mic2,
  PenTool,
  CheckCircle2,
  Timer,
  Star,
  Rocket,
  Gift,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTasks } from '../TaskContext';

export default function AuditCenter() {
  const { tasks, submissions, updateSubmissionStatus, addNotification, childProfile, addPoints, markNotificationRead, notifications, addReward } = useTasks();
  const [active, setActive] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rating, setRating] = useState(4.5);
  const [wishCost, setWishCost] = useState(500);
  
  const waveformRows = Array.from({ length: 40 }).map(() => Math.random() * 100);

  const [comment, setComment] = useState('');

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const rewardRedeems = notifications.filter(n => n.type === 'reward_redeemed' && !n.read && n.recipient === 'parent');
  const proposedWishes = notifications.filter(n => n.type === 'new_wish_suggested' && !n.read && n.recipient === 'parent');
  const historySubmissions = submissions.filter(s => s.status !== 'pending').sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const [view, setView] = useState<'pending' | 'history' | 'rewards'>('pending');

  const activeSubmissionId = active || (view === 'pending' ? pendingSubmissions[0]?.id : view === 'rewards' ? (rewardRedeems.length > 0 ? rewardRedeems[0]?.id : proposedWishes[0]?.id) : null);
  const activeSubmission = submissions.find(s => s.id === activeSubmissionId);
  const activeRewardNotification = notifications.find(n => n.id === activeSubmissionId && (n.type === 'reward_redeemed' || n.type === 'new_wish_suggested'));
  const activeTask = activeSubmission ? tasks.find(t => t.id === activeSubmission.taskId) : null;

  useEffect(() => {
    if (activeSubmission) {
      setRating(activeSubmission.rating || 4.5);
      setComment(activeSubmission.comment || '');
    }
  }, [activeSubmissionId, submissions]);

  const handleApprove = (id: string | null) => {
    if (id) {
      const sub = submissions.find(s => s.id === id);
      const task = tasks.find(t => t.id === sub?.taskId);
      updateSubmissionStatus(id, 'approved', { rating, comment });
      
      if (task) {
        addPoints(task.reward, `完成任务：${task.title}`);
      }

      addNotification({
        recipient: 'child',
        type: 'task_approved',
        title: '任务已通过审核！',
        message: `你提交的 "${task?.title}" 已经审核通过，获得了 ${task?.reward} 积分！`,
        relatedId: id
      });
      if (active === id) {
        setActive(null);
      }
      setComment('');
      // Optional: Add some visual feedback here if needed, but UI changing is usually enough
    }
  };

  const handleReject = (id: string | null) => {
    if (id) {
      const sub = submissions.find(s => s.id === id);
      const task = tasks.find(t => t.id === sub?.taskId);
      updateSubmissionStatus(id, 'rejected', { rating, comment });
      addNotification({
        recipient: 'child',
        type: 'task_rejected',
        title: '任务需要重做哦',
        message: `你提交的 "${task?.title}" 还有进步空间，快去看看家长的反馈并重新挑战吧！`,
        relatedId: id
      });
      if (active === id) {
        setActive(null);
      }
      setComment('');
    }
  };

  const handleTagClick = (tag: string) => {
    setComment(prev => prev ? `${prev} ${tag}` : tag);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 6;
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const childAge = calculateAge(childProfile.birthDate);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500 overflow-hidden">
      {/* List */}
      <section className="w-full lg:w-1/3 flex flex-col gap-4 lg:gap-6 overflow-y-auto no-scrollbar pb-4 lg:pb-8 shrink-0">
        <div className="bg-surface-low p-1 rounded-2xl flex items-center gap-1 mb-2">
          <button 
            onClick={() => { setView('pending'); setActive(null); }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${view === 'pending' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
          >
            任务 ({pendingSubmissions.length})
          </button>
          <button 
            onClick={() => { setView('rewards'); setActive(null); }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${view === 'rewards' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
          >
            心愿 ({rewardRedeems.length + proposedWishes.length})
          </button>
          <button 
            onClick={() => { setView('history'); setActive(null); }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${view === 'history' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
          >
            历史
          </button>
        </div>

        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-black flex items-center gap-2 font-display tracking-tight text-stone-500 uppercase">
            {view === 'pending' ? '待批改队列' : view === 'rewards' ? '待兑换心愿' : '最近记录'}
          </h2>
          {view === 'pending' && <button className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline">批量处理</button>}
        </div>

        <div className="space-y-4">
          {view === 'pending' ? (
            <>
              {pendingSubmissions.length === 0 && (
                <div className="text-center py-10 bg-surface-low rounded-[1.75rem] text-sm text-stone-400 font-bold">
                  目前没有待审核的任务哦！
                </div>
              )}
              {pendingSubmissions.map((item) => {
                const task = tasks.find(t => t.id === item.taskId);
                return (
                <motion.div 
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-[1.75rem] flex flex-col gap-4 cursor-pointer transition-all ${
                    (active === item.id || (!active && pendingSubmissions[0]?.id === item.id))
                      ? 'bg-white shadow-xl shadow-secondary/5 border-l-4 border-secondary ring-1 ring-stone-900/5' 
                      : 'bg-surface-low/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm font-bold text-orange-600 overflow-hidden">
                        {childProfile.avatarUrl ? (
                          <img src={childProfile.avatarUrl} alt={childProfile.nickname} className="w-full h-full object-cover" />
                        ) : (
                          childProfile.nickname.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-sm">{childProfile.nickname} ({childAge}岁)</h4>
                        <span className="text-[9px] text-stone-400 font-bold italic tracking-wider">
                          {new Date(item.submittedAt).toLocaleTimeString()} 提交
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.15em] bg-tertiary/10 text-tertiary`}>
                      {task?.category || '常规'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-600 truncate max-w-[140px] font-display">{task?.title}</p>
                    <div className="flex items-center gap-1 text-stone-400">
                      <Timer size={10} />
                      <span className="text-[10px] font-bold">-</span>
                    </div>
                  </div>
                </motion.div>
              )})}
            </>
          ) : view === 'rewards' ? (
            <>
              {rewardRedeems.length === 0 && proposedWishes.length === 0 && (
                <div className="text-center py-10 bg-surface-low rounded-[1.75rem] text-sm text-stone-400 font-bold">
                  目前没有待处理的心愿哦！
                </div>
              )}
              {rewardRedeems.map((item) => (
                <motion.div 
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-[1.75rem] flex flex-col gap-4 cursor-pointer transition-all ${
                    (active === item.id || (!active && (rewardRedeems.length > 0 ? rewardRedeems[0]?.id === item.id : false)))
                      ? 'bg-white shadow-xl shadow-orange-500/5 border-l-4 border-orange-500 ring-1 ring-stone-900/5' 
                      : 'bg-surface-low/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm font-bold text-orange-600">
                        🎁
                      </div>
                      <div>
                        <h4 className="font-black text-sm">心愿兑换申请</h4>
                        <span className="text-[9px] text-stone-400 font-bold italic tracking-wider">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-stone-600 font-display">{item.title}</p>
                </motion.div>
              ))}
              {proposedWishes.map((item) => (
                <motion.div 
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-[1.75rem] flex flex-col gap-4 cursor-pointer transition-all ${
                    (active === item.id || (!active && rewardRedeems.length === 0 && proposedWishes[0]?.id === item.id))
                      ? 'bg-white shadow-xl shadow-indigo-500/5 border-l-4 border-indigo-500 ring-1 ring-stone-900/5' 
                      : 'bg-surface-low/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm font-bold text-indigo-600">
                        ✨
                      </div>
                      <div>
                        <h4 className="font-black text-sm">新愿望投递</h4>
                        <span className="text-[9px] text-stone-400 font-bold italic tracking-wider">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-stone-600 font-display">{item.title}</p>
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {historySubmissions.length === 0 && (
                <div className="text-center py-10 bg-surface-low rounded-[1.75rem] text-sm text-stone-400 font-bold">
                  暂无历史审核记录。
                </div>
              )}
              {historySubmissions.map((item) => {
                const task = tasks.find(t => t.id === item.taskId);
                return (
                <motion.div 
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-[1.75rem] flex flex-col gap-4 cursor-pointer transition-all ${
                    active === item.id 
                      ? 'bg-white shadow-xl shadow-secondary/5 border-l-4 border-stone-800 ring-1 ring-stone-900/5' 
                      : 'bg-surface-low/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border-2 border-white shadow-sm font-bold text-stone-400 overflow-hidden">
                        {childProfile.avatarUrl ? (
                          <img src={childProfile.avatarUrl} alt={childProfile.nickname} className="w-full h-full object-cover grayscale" />
                        ) : (
                          childProfile.nickname.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-stone-600">{childProfile.nickname}</h4>
                        <span className="text-[9px] text-stone-400 font-bold italic tracking-wider">
                          {new Date(item.submittedAt).toLocaleDateString()} 完成
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.15em] ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {item.status === 'approved' ? '已通过' : '已退回'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-500 truncate max-w-[140px] font-display">{task?.title}</p>
                    <div className="flex items-center gap-1 text-stone-300">
                      <CheckCircle2 size={10} />
                      <span className="text-[10px] font-black">HIST</span>
                    </div>
                  </div>
                </motion.div>
              )})}
            </>
          )}
        </div>
      </section>

      {/* Main Review */}
      {activeSubmission && activeTask ? (
        <section className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8">
          <div className="bento-card p-8 space-y-8 relative overflow-hidden shrink-0">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <h3 className="text-2xl font-black font-display tracking-tight leading-tight">
                  {activeTask.requireAudio ? '朗读批改' : activeTask.requirePhoto ? '照片审核' : '任务审核'}：{activeTask.title}
                </h3>
                <p className="text-stone-400 text-sm font-medium mt-1 italic">孩子：{childProfile.nickname} | 任务 ID: #{activeTask.id}</p>
              </div>
              {activeTask.requireAudio && (
                <button className="bg-secondary text-white px-6 py-2.5 rounded-full font-black text-[10px] shadow-lg shadow-secondary/20 flex items-center gap-2 active:scale-95 transition-all uppercase tracking-widest">
                  <Mic2 size={16} /> 标记错词
                </button>
              )}
            </div>

            <div className="bg-surface-low rounded-[2rem] p-8 space-y-6">
              {!activeTask.requireAudio && !activeTask.requirePhoto ? (
                 <div className="text-center py-6 text-stone-500 font-bold">此任务不需要照片或录音，直接审核即可。</div>
              ) : activeTask.requirePhoto && !activeTask.requireAudio ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-sm aspect-video bg-stone-200 rounded-2xl overflow-hidden relative">
                    <img src={activeSubmission.photoUrl || "https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=600&auto=format&fit=crop"} alt="User submission" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-stone-500 font-bold">打卡照片</p>
                </div>
              ) : activeSubmission.readingData ? (
                <div className="space-y-6">
                  {/* Summary Header */}
                  {(() => {
                    const evals: any[] = Object.values(activeSubmission.readingData!.evaluations || {});
                    const count = Math.max(evals.length, 1);
                    const avgOverall = Math.floor(evals.reduce((acc, curr) => acc + (curr.overall || 0), 0) / count);
                    const avgFluency = Math.floor(evals.reduce((acc, curr) => acc + (curr.fluency || 0), 0) / count);
                    const avgCompleteness = Math.floor(evals.reduce((acc, curr) => acc + (curr.completeness || 0), 0) / count);

                    return (
                      <div className="bg-white rounded-[1.5rem] p-6 shadow-sm flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-stone-500 mb-1">本次录音总分</div>
                          <div className="text-4xl font-black font-display text-[#7484ce]">
                            {avgOverall}
                            <span className="text-sm font-bold text-stone-400 ml-1">分</span>
                          </div>
                        </div>
                        <div className="flex gap-6 text-center">
                          <div>
                            <div className="text-sm font-bold text-stone-400">流利度</div>
                            <div className="font-black text-xl text-stone-700">
                              {avgFluency}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-stone-400">完整度</div>
                            <div className="font-black text-xl text-stone-700">
                              {avgCompleteness}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sentences */}
                  <div className="space-y-4">
                    <h4 className="font-black text-stone-600 text-sm flex items-center gap-2">
                       朗读记录 <span className="text-xs text-stone-400 font-bold">按句评分</span>
                    </h4>
                    {Object.entries(activeSubmission.readingData.evaluations).map(([idx, evaluationInput]) => {
                       const evaluation: any = evaluationInput;
                       const sentenceIdx = parseInt(idx);
                       const sentences = activeSubmission.readingData!.contentEn ? activeSubmission.readingData!.contentEn.match(/[^.!?]+[.!?]+/g) || [] : [];
                       const currentSentence = sentences[sentenceIdx] || "";
                       const words = currentSentence.trim().split(' ');
                       
                       return (
                         <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 relative">
                            <div className={`absolute top-4 right-4 text-[11px] font-bold px-2 py-0.5 rounded ${evaluation.overall >= 80 ? 'bg-emerald-100 text-emerald-600' : evaluation.overall >= 60 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-500'}`}>
                              {evaluation.overall}分
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (!currentSentence) return;
                                  const u = new SpeechSynthesisUtterance(currentSentence);
                                  u.lang = 'en-US';
                                  window.speechSynthesis.speak(u);
                                }}
                                className="w-8 h-8 rounded-full bg-[#E5E9FF] text-[#7484ce] flex items-center justify-center shrink-0 hover:bg-[#D5D9F0] transition-colors"
                              >
                                <Play size={14} className="ml-0.5" />
                              </button>
                              <div className="flex-1 pr-12">
                                <div className="flex flex-wrap gap-x-1.5 gap-y-3 mb-1 leading-snug">
                                  {words.length > 0 ? words.map((word: string, wordIdx: number) => {
                                    const wordEval = evaluation?.words?.[wordIdx];
                                    let wordColor = 'text-stone-400';
                                    
                                    if (wordEval) {
                                      if (wordEval.score < 60) wordColor = 'text-rose-500';
                                      else if (wordEval.score >= 80) wordColor = 'text-emerald-500';
                                      else wordColor = 'text-amber-500';
                                    }
                                    
                                    return (
                                      <div key={wordIdx} className="relative flex flex-col items-center">
                                        {wordEval && (
                                          <div className={`absolute -top-3.5 whitespace-nowrap text-[8px] font-bold px-1 rounded-sm ${wordEval.score >= 80 ? 'bg-emerald-500 text-white' : wordEval.score >= 60 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {wordEval.score}
                                          </div>
                                        )}
                                        <span className={`text-[15px] font-bold font-display ${wordColor}`}>
                                          {word}
                                        </span>
                                      </div>
                                    );
                                  }) : (
                                    <p className="font-bold text-stone-700 leading-snug">句子 #{sentenceIdx + 1}</p>
                                  )}
                                </div>
                                <div className="flex gap-3 text-[10px] font-bold text-stone-400 mt-2">
                                   <span>流利度 {evaluation.fluency}</span>
                                   <span>精准度 {evaluation.accuracy}</span>
                                </div>
                              </div>
                            </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              ) : (
                <>
                <div className="h-20 flex items-end justify-between gap-1 overflow-hidden px-4">
                  {waveformRows.map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 4 }}
                      animate={{ height: isPlaying ? `${Math.max(10, h)}%` : '20%' }}
                      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.5 + Math.random() }}
                      className="w-1 bg-secondary rounded-full shrink-0" 
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-400">00:32</span>
                  <div className="flex items-center gap-6">
                    <RotateCcw className="text-stone-400 cursor-pointer hover:text-secondary" size={20} />
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-90"
                    >
                      {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                    </button>
                    <FastForward className="text-stone-400 cursor-pointer hover:text-secondary" size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">01:45</span>
                </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-black text-[10px] flex items-center gap-2 uppercase tracking-widest text-stone-500">
                  <Star size={14} className="text-primary fill-current" />
                  给本次表现评分
                </label>
                <span className="text-primary font-black text-2xl font-display">{rating.toFixed(1)} / 5.0</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.1" value={rating} 
                onChange={e => setRating(Number(e.target.value))}
                disabled={activeSubmission.status !== 'pending'}
                className={`w-full h-2 bg-surface-low rounded-full appearance-none cursor-pointer accent-primary ${activeSubmission.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`} 
              />
            </div>
          </div>

          <div className="flex-1 bento-card p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-black text-lg flex items-center gap-2 font-display tracking-tight shrink-0">
                <PenTool size={20} className="text-tertiary" />
                撰写评价反馈
              </h3>
              <div className="flex items-center gap-3 bg-tertiary/5 px-4 py-2 rounded-full ring-1 ring-tertiary/10">
                <span className="text-[9px] font-black text-tertiary uppercase tracking-wider">触发全屏动画奖赏</span>
                <div className="w-10 h-5 bg-tertiary rounded-full relative p-1 cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['发音非常准！', '情感很充沛', '动作很标准', '非常棒'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 rounded-full bg-white text-[10px] font-bold border border-stone-100 hover:border-secondary transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={activeSubmission.status !== 'pending'}
              className={`flex-1 w-full p-6 bg-surface-low/30 rounded-[1.5rem] border-none focus:ring-2 focus:ring-secondary/20 font-bold text-sm outline-none resize-none placeholder:italic min-h-[100px] ${activeSubmission.status !== 'pending' ? 'cursor-not-allowed text-stone-500' : ''}`}
              placeholder="在这里输入更多个性化评语..."
            />

            <div className="flex gap-4 pt-2">
              {activeSubmission.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => handleReject(activeSubmission.id)} 
                    className="flex-1 py-4 bg-surface-low text-stone-400 font-black rounded-2xl hover:bg-stone-200 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                  >
                    要求重做
                  </button>
                  <button 
                    onClick={() => handleApprove(activeSubmission.id)} 
                    className="flex-[2] py-4 bg-gradient-to-r from-primary to-primary-container text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <CheckCircle2 size={18} /> 发送评价并完成
                  </button>
                </>
              ) : (
                <div className={`w-full py-4 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest ${activeSubmission.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  该任务已审核：{activeSubmission.status === 'approved' ? '已通过' : '已退回'}
                </div>
              )}
            </div>

            <Rocket size={120} className="absolute -bottom-8 -right-8 text-tertiary/5 rotate-12 pointer-events-none" />
          </div>
        </section>
      ) : activeRewardNotification ? (
        <section className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8 items-center justify-center">
           <div className="bento-card p-12 text-center max-w-lg w-full">
             <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeRewardNotification.type === 'reward_redeemed' ? (
                  <Gift size={48} className="text-orange-500" />
                ) : (
                  <Star size={48} className="text-indigo-500" />
                )}
             </div>
             <h3 className="text-2xl font-black font-display mb-4">
               {activeRewardNotification.type === 'reward_redeemed' ? '🎁 心愿兑换申请' : '✨ 新愿望投递'}
             </h3>
             <p className="text-stone-600 font-bold mb-8">
               {activeRewardNotification.message}
             </p>

             {activeRewardNotification.type === 'new_wish_suggested' && (
               <div className="bg-surface-low p-6 rounded-2xl mb-8 space-y-4 text-left">
                 <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block ml-1">设定兑换所需积分</label>
                 <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        value={wishCost}
                        onChange={(e) => setWishCost(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-stone-100 px-5 py-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all pl-10"
                      />
                      <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" size={16} />
                    </div>
                 </div>
               </div>
             )}

             <div className="flex gap-4">
               <button 
                 onClick={() => {
                   markNotificationRead(activeRewardNotification.id);
                   setActive(null);
                 }}
                 className={`flex-1 py-4 font-black rounded-xl transition-all uppercase tracking-widest text-[10px] ${activeRewardNotification.type === 'new_wish_suggested' ? 'bg-surface-low text-stone-400 hover:bg-stone-200' : 'bg-orange-500 text-white shadow-xl shadow-orange-500/20'}`}
               >
                 {activeRewardNotification.type === 'new_wish_suggested' ? '暂时拒绝' : '确认已处理 (标为已读)'}
               </button>
               {activeRewardNotification.type === 'new_wish_suggested' && (
                 <button 
                   onClick={() => {
                     // Extract wish title from message if possible or just use a generic one
                     // The message was: `${childProfile.nickname} 投递了一个新愿望：“${newWishTitle}”...`
                     const match = activeRewardNotification.message.match(/“(.+?)”/);
                     const wishName = match ? match[1] : '新愿望';
                     
                     addReward({
                       id: Math.random().toString(36).substr(2, 9),
                       title: wishName,
                       cost: wishCost,
                       icon: Gift,
                       image: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=600&auto=format&fit=crop', // Default image
                       status: 'available',
                       category: '惊喜'
                     });

                     addNotification({
                        recipient: 'child',
                        type: 'wish_approved',
                        title: '🎉 愿望已加入心愿单！',
                        message: `爸爸妈妈已经同意了你的愿望 "${wishName}"，快去看看需要多少星星来兑换吧！`,
                        relatedId: 'wish_approved'
                     });

                     markNotificationRead(activeRewardNotification.id);
                     setActive(null);
                   }}
                   className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                 >
                   加入心愿仓库
                 </button>
               )}
             </div>
           </div>
        </section>
      ) : (
        <section className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8 items-center justify-center">
            <div className="text-center text-stone-400 font-bold">选择左侧任务以开始审批</div>
        </section>
      )}
    </div>
  );
}

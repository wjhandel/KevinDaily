import React, { useState } from 'react';
import { 
  Plus,
  Sparkles, 
  Volume2, 
  Languages, 
  RefreshCcw, 
  Rocket, 
  Key, 
  Edit3, 
  X,
  History,
  Send,
  Eye,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '../TaskContext';

import ReadingRecorder from './ReadingRecorder';

export default function AIContentCenter() {
  const { addArticle } = useTasks();
  const [keywords, setKeywords] = useState(['Puppy', 'Park']);
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState('中等');
  const [isPublished, setIsPublished] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      setKeywords([...keywords, input.trim()]);
      setInput('');
    }
  };

  const currentEn = 'Today, my little puppy and I went to the colorful park. He loves running on the green grass and catching butterflies.';
  const currentZh = '今天，我和我的小狗去了五彩缤纷的公园。它喜欢在绿草地上奔跑，捕捉蝴蝶。';

  const handlePublish = () => {
    addArticle({
      title: 'A Day at the Park',
      contentEn: currentEn,
      contentZh: currentZh,
      imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop'
    });
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-black tracking-widest rounded-full uppercase">AI 引擎 v2.0</span>
          <h2 className="text-3xl lg:text-4xl font-black text-on-background tracking-tight font-display">AI 创作中心</h2>
          <p className="text-stone-400 text-sm lg:text-lg font-medium italic">专属绘本故事与阅读练习</p>
        </div>
        <button className="hidden lg:flex px-8 py-4 bg-primary text-on-primary rounded-full font-black shadow-lg shadow-primary/20 items-center gap-3 transition-all active:scale-95">
          <Plus size={20} /> 创建新任务
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bento-card p-8 space-y-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-stone-500 uppercase tracking-widest">
                <Key size={16} className="text-secondary" />
                关键词输入 (Keywords)
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-surface-low rounded-2xl border-2 border-dashed border-stone-200">
                {keywords.map(kw => (
                  <span key={kw} className="bg-secondary-container text-secondary text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1">
                    {kw} <X size={12} className="cursor-pointer" onClick={() => setKeywords(keywords.filter(k => k !== kw))} />
                  </span>
                ))}
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={addKeyword}
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium outline-none shrink grow min-w-[100px]" 
                  placeholder="输入并回车..." 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-stone-500 uppercase tracking-widest">
                <Brain size={16} className="text-primary" />
                难度等级选择 (Difficulty)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['简单', '中等', '困难'].map(level => (
                  <button 
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all ${
                      difficulty === level 
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface-low text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-stone-500 uppercase tracking-widest">
                <Languages size={16} className="text-tertiary" />
                故事主题
              </label>
              <select className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-secondary/20 outline-none">
                <option>日常冒险</option>
                <option>科普探索</option>
                <option>寓言童话</option>
              </select>
            </div>

            <button className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white font-black text-lg rounded-full shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-98">
              <Rocket size={24} /> 立即生成 AI 内容
            </button>

            <div className="flex items-center gap-4 text-stone-300">
              <div className="h-[1px] flex-1 bg-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">或</span>
              <div className="h-[1px] flex-1 bg-current" />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-stone-500 uppercase tracking-widest">
                <Edit3 size={16} className="text-secondary" />
                手动录入内容
              </label>
              <textarea 
                className="w-full bg-surface-low border-none rounded-2xl p-4 text-sm font-bold h-24 focus:ring-2 focus:ring-secondary/20 outline-none resize-none placeholder:italic"
                placeholder="在此粘贴外部绘本或阅读材料..."
              />
            </div>
          </section>

          <div className="bento-card p-6 bg-surface-low flex gap-4 items-center group cursor-pointer transition-all hover:bg-white">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:rotate-12 transition-transform">
              <History size={32} />
            </div>
            <div>
              <h4 className="font-black text-sm tracking-tight">生词本同步</h4>
              <p className="text-[10px] text-stone-400 font-bold italic mt-1">已自动匹配 12 个历史错词</p>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bento-card flex-1 flex flex-col overflow-hidden">
            {/* Nav */}
            <div className="px-5 lg:px-8 py-4 lg:py-6 border-b border-surface-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-secondary">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg font-display tracking-tight">内容预览</h3>
                  <p className="text-[10px] text-stone-400 font-bold italic">由 GPT-4o 实时生成</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-surface-low text-stone-400 hover:text-primary transition-all"><RefreshCcw size={18} /></button>
                <button className="p-2.5 rounded-xl bg-surface-low text-stone-400 hover:text-primary transition-all"><Languages size={18} /></button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 flex-1 relative bg-white">
              <div className="max-w-2xl mx-auto space-y-8 lg:space-y-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl relative group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop" 
                    alt="AI Story visual" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </motion.div>

                <div className="space-y-12">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase">EN - English</h4>
                    <p className="text-2xl font-bold leading-relaxed text-stone-800 font-display">
                      Today, my little <span className="bg-primary/10 text-primary border-b-2 border-primary/20 cursor-help" title="历史错词">puppy</span> and I went to the colorful <span className="bg-primary/10 text-primary border-b-2 border-primary/20 cursor-help" title="需要复习">park</span>. He loves running on the green grass and catching butterflies.
                    </p>
                  </section>
                  
                  <div className="h-[2px] w-12 bg-stone-100 rounded-full" />

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-tertiary tracking-[0.3em] uppercase">ZH - 中文</h4>
                    <p className="text-xl text-stone-500 leading-relaxed font-medium">
                      今天，我和我的小<span className="text-primary font-bold">幼犬</span>去了五彩缤纷的<span className="text-primary font-bold">公园</span>。它喜欢在绿草地上奔跑，捕捉蝴蝶。
                    </p>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 lg:px-8 py-4 lg:py-6 bg-surface-low/50 border-t border-stone-200/20 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-black text-stone-400 tracking-widest uppercase">
                <span>45 字词</span>
                <div className="w-1 h-1 bg-current rounded-full" />
                <span>生词涵盖 100%</span>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsPreviewing(true)}
                  className="px-6 py-3 bg-white text-stone-600 font-black text-xs rounded-full border border-stone-100 shadow-sm transition-all active:scale-95"
                >
                  预览效果
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isPublished}
                  className={`px-8 py-3 text-white font-black text-xs rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                    isPublished ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-tertiary shadow-tertiary/20'
                  }`}
                >
                  {isPublished ? (
                    <><CheckCircle2 size={16} /> 已发布</>
                  ) : (
                    <><Send size={16} /> 发布给孩子</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPreviewing && (
          <ReadingRecorder 
            onClose={() => setIsPreviewing(false)}
            onComplete={() => setIsPreviewing(false)}
            previewArticle={{
              id: 'preview',
              title: 'A Day at the Park',
              contentEn: currentEn,
              contentZh: currentZh,
              imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
              publishedAt: new Date().toISOString()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

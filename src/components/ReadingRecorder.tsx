import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, Square, Play, Sparkles, ChevronRight, CheckCircle2, RefreshCcw, Volume2, Star } from 'lucide-react';
import { useTasks } from '../TaskContext';
import { Article, SentenceEvaluation, ReadingEvaluationData } from '../types';

interface ReadingRecorderProps {
  onClose: () => void;
  onComplete: (readingData?: ReadingEvaluationData) => void;
  previewArticle?: Article;
}

export default function ReadingRecorder({ onClose, onComplete, previewArticle }: ReadingRecorderProps) {
  const { articles, addVocabulary, vocabulary } = useTasks();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(previewArticle || null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [readingMode, setReadingMode] = useState<'sentence' | 'full'>('sentence');
  const [activeWordPop, setActiveWordPop] = useState<{word: string, rect: DOMRect} | null>(null);
  
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<Record<number, SentenceEvaluation>>({});

  const handleStartRecording = () => {
    setRecordingState('recording');
    setEvaluations(prev => {
      const newEvals = { ...prev };
      delete newEvals[activeSentenceIdx];
      return newEvals;
    });
  };
  const handleStopRecording = () => {
    setRecordingState('recorded');
    
    // Simulate Tencent SOE API evaluation
    if (readingMode === 'sentence' && selectedArticle) {
      const sentences = selectedArticle.contentEn.match(/[^.!?]+[.!?]+/g) || [];
      const currentSentence = sentences[activeSentenceIdx] || "";
      const words = currentSentence.trim().split(' ');
      
      const mockEvaluation: SentenceEvaluation = {
        overall: Math.floor(Math.random() * 20 + 80),
        fluency: Math.floor(Math.random() * 15 + 85),
        accuracy: Math.floor(Math.random() * 20 + 80),
        completeness: 100,
        words: {}
      };
      
      words.forEach((_, idx) => {
        // Skew scores high mostly, but throw in some low ones for realism
        const random = Math.random();
        let score = 95;
        if (random > 0.8) score = Math.floor(Math.random() * 20 + 70); // 70-89
        if (random > 0.95) score = Math.floor(Math.random() * 40 + 20); // 20-59
        mockEvaluation.words[idx] = { score };
      });
      
      setEvaluations(prev => ({
        ...prev,
        [activeSentenceIdx]: mockEvaluation
      }));
    }
  };

  const handleSubmit = () => {
    let readingData: ReadingEvaluationData | undefined = undefined;
    if (selectedArticle && Object.keys(evaluations).length > 0) {
      readingData = {
        articleId: selectedArticle.id,
        articleTitle: selectedArticle.title,
        contentEn: selectedArticle.contentEn,
        evaluations
      };
    }
    onComplete(readingData);
  };

  const handleWordClick = (word: string, e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[^a-zA-Z']/g, '');
    if (!cleanWord) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveWordPop({ word: cleanWord, rect });
  };

  const handleAddVocabulary = (word: string) => {
    addVocabulary(word);
    setActiveWordPop(null);
  };



  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[500] bg-gradient-to-br from-[#7484ce] to-[#8d7ac3] flex flex-col w-full h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 shrink-0 z-10 w-full max-w-2xl mx-auto">
        <button 
          onClick={onClose}
          className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="flex-1 flex justify-center text-center">
          <div className="bg-white/20 px-5 py-1.5 rounded-full inline-flex items-center gap-2 text-white font-bold text-sm">
            <span>📚</span>
            <span>英语朗读</span>
          </div>
        </div>

        <div className="w-9 h-9 flex items-center justify-center text-white">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {!selectedArticle ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 w-full h-full overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-black text-white">选择练习内容</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-white px-3 py-1 bg-white/20 rounded-full">
                  {articles.length} 篇可用
                </span>
              </div>
              
              <div className="grid gap-3">
                {articles.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group bg-white p-3 rounded-[1.5rem] cursor-pointer hover:shadow-xl transition-all flex gap-4 items-center"
                  >
                    <div className="w-16 h-16 rounded-[1rem] overflow-hidden shrink-0 bg-stone-100 relative">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300"><Sparkles size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 pr-2">
                      <h4 className="text-base font-black font-display text-stone-800 line-clamp-1">{article.title}</h4>
                      <p className="text-xs font-bold text-stone-400 mt-1 line-clamp-2 leading-relaxed">{article.contentEn}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#7484ce] group-hover:text-white transition-all shrink-0">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="py-20 text-center text-white/70 font-bold">
                    还没发布任何短文哦，提醒家长去发布一段吧！
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="reading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col w-full h-full"
            >
              {/* Tabs area */}
              <div className="px-4 pb-3 shrink-0">
                <div className="flex justify-center bg-white/20 p-1.5 rounded-2xl max-w-sm mx-auto">
                  <button 
                    onClick={() => setReadingMode('sentence')}
                    className={`flex-1 py-2 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${readingMode === 'sentence' ? 'bg-white text-[#7484ce] shadow-sm' : 'text-white hover:bg-white/10'}`}
                  >
                    📝 句子模式
                  </button>
                  <button 
                    onClick={() => setReadingMode('full')}
                    className={`flex-1 py-2 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${readingMode === 'full' ? 'bg-white text-[#7484ce] shadow-sm' : 'text-white hover:bg-white/10'}`}
                  >
                    📖 全文朗读
                  </button>
                </div>
              </div>
              
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
                <div className="bg-[#f8f9ff] rounded-[1.5rem] shadow-sm p-3 relative text-[#5D6B98] min-h-full flex flex-col">
                  {readingMode === 'sentence' ? (
                    <div className="space-y-2.5">
                      {selectedArticle.contentEn.match(/[^.!?]+[.!?]+/g)?.map((sentence, sentenceIdx) => {
                        const cleanSentence = sentence.trim();
                        const words = cleanSentence.split(' ');
                        const isSentenceActive = sentenceIdx === activeSentenceIdx;
                        const evaluation = evaluations[sentenceIdx];
                        
                        return (
                          <div 
                            key={sentenceIdx} 
                            onClick={() => {
                              if (recordingState === 'recording') return;
                              setActiveSentenceIdx(sentenceIdx);
                              setRecordingState('idle');
                            }}
                            className={`bg-white p-3 lg:p-4 rounded-xl flex gap-x-2 relative shadow-sm border transition-all cursor-pointer overflow-hidden ${isSentenceActive ? 'border-[#7484ce] ring-2 ring-[#7484ce]/20' : 'border-black/5 hover:border-[#7484ce]/50'}`}
                          >
                            {evaluation && (
                              <div className={`absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded ${evaluation.overall >= 80 ? 'bg-emerald-100 text-emerald-600' : evaluation.overall >= 60 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-500'}`}>
                                {evaluation.overall}分
                              </div>
                            )}
                            <div className={`font-black text-sm w-5 shrink-0 pt-1 ${isSentenceActive ? 'text-[#7484ce]' : 'text-stone-300'}`}>
                              {sentenceIdx + 1}.
                            </div>
                            <div className="flex-1 w-0">
                              <div className="flex flex-wrap gap-x-1.5 gap-y-3 mb-1 leading-snug">
                                {words.map((word, wordIdx) => {
                                  const wordEval = evaluation?.words[wordIdx];
                                  let wordColor = isSentenceActive ? 'text-[#333]' : 'text-stone-400';
                                  
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
                                      <span 
                                        onClick={(e) => handleWordClick(word, e)}
                                        className={`text-[17px] lg:text-xl font-bold font-display ${wordColor} hover:opacity-70 transition-all duration-300`}
                                      >
                                        <span className="phonics-highlight">{word}</span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className={`text-[12px] font-bold mt-2 border-t pt-2 ${isSentenceActive ? 'text-[#AAB4DB] border-[#7484ce]/10' : 'text-stone-300 border-black/5'} ${isSentenceActive ? '' : 'line-clamp-1'}`}>
                                 {sentenceIdx === 0 ? selectedArticle.contentZh.split(/。|！|\?/)[sentenceIdx] + '。' : '...'}
                              </p>
                              
                              {/* Evaluation Metrics specifically for the active evaluated sentence */}
                              {isSentenceActive && evaluation && (
                                <div className="mt-4 pt-4 border-t border-[#7484ce]/10 bg-[#f8f9ff] -mx-3 -mb-3 p-3 flex justify-between text-center rounded-b-xl lg:-mx-4 lg:-mb-4 lg:p-4">
                                  <div>
                                    <div className="font-display font-black text-[#7484ce] text-lg">{evaluation.overall}<span className="text-[10px]">分</span></div>
                                    <div className="text-[10px] text-stone-500 font-bold mt-0.5">评分</div>
                                  </div>
                                  <div>
                                    <div className="font-display font-black text-stone-700 text-lg">{evaluation.fluency}<span className="text-[10px]">分</span></div>
                                    <div className="text-[10px] text-stone-500 font-bold mt-0.5">流利度</div>
                                  </div>
                                  <div>
                                    <div className="font-display font-black text-stone-700 text-lg">{evaluation.accuracy}<span className="text-[10px]">分</span></div>
                                    <div className="text-[10px] text-stone-500 font-bold mt-0.5">精准度</div>
                                  </div>
                                  <div>
                                    <div className="font-display font-black text-stone-700 text-lg">{evaluation.completeness}<span className="text-[10px]">%</span></div>
                                    <div className="text-[10px] text-stone-500 font-bold mt-0.5">完整度</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className={`shrink-0 flex items-start pt-0.5 ${isSentenceActive && evaluation ? 'opacity-0' : 'opacity-100'}`}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const u = new SpeechSynthesisUtterance(cleanSentence);
                                  u.lang = 'en-US';
                                  window.speechSynthesis.speak(u);
                                }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isSentenceActive ? 'bg-[#E5E9FF] text-[#7484ce] hover:bg-[#D5D9F0]' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                              >
                                <Play size={12} className="fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>
                        );
                      }) || (
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                          <p className="text-lg font-bold text-stone-800">{selectedArticle.contentEn}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl shadow-sm relative flex-1">
                      {recordingState === 'recorded' && (
                        <div className="absolute top-4 right-4 w-12 h-12 bg-amber-100 text-amber-600 font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm rotate-12 text-sm z-20">
                          88分
                        </div>
                      )}
                      
                      <div className="space-y-4 text-[#333]">
                        <div className="flex flex-wrap gap-x-1.5 gap-y-2 font-display">
                          {selectedArticle.contentEn.split(' ').map((word, wordIdx) => (
                            <span 
                              key={wordIdx} 
                              onClick={(e) => handleWordClick(word, e)}
                              className="text-[19px] lg:text-2xl font-black cursor-pointer hover:text-[#7484ce] transition-colors duration-300"
                            >
                              <span className="phonics-highlight">{word}</span>
                            </span>
                          ))}
                        </div>
                        <div className="h-px bg-black/5 w-full" />
                        <p className="text-[14px] text-[#AAB4DB] leading-relaxed font-bold">
                          {selectedArticle.contentZh}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Listen to pronunciation action */}
                  <div className="mt-3 shrink-0">
                    <button className="w-full py-3 bg-[#7484ce]/10 text-[#7484ce] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#7484ce]/20 transition-colors">
                      <Mic size={16} /> 听听标准读音
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recording Controls - fixed at bottom */}
      {selectedArticle && (
        <div className="shrink-0 h-[100px] bg-transparent flex flex-col justify-center relative z-20 px-6 max-w-md w-full mx-auto">
          <div className="flex items-center justify-between w-full">
             <div className="flex flex-col items-center gap-1.5 w-16">
               <button 
                 onClick={() => setRecordingState('idle')}
                 className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 backdrop-blur-md transition-colors shadow-sm"
               >
                 <RefreshCcw size={16} />
               </button>
               <span className="text-[11px] font-bold text-white/90 shadow-sm">重读</span>
             </div>
             
             <div className="flex flex-col items-center gap-1.5 -mt-6">
               <div className="relative">
                 {recordingState === 'recording' && (
                   <div className="absolute inset-0 bg-[#FF6B6B] rounded-full animate-ping opacity-30 scale-150" />
                 )}
                 <button 
                   onClick={recordingState === 'recording' ? handleStopRecording : handleStartRecording}
                   className={`relative w-[76px] h-[76px] rounded-full text-white flex items-center justify-center shadow-xl transition-all ${recordingState === 'recording' ? 'bg-[#FF6B6B] shadow-[#FF6B6B]/40' : 'bg-[#FF8888] shadow-[#FF8888]/40 hover:scale-105 active:scale-95'}`}
                 >
                   {recordingState === 'recording' ? <Square size={28} className="fill-current" /> : <Mic size={34} />}
                 </button>
               </div>
             </div>
             
             <div className="flex flex-col items-center gap-1.5 w-16">
               <button 
                 onClick={handleSubmit}
                 className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 backdrop-blur-md transition-colors shadow-sm"
               >
                 <CheckCircle2 size={20} />
               </button>
               <span className="text-[11px] font-bold text-white/90 shadow-sm">完成</span>
             </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeWordPop && (
          <>
            <div className="fixed inset-0 z-[501]" onClick={() => setActiveWordPop(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-[502] bg-white rounded-2xl shadow-xl p-4 border border-stone-100 flex flex-col gap-3 min-w-[200px]"
              style={{
                left: Math.max(16, Math.min(window.innerWidth - 216, activeWordPop.rect.left + activeWordPop.rect.width / 2 - 100)),
                top: activeWordPop.rect.top > 80 ? activeWordPop.rect.top - 80 : activeWordPop.rect.bottom + 10
              }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-lg font-black font-display text-stone-800">{activeWordPop.word}</div>
                  <div className="text-xs text-stone-400 font-medium font-sans">[{activeWordPop.word}] · 单词</div>
                </div>
                <button 
                  onClick={() => {
                     const u = new SpeechSynthesisUtterance(activeWordPop.word);
                     u.lang = 'en-US';
                     window.speechSynthesis.speak(u);
                  }}
                  className="ml-auto w-10 h-10 rounded-full bg-[#7484ce]/10 text-[#7484ce] flex items-center justify-center hover:bg-[#7484ce]/20"
                >
                  <Volume2 size={18} />
                </button>
              </div>
              <div className="h-px bg-stone-100 w-full" />
              <button 
                onClick={() => handleAddVocabulary(activeWordPop.word)}
                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                disabled={vocabulary.some(v => v.word.toLowerCase() === activeWordPop.word.toLowerCase())}
              >
                <Star size={16} className={vocabulary.some(v => v.word.toLowerCase() === activeWordPop.word.toLowerCase()) ? "fill-amber-600" : ""} />
                {vocabulary.some(v => v.word.toLowerCase() === activeWordPop.word.toLowerCase()) ? "已收藏" : "收藏到生词本"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

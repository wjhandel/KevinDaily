import React, { useState } from 'react';
import { 
  Plus, 
  Sun, 
  Dumbbell, 
  BookOpen, 
  Languages, 
  GraduationCap,
  X,
  Mic,
  Camera,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Stars,
  Music,
  Brush,
  Heart,
  Smile,
  Trophy,
  Coffee,
  Gamepad2,
  BedDouble,
  Lightbulb,
  Plane,
  Shirt,
  Utensils,
  WashingMachine,
  Bath,
  TreePine,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '../TaskContext';
import { Task, TaskRecurrence } from '../types';

const PRESET_ICONS = [
  { icon: Sun, label: 'Sun' },
  { icon: Dumbbell, label: 'Dumbbell' },
  { icon: BookOpen, label: 'Book' },
  { icon: Languages, label: 'Language' },
  { icon: GraduationCap, label: 'Graduation' },
  { icon: Stars, label: 'Stars' },
  { icon: Music, label: 'Music' },
  { icon: Brush, label: 'Brush' },
  { icon: Heart, label: 'Heart' },
  { icon: Smile, label: 'Smile' },
  { icon: Trophy, label: 'Trophy' },
  { icon: Coffee, label: 'Coffee' },
  { icon: Gamepad2, label: 'Game' },
  { icon: BedDouble, label: 'Bed' },
  { icon: Lightbulb, label: 'Idea' },
  { icon: Plane, label: 'Travel' },
  { icon: Shirt, label: 'Clothes' },
  { icon: Utensils, label: 'Food' },
  { icon: WashingMachine, label: 'Laundry' },
  { icon: Bath, label: 'Bath' },
  { icon: TreePine, label: 'Nature' },
  { icon: Zap, label: 'Energy' },
  { icon: Target, label: 'Goal' },
  { icon: Sparkles, label: 'Magic' },
];

const PRESET_COLORS = [
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
];

export default function TaskLibrary() {
  const { tasks, addTask, updateTask, removeTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const toggleActive = (id: string, active: boolean) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask({ ...task, active });
    }
  };

  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setCurrentTask({
      title: '',
      desc: '',
      reward: 10,
      category: '习惯',
      requireAudio: false,
      requirePhoto: false,
      recurrence: 'daily',
      active: true,
      color: 'bg-orange-100',
      icon: Sun,
      iconColor: 'text-orange-600'
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setDeletingTaskId(id);
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      removeTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingTaskId(null);
  };

  const handleSave = () => {
    if (!currentTask.title) {
      alert('请输入任务名称');
      return;
    }

    if (currentTask.id) {
      updateTask(currentTask as Task);
    } else {
      addTask(currentTask as Omit<Task, 'id'>);
    }
    setIsEditing(false);
  };

  const filteredTasks = tasks.filter(t => filterCategory === '全部' || t.category === filterCategory);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-black text-secondary tracking-tight font-display">任务模板库</h2>
          <p className="text-stone-400 text-xs lg:text-sm max-w-lg font-medium leading-relaxed italic">
            预设科学育儿任务，您可以自由新增、删除和修改任务规则。
          </p>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        {['全部', '学习', '习惯', '运动'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-secondary text-white shadow-md' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map((task) => (
          <motion.div 
            layout
            key={task.id}
            className={`bg-white p-4 rounded-3xl border ${task.active ? 'border-stone-100 shadow-sm' : 'border-stone-100 border-dashed opacity-70'} flex flex-col group transition-all hover:shadow-md relative`}
          >
            {/* Edit / Delete actions on hover */}
            <div className="absolute -top-2 -right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden lg:flex">
              <button 
                onClick={() => handleEdit(task)}
                className="p-1.5 bg-white shadow-md border border-stone-100 text-stone-400 hover:text-secondary rounded-full hover:bg-secondary/10 transition-colors"
                title="编辑"
              >
                <Edit2 size={14} />
              </button>
              {deletingTaskId === task.id ? (
                <div className="flex gap-1 items-center bg-white shadow-md border border-red-200 rounded-full p-1">
                  <button 
                    onClick={confirmDelete}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="确认删除"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                  <button 
                    onClick={cancelDelete}
                    className="p-1 text-stone-400 hover:bg-stone-50 rounded-full transition-colors"
                    title="取消"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 bg-white shadow-md border border-stone-100 text-stone-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-3 mb-2">
              <div className={`w-12 h-12 shrink-0 ${task.active ? task.color : 'bg-stone-100'} rounded-2xl flex items-center justify-center ${task.active ? task.iconColor : 'text-stone-400'} transition-colors`}>
                <task.icon size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-base font-black font-display tracking-tight truncate ${task.active ? 'text-stone-800' : 'text-stone-500'}`}>
                    {task.title}
                  </h3>
                  {/* Apple Style Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0" title={task.active ? '点击停用' : '点击启用'}>
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={task.active} 
                      onChange={(e) => toggleActive(task.id, e.target.checked)} 
                    />
                    <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#34C759]"></div>
                  </label>
                </div>
                <p className="text-xs text-stone-400 font-medium line-clamp-1 mt-0.5" title={task.desc}>{task.desc}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-50">
              <div className="flex flex-wrap gap-1.5">
                <div className="px-2 py-0.5 bg-stone-50 text-stone-500 rounded-lg text-[10px] font-bold">
                  {task.recurrence === 'daily' && '每日'}
                  {task.recurrence === 'weekly' && '每周'}
                  {task.recurrence === 'quick' && '打卡'}
                </div>
                <div className="px-2 py-0.5 bg-stone-50 text-stone-500 rounded-lg text-[10px] font-bold">
                  {task.category}
                </div>
                {(task.requireAudio || task.requirePhoto) && (
                  <div className="flex px-1 bg-stone-50 rounded-lg items-center text-stone-400 gap-0.5">
                    {task.requireAudio && <Mic size={10} />}
                    {task.requirePhoto && <Camera size={10} />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded-full font-black text-[10px] shrink-0 ${task.active ? task.iconColor.replace('text', 'bg') + '/10 ' + task.iconColor : 'bg-stone-100 text-stone-400'}`}>
                  +{task.reward} 分
                </div>
                <div className="lg:hidden flex gap-1">
                  <button onClick={() => handleEdit(task)} className="p-1 text-stone-400"><Edit2 size={12} /></button>
                  {deletingTaskId === task.id ? (
                    <>
                      <button onClick={confirmDelete} className="p-1 text-red-500"><CheckCircle2 size={12} /></button>
                      <button onClick={cancelDelete} className="p-1 text-stone-400"><X size={12} /></button>
                    </>
                  ) : (
                    <button onClick={() => handleDelete(task.id)} className="p-1 text-stone-400"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div 
          onClick={handleAdd}
          className="border-2 border-dashed border-stone-200 bg-transparent p-4 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 group transition-all min-h-[140px]"
        >
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <Plus size={24} />
          </div>
          <h3 className="text-sm font-black text-stone-800 font-display">新增任务模板</h3>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-display font-black text-stone-800">
                  {currentTask.id ? '编辑任务' : '新增任务'}
                </h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">任务名称</label>
                      <div className="relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl ${currentTask.color} ${currentTask.iconColor}`}>
                          {currentTask.icon && <currentTask.icon size={20} />}
                        </div>
                        <input 
                          type="text" 
                          value={currentTask.title || ''}
                          onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-16 pr-4 py-3 text-stone-800 font-black focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-medium text-lg"
                          placeholder="例如：整理自己的房间"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">任务图标</label>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
                        {PRESET_ICONS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentTask({...currentTask, icon: preset.icon})}
                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${currentTask.icon === preset.icon ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200'}`}
                          >
                            <preset.icon size={20} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">主题颜色</label>
                      <div className="flex flex-wrap gap-3">
                        {PRESET_COLORS.map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentTask({...currentTask, color: color.bg, iconColor: color.text})}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${color.bg} ${currentTask.color === color.bg ? 'ring-2 ring-stone-800 ring-offset-2 scale-110' : 'hover:opacity-80'}`}
                          >
                            <div className={`w-4 h-4 rounded-full ${color.text.replace('text-', 'bg-')}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">任务分类</label>
                    <select 
                      value={currentTask.category || '习惯'}
                      onChange={e => setCurrentTask({...currentTask, category: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                    >
                      <option value="学习">学习</option>
                      <option value="习惯">习惯</option>
                      <option value="运动">运动</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">奖励积分</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={currentTask.reward || 0}
                        onChange={e => setCurrentTask({...currentTask, reward: parseInt(e.target.value) || 0})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-12 py-3 text-stone-800 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                        分
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">任务描述</label>
                    <textarea 
                      value={currentTask.desc || ''}
                      onChange={e => setCurrentTask({...currentTask, desc: e.target.value})}
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                      placeholder="详细说明需要孩子怎么做..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">任务类型</label>
                    <div className="flex gap-4">
                      {['daily', 'weekly', 'quick'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${currentTask.recurrence === type ? 'border-primary' : 'border-stone-300 group-hover:border-stone-400'}`}>
                            {currentTask.recurrence === type && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                            <input 
                              type="radio" 
                              className="sr-only" 
                              name="recurrence"
                              checked={currentTask.recurrence === type}
                              onChange={() => setCurrentTask({...currentTask, recurrence: type as TaskRecurrence})}
                            />
                          </div>
                          <span className="text-sm font-bold text-stone-700">
                            {type === 'daily' && '每日任务'}
                            {type === 'weekly' && '每周任务'}
                            {type === 'quick' && '快速打卡'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {currentTask.recurrence === 'quick' && (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">次数限制</label>
                      <div className="flex gap-4 items-center">
                        <select
                          value={currentTask.limitType || 'none'}
                          onChange={e => setCurrentTask({...currentTask, limitType: e.target.value as any})}
                          className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-800 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          <option value="none">无限制</option>
                          <option value="daily">每日限制</option>
                          <option value="weekly">每周限制</option>
                        </select>
                        {currentTask.limitType !== 'none' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={currentTask.limitCount || 1}
                              onChange={e => setCurrentTask({...currentTask, limitCount: parseInt(e.target.value) || 1})}
                              className="w-20 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                            <span className="text-sm font-bold text-stone-600">
                              {currentTask.limitType === 'daily' ? '次/天' : '次/周'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">打卡要求</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${currentTask.requirePhoto ? 'bg-primary border-primary' : 'border-stone-300 group-hover:border-stone-400'}`}>
                          {currentTask.requirePhoto && <CheckCircle2 size={14} className="text-white" />}
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={!!currentTask.requirePhoto}
                            onChange={(e) => setCurrentTask({...currentTask, requirePhoto: e.target.checked})}
                          />
                        </div>
                        <span className="text-sm font-bold text-stone-700 flex items-center gap-1">
                          <Camera size={14} className="text-stone-400" /> 照片
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${currentTask.requireAudio ? 'bg-primary border-primary' : 'border-stone-300 group-hover:border-stone-400'}`}>
                          {currentTask.requireAudio && <CheckCircle2 size={14} className="text-white" />}
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={!!currentTask.requireAudio}
                            onChange={(e) => setCurrentTask({...currentTask, requireAudio: e.target.checked})}
                          />
                        </div>
                        <span className="text-sm font-bold text-stone-700 flex items-center gap-1">
                          <Mic size={14} className="text-stone-400" /> 录音
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">任务状态</h4>
                      <p className="text-xs text-stone-500 font-medium mt-1">停用后，孩子端将不可见此任务</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={currentTask.active === true}
                        onChange={e => setCurrentTask({...currentTask, active: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
                      <span className="ml-3 text-sm font-bold text-stone-700">{currentTask.active ? '已启用' : '已停用'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3 mt-auto rounded-b-3xl">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-primary text-white rounded-full font-black shadow-lg shadow-primary/20 hover:bg-primary-dim active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> 保存任务
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Hero */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-stone-900 aspect-video md:aspect-[21/9] flex flex-col md:flex-row items-center justify-between p-12 gap-8 shadow-2xl mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase">
            🚀 AI 智能推荐已上线
          </div>
          <h2 className="text-4xl font-black font-display tracking-tight leading-tight">想要更精准的任务建议？</h2>
          <p className="text-stone-300 text-lg font-medium leading-relaxed italic">
            通过分析您孩子的成长轨迹和兴趣点，AI 助手可以为您自动生成一套为期 21 天的习惯养成方案。
          </p>
          <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            立即体验 AI 生成器
          </button>
        </div>

        <div className="relative z-10 w-full md:w-80 h-full rounded-[2rem] overflow-hidden rotate-2 group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=800&auto=format&fit=crop" 
            alt="Child playing" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}


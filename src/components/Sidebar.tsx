import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Library, 
  ClipboardCheck, 
  Settings, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { View } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  pendingCount: number;
}

export default function Sidebar({ currentView, onViewChange, pendingCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { id: 'ai-content', icon: Sparkles, label: 'AI 内容' },
    { id: 'library', icon: Library, label: '资源库' },
    { id: 'audit', icon: ClipboardCheck, label: '审核中心' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col h-full p-4 gap-2 bg-stone-50/80 backdrop-blur-xl border-r border-stone-200/20 shrink-0">
      <div className="flex flex-col gap-1 mb-8 px-4 py-2">
        <h1 className="text-2xl font-black text-secondary tracking-tight leading-tight font-display">家长控制台</h1>
        <p className="text-xs text-stone-500 font-medium">伴随成长</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`flex items-center justify-between px-4 py-3 rounded-full transition-all duration-300 active:scale-95 ${
              currentView === item.id 
                ? 'bg-secondary-container text-secondary font-bold' 
                : 'text-stone-500 hover:bg-stone-200/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-sm font-display">{item.label}</span>
            </div>
            {item.id === 'audit' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 mb-4 py-3 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        <span className="text-sm font-display">创建新任务</span>
      </motion.button>

      <div className="mt-auto pt-4 border-t border-stone-200/20 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-200/50 rounded-full transition-colors text-left text-sm font-display">
          <HelpCircle size={18} />
          帮助与反馈
        </button>
        
        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" 
            alt="Parent Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">林女士</p>
            <p className="text-[10px] text-stone-400">超级守护者</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

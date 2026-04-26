import React, { useState } from 'react';
import { Bell, User, Baby, LogOut } from 'lucide-react';
import { Mode } from '../types';
import { useTasks } from '../TaskContext';

interface TopBarProps {
  title: string;
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function TopBar({ title, currentMode, onModeChange }: TopBarProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, currentUser, setCurrentUser } = useTasks();
  const [showNotifications, setShowNotifications] = useState(false);

  const parentNotifications = notifications.filter(n => n.recipient === 'parent');
  const unreadCount = parentNotifications.filter(n => !n.read).length;

  return (
    <header className="h-16 glass-header flex justify-between items-center px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4 w-1/2 lg:w-1/3">
        {currentUser && (
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full border-2 border-primary/20" alt={currentUser.name} />
            <div className="hidden lg:block">
              <p className="text-[10px] font-black leading-none text-stone-800">{currentUser.name}</p>
              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5">{currentUser.isAdmin ? '超级管理员' : '家庭成员'}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="hidden md:block font-display text-secondary font-extrabold text-xl tracking-tight">育儿导师</div>
      <div className="md:hidden font-display text-secondary font-extrabold text-lg tracking-tight">育儿导师</div>
      
      <div className="flex items-center gap-2 lg:gap-4 w-1/2 lg:w-1/3 justify-end relative">
        <div className="relative flex items-center">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:bg-surface-low transition-all active:scale-90 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-black text-sm text-stone-800">通知</h3>
                  {unreadCount > 0 && <span className="text-[10px] text-stone-400 font-bold">{unreadCount} 条未读</span>}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllNotificationsRead('parent')}
                    className="text-[10px] text-secondary font-bold hover:underline"
                  >
                    全部标为已读
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar">
                {parentNotifications.length === 0 ? (
                  <p className="text-center py-6 text-stone-400 font-bold text-xs">暂无消息</p>
                ) : (
                  parentNotifications.map(n => (
                     <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-4 border-b border-stone-50 cursor-pointer transition-colors ${n.read ? 'bg-white' : 'bg-primary/5'}`}>
                       <h4 className="font-bold text-xs text-stone-800 mb-1">{n.title}</h4>
                       <p className="text-[10px] text-stone-500">{n.message}</p>
                     </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => onModeChange(currentMode === 'parent' ? 'child' : 'parent')}
          className="group flex items-center gap-2 bg-white/50 hover:bg-white p-1 pr-3 rounded-full border border-stone-200 transition-all active:scale-95 shadow-sm"
          title={currentMode === 'parent' ? "切换到孩子端" : "切换到家长端"}
        >
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
            {currentMode === 'parent' ? <User size={16} /> : <Baby size={16} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 hidden sm:block">
            {currentMode === 'parent' ? '家长' : '孩子'}
          </span>
        </button>

        <button 
          onClick={() => setCurrentUser(null)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-stone-600 hover:bg-stone-50 transition-all ml-1"
          title="退出登录"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

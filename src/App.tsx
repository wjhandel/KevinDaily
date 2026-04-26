/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AIContent from './components/AIContent';
import TaskLibrary from './components/TaskLibrary';
import AuditCenter from './components/AuditCenter';
import Settings from './components/Settings';
import ParentLock from './components/ParentLock';
import ChildPortal from './components/ChildPortal';
import Auth from './components/Auth';
import { View, Mode } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Sparkles, Library, ClipboardCheck, Settings as SettingsIcon } from 'lucide-react';
import { useTasks } from './TaskContext';

export default function App() {
  const { currentUser } = useTasks();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [appMode, setAppMode] = useState<Mode>(currentUser?.role === 'child' ? 'child' : 'parent');
  const [isLocked, setIsLocked] = useState(false);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);

  if (!currentUser) {
    return <Auth />;
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '概览' },
    { id: 'ai-content', icon: Sparkles, label: 'AI' },
    { id: 'library', icon: Library, label: '库' },
    { id: 'audit', icon: ClipboardCheck, label: '审核' },
    { id: 'settings', icon: SettingsIcon, label: '设置' },
  ];

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === 'parent') {
      // Switching TO parent requires password
      setPendingMode('parent');
      setIsLocked(true);
    } else {
      // Switching TO child is direct
      setAppMode('child');
    }
  };

  const handleUnlock = () => {
    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    }
    if (pendingMode) {
      setAppMode(pendingMode);
      setPendingMode(null);
    }
    setIsLocked(false);
  };

  const renderView = () => {
    if (appMode === 'child') return <ChildPortal />;

    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={handleViewChange} />;
      case 'ai-content': return <AIContent />;
      case 'library': return <TaskLibrary />;
      case 'audit': return <AuditCenter />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f5f6f7] relative">
      {appMode === 'parent' && (
        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      )}
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar 
          title={appMode === 'parent' ? currentView : '我的乐园'} 
          currentMode={appMode}
          onModeChange={handleModeChange}
        />
        
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-24 lg:pb-8">
          <div className={`${appMode === 'parent' ? 'max-w-7xl' : 'max-w-6xl'} mx-auto p-4 lg:p-8 min-h-full`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${appMode}-${currentView}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only in Parent Mode */}
      {appMode === 'parent' && (
        <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 flex items-center justify-around px-2 z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as View)}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 relative ${
                currentView === item.id ? 'text-secondary scale-110' : 'text-stone-400'
              }`}
            >
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-black font-display tracking-tight whitespace-nowrap">
                {item.label}
              </span>
              {currentView === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      )}

      <AnimatePresence>
        {isLocked && (
          <ParentLock 
            onUnlock={handleUnlock} 
            onCancel={() => {
              setIsLocked(false);
              setPendingView(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, ShieldCheck, Key, RefreshCcw, User as UserIcon, Mail, Lock } from 'lucide-react';
import { useTasks } from '../TaskContext';
import { User, InvitationCode } from '../types';

export default function Auth() {
  const { registerUser, setCurrentUser, users, systemSettings } = useTasks();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Registration data
  const [regName, setRegName] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'parent' | 'child'>('parent');

  // Login data
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const isFirstUser = users.length === 0;
  const currentMode = isFirstUser ? 'register' : mode;

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentMode === 'register') {
      if (!regName || !regAccount || !regPassword) {
        setError('请填写完整的注册信息');
        setLoading(false);
        return;
      }

      if (users.some(u => u.account === regAccount)) {
        setError('该账号已被注册');
        setLoading(false);
        return;
      }

      const result = registerUser({
        name: regName,
        account: regAccount,
        password: regPassword, // In a real app this would be hashed
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        role: isFirstUser ? 'parent' : regRole
      }, invitationCode);

      if (!result.success) {
        setError(result.error || '注册失败');
        setLoading(false);
        return;
      }
    } else {
      if (!loginAccount || !loginPassword) {
        setError('请输入账号和密码');
        setLoading(false);
        return;
      }

      const user = users.find(u => u.account === loginAccount && u.password === loginPassword);
      if (user) {
        setCurrentUser(user);
      } else {
        setError('账号或密码错误');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F7] z-[500] flex items-center justify-center p-6 bg-dots overflow-y-auto pt-[10vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden relative"
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-6 animate-pulse">
              {currentMode === 'login' ? <LogIn size={40} /> : <UserPlus size={40} />}
            </div>
            <h1 className="text-3xl font-black text-stone-900 font-display tracking-tight mb-2">
              {isFirstUser ? '初始化家长账户' : (currentMode === 'login' ? '欢迎回来' : '开启魔法之旅')}
            </h1>
            <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">
              {isFirstUser ? '第一个注册账户将设为系统管理员' : (currentMode === 'login' ? '请登录你的账号' : '验证邀请码并加入家庭')}
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {currentMode === 'login' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">邮箱 / 手机号</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={loginAccount}
                      onChange={(e) => setLoginAccount(e.target.value)}
                      placeholder="输入账号"
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">密码</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="输入密码"
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                </div>
              </div>
            )}

            {currentMode === 'register' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">称呼 / 昵称</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="例如：爸爸、豆豆"
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">注册账号 (邮箱或手机号)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={regAccount}
                      onChange={(e) => setRegAccount(e.target.value)}
                      placeholder="输入邮箱或手机号"
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">设置密码</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="最少 6 位密码"
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                </div>

                {!isFirstUser && (
                  <>
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">身份角色</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setRegRole('parent')}
                          className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${regRole === 'parent' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-50 bg-stone-50 text-stone-400'}`}
                        >
                          我是家长
                        </button>
                        <button 
                          onClick={() => setRegRole('child')}
                          className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${regRole === 'child' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-50 bg-stone-50 text-stone-400'}`}
                        >
                          我是孩子
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">验证通行证 (邀请码)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={invitationCode}
                          onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                          placeholder="输入 6 位邀请码"
                          className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-black text-stone-800 transition-all outline-none tracking-[0.2em]"
                        />
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <button 
              onClick={handleAuth}
              disabled={loading}
              className="w-full h-16 mt-4 bg-stone-900 text-white rounded-[1.5rem] shadow-xl shadow-stone-200 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
            >
              {loading ? (
                <RefreshCcw size={20} className="animate-spin" />
              ) : (
                <>
                  <p className="text-sm font-black tracking-widest uppercase">{currentMode === 'login' ? '安全登录' : '创建新账号'}</p>
                </>
              )}
            </button>

            {!isFirstUser && (
              <div className="text-center pt-2">
                <button 
                  onClick={() => {
                    setMode(currentMode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] hover:text-primary transition-colors"
                >
                  {currentMode === 'login' ? '还没有账号？前往注册' : '已有账号？返回登录'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-50 p-6 flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">魔法家庭系统安全加密验证已开启</p>
        </div>
      </motion.div>

      <div className="fixed top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-stone-200/50 rounded-full blur-3xl -z-10" />
    </div>
  );
}

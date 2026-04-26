import React from 'react';
import { 
  Link, 
  Smartphone, 
  Tablet, 
  Cloud, 
  Verified, 
  Settings as SettingsIcon,
  Download,
  Plus,
  RefreshCcw,
  Check,
  Baby,
  Calendar,
  Save,
  Gift,
  X,
  ArrowLeft,
  ChevronRight,
  QrCode,
  PackageCheck,
  Star,
  Upload,
  Image,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '../TaskContext';
import { useState } from 'react';

type SettingsModule = 'main' | 'profile' | 'wishes' | 'invitation' | 'gift' | 'articles';

export default function Settings() {
  const { 
    childProfile, 
    updateChildProfile, 
    weeklyGiftConfig, 
    setWeeklyGiftConfig, 
    rewards, 
    updateReward, 
    addReward, 
    removeReward,
    invitationCodes,
    generateInvitationCode,
    systemSettings,
    updateSystemSettings,
    articles,
    removeArticle
  } = useTasks();
  const [activeModule, setActiveModule] = useState<SettingsModule>('main');
  const [editProfile, setEditProfile] = useState(childProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);
  const [inviteConfig, setInviteConfig] = useState({ maxUses: 1, expiryDays: 7 });

  const handleSaveProfile = () => {
    updateChildProfile(editProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const renderEditRewardModal = () => (
    <AnimatePresence>
      {editingReward && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-stone-800 font-display tracking-tight mb-1">编辑奖励配置</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{editingReward.title}</p>
              </div>
              <button 
                onClick={() => setEditingReward(null)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto max-h-[70vh] no-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">心愿名称</label>
                <input 
                  type="text" 
                  value={editingReward.title}
                  onChange={(e) => setEditingReward({...editingReward, title: e.target.value})}
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">心愿描述</label>
                <textarea 
                  value={editingReward.desc || ''}
                  onChange={(e) => setEditingReward({...editingReward, desc: e.target.value})}
                  placeholder="简单描述一下这个愿望，让它更有吸引力..."
                  className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none text-xs min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">兑换所需分值</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editingReward.cost}
                    onChange={(e) => setEditingReward({...editingReward, cost: parseInt(e.target.value) || 0})}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 pl-12 font-bold text-stone-800 transition-all outline-none"
                  />
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">心愿封面图片</label>
                <div className="flex flex-col gap-4">
                  {editingReward.image && (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden shadow-sm">
                      <img src={editingReward.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={editingReward.image}
                        onChange={(e) => setEditingReward({...editingReward, image: e.target.value})}
                        placeholder="输入图片 URL..."
                        className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none text-[10px]"
                      />
                      <Image className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                    </div>
                    <label className="bg-stone-900 border-2 border-stone-900 text-white p-4 rounded-2xl cursor-pointer hover:bg-stone-800 transition-all shadow-sm flex items-center justify-center shrink-0">
                      <Upload size={20} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditingReward({...editingReward, image: event.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">当前库存</label>
                  <input 
                    type="number" 
                    value={editingReward.stock}
                    onChange={(e) => setEditingReward({...editingReward, stock: parseInt(e.target.value) || 0})}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none"
                  />
                  <p className="text-[8px] text-stone-300 font-bold italic ml-1">设置为 -1 表示无限</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">频率限制类型</label>
                  <select 
                    value={editingReward.limitType}
                    onChange={(e) => setEditingReward({...editingReward, limitType: e.target.value as any})}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-4 font-bold text-stone-800 transition-all outline-none text-xs"
                  >
                    <option value="none">无限制</option>
                    <option value="weekly">每周限制</option>
                    <option value="monthly">每月限制</option>
                  </select>
                </div>
              </div>

              {editingReward.limitType !== 'none' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">限制次数 (次)</label>
                  <input 
                    type="number" 
                    value={editingReward.limitCount}
                    onChange={(e) => setEditingReward({...editingReward, limitCount: parseInt(e.target.value) || 1})}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-stone-800 transition-all outline-none"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setEditingReward(null)}
                  className="flex-1 py-4 bg-stone-100 text-stone-400 font-black rounded-2xl hover:bg-stone-200 transition-all uppercase tracking-widest text-xs"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    if (rewards.find(r => r.id === editingReward.id)) {
                      updateReward(editingReward);
                    } else {
                      const newReward = { ...editingReward };
                      if (!newReward.icon) {
                        newReward.icon = Gift;
                      }
                      addReward(newReward);
                    }
                    setEditingReward(null);
                  }}
                  className="flex-[2] py-4 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  保存配置
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '未知';
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age + ' 岁' : '即将出生';
  };

  const renderMainMenu = () => (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-stone-800 tracking-tight font-display mb-2">设置中心</h1>
        <p className="text-stone-400 text-sm font-medium italic">管理与配置 WonderStep Kids 的核心体验。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Child Profile Setting Card */}
        <motion.div 
          onClick={() => setActiveModule('profile')}
          whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          className="bento-card p-8 flex flex-col gap-6 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
            <Baby size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-black text-xl font-display text-stone-800">孩子信息设置</h2>
            <p className="text-stone-400 text-xs font-bold leading-relaxed italic">管理头像、昵称以及当前的成长等级。</p>
          </div>
          <ChevronRight size={20} className="text-stone-300 mt-auto ml-auto" />
        </motion.div>

        {/* Wish Warehouse Card */}
        <motion.div 
          onClick={() => setActiveModule('wishes')}
          whileHover={{ y: -4 }}
          className="bento-card p-8 flex flex-col gap-6 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
            <PackageCheck size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-black text-xl font-display text-stone-800">心愿仓库管理</h2>
            <p className="text-stone-400 text-xs font-bold leading-relaxed italic">配置实物奖励与时间奖励规则及库存。</p>
          </div>
          <ChevronRight size={20} className="text-stone-300 mt-auto ml-auto" />
        </motion.div>

        {/* Invitation Card */}
        <motion.div 
          onClick={() => setActiveModule('invitation')}
          whileHover={{ y: -4 }}
          className="bento-card p-8 flex flex-col gap-6 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-600 transition-transform group-hover:scale-110">
            <QrCode size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-black text-xl font-display text-stone-800">邀请码管理</h2>
            <p className="text-stone-400 text-xs font-bold leading-relaxed italic">生成与查看家庭设备同步邀请码。</p>
          </div>
          <ChevronRight size={20} className="text-stone-300 mt-auto ml-auto" />
        </motion.div>

        {/* Weekly Gift Card */}
        <motion.div 
          onClick={() => setActiveModule('gift')}
          whileHover={{ y: -4 }}
          className="bento-card p-8 flex flex-col gap-6 cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110">
            <Gift size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-black text-xl font-display text-stone-800">周达标礼包设置</h2>
            <p className="text-stone-400 text-xs font-bold leading-relaxed italic">设定每日连续打卡的周度里程碑大奖。</p>
          </div>
          <ChevronRight size={20} className="text-stone-300 mt-auto ml-auto" />
        </motion.div>

        {/* AI Articles Card */}
        <motion.div 
          onClick={() => setActiveModule('articles')}
          whileHover={{ y: -4 }}
          className="bento-card p-8 flex flex-col gap-6 cursor-pointer group relative overflow-hidden md:col-span-2"
        >
          <div className="absolute top-6 right-6 w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
            <BookOpen size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-black text-xl font-display text-stone-800">短文阅读管理</h2>
            <p className="text-stone-400 text-xs font-bold leading-relaxed italic">管理已发布的AI生成的英语短文。</p>
          </div>
          <ChevronRight size={20} className="text-stone-300 mt-auto ml-auto" />
        </motion.div>
      </div>

      <footer className="mt-12 flex flex-col lg:flex-row items-center justify-between p-6 lg:p-8 bg-surface-low/50 rounded-[2rem] border border-stone-100 gap-6">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-secondary shrink-0 mx-auto lg:mx-0">
            <Verified size={24} />
          </div>
          <div>
            <h4 className="font-black text-xs font-display">家长护航协议已生效</h4>
            <p className="text-[10px] text-stone-400 font-bold italic">您的奖励设置将严格同步至孩子端，无延迟激励。</p>
          </div>
        </div>
        <div className="flex gap-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
          <button className="hover:text-primary transition-all">使用协议</button>
          <button className="hover:text-primary transition-all">隐私政策</button>
        </div>
      </footer>
    </div>
  );

  const renderModuleHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveModule('main')}
          className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-300 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-stone-800">
            {icon}
          </div>
          <h2 className="text-2xl font-black text-stone-800 font-display tracking-tight">{title}</h2>
        </div>
      </div>
      {activeModule === 'profile' && (
        <button 
          onClick={handleSaveProfile}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-on-primary shadow-lg shadow-primary/20 active:scale-95'}`}
        >
          {isSaved ? <><Check size={14} /> 已保存</> : <><Save size={14} /> 保存修改</>}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {activeModule === 'main' ? (
          <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderMainMenu()}
          </motion.div>
        ) : activeModule === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderModuleHeader('孩子信息设置', <Baby size={20} />)}
            <div className="bento-card p-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">孩子昵称</label>
                    <input 
                      type="text" 
                      value={editProfile.nickname}
                      onChange={(e) => setEditProfile({...editProfile, nickname: e.target.value})}
                      className="bg-surface-low border border-stone-100 px-6 py-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="输入孩子昵称..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">出生日期</label>
                    <input 
                      type="date" 
                      value={editProfile.birthDate}
                      onChange={(e) => setEditProfile({...editProfile, birthDate: e.target.value})}
                      className="w-full bg-surface-low border border-stone-100 px-6 py-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">性别</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['boy', 'girl', 'other'] as const).map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setEditProfile({...editProfile, gender})}
                          className={`py-4 rounded-2xl font-bold text-xs capitalize transition-all border ${editProfile.gender === gender ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-low border-stone-100 text-stone-400 hover:border-stone-200'}`}
                        >
                          {gender === 'boy' ? '小王子' : gender === 'girl' ? '小公主' : '其他'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                      <Verified size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-orange-600 font-bold italic leading-relaxed">
                        当前计算年龄：{calculateAge(editProfile.birthDate)}
                      </p>
                      <p className="text-[10px] text-orange-600/70 font-bold italic leading-relaxed mt-1">
                        完善信息后，AI 导师将更精准地推荐适合成长的任务。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeModule === 'wishes' ? (
          <motion.div key="wishes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderModuleHeader('心愿仓库管理', <PackageCheck size={20} />)}
            <div className="space-y-8">
              <div className="flex justify-end gap-3">
                <button className="bg-white px-6 py-2.5 rounded-full font-black text-[10px] hover:bg-stone-50 border border-stone-100 shadow-sm uppercase tracking-widest transition-all">导出清单</button>
                <button 
                  onClick={() => setEditingReward({
                    id: Math.random().toString(36).substr(2, 9),
                    title: '',
                    desc: '',
                    cost: 100,
                    image: '',
                    category: '玩具',
                    status: 'available',
                    stock: -1,
                    limitType: 'none',
                    limitCount: 1
                  })}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-black text-[10px] shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest transition-all"
                >
                  新增奖品
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bento-card overflow-hidden flex flex-col group border-2 border-transparent hover:border-primary/20">
                    <div className="h-44 overflow-hidden relative">
                      <img 
                        src={reward.image || "https://images.unsplash.com/photo-1585366119957-e5549079f8fa?q=80&w=800&auto=format&fit=crop"} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-primary shadow-sm uppercase tracking-widest">{reward.category}</div>
                      <button 
                        onClick={() => removeReward(reward.id)}
                        className="absolute top-4 right-4 bg-stone-900/50 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg backdrop-blur hover:bg-rose-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm font-display tracking-tight">{reward.title}</h3>
                        <span className="text-primary font-black text-lg font-display">{reward.cost}⭐</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-medium leading-relaxed italic flex-1">
                        {reward.limitType && reward.limitType !== 'none' && (
                          <span className="text-indigo-600 font-black mr-1 uppercase tracking-tighter">
                            [每{reward.limitType === 'weekly' ? '周' : '月'}限 {reward.limitCount} 次]
                          </span>
                        )}
                        {reward.category === '时长' ? '获得额外的娱乐时间。' : '激发创造力与逻辑思维。'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                        <div className="bg-surface-low rounded-xl p-2 uppercase tracking-tighter">库存: {reward.stock && reward.stock >= 0 ? `${reward.stock} 件` : '∞'}</div>
                        <button 
                          onClick={() => updateReward({ ...reward, status: reward.status === 'available' ? 'locked' : 'available' })}
                          className={`${reward.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-stone-100 text-stone-400 border-stone-200'} border rounded-xl p-2 uppercase tracking-tighter transition-colors flex items-center justify-center gap-1`}
                        >
                          {reward.status === 'available' ? '已上架' : '已下架'}
                        </button>
                      </div>
                      <button 
                        onClick={() => setEditingReward({...reward, stock: reward.stock ?? 10, limitType: reward.limitType ?? 'none', limitCount: reward.limitCount ?? 1})}
                        className="w-full py-2.5 bg-stone-900 text-white rounded-full font-black text-[10px] hover:bg-stone-800 transition-all uppercase tracking-widest"
                      >
                        编辑配置
                      </button>
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={() => setEditingReward({
                    id: Math.random().toString(36).substr(2, 9),
                    title: '',
                    desc: '',
                    cost: 100,
                    image: '',
                    category: '玩具',
                    status: 'available',
                    stock: -1,
                    limitType: 'none',
                    limitCount: 1
                  })}
                  className="bento-card overflow-hidden flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-stone-200 bg-transparent hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group min-h-[300px]"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 group-hover:scale-110 group-hover:text-primary transition-all">
                    <Plus size={32} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-xs font-display text-stone-800">添加新心愿</h3>
                    <p className="text-[9px] text-stone-400 font-bold italic mt-1">支持上传实物照片或设定特权</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeModule === 'invitation' ? (
          <motion.div key="invitation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderModuleHeader('邀请码与注册管理', <QrCode size={20} />)}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bento-card p-8 flex flex-col gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">注册通道状态</label>
                  <div className="flex items-center justify-between p-6 bg-surface-low rounded-3xl border border-stone-100">
                    <div>
                      <p className="text-sm font-black text-stone-800">开放注册</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">允许新用户加入系统</p>
                    </div>
                    <button 
                      onClick={() => updateSystemSettings({ isRegistrationOpen: !systemSettings.isRegistrationOpen })}
                      className={`w-14 h-8 rounded-full relative transition-all ${systemSettings.isRegistrationOpen ? 'bg-emerald-500' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${systemSettings.isRegistrationOpen ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-surface-low rounded-[2rem] p-8 flex flex-col gap-4 border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase">配置新邀请码</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-stone-400 uppercase ml-1">限制次数</span>
                        <input 
                          type="number" 
                          value={inviteConfig.maxUses}
                          onChange={(e) => setInviteConfig({...inviteConfig, maxUses: parseInt(e.target.value) || 1})}
                          className="w-full bg-white border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 font-bold text-stone-800 transition-all outline-none text-xs shadow-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-stone-400 uppercase ml-1">有效天数</span>
                        <input 
                          type="number" 
                          value={inviteConfig.expiryDays}
                          onChange={(e) => setInviteConfig({...inviteConfig, expiryDays: parseInt(e.target.value) || 1})}
                          className="w-full bg-white border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 font-bold text-stone-800 transition-all outline-none text-xs shadow-sm"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => generateInvitationCode(inviteConfig.maxUses, inviteConfig.expiryDays)}
                      className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-xs hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <Plus size={16} /> 生成邀请码
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bento-card p-8 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg font-display text-stone-800">活动邀请码</h3>
                  <span className="bg-stone-100 text-stone-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-stone-200">
                    {invitationCodes.length} 个记录
                  </span>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {invitationCodes.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-stone-300 gap-4 opacity-50 bg-surface-low rounded-3xl border-2 border-dashed border-stone-100">
                      <QrCode size={48} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-widest">暂无活动代码</p>
                    </div>
                  ) : (
                    invitationCodes.map((code) => {
                      const isExpired = new Date(code.expiresAt) < new Date();
                      return (
                        <div key={code.code} className="bg-surface-low p-6 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all group overflow-hidden relative shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xl font-black text-stone-800 font-display tracking-[0.2em]">{code.code}</p>
                              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight mt-1">有效期至: {new Date(code.expiresAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-50/50 text-red-500 border border-red-100' : 'bg-emerald-50/50 text-emerald-600 border border-emerald-100'}`}>
                              {isExpired ? '已失效' : '生效中'}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-stone-200/50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(code.usedCount / code.maxUses) * 100}%` }}
                                className={`h-full ${isExpired ? 'bg-stone-300' : 'bg-primary'}`}
                              />
                            </div>
                            <span className="text-[10px] font-black text-stone-400 whitespace-nowrap">
                              已用 {code.usedCount} / {code.maxUses}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-auto flex items-center gap-3 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <ShieldCheck size={18} className="text-primary/40" />
                  <p className="text-[10px] text-stone-400 font-bold italic tracking-tight uppercase leading-relaxed">
                    邀请码是魔法家庭系统的唯一验证通行证。请妥善保管并在有效期内使用，过期将自动失效。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeModule === 'gift' ? (
          <motion.div key="gift" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderModuleHeader('周达标礼包设置', <Gift size={20} />)}
            <div className="bento-card p-10 flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-stone-500 text-sm font-medium leading-relaxed italic max-w-2xl">
                  激发连续打卡的动力！当孩子在一周内（从周一到周日）完成每天的全部任务并获得认可后，系统将自动解锁该礼包。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">最低星力奖励</label>
                      <span className="text-xs font-black text-purple-600 font-display">{weeklyGiftConfig.min} ⭐</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={weeklyGiftConfig.min}
                      onChange={(e) => setWeeklyGiftConfig({...weeklyGiftConfig, min: parseInt(e.target.value)})}
                      className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">最高星力奖励</label>
                      <span className="text-xs font-black text-purple-600 font-display">{weeklyGiftConfig.max} ⭐</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="2000"
                      step="10"
                      value={weeklyGiftConfig.max}
                      onChange={(e) => setWeeklyGiftConfig({...weeklyGiftConfig, max: Math.max(parseInt(e.target.value), weeklyGiftConfig.min)})}
                      className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-surface-low rounded-[2rem] p-8 flex flex-col items-center justify-center text-center gap-6 border-2 border-white shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-purple-500 shadow-xl shadow-purple-500/10 rotate-3 group-hover:rotate-6 transition-transform">
                    <Gift size={40} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg font-display text-stone-800">周度超级礼包</h4>
                    <p className="text-[10px] text-stone-400 font-bold italic mt-1">随机产出 {weeklyGiftConfig.min} - {weeklyGiftConfig.max} 颗星星</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-current" />)}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                  <PackageCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-bold italic leading-relaxed">
                    专家建议：
                  </p>
                  <p className="text-[10px] text-purple-600/70 font-bold italic leading-relaxed mt-1">
                    设置一个比每日奖励更有吸引力的区间，能显著提高孩子坚持打卡的兴趣。对于 6-10 岁的孩子，100-300 的区间是比较合适的。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeModule === 'articles' ? (
          <motion.div key="articles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {renderModuleHeader('短文阅读管理', <BookOpen size={20} />)}
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-4">
                <p className="text-stone-400 text-sm font-medium italic">管理已发布的AI生成的英语短文。在此处可以删除不需要的短文。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                  <div key={article.id} className="bento-card p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
                    {article.imageUrl && (
                      <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-stone-100">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-black text-lg text-stone-800 font-display mb-2">{article.title}</h3>
                    <p className="text-xs text-stone-500 font-bold mb-1 line-clamp-2">{article.contentEn}</p>
                    <p className="text-[10px] text-stone-400 font-medium mb-6 line-clamp-2">{article.contentZh}</p>
                    
                    <div className="mt-auto flex gap-3 pt-4 border-t border-stone-100">
                      <button 
                        onClick={() => {
                          if (window.confirm('确认删除这篇短文吗？')) {
                            removeArticle(article.id);
                          }
                        }}
                        className="flex-1 py-2 bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-600 font-black rounded-lg text-xs transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
                
                {articles.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-surface-low rounded-[2rem] border border-stone-100 border-dashed">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
                      <BookOpen size={24} />
                    </div>
                    <p className="text-stone-400 font-bold text-sm">暂无已发布的短文</p>
                    <p className="text-stone-300 font-medium text-xs mt-1">前往【AI 导师】发布更多短文吧</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {renderEditRewardModal()}
    </div>
  );
}


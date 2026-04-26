import React, { useState } from 'react';
import { Lock, Delete, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParentLockProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function ParentLock({ onUnlock, onCancel }: ParentLockProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const correctPin = '1234';

  const handleInput = (val: string) => {
    const nextIdx = pin.findIndex(v => v === '');
    if (nextIdx !== -1) {
      const newPin = [...pin];
      newPin[nextIdx] = val;
      setPin(newPin);
      
      if (nextIdx === 3) {
        if (newPin.join('') === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin(['', '', '', '']);
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    const lastFilledIdx = [...pin].reverse().findIndex(v => v !== '');
    if (lastFilledIdx !== -1) {
      const actualIdx = 3 - lastFilledIdx;
      const newPin = [...pin];
      newPin[actualIdx] = '';
      setPin(newPin);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
          <Lock size={32} />
        </div>
        
        <h2 className="font-black text-2xl text-stone-800 mb-2 tracking-tight font-display">家长验证</h2>
        <p className="text-stone-400 text-xs font-bold mb-8 text-center italic">请输入家长管理密码以继续</p>

        <div className={`flex gap-4 mb-10 transition-transform ${error ? 'animate-bounce text-red-500' : ''}`}>
          {pin.map((p, i) => (
            <div 
              key={i} 
              className={`w-12 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-all ${
                p !== '' ? 'bg-secondary-container text-secondary' : 'bg-surface-low text-stone-300'
              } ${pin.findIndex(v => v === '') === i ? 'ring-2 ring-secondary/30 ring-offset-2' : ''}`}
            >
              {p !== '' ? '•' : ''}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num}
              onClick={() => handleInput(num.toString())}
              className="h-16 rounded-full bg-surface-low hover:bg-stone-200 text-xl font-bold text-stone-800 transition-all active:scale-90"
            >
              {num}
            </button>
          ))}
          <div />
          <button 
            onClick={() => handleInput('0')}
            className="h-16 rounded-full bg-surface-low hover:bg-stone-200 text-xl font-bold text-stone-800 transition-all active:scale-90"
          >
            0
          </button>
          <button 
            onClick={handleBackspace}
            className="h-16 rounded-full bg-surface-low hover:bg-stone-200 flex items-center justify-center text-stone-400 transition-all active:scale-90"
          >
            <Delete size={20} />
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="mt-10 text-xs font-black text-stone-400 hover:text-secondary uppercase tracking-[0.2em] transition-all"
        >
          取消
        </button>
      </motion.div>
    </motion.div>
  );
}

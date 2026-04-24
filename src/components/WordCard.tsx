import { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2, Star, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordCardProps {
  word: Word;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  lang: string;
}

export default function WordCard({ word, isFavorite, onToggleFavorite, lang }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id]);

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Don't flip when clicking audio
    const speech = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT'
    };
    speech.lang = langMap[lang] || 'en-US';
    window.speechSynthesis.speak(speech);
  };

  const highlightWord = (text: string, target: string) => {
    if (!text) return text;
    const parts = text.split(new RegExp(`(${target})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === target.toLowerCase() 
            ? <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <div 
      className="w-full h-[460px] perspective-1000 cursor-pointer relative group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-[48px] border border-slate-100 bg-white shadow-2xl shadow-indigo-100/50 flex flex-col items-center justify-center p-12 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-10 flex flex-col items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50/50 px-5 py-2 rounded-full border border-indigo-100/50">
                {word.theme}
             </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
            {word.word}
          </h2>

          <div className="flex flex-col items-center gap-8">
            <button 
              onClick={(e) => playAudio(e, word.word)}
              className="w-20 h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-indigo-200 group-hover:scale-110 active:scale-95"
            >
              <Volume2 className="w-10 h-10" />
            </button>

            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[9px] opacity-60">
               <RotateCcw className="w-3 h-3" /> Tap to reveal
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-[48px] border border-indigo-50 bg-white shadow-2xl shadow-indigo-100/50 flex flex-col p-8 overflow-y-auto custom-scrollbar"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{word.word}</h2>
              <p className="text-xl text-indigo-600 font-bold italic">{word.translation}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white border ${isFavorite ? 'border-yellow-400 text-yellow-400 shadow-sm' : 'border-slate-100 text-slate-300'}`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              {[
                { label: 'Present', text: word.sentences.present, color: 'bg-indigo-50/30 border-indigo-100/50' },
                { label: 'Past', text: word.sentences.past, color: 'bg-slate-50 border-slate-100' },
                { label: 'Future', text: word.sentences.future, color: 'bg-slate-50 border-slate-100' }
              ].map((item) => (
                <div key={item.label} className={`group/item relative rounded-2xl p-4 border transition-all hover:border-indigo-200 ${item.color}`}>
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm leading-relaxed font-bold text-slate-700 flex-1">
                      {highlightWord(item.text, word.word)}
                    </p>
                    <button 
                      onClick={(e) => playAudio(e, item.text)}
                      className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <span className="absolute -top-2 left-4 px-2 bg-white text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

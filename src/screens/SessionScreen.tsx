import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import WordCard from '../components/WordCard';
import { X, Check, BookOpen, Brain, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { translations } from '../translations';

export default function SessionScreen({ onComplete }: { onComplete: () => void }) {
  const { dailyWords, dailyStory, dailyProgress, markWordLearned, targetLanguage } = useStore();
  
  const [localFavorite, setLocalFavorite] = useState(false);
  const [sessionStep, setSessionStep] = useState<'cards' | 'story' | 'quiz' | 'finished'>('cards');
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [browserIndex, setBrowserIndex] = useState(0);

  const t = translations[targetLanguage as keyof typeof translations] || translations.en;

  // Handle step transitions safely
  useEffect(() => {
    if (dailyProgress >= dailyWords.length && dailyWords.length > 0 && sessionStep === 'cards') {
      setSessionStep('story');
    }
  }, [dailyProgress, dailyWords.length, sessionStep]);

  // Sync browser index with daily progress if needed
  useEffect(() => {
    if (dailyProgress < dailyWords.length && browserIndex < dailyProgress) {
      setBrowserIndex(dailyProgress);
    }
  }, [dailyProgress]);

  // Active Recall Quiz Questions (Port -> Target)
  const quizQuestions = useMemo(() => {
    if (dailyWords.length === 0) return [];
    return dailyWords.map(targetWord => {
      const correct = targetWord.word;
      const others = dailyWords.filter(w => w.id !== targetWord.id).map(w => w.word);
      const options = [correct, ...others.slice(0, 2)].sort(() => Math.random() - 0.5);

      const langName = targetLanguage === 'en' ? 'Inglês' : 
                       targetLanguage === 'es' ? 'Espanhol' : 
                       targetLanguage === 'fr' ? 'Francês' : 
                       targetLanguage === 'de' ? 'Alemão' : 'Italiano';

      return {
        question: `Como se diz "${targetWord.translation}" em ${langName}?`,
        correct,
        options
      };
    });
  }, [dailyWords, targetLanguage]);

  if (dailyWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <h2 className="text-2xl font-bold mb-4">No words today!</h2>
        <button onClick={onComplete} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold">Go Home</button>
      </div>
    );
  }

  if (sessionStep === 'story') {
    return (
      <div className="flex flex-col h-full bg-slate-50 px-6 py-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
           <button onClick={onComplete} className="p-2 text-slate-400 hover:text-slate-600">
             <X className="w-6 h-6" />
           </button>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{t.dailyStory}</span>
           <div className="w-10"></div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden mb-10"
          >
            <div className="bg-indigo-600 p-6 flex justify-between items-center">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
               </div>
               <button 
                 onClick={() => {
                   const speech = new SpeechSynthesisUtterance(dailyStory?.text || "");
                   speech.lang = targetLanguage === 'en' ? 'en-US' : 'es-ES';
                   window.speechSynthesis.speak(speech);
                 }}
                 className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
               >
                 <Play className="w-3 h-3 fill-current" /> Listen
               </button>
            </div>

            <div className="p-8">
              <p className="text-xl md:text-2xl font-serif leading-relaxed text-slate-800 mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left">
                {dailyStory?.text}
              </p>
              
              <div className="relative pt-8 border-t border-slate-50">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-white text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                   Translation
                 </div>
                 <p className="text-slate-500 leading-relaxed font-medium italic">
                   {dailyStory?.translation}
                 </p>
              </div>
            </div>
          </motion.div>
          
          <p className="text-center text-sm text-slate-400 font-medium max-w-xs mb-10 leading-relaxed">
             {targetLanguage === 'en' ? "Great job! This narrative uses all your new vocabulary in a professional context." :
              "¡Buen trabalho! Esta narrativa usa todo seu vocabulário novo em um contexto profissional."}
          </p>
        </div>

        <button 
          onClick={() => setSessionStep('quiz')}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] py-5 font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mb-4"
        >
          {t.takeQuiz}
        </button>
      </div>
    );
  }

  if (sessionStep === 'quiz') {
    const isQuizFinished = currentQuestionIndex >= quizQuestions.length;

    if (isQuizFinished) {
       return (
         <div className="flex flex-col h-full bg-slate-50 px-6 py-12 items-center justify-center text-center">
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
             <Check className="w-12 h-12 text-green-500 stroke-[3]" />
           </div>
           <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{t.masteryComplete}</h2>
           <p className="text-slate-500 font-medium mb-8">
             {t.quizSuccess} ({quizScore}/{quizQuestions.length})
           </p>
           <button 
             onClick={onComplete}
             className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 font-bold text-lg shadow-xl"
           >
             {t.finishSession}
           </button>
         </div>
       );
    }

    const currentQ = quizQuestions[currentQuestionIndex];

    const handleAnswer = (opt: string) => {
       if (selectedAnswer) return;
       setSelectedAnswer(opt);
       if (opt === currentQ.correct) {
         setQuizScore(s => s + 1);
       }
       setTimeout(() => {
          setCurrentQuestionIndex(i => i + 1);
          setSelectedAnswer(null);
       }, 1000);
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 px-6 py-8">
         <div className="flex justify-between items-center mb-10">
           <Brain className="w-6 h-6 text-indigo-600" />
           <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.activeRecall}</span>
           <div className="w-6"></div>
         </div>
         
         <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold text-slate-800 text-center mb-10">
              {currentQ.question}
            </h3>

            <div className="flex flex-col gap-4">
              {currentQ.options.map(opt => {
                let btnStyle = "bg-white text-slate-700 border-slate-200";
                if (selectedAnswer) {
                   if (opt === currentQ.correct) btnStyle = "bg-emerald-500 text-white border-emerald-500";
                   else if (opt === selectedAnswer) btnStyle = "bg-rose-500 text-white border-rose-500";
                   else btnStyle = "bg-white text-slate-200 opacity-50";
                }

                return (
                  <button 
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full p-5 rounded-2xl border-2 font-bold text-lg transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
         </div>
      </div>
    );
  }

  // Cards Step
  return (
    <div className="flex flex-col h-full bg-slate-50 px-6 py-6 pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-slate-200/40 rounded-full blur-3xl -z-10" />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onComplete} className="p-2.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-indigo-600 border border-slate-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5 flex-1 mx-6 justify-center">
          {dailyWords.map((w, idx) => (
            <div 
              key={w.id} 
              className={`h-1.5 flex-1 max-w-[24px] rounded-full transition-all duration-500 ${idx < dailyProgress ? 'bg-indigo-600' : idx === browserIndex ? 'bg-indigo-300' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
        <div className="w-10"></div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full flex items-center gap-4 relative">
          <button 
            onClick={() => setBrowserIndex(i => Math.max(0, i - 1))}
            disabled={browserIndex === 0}
            className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all active:scale-90 border border-white z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-[340px]">
            <AnimatePresence mode="popLayout">
              {dailyWords[browserIndex] ? (
                <WordCard 
                  key={dailyWords[browserIndex].id} 
                  word={dailyWords[browserIndex]} 
                  isFavorite={localFavorite} 
                  onToggleFavorite={() => setLocalFavorite(!localFavorite)}
                  lang={targetLanguage}
                />
              ) : null}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setBrowserIndex(i => Math.min(dailyWords.length - 1, i + 1))}
            disabled={browserIndex === dailyWords.length - 1}
            className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all active:scale-90 border border-white z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 flex gap-4 h-20 px-2">
        {[
          { label: t.again, q: 0, color: 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50', time: '1 min' },
          { label: t.good, q: 3, color: 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 hover:bg-slate-800', time: '1 day', flex: 'flex-[1.5]' },
          { label: t.easy, q: 5, color: 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50', time: '4 days' }
        ].map(btn => (
          <button 
            key={btn.label}
            disabled={!dailyWords[browserIndex] || browserIndex < dailyProgress}
            onClick={() => {
              markWordLearned(dailyWords[browserIndex], btn.q, localFavorite);
              if (browserIndex < dailyWords.length - 1) setBrowserIndex(i => i + 1);
            }}
            className={`flex-1 ${btn.flex || ''} ${btn.color} rounded-3xl py-3 flex flex-col items-center justify-center transition-all border-2 active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none`}
          >
            <span className="text-[11px] font-black uppercase tracking-wider">{btn.label}</span>
            <span className="text-[10px] font-bold opacity-40">{btn.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

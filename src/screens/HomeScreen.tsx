import { useStore } from '../store/useStore';
import { Flame, CheckCircle, Languages, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from '../translations';

export default function HomeScreen({ onStartSession }: { onStartSession: () => void }) {
  const { 
    streak, isDailyComplete, dailyWords, dailyProgress, 
    targetLanguage, setTargetLanguage, isLoading, 
    targetTheme, setTargetTheme, generateDailySession 
  } = useStore();

  const t = translations[targetLanguage as keyof typeof translations] || translations.en;
  const totalWordsToday = dailyWords.length > 0 ? dailyWords.length : 10;
  const progressPercent = (dailyProgress / totalWordsToday) * 100;

  return (
    <div className="flex flex-col h-full bg-slate-50 px-6 py-8 overflow-y-auto">
      {/* ... existing header ... */}
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl font-bold text-blue-600">
            {targetLanguage.toUpperCase()}
          </div>
          <select 
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value as any)}
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="font-bold text-orange-600">{streak}</span>
        </div>
      </header>

      {/* Hero / Daily Status */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mb-8 shrink-0">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-2">
          {isDailyComplete ? t.completed : t.readyToLearn}
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-6">
          {isDailyComplete ? t.congratulations : `${totalWordsToday} words waiting for you. Dive deep into your learning.`}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>{t.dailyGoal}</span>
            <span>{dailyProgress} / {totalWordsToday}</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </div>

        {!isDailyComplete && (
          <button 
            disabled={isLoading}
            onClick={async () => {
              if (dailyWords.length === 0) {
                await generateDailySession();
              }
              onStartSession();
            }}
            className={`w-full mt-4 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg'}`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> {t.startSession}
              </>
            )}
          </button>
        )}
        
        {isDailyComplete && (
          <div className="space-y-4 mt-4">
            <div className="w-full bg-emerald-50 text-emerald-600 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 border border-emerald-100">
              <CheckCircle className="w-6 h-6" /> {t.completed}
            </div>
            
            <button 
              onClick={() => {
                useStore.getState().resetDaily();
                generateDailySession();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-white" /> {t.startNewSession || "Nova Sessão"}
            </button>
          </div>
        )}
      </div>

      {/* Themes or Stats Preview */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2 shrink-0">{t.themes}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
         {[
           { id: 'travel', label: t.travel },
           { id: 'work', label: t.work },
           { id: 'school', label: t.school },
           { id: 'basics', label: t.basics }
         ].map((theme, i) => (
           <button 
             key={theme.id} 
             onClick={() => {
                setTargetTheme(theme.id);
                generateDailySession();
             }}
             className={`bg-white p-5 rounded-[24px] border-2 shadow-sm flex items-center gap-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${targetTheme === theme.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'}`}
           >
             <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${i===0 ? 'bg-indigo-50 text-indigo-600' : i===1 ? 'bg-purple-50 text-purple-600' : i===2 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Languages className="w-6 h-6" />
              </div>
             <span className="font-bold text-slate-800 text-lg">{theme.label}</span>
           </button>
         ))}
      </div>
    </div>
  );
}

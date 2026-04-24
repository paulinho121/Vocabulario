import { useStore } from '../store/useStore';
import { Volume2, Trophy, Star, History, Target } from 'lucide-react';
import { useState } from 'react';

export default function ProfileScreen() {
  const { streak, learnedUserWords, targetLanguage, toggleFavorite } = useStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');

  const wordsLearnedCount = learnedUserWords.length;
  const favoriteCount = learnedUserWords.filter(w => w.isFavorite).length;

  const playAudio = (wordText: string) => {
    const speech = new SpeechSynthesisUtterance(wordText);
    const langMap: Record<string, string> = { 'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT' };
    speech.lang = langMap[targetLanguage] || 'en-US';
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 px-6 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Your Profile</h2>

      {/* Tabs */}
      <div className="flex bg-slate-200/60 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Word History
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-200 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-3xl font-extrabold text-slate-800 mb-1">{streak}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Day Streak</span>
            </div>
            
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-200 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
              <span className="text-3xl font-extrabold text-slate-800 mb-1">{wordsLearnedCount}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Learned</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 mt-2">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Favorites ({favoriteCount})
            </h3>
            
            {favoriteCount === 0 ? (
               <p className="text-slate-400 text-sm text-center py-4">No favorites yet. Star words to save them!</p>
            ) : (
               <div className="flex flex-col gap-3">
                 {learnedUserWords.filter(w=>w.isFavorite).map(word => (
                   <div key={`fav-${word.id}`} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800">{word.word}</p>
                        <p className="text-xs text-slate-500">{word.translation}</p>
                      </div>
                      <button onClick={() => playAudio(word.word)} className="p-2 text-slate-400 hover:text-indigo-500 bg-white rounded-full shadow-sm">
                        <Volume2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto pb-4">
          {learnedUserWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-48 opacity-50">
               <History className="w-12 h-12 mb-4 text-slate-400" />
               <p className="text-slate-500 font-medium">Your learned words will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {learnedUserWords.slice().reverse().map(word => (
                <div key={`hist-${word.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{word.word}</h4>
                    <span className="text-sm text-slate-500">{word.translation}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => playAudio(word.word)}
                      className="p-2 rounded-full bg-slate-50 text-slate-500 hover:text-indigo-500 transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => toggleFavorite(word.id)}
                      className="p-2 rounded-full bg-slate-50 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${word.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

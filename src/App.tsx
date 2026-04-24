/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import HomeScreen from './screens/HomeScreen';
import SessionScreen from './screens/SessionScreen';
import ProfileScreen from './screens/ProfileScreen';
import Navigation from './components/Navigation';

type Tab = 'home' | 'session' | 'profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const { checkStreak, generateDailySession } = useStore();

  useEffect(() => {
    checkStreak();
    generateDailySession();
  }, [checkStreak, generateDailySession]);

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative flex flex-col overflow-hidden text-slate-800">
        
        <main className="flex-1 overflow-y-auto pb-20">
          {currentTab === 'home' && <HomeScreen onStartSession={() => setCurrentTab('session')} />}
          {currentTab === 'session' && <SessionScreen onComplete={() => setCurrentTab('home')} />}
          {currentTab === 'profile' && <ProfileScreen />}
        </main>

        <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />
      </div>
    </div>
  );
}


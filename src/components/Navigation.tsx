import { Home, BookOpen, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationProps {
  currentTab: 'home' | 'session' | 'profile';
  onChangeTab: (tab: 'home' | 'session' | 'profile') => void;
}

export default function Navigation({ currentTab, onChangeTab }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'session', icon: BookOpen, label: 'Learn' },
    { id: 'profile', icon: User, label: 'Profile' }
  ] as const;

  return (
    <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center px-4 py-3 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className="flex flex-col items-center justify-center w-16 h-12 relative group"
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute -top-3 w-8 h-1 bg-indigo-600 rounded-b-full"></span>
            )}
            <Icon 
              className={cn(
                "w-6 h-6 mb-1 transition-all duration-200 ease-out", 
                isActive ? "text-indigo-600 stroke-[2.5px] scale-110" : "text-slate-400 group-hover:text-slate-600"
              )} 
            />
            <span 
              className={cn(
                "text-[10px] font-bold transition-colors duration-200",
                isActive ? "text-indigo-600" : "text-slate-400"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

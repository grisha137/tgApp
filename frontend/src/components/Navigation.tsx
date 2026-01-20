/** Компонент навигации */

import React from 'react';
import type { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'game', label: 'Игра', icon: '🎮' },
  { id: 'upgrades', label: 'Апгрейды', icon: '⚡' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'profile', label: 'Профиль', icon: '👤' },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border px-4 py-2 z-40">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'text-primary-400 bg-primary-500/10 scale-105'
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-1 h-1 bg-primary-400 rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

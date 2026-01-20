/** Главный компонент приложения */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useGameState } from './hooks/useGameState';
import { LoginPage } from './pages/LoginPage';
import { GamePage } from './pages/GamePage';
import { UpgradesPage } from './pages/UpgradesPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage } from './pages/ProfilePage';
import { Navigation } from './components/Navigation';
import type { User, TabType } from './types';
import './index.css';

function App() {
  const { ready } = useTelegram();
  const [activeTab, setActiveTab] = useState<TabType>('game');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const gameState = useGameState();

  // Инициализация Telegram WebApp
  React.useEffect(() => {
    ready();
  }, [ready]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  // Если пользователь не авторизован, показываем страницу входа
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-white font-sans">
        {/* Хедер */}
        <header className="fixed top-0 left-0 right-0 bg-dark-card/80 backdrop-blur-lg border-b border-dark-border px-4 py-3 z-50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-lg">Idle Clicker</span>
            </div>
            {gameState.gameState && (
              <div className="flex items-center gap-2 bg-dark-bg px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-white">
                  {gameState.gameState.coins.toLocaleString('ru-RU')}
                </span>
                <span>💰</span>
              </div>
            )}
          </div>
        </header>

        {/* Основной контент */}
        <main className="pt-16 max-w-md mx-auto">
          {gameState.loading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : gameState.error ? (
            <div className="p-4">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Ошибка загрузки
                </h2>
                <p className="text-red-300 mb-4">{gameState.error}</p>
                <button
                  onClick={gameState.fetchGameState}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  activeTab === 'game' ? (
                    <GamePage
                      gameState={gameState.gameState}
                      onClick={gameState.handleClick}
                      claimDailyReward={gameState.claimDailyReward}
                    />
                  ) : (
                    <Navigate to={`/${activeTab}`} replace />
                  )
                }
              />
              <Route
                path="/game"
                element={
                  <GamePage
                    gameState={gameState.gameState}
                    onClick={gameState.handleClick}
                    claimDailyReward={gameState.claimDailyReward}
                  />
                }
              />
              <Route
                path="/upgrades"
                element={
                  <UpgradesPage
                    gameState={gameState.gameState}
                    onPurchaseUpgrade={gameState.purchaseUpgrade}
                  />
                }
              />
              <Route
                path="/stats"
                element={<StatsPage />}
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    user={gameState.gameState?.user || user}
                    onLogout={handleLogout}
                  />
                }
              />
            </Routes>
          )}
        </main>

        {/* Навигация */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Router>
  );
}

export default App;

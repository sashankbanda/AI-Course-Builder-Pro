
import React from 'react';
import { useCourseStore } from '../store/courseStore';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { AppState } from '../types';

export const Header: React.FC = () => {
  const { user, logout, navigateTo, appState, course } = useCourseStore();

  const handleDashboardClick = () => {
    navigateTo(AppState.DASHBOARD_VIEW);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigateTo(user ? AppState.TOPIC_INPUT : AppState.AUTH_VIEW)}
        >
          <BookOpenIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">AI Course Builder</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && course && appState !== AppState.DASHBOARD_VIEW && (
            <button
              onClick={handleDashboardClick}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="font-semibold">Dashboard</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:block">Welcome, {user.name}!</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
             !user && appState !== AppState.AUTH_VIEW && (
              <button
                onClick={() => navigateTo(AppState.AUTH_VIEW)}
                className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

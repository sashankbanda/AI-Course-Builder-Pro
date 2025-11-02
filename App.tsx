
import React from 'react';
import { useCourseStore } from './store/courseStore';
import { AppState } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import TopicInput from './components/TopicInput';
import Loader from './components/Loader';
import CourseDisplay from './components/CourseDisplay';
import LessonView from './components/LessonView';
import Dashboard from './components/Dashboard';
import AuthView from './components/AuthView';

function App() {
  const { appState, isLoading, error } = useCourseStore();

  const renderContent = () => {
    if (isLoading) return <Loader />;

    switch (appState) {
      case AppState.AUTH_VIEW:
        return <AuthView />;
      case AppState.TOPIC_INPUT:
        return <TopicInput />;
      case AppState.LOADING: // Handled by isLoading check above, but good to have
        return <Loader />;
      case AppState.COURSE_VIEW:
        return <CourseDisplay />;
      case AppState.LESSON_VIEW:
        return <LessonView />;
      case AppState.DASHBOARD_VIEW:
        return <Dashboard />;
      default:
        return <TopicInput />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
          <p className="font-bold">An Error Occurred</p>
          <p>{error}</p>
        </div>}
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

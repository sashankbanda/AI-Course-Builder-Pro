import React from 'react';
import { useCourseStore } from '../store/courseStore';
import { AppState } from '../types';
import ProgressBar from './ProgressBar';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const Dashboard: React.FC = () => {
  const { course, userProgress, navigateTo } = useCourseStore();

  if (!course) {
    return <div className="text-center">No course data available for dashboard.</div>;
  }
  
  const courseProgress = userProgress[course.title];
  if (!courseProgress) {
    return <div className="text-center">No progress data for this course.</div>;
  }

  const completedLessons = courseProgress.lessons.filter(l => l.completed);
  const totalLessons = course.lessons.length;
  const completionPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
  
  const averageScore = completedLessons.length > 0
    ? completedLessons.reduce((acc, l) => acc + (l.quizScore || 0), 0) / completedLessons.length
    : 0;
    
  const weakAreas = courseProgress.lessons
    .filter(l => l.quizScore !== null && l.quizScore < 70)
    .map(l => course.lessons.find(lesson => lesson._id === l.lessonId)?.title)
    .filter((title): title is string => !!title);


  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigateTo(AppState.COURSE_VIEW)}
        className="flex items-center gap-2 mb-6 text-primary font-semibold hover:underline"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Back to Course
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Dashboard</h2>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Overall Completion</h3>
          <ProgressBar percentage={completionPercentage} />
          <p className="text-gray-600 mt-2">{completedLessons.length} of {totalLessons} lessons completed</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Average Quiz Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{averageScore.toFixed(0)}%</span>
          </div>
          <p className="text-gray-600 mt-2">Based on completed lessons</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lesson Scores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Lesson Scores</h3>
          <ul className="space-y-3">
            {courseProgress.lessons.map(progress => {
              const lesson = course.lessons.find(l => l._id === progress.lessonId);
              if (!lesson) return null;
              return (
                <li key={lesson._id} className="flex justify-between items-center text-gray-700">
                  <span>{lesson.title}</span>
                  {progress.quizScore !== null ? (
                    <span className={`font-bold ${progress.quizScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {progress.quizScore}%
                    </span>
                  ) : (
                    <span className="text-gray-400">Not Taken</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Weak Areas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Areas to Improve</h3>
          {weakAreas.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside">
              {weakAreas.map((area, index) => (
                <li key={index} className="text-gray-700">{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Great job! No weak areas identified. Keep up the good work!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

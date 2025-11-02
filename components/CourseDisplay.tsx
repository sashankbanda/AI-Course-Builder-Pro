import React from 'react';
import { useCourseStore } from '../store/courseStore';
import ProgressBar from './ProgressBar';
import { CheckIcon } from './icons/CheckIcon';

const CourseDisplay: React.FC = () => {
  const { course, selectLesson, userProgress, resetCourse } = useCourseStore();

  if (!course) {
    return <div className="text-center text-gray-500">No course generated.</div>;
  }
  
  const courseProgress = userProgress[course.title];
  const completedLessons = courseProgress?.lessons.filter(l => l.completed).length || 0;
  const totalLessons = course.lessons.length;
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{course.title}</h2>
        <button 
          onClick={resetCourse}
          className="text-sm text-primary hover:underline"
        >
          Start a New Course
        </button>
      </div>
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Course Progress</h3>
        <ProgressBar percentage={completionPercentage} />
        <p className="text-sm text-gray-600 mt-2">{completedLessons} of {totalLessons} lessons completed.</p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">Lessons</h3>
        {course.lessons.map((lesson, index) => {
          const lessonP = courseProgress?.lessons.find(l => l.lessonId === lesson._id);
          const isCompleted = lessonP?.completed || false;
          
          return (
            <div
              key={lesson._id}
              onClick={() => selectLesson(lesson._id)}
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-primary'}`}>
                {isCompleted ? <CheckIcon className="w-6 h-6" /> : <span className="text-xl font-bold">{index + 1}</span>}
              </div>
              <div className="flex-grow">
                <h4 className="text-lg font-semibold text-gray-800">{lesson.title}</h4>
              </div>
              {isCompleted && lessonP?.quizScore !== null && (
                 <div className="text-sm font-semibold text-gray-600">
                    Score: {lessonP.quizScore}%
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseDisplay;

import React from 'react';
import { useCourseStore } from '../store/courseStore';
import { AppState } from '../types';
import Quiz from './Quiz';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const LessonView: React.FC = () => {
  const { selectedLesson, navigateTo, course, completeQuiz } = useCourseStore();

  if (!selectedLesson || !course) {
    return <div className="text-center">Lesson not found.</div>;
  }

  const handleQuizComplete = (score: number) => {
    completeQuiz(selectedLesson._id, score);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigateTo(AppState.COURSE_VIEW)}
        className="flex items-center gap-2 mb-6 text-primary font-semibold hover:underline"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Back to Course
      </button>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedLesson.title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-w-16 aspect-h-9 mb-6 bg-black rounded-lg shadow-lg overflow-hidden">
            <iframe
              src={selectedLesson.videoUrl}
              title={selectedLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          {/* Lesson Notes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Lesson Notes</h3>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: selectedLesson.notes.replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>').replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
        
        {/* Quiz */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-24">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Test Your Knowledge</h3>
            <Quiz 
              key={selectedLesson._id} // Add key to reset quiz state when lesson changes
              questions={selectedLesson.quiz} 
              onComplete={handleQuizComplete} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;

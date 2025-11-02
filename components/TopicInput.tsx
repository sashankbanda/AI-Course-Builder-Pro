
import React, { useState } from 'react';
import { useCourseStore } from '../store/courseStore';

const TopicInput: React.FC = () => {
  const [topic, setTopic] = useState('Java Programming');
  const generateCourse = useCourseStore(state => state.generateCourse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      generateCourse(topic.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
        Learn Anything, Instantly.
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Enter a topic you want to master, and our AI will build a personalized course for you, complete with video lessons, notes, and quizzes.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., 'Quantum Physics for Beginners'"
          className="flex-grow w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow duration-200"
        />
        <button
          type="submit"
          className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors duration-300 transform hover:scale-105 shadow-lg"
        >
          Generate Course
        </button>
      </form>
      <div className="mt-8 text-sm text-gray-500">
        <p>Example topics: 'React for Beginners', 'The History of Rome', 'Introduction to Machine Learning'</p>
      </div>
    </div>
  );
};

export default TopicInput;
   
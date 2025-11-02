
import React from 'react';

const Loader: React.FC = () => {
  const messages = [
    "Analyzing your topic...",
    "Curating the best videos...",
    "Summarizing lessons with AI...",
    "Building your quizzes...",
    "Finalizing your personalized course..."
  ];
  
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
        <div className="relative flex justify-center items-center">
            <div className="absolute w-24 h-24 rounded-full animate-ping bg-blue-200"></div>
            <div className="absolute w-16 h-16 rounded-full animate-ping bg-blue-300 delay-150"></div>
            <svg className="w-16 h-16 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-2">Building Your Course</h2>
      <p className="text-gray-600 transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;
   
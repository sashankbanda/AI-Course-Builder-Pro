
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const finalScore = (score / questions.length) * 100;
      onComplete(finalScore);
    }
  };
  
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const finalScore = (score / questions.length) * 100;
    return (
      <div className="text-center p-4">
        <h3 className="text-xl font-bold mb-2">Quiz Completed!</h3>
        <p className="text-lg mb-4">Your score: <span className="font-bold text-primary">{finalScore.toFixed(0)}%</span></p>
        <button
          onClick={handleRetry}
          className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
      <p className="font-semibold text-gray-800 mb-4">{currentQuestion.question}</p>
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswerIndex;
          const isSelected = index === selectedAnswerIndex;
          
          let buttonClass = 'w-full text-left p-3 border rounded-lg transition-all duration-200';
          
          if (isAnswered) {
            if (isCorrect) {
              buttonClass += ' bg-green-100 border-green-400 text-green-800';
            } else if (isSelected && !isCorrect) {
              buttonClass += ' bg-red-100 border-red-400 text-red-800';
            } else {
              buttonClass += ' bg-gray-100 border-gray-300 text-gray-600';
            }
          } else {
            buttonClass += ' bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400';
          }
          
          return (
            <button key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered} className={buttonClass}>
              <div className="flex justify-between items-center">
                <span>{option}</span>
                {isAnswered && isSelected && (isCorrect ? <CheckIcon className="w-5 h-5 text-green-600"/> : <XIcon className="w-5 h-5 text-red-600"/>)}
                {isAnswered && !isSelected && isCorrect && <CheckIcon className="w-5 h-5 text-green-600"/>}
              </div>
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <button
          onClick={handleNext}
          className="mt-6 w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      )}
    </div>
  );
};

export default Quiz;
   
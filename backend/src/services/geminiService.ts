import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizQuestion } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate subtopics for a given topic using Gemini AI
 */
export async function generateSubtopics(topic: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 3-5 essential subtopics for learning "${topic}" as a beginner.
Return ONLY a comma-separated list of subtopic names. No numbers, no explanations.

Example: Introduction to Basics, Core Concepts, Advanced Features

Subtopics:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Convert video transcript into structured lesson notes using Gemini AI
 */
export async function summarizeTranscript(transcript: string, subtopic: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Limit transcript to avoid token limits
    const limitedTranscript = transcript.substring(0, 15000);
    
    const prompt = `You are an expert educator. Create comprehensive lesson notes in ENGLISH from this video transcript.

TOPIC: ${subtopic}

VIDEO TRANSCRIPT:
${limitedTranscript}

Create structured lesson notes that include:
1. Clear headings (use ## and ###)
2. Key concepts and definitions
3. Important examples
4. Bullet points for easy reading
5. Simple language for beginners

Format in clean Markdown. Write everything in ENGLISH.

LESSON NOTES:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Generate quiz questions from lesson notes using Gemini AI
 */
export async function generateQuiz(notes: string, questionCount = 2): Promise<QuizQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create ${questionCount} multiple-choice quiz questions from these notes.

NOTES:
${notes.substring(0, 10000)}

Return ONLY valid JSON in this format:
[
  {
    "question": "What is...?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswerIndex": 0
  }
]

Rules:
- Exactly ${questionCount} questions
- 4 options each
- correctAnswerIndex: 0-3
- Test understanding, not memorization
- Return ONLY JSON, no other text`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Clean markdown
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const quizData = JSON.parse(text);
        
        // Validate
        if (Array.isArray(quizData) && quizData.length > 0) {
            return quizData.slice(0, questionCount);
        }
        
        throw new Error('Invalid quiz format');
    } catch (error) {
        console.error("Quiz generation failed:", error);
        // Return default question
        return [{
            question: "What is the main topic of this lesson?",
            options: ["Correct answer", "Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
            correctAnswerIndex: 0
        }];
    }
}
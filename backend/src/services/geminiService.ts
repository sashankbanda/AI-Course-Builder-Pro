
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateSubtopics(topic: string): Promise<string[]> {
    const prompt = `Based on the topic "${topic}", generate a list of 3 to 5 essential, ordered subtopics for a beginner's course. Return ONLY a comma-separated list. Example: Introduction to Java,Variables and Data Types,Control Flow Statements`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text.trim();
    return text.split(',').map(s => s.trim());
}

export async function summarizeTranscript(transcript: string, subtopic: string): Promise<string> {
    const prompt = `You are an expert educator. Summarize the following video transcript into clear, concise, well-formatted markdown notes for a lesson titled "${subtopic}". Focus on the key concepts, definitions, and examples. Use headings, bullet points, and code blocks where appropriate. The notes should be easy for a beginner to understand. TRANSCRIPT: """${transcript.substring(0, 15000)}"""`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
}

export async function generateQuiz(notes: string, questionCount = 2): Promise<QuizQuestion[]> {
     const prompt = `Based on the following lesson notes, create a multiple-choice quiz with ${questionCount} questions to test understanding. For each question, provide 4 options and indicate the correct one. NOTES: """${notes}"""`;

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        correctAnswerIndex: { type: Type.INTEGER }
                    },
                    required: ['question', 'options', 'correctAnswerIndex']
                }
            }
        }
     });

    try {
        const quizData = JSON.parse(response.text);
        // Mongoose will automatically add _id for subdocuments when the parent is saved.
        return quizData;
    } catch (e) {
        console.error("Failed to parse quiz JSON from Gemini:", e);
        // Fallback in case of parsing error
        return [];
    }
}

import { generateSubtopics, summarizeTranscript, generateQuiz } from './geminiService';
import { searchYouTubeVideos } from './youtubeService';
import { getTranscript } from './transcriptService';
import { getAudioTranscript } from './audioTranscriptService';  // ✅ NEW
import CourseModel from '../models/Course';
import { Course, Lesson } from '../types';
import mongoose from 'mongoose';

export const generateFullCourse = async (topic: string): Promise<Course> => {
    const existingCourse = await CourseModel.findOne({ topic: new RegExp(`^${topic}$`, 'i') });
    if (existingCourse) {
        console.log(`Course for topic "${topic}" found in cache. Returning from DB.`);
        return existingCourse.toObject();
    }

    console.log(`[1/5] Generating subtopics for: ${topic}`);
    const subtopics = await generateSubtopics(topic);
    console.log(`> Found subtopics: ${subtopics.join(', ')}`);

    const lessons: Omit<Lesson, '_id'>[] = [];

    for (const [index, subtopic] of subtopics.entries()) {
        try {
            console.log(`\n[${index + 2}/5] Processing subtopic: ${subtopic}`);

            console.log(`  -> Searching for videos on YouTube...`);
            const video = await searchYouTubeVideos(subtopic);
            if (!video) {
                console.warn(`  -> No suitable video found for "${subtopic}". Skipping lesson.`);
                continue;
            }
            console.log(`  -> Found video: ${video.title} (ID: ${video.id})`);

            console.log(`  -> Fetching transcript...`);
            let transcript = await getTranscript(video.id);

            // ✅ NEW FALLBACK: Use audio transcription if YouTube captions fail
            if (!transcript) {
                console.warn(`  -> No transcript found. Trying Whisper audio transcription...`);
                transcript = await getAudioTranscript(`https://www.youtube.com/watch?v=${video.id}`);
            }

            if (!transcript) {
                console.warn(`  -> Could not generate transcript for video ID ${video.id}. Skipping lesson.`);
                continue;
            }

            console.log(`  -> Transcript ready.`);

            console.log(`  -> Summarizing transcript into lesson notes...`);
            const notes = await summarizeTranscript(transcript, subtopic);
            console.log(`  -> Notes generated.`);

            console.log(`  -> Generating quiz...`);
            const quiz = await generateQuiz(notes);
            console.log(`  -> Quiz generated.`);

            lessons.push({
                title: subtopic,
                videoUrl: `https://www.youtube.com/embed/${video.id}`,
                notes,
                quiz,
            });
        } catch (error) {
            console.error(`Failed to process subtopic "${subtopic}":`, error);
        }
    }

    if (lessons.length === 0) {
        throw new Error('Could not generate any lessons for the given topic. Please try a different topic.');
    }

    console.log(`\n[5/5] Generating final quiz...`);
    const finalQuizNotes = lessons.map(l => l.notes).join('\n\n---\n\n');
    const finalQuiz = await generateQuiz(finalQuizNotes, 5);
    console.log(`> Course generation complete!`);

    const courseData = {
        topic: topic,
        title: `${topic} Masterclass`,
        lessons,
        finalQuiz,
    };

    const newCourse = new CourseModel(courseData);
    await newCourse.save();
    console.log(`New course for "${topic}" saved to the database.`);

    return newCourse.toObject();
};

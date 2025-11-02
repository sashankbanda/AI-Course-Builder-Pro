import { generateSubtopics, summarizeTranscript, generateQuiz } from './geminiService';
import { searchYouTubeVideos } from './youtubeService';
import { getTranscript } from './transcriptService';
import CourseModel from '../models/Course';
import { Course, Lesson } from '../types';

/**
 * YOUR ORIGINAL VISION:
 * 1. User enters topic
 * 2. Find best YouTube videos
 * 3. Extract transcript (captions OR Whisper AI)
 * 4. Generate notes in English using Gemini
 * 5. Create quiz
 */
export const generateFullCourse = async (topic: string): Promise<Course> => {
    // Check cache
    const existingCourse = await CourseModel.findOne({ topic: new RegExp(`^${topic}$`, 'i') });
    if (existingCourse) {
        console.log(`✓ Course "${topic}" found in database cache`);
        return existingCourse.toObject();
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎓 GENERATING COURSE: ${topic}`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Generate subtopics using AI
    console.log(`[1/5] 🤖 Generating subtopics with Gemini AI...`);
    const subtopics = await generateSubtopics(topic);
    console.log(`✓ Generated ${subtopics.length} subtopics:`);
    subtopics.forEach((st, i) => console.log(`  ${i + 1}. ${st}`));
    console.log();

    const lessons: Omit<Lesson, '_id'>[] = [];

    // Step 2-4: Process each subtopic
    for (const [index, subtopic] of subtopics.entries()) {
        try {
            console.log(`[${index + 2}/${subtopics.length + 1}] 📚 Processing: "${subtopic}"`);

            // Find best YouTube video
            console.log(`  🔍 Searching for best YouTube video...`);
            const video = await searchYouTubeVideos(subtopic);
            
            if (!video) {
                console.log(`  ⚠️  No video found, skipping...\n`);
                continue;
            }
            
            console.log(`  ✓ Found: "${video.title}"`);
            console.log(`    Video ID: ${video.id}`);

            // Extract transcript (YouTube captions OR Whisper AI)
            console.log(`  📝 Extracting transcript...`);
            const transcript = await getTranscript(video.id);

            if (!transcript || transcript.length < 100) {
                console.log(`  ⚠️  Transcript unavailable or too short, skipping...\n`);
                continue;
            }

            console.log(`  ✓ Transcript extracted (${transcript.length} characters)`);

            // Generate notes in English using Gemini
            console.log(`  🤖 Generating lesson notes with Gemini AI...`);
            const notes = await summarizeTranscript(transcript, subtopic);
            console.log(`  ✓ Notes generated in English`);

            // Create quiz
            console.log(`  ❓ Creating quiz questions...`);
            const quiz = await generateQuiz(notes, 2);
            console.log(`  ✓ Quiz created (${quiz.length} questions)\n`);

            // Add lesson
            lessons.push({
                title: subtopic,
                videoUrl: `https://www.youtube.com/embed/${video.id}`,
                notes,
                quiz,
            });

            console.log(`  ✅ Lesson "${subtopic}" completed!\n`);

        } catch (error: any) {
            console.log(`  ❌ Error processing "${subtopic}": ${error.message}\n`);
        }
    }

    // Validate we have at least one lesson
    if (lessons.length === 0) {
        throw new Error(
            '❌ Could not generate any lessons.\n\n' +
            'Possible reasons:\n' +
            '• Videos don\'t have captions and Whisper transcription failed\n' +
            '• YouTube API quota exceeded\n' +
            '• OpenAI API key invalid or quota exceeded\n' +
            '• Network issues\n\n' +
            'Solutions:\n' +
            '1. Check your API keys in backend/.env\n' +
            '2. Try a different topic\n' +
            '3. Wait a few minutes and try again'
        );
    }

    // Step 5: Generate final quiz
    console.log(`[5/5] 🎯 Creating final course quiz...`);
    const allNotes = lessons.map(l => l.notes).join('\n\n---\n\n');
    const finalQuiz = await generateQuiz(allNotes, 5);
    console.log(`✓ Final quiz created (${finalQuiz.length} questions)\n`);

    // Save to database
    const courseData = {
        topic: topic,
        title: `${topic} - Complete Course`,
        lessons,
        finalQuiz,
    };

    const newCourse = new CourseModel(courseData);
    await newCourse.save();

    console.log(`${'='.repeat(60)}`);
    console.log(`✅ COURSE GENERATED SUCCESSFULLY!`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Lessons: ${lessons.length}`);
    console.log(`   Total Quiz Questions: ${finalQuiz.length}`);
    console.log(`${'='.repeat(60)}\n`);

    return newCourse.toObject();
};
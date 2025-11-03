import { generateSubtopics, summarizeTranscript, generateQuiz } from './geminiService';
import { searchYouTubeVideos } from './youtubeService';
import { getTranscript } from './transcriptService';
import CourseModel from '../models/Course';
import { Course, Lesson } from '../types';

// Helper to convert high-res BigInt nanoseconds to a readable H:M:S string
const formatDuration = (start: bigint, end: bigint): string => {
    const durationMs = Number(end - start) / 1000000;
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.round(durationMs % 1000);
    
    // Format as H:M:S.ms (only show hours/minutes if needed)
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s (${milliseconds}ms)`;
    }
    return `${seconds.toString().padStart(2, '0')}s (${milliseconds}ms)`;
};


export const generateFullCourse = async (topic: string): Promise<Course> => {
    // Check cache
    const existingCourse = await CourseModel.findOne({ topic: new RegExp(`^${topic}`, 'i') });
    if (existingCourse) {
        console.log(`✓ Course "${topic}" found in database cache`);
        return existingCourse.toObject();
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎓 GENERATING COURSE: ${topic}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // START GLOBAL TIMER
    const startTimeGlobal = process.hrtime.bigint();

    // Step 1: Generate subtopics using AI
    console.log(`[1/5] 🤖 Generating subtopics with Gemini AI...`);
    const startTimeSubtopics = process.hrtime.bigint();
    const subtopics = await generateSubtopics(topic);
    const endTimeSubtopics = process.hrtime.bigint();
    
    console.log(`✓ Generated ${subtopics.length} subtopics. (Took ${formatDuration(startTimeSubtopics, endTimeSubtopics)})`);
    subtopics.forEach((st, i) => console.log(`  ${i + 1}. ${st}`));
    console.log();

    const lessons: Omit<Lesson, '_id'>[] = [];

    // Step 2-4: Process each subtopic
    for (const [index, subtopic] of subtopics.entries()) {
        try {
            console.log(`[${index + 2}/${subtopics.length + 1}] 📚 Processing: "${subtopic}"`);
            
            // --- Search YouTube (Quick Step) ---
            console.log(`  🔍 Searching for best YouTube video...`);
            const video = await searchYouTubeVideos(subtopic);
            
            if (!video) {
                console.log(`  ⚠️  No video found, skipping...\n`);
                continue;
            }
            
            console.log(`  ✓ Found: "${video.title}"`);
            console.log(`    Video ID: ${video.id}`);

            // --- Extract transcript (Timed Step) ---
            console.log(`  📝 Extracting transcript...`);
            const startTimeTranscript = process.hrtime.bigint();
            const transcript = await getTranscript(video.id);
            const endTimeTranscript = process.hrtime.bigint();
            const durationTranscript = formatDuration(startTimeTranscript, endTimeTranscript);

            if (!transcript || transcript.length < 100) {
                console.log(`  ⚠️  Transcript unavailable or too short, skipping... (Took ${durationTranscript})\n`);
                continue;
            }

            console.log(`  ✓ Transcript extracted (${transcript.length} characters). (Took ${durationTranscript})`);

            // --- Generate notes in English (Timed Step) ---
            console.log(`  🤖 Generating lesson notes with Gemini AI...`);
            const startTimeNotes = process.hrtime.bigint();
            const notes = await summarizeTranscript(transcript, subtopic);
            const endTimeNotes = process.hrtime.bigint();

            console.log(`  ✓ Notes generated in English. (Took ${formatDuration(startTimeNotes, endTimeNotes)})`);

            // --- Create quiz (Timed Step) ---
            console.log(`  ❓ Creating quiz questions...`);
            const startTimeQuiz = process.hrtime.bigint();
            const quiz = await generateQuiz(notes, 2);
            const endTimeQuiz = process.hrtime.bigint();
            
            console.log(`  ✓ Quiz created (${quiz.length} questions). (Took ${formatDuration(startTimeQuiz, endTimeQuiz)})\n`);

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
            '• Whisper model still downloading in the background\n' +
            '• Network issues\n\n' +
            'Solutions:\n' +
            '1. Check your API keys in backend/.env\n' +
            '2. Try a different topic\n' +
            '3. Wait a few minutes and try again'
        );
    }

    // Step 5: Generate final quiz
    console.log(`[${subtopics.length + 1}/${subtopics.length + 1}] 🎯 Creating final course quiz...`);
    const startTimeFinalQuiz = process.hrtime.bigint();
    const allNotes = lessons.map(l => l.notes).join('\n\n---\n\n');
    const finalQuiz = await generateQuiz(allNotes, 5);
    const endTimeFinalQuiz = process.hrtime.bigint();
    
    console.log(`✓ Final quiz created (${finalQuiz.length} questions). (Took ${formatDuration(startTimeFinalQuiz, endTimeFinalQuiz)})\n`);

    // Save to database
    const courseData = {
        topic: topic,
        title: `${topic} - Complete Course`,
        lessons,
        finalQuiz,
    };

    const newCourse = new CourseModel(courseData);
    await newCourse.save();

    // END GLOBAL TIMER
    const endTimeGlobal = process.hrtime.bigint();
    const durationGlobal = formatDuration(startTimeGlobal, endTimeGlobal);

    console.log(`${'='.repeat(60)}`);
    console.log(`✅ COURSE GENERATED SUCCESSFULLY!`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Lessons: ${lessons.length}`);
    console.log(`   Total Quiz Questions: ${finalQuiz.length}`);
    console.log(`⏱️ TOTAL TIME: ${durationGlobal}`);
    console.log(`${'='.repeat(60)}\n`);

    return newCourse.toObject();
};
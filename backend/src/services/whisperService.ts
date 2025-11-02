import fs from "fs";
import path from "path";
import play from "play-dl";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Temporary folder for audio files
const TEMP_DIR = path.resolve(__dirname, "../../temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download audio from YouTube and transcribe using OpenAI Whisper
 * Uses play-dl library which is more reliable than ytdl-core
 */
export async function transcribeAudioWithWhisper(videoId: string): Promise<string | null> {
  const audioPath = path.join(TEMP_DIR, `${videoId}.mp3`);
  
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`    → Downloading audio from YouTube...`);
    
    // Get video info using play-dl
    const videoInfo = await play.video_info(videoUrl);
    const stream = await play.stream(videoUrl, { quality: 2 }); // Audio only
    
    // Save audio to file
    const writeStream = fs.createWriteStream(audioPath);
    stream.stream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      stream.stream.on('error', reject);
    });
    
    console.log(`    ✓ Audio downloaded successfully`);
    
    // Check file size (Whisper has 25MB limit)
    const stats = fs.statSync(audioPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > 25) {
      console.log(`    ✗ Audio file too large (${fileSizeMB.toFixed(2)}MB). Whisper limit is 25MB.`);
      fs.unlinkSync(audioPath);
      return null;
    }
    
    console.log(`    → Transcribing audio with Whisper AI (${fileSizeMB.toFixed(2)}MB)...`);
    
    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      language: "en", // Force English
      response_format: "text",
    });
    
    // Cleanup
    fs.unlinkSync(audioPath);
    
    if (transcription && typeof transcription === 'string' && transcription.length > 50) {
      console.log(`    ✓ Whisper transcription complete (${transcription.length} characters)`);
      return transcription;
    }
    
    console.log(`    ✗ Transcription too short or invalid`);
    return null;
    
  } catch (error: any) {
    console.log(`    ✗ Whisper transcription failed: ${error.message}`);
    
    // Cleanup on error
    if (fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return null;
  }
}
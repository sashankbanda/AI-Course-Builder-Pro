import { YoutubeTranscript } from "youtube-transcript";
import { transcribeAudioWithWhisper } from "./whisperService";

/**
 * Get transcript from YouTube video
 * First tries to get captions/subtitles from YouTube
 * If that fails, downloads audio and transcribes with Whisper AI
 */
export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    console.log(`  → Attempting to fetch YouTube captions...`);
    
    // Try to get YouTube's built-in captions/subtitles
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcriptData && transcriptData.length > 0) {
      const fullTranscript = transcriptData.map((t: any) => t.text).join(" ");
      console.log(`  ✓ YouTube captions found (${fullTranscript.length} characters)`);
      return fullTranscript;
    }
  } catch (error: any) {
    console.log(`  ✗ No YouTube captions available: ${error.message}`);
  }

  // Fallback: Use Whisper AI to transcribe audio
  console.log(`  → Falling back to Whisper AI audio transcription...`);
  return await transcribeAudioWithWhisper(videoId);
}
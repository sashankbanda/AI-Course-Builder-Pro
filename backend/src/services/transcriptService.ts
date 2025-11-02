import { transcribeFromYouTube } from "./whisperService";
import { YoutubeTranscript } from "youtube-transcript";

export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    // Try getting YouTube's built-in captions first
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcriptData && transcriptData.length > 0) {
      return transcriptData.map((t: any) => t.text).join(" ");
    }
  } catch (error) {
    console.warn(`No transcript found for video ID: ${videoId}`);
  }

  // Fallback to Whisper audio transcription
  console.log("Trying Whisper audio transcription...");
  return await transcribeFromYouTube(videoId);
}
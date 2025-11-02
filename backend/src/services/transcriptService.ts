import { transcribeFromYouTube } from "./whisperService";
import { getTranscript as getYouTubeTranscript } from "youtube-transcript";

export async function getTranscript(videoId: string): Promise<string | null> {
  try {
    const transcriptData = await getYouTubeTranscript(videoId);
    if (transcriptData && transcriptData.length > 0) {
      return transcriptData.map((t) => t.text).join(" ");
    }
  } catch {
    console.warn(`No transcript found for video ID: ${videoId}`);
  }

  console.log("Trying Whisper audio transcription...");
  return await transcribeFromYouTube(videoId);
}

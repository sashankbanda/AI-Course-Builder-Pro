import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ytdl from "ytdl-core";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// temporary folder for audio files
const TEMP_DIR = path.resolve(__dirname, "../../temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

ffmpeg.setFfmpegPath(ffmpegPath!);

export async function transcribeFromYouTube(videoId: string): Promise<string | null> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const audioPath = path.join(TEMP_DIR, `${videoId}.mp3`);

    // 1. Download audio only
    await new Promise<void>((resolve, reject) => {
      const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });
      ffmpeg(stream)
        .audioBitrate(128)
        .save(audioPath)
        .on("end", () => resolve())
        .on("error", reject);
    });

    // 2. Send audio to Whisper
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    // 3. Clean up temporary file
    fs.unlinkSync(audioPath);

    return response.text;
  } catch (err) {
    console.error("Whisper transcription failed:", err);
    return null;
  }
}

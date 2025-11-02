import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAudioTranscript = async (videoUrl: string): Promise<string | null> => {
  try {
    const outputDir = path.resolve("temp");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const audioPath = path.join(outputDir, "audio.mp3");

    // Step 1: Download YouTube audio
    await new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" })
        .pipe(fs.createWriteStream(audioPath));
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // Step 2: Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    fs.unlinkSync(audioPath);
    return transcription.text || null;
  } catch (error) {
    console.error("Error in getAudioTranscript:", error);
    return null;
  }
};

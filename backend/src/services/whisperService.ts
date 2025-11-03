import { spawn } from "child_process";
import path from "path";
// REMOVED: import play from "play-dl";
// REMOVED: import OpenAI from "openai";
// The previous code using play-dl and OpenAI is now obsolete.

/**
 * Download audio from YouTube and transcribe using a local Python/Whisper-large-v3 script.
 * This utilizes a local GPU for highly performant, server-side transcription.
 */
export async function transcribeAudioWithWhisper(videoId: string): Promise<string | null> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const pythonScriptPath = path.join(__dirname, '../../whisper_transcriber.py');

  return new Promise((resolve) => {
    // Use 'python3' for better compatibility across systems. Windows might require 'python'.
    const pythonExecutable = path.join(process.cwd(), 'venv_whisper', 'Scripts', 'python.exe'); 
    
    // Command: python3 whisper_transcriber.py <videoUrl>
    const child = spawn(pythonExecutable, [pythonScriptPath, videoUrl], {
        // Set working directory to backend/ for relative path resolution in Python script
        cwd: path.join(__dirname, '../../'),
    });

    let transcript = '';
    let errorOutput = '';

    // Collect data from stdout (the successful transcript)
    child.stdout.on('data', (data) => {
      transcript += data.toString();
    });

    // Collect data from stderr (logs and Python script errors)
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      // Print Python's logs to the Node.js console for debugging
      console.error(`  [Python Whisper Log]: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      if (code === 0 && transcript.length > 50) {
        // Success: return the collected transcript
        console.log(`    ✓ Local GPU transcription complete (${transcript.length} characters)`);
        resolve(transcript.trim());
      } else {
        // Failure: log error and return null
        console.log(`    ✗ Local GPU transcription failed (Exit Code: ${code})`);
        console.error(`    Last Python Error Output: ${errorOutput.trim()}`);
        resolve(null);
      }
    });

    child.on('error', (err) => {
        // Handle critical errors like 'python3' command not found
        console.error(`    ✗ Failed to start Python process: ${err.message}`);
        console.error("    Please check the Troubleshooting section for Python/FFmpeg setup.");
        resolve(null);
    });
  });
}
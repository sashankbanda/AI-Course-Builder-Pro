import sys
import os
import torch
import librosa
import warnings
from yt_dlp import YoutubeDL
from transformers import pipeline
from pathlib import Path

# Suppress warnings
warnings.filterwarnings("ignore")

# --- Configuration ---
# This script relies on FFMPEG being available in the system PATH.
# We will use 'temp_audio' inside the backend folder for temporary files.
os.makedirs(Path('temp_audio'), exist_ok=True)
MODEL = "openai/whisper-large-v3"

# --- Initialization: Load Model ---
try:
    DEVICE_ID = 0 if torch.cuda.is_available() else -1
    DEVICE = 'cuda' if DEVICE_ID >= 0 else 'cpu'
    
    # Load model 
    transcriber = pipeline(
        "automatic-speech-recognition",
        model=MODEL,
        device=DEVICE_ID,
    )
    print(f"Whisper Model loaded successfully on {DEVICE}.", file=sys.stderr)
except Exception as e:
    print(f"Error loading Whisper model: {e}", file=sys.stderr)
    sys.exit(1)

def download_audio_and_transcribe(youtube_url):
    """Download audio from YouTube using yt-dlp and transcribe."""
    audio_path = None
    try:
        # Step 1: Download YouTube audio as a high-quality WAV
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
            # Save to temp_audio/youtube_audio.wav
            'outtmpl': str(Path('temp_audio') / 'youtube_audio'), 
            'quiet': True,
            'no_warnings': True,
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        
        # Find the actual downloaded file name 
        actual_audio_file = next(Path('temp_audio').glob('youtube_audio.*'), None)
        if not actual_audio_file:
            raise Exception("Failed to find downloaded audio file.")
        
        audio_path = str(actual_audio_file)

        # Step 2: Transcribe audio
        audio, sr = librosa.load(audio_path, sr=16000)
        
        result = transcriber(
            audio,
            task="transcribe",
            language="en",
            chunk_length_s=30, # Optimization for long audio
            stride=(4, 2)
        )
        
        return result['text']

    except Exception as e:
        raise Exception(f"Transcription failure: {e}")
    finally:
        # Step 3: Cleanup (only executed if audio_path was successfully set)
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
        # Clean up any other fragments
        for f in Path('temp_audio').glob('*'):
            if f.is_file():
                os.remove(f)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing YouTube URL argument.", file=sys.stderr)
        sys.exit(1)

    youtube_url = sys.argv[1]
    
    try:
        transcript = download_audio_and_transcribe(youtube_url)
        if transcript and len(transcript.strip()) > 50:
            print(transcript.strip()) # Output final transcript to stdout
            sys.exit(0)
        else:
            print("Error: Transcript generation failed to return content.", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        # All errors go to stderr
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
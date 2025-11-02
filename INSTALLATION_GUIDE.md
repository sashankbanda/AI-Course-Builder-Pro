# 🎓 AI Course Builder - Installation Guide

## Your Vision Restored ✅

**What this app does:**
1. User enters a topic they want to learn
2. Finds the BEST YouTube video for that topic
3. Extracts transcript from video:
   - First tries YouTube captions/subtitles
   - If not available → Uses **local** OpenAI Whisper to transcribe audio (via Python script)
4. Sends transcript to Gemini AI to generate lesson notes in English
5. Creates quiz questions

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3 (v3.8 or higher)
- **FFmpeg** (must be installed and accessible via your system PATH)
- MongoDB (running locally or remote)
- API Keys:
  - **Google Gemini API Key** (for generating notes)
  - **YouTube API Key** (for searching videos)

---

## 🚀 Installation Steps

### 1. Backend Setup (Node.js/TypeScript)

```bash
cd backend

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 2. Python Environment Setup (for Whisper Transcription)

This script uses the powerful Whisper Large v3 model. A GPU with CUDA is highly recommended for performance.

```bash
# Navigate to backend directory
cd backend

# Create and activate a Python virtual environment (recommended)
python3 -m venv venv_whisper
source venv_whisper/bin/activate  # Windows: venv_whisper\Scripts\activate

# Install requirements
# If you have a CUDA GPU, ensure you install the correct torch version (pip is smart, but check documentation).
pip install -r whisper_requirements.txt
```

### 3. Configure Environment Variables

Create/Edit `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-course-builder

# Google Gemini AI (for generating notes)
GEMINI_API_KEY=AIzaSyC8f5_SDs2kEvI005nLGqnTMZCIaVCyMKc

# YouTube Data API (for searching videos)
YOUTUBE_API_KEY=AIzaSyDsB2x8o4Zh4clZBfqiNx5Cfil0VjJXK0o

# OPENAI_API_KEY is no longer required as transcription runs locally

# JWT for authentication
JWT_SECRET=9490326450

# Server port
PORT=5001
```

### 4. Start Backend

**IMPORTANT:** You must run `npm run dev` from the terminal where your Python virtual environment (`venv_whisper`) is **activated**. This ensures Node.js finds the correct `python3` with all the necessary libraries.

```bash
# Make sure MongoDB is running and Python environment is activated
# Windows: Services → MongoDB → Start (for MongoDB)
# Mac/Linux: sudo systemctl start mongodb (for MongoDB)

npm run dev
```

You should see:
```
Server is running on port 5001
MongoDB Connected...
```

### 5. Frontend Setup

Open NEW terminal (no Python environment needed here):

```bash
cd ..  # Go to root directory
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

---

## 🎯 How It Works

### Example: User enters "Python basics"

1.  **Search YouTube**: Finds best tutorial video
2.  **Try YouTube Captions**:
    -   ✅ If available → Use captions
    -   ❌ If not available → Download audio
3.  **Whisper Transcription** (if needed):
    -   Downloads audio using `play-dl`
    -   Sends to **local Python Whisper script**
    -   Gets English transcript
4.  **Generate Notes**:
    -   Sends transcript to Gemini AI
    -   Gets structured notes in English
5.  **Create Quiz**:
    -   Gemini generates questions from notes
6.  **Save Course**: Stores in MongoDB

---

## 🐛 Troubleshooting

### Error: "Could not extract functions"
❌ **Old Solution:** This was ytdl-core issue
✅ **Fixed:** Now using `play-dl` library

### Error: "Status code: 403"
**Cause:** YouTube blocking download
**Solution:** `play-dl` handles this better

### Error: "YouTube API quota exceeded"
**Solution:**
- Wait 24 hours (quota resets daily)
- Or get new YouTube API key

### No transcript found
**This is normal!** Not all videos have captions.
The app will automatically:
1. Try captions first
2. If no captions → Use Whisper (local)
3. If Whisper fails → Try next video

### FFmpeg
Ensure FFmpeg is installed and in your system PATH. The Python script needs it to download audio.

### Python Environment
If you get an error like "Failed to start Python process" or "ModuleNotFoundError," ensure your Python virtual environment is activated before running `npm run dev` and that the `python3` command is correctly calling the interpreter with the installed packages.

### GPU Memory
If you encounter "CUDA out of memory" errors, you may need a GPU with at least 8GB of VRAM for the Whisper Large v3 model.

---

## 💡 Testing

Try these topics (good for testing):
- "JavaScript basics"
- "Python for beginners"
- "HTML tutorial"
- "Git fundamentals"

---

## 📝 Notes

- **First lesson may take 2-3 minutes** (downloading + transcribing - especially with local Whisper on CPU or slower GPU)
- **Subsequent lessons are faster** (if captions available)
- **Course is cached** in MongoDB (instant next time)
- **Whisper cost**: Local Whisper has no API cost, but consumes local resources.

---

## 🎉 Your Vision is Intact!

This implementation preserves your original concept, replacing the **OpenAI Whisper API** with a **local, GPU-accelerated Python Whisper script**.
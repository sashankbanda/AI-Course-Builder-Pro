# 🎓 AI Course Builder - Installation Guide

## Your Vision Restored ✅

**What this app does:**
1. User enters a topic they want to learn
2. Finds the BEST YouTube video for that topic
3. Extracts transcript from video:
   - First tries YouTube captions/subtitles
   - If not available → Uses OpenAI Whisper to transcribe audio
4. Sends transcript to Gemini AI to generate lesson notes in English
5. Creates quiz questions

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- API Keys:
  - **OpenAI API Key** (for Whisper - audio transcription)
  - **Google Gemini API Key** (for generating notes)
  - **YouTube API Key** (for searching videos)

---

## 🚀 Installation Steps

### 1. Backend Setup

```bash
cd backend

# Delete old files (if they exist)
rm src/services/audioTranscriptService.ts 2>/dev/null || true

# Clean install
rm -rf node_modules package-lock.json
npm install

# The package.json now includes:
# - @google/generative-ai (Gemini AI)
# - openai (Whisper transcription)
# - play-dl (YouTube audio download - better than ytdl-core)
# - youtube-transcript (for captions)
```

### 2. Configure Environment Variables

Create/Edit `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-course-builder

# Google Gemini AI (for generating notes)
GEMINI_API_KEY=AIzaSyC8f5_SDs2kEvI005nLGqnTMZCIaVCyMKc

# YouTube Data API (for searching videos)
YOUTUBE_API_KEY=AIzaSyDsB2x8o4Zh4clZBfqiNx5Cfil0VjJXK0o

# OpenAI (for Whisper audio transcription)
OPENAI_API_KEY=your_openai_api_key_here

# JWT for authentication
JWT_SECRET=9490326450

# Server port
PORT=5001
```

### 3. Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Create account / Login
3. Click "Create new secret key"
4. Copy the key and paste in `.env` file

### 4. Start Backend

```bash
# Make sure MongoDB is running
# Windows: Services → MongoDB → Start
# Mac/Linux: sudo systemctl start mongodb

npm run dev
```

You should see:
```
Server is running on port 5001
MongoDB Connected...
```

### 5. Frontend Setup

Open NEW terminal:

```bash
cd ..  # Go to root directory
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

---

## 🎯 How It Works

### Example: User enters "Python basics"

1. **Search YouTube**: Finds best tutorial video
2. **Try YouTube Captions**: 
   - ✅ If available → Use captions
   - ❌ If not available → Download audio
3. **Whisper Transcription** (if needed):
   - Downloads audio using `play-dl`
   - Sends to OpenAI Whisper API
   - Gets English transcript
4. **Generate Notes**:
   - Sends transcript to Gemini AI
   - Gets structured notes in English
5. **Create Quiz**: 
   - Gemini generates questions from notes
6. **Save Course**: Stores in MongoDB

---

## 🐛 Troubleshooting

### Error: "Could not extract functions"
❌ **Old Solution:** This was ytdl-core issue  
✅ **Fixed:** Now using `play-dl` library

### Error: "Status code: 403"
**Cause:** YouTube blocking download  
**Solution:** `play-dl` handles this better

### Error: "Whisper transcription failed"
**Check:**
1. OpenAI API key is valid
2. You have credits in OpenAI account
3. Audio file is under 25MB

### Error: "YouTube API quota exceeded"
**Solution:** 
- Wait 24 hours (quota resets daily)
- Or get new YouTube API key

### No transcript found
**This is normal!** Not all videos have captions.
The app will automatically:
1. Try captions first
2. If no captions → Use Whisper
3. If Whisper fails → Try next video

---

## 💡 Testing

Try these topics (good for testing):
- "JavaScript basics"
- "Python for beginners"  
- "HTML tutorial"
- "Git fundamentals"

---

## 📝 Notes

- **First lesson may take 2-3 minutes** (downloading + transcribing)
- **Subsequent lessons are faster** (if captions available)
- **Course is cached** in MongoDB (instant next time)
- **Whisper cost**: ~$0.006 per minute of audio

---

## 🎉 Your Vision is Intact!

This implementation preserves your original concept:
- ✅ Best video selection
- ✅ Transcript extraction (captions OR Whisper)
- ✅ English notes generation with Gemini
- ✅ Quiz creation
- ✅ Complete course builder

The only change: Using `play-dl` instead of broken `ytdl-core`.
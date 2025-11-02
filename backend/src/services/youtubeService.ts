import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not defined in environment variables.');
}

interface YouTubeVideo {
    id: string;
    title: string;
}

/**
 * Search for the best educational video on YouTube for a given topic
 */
export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo | null> => {
    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet',
                q: `${query} tutorial for beginners`,
                type: 'video',
                videoDefinition: 'high',
                maxResults: 1,
                key: YOUTUBE_API_KEY,
                relevanceLanguage: 'en',
                order: 'relevance',
            },
        });

        const items = response.data.items;
        if (items && items.length > 0) {
            return {
                id: items[0].id.videoId,
                title: items[0].snippet.title,
            };
        }
        
        return null;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('    YouTube API Error:', error.response.data?.error?.message);
            if (error.response.status === 403) {
                console.error('    ⚠️  YouTube API quota exceeded!');
            }
        } else {
            console.error('    Error:', error.message);
        }
        return null;
    }
};
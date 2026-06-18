import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateItinerary, editItinerary, generalChat } from './engine.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[TripPilot Backend] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Generate Trip Itinerary
app.post('/api/generate', async (req, res) => {
  try {
    const params = req.body;
    const customKey = req.headers['x-openai-key'] as string;
    console.log('[TripPilot Backend] Generating itinerary for:', params.start_location, '->', params.destinations);
    const result = await generateItinerary(params, customKey);
    res.json(result);
  } catch (error: any) {
    console.error('[TripPilot Backend] Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate itinerary' });
  }
});

// Edit Trip Itinerary
app.post('/api/edit', async (req, res) => {
  try {
    const { currentItinerary, message } = req.body;
    const customKey = req.headers['x-openai-key'] as string;
    console.log('[TripPilot Backend] Editing itinerary with command:', message);
    const result = await editItinerary(currentItinerary, message, customKey);
    res.json(result);
  } catch (error: any) {
    console.error('[TripPilot Backend] Editing error:', error);
    res.status(500).json({ error: error.message || 'Failed to edit itinerary' });
  }
});

// General Chat Advisor
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const customKey = req.headers['x-openai-key'] as string;
    console.log('[TripPilot Backend] Chat advisory query:', message);
    const result = await generalChat(message, history, customKey);
    res.json(result);
  } catch (error: any) {
    console.error('[TripPilot Backend] Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate advisory response' });
  }
});

// Support local execution directly (when run via tsx watch api/index.ts)
app.listen(PORT, () => {
  console.log(`[TripPilot Backend] Server running on http://localhost:${PORT}`);
});

export default app;

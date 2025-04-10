require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://openrouter.ai"],
      fontSrc: ["'self'", "data:"],
    }
  }
}));
app.use(cors());
app.use(express.json());

// Static file serving
app.use(express.static(path.join(__dirname, isProduction ? 'public' : '')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve the home page as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, isProduction ? 'public/home_page.html' : 'home_page.html'));
});

// Serve the chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, isProduction ? 'public/chat_page.html' : 'chat_page.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    // Ensure system message is only sent once
    let hasSystemMessage = false;
    const cleanedMessages = messages.filter(msg => {
      if (msg.role === 'system') {
        if (hasSystemMessage) return false;
        hasSystemMessage = true;
      }
      return true;
    });
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',  // Changed to DeepSeek R1 free model on OpenRouter
        messages: cleanedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AIethic Chat'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error communicating with AI service',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Catch-all route to handle SPA routing
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
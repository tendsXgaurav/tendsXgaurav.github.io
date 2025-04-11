// Server-side code for handling chat requests
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to check for API key
function validateApiKey(req, res, next) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key is not configured' 
    });
  }
  next();
}

// Chat endpoint
router.post('/', validateApiKey, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.5-preview',
      messages: messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Don't expose sensitive error details to client
    const safeError = {
      message: 'An error occurred while processing your request',
      status: error.status || 500
    };
    
    res.status(error.status || 500).json({ error: safeError });
  }
});

module.exports = router;

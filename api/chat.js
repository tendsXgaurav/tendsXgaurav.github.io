// Server-side code for handling chat requests
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';

dotenv.config();
const router = express.Router();

// Middleware to check for configuration
function validateConfig(req, res, next) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ 
      error: 'Hugging Face API key is not configured' 
    });
  }
  if (!process.env.HUGGINGFACE_SPACE_URL) {
    return res.status(500).json({ 
      error: 'Hugging Face model URL is not configured' 
    });
  }
  next();
}

// Format messages for Mistral model
function formatMessagesForMistral(messages) {
  let prompt = "";
  
  // Add system message if it exists
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage) {
    prompt += `<s>[INST] ${systemMessage.content} [/INST]</s>\n`;
  }
  
  // Add user-assistant message pairs, ensuring we properly format them
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    
    // Skip system messages as they're handled above
    if (message.role === 'system') continue;
    
    if (message.role === 'user') {
      // Check if next message is an assistant message
      const nextMessage = i + 1 < messages.length ? messages[i + 1] : null;
      
      if (nextMessage && nextMessage.role === 'assistant') {
        // This is a paired conversation
        prompt += `<s>[INST] ${message.content} [/INST] ${nextMessage.content}</s>\n`;
        i++; // Skip the assistant message in the next iteration
      } else {
        // This is the latest user message without a response yet
        prompt += `<s>[INST] ${message.content} [/INST]`;
      }
    }
  }
  
  return prompt;
}

// Chat endpoint
router.post('/', validateConfig, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    
    // Format messages for Mistral model
    const formattedPrompt = formatMessagesForMistral(messages);
    
    console.log(`Processing request with formatted prompt length: ${formattedPrompt.length} chars`);
    
    // Call Hugging Face Inference API for Mistral model
    const response = await fetch(process.env.HUGGINGFACE_SPACE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: parseInt(process.env.MAX_NEW_TOKENS || '1024'),
          temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
          top_p: parseFloat(process.env.TOP_P || '0.95'),
          do_sample: true
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error response: ${response.status} - ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Received response from Hugging Face API');
    
    // Extract the generated text from the Inference API response
    let generatedText = '';
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else {
      generatedText = "I'm sorry, I couldn't generate a proper response at this time.";
    }
    
    // Clean up the response by removing the original prompt and formatting tags
    generatedText = generatedText.replace(formattedPrompt, '').trim();
    generatedText = generatedText.replace(/^\s*\[\/INST\]\s*/, '');
    generatedText = generatedText.replace(/<\/?s>/g, '');
    
    // Format the response to match OpenAI format for compatibility with the frontend
    const formattedResponse = {
      choices: [
        {
          message: {
            role: "assistant",
            content: generatedText
          }
        }
      ]
    };
    
    res.json(formattedResponse);
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    
    // Don't expose sensitive error details to client
    const safeError = {
      message: 'An error occurred while processing your request',
      status: error.status || 500
    };
    
    res.status(error.status || 500).json({ error: safeError });
  }
});

export default router;

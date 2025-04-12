const { app } = require('@azure/functions');
const { OpenAI } = require('openai');

app.http('chat', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { messages } = body;
            
            if (!messages || !Array.isArray(messages)) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Invalid request format' }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                };
            }
            
            // Initialize OpenAI client - use Key Vault for production
            const openai = new OpenAI({
                apiKey: process.env.OPENROUTER_API_KEY,
            });
            
            // Implement retry logic for resilience
            const maxRetries = 3;
            let retries = 0;
            let response;
            
            while (retries < maxRetries) {
                try {
                    response = await openai.chat.completions.create({
                        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-search-preview',
                        messages: messages,
                        max_tokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '2048'),
                        temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
                    });
                    break; // Success, exit the retry loop
                } catch (error) {
                    retries++;
                    
                    // Only retry for specific errors
                    if (retries >= maxRetries || 
                        (error.status && error.status < 500)) {
                        throw error; // Not a retryable error
                    }
                    
                    // Exponential backoff
                    const delay = Math.pow(2, retries) * 100;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            return {
                status: 200,
                body: JSON.stringify(response),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // Required for CORS
                }
            };
            
        } catch (error) {
            context.log.error('Error calling OpenAI API:', error);
            
            // Don't expose sensitive error details to client
            const safeError = {
                message: 'An error occurred while processing your request',
                status: error.status || 500
            };
            
            return {
                status: error.status || 500,
                body: JSON.stringify({ error: safeError }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }
    }
});
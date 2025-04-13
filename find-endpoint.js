// Test script for finding the correct Hugging Face Gradio space endpoint
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Test multiple possible URL patterns to find the correct one
async function testMultipleEndpoints() {
  console.log("Testing different Hugging Face Space API endpoints...");
  
  // Check for API key
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error("Error: HUGGINGFACE_API_KEY is not set in .env file");
    return;
  }
  
  // List of possible URL patterns to try
  const possibleUrls = [
    "https://draculaz-ethic-chatai.hf.space/api/predict",  // Standard format
    "https://draculaz-ethic-chatai.hf.space/run/predict",  // Alternative format
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", // Direct model API
    "https://draculaz-ethic-chatai-draculaz.hf.space/api/predict", // With username duplicate
    "https://huggingface.co/spaces/draculaZ/ethic_chatAI/api", // Web URL format with /api
    "https://draculaz-ethic-chatai.hf.space/api" // Just the API base
  ];
  
  // Try each URL pattern
  for (const url of possibleUrls) {
    try {
      console.log(`\nTrying URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          // Direct model API format (for mistralai/Mistral-7B-Instruct-v0.1)
          inputs: url.includes("api-inference") ? 
            "<s>[INST] Hello, how are you? [/INST]" : 
            // Gradio space format
            {
              data: [
                "Hello, how are you?", // message
                "You are an AI assistant.", // system_message
                100, // max_tokens
                0.7, // temperature
                0.95 // top_p
              ]
            }
        }),
        // Set a short timeout to avoid waiting too long for each test
        timeout: 10000
      });
      
      const responseText = await response.text();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      
      if (response.ok) {
        console.log(`\n✅ SUCCESS: Found working endpoint at ${url}`);
        console.log("Please update your .env file with this URL.");
        return url;
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
  
  console.log("\n❌ None of the tested endpoints worked.");
  console.log("\nTroubleshooting steps:");
  console.log("1. Verify that your Hugging Face space is correctly deployed and running");
  console.log("2. Check that the space name 'draculaZ/ethic_chatAI' is correct");
  console.log("3. Ensure your space has a public API endpoint that can be accessed externally");
  console.log("4. Try accessing your space in a browser to verify it's working");
}

// Run the endpoint testing
testMultipleEndpoints();
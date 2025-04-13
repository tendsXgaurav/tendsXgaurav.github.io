// Test script for Hugging Face Gradio space
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testHuggingFaceApi() {
  try {
    console.log("Testing connection to Hugging Face Gradio space...");
    
    // Check for API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not set in .env file");
    }
    
    // Directly use the correct Gradio space URL
    const spaceUrl = "https://draculaz-ethic-chatai.hf.space/api/predict";
    console.log(`Using space URL: ${spaceUrl}`);
    
    console.log("Sending test message to Hugging Face Gradio space...");
    
    // Send request to the Gradio space API
    const response = await fetch(spaceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        data: [
          "Hello! I'm testing if the Mistral integration is working correctly.", // message
          "You are AIethic, an AI assistant powered by Mistral-7B, focused on providing ethical, helpful information.", // system_message
          1024, // max_tokens
          0.7,  // temperature
          0.95  // top_p
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log("\n✅ Received response from Hugging Face Gradio API!");
    console.log("\nModel response:");
    console.log("\x1b[32m%s\x1b[0m", result.data);
    console.log("\nTest completed successfully! Your integration with Mistral-7B is working.");
    
    return result;
  } catch (error) {
    console.error("\n❌ Error testing Hugging Face API:", error.message);
    console.log("\nTroubleshooting steps:");
    console.log("1. Check that your HUGGINGFACE_API_KEY is correct in the .env file");
    console.log("2. Make sure your Gradio space is running and publicly accessible");
    console.log("3. Check that your Gradio interface accepts these parameters: message, system_message, max_tokens, temperature, top_p");
    throw error;
  }
}

// Run the test
testHuggingFaceApi();
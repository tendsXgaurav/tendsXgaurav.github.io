// Test script for Mistral-7B integration
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testMistralAPI() {
  try {
    console.log("Testing Hugging Face Inference API with Mistral-7B model...");
    
    // Check for environment variables
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not set in .env file");
    }
    
    if (!process.env.HUGGINGFACE_SPACE_URL) {
      throw new Error("HUGGINGFACE_SPACE_URL is not set in .env file");
    }
    
    console.log(`Using endpoint: ${process.env.HUGGINGFACE_SPACE_URL}`);
    console.log("Sending test message to Mistral-7B model...");
    
    // Create a test prompt in Mistral format
    const testPrompt = "<s>[INST] You are AIethic, an AI assistant powered by Mistral-7B, focused on providing ethical and helpful information. [/INST]</s>\n<s>[INST] Can you explain what makes you different from other AI assistants in a short paragraph? [/INST]";
    
    // Call the Hugging Face Inference API
    const response = await fetch(process.env.HUGGINGFACE_SPACE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("\n✅ Successfully received response from Mistral-7B model!");
    
    // Extract generated text
    let generatedText = '';
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    }
    
    // Clean up response
    generatedText = generatedText.replace(testPrompt, '').trim();
    generatedText = generatedText.replace(/^\s*\[\/INST\]\s*/, '');
    generatedText = generatedText.replace(/<\/?s>/g, '');
    
    console.log("\nMistral-7B response:");
    console.log("\x1b[32m%s\x1b[0m", generatedText);
    console.log("\nTest completed successfully! Your integration with Mistral-7B is working.");
    console.log("\nYou can now run your server with:");
    console.log("npm start");
    console.log("\nAnd chat with the Mistral-7B model through your web interface.");
    
  } catch (error) {
    console.error("\n❌ Error testing Mistral-7B API:", error.message);
    console.log("\nTroubleshooting steps:");
    console.log("1. Check that your HUGGINGFACE_API_KEY is correct in the .env file");
    console.log("2. Verify that the model URL is correct in the .env file");
    console.log("3. Make sure your Hugging Face token has the necessary permissions");
    console.log("4. Check your internet connection");
  }
}

// Run the test
testMistralAPI();
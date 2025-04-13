// Direct test script for Mistral-7B integration (no env variables)
import fetch from 'node-fetch';

async function testMistralAPI() {
  try {
    console.log("Testing Hugging Face Inference API with Mistral-7B model...");
    
    // Directly use the API endpoint that was confirmed working
    const endpoint = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";
    const apiKey = "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";
    
    console.log(`Using endpoint: ${endpoint}`);
    console.log("Sending test message to Mistral-7B model...");
    
    // Create a test prompt in Mistral format
    const testPrompt = "<s>[INST] You are AIethic, an AI assistant powered by Mistral-7B, focused on providing ethical and helpful information. [/INST]</s>\n<s>[INST] Can you explain what makes you different from other AI assistants in a short paragraph? [/INST]";
    
    // Call the Hugging Face Inference API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    
  } catch (error) {
    console.error("\n❌ Error testing Mistral-7B API:", error.message);
    console.log("\nTroubleshooting steps:");
    console.log("1. Check that your Hugging Face API key is correct");
    console.log("2. Make sure your Hugging Face token has the necessary permissions (read)");
    console.log("3. Check your internet connection");
  }
}

// Run the test
testMistralAPI();
// Import fetch properly for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Test message to send to the chatbot
const testMessage = "Hello, I'm testing can you respond with a short greeting?";

// Simple function to test the chat API
async function testChatbot() {
  console.log("Testing AIethic chatbot with Mistral-7B model...");
  console.log(`Sending test message: "${testMessage}"`);
  
  try {
    // Prepare the messages array with system message and user message
    const messages = [
      { 
        role: "system", 
        content: "You are AIethic, an AI assistant powered by Mistral-7B, focused on providing ethical, helpful information. Keep responses concise and informative." 
      },
      { 
        role: "user", 
        content: testMessage 
      }
    ];
    
    // Call the local API endpoint
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Extract and display the response
    if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
      console.log("\n✅ Chat API Response Successfully Received!");
      console.log("\nModel response:");
      console.log("\x1b[32m%s\x1b[0m", data.choices[0].message.content);
      console.log("\nChatbot test completed successfully! Your integration with Mistral-7B is working.");
    } else {
      console.log("\n❌ Received unexpected response format:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("\n❌ Error testing chatbot:", error.message);
    
    // Provide troubleshooting advice
    console.log("\nTroubleshooting steps:");
    console.log("1. Make sure your server is running on port 3000");
    console.log("2. Check that your .env file has the correct HUGGINGFACE_API_KEY and HUGGINGFACE_SPACE_URL");
    console.log("3. Verify your Gradio space is up and running with Mistral-7B-Instruct-v0.1");
    console.log("4. Look at the server logs for more detailed error information");
  }
}

// Run the test
testChatbot();
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AIethic Chat API")

# Get API key from environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_SPACE_URL = os.getenv("HUGGINGFACE_SPACE_URL", "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1")

# Add CORS middleware to allow requests from your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aiethic.me", "https://www.aiethic.me", "http://localhost:3000", "http://127.0.0.1:5000", 
                   "https://tendsxgaurav.github.io", "https://aiethic-production.up.railway.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    choices: List[Dict[str, Any]]

# Format messages for Mistral model
def format_messages_for_mistral(messages):
    prompt = ""
    
    # Add system message if it exists
    system_message = next((m for m in messages if m.role == "system"), None)
    if system_message:
        prompt += f"<s>[INST] {system_message.content} [/INST]</s>\n"
    
    # Add user-assistant message pairs
    for i in range(len(messages)):
        message = messages[i]
        
        # Skip system messages as they're handled above
        if message.role == "system":
            continue
        
        if message.role == "user":
            # Check if next message is an assistant message
            next_message = messages[i + 1] if i + 1 < len(messages) else None
            
            if next_message and next_message.role == "assistant":
                # This is a paired conversation
                prompt += f"<s>[INST] {message.content} [/INST] {next_message.content}</s>\n"
                i += 1  # Skip the assistant message in the next iteration
            else:
                # This is the latest user message without a response yet
                prompt += f"<s>[INST] {message.content} [/INST]"
    
    return prompt

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "AIethic Chat API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "message": "AIethic API is running",
        "huggingface_api_key_configured": bool(HUGGINGFACE_API_KEY),
        "huggingface_space_url_configured": bool(HUGGINGFACE_SPACE_URL),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Check if API key is configured
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(status_code=500, detail="Hugging Face API key is not configured")
    
    # Format messages for Mistral model
    formatted_prompt = format_messages_for_mistral(request.messages)
    
    # Create HTTP client with timeout
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Call Hugging Face Inference API
            response = await client.post(
                HUGGINGFACE_SPACE_URL,
                headers={
                    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": formatted_prompt,
                    "parameters": {
                        "max_new_tokens": int(os.getenv("MAX_NEW_TOKENS", "1024")),
                        "temperature": float(os.getenv("TEMPERATURE", "0.7")),
                        "top_p": float(os.getenv("TOP_P", "0.95")),
                        "do_sample": True
                    }
                }
            )
            
            if response.status_code != 200:
                # If the request fails, raise an HTTP exception with the error details
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Hugging Face API error: {response.text}"
                )
            
            # Parse the response from Hugging Face
            result = response.json()
            
            # Extract the generated text
            generated_text = ""
            if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
                generated_text = result[0]["generated_text"]
            elif "generated_text" in result:
                generated_text = result["generated_text"]
            else:
                generated_text = "I'm sorry, I couldn't generate a proper response at this time."
            
            # Clean up the response
            generated_text = generated_text.replace(formatted_prompt, "").strip()
            generated_text = generated_text.replace("[/INST]", "").strip()
            generated_text = generated_text.replace("<s>", "").replace("</s>", "").strip()
            
            # Format the response to match OpenAI format for compatibility with the frontend
            return ChatResponse(
                choices=[
                    {
                        "message": {
                            "role": "assistant",
                            "content": generated_text
                        }
                    }
                ]
            )
            
        except httpx.RequestError as exc:
            # Handle request errors (connection issues, timeouts, etc.)
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while calling the Hugging Face API: {str(exc)}"
            )

if __name__ == "__main__":
    import uvicorn
    # Run the server when the script is executed directly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
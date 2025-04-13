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

# Add CORS middleware to allow requests from your frontend domain - allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for maximum compatibility
    allow_credentials=False,  # Set to False to avoid credentials issues
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log environment and configuration on startup
@app.on_event("startup")
async def startup_event():
    print(f"Starting AIethic API with the following configuration:")
    print(f"HUGGINGFACE_API_KEY configured: {bool(HUGGINGFACE_API_KEY)}")
    print(f"HUGGINGFACE_SPACE_URL: {HUGGINGFACE_SPACE_URL}")

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

# Chat logic function to avoid code duplication
async def process_chat_request(request: ChatRequest):
    # Check if API key is configured
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(status_code=500, detail="Hugging Face API key is not configured")
    
    # Format messages for Mistral model
    formatted_prompt = format_messages_for_mistral(request.messages)
    
    # Debug log
    print(f"Processing request with formatted prompt length: {len(formatted_prompt)} chars")
    
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
            
            # Debug log
            print(f"Hugging Face API response status: {response.status_code}")
            
            if response.status_code != 200:
                # If the request fails, raise an HTTP exception with the error details
                error_text = await response.text()
                print(f"Hugging Face API error: {error_text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Hugging Face API error: {error_text}"
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
            
            # Debug log
            print(f"Generated response of length: {len(generated_text)} chars")
            
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
            error_message = f"An error occurred while calling the Hugging Face API: {str(exc)}"
            print(error_message)
            raise HTTPException(
                status_code=500,
                detail=error_message
            )

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

# Support both endpoint patterns
@app.post("/api/chat", response_model=ChatResponse)
async def chat_api(request: ChatRequest):
    return await process_chat_request(request)

@app.post("/chat", response_model=ChatResponse)
async def chat_direct(request: ChatRequest):
    return await process_chat_request(request)

if __name__ == "__main__":
    import uvicorn
    # Run the server when the script is executed directly
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
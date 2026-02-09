import google.generativeai as genai
from typing import Any, Dict, List, Optional
import json
from .config import Config

class GeminiClient:
    """Main client for interacting with Google's Gemini AI."""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """Initialize the Gemini client."""
        Config.validate()
        
        self.api_key = api_key or Config.GEMINI_API_KEY
        self.model_name = Config.get_model_name(model)
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)
    
    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        history: Optional[List[Dict[str, Any]]] = None,
        generation_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate content using the Gemini model."""
        
        # Set up generation config
        config = {
            "temperature": Config.TEMPERATURE,
            "max_output_tokens": Config.MAX_TOKENS,
            **(generation_config or {})
        }
        
        # Create chat with system instruction if provided
        if system_instruction:
            chat = self.model.start_chat(
                history=history or [],
                system_instruction=system_instruction
            )
        else:
            chat = self.model.start_chat(history=history or [])
        
        response = chat.send_message(prompt, generation_config=config)
        return response.text
    
    async def generate_structured(
        self,
        prompt: str,
        response_schema: Dict[str, Any],
        system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate structured content with JSON schema validation."""
        
        # Configure for JSON response
        generation_config = {
            "response_mime_type": "application/json",
            "response_schema": response_schema
        }
        
        response_text = await self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            generation_config=generation_config
        )
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {e}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        return {
            "model_name": self.model_name,
            "api_key_set": bool(self.api_key),
            "max_tokens": Config.MAX_TOKENS,
            "temperature": Config.TEMPERATURE
        }

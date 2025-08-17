import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class for the Gemini AI implementation."""
    
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    DEFAULT_MODEL: str = "gemini-1.5-flash"
    MAX_TOKENS: int = 8192
    TEMPERATURE: float = 0.7
    
    @classmethod
    def validate(cls) -> None:
        """Validate that required configuration is present."""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
    
    @classmethod
    def get_model_name(cls, model: Optional[str] = None) -> str:
        """Get the model name, defaulting to configured model."""
        return model or cls.DEFAULT_MODEL

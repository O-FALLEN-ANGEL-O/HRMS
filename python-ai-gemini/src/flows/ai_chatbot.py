from typing import List, Dict, Any
from pydantic import BaseModel, Field
from ..client import GeminiClient

class AIChatbotInput(BaseModel):
    """Input for AI chatbot."""
    history: List[Dict[str, Any]] = Field(description="The history of the conversation so far")
    query: str = Field(description="The user's latest query")

class AIChatbotOutput(BaseModel):
    """Output from AI chatbot."""
    response: str = Field(description="The chatbot's response")

class AIChatbotFlow:
    """AI-powered chatbot for HR-related questions."""
    
    def __init__(self, client: GeminiClient):
        self.client = client
        self.system_prompt = """You are a friendly and helpful HR assistant chatbot for a company called OptiTalent.

Your goal is to answer employee questions about company policies, benefits, leave requests, and other HR-related topics.
Be concise and clear in your answers.

Use the conversation history to maintain context.

If you don't know the answer to a question, politely state that you don't have that information and suggest contacting the HR department directly at hr@optitalent.com."""
    
    async def execute(self, input_data: AIChatbotInput) -> AIChatbotOutput:
        """Execute the chatbot flow."""
        
        # Format conversation history
        formatted_history = []
        for message in input_data.history:
            formatted_history.append({
                "role": message.get("role", "user"),
                "parts": [message.get("content", "")]
            })
        
        # Generate response
        response = await self.client.generate_content(
            prompt=input_data.query,
            system_instruction=self.system_prompt,
            history=formatted_history
        )
        
        return AIChatbotOutput(response=response)

async def ai_chatbot(history: List[Dict[str, Any]], query: str) -> str:
    """Convenience function for AI chatbot."""
    client = GeminiClient()
    flow = AIChatbotFlow(client)
    result = await flow.execute(AIChatbotInput(history=history, query=query))
    return result.response

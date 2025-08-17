from typing import Literal
from pydantic import BaseModel, Field
from ..client import GeminiClient

class GeneratePerformanceReviewInput(BaseModel):
    """Input for performance review generation."""
    employee_name: str = Field(description="The employee's full name")
    job_title: str = Field(description="The employee's job title")
    goals: str = Field(description="A summary of the employee's goals for the review period")
    achievements: str = Field(description="A summary of the employee's key achievements")
    areas_for_improvement: str = Field(description="A summary of areas where the employee can improve")

class GeneratePerformanceReviewOutput(BaseModel):
    """Output from performance review generation."""
    review_summary: str = Field(description="A well-structured performance review summary")
    suggested_rating: Literal["Exceeds Expectations", "Meets Expectations", "Needs Improvement"] = Field(
        description="A suggested overall performance rating"
    )

class GeneratePerformanceReviewFlow:
    """AI agent that generates performance review summaries."""
    
    def __init__(self, client: GeminiClient):
        self.client = client
    
    async def execute(self, input_data: GeneratePerformanceReviewInput) -> GeneratePerformanceReviewOutput:
        """Execute the performance review generation flow."""
        
        prompt = f"""You are an expert HR Manager tasked with writing a fair and balanced performance review.

Employee Details:
- Name: {input_data.employee_name}
- Job Title: {input_data.job_title}

Review Information:
- Goals: {input_data.goals}
- Achievements: {input_data.achievements}
- Areas for Improvement: {input_data.areas_for_improvement}

Based on the information provided, please do the following:
1. Write a comprehensive and constructive performance review summary. The summary should be professional, well-structured, and provide clear feedback. Start with achievements and then constructively address areas for improvement.
2. Suggest an overall performance rating from the following options: 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'. Base your suggestion on the balance of achievements versus areas for improvement.

Return the output as JSON with 'review_summary' and 'suggested_rating' fields."""
        
        response_schema = {
            "type": "object",
            "properties": {
                "review_summary": {"type": "string"},
                "suggested_rating": {
                    "type": "string",
                    "enum": ["Exceeds Expectations", "Meets Expectations", "Needs Improvement"]
                }
            },
            "required": ["review_summary", "suggested_rating"]
        }
        
        result = await self.client.generate_structured(
            prompt=prompt,
            response_schema=response_schema
        )
        
        return GeneratePerformanceReviewOutput(
            review_summary=result["review_summary"],
            suggested_rating=result["suggested_rating"]
        )

async def generate_performance_review(
    employee_name: str,
    job_title: str,
    goals: str,
    achievements: str,
    areas_for_improvement: str
) -> GeneratePerformanceReviewOutput:
    """Convenience function for generating performance reviews."""
    client = GeminiClient()
    flow = GeneratePerformanceReviewFlow(client)
    return await flow.execute(GeneratePerformanceReviewInput(
        employee_name=employee_name,
        job_title=job_title,
        goals=goals,
        achievements=achievements,
        areas_for_improvement=areas_for_improvement
    ))

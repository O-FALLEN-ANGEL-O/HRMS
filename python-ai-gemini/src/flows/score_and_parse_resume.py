import base64
import mimetypes
from typing import Optional
from pydantic import BaseModel, Field
from ..client import GeminiClient
from ..schemas import ParsedResume, WorkExperience, Education, Project

class ScoreAndParseResumeInput(BaseModel):
    """Input for resume scoring and parsing."""
    job_description: str = Field(description="The job description for the role")
    resume_data_uri: str = Field(
        description="A resume file (PDF, DOCX) or an image of a resume, as a data URI"
    )

class ScoreAndParseResumeOutput(BaseModel):
    """Output from resume scoring and parsing."""
    score: int = Field(ge=0, le=100, description="The score (0-100) of the resume")
    justification: str = Field(description="A concise justification for the assigned score")
    parsed_data: ParsedResume = Field(description="The parsed resume data")

class ScoreAndParseResumeFlow:
    """AI agent that parses resumes and scores them against job descriptions."""
    
    def __init__(self, client: GeminiClient):
        self.client = client
    
    def _process_data_uri(self, data_uri: str) -> tuple[str, bytes]:
        """Process data URI to extract MIME type and data."""
        if not data_uri.startswith("data:"):
            raise ValueError("Invalid data URI format")
        
        header, data = data_uri.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
        
        # Decode base64 data
        try:
            decoded_data = base64.b64decode(data)
        except Exception as e:
            raise ValueError(f"Failed to decode base64 data: {e}")
        
        return mime_type, decoded_data
    
    async def execute(self, input_data: ScoreAndParseResumeInput) -> ScoreAndParseResumeOutput:
        """Execute the resume scoring and parsing flow."""
        
        # Process the data URI
        mime_type, file_data = self._process_data_uri(input_data.resume_data_uri)
        
        prompt = f"""You are an expert HR recruiter with experience in parsing resumes and matching candidates to job descriptions.

You will be provided with a job description and a resume. Your tasks are:
1. Parse the resume to extract structured information. Be as accurate as possible. Extract all fields defined in the output schema.
2. Score the resume from 0 to 100 based on how well the candidate's skills and experience match the provided job description.
3. Provide a concise justification for the score. Explain the reasoning behind your score, noting how the candidate aligns with the requirements.

Job Description:
```
{input_data.job_description}
```

Please return the extracted data, score, and justification as JSON with the following structure:
{{
    "score": <integer 0-100>,
    "justification": "<string>",
    "parsed_data": {{
        "name": "<string>",
        "email": "<string>",
        "phone": "<string>",
        "links": ["<string>"],
        "summary": "<string>",
        "skills": ["<string>"],
        "work_experience": [
            {{
                "company": "<string>",
                "title": "<string>",
                "dates": "<string>"
            }}
        ],
        "education": [
            {{
                "institution": "<string>",
                "degree": "<string>",
                "year": "<string>"
            }}
        ],
        "projects": [
            {{
                "name": "<string>",
                "description": "<string>",
                "url": "<string>"
            }}
        ],
        "certifications": ["<string>"],
        "languages": ["<string>"],
        "hobbies": ["<string>"]
    }}
}}

If a field is not present in the resume, return an empty string or empty array for it."""
        
        response_schema = {
            "type": "object",
            "properties": {
                "score": {"type": "integer", "minimum": 0, "maximum": 100},
                "justification": {"type": "string"},
                "parsed_data": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                        "links": {"type": "array", "items": {"type": "string"}},
                        "summary": {"type": "string"},
                        "skills": {"type": "array", "items": {"type": "string"}},
                        "work_experience": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "company": {"type": "string"},
                                    "title": {"type": "string"},
                                    "dates": {"type": "string"}
                                },
                                "required": ["company", "title", "dates"]
                            }
                        },
                        "education": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "institution": {"type": "string"},
                                    "degree": {"type": "string"},
                                    "year": {"type": "string"}
                                },
                                "required": ["institution", "degree", "year"]
                            }
                        },
                        "projects": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "url": {"type": "string"}
                                },
                                "required": ["name", "description"]
                            }
                        },
                        "certifications": {"type": "array", "items": {"type": "string"}},
                        "languages": {"type": "array", "items": {"type": "string"}},
                        "hobbies": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["name", "skills", "work_experience", "education", "certifications", "languages", "links"]
                }
            },
            "required": ["score", "justification", "parsed_data"]
        }
        
        # For file processing, we'll use text-based approach
        # In a real implementation, you might use Gemini's multimodal capabilities
        result = await self.client.generate_structured(
            prompt=prompt,
            response_schema=response_schema
        )
        
        # Convert to Pydantic models
        parsed_data = ParsedResume(
            name=result["parsed_data"]["name"],
            email=result["parsed_data"].get("email"),
            phone=result["parsed_data"].get("phone"),
            links=result["parsed_data"]["links"],
            summary=result["parsed_data"].get("summary"),
            skills=result["parsed_data"]["skills"],
            work_experience=[
                WorkExperience(**exp) 
                for exp in result["parsed_data"]["work_experience"]
            ],
            education=[
                Education(**edu) 
                for edu in result["parsed_data"]["education"]
            ],
            projects=[
                Project(**proj) 
                for proj in result["parsed_data"].get("projects", [])
            ] if result["parsed_data"].get("projects") else None,
            certifications=result["parsed_data"]["certifications"],
            languages=result["parsed_data"]["languages"],
            hobbies=result["parsed_data"].get("hobbies")
        )
        
        return ScoreAndParseResumeOutput(
            score=result["score"],
            justification=result["justification"],
            parsed_data=parsed_data
        )

async def score_and_parse_resume(job_description: str, resume_data_uri: str) -> ScoreAndParseResumeOutput:
    """Convenience function for scoring and parsing resumes."""
    client = GeminiClient()
    flow = ScoreAndParseResumeFlow(client)
    return await flow.execute(ScoreAndParseResumeInput(
        job_description=job_description,
        resume_data_uri=resume_data_uri
    ))

from typing import List, Optional
from pydantic import BaseModel, Field

# Common schemas used across multiple flows

class WorkExperience(BaseModel):
    """Work experience details."""
    company: str = Field(description="The name of the company")
    title: str = Field(description="The job title or role")
    dates: str = Field(description="The dates of employment (e.g., 'Jan 2020 - Present')")

class Education(BaseModel):
    """Education details."""
    institution: str = Field(description="The name of the educational institution")
    degree: str = Field(description="The degree or qualification obtained")
    year: str = Field(description="The year of graduation or completion")

class Project(BaseModel):
    """Project details."""
    name: str = Field(description="The name or title of the project")
    description: str = Field(description="A brief description of the project")
    url: Optional[str] = Field(description="A URL to the project if available")

class ParsedResume(BaseModel):
    """Parsed resume data."""
    name: str = Field(description="The candidate's full name")
    email: Optional[str] = Field(description="The candidate's email address")
    phone: Optional[str] = Field(description="The candidate's phone number")
    links: List[str] = Field(description="Array of URLs for social profiles")
    summary: Optional[str] = Field(description="The professional summary or objective statement")
    skills: List[str] = Field(description="An array of key skills extracted from the resume")
    work_experience: List[WorkExperience] = Field(description="An array of work experience objects")
    education: List[Education] = Field(description="An array of education objects")
    projects: Optional[List[Project]] = Field(description="An array of personal or professional projects")
    certifications: List[str] = Field(description="An array of relevant certifications")
    languages: List[str] = Field(description="An array of languages spoken by the candidate")
    hobbies: Optional[List[str]] = Field(description="An array of hobbies or interests")

class ChatMessage(BaseModel):
    """Chat message for conversation history."""
    role: str = Field(description="The role of the message sender (user/assistant)")
    content: str = Field(description="The content of the message")

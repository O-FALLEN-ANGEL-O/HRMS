# Python Gemini AI Implementation

A comprehensive Python equivalent of the TypeScript Gemini AI implementation, providing all the same AI capabilities for HR-related tasks.

## Features

✅ **AI Chatbot** - HR assistant for answering employee questions  
✅ **Performance Review Generation** - Automated performance reviews  
✅ **Resume Scoring & Parsing** - Score resumes against job descriptions  
✅ **Face Verification** - Employee face verification (placeholder)  
✅ **Auto-assign Roles** - Automatic role assignment based on skills  
✅ **Welcome Email Generation** - Automated welcome emails  
✅ **Ticket Categorization** - Categorize helpdesk tickets  
✅ **Payroll Error Detection** - Detect payroll anomalies  
✅ **Career Path Prediction** - Predict employee career paths  
✅ **Burnout Prediction** - Predict employee burnout risk  
✅ **Interview Question Suggestions** - Generate interview questions  

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd python-ai-gemini

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

## Environment Variables

Create a `.env` file with:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

## Quick Start

```python
import asyncio
from src.client import GeminiClient
from src.flows.ai_chatbot import ai_chatbot

async def main():
    # Initialize client
    client = GeminiClient()
    
    # Use AI chatbot
    response = await ai_chatbot(
        history=[],
        query="What is our company policy on remote work?"
    )
    print(response)

asyncio.run(main())
```

## Usage Examples

### 1. AI Chatbot
```python
from src.flows.ai_chatbot import ai_chatbot

response = await ai_chatbot(
    history=[
        {"role": "user", "content": "What is the leave policy?"},
        {"role": "assistant", "content": "You get 21 days of paid leave per year."}
    ],
    query="How do I apply for leave?"
)
```

### 2. Performance Review Generation
```python
from src.flows.generate_performance_review import generate_performance_review

result = await generate_performance_review(
    employee_name="Jane Smith",
    job_title="Senior Developer",
    goals="Lead team, improve code quality",
    achievements="Led 3 successful projects, mentored 5 developers",
    areas_for_improvement="Could improve documentation"
)
```

### 3. Resume Scoring
```python
from src.flows.score_and_parse_resume import score_and_parse_resume

result = await score_and_parse_resume(
    job_description="Senior Python Developer with 5+ years experience...",
    resume_data_uri="data:application/pdf;base64,JVBERi0xLjMK..."
)
```

## Architecture

```
python-ai-gemini/
├── src/
│   ├── client.py              # Main Gemini client
│   ├── config.py              # Configuration management
│   ├── schemas.py             # Pydantic models
│   └── flows/                 # AI task implementations
│       ├── ai_chatbot.py
│       ├── generate_performance_review.py
│       ├── score_and_parse_resume.py
│       └── ...
├── main.py                    # Demo script
├── requirements.txt           # Dependencies
└── README.md
```

## API Reference

### GeminiClient
- `generate_content(prompt, system_instruction=None, history=None)`
- `generate_structured(prompt, response_schema, system_instruction=None)`

### Flow Functions
- `ai_chatbot(history, query) -> str`
- `generate_performance_review(**kwargs) -> GeneratePerformanceReviewOutput`
- `score_and_parse_resume(job_description, resume_data_uri) -> ScoreAndParseResumeOutput`

## Development

```bash
# Run tests
python -m pytest tests/

# Run demo
python main.py

# Install in development mode
pip install -e .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

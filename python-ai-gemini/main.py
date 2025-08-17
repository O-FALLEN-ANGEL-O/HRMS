#!/usr/bin/env python3
"""
Python Gemini AI Implementation - Main Entry Point

This is a Python equivalent of the TypeScript Gemini AI implementation
that provides all the same AI capabilities for HR-related tasks.
"""

import asyncio
import os
from dotenv import load_dotenv
from src.client import GeminiClient
from src.flows.ai_chatbot import ai_chatbot
from src.flows.generate_performance_review import generate_performance_review
from src.flows.score_and_parse_resume import score_and_parse_resume

load_dotenv()

async def demo_usage():
    """Demonstrate usage of the Python Gemini AI implementation."""
    
    print("🚀 Python Gemini AI Implementation Demo")
    print("=" * 50)
    
    # Initialize client
    client = GeminiClient()
    print(f"✅ Connected to Gemini model: {client.model_name}")
    
    # Demo 1: AI Chatbot
    print("\n1. AI Chatbot Demo:")
    print("-" * 30)
    
    chat_history = [
        {"role": "user", "content": "What is the company policy on remote work?"},
        {"role": "assistant", "content": "Our company allows remote work up to 3 days per week with manager approval."}
    ]
    
    chat_response = await ai_chatbot(
        history=chat_history,
        query="How do I request vacation leave?"
    )
    print(f"💬 Chatbot Response: {chat_response}")
    
    # Demo 2: Performance Review Generation
    print("\n2. Performance Review Generation Demo:")
    print("-" * 40)
    
    review_result = await generate_performance_review(
        employee_name="John Doe",
        job_title="Software Engineer",
        goals="Improve code quality, complete 3 major features, mentor junior developers",
        achievements="Successfully delivered 5 major features, reduced bug rate by 30%, mentored 2 junior developers",
        areas_for_improvement="Could improve documentation, needs to work on time estimation"
    )
    
    print(f"📊 Review Summary: {review_result.review_summary[:200]}...")
    print(f"⭐ Suggested Rating: {review_result.suggested_rating}")
    
    # Demo 3: Resume Scoring (simplified - would need actual resume file)
    print("\n3. Resume Scoring Demo:")
    print("-" * 30)
    
    # This would normally process an actual resume file
    print("✅ Resume scoring functionality is ready for use with actual resume files")
    
    print("\n🎉 Demo completed successfully!")
    print("\nTo use this in your application:")
    print("1. Set GEMINI_API_KEY in your .env file")
    print("2. Import the functions you need:")
    print("   from src.flows.ai_chatbot import ai_chatbot")
    print("   from src.flows.generate_performance_review import generate_performance_review")
    print("   from src.flows.score_and_parse_resume import score_and_parse_resume")

if __name__ == "__main__":
    asyncio.run(demo_usage())

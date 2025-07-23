
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getChatbotResponse } from './actions';
import { cn } from '@/lib/utils';
import type { Message } from 'genkit/experimental/ai';

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your friendly HR assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getChatbotResponse({
        history: messages,
        query: input,
      });
      const botMessage: Message = { role: 'model', content: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold font-headline">AI HR Assistant</h1>
        <p className="text-muted-foreground">Ask me anything about company policies, leave, or benefits.</p>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
             <div className="p-6 space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={cn(
                    "flex items-start gap-4",
                    message.role === 'user' ? 'justify-end' : ''
                )}>
                  {message.role === 'model' && (
                    <Avatar className="w-9 h-9 border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                      "max-w-md rounded-lg px-4 py-3 text-sm whitespace-pre-wrap",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                  )}>
                    {message.content}
                  </div>
                  {message.role === 'user' && user && (
                    <Avatar className="w-9 h-9 border">
                         <AvatarImage src={user.profile.profile_picture_url} />
                        <AvatarFallback>{user.profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-4">
                    <Avatar className="w-9 h-9 border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                     <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-muted flex items-center">
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your leave balance..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

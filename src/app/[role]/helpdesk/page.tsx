'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Send, User, Bot, Clock, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';

type Message = {
    from: 'user' | 'support';
    text: string;
    time: string;
};

type Ticket = {
    id: string;
    subject: string;
    department: string;
    status: 'Open' | 'In Progress' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    lastUpdate: string;
    messages: Message[];
};

const initialTickets: Ticket[] = [
  {
    id: 'HD-001',
    subject: 'Laptop running slow',
    department: 'IT',
    status: 'Open',
    priority: 'High',
    lastUpdate: '2 hours ago',
    messages: [
        { from: 'user', text: 'My laptop has been extremely slow for the past two days. It is difficult to get any work done.', time: '10:00 AM' },
        { from: 'support', text: 'We have received your ticket. Have you tried restarting your machine?', time: '10:05 AM' },
    ]
  },
  {
    id: 'HD-002',
    subject: 'Cannot access shared drive',
    department: 'IT',
    status: 'In Progress',
    priority: 'Medium',
    lastUpdate: '1 day ago',
    messages: [
        { from: 'user', text: 'I am unable to access the shared "Marketing" folder. I keep getting a permission denied error.', time: 'Yesterday 8:30 AM' },
        { from: 'support', text: 'Hi, I\'ve checked the permissions. Can you please confirm your username?', time: 'Yesterday 8:35 AM' },
        { from: 'user', text: 'Sure, my username is "employee.user"', time: 'Yesterday 8:40 AM' },
    ]
  },
  {
    id: 'HD-003',
    subject: 'Question about payslip',
    department: 'Finance',
    status: 'Closed',
    priority: 'Low',
    lastUpdate: '3 days ago',
     messages: [
        { from: 'user', text: 'Hi, I have a question about a deduction on my latest payslip.', time: '3 days ago' },
        { from: 'support', text: 'Of course. Please provide the transaction ID for the deduction and I can look into it for you.', time: '3 days ago' },
        { from: 'user', text: 'It\'s #4582-B.', time: '3 days ago' },
        { from: 'support', text: 'Thank you. That deduction is for your commuter benefits. I\'ve resent the detailed breakdown to your email. This ticket is now closed.', time: '3 days ago' },
     ]
  },
];

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(tickets[0]);
  const [openNewTicketDialog, setOpenNewTicketDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [selectedTicket?.messages, isReplying]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isReplying || selectedTicket.status === 'Closed') return;

    const userMessage: Message = {
        from: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Immediately update the UI with the user's message
    const updatedTicketsWithUserMessage = tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
            const updatedTicket = { ...ticket, messages: [...ticket.messages, userMessage] };
            setSelectedTicket(updatedTicket);
            return updatedTicket;
        }
        return ticket;
    });
    setTickets(updatedTicketsWithUserMessage);
    setNewMessage('');
    setIsReplying(true);

    // Simulate bot reply
    setTimeout(() => {
        const botMessage: Message = {
            from: 'support',
            text: 'Thank you for your message. An agent will review your request shortly and get back to you.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Update state with the bot's reply based on the *current* state
        setTickets(currentTickets => {
            return currentTickets.map(ticket => {
                if (ticket.id === selectedTicket.id) {
                    const updatedTicket = { ...ticket, messages: [...ticket.messages, botMessage] };
                     // Also update the selected ticket state if it's the current one
                    if(selectedTicket && ticket.id === selectedTicket.id) {
                        setSelectedTicket(updatedTicket);
                    }
                    return updatedTicket;
                }
                return ticket;
            });
        });
        
        setIsReplying(false);
    }, 1500);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-500">Open</Badge>;
      case 'In Progress': return <Badge variant="secondary" className="bg-yellow-500 text-black">In Progress</Badge>;
      case 'Closed': return <Badge variant="outline">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
   const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-gray-500';
      default: return '';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-headline tracking-tight">Helpdesk</h1>
                <p className="text-muted-foreground">Get support for IT, HR, or Finance issues.</p>
            </div>
            <Dialog open={openNewTicketDialog} onOpenChange={setOpenNewTicketDialog}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> New Ticket</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Create a New Ticket</DialogTitle>
                    <DialogDescription>Describe your issue, and we'll route it to the right department.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="it">IT Support</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Password Reset" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Please describe your issue in detail." />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button onClick={() => setOpenNewTicketDialog(false)}>Submit Ticket</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <Card className="md:col-span-1 lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
                <div className="p-6 pt-0">
                {tickets.map((ticket) => (
                    <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                        "block w-full text-left p-3 rounded-lg hover:bg-muted",
                        selectedTicket?.id === ticket.id && "bg-muted"
                    )}
                    >
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-semibold truncate">{ticket.subject}</p>
                        {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{ticket.id} &middot; {ticket.department}</p>
                    </button>
                ))}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3 flex flex-col">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b">
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <CardDescription>
                            Ticket ID: {selectedTicket.id} &middot; Priority: <span className={getPriorityClass(selectedTicket.priority)}>{selectedTicket.priority}</span>
                        </CardDescription>
                    </div>
                    {getStatusBadge(selectedTicket.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                 <ScrollArea className='h-full' ref={scrollAreaRef}>
                    <div className="space-y-6 p-6">
                        {selectedTicket.messages.map((message, index) => (
                            <div key={index} className={cn("flex items-end gap-3", message.from === 'user' ? 'justify-end' : 'justify-start')}>
                                {message.from === 'support' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", message.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                                       <Clock className='h-3 w-3'/> {message.time}
                                    </p>
                                </div>
                                {message.from === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isReplying && (
                            <div className="flex items-end gap-3 justify-start">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot/></AvatarFallback>
                                </Avatar>
                                <div className="max-w-xs md:max-w-md rounded-lg p-3 bg-muted flex items-center">
                                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className='border-t pt-4'>
                <form className="flex w-full items-center gap-2" onSubmit={handleSendMessage}>
                  <Input 
                    placeholder={selectedTicket.status === 'Closed' ? 'This ticket is closed.' : 'Type your message...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isReplying || selectedTicket.status === 'Closed'}
                  />
                  <Button type="submit" disabled={isReplying || !newMessage.trim() || selectedTicket.status === 'Closed'}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p>Select a ticket to view its details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

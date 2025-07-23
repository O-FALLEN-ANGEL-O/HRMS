
'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Send, User, Bot, Clock, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { categorizeTicketAction } from './actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

const NewTicketDialog = dynamic(() => import('@/components/helpdesk/new-ticket-dialog').then(mod => mod.NewTicketDialog), {
  loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> New Ticket</Button>,
  ssr: false,
});


type Message = {
    from: 'user' | 'support' | 'system';
    text: string;
    time: string;
};

export type Ticket = {
    id: string;
    subject: string;
    department: 'IT Support' | 'HR Query' | 'Payroll Issue' | 'Facilities' | 'General Inquiry';
    status: 'Open' | 'In Progress' | 'Closed';
    priority: 'High' | 'Medium' | 'Low';
    lastUpdate: string;
    messages: Message[];
};

const initialTickets: Ticket[] = [
  {
    id: 'HD-001',
    subject: 'Laptop running slow',
    department: 'IT Support',
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
    department: 'IT Support',
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
    department: 'Payroll Issue',
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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(initialTickets[0]);
  const [newMessage, setNewMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
    if (!newMessage.trim() || isReplying || !selectedTicket || selectedTicket.status === 'Closed') return;

    const userMessage: Message = {
        from: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedTicketsWithUserMessage = tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
            const updatedTicket = { ...ticket, messages: [...ticket.messages, userMessage], lastUpdate: 'Just now' };
            setSelectedTicket(updatedTicket);
            return updatedTicket;
        }
        return ticket;
    });
    setTickets(updatedTicketsWithUserMessage);
    setNewMessage('');
    setIsReplying(true);

    setTimeout(() => {
        const botMessage: Message = {
            from: 'support',
            text: 'Thank you for your message. An agent will review your request shortly and get back to you.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setTickets(currentTickets => {
            return currentTickets.map(ticket => {
                if (ticket.id === selectedTicket?.id) {
                    const updatedTicket = { ...ticket, messages: [...ticket.messages, botMessage] };
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
  
  const handleNewTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setSelectedTicket(ticket);
  };
  
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, searchTerm]);

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

  const TicketList = () => (
    <Card className="flex flex-col h-full">
        <CardHeader>
        <CardTitle>My Tickets</CardTitle>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tickets..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
            <div className="p-6 pt-0">
            {filteredTickets.map((ticket) => (
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
  );

  const TicketView = () => (
    <Card className="flex flex-col h-full">
        {selectedTicket ? (
        <>
            <CardHeader className="border-b">
            <div className='flex justify-between items-start'>
                <div>
                     {isMobile && (
                        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setSelectedTicket(null)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Tickets
                        </Button>
                    )}
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                        Ticket ID: {selectedTicket.id} &middot; Priority: <span className={getPriorityClass(selectedTicket.priority)}>{selectedTicket.priority}</span>
                    </CardDescription>
                </div>
                {getStatusBadge(selectedTicket.status)}
            </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className='h-[calc(100vh-24rem)]' ref={scrollAreaRef}>
                <div className="space-y-6 p-6">
                    {selectedTicket.messages.map((message, index) => (
                        <div key={index} className={cn("flex items-end gap-3", message.from === 'user' ? 'justify-end' : 'justify-start')}>
                            {message.from !== 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{message.from === 'system' ? <Bot/> : 'S'}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs md:max-w-md rounded-lg p-3", 
                                message.from === 'user' ? 'bg-primary text-primary-foreground' : 
                                message.from === 'system' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800' : 'bg-muted')}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
  )

  return (
    <div className="h-full flex flex-col space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-headline tracking-tight">Helpdesk</h1>
                <p className="text-muted-foreground">Get support for IT, HR, or Finance issues.</p>
            </div>
            <Suspense fallback={<Button disabled>Loading...</Button>}>
                <NewTicketDialog onNewTicket={handleNewTicket} />
            </Suspense>
        </div>
        
        {isMobile ? (
            <div className='h-[calc(100vh-12rem)]'>
                {selectedTicket ? <TicketView /> : <TicketList />}
            </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                <div className="md:col-span-1 lg:col-span-1 h-full">
                    <TicketList />
                </div>
                <div className="md:col-span-2 lg:col-span-3 h-full">
                    <TicketView />
                </div>
            </div>
        )}
    </div>
  );
}


'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Award, ThumbsUp, Gift, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const wallOfFame = [
    { name: 'Rajesh T.', empId: 'EMP009', badges: 12, avatar: 'https://ui-avatars.com/api/?name=Rajesh+T&background=random', crown: 'gold' },
    { name: 'Thiyagu B', empId: 'EMP010', badges: 10, avatar: 'https://ui-avatars.com/api/?name=Thiyagu+B&background=random', crown: 'silver' },
    { name: 'Prajwal', empId: 'EMP011', badges: 8, avatar: 'https://ui-avatars.com/api/?name=Prajwal&background=random', crown: 'bronze' },
];

const kudosFeed = [
    { from: 'Anika Sharma', to: 'Rohan Verma', message: 'for helping out with the critical deployment last night!', timestamp: '2 hours ago' },
    { from: 'Isabella Nguyen', to: 'Anika Sharma', message: 'for an outstanding presentation to the stakeholders.', timestamp: '1 day ago' },
    { from: 'David Kim', to: 'Priya Mehta', message: 'for excellent customer handling on a tough ticket.', timestamp: '3 days ago' },
];

const rewards = [
    { name: 'Coffee Voucher', points: 5 },
    { name: 'Movie Ticket', points: 10 },
    { name: 'Team Lunch', points: 25 },
    { name: 'Half-day Off', points: 50 },
];

export default function RecognitionPage() {
    const { toast } = useToast();

    const handleRedeem = (rewardName: string, points: number) => {
        toast({
            title: "Reward Redeemed!",
            description: `You have redeemed a ${rewardName} for ${points} points.`,
        });
    };
    
     const handleSendKudos = () => {
        toast({
            title: "Kudos Sent!",
            description: `This would open a dialog to send recognition to a colleague.`,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Recognition & Rewards</h1>
                    <p className="text-muted-foreground">Celebrate achievements and redeem your points.</p>
                </div>
                <Button onClick={handleSendKudos}><Send className="mr-2 h-4 w-4"/> Send Kudos</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Kudos Feed and Rewards */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ThumbsUp /> Kudos Feed</CardTitle>
                            <CardDescription>See the latest recognitions across the company.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {kudosFeed.map((kudo, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Award className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm">
                                            <span className="font-semibold">{kudo.from}</span> recognized <span className="font-semibold">{kudo.to}</span> {kudo.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{kudo.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift /> Redeem Rewards</CardTitle>
                             <CardDescription>Use your recognition points to claim rewards.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {rewards.map((reward) => (
                                <Card key={reward.name} className="flex flex-col items-center justify-center text-center p-4">
                                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                                        <Gift className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-semibold text-sm">{reward.name}</p>
                                    <p className="text-xs text-muted-foreground">{reward.points} Points</p>
                                    <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => handleRedeem(reward.name, reward.points)}>Redeem</Button>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Wall of Fame */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Award /> Wall of Fame</CardTitle>
                            <CardDescription>Top recognized employees this month.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {wallOfFame.map((person) => (
                                <div key={person.empId} className="flex items-center gap-4">
                                    <Avatar className={`h-12 w-12 border-2 ${person.crown === 'gold' ? 'border-yellow-400' : person.crown === 'silver' ? 'border-gray-400' : 'border-amber-600'}`}>
                                        <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person portrait" />
                                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{person.name}</p>
                                        <p className="text-sm text-muted-foreground">{person.badges} Kudos Received</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

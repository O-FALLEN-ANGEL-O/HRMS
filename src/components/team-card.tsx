
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";

type Member = {
  id: string;
  full_name: string;
  profile_picture_url?: string | null;
  status: string;
  job_title: string;
  performance?: number;
  tasksCompleted?: number;
  tasksPending?: number;
};

const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'On Leave': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
};

const TeamCardComponent = ({ member }: { member: any }) => {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const role = params.role as string;
    
    // Adding mock data locally for display purposes
    const displayMember = {
        ...member,
        status: ['Active', 'Away', 'On Leave'][Math.floor(Math.random() * 3)],
        performance: Math.floor(Math.random() * 40) + 60, // 60-100
        tasksCompleted: Math.floor(Math.random() * 10) + 5,
        tasksPending: Math.floor(Math.random() * 5),
        avatar: member.profile_picture_url,
        name: member.full_name,
        role: member.job_title,
    }


    const handleAction = (action: string) => {
        if(action === 'profile') {
            router.push(`/${role}/profile`);
        } else if (action === 'message') {
            toast({
                title: `Message Sent`,
                description: `Your message to ${displayMember.name} has been sent.`
            })
        }
    }

    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={displayMember.avatar} alt={displayMember.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{displayMember.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${getStatusIndicator(displayMember.status)} border-2 border-background`} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{displayMember.name}</p>
                        <p className="text-xs text-muted-foreground">{displayMember.role}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleAction('profile')}>View Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('message')}>Send Message</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {displayMember.performance !== undefined && (
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span>{displayMember.tasksCompleted || 0} done / {displayMember.tasksPending || 0} pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Performance:</span>
                        <Progress value={displayMember.performance} className="h-2 flex-1" />
                        <span>{displayMember.performance}%</span>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    );
}

TeamCardComponent.displayName = 'TeamCard';
export const TeamCard = React.memo(TeamCardComponent);

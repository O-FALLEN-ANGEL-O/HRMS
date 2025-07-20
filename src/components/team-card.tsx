
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";

type Member = {
  name: string;
  title: string;
  avatar: string;
  status: string;
  tasksCompleted: number;
  tasksPending: number;
  performance: number;
};

const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'In a meeting': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
};

export function TeamCard({ member }: { member: Member }) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${getStatusIndicator(member.status)} border-2 border-background`} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.title}</p>
                    </div>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span>{member.tasksCompleted} done / {member.tasksPending} pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Performance:</span>
                        <Progress value={member.performance} className="h-2 flex-1" />
                        <span>{member.performance}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

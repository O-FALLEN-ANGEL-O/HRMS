
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LeaderboardCardProps = {
  rank: number;
  name: string;
  empId: string;
  image: string;
  awards: number;
  crown: 'gold' | 'silver' | 'bronze';
  isExpanded: boolean;
};

const crownIcon = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉'
}

export function LeaderboardCard({ name, empId, image, awards, crown, isExpanded }: LeaderboardCardProps) {

  const content = (
    <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} alt={name} data-ai-hint="person portrait"/>
        <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      {isExpanded && (
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate text-slate-100">{name}</p>
          <p className="text-xs text-slate-400">{empId}</p>
        </div>
      )}
       <div className="flex items-center gap-1 text-yellow-400 font-bold">
        <span>{crownIcon[crown]}</span>
        {isExpanded && <span className="text-sm">{awards}</span>}
      </div>
    </div>
  );

  if (isExpanded) {
    return content;
  }

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            {content}
        </TooltipTrigger>
        <TooltipContent side="right">
            <p className="font-semibold">{name} ({empId})</p>
            <p className="text-muted-foreground">{awards} awards this week</p>
        </TooltipContent>
    </Tooltip>
  );
}

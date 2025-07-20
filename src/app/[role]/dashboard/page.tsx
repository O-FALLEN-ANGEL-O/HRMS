'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, Users, ClipboardList, TrendingUp, CheckCircle, ThumbsUp, MessageSquare, Heart } from "lucide-react";
import Image from "next/image";

type PageProps = {
  params: { role: string };
};

// --- MOCK DATA ---
const teamMembers = [
  {
    name: 'Anika Sharma',
    title: 'Senior Software Engineer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'Online',
    tasksCompleted: 8,
    tasksPending: 2,
    performance: 92,
  },
  {
    name: 'Rohan Verma',
    title: 'UI/UX Designer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'Away',
    tasksCompleted: 5,
    tasksPending: 1,
    performance: 85,
  },
   {
    name: 'Priya Mehta',
    title: 'Junior Frontend Developer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'In a meeting',
    tasksCompleted: 10,
    tasksPending: 0,
    performance: 98,
  },
];

const jobOpenings = [
    { title: "Senior Frontend Developer", applicants: 25, stage: "Interview" },
    { title: "Product Manager", applicants: 42, stage: "Shortlisted" },
    { title: "UI/UX Designer", applicants: 18, stage: "New" },
];

const feedItems = [
    {
      id: 1,
      author: 'Priya Sharma',
      team: 'Head of HR',
      time: '2d ago',
      content: 'Everyone faces "MONDAY BLUES" what if we make it a "MONDAY NEW" in approach to start the week with a positive attitude.',
      image: 'https://placehold.co/500x200.png',
      imageHint: 'office yoga',
      likes: 90,
      comments: 10,
    },
];

// --- HELPER FUNCTIONS & COMPONENTS ---

const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'In a meeting': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
};

const ProfileCompletionCard = () => {
    const profileCompletion = 70; // Mock data
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Strength</CardTitle>
                <CardDescription>Complete your profile to get the most out of OmniHR.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Progress value={profileCompletion} className="h-3" />
                    <span className="font-bold text-primary text-lg">{profileCompletion}%</span>
                </div>
                <Button variant="link" className="px-0 pt-2">Complete Profile</Button>
            </CardContent>
        </Card>
    );
}

const ManagerTeamView = () => (
    <Card>
        <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Monitor your team's status and performance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
                {teamMembers.map((member) => (
                    <Card key={member.name} className="hover:bg-muted/50 cursor-pointer">
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
                                    <span>Tasks:</span>
                                    <span>{member.tasksCompleted} done / {member.tasksPending} pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Performance:</span>
                                    <Progress value={member.performance} className="h-2 flex-1" />
                                    <span>{member.performance}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
);

const RecruiterView = () => (
    <Card>
        <CardHeader>
            <CardTitle>Recruitment Overview</CardTitle>
            <CardDescription>A snapshot of your hiring pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Top Stage</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobOpenings.map((job) => (
                        <TableRow key={job.title}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.applicants}</TableCell>
                            <TableCell>{job.stage}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const StandardDashboardView = () => (
     <Card>
        <CardHeader>
            <CardTitle>Company Feed</CardTitle>
            <CardDescription>Latest updates and announcements.</CardDescription>
        </CardHeader>
        <CardContent>
            {feedItems.map((item) => (
                <Card key={item.id} className="bg-background">
                    <CardHeader className="flex flex-row items-start gap-4">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person portrait" alt={item.author} />
                            <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{item.author}</p>
                                    <p className="text-xs text-muted-foreground">{item.team} &middot; {item.time}</p>
                                </div>
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4">{item.content}</p>
                        {item.image && (
                            <Image src={item.image} alt="Feed image" width={500} height={200} className="w-full h-auto object-cover rounded-md" data-ai-hint={item.imageHint}/>
                        )}
                         <div className="flex justify-between items-center mt-4 text-muted-foreground text-sm">
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4"/>
                                <span>{item.likes}</span>
                                <MessageSquare className="h-4 w-4 ml-2"/>
                                <span>{item.comments} comments</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <Button variant="ghost" size="sm"><ThumbsUp className="mr-2 h-4 w-4"/>Like</Button>
                               <Button variant="ghost" size="sm"><MessageSquare className="mr-2 h-4 w-4"/>Comment</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </CardContent>
    </Card>
);


// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage({ params }: PageProps) {
  const role = params.role.toLowerCase();

  // Define which roles see which sections
  const showManagerView = role === 'manager' || role === 'hr' || role === 'admin';
  const showRecruiterView = role === 'recruiter' || role === 'hr' || role === 'admin';
  const showEmployeeView = role === 'employee';
  
  const greetingRole = params.role.charAt(0).toUpperCase() + params.role.slice(1);

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline tracking-tight">Welcome, {greetingRole}</h1>
            <p className="text-muted-foreground">Here's your dashboard overview.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.length}</div>
                    <p className="text-xs text-muted-foreground">{showManagerView ? "members in your team" : "total employees"}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teamMembers.reduce((acc, member) => acc + member.tasksPending, 0)}</div>
                    <p className="text-xs text-muted-foreground">across all teams</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Average performance score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">2 Leave, 1 Expense</p>
                </CardContent>
            </Card>
        </div>
      
        <div className="grid grid-cols-1 gap-6">
            {(showEmployeeView || showManagerView) && <ProfileCompletionCard />}
            {showManagerView && <ManagerTeamView />}
            {showRecruiterView && <RecruiterView />}
            <StandardDashboardView />
        </div>
    </div>
  );
}

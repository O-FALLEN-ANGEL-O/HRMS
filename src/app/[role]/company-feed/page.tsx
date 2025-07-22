
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useParams } from 'next/navigation';

const initialPosts = [
  {
    id: '1',
    author: 'Olivia Martin',
    authorRole: 'CEO',
    avatar: 'https://placehold.co/100x100?text=OM',
    title: 'Announcing Our Series B Funding!',
    content: 'We are thrilled to announce that we have successfully closed our Series B funding round, raising $50 million. This is a huge milestone for our company and a testament to the hard work and dedication of every single one of you. These funds will be instrumental in accelerating our product roadmap, expanding into new markets, and growing our amazing team. Thank you for being a part of this journey. The future is bright!',
    timestamp: '2 hours ago',
    likes: 128,
    comments: 12,
  },
  {
    id: '2',
    author: 'Jackson Lee',
    authorRole: 'Head of HR',
    avatar: 'https://placehold.co/100x100?text=JL',
    title: 'Upcoming Holiday: Annual Company Retreat',
    content: 'Get ready for some fun! Our annual company retreat is just around the corner. Please note that the office will be closed from June 20th to June 22nd. We have an exciting lineup of activities, workshops, and relaxation planned. Make sure to check your email for the full itinerary and travel details. We can\'t wait to see you all there!',
    timestamp: '1 day ago',
    likes: 74,
    comments: 5,
  },
    {
    id: '3',
    author: 'Isabella Nguyen',
    authorRole: 'Head of Engineering',
    avatar: 'https://placehold.co/100x100?text=IN',
    title: 'Tech Talk: The Future of AI in HR Tech',
    content: 'Join us next Wednesday at 3 PM for an insightful tech talk on how AI is revolutionizing the HR industry. We\'ll explore the latest trends, from automated recruitment to predictive analytics for employee engagement. This is a great opportunity to learn and discuss how we can leverage these technologies at OptiTalent. A calendar invite will be sent out shortly.',
    timestamp: '3 days ago',
    likes: 45,
    comments: 8,
  },
];

type Post = typeof initialPosts[0];

function NewPostDialog({ onAddPost }: { onAddPost: (post: Post) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!title || !content) {
            toast({
                title: "Missing fields",
                description: "Please fill out both title and content for the post.",
                variant: "destructive"
            });
            return;
        }

        const newPost: Post = {
            id: Date.now().toString(),
            author: 'Admin User',
            authorRole: 'Admin',
            avatar: `https://placehold.co/100x100?text=AU`,
            title,
            content,
            timestamp: 'Just now',
            likes: 0,
            comments: 0
        };

        onAddPost(newPost);
        toast({
            title: "Post created!",
            description: "Your new post has been added to the company feed."
        });
        setIsOpen(false);
        setTitle('');
        setContent('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Post</DialogTitle>
                    <DialogDescription>
                        Share an update with the entire company.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" rows={6} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Publish Post</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CompanyFeedPage() {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const params = useParams();
    const role = params.role as string;

    const handleAddPost = (post: Post) => {
        setPosts(prev => [post, ...prev]);
    };
    
    const handleLike = (postId: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    };

    const handleComment = (postId: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold font-headline">Company Feed</h1>
          <p className="text-muted-foreground">
            Stay up-to-date with the latest news and announcements.
          </p>
        </div>
        {(role === 'admin' || role === 'hr') && <NewPostDialog onAddPost={handleAddPost} />}
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={post.avatar} data-ai-hint="person avatar"/>
                  <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{post.author}</CardTitle>
                  <CardDescription>{post.authorRole} • {post.timestamp}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold mb-2 font-headline">{post.title}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                Like ({post.likes})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                Comment ({post.comments})
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

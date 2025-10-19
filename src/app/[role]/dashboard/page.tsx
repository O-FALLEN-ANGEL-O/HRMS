
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { WelcomeDialog } from '@/components/welcome-dialog';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import HROneCalendar from '@/components/HROneCalendar';

// Reusable Components from the new design
function Widget({ title, children }: { title: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-zinc-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

function UserHighlight({ name, event }: { name: string, event: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{name} — {event}</span>
      <button className="text-indigo-600 text-xs font-medium">Wish</button>
    </div>
  );
}

const DesktopDashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar Widgets */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Widget title="Today's Celebration">
              <div className="space-y-2">
                <UserHighlight name="Kavyashree" event="Birthday" />
                <UserHighlight name="Mohammed" event="Birthday" />
                <UserHighlight name="Nikhil M" event="Birthday" />
              </div>
              <button className="text-blue-600 text-xs mt-2">See more</button>
            </Widget>

            <Widget title="Wall of Fame">
              <div className="flex items-center gap-3">
                <Image src="https://placehold.co/100x100?text=AS" width={40} height={40} className="w-10 h-10 rounded-full" alt="Adithya Sreedhar" data-ai-hint="person avatar"/>
                <div>
                  <p className="text-sm font-medium">Adithya Sreedhar</p>
                  <p className="text-xs text-gray-500">6 Badges</p>
                </div>
              </div>
            </Widget>
          </div>

          {/* Feed Section */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <Widget title="Feed">
              <div className="flex items-start gap-3">
                 <Image src="https://placehold.co/100x100?text=VS" width={40} height={40} className="w-10 h-10 rounded-full" alt="Vijayalakshmi S." data-ai-hint="person avatar"/>
                <div>
                  <h4 className="font-medium">Vijayalakshmi S.</h4>
                  <p className="text-xs text-gray-500">Senior HR Manager • 1 week ago</p>
                  <p className="text-sm mt-2">
                    We are delighted to announce the Performance Management System (PMS) for 2025.
                  </p>
                </div>
              </div>
            </Widget>
          </div>

          {/* Right Widgets (Inbox, Calendar, Stats) */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Widget title="Inbox">
              <p className="text-sm font-medium">
                <span className="font-bold text-indigo-600">4</span> Pending tasks
              </p>
            </Widget>

            <Widget title="Calendar">
              <HROneCalendar />
            </Widget>

            <Widget title="Did You Know?">
              <p className="text-sm text-gray-600">
                You can mark attendance, apply leave, or check AR directly with our AI Assistant 🤖
              </p>
            </Widget>
          </div>
        </div>
    )
};

export default function DashboardPage() {
    const { loading } = useAuth();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (loading || !isClient) {
        return <div>Loading...</div>
    }

    return (
        <>
            <WelcomeDialog />
            <div className="space-y-6">
                <DesktopDashboard />
            </div>
        </>
    );
}

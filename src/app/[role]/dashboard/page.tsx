
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Share2, Bell, Search, Home, Inbox, Award, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { WelcomeDialog } from '@/components/welcome-dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import HROneCalendar from '@/components/HROneCalendar';

const AdminKpis = dynamic(() => import('@/components/dashboards/kpi-cards/admin-kpis').then(mod => mod.AdminKpis), { ssr: false });
const HrKpis = dynamic(() => import('@/components/dashboards/kpi-cards/hr-kpis').then(mod => mod.HrKpis), { ssr: false });
const ManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/manager-kpis').then(mod => mod.ManagerKpis), { ssr: false });
const EmployeeKpis = dynamic(() => import('@/components/dashboards/kpi-cards/employee-kpis').then(mod => mod.EmployeeKpis), { ssr: false });
const RecruiterKpis = dynamic(() => import('@/components/dashboards/kpi-cards/recruiter-kpis').then(mod => mod.RecruiterKpis), { ssr: false });
const FinanceKpis = dynamic(() => import('@/components/dashboards/kpi-cards/finance-kpis').then(mod => mod.FinanceKpis), { ssr: false });
const ItManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/it-manager-kpis').then(mod => mod.ItManagerKpis), { ssr: false });
const OperationsManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/operations-manager-kpis').then(mod => mod.OperationsManagerKpis), { ssr: false });
const ProcessManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/process-manager-kpis').then(mod => mod.ProcessManagerKpis), { ssr: false });
const QaAnalystKpis = dynamic(() => import('@/components/dashboards/kpi-cards/qa-analyst-kpis').then(mod => mod.QaAnalystKpis), { ssr: false });
const TeamLeaderKpis = dynamic(() => import('@/components/dashboards/kpi-cards/team-leader-kpis').then(mod => mod.TeamLeaderKpis), { ssr: false });
const TrainerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/trainer-kpis').then(mod => mod.TrainerKpis), { ssr: false });

const kpiMap: Record<string, React.ComponentType> = {
    admin: AdminKpis,
    hr: HrKpis,
    manager: ManagerKpis,
    employee: EmployeeKpis,
    recruiter: RecruiterKpis,
    finance: FinanceKpis,
    'it-manager': ItManagerKpis,
    'operations-manager': OperationsManagerKpis,
    'process-manager': ProcessManagerKpis,
    'qa-analyst': QaAnalystKpis,
    'team-leader': TeamLeaderKpis,
    trainer: TrainerKpis,
};

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
      <span>{name} — {event}</span>
      <button className="text-indigo-600 text-xs">Wish</button>
    </div>
  );
}

const DesktopDashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* Left Sidebar Widgets */}
          <div className="col-span-3 space-y-4">
            <Widget title="Today's Celebration">
              <div className="space-y-2 text-sm">
                <UserHighlight name="Kavyashree" event="Birthday" />
                <UserHighlight name="Mohammed" event="Birthday" />
                <UserHighlight name="Nikhil M" event="Birthday" />
              </div>
              <button className="text-blue-600 text-xs mt-2">See more</button>
            </Widget>

            <Widget title="Wall of Fame">
              <div className="flex items-center gap-3">
                <Image src="/user1.jpg" width={40} height={40} className="w-10 h-10 rounded-full" alt="Adithya Sreedhar" data-ai-hint="person avatar"/>
                <div>
                  <p className="text-sm font-medium">Adithya Sreedhar</p>
                  <p className="text-xs text-gray-500">6 Badges</p>
                </div>
              </div>
            </Widget>
          </div>

          {/* Feed Section */}
          <div className="col-span-6 space-y-4">
            <Widget title="Feed">
              <div className="flex items-start gap-3">
                <Image src="/hr.jpg" width={40} height={40} className="w-10 h-10 rounded-full" alt="Vijayalakshmi S." data-ai-hint="person avatar"/>
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
          <div className="col-span-3 space-y-4">
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


const MobileDashboard = () => {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const feedPosts = [
        {
            author: 'Divyashree',
            authorRole: 'Specialist',
            timestamp: '1 month ago',
            avatar: `https://ui-avatars.com/api/?name=Divyashree&background=random`,
            title: 'Employee Referral Program is Active!',
            image: `https://picsum.photos/seed/referral/800/400`,
            imageHint: 'employee referral program'
        },
        {
            author: 'Jackson Lee',
            authorRole: 'Head of HR',
            timestamp: '2 months ago',
            avatar: `https://ui-avatars.com/api/?name=Jackson+Lee&background=random`,
            title: 'Annual Company Retreat Location Announced!',
            image: `https://picsum.photos/seed/retreat/800/400`,
            imageHint: 'company retreat beach'
        }
    ];

    return (
        <div className="space-y-6">
            {/* This is the content for the mobile view, which seems to be out of scope of the user's request, but we keep it */}
        </div>
    )
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const params = useParams();
    const [isClient, setIsClient] = useState(false);
    const role = params.role as string;
    const KpiComponent = kpiMap[role] || null;

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
                {KpiComponent && <Suspense fallback={<p>Loading KPIs...</p>}><KpiComponent /></Suspense>}
                <DesktopDashboard />
            </div>
            <div className="md:hidden">
                {/* Mobile view is separate and can be developed independently */}
                {/* <MobileDashboard /> */}
            </div>
        </>
    );
}

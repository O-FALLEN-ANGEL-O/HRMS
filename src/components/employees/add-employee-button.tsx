
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/mock-data/employees';

const AddEmployeeDialog = dynamic(() => import('@/components/employees/add-employee-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Add Employee</Button>,
    ssr: false
});

export default function AddEmployeeButton({ onEmployeeAdded }: { onEmployeeAdded: (employee: User) => void }) {
    return (
        <Suspense fallback={<Button disabled>Loading...</Button>}>
            <AddEmployeeDialog onEmployeeAdded={onEmployeeAdded} />
        </Suspense>
    );
}

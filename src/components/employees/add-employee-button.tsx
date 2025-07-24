
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AddEmployeeDialog = dynamic(() => import('@/components/employees/add-employee-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Add Employee</Button>,
    ssr: false
});

export default function AddEmployeeButton() {
    return (
        <Suspense fallback={<Button disabled>Loading...</Button>}>
            <AddEmployeeDialog />
        </Suspense>
    );
}


import { mockEmployees } from './employees';

export type Shift = {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    department_id: string;
};

export const shifts: Shift[] = [
    { id: 'shift-001', name: 'Morning', start_time: '09:00', end_time: '18:00', department_id: 'd-005' },
    { id: 'shift-002', name: 'Evening', start_time: '14:00', end_time: '23:00', department_id: 'd-005' },
    { id: 'shift-003', name: 'Night', start_time: '22:00', end_time: '07:00', department_id: 'd-005' },
    { id: 'shift-004', name: 'US Process', start_time: '19:00', end_time: '04:00', department_id: 'd-005' },
];

// Mock data for which employees appear on the roster page.
// In a real app, this would be based on the manager's team.
export const teamForShiftRoster = mockEmployees.filter(emp => emp.department.name === 'Customer Support');

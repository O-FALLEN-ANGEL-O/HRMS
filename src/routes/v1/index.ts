
import { Router } from 'express';
import employeeRoutes from '@/features/employee-master/employee.routes';
import authRoutes from '@/features/auth/auth.routes';
// Import other feature routes as they are created
// import attendanceRoutes from '@/features/attendance/attendance.routes';
// import leaveRoutes from '@/features/leave/leave.routes';
// ... etc

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/employees', employeeRoutes);
// v1Router.use('/attendance', attendanceRoutes);
// v1Router.use('/leave', leaveRoutes);

export default v1Router;

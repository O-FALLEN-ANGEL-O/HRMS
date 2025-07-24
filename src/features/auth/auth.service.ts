
import { createClient } from '@supabase/supabase-js';
import prisma from '@/config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDto, RegisterDto } from './auth.dto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');

export const registerUser = async (data: RegisterDto) => {
    const { email, password, firstName, lastName, jobTitle, departmentId, roleId } = data;

    // Check if user already exists
    const existingUser = await prisma.employee.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in Prisma DB
    const newEmployee = await prisma.employee.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            jobTitle,
            hireDate: new Date(),
            department: { connect: { id: departmentId } },
            role: { connect: { id: roleId } },
        }
    });

    // Create user in Supabase Auth (optional, if you want to use Supabase's features like RLS)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                employee_id: newEmployee.id,
                role: (await prisma.role.findUnique({ where: { id: roleId } }))?.name,
            }
        }
    });

    if (authError) {
        // If Supabase auth creation fails, roll back the Prisma user creation for consistency
        await prisma.employee.delete({ where: { id: newEmployee.id } });
        throw new Error(`Supabase Auth Error: ${authError.message}`);
    }

    const { password: _, ...employeeWithoutPassword } = newEmployee;
    return { employee: employeeWithoutPassword };
};

export const loginUser = async (data: LoginDto) => {
    const { email, password } = data;

    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error || !session) {
        throw new Error(`Login failed: ${error?.message || 'No session created'}`);
    }

    const { password: _, ...employeeWithoutPassword } = employee;

    return {
        employee: employeeWithoutPassword,
        token: session.access_token,
    };
};

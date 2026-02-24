import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { base, TABLES } from '@/lib/airtable';
import { getUserByEmail } from '@/lib/services';

// POST /api/setup - One-time setup to create the founder account
// Call this once to seed your first admin user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);

    await base(TABLES.USERS).create({
      'Name': name,
      'Email': email,
      'Password': hashedPassword,
      'Role': 'founder',
    });

    return NextResponse.json({ success: true, message: 'Founder account created successfully' });
  } catch (error: unknown) {
    console.error('Setup error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: `Setup failed: ${message}. Make sure your Airtable base has a table named "Users" with columns: Name, Email, Password, Role.` 
    }, { status: 500 });
  }
}

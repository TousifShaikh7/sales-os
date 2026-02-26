import { NextRequest, NextResponse } from 'next/server';
import { getUserByRole } from '@/lib/services';
import { createToken } from '@/lib/auth';
import { serialize } from 'cookie';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || (role !== 'founder' && role !== 'rep')) {
      return NextResponse.json({ error: 'Valid role is required (founder or rep)' }, { status: 400 });
    }

    const user = await getUserByRole(role as UserRole);

    let authUser;

    // If no user exists in Airtable, mock one so the app doesn't break
    if (!user) {
      authUser = {
        id: `mock-${role}-id`,
        name: role === 'founder' ? 'Founder Demo' : 'Sales Rep Demo',
        email: `${role}@demo.com`,
        role: role as UserRole
      };
    } else {
      authUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    const token = createToken(authUser);

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({ success: true, user: authUser });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

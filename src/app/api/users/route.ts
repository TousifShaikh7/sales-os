import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';
import { hashPassword } from '@/lib/auth';
import { base, TABLES } from '@/lib/airtable';
import { getUsers } from '@/lib/services';

function getAuthUser(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/users - Founder sees all users, reps can only see their own profile
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);

    if (user.role === 'founder') {
      return NextResponse.json({ data: safeUsers });
    }

    const currentUser = safeUsers.filter((u) => u.id === user.id);
    return NextResponse.json({ data: currentUser });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create user (founder only)
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'founder') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const hashedPassword = hashPassword(data.password);

    await base(TABLES.USERS).create({
      'Name': data.name,
      'Email': data.email,
      'Password': hashedPassword,
      'Role': data.role,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';
import { getWeeklyReviews } from '@/lib/services';

function getAuthUser(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reviews = await getWeeklyReviews(user.id, user.role);
    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error('Get weekly reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly reviews' }, { status: 500 });
  }
}

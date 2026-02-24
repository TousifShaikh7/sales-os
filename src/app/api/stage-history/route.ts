import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';
import { getStageHistory } from '@/lib/services';

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

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get('opportunityId') || undefined;

  try {
    const history = await getStageHistory(opportunityId);
    return NextResponse.json({ data: history });
  } catch (error) {
    console.error('Get stage history error:', error);
    return NextResponse.json({ error: 'Failed to fetch stage history' }, { status: 500 });
  }
}

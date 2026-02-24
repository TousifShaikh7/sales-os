import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';
import { getOpportunities, createOpportunity, updateOpportunity, getOpportunityById } from '@/lib/services';

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
    const opportunities = await getOpportunities(user.id, user.role);
    return NextResponse.json({ data: opportunities });
  } catch (error) {
    console.error('Get opportunities error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (user.role !== 'founder') {
      data.assignedTo = user.id;
    }
    const opportunity = await createOpportunity(data);
    return NextResponse.json({ data: opportunity });
  } catch (error) {
    console.error('Create opportunity error:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const opportunity = await getOpportunityById(id);
    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (user.role !== 'founder' && opportunity.assignedTo !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (user.role !== 'founder') {
      delete updateData.assignedTo;
    }

    await updateOpportunity(id, updateData, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update opportunity error:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

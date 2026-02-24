import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';
import { getTasks, createTask, updateTask } from '@/lib/services';

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
    const tasks = await getTasks(user.id, user.role);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only founder can create/assign tasks
  if (user.role !== 'founder') {
    return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const task = await createTask(data);
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
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

    // Non-founders can only update task status
    if (user.role !== 'founder') {
      const allowedFields = { status: updateData.status };
      await updateTask(id, allowedFields);
    } else {
      await updateTask(id, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

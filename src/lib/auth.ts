import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthUser, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

// Role-based permission checks
export function canViewAllData(role: UserRole): boolean {
  return role === 'founder';
}

export function canAssignTasks(role: UserRole): boolean {
  return role === 'founder';
}

export function canViewProjections(role: UserRole): boolean {
  return role === 'founder';
}

export function canModifyProjectionsLogic(role: UserRole): boolean {
  return role === 'founder';
}

export function canAddLeads(role: UserRole): boolean {
  return true; // All roles can add leads
}

export function canUpdateLeads(role: UserRole): boolean {
  return true; // All roles can update their assigned leads
}

export function canLogActivities(role: UserRole): boolean {
  return true; // All roles can log activities
}

export function canUpdateDealStage(role: UserRole): boolean {
  return true; // All roles can update deal stage
}

export function canViewOtherRepsDeals(role: UserRole): boolean {
  return role === 'founder';
}

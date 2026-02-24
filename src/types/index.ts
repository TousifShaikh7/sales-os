// Type definitions for the Sales Operating System

export type UserRole = 'founder' | 'field_sales' | 'inside_sales';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Lead Types
export type LeadSource = 'Website' | 'Referral' | 'Trade Show' | 'LinkedIn' | 'Cold Call' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string;
  assignedToName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  opportunityId?: string;
}

// Opportunity Types
export type SalesStage = 
  | 'Prospecting' 
  | 'Qualification' 
  | 'Proposal' 
  | 'Negotiation' 
  | 'Closed Won' 
  | 'Closed Lost';

export type ForecastCategory = 'Pipeline' | 'Best Case' | 'Commit' | 'Closed';

export interface Opportunity {
  id: string;
  name: string;
  leadId?: string;
  dealValue: number;
  stage: SalesStage;
  probability: number;
  weightedValue: number;
  expectedCloseDate: string;
  forecastCategory: ForecastCategory;
  assignedTo: string;
  assignedToName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Activity Types
export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Site Visit';

export interface Activity {
  id: string;
  opportunityId: string;
  opportunityName?: string;
  type: ActivityType;
  description: string;
  outcome?: string;
  date: string;
  nextFollowUp?: string;
  performedBy: string;
  performedByName?: string;
  createdAt: string;
}

// Task Types
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  opportunityId?: string;
  opportunityName?: string;
  assignedTo: string;
  assignedToName?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt?: string;
}

// Weekly Review Types
export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  repId: string;
  repName?: string;
  totalPipelineValue: number;
  dealsAdded: number;
  dealsClosed: number;
  activitiesLogged: number;
  notes?: string;
  createdAt: string;
}

// Stage History Types
export interface StageHistory {
  id: string;
  opportunityId: string;
  opportunityName?: string;
  fromStage: SalesStage;
  toStage: SalesStage;
  changedBy: string;
  changedByName?: string;
  changedAt: string;
  daysInPreviousStage?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalPipeline: number;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  wonValue: number;
  avgDealSize: number;
  conversionRate: number;
  activitiesThisWeek: number;
  overdueTasks: number;
  newLeads: number;
}

export interface PipelineByStage {
  stage: SalesStage;
  count: number;
  value: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

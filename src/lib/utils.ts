import { SalesStage, ForecastCategory } from '@/types';

// Map sales stage to probability percentage
export function getStageProbability(stage: SalesStage): number {
  const probabilities: Record<SalesStage, number> = {
    'Prospecting': 10,
    'Qualification': 25,
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
    'Closed Lost': 0,
  };
  return probabilities[stage];
}

// Map sales stage to forecast category
export function getForecastCategory(stage: SalesStage): ForecastCategory {
  const categories: Record<SalesStage, ForecastCategory> = {
    'Prospecting': 'Pipeline',
    'Qualification': 'Pipeline',
    'Proposal': 'Best Case',
    'Negotiation': 'Commit',
    'Closed Won': 'Closed',
    'Closed Lost': 'Closed',
  };
  return categories[stage];
}

// Calculate weighted forecast value
export function getWeightedValue(dealValue: number, stage: SalesStage): number {
  return Math.round(dealValue * (getStageProbability(stage) / 100));
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format date
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format relative date
export function formatRelativeDate(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

// Check if a task is overdue
export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
}

// Get stage color for UI
export function getStageColor(stage: SalesStage): string {
  const colors: Record<SalesStage, string> = {
    'Prospecting': 'bg-blue-100 text-blue-800',
    'Qualification': 'bg-indigo-100 text-indigo-800',
    'Proposal': 'bg-yellow-100 text-yellow-800',
    'Negotiation': 'bg-orange-100 text-orange-800',
    'Closed Won': 'bg-green-100 text-green-800',
    'Closed Lost': 'bg-red-100 text-red-800',
  };
  return colors[stage];
}

// Get lead status color
export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Qualified': 'bg-green-100 text-green-800',
    'Disqualified': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Get task priority color
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'Low': 'bg-gray-100 text-gray-700',
    'Medium': 'bg-blue-100 text-blue-700',
    'High': 'bg-orange-100 text-orange-700',
    'Urgent': 'bg-red-100 text-red-700',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
}

// Get task status color
export function getTaskStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

// Classname helper
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

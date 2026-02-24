import { base, TABLES } from '@/lib/airtable';
import { Lead, Opportunity, Activity, Task, WeeklyReview, StageHistory, User } from '@/types';
import { getStageProbability, getForecastCategory, getWeightedValue } from '@/lib/utils';
import { FieldSet } from 'airtable';

// ===================== USERS =====================
export async function getUsers(): Promise<User[]> {
  const records = await base(TABLES.USERS).select().all();
  return records.map((r) => ({
    id: r.id,
    name: r.get('Name') as string,
    email: r.get('Email') as string,
    role: r.get('Role') as User['role'],
    password: r.get('Password') as string,
  }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const records = await base(TABLES.USERS)
    .select({ filterByFormula: `{Email} = '${email}'`, maxRecords: 1 })
    .all();
  if (records.length === 0) return null;
  const r = records[0];
  return {
    id: r.id,
    name: r.get('Name') as string,
    email: r.get('Email') as string,
    role: r.get('Role') as User['role'],
    password: r.get('Password') as string,
  };
}

// ===================== LEADS =====================
export async function getLeads(userId?: string, role?: string): Promise<Lead[]> {
  let formula = '';
  if (role && role !== 'founder' && userId) {
    formula = `{Assigned To ID} = '${userId}'`;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Created At', direction: 'desc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.LEADS).select(options).all();
  return records.map((r) => ({
    id: r.id,
    companyName: (r.get('Company Name') as string) || '',
    contactPerson: (r.get('Contact Person') as string) || '',
    email: (r.get('Email') as string) || '',
    phone: (r.get('Phone') as string) || '',
    source: (r.get('Source') as Lead['source']) || 'Other',
    status: (r.get('Status') as Lead['status']) || 'New',
    assignedTo: (r.get('Assigned To ID') as string) || '',
    assignedToName: (r.get('Assigned To Name') as string) || '',
    notes: (r.get('Notes') as string) || '',
    createdAt: (r.get('Created At') as string) || new Date().toISOString(),
    updatedAt: (r.get('Updated At') as string) || '',
    opportunityId: (r.get('Opportunity ID') as string) || '',
  }));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const r = await base(TABLES.LEADS).find(id);
    return {
      id: r.id,
      companyName: (r.get('Company Name') as string) || '',
      contactPerson: (r.get('Contact Person') as string) || '',
      email: (r.get('Email') as string) || '',
      phone: (r.get('Phone') as string) || '',
      source: (r.get('Source') as Lead['source']) || 'Other',
      status: (r.get('Status') as Lead['status']) || 'New',
      assignedTo: (r.get('Assigned To ID') as string) || '',
      assignedToName: (r.get('Assigned To Name') as string) || '',
      notes: (r.get('Notes') as string) || '',
      createdAt: (r.get('Created At') as string) || new Date().toISOString(),
      updatedAt: (r.get('Updated At') as string) || '',
      opportunityId: (r.get('Opportunity ID') as string) || '',
    };
  } catch {
    return null;
  }
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  const record = await base(TABLES.LEADS).create({
    'Company Name': data.companyName,
    'Contact Person': data.contactPerson,
    'Email': data.email,
    'Phone': data.phone,
    'Source': data.source,
    'Status': data.status || 'New',
    'Assigned To ID': data.assignedTo,
    'Notes': data.notes || '',
    'Created At': new Date().toISOString(),
  });

  return {
    id: record.id,
    companyName: data.companyName || '',
    contactPerson: data.contactPerson || '',
    email: data.email || '',
    phone: data.phone || '',
    source: data.source || 'Other',
    status: data.status || 'New',
    assignedTo: data.assignedTo || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<void> {
  const fields: Partial<FieldSet> = { 'Updated At': new Date().toISOString() };
  if (data.companyName !== undefined) fields['Company Name'] = data.companyName;
  if (data.contactPerson !== undefined) fields['Contact Person'] = data.contactPerson;
  if (data.email !== undefined) fields['Email'] = data.email;
  if (data.phone !== undefined) fields['Phone'] = data.phone;
  if (data.source !== undefined) fields['Source'] = data.source;
  if (data.status !== undefined) fields['Status'] = data.status;
  if (data.assignedTo !== undefined) fields['Assigned To ID'] = data.assignedTo;
  if (data.notes !== undefined) fields['Notes'] = data.notes;
  if (data.opportunityId !== undefined) fields['Opportunity ID'] = data.opportunityId;

  await base(TABLES.LEADS).update(id, fields);
}

// ===================== OPPORTUNITIES =====================
export async function getOpportunities(userId?: string, role?: string): Promise<Opportunity[]> {
  let formula = '';
  if (role && role !== 'founder' && userId) {
    formula = `{Assigned To ID} = '${userId}'`;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Created At', direction: 'desc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.OPPORTUNITIES).select(options).all();
  return records.map((r) => {
    const stage = (r.get('Stage') as Opportunity['stage']) || 'Prospecting';
    const dealValue = (r.get('Deal Value') as number) || 0;
    return {
      id: r.id,
      name: (r.get('Name') as string) || '',
      leadId: (r.get('Lead ID') as string) || '',
      dealValue,
      stage,
      probability: getStageProbability(stage),
      weightedValue: getWeightedValue(dealValue, stage),
      expectedCloseDate: (r.get('Expected Close Date') as string) || '',
      forecastCategory: getForecastCategory(stage),
      assignedTo: (r.get('Assigned To ID') as string) || '',
      assignedToName: (r.get('Assigned To Name') as string) || '',
      notes: (r.get('Notes') as string) || '',
      createdAt: (r.get('Created At') as string) || new Date().toISOString(),
      updatedAt: (r.get('Updated At') as string) || '',
    };
  });
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const r = await base(TABLES.OPPORTUNITIES).find(id);
    const stage = (r.get('Stage') as Opportunity['stage']) || 'Prospecting';
    const dealValue = (r.get('Deal Value') as number) || 0;
    return {
      id: r.id,
      name: (r.get('Name') as string) || '',
      leadId: (r.get('Lead ID') as string) || '',
      dealValue,
      stage,
      probability: getStageProbability(stage),
      weightedValue: getWeightedValue(dealValue, stage),
      expectedCloseDate: (r.get('Expected Close Date') as string) || '',
      forecastCategory: getForecastCategory(stage),
      assignedTo: (r.get('Assigned To ID') as string) || '',
      assignedToName: (r.get('Assigned To Name') as string) || '',
      notes: (r.get('Notes') as string) || '',
      createdAt: (r.get('Created At') as string) || new Date().toISOString(),
      updatedAt: (r.get('Updated At') as string) || '',
    };
  } catch {
    return null;
  }
}

export async function createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
  const stage = data.stage || 'Prospecting';
  const dealValue = data.dealValue || 0;
  
  const record = await base(TABLES.OPPORTUNITIES).create({
    'Name': data.name,
    'Lead ID': data.leadId || '',
    'Deal Value': dealValue,
    'Stage': stage,
    'Expected Close Date': data.expectedCloseDate,
    'Assigned To ID': data.assignedTo,
    'Notes': data.notes || '',
    'Created At': new Date().toISOString(),
  });

  return {
    id: record.id,
    name: data.name || '',
    leadId: data.leadId,
    dealValue,
    stage,
    probability: getStageProbability(stage),
    weightedValue: getWeightedValue(dealValue, stage),
    expectedCloseDate: data.expectedCloseDate || '',
    forecastCategory: getForecastCategory(stage),
    assignedTo: data.assignedTo || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };
}

export async function updateOpportunity(id: string, data: Partial<Opportunity>, changedBy?: string): Promise<void> {
  // Get current record for stage history
  let currentStage: string | undefined;
  if (data.stage) {
    const current = await base(TABLES.OPPORTUNITIES).find(id);
    currentStage = current.get('Stage') as string;
  }

  const fields: Partial<FieldSet> = { 'Updated At': new Date().toISOString() };
  if (data.name !== undefined) fields['Name'] = data.name;
  if (data.dealValue !== undefined) fields['Deal Value'] = data.dealValue;
  if (data.stage !== undefined) fields['Stage'] = data.stage;
  if (data.expectedCloseDate !== undefined) fields['Expected Close Date'] = data.expectedCloseDate;
  if (data.assignedTo !== undefined) fields['Assigned To ID'] = data.assignedTo;
  if (data.notes !== undefined) fields['Notes'] = data.notes;

  await base(TABLES.OPPORTUNITIES).update(id, fields);

  // Create stage history record if stage changed
  if (data.stage && currentStage && data.stage !== currentStage) {
    await createStageHistory({
      opportunityId: id,
      fromStage: currentStage as Opportunity['stage'],
      toStage: data.stage,
      changedBy: changedBy || '',
    });
  }
}

// ===================== ACTIVITIES =====================
export async function getActivities(userId?: string, role?: string, opportunityId?: string): Promise<Activity[]> {
  let formula = '';
  if (opportunityId) {
    formula = `{Opportunity ID} = '${opportunityId}'`;
    if (role && role !== 'founder' && userId) {
      formula = `AND(${formula}, {Performed By ID} = '${userId}')`;
    }
  } else if (role && role !== 'founder' && userId) {
    formula = `{Performed By ID} = '${userId}'`;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Date', direction: 'desc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.ACTIVITIES).select(options).all();
  return records.map((r) => ({
    id: r.id,
    opportunityId: (r.get('Opportunity ID') as string) || '',
    opportunityName: (r.get('Opportunity Name') as string) || '',
    type: (r.get('Type') as Activity['type']) || 'Call',
    description: (r.get('Description') as string) || '',
    outcome: (r.get('Outcome') as string) || '',
    date: (r.get('Date') as string) || '',
    nextFollowUp: (r.get('Next Follow Up') as string) || '',
    performedBy: (r.get('Performed By ID') as string) || '',
    performedByName: (r.get('Performed By Name') as string) || '',
    createdAt: (r.get('Created At') as string) || new Date().toISOString(),
  }));
}

export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const record = await base(TABLES.ACTIVITIES).create({
    'Opportunity ID': data.opportunityId,
    'Type': data.type,
    'Description': data.description,
    'Outcome': data.outcome || '',
    'Date': data.date || new Date().toISOString().split('T')[0],
    'Next Follow Up': data.nextFollowUp || '',
    'Performed By ID': data.performedBy,
    'Created At': new Date().toISOString(),
  });

  return {
    id: record.id,
    opportunityId: data.opportunityId || '',
    type: data.type || 'Call',
    description: data.description || '',
    outcome: data.outcome || '',
    date: data.date || new Date().toISOString().split('T')[0],
    nextFollowUp: data.nextFollowUp || '',
    performedBy: data.performedBy || '',
    createdAt: new Date().toISOString(),
  };
}

// ===================== TASKS =====================
export async function getTasks(userId?: string, role?: string): Promise<Task[]> {
  let formula = '';
  if (role && role !== 'founder' && userId) {
    formula = `{Assigned To ID} = '${userId}'`;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Due Date', direction: 'asc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.TASKS).select(options).all();
  return records.map((r) => {
    const dueDate = (r.get('Due Date') as string) || '';
    const status = (r.get('Status') as Task['status']) || 'Not Started';
    const isTaskOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'Completed';
    return {
      id: r.id,
      title: (r.get('Title') as string) || '',
      description: (r.get('Description') as string) || '',
      opportunityId: (r.get('Opportunity ID') as string) || '',
      opportunityName: (r.get('Opportunity Name') as string) || '',
      assignedTo: (r.get('Assigned To ID') as string) || '',
      assignedToName: (r.get('Assigned To Name') as string) || '',
      dueDate,
      status: isTaskOverdue ? 'Overdue' : status,
      priority: (r.get('Priority') as Task['priority']) || 'Medium',
      createdAt: (r.get('Created At') as string) || new Date().toISOString(),
      updatedAt: (r.get('Updated At') as string) || '',
    };
  });
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const r = await base(TABLES.TASKS).find(id);
    const dueDate = (r.get('Due Date') as string) || '';
    const status = (r.get('Status') as Task['status']) || 'Not Started';
    const isTaskOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'Completed';
    return {
      id: r.id,
      title: (r.get('Title') as string) || '',
      description: (r.get('Description') as string) || '',
      opportunityId: (r.get('Opportunity ID') as string) || '',
      opportunityName: (r.get('Opportunity Name') as string) || '',
      assignedTo: (r.get('Assigned To ID') as string) || '',
      assignedToName: (r.get('Assigned To Name') as string) || '',
      dueDate,
      status: isTaskOverdue ? 'Overdue' : status,
      priority: (r.get('Priority') as Task['priority']) || 'Medium',
      createdAt: (r.get('Created At') as string) || new Date().toISOString(),
      updatedAt: (r.get('Updated At') as string) || '',
    };
  } catch {
    return null;
  }
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const record = await base(TABLES.TASKS).create({
    'Title': data.title,
    'Description': data.description || '',
    'Opportunity ID': data.opportunityId || '',
    'Assigned To ID': data.assignedTo,
    'Due Date': data.dueDate,
    'Status': data.status || 'Not Started',
    'Priority': data.priority || 'Medium',
    'Created At': new Date().toISOString(),
  });

  return {
    id: record.id,
    title: data.title || '',
    description: data.description || '',
    opportunityId: data.opportunityId || '',
    assignedTo: data.assignedTo || '',
    dueDate: data.dueDate || '',
    status: data.status || 'Not Started',
    priority: data.priority || 'Medium',
    createdAt: new Date().toISOString(),
  };
}

export async function updateTask(id: string, data: Partial<Task>): Promise<void> {
  const fields: Partial<FieldSet> = { 'Updated At': new Date().toISOString() };
  if (data.title !== undefined) fields['Title'] = data.title;
  if (data.description !== undefined) fields['Description'] = data.description;
  if (data.status !== undefined) fields['Status'] = data.status;
  if (data.priority !== undefined) fields['Priority'] = data.priority;
  if (data.dueDate !== undefined) fields['Due Date'] = data.dueDate;
  if (data.assignedTo !== undefined) fields['Assigned To ID'] = data.assignedTo;

  await base(TABLES.TASKS).update(id, fields);
}

// ===================== WEEKLY REVIEWS =====================
export async function getWeeklyReviews(userId?: string, role?: string): Promise<WeeklyReview[]> {
  let formula = '';
  if (role && role !== 'founder' && userId) {
    formula = `{Rep ID} = '${userId}'`;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Week Start Date', direction: 'desc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.WEEKLY_REVIEWS).select(options).all();
  return records.map((r) => ({
    id: r.id,
    weekStartDate: (r.get('Week Start Date') as string) || '',
    weekEndDate: (r.get('Week End Date') as string) || '',
    repId: (r.get('Rep ID') as string) || '',
    repName: (r.get('Rep Name') as string) || '',
    totalPipelineValue: (r.get('Total Pipeline Value') as number) || 0,
    dealsAdded: (r.get('Deals Added') as number) || 0,
    dealsClosed: (r.get('Deals Closed') as number) || 0,
    activitiesLogged: (r.get('Activities Logged') as number) || 0,
    notes: (r.get('Notes') as string) || '',
    createdAt: (r.get('Created At') as string) || new Date().toISOString(),
  }));
}

// ===================== STAGE HISTORY =====================
export async function getStageHistory(userId?: string, role?: string, opportunityId?: string): Promise<StageHistory[]> {
  let formula = '';
  if (role && role !== 'founder' && userId) {
    formula = `{Changed By ID} = '${userId}'`;
  }
  if (opportunityId) {
    const opportunityFilter = `{Opportunity ID} = '${opportunityId}'`;
    formula = formula ? `AND(${formula}, ${opportunityFilter})` : opportunityFilter;
  }

  const options: Record<string, unknown> = { sort: [{ field: 'Changed At', direction: 'desc' }] };
  if (formula) options.filterByFormula = formula;

  const records = await base(TABLES.STAGE_HISTORY).select(options).all();
  return records.map((r) => ({
    id: r.id,
    opportunityId: (r.get('Opportunity ID') as string) || '',
    opportunityName: (r.get('Opportunity Name') as string) || '',
    fromStage: (r.get('From Stage') as StageHistory['fromStage']) || 'Prospecting',
    toStage: (r.get('To Stage') as StageHistory['toStage']) || 'Prospecting',
    changedBy: (r.get('Changed By ID') as string) || '',
    changedByName: (r.get('Changed By Name') as string) || '',
    changedAt: (r.get('Changed At') as string) || new Date().toISOString(),
    daysInPreviousStage: (r.get('Days In Previous Stage') as number) || 0,
  }));
}

export async function createStageHistory(data: Partial<StageHistory>): Promise<void> {
  await base(TABLES.STAGE_HISTORY).create({
    'Opportunity ID': data.opportunityId,
    'From Stage': data.fromStage,
    'To Stage': data.toStage,
    'Changed By ID': data.changedBy,
    'Changed At': new Date().toISOString(),
  });
}

import Airtable from 'airtable';

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

// Table names — adjust these to match your Airtable base
export const TABLES = {
  LEADS: 'Leads',
  OPPORTUNITIES: 'Opportunities',
  ACTIVITIES: 'Activities',
  TASKS: 'Tasks',
  WEEKLY_REVIEWS: 'Weekly Reviews',
  STAGE_HISTORY: 'Stage History',
  USERS: 'Users',
} as const;

export { base };
export default airtable;

import type {
  DashboardObject,
  DashboardCollection,
  DashboardSavedView,
  DashboardWikiPage,
} from './mockDataType';

// 🔥 STATIC DATA
export const STATIC_OBJECTS: DashboardObject[] = [
  {
    id: '1',
    title: 'Design Landing Page',
    type: 'task',
    icon: '📝',
    updatedAt: '2025-01-10',
    properties: {
      Status: 'In Progress',
      Priority: 'High',
      Labels: [],
    },
  },
  {
    id: '2',
    title: 'Follow up with Client',
    type: 'email',
    icon: '📧',
    updatedAt: '2025-01-08',
    properties: {
      Labels: ['Follow Up'],
    },
  },
  {
    id: '3',
    title: 'Team Meeting Notes',
    type: 'note',
    icon: '📄',
    updatedAt: '2025-01-11',
    properties: {},
  },
];

export const STATIC_COLLECTIONS: DashboardCollection[] = [
  { id: 'c1', name: 'Tasks', icon: '📘' },
  { id: 'c2', name: 'Emails', icon: '📧' },
  { id: 'c3', name: 'Notes', icon: '📝' },
];

export const STATIC_SAVED_VIEWS: DashboardSavedView[] = [
  {
    id: 'v1',
    name: 'High Priority Tasks',
    description: 'Tasks with Priority High',
    collectionId: 'c1',
    isPrivate: false,
  },
  {
    id: 'v2',
    name: 'Follow Up Emails',
    description: 'Emails with Follow Up label',
    collectionId: 'c2',
    isPrivate: true,
  },
];

export const STATIC_WIKI: DashboardWikiPage[] = [
  { id: 'w1', title: 'Company Guidelines' },
  { id: 'w2', title: 'Project Structure' },
];

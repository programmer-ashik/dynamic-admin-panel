// 🔥 MAIN OBJECT TYPE
export interface DashboardObject {
  id: string;
  title: string;
  type: 'task' | 'email' | 'note' | string; // extendable
  icon?: string;
  updatedAt: string;
  properties: {
    Status?: string;
    Priority?: string;
    Labels?: string[];
    [key: string]: unknown;
  };
}

// 🔥 COLLECTION TYPE
export interface DashboardCollection {
  id: string;
  name: string;
  icon?: string;
}

// 🔥 SAVED VIEW TYPE
export interface DashboardSavedView {
  id: string;
  name: string;
  description?: string;
  collectionId?: string;
  isPrivate: boolean;
}

// 🔥 WIKI PAGE TYPE
export interface DashboardWikiPage {
  id: string;
  title: string;
}
export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
}


export const menu = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "LayoutGrid",
    route: "/",
    children: []
  },
  {
    id: "notes",
    title: "Notes",
    icon: "FileText",
    children: [
      {
        id: "daily",
        title: "Daily Notes",
        route: "/daily"
      },
      {
        id: "weekly",
        title: "Weekly Notes",
        route: "/weekly"
      }
    ]
  },
  {
    id: "settings",
    title: "Settings",
    icon: "Settings",
    route: "/settings",
    children: []
  }
];

import App from '../App';
import { Navigate } from 'react-router-dom';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import DashboardPage from '../pages/DashboardPage';
export const RoutesConfig = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={'/w/ws_default'} replace />,
      },
      {
        path: 'w/:wsId',
        element: <WorkspaceLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={'dashboard'} replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
];

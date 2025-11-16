import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RoutesConfig } from './config/route.config';
import { ThemeProvider } from './components/common/ThemeProvider';
const router = createBrowserRouter(RoutesConfig);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="metanote-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);

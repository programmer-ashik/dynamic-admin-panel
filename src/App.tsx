import { Outlet } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <div className="h-screen w-screen overflow-hidden bg-background">
          <Outlet />
        </div>
        <Toaster />
      </TooltipProvider>
    </Provider>
  );
}

export default App;

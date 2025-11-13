import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { errorService } from './services/errorService';

errorService.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  </StrictMode>
);

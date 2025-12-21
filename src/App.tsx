import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BannerManager } from './pages/BannerManager';
import { BannerEditor } from './pages/BannerEditor';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BannerManager />} />
            <Route path="/banner/:id" element={<BannerEditor />} />
            <Route path="/success" element={<PaymentSuccess />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

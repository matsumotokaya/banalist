import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BannerManager } from './pages/BannerManager';
import { TemplateGallery } from './pages/TemplateGallery';
import { BannerEditor } from './pages/BannerEditor';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Tokushoho } from './pages/Tokushoho';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { SecurityPolicy } from './pages/SecurityPolicy';
import { AboutUs } from './pages/AboutUs';
import { Contact } from './pages/Contact';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TemplateGallery />} />
            <Route path="/mydesign" element={<BannerManager />} />
            <Route path="/banner/:id" element={<BannerEditor />} />
            <Route path="/banner" element={<BannerEditor />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/legal/specified-commercial-transactions-act" element={<Tokushoho />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/security" element={<SecurityPolicy />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

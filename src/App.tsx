import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BannerManager } from './pages/BannerManager';
import { BannerEditor } from './pages/BannerEditor';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BannerManager />} />
          <Route path="/banner/:id" element={<BannerEditor />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

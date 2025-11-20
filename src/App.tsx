import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BannerManager } from './pages/BannerManager';
import { BannerEditor } from './pages/BannerEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BannerManager />} />
        <Route path="/banner/:id" element={<BannerEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

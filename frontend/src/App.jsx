import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SessionsPage from '@/pages/SessionsPage';
import HeatmapPage from '@/pages/HeatmapPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sessions" replace />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
        <Route path="*" element={<Navigate to="/sessions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

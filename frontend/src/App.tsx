import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SessionProvider } from './context/SessionContext';
import WelcomePage from './pages/WelcomePage/WelcomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';

export default function App() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </LanguageProvider>
  );
}

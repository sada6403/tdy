import { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AppRoutes from './routes';
import ChatAssistant from '../components/common/ChatAssistant';
import NFLoadingScreen from '../components/common/NFLoadingScreen';

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  
  useEffect(() => {
    const handleMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const handleClick = (e) => {
      const btn = e.target.closest('.btn-gold,.btn-emerald,.btn-nav-cta,.form-submit,.calc-cta-btn');
      if (!btn) return;
      const r = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const sz = Math.max(rect.width, rect.height);
      r.style.cssText = `position:absolute;border-radius:50%;width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px;background:rgba(255,255,255,.25);transform:scale(0);animation:ripple .6s linear;pointer-events:none;`;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      setTimeout(() => r.remove(), 700);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return <div className="cursor-glow" style={{ left: pos.x, top: pos.y }}></div>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const InitialLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const sessionLoaded = sessionStorage.getItem('nf_initial_loaded');
    if (sessionLoaded) {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  const handleComplete = () => {
    setIsLoading(false);
    setHasLoaded(true);
    sessionStorage.setItem('nf_initial_loaded', 'true');
  };

  if (!hasLoaded && isLoading) {
    return <NFLoadingScreen onComplete={handleComplete} />;
  }
  return null;
};


const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <InitialLoading />
              <ScrollToTop />
              <ChatAssistant />
              <CursorGlow />
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

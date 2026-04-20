import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import logoImg from '../../assets/nf plantation logo.jpg';

const NFHeader = () => {
  const [mobOpen, setMobOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll(); // Initialize on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [lang, setLang] = useState(localStorage.getItem('nf_lang') || 'en');

  useEffect(() => {
    // Add Google Translate Script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,ta,si', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
        
        // Let the cookie handle the translation automatically
      };
    }
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);

  // Re-trigger translation when navigating between pages by reloading if translated
  useEffect(() => {
    if (prevPath !== location.pathname) {
      if (lang !== 'en') {
        window.location.reload();
      } else {
        setPrevPath(location.pathname);
      }
    }
  }, [location.pathname, prevPath, lang]);

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (e) => {
    const langCode = e.target.value;
    handleLangClick(langCode);
  };

  // --- Translation Persistence Logic ---
  useEffect(() => {
    // Only trigger if we are in a non-English state
    const currentLang = localStorage.getItem('nf_lang');
    if (currentLang && currentLang !== 'en') {
      const lastPath = sessionStorage.getItem('nf_last_path');
      if (lastPath && lastPath !== location.pathname) {
        // We navigated to a new route. Force reload to apply translation to new content.
        sessionStorage.setItem('nf_last_path', location.pathname);
        window.location.reload();
      }
    }
    sessionStorage.setItem('nf_last_path', location.pathname);
  }, [location.pathname]);

  const handleLangClick = (langCode) => {
    localStorage.setItem('nf_lang', langCode);
    
    if (langCode === 'en') {
      document.cookie = 'googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/;`;
    }
    
    // Set the actual HTML lang attribute
    document.documentElement.lang = langCode;
    
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <div id="google_translate_element"></div>
      <nav id="mainNav" className={scrolled ? 'scrolled' : ''}>
        <Link to="/company/nf-plantation/home" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1, textDecoration: 'none' }}>
          <img src={logoImg} className="nav-logo" alt="NF Logo" style={{objectFit: 'cover', background: 'none', flexShrink: 0, borderRadius: '6px'}} />
          <div className="notranslate" translate="no" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div className="nav-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1' }}>NF Plantation</div>
            <div className="nav-sub">Investment Solutions</div>
          </div>
        </Link>
        <ul className="nav-links">
          <li><Link to="/company/nf-plantation/home" className={isActive('/company/nf-plantation/home')}>Home</Link></li>
          <li><Link to="/company/nf-plantation/about" className={isActive('/company/nf-plantation/about')}>About Us</Link></li>
          <li><Link to="/company/nf-plantation/events" className={isActive('/company/nf-plantation/events')}>Events</Link></li>
          <li><Link to="/company/nf-plantation/services" className={isActive('/company/nf-plantation/services')}>Services</Link></li>
          <li><Link to="/company/nf-plantation/investment-plans" className={isActive('/company/nf-plantation/investment-plans')}>Investment Plans</Link></li>
          <li><Link to="/company/nf-plantation/contact" className={isActive('/company/nf-plantation/contact')}>Contact</Link></li>
        </ul>
        <div className="nav-btns">
          <div className="lang-switcher-container" ref={langMenuRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--mint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '50px',
                transition: 'all 0.2s'
              }}
              title="Change Language"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Globe size={16} />
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lang}</span>
            </button>
            
            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                background: 'var(--dark3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '130px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 1000
              }}>
                <button 
                  onClick={() => handleLangClick('en')}
                  style={{ background: 'none', border: 'none', color: lang === 'en' ? 'var(--mint)' : 'rgba(255,255,255,0.8)', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontWeight: lang === 'en' ? '700' : '500', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >English</button>
                <button 
                  onClick={() => handleLangClick('ta')}
                  style={{ background: 'none', border: 'none', color: lang === 'ta' ? 'var(--mint)' : 'rgba(255,255,255,0.8)', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontWeight: lang === 'ta' ? '700' : '500', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >தமிழ்</button>
                <button 
                  onClick={() => handleLangClick('si')}
                  style={{ background: 'none', border: 'none', color: lang === 'si' ? 'var(--mint)' : 'rgba(255,255,255,0.8)', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontWeight: lang === 'si' ? '700' : '500', fontSize: '14px' }}
                >සිංහල</button>
              </div>
            )}
          </div>
          <Link to="/company/nf-plantation/login" className="btn-nav-login" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/company/nf-plantation/register" className="btn-nav-cta" style={{ textDecoration: 'none' }}><span className="cta-get">Get </span>Started →</Link>
        </div>
        <div className={`hamburger ${mobOpen ? 'active' : ''}`} onClick={() => setMobOpen(!mobOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>
      <div className={`mob-nav ${mobOpen ? 'open' : ''}`} id="mobNav">
        <Link to="/company/nf-plantation/home" onClick={() => setMobOpen(false)}>Home</Link>
        <Link to="/company/nf-plantation/about" onClick={() => setMobOpen(false)}>About Us</Link>
        <Link to="/company/nf-plantation/events" onClick={() => setMobOpen(false)}>Events</Link>
        <Link to="/company/nf-plantation/services" onClick={() => setMobOpen(false)}>Services</Link>
        <Link to="/company/nf-plantation/investment-plans" onClick={() => setMobOpen(false)}>Investment Plans</Link>
        <Link to="/company/nf-plantation/contact" onClick={() => setMobOpen(false)}>Contact</Link>
        <div className="mob-nav-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', padding: '10px 0' }}>
            <button 
              onClick={() => handleLangClick('en')}
              style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', background: lang === 'en' ? 'rgba(37,168,94,0.2)' : 'rgba(255,255,255,0.03)', border: lang === 'en' ? '1px solid var(--mint)' : '1px solid rgba(255,255,255,0.1)', color: lang === 'en' ? 'var(--white)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', transition: 'all 0.3s' }}
            >English</button>
            <button 
              onClick={() => handleLangClick('ta')}
              style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', background: lang === 'ta' ? 'rgba(37,168,94,0.2)' : 'rgba(255,255,255,0.03)', border: lang === 'ta' ? '1px solid var(--mint)' : '1px solid rgba(255,255,255,0.1)', color: lang === 'ta' ? 'var(--white)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', transition: 'all 0.3s' }}
            >தமிழ்</button>
            <button 
              onClick={() => handleLangClick('si')}
              style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', background: lang === 'si' ? 'rgba(37,168,94,0.2)' : 'rgba(255,255,255,0.03)', border: lang === 'si' ? '1px solid var(--mint)' : '1px solid rgba(255,255,255,0.1)', color: lang === 'si' ? 'var(--white)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', transition: 'all 0.3s' }}
            >සිංහල</button>
          </div>
          <Link to="/company/nf-plantation/login" onClick={() => setMobOpen(false)} style={{ 
            textAlign: 'center', 
            padding: '12px', 
            borderRadius: '10px', 
            background: 'rgba(37,168,94,0.1)', 
            border: '1px solid var(--mint)', 
            color: 'var(--mint)',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>Login to Dashboard</Link>
          <Link to="/company/nf-plantation/register" onClick={() => setMobOpen(false)} style={{ 
            textAlign: 'center', 
            padding: '12px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--emerald), var(--green3))', 
            border: 'none', 
            color: 'var(--white)',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 4px 15px rgba(37, 168, 94, 0.3)'
          }}>Get Started →</Link>
        </div>
      </div>
    </>
  );
};

export default NFHeader;

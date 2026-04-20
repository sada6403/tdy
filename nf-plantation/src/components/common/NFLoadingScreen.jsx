import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicService } from '../../services/api';

const NFLoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to servers…');
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const particlesRef = useRef([]);

  const AD_TEXTS = [
    'Leading the way in Sustainable Agriculture',
    'Invest in Green, Grow your Wealth',
    'Certified Organic Plantation Management',
    'Secured Monthly Returns on Investment',
    'Transparent Asset Growth Tracking',
    'Trusted by 5000+ Active Investors',
    'Global Standards in Agri-Tech',
    'Empowering Rural Communities',
    'Welcome to the Future of Plantation',
  ];

  const [adTexts, setAdTexts] = useState(AD_TEXTS);

  useEffect(() => {
    // Fetch dynamic ads from API
    const fetchAds = async () => {
        try {
            const response = await PublicService.getHeroSlides();
            if (response.success && response.data) {
                // Collect all advertisements from all slides
                const dynamicAds = response.data.flatMap(slide => slide.advertisements || []);
                if (dynamicAds.length > 0) {
                    setAdTexts(dynamicAds);
                }
            }
        } catch (error) {
            console.error('Error fetching dynamic ads:', error);
        }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    // Progress logic
    let currentProgress = 0;
    let speed = 0.6;
    
    const tick = () => {
      if (currentProgress >= 100) {
        setProgress(100);
        setStatusText('Welcome to NF Plantation ✓');
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
        }, 900);
        return;
      }

      if (currentProgress < 20) speed = 0.55;
      else if (currentProgress < 50) speed = 1.1;
      else if (currentProgress < 80) speed = 0.85;
      else if (currentProgress < 92) speed = 0.45;
      else speed = 0.22;

      if (Math.random() < 0.04) speed *= 0.1;

      currentProgress = Math.min(currentProgress + speed, 100);
      setProgress(Math.round(currentProgress));

      const idx = Math.floor(currentProgress / (100 / adTexts.length));
      if (idx < adTexts.length) {
        setStatusText(adTexts[idx]);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    setTimeout(tick, 600);
    return () => cancelAnimationFrame(requestRef.current);
  }, [onComplete]);

  useEffect(() => {
    // Canvas logic
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['rgba(45,206,110,', 'rgba(201,151,58,', 'rgba(77,184,240,', 'rgba(176,108,240,'];

    const spawnParticle = () => {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.15 + Math.random() * 0.35;
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 1 + Math.random() * 2.5;
      const life = 180 + Math.random() * 220;
      const cx = W * 0.5 + (Math.random() - 0.5) * 120;
      const cy = H * 0.45 + (Math.random() - 0.5) * 120;
      particlesRef.current.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, col, size, life, age: 0 });
    };

    let frameCount = 0;
    const loop = () => {
      frameCount++;
      if (frameCount % 3 === 0) spawnParticle();

      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      bg.addColorStop(0, 'rgba(10,46,24,0.95)');
      bg.addColorStop(0.5, 'rgba(4,18,9,0.97)');
      bg.addColorStop(1, 'rgba(2,11,5,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      [[W * 0.5, H * 0.4, 'rgba(18,80,40,', 250], [W * 0.5, H * 0.4, 'rgba(45,206,110,', 90]].forEach(([x, y, c, r]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c + '0.18)');
        g.addColorStop(1, c + '0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx; p.y += p.vy; p.age++;
        const alpha = p.age < 40 ? p.age / 40 : p.age > p.life - 40 ? (p.life - p.age) / 40 : 1;
        if (p.age >= p.life) { particlesRef.current.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.col + (alpha * 0.7) + ')';
        ctx.fill();
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div id="loader" className={isDone ? 'done' : ''} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#020b05',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      transition: 'opacity 0.8s ease, visibility 0.8s ease',
      visibility: isDone ? 'hidden' : 'visible',
      opacity: isDone ? 0 : 1
    }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(45,206,110,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,206,110,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0, pointerEvents: 'none' }} />

      <div className="corner corner-tl" style={{ position: 'fixed', top: '2rem', left: '2rem', width: '60px', height: '60px', borderTop: '1.5px solid #2dce6e', borderLeft: '1.5px solid #2dce6e', opacity: 0.4 }} />
      <div className="corner corner-tr" style={{ position: 'fixed', top: '2rem', right: '2rem', width: '60px', height: '60px', borderTop: '1.5px solid #c9973a', borderRight: '1.5px solid #c9973a', opacity: 0.4 }} />
      <div className="corner corner-bl" style={{ position: 'fixed', bottom: '2rem', left: '2rem', width: '60px', height: '60px', borderBottom: '1.5px solid #2dce6e', borderLeft: '1.5px solid #2dce6e', opacity: 0.4 }} />
      <div className="corner corner-br" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderBottom: '1.5px solid #c9973a', borderRight: '1.5px solid #c9973a', opacity: 0.4 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
        <div className="scene" style={{ width: '200px', height: '200px', position: 'relative', transformStyle: 'preserve-3d', marginBottom: '3rem' }}>
          <div className="core"></div>
          <div className="hex-wrap">
            {[...Array(6)].map((_, i) => <div key={i} className="hex-line"></div>)}
          </div>
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          {[...Array(4)].map((_, i) => <div key={i} className="leaf"></div>)}
        </div>

        <div className="brand-wrap" style={{ textAlign: 'center' }}>
          <div className="brand-name notranslate" translate="no" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', fontWeight: 700 }}>NF Plantation</div>
          <div className="brand-sub" style={{ fontSize: '0.72rem', opacity: 0.4, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Investment Solutions</div>
        </div>

        <div className="loader-wrap" style={{ width: 'min(400px, 88vw)', marginTop: '2.5rem' }}>
          <div className="loader-head" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <span className="loader-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2dce6e', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}>
                {statusText?.split(/(NF Plantation)/i).map((part, i) => 
                  part.toLowerCase() === 'nf plantation' 
                    ? <span key={i} className="notranslate" translate="no">{part}</span> 
                    : part
                )}
            </span>
          </div>
          <div className="loader-track" style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
            <div className="loader-fill" style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1a6b3a, #2dce6e 60%, #f0c060)', transition: 'width 0.08s linear' }}></div>
          </div>
          <div className="status-text" style={{ marginTop: '1.2rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.1em' }}>
            System Sync in Progress...
          </div>
        </div>
      </div>

      <div className="reg-tag" style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.62rem', opacity: 0.2, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Reg. No. PV 00303425</div>
    </div>
  );
};

export default NFLoadingScreen;

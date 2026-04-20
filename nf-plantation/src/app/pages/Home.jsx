import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import certImg from '../../assets/gov chertificate.png';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';
import { PublicService } from '../../services/api';

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    PublicService.getHeroSlides().then(res => {
      if(res.success && res.data && res.data.length > 0) {
        setSlides(res.data);
      }
    }).catch(err => console.log('Failed to load slides', err));

    PublicService.getSettings().then(res => {
      if(res.success && res.data) {
        setSettings(res.data);
      }
    }).catch(err => console.log('Failed to load settings', err));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const slide = slides.length > 0 ? slides[currentSlideIndex] : null;

  const renderTitle = () => {
    if(!slide) return (
      <>
        Sri Lanka's Most <span className="notranslate" translate="no">&nbsp;</span>
        <em>Trusted Agricultural</em>
        <span className="notranslate" translate="no">&nbsp;</span> Investment Platform
      </>
    );
    // If we have a slide from database, we try to preserve the highlight
    if(!slide.titleHighlight || !slide.title.includes(slide.titleHighlight)) return slide.title;
    const parts = slide.title.split(slide.titleHighlight);
    return (
      <>
        {parts[0]}
        <span className="notranslate" translate="no">&nbsp;</span>
        <em>{slide.titleHighlight}</em>
        <span className="notranslate" translate="no">&nbsp;</span>
        {parts[1]}
      </>
    );
  };

  const getImageUrl = (path) => {
    if(!path) return '';
    if(path.startsWith('http') || path.startsWith('data:')) return path;
    
    if(path.startsWith('/uploads')) {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      return `${baseUrl}${path}`;
    }
    
    return path;
  };
  useEffect(() => {
    // Run animations on mount
    const doReveal = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
          el.classList.add('visible');
        }
      });
    };
    
    const animateStats = () => {
      document.querySelectorAll('.stat-num[data-count]:not([data-done])').forEach(el => {
        el.setAttribute('data-done', '1');
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur = 1400;
        const start = performance.now();
        
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.floor(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    };

    const handleScroll = () => {
      doReveal();
    };

    setTimeout(() => {
      doReveal();
      animateStats();
    }, 150);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <NFHeader />
      <div id="page-home" className="page active" style={{ display: 'block' }}>
        <section className="hero">
          <div className="hero-orb1"></div>
          <div className="hero-orb2"></div>
          <div className="hero-grid"></div>

          <div>
            <div className="hero-chip" style={{transition: 'all 0.5s'}}><div className="hero-chip-dot"></div>{slide && slide.badgeText ? slide.badgeText : "Govt. Approved · PV 00303425"}</div>
            <h1 className="hero-title" style={{transition: 'all 0.5s'}}>
              {renderTitle()}
            </h1>
            <p className="hero-desc" style={{transition: 'all 0.5s'}}>{slide && slide.subtitle ? slide.subtitle : <><span className="notranslate" translate="no">NF Plantation</span> delivers structured monthly returns of 3–4% backed by real plantation assets. Join 3,000+ investors growing their wealth with confidence since 2020.</>}</p>
            <div className="hero-btns">
              <Link to={slide && slide.primaryButtonLink ? slide.primaryButtonLink : "/company/nf-plantation/register"} className="btn-gold">{slide && slide.primaryButtonText ? slide.primaryButtonText : "Start Investing →"}</Link>
              <Link to={slide && slide.secondaryButtonLink ? slide.secondaryButtonLink : "/company/nf-plantation/about"} className="btn-ghost-white">{slide && slide.secondaryButtonText ? slide.secondaryButtonText : "Learn More"}</Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item"><div className="trust-ico">🛡️</div>{slide && slide.trustLabel ? slide.trustLabel : "Asset-Backed Security"}</div>
              <div className="trust-item"><div className="trust-ico">📋</div>{slide && slide.supportStripText ? slide.supportStripText.substring(0, 20) + "..." : "Govt. Registered"}</div>
              <div className="trust-item"><div className="trust-ico">💸</div>Monthly Payouts</div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-float1">
              <div className="float-val">4%</div>
              <div className="float-lbl">Max Monthly ROI</div>
            </div>
            <div className="hero-main-card" style={{ position: 'relative', overflow: 'hidden' }}>
              {slide && slide.backgroundImage && (
                <img 
                  src={getImageUrl(slide.backgroundImage)} 
                  alt="Dashboard Background" 
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    zIndex: 0,
                    transition: 'all 1s ease-in-out',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }} 
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="hmc-header">
                <div className="hmc-title">Investment Dashboard</div>
                <div className="hmc-badge"><div className="hmc-live"></div>Live Returns</div>
              </div>
              <div className="hmc-big"><span className="pct">{slide?.statReturns || "3–4%"}</span></div>
              <div className="hmc-sub">Monthly returns · 36-month tenure</div>
              <div className="hmc-bars">
                <div className="hmc-bar" style={{'--h': '35%'}}></div>
                <div className="hmc-bar" style={{'--h': '55%'}}></div>
                <div className="hmc-bar" style={{'--h': '45%'}}></div>
                <div className="hmc-bar" style={{'--h': '70%'}}></div>
                <div className="hmc-bar" style={{'--h': '60%'}}></div>
                <div className="hmc-bar" style={{'--h': '80%'}}></div>
                <div className="hmc-bar" style={{'--h': '75%'}}></div>
                <div className="hmc-bar" style={{'--h': '90%'}}></div>
              </div>
              <div className="hmc-grid">
                <div className="hmc-stat">
                  <div className="hmc-stat-val stat-num" data-count={slide?.statInvestors?.replace(/\D/g, '') || "3000"} data-suffix={slide?.statInvestors?.includes('+') ? '+' : ''}>0+</div>
                  <div className="hmc-stat-lbl">Investors</div>
                </div>
                <div className="hmc-stat">
                  <div className="hmc-stat-val" style={{color: 'var(--gold2)'}}>{slide?.statSuccessRate || "100%"}</div>
                  <div className="hmc-stat-lbl">Success Rate</div>
                </div>
              </div>
              </div>
            </div>
            <div className="hero-float2">
              <div className="float-val">{slide?.statTotalInvested || "2Cr+"}</div>
              <div className="float-lbl">Total Invested LKR</div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker">
          <div className="ticker-track">
            <span className="ticker-item t1"><span className="ticker-sep"></span>Government Registered · PV 00303425</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Up to 4% Monthly Returns</span>
            <span className="ticker-item t3"><span className="ticker-sep"></span>Nationwide Branch Network</span>
            <span className="ticker-item t1"><span className="ticker-sep"></span>3,000+ Happy Investors</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Asset-Backed Physical Security</span>
            <span className="ticker-item t3"><span className="ticker-sep"></span>Field Officer Guided Support</span>
            <span className="ticker-item t1"><span className="ticker-sep"></span>100% Success Rate Since 2020</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Northern Province · Kilinochchi</span>
            <span className="ticker-item t1"><span className="ticker-sep"></span>Government Registered · PV 00303425</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Up to 4% Monthly Returns</span>
            <span className="ticker-item t3"><span className="ticker-sep"></span>Nationwide Branch Network</span>
            <span className="ticker-item t1"><span className="ticker-sep"></span>3,000+ Happy Investors</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Asset-Backed Physical Security</span>
            <span className="ticker-item t3"><span className="ticker-sep"></span>Field Officer Guided Support</span>
            <span className="ticker-item t1"><span className="ticker-sep"></span>100% Success Rate Since 2020</span>
            <span className="ticker-item t2"><span className="ticker-sep"></span>Northern Province · Kilinochchi</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-sec">
          <div className="stats-grid">
            <div className="stat-box reveal"><span className="stat-num" data-count="3000" data-suffix="+">0+</span><div className="stat-label">Happy Investors</div></div>
            <div className="stat-box reveal d1"><span className="stat-num" data-count="2" data-suffix="Cr+">0</span><div className="stat-label">Total Investment (LKR)</div></div>
            <div className="stat-box reveal d2"><span className="stat-num" data-count="4" data-suffix="%" data-prefix="3–">3–4%</span><div className="stat-label">Monthly Returns</div></div>
            <div className="stat-box reveal d3"><span className="stat-num" data-count="100" data-suffix="%">0%</span><div className="stat-label">Success Rate</div></div>
          </div>
        </div>

        {/* WHY NF PLANTATION */}
        <section className="sec why-sec">
          <div className="inner why-grid">
            <div className="why-img-wrap reveal from-left">
              <img className="why-img" src={certImg} alt="Government Certificate" style={{objectFit: 'cover'}} />
              <div className="why-img-overlay"></div>
              <div className="why-cert">
                <div className="why-cert-top"><span className="why-cert-ico">🏛️</span><span className="why-cert-title">Registered Institution</span></div>
                <div className="why-cert-num">PV 00303425</div>
                <div className="why-cert-sub">Licensed by Government of Sri Lanka</div>
              </div>
              <div className="why-float"><div className="why-float-val">2020</div><div className="why-float-lbl">Established</div></div>
            </div>
            <div className="reveal from-right">
              <div className="sec-chip">Our Advantage</div>
              <h2 className="sec-title" style={{marginBottom: '.75rem'}}>Why is <span className="g notranslate" translate="no">NF Plantation</span> your best choice?</h2>
              <div className="divider"></div>
              <p className="sec-body" style={{marginBottom: '2rem'}}>We don't just grow crops — we grow your wealth. Unlike basic agricultural companies, we combine government-backed legitimacy, digital transparency, and field officer support into one premium investment experience.</p>
              <div className="why-points">
                <div className="why-point"><div className="why-point-ico">🛡️</div><div><div className="why-point-title">Government Registered & Verified</div><div className="why-point-desc">Officially incorporated with Reg. No. PV 00303425 — every rupee is legally protected.</div></div></div>
                <div className="why-point"><div className="why-point-ico">📈</div><div><div className="why-point-title">Higher Returns Than Banks</div><div className="why-point-desc">3–4% monthly vs bank FD's 0.5–0.8% monthly — your money works harder here.</div></div></div>
                <div className="why-point"><div className="why-point-ico">💻</div><div><div className="why-point-title">Full Digital Transparency</div><div className="why-point-desc">Real-time dashboard, monthly statements, and 24/7 portfolio tracking via our app.</div></div></div>
                <div className="why-point"><div className="why-point-ico">🤝</div><div><div className="why-point-title">Dedicated Field Officer Support</div><div className="why-point-desc">Personal field officers across all districts — from enrollment to maturity settlement.</div></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sec how-sec">
          <div className="inner">
            <div style={{textAlign: 'center', marginBottom: '1rem'}} className="reveal">
              <div className="sec-chip" style={{margin: '0 auto 1rem'}}>The Process</div>
              <h2 className="sec-title">How It Works in <span className="gold">4 Simple Steps</span></h2>
            </div>
            <div className="how-steps">
              <div className="how-connector"></div>
              <div className="how-step reveal"><div className="how-num">01</div><div className="how-step-lbl">Step One</div><div className="how-step-title">Select & Deposit</div><div className="how-step-desc">Choose your investment amount and tenure. Deposit via branch or digital wallet — minimum LKR 1,00,000.</div></div>
              <div className="how-step reveal d1"><div className="how-num">02</div><div className="how-step-lbl">Step Two</div><div className="how-step-title">Asset Deployment</div><div className="how-step-desc">Your capital is directly linked to physical plantation assets — aloe vera, coconut, textiles — all audited.</div></div>
              <div className="how-step reveal d2"><div className="how-num">03</div><div className="how-step-lbl">Step Three</div><div className="how-step-title">Earn Monthly</div><div className="how-step-desc">Receive structured monthly returns on the 1st of every month — directly to your linked bank account.</div></div>
              <div className="how-step reveal d3"><div className="how-num">04</div><div className="how-step-lbl">Step Four</div><div className="how-step-title">Maturity Payout</div><div className="how-step-desc">At end of tenure, your full principal is returned plus final settlement — branch-assisted for your convenience.</div></div>
            </div>
          </div>
        </section>

        {/* PROJECTS SHOWCASE */}
        <section className="sec projects-sec">
          <div className="inner">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem'}} className="reveal">
              <div><div className="sec-chip">Our Ventures</div><h2 className="sec-title">Where Your <span className="g">Money Grows</span></h2></div>
              <Link to="/company/nf-plantation/services" className="btn-ghost-white" style={{fontSize: '.8rem'}}>View All Projects →</Link>
            </div>
            <div className="proj-grid reveal">
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&fit=crop" alt="Aloe Vera" onError={(e) => { e.target.style.background = 'var(--green)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Phase 2 Open</div>
                  <div className="proj-name">Aloe Vera Ecosystem</div>
                  <div className="proj-desc">Our flagship 500-acre plantation in Kilinochchi — largest aloe vera investment in the Northern Province.</div>
                  <div className="proj-tags"><span className="proj-tag">Scalable Growth</span><span className="proj-tag">Physically Backed</span><span className="proj-tag">Phase 2</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80&fit=crop" alt="Textile" onError={(e) => { e.target.style.background = 'var(--green2)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Garment & Textile</div>
                  <div className="proj-name">Eco Manufacturing</div>
                  <div className="proj-desc">Ethical apparel production with sustainable materials for global markets.</div>
                  <div className="proj-tags"><span className="proj-tag">Eco-Friendly</span><span className="proj-tag">Export Ready</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80&fit=crop" alt="Coconut" onError={(e) => { e.target.style.background = 'var(--green3)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Coconut Products</div>
                  <div className="proj-name">Virgin Coconut Oil</div>
                  <div className="proj-desc">Premium export-quality coconut oil for local and international buyers.</div>
                  <div className="proj-tags"><span className="proj-tag">Export Quality</span><span className="proj-tag">High Demand</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80&fit=crop" alt="Farming" onError={(e) => { e.target.style.background = 'var(--emerald)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Organic Farming</div>
                  <div className="proj-name">Sustainable Agriculture</div>
                  <div className="proj-desc">Diverse crop rotation and organic fertilizer programs.</div>
                  <div className="proj-tags"><span className="proj-tag">Organic</span><span className="proj-tag">Sustainable</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sec testi-sec">
          <div className="inner">
            <div style={{textAlign: 'center'}} className="reveal">
              <div className="sec-chip" style={{margin: '0 auto 1rem'}}>Investor Stories</div>
              <h2 className="sec-title">What Our <span className="gold">Investors Say</span></h2>
            </div>
            <div className="testi-marquee">
              <div className="testi-track">
                <div className="testi-grid">
                  <div className="testi-card reveal">
                    <div className="testi-stars">⭐⭐⭐⭐⭐</div>
                    <div className="testi-text">"I invested LKR 5 lakhs in 2022 and have been receiving my monthly returns without fail every single month. The field officer visits regularly and the dashboard shows everything in real time. Truly the best investment I've made."</div>
                    <div className="testi-quote">"</div>
                    <div className="testi-author"><div className="testi-avatar">SK</div><div><div className="testi-name">Suresh Kumar</div><div className="testi-loc">Jaffna, Northern Province</div></div></div>
                  </div>
                  <div className="testi-card reveal d1">
                    <div className="testi-stars">⭐⭐⭐⭐⭐</div>
                    <div className="testi-text">"As a retired government employee, I was looking for safe options beyond bank FDs. <span className="notranslate" translate="no">NF Plantation</span> gives me 4× higher monthly income than my bank. The registration and transparency gave me full confidence."</div>
                    <div className="testi-quote">"</div>
                    <div className="testi-author"><div className="testi-avatar">RP</div><div><div className="testi-name">Ranjini Pillai</div><div className="testi-loc">Kilinochchi</div></div></div>
                  </div>
                  <div className="testi-card reveal d2">
                    <div className="testi-stars">⭐⭐⭐⭐⭐</div>
                    <div className="testi-text">"I referred 8 of my friends and all of them are happy investors now. The team is professional, the process is transparent, and the returns are consistent. This is the future of investment in Sri Lanka."</div>
                    <div className="testi-quote">"</div>
                    <div className="testi-author"><div className="testi-avatar">AM</div><div><div className="testi-name">Arjun Murugesan</div><div className="testi-loc">Colombo</div></div></div>
                  </div>
                  {/* Duplicate for seamless loop on mobile */}
                  <div className="testi-card mob-only">
                    <div className="testi-stars">⭐⭐⭐⭐⭐</div>
                    <div className="testi-text">"I invested LKR 5 lakhs in 2022 and have been receiving my monthly returns without fail every single month."</div>
                    <div className="testi-quote">"</div>
                    <div className="testi-author"><div className="testi-avatar">SK</div><div><div className="testi-name">Suresh Kumar</div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE APP PROMO */}
        <section className="sec" style={{ background: 'var(--dark)', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div className="inner app-promo-grid" style={{ alignItems: 'center' }}>
            <div className="reveal from-left">
              <div className="sec-chip">Native App Experience</div>
              <h2 className="sec-title" style={{ marginBottom: '1.5rem' }}>Your Investment, <br /><span className="grad-text">In Your Pocket.</span></h2>
              <p className="sec-body" style={{ marginBottom: '2.5rem', maxWidth: '480px' }}>Take full control of your plantation portfolio on the go. Experience seamless tracking, instant profit notifications, and military-grade security with our mobile application.</p>
              
              <div className="app-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                  { ico: '🔔', t: 'Real-time Alerts', d: 'Get notified instantly when profit is credited.' },
                  { ico: '🔐', t: 'Secure Access', d: 'Biometric login and multi-factor authentication.' },
                  { ico: '📊', t: 'Live Tracking', d: 'Monitor your plantation growth in real-time.' },
                  { ico: '💳', t: 'Easy Wallet', d: 'Withdraw and reinvest with just a few taps.' },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{f.ico}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--white)' }}>{f.t}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray)', lineHeight: '1.5' }}>{f.d}</p>
                  </div>
                ))}
              </div>

              <div className="app-download-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href={settings?.mobileLinks?.appStore || "https://apps.apple.com/app/nf-plantation/id1234567890"} target="_blank" rel="noopener noreferrer" className="btn-ghost-white" style={{ padding: '0.6rem 1.4rem', background: '#000', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_logo_black.svg" alt="Apple" style={{ width: '20px', height: '20px', filter: 'invert(1)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', lineHeight: '1' }}>Download on the</p>
                      <p style={{ fontSize: '1rem', fontWeight: '700', lineHeight: '1.1' }}>App Store</p>
                    </div>
                  </div>
                </a>
                <a href={settings?.mobileLinks?.googlePlay || "https://play.google.com/store/apps/details?id=com.nfplantation.app"} target="_blank" rel="noopener noreferrer" className="btn-ghost-white" style={{ padding: '0.6rem 1.4rem', background: '#000', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="https://www.gstatic.com/images/branding/product/2x/play_prism_64dp.png" alt="Play Store" style={{ width: '22px', height: '22px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', lineHeight: '1' }}>Get it on</p>
                      <p style={{ fontSize: '1rem', fontWeight: '700', lineHeight: '1.1' }}>Google Play</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="reveal from-right app-phone-preview" style={{ position: 'relative' }}>
              <div style={{ width: '280px', height: '580px', background: '#0a0a0a', borderRadius: '45px', margin: '0 auto', border: '8px solid #1a1a1a', position: 'relative', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(37,168,94,0.3)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#1a1a1a', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px', zIndex: '10' }} />
                <div style={{ padding: '40px 20px', height: '100%', background: 'linear-gradient(180deg, #0d3320 0%, #060f0a 100%)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--emerald), var(--gold))' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>Portfolio Value</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--white)', marginBottom: '25px' }}>Rs. 1,250,000</div>
                  <div style={{ background: 'rgba(37,168,94,0.1)', borderRadius: '15px', padding: '15px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--mint)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Live Growth</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
                      {[20, 40, 30, 60, 45, 80, 70].map((h, i) => (
                        <div key={i} style={{ flex: '1', background: 'var(--emerald)', height: `${h}%`, borderRadius: '2px' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--white)', marginBottom: '15px' }}>Recent Payouts</div>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--white)' }}>Profit Credited</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>Oct 01, 2026</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--mint)' }}>+Rs. 42,916</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', top: '20%', left: '-20px', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--green2))', animation: 'floatY 4s infinite' }} />
              <div style={{ position: 'absolute', bottom: '15%', right: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold2))', animation: 'floatY 5s infinite 1s' }} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta-strip">
          <h2>Ready to Grow Your <span className="grad-text">Wealth Sustainably?</span></h2>
          <p>Join Sri Lanka's most trusted plantation investment platform. Start with as little as LKR 1,00,000 and earn up to 4% monthly returns.</p>
          <div className="cta-strip-btns">
            <Link to="/company/nf-plantation/investment-plans" className="btn-gold">Calculate My Returns →</Link>
            <Link to="/company/nf-plantation/contact" className="btn-ghost-white">Talk to an Expert</Link>
          </div>
        </div>

      </div>
      <NFFooter />
    </>
  );
};

export default Home;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';

const Services = () => {
  useEffect(() => {
    const doReveal = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
          el.classList.add('visible');
        }
      });
    };

    const handleScroll = () => doReveal();
    setTimeout(doReveal, 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <NFHeader />
      <div id="page-services" className="page active" style={{ display: 'block' }}>
        <div className="contact-hero-bar">
          <div className="sec-chip" style={{ margin: '0 auto 1.25rem' }}>What We Do</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.1 }}>Our Services & <span className="grad-text">Core Pillars</span></h1>
          <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>Four core pillars driving every investment decision — from sustainable farming to digital management.</p>
        </div>

        <section className="sec services-sec">
          <div className="inner">
            <div className="services-grid">
              <div className="svc-card reveal">
                <div className="svc-ico">🌿</div>
                <div className="svc-title">Encourage Farming</div>
                <div className="svc-desc">Encouraging aloe vera, coconut, and diverse agricultural cultivation to promote sustainable livelihoods across Sri Lanka's Northern Province.</div>
                <ul className="svc-list"><li>Aloe Vera Farming</li><li>Coconut Cultivation</li><li>Organic Produce</li><li>Sustainable Agriculture</li></ul>
              </div>
              <div className="svc-card reveal d1">
                <div className="svc-ico">✨</div>
                <div className="svc-title">Enhanced Lifestyle</div>
                <div className="svc-desc">Helping investors and communities move toward financial independence by producing essential products for personal use and community growth.</div>
                <ul className="svc-list"><li>Self-Production Model</li><li>Lifestyle Enhancement</li><li>Community Growth</li><li>Next Step in Life</li></ul>
              </div>
              <div className="svc-card reveal d2">
                <div className="svc-ico">📈</div>
                <div className="svc-title">Motivated Savings</div>
                <div className="svc-desc">Motivating structured saving and investment habits for the new generation with guaranteed monthly returns and long-term wealth creation.</div>
                <ul className="svc-list"><li>Future Planning</li><li>Monthly Returns</li><li>Financial Growth</li><li>Smart Savings</li></ul>
              </div>
              <div className="svc-card reveal d3">
                <div className="svc-ico">💻</div>
                <div className="svc-title">Digital Support</div>
                <div className="svc-desc">Next-generation digital infrastructure to manage secure online investment accounts with full real-time transparency and portfolio control.</div>
                <ul className="svc-list"><li>Live Dashboard</li><li>Mobile App (iOS & Android)</li><li>Transaction History</li><li>Digital Wallet</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sec projects-sec">
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Active Projects</div>
              <h2 className="sec-title">Our <span className="g">Flagship Ventures</span></h2>
            </div>
            <div className="proj-grid reveal">
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&fit=crop" alt="Aloe Vera" onError={(e) => { e.target.style.background = 'var(--green)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Primary — Phase 2</div>
                  <div className="proj-name">Aloe Vera Ecosystem</div>
                  <div className="proj-desc">Flagship 500-acre plantation in Kilinochchi now open for phase 2 investors. Fastest-growing agricultural sector in the North.</div>
                  <div className="proj-tags"><span className="proj-tag">Scalable</span><span className="proj-tag">Asset-Backed</span><span className="proj-tag">Phase 2</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80&fit=crop" alt="Textile" onError={(e) => { e.target.style.background = 'var(--green2)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Garment & Textile</div>
                  <div className="proj-name">Eco Manufacturing</div>
                  <div className="proj-desc">Ethical apparel with sustainable materials. Export-ready production for global markets.</div>
                  <div className="proj-tags"><span className="proj-tag">Eco-Friendly</span><span className="proj-tag">Global Export</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80&fit=crop" alt="Coconut" onError={(e) => { e.target.style.background = 'var(--green3)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Coconut Products</div>
                  <div className="proj-name">Virgin Coconut Oil</div>
                  <div className="proj-desc">Premium export-quality coconut oil produced with sustainable harvesting for local and international markets.</div>
                  <div className="proj-tags"><span className="proj-tag">Export Quality</span><span className="proj-tag">High Demand</span></div>
                </div>
              </div>
              <div className="proj-c">
                <img className="proj-img" src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80&fit=crop" alt="Farming" onError={(e) => { e.target.style.background = 'var(--emerald)'; }} />
                <div className="proj-ov">
                  <div className="proj-badge">Organic Farming</div>
                  <div className="proj-name">Sustainable Agriculture</div>
                  <div className="proj-desc">Diverse crop rotation, organic fertilizer programs and soil health monitoring for long-term land value.</div>
                  <div className="proj-tags"><span className="proj-tag">Organic</span><span className="proj-tag">Sustainable</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <h2>Invest in <span className="grad-text">Real Assets</span> Today</h2>
          <p>Every project is physically backed by real agricultural land. Your investment has a foundation you can see and touch.</p>
          <div className="cta-strip-btns">
            <Link to="/company/nf-plantation/investment-plans" className="btn-gold">View Investment Plans →</Link>
            <Link to="/company/nf-plantation/contact" className="btn-ghost-white">Contact a Branch</Link>
          </div>
        </div>
      </div>
      <NFFooter />
    </>
  );
};

export default Services;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ceoImg from '../../assets/founter and ceo.jpg';
import certImg from '../../assets/gov chertificate.png';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';

const About = () => {
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
      <div id="page-about" className="page active" style={{ display: 'block' }}>
        <div className="contact-hero-bar">
          <div className="sec-chip" style={{ margin: '0 auto 1.25rem' }}>Our Identity</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.1, marginBottom: '1rem' }}>A Leading Financial <span className="grad-text">Investment Institution.</span></h1>
          <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}><span className="notranslate" translate="no">NF Plantation</span> is a multi-branch financial investment organization governed through Head Office, Regional Zones, and Local Branches — ensuring nationwide accessibility and institutional security.</p>
        </div>

        <section className="sec why-sec" style={{ overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div className="inner why-grid">
            <div className="why-img-wrap reveal from-left">
              <img className="why-img" src={ceoImg} alt="Founder" style={{objectFit: 'cover'}} />
              <div className="why-img-overlay"></div>
              <div className="why-cert">
                <div className="why-cert-top"><span className="why-cert-ico">👤</span><span className="why-cert-title">Mr. Kunatheepan</span></div>
                <div className="why-cert-num" style={{ fontSize: '.95rem' }}>Founder & CEO</div>
                <div className="why-cert-sub notranslate" translate="no">NF Plantation (Pvt) Ltd</div>
              </div>
              <div className="why-float"><div className="why-float-val">2020</div><div className="why-float-lbl">Founded</div></div>
            </div>
            <div className="reveal from-right" style={{ padding: '0 1rem', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
              <div className="sec-chip">Leadership Voice</div>
              <h2 className="sec-title leadership-title" style={{ fontFamily: "'DM Serif Display', serif", marginBottom: '.75rem', wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>"Empowering Lives Through <span className="g">Sustainable Self-Reliance</span>"</h2>
              <div className="divider"></div>
              <p className="sec-body" style={{ marginBottom: '1rem' }}>Our multi-branch operational model is designed to provide institutional security while maintaining local accessibility for every customer across Sri Lanka.</p>
              <p className="sec-body" style={{ marginBottom: '2rem' }}><span className="notranslate" translate="no">NF Plantation</span> operates through Head Office, Regional Management, and Branch-level administration. We collect structured deposits from thousands of individuals, providing them with predictable monthly returns and long-term financial security through physically backed agricultural assets.</p>
              <div className="stats-row-mobile" style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--mint)' }}>5,000+</div><div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Investors</div></div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.08)' }}></div>
                <div><div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold2)' }}>2020</div><div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Founded</div></div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.08)' }}></div>
                <div><div style={{ fontSize: '2rem', fontWeight: 900, color: '#4db8f0' }}>3+</div><div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Branch Cities</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" style={{ background: 'var(--dark2)' }}>
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Mission & Vision</div>
              <h2 className="sec-title">Built on <span className="gold">Purpose</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }} className="reveal">
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(37,168,94,.15)', borderTop: '3px solid var(--mint)', borderRadius: 18, overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80&fit=crop" alt="Mission" style={{ width: '100%', height: 200, objectFit: 'cover', opacity: .7, display: 'block' }} />
                <div style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--white)', marginBottom: '.75rem' }}>🎯 Our Mission</h3>
                  <p className="sec-body">To revolutionize cost of living by manufacturing essential products under our own community-funded brand. We eliminate middlemen to deliver maximum value to every household in Sri Lanka.</p>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(201,151,58,.15)', borderTop: '3px solid var(--gold2)', borderRadius: 18, overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=700&q=80&fit=crop" alt="Vision" style={{ width: '100%', height: 200, objectFit: 'cover', opacity: .7, display: 'block' }} />
                <div style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--white)', marginBottom: '.75rem' }}>🔭 Our Vision</h3>
                  <p className="sec-body">To create a self-sufficient economic ecosystem where collective investment fuels collective prosperity — setting a global standard for people-centric, ethical agricultural business models.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec timeline-sec">
          <div className="inner">
            <div style={{ textAlign: 'center' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Our Journey</div>
              <h2 className="sec-title">The <span className="notranslate" translate="no">NF Plantation</span> <span className="g">Timeline</span></h2>
            </div>
            <div className="timeline-wrap">
              <div className="timeline-line"></div>
              <div className="tl-item reveal">
                <div className="tl-left"><div className="tl-year">2020</div></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="tl-dot"></div></div>
                <div className="tl-right"><div className="tl-title">Company Founded</div><div className="tl-desc"><span className="notranslate" translate="no">NF Plantation</span> established with government registration in Kilinochchi, Northern Province.</div></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-left"><div className="tl-title">First 100 Acres</div><div className="tl-desc">100 acres of aloe vera plantation launched with initial investors and expert farming team.</div></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="tl-dot"></div></div>
                <div className="tl-right"><div className="tl-year">2021</div></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-left"><div className="tl-year">2022</div></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="tl-dot"></div></div>
                <div className="tl-right"><div className="tl-title">500+ Investors</div><div className="tl-desc">Reached 500 satisfied investors milestone with consistent monthly payout record.</div></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-left"><div className="tl-title">Digital Platform</div><div className="tl-desc">Launched 24/7 digital dashboard and mobile app for nationwide investor accessibility.</div></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="tl-dot"></div></div>
                <div className="tl-right"><div className="tl-year">2023</div></div>
              </div>
              <div className="tl-item reveal">
                <div className="tl-left"><div className="tl-year">2026</div></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div className="tl-dot"></div></div>
                <div className="tl-right"><div className="tl-title">5,000+ Milestone</div><div className="tl-desc">Surpassed 5,000 investors with expanded branch network and new project phases.</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec trust-sec" style={{ background: 'var(--dark)' }}>
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Certified & Verified</div>
              <h2 className="sec-title">Institutional <span className="gold">Guardrails</span></h2>
            </div>
            <div className="trust-grid">
              <div className="trust-badges reveal from-left">
                <div className="trust-badge"><div className="tb-ico">🏛️</div><div className="tb-title">Govt. Registration</div><div className="tb-desc">Legally incorporated under PV 00303425 with full regulatory compliance.</div></div>
                <div className="trust-badge"><div className="tb-ico">🛡️</div><div className="tb-title">Asset-Backed</div><div className="tb-desc">100% of principal secured by physical plantation land assets.</div></div>
                <div className="trust-badge"><div className="tb-ico">📊</div><div className="tb-title">Transparent Reporting</div><div className="tb-desc">Monthly statements and real-time dashboard for every investor.</div></div>
                <div className="trust-badge"><div className="tb-ico">🤝</div><div className="tb-title">Field Support</div><div className="tb-desc">Dedicated field officers in every district for personal service.</div></div>
              </div>
              <div className="trust-img reveal from-right">
                <img src={certImg} alt="Trust" style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                <div className="trust-img-ov"></div>
                <div className="trust-reg-card">
                  <div className="trc-top"><span style={{ fontSize: 18 }}>🥇</span><span className="trc-title">Government Proof</span></div>
                  <div className="trc-num">PV 00303425</div>
                  <div className="trc-sub">Licensed and regulated by the Government of Sri Lanka. Full transparency maintained with all investors and regulatory authorities.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <h2>Ready to Join Our <span className="grad-text">Journey?</span></h2>
          <p>Become part of Sri Lanka's most transparent and community-focused investment platform.</p>
          <div className="cta-strip-btns">
            <Link to="/company/nf-plantation/register" className="btn-gold">Apply Now →</Link>
            <Link to="/company/nf-plantation/contact" className="btn-ghost-white">Contact Us</Link>
          </div>
        </div>

      </div>
      <NFFooter />
    </>
  );
};

export default About;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';

const InvestmentPlans = () => {
  const [calcM, setCalcM] = useState(12);
  const [calcR, setCalcR] = useState(3);
  const [principal, setPrincipal] = useState(100000);

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

  const mo = Math.round(principal * calcR / 100);
  const pr = mo * calcM;
  const tot = principal + pr;

  return (
    <>
      <NFHeader />
      <div id="page-plans" className="page active" style={{ display: 'block' }}>
        <div className="contact-hero-bar">
          <div className="sec-chip sec-chip-gold" style={{ margin: '0 auto 1.25rem' }}>💰 Asset-Backed Security</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.1 }}>Grow Your Wealth<br/><span className="grad-text">Strategically.</span></h1>
          <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>Structured, high-yield investment deposits with predictable monthly returns, fully secured by physical plantation assets.</p>
        </div>

        <section className="sec calc-sec">
          <div className="inner">
            <div className="calc-wrap">
              <div className="calc-intro">
                <div className="sec-chip">Live Calculator</div>
                <h2 className="sec-title" style={{ marginBottom: '.75rem' }}>Calculate Your <span className="gold">Returns</span></h2>
                <div className="divider"></div>
                <p className="sec-body" style={{ marginBottom: '2rem' }}>Use our live yield simulator to see exactly what you'll earn each month and at maturity. No hidden fees, no surprises.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', flexShrink: 0 }}></div><span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Principal fully returned at maturity</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold2)', flexShrink: 0 }}></div><span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Monthly payouts on the 1st of each month</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4db8f0', flexShrink: 0 }}></div><span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Returns increase annually: 3% → 3.5% → 4%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#b06cf0', flexShrink: 0 }}></div><span style={{ fontSize: '.8rem', color: 'var(--gray)' }}>Minimum investment: LKR 1,00,000</span></div>
                </div>
              </div>
              <div>
                <div className="calc-card reveal">
                  <div className="calc-card-top">
                    <div className="calc-card-title">Yield Simulator</div>
                    <div className="calc-tabs">
                      <button className={`calc-tab ${calcM === 12 ? 'on' : ''}`} onClick={() => { setCalcM(12); setCalcR(3); }}>12M</button>
                      <button className={`calc-tab ${calcM === 24 ? 'on' : ''}`} onClick={() => { setCalcM(24); setCalcR(3.5); }}>24M</button>
                      <button className={`calc-tab ${calcM === 36 ? 'on' : ''}`} onClick={() => { setCalcM(36); setCalcR(4); }}>36M</button>
                    </div>
                  </div>
                  <div className="calc-label">Principal Deposit Amount</div>
                  <div className="calc-amount-disp"><span>Rs. </span><span id="calcDisp">{principal.toLocaleString('en-IN')}</span></div>
                  <input type="range" id="calcSlider" min="100000" max="5000000" step="50000" value={principal} onChange={(e) => setPrincipal(parseInt(e.target.value))} />
                  <div className="calc-marks"><span>100K</span><span>1M</span><span>2.5M</span><span>5M</span></div>
                  <div className="calc-result-box">
                    <div className="crb-row"><span className="crb-lbl">Contract Term</span><span className="crb-val" id="cTerm">{calcM} Months</span></div>
                    <div className="crb-row"><span className="crb-lbl">Monthly Yield Rate</span><span className="crb-val" style={{ color: 'var(--mint)' }} id="cRate">{calcR.toFixed(1)}% / Month</span></div>
                    <div className="crb-row"><span className="crb-lbl">Status</span><span style={{ background: 'rgba(37,168,94,.15)', border: '1px solid rgba(37,168,94,.3)', borderRadius: 50, padding: '3px 12px', fontSize: '.65rem', fontWeight: 700, color: 'var(--mint)' }}>✓ GUARANTEED</span></div>
                    <div className="crb-row"><span className="crb-lbl">Monthly Return</span><span className="crb-val main" id="cMonthly">Rs. {mo.toLocaleString('en-IN')}</span></div>
                    <div className="crb-row"><span className="crb-lbl">Total Profit Earned</span><span className="crb-val profit" id="cProfit">+Rs. {pr.toLocaleString('en-IN')}</span></div>
                    <div className="crb-row"><span className="crb-lbl">Maturity Repayment</span><span className="crb-val" style={{ color: 'var(--white)' }} id="cTotal">Rs. {tot.toLocaleString('en-IN')}</span></div>
                    <Link to="/company/nf-plantation/register" className="calc-cta-btn block text-center" style={{textDecoration: 'none'}}>🚀 Initialize This Investment</Link>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '4rem' }}>
              <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><div className="sec-chip">Full Breakdown</div><h2 className="sec-title" style={{ fontSize: '1.8rem' }}>Structured Plan <span className="gold">Comparison</span></h2></div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: 'var(--mint)', fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', display: 'inline-block' }}></span>Year 1 — 3%/mo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: '#4db8f0', fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4db8f0', display: 'inline-block' }}></span>Year 2 — 3.5%/mo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: 'var(--gold2)', fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold2)', display: 'inline-block' }}></span>Year 3 — 4%/mo</div>
                </div>
              </div>
              <div className="plans-wrap reveal">
                <table>
                  <thead><tr><th>Investment</th><th>Year 1 (3%/mo)</th><th>Year 2 (3.5%/mo)</th><th>Year 3 (4%/mo)</th><th>Total Earned</th></tr></thead>
                  <tbody>
                    <tr><td>LKR 1,00,000</td><td className="y1">LKR 3,000</td><td className="y2">LKR 3,500</td><td className="y3">LKR 4,000</td><td className="ytot">LKR 1,26,000</td></tr>
                    <tr><td>LKR 2,00,000</td><td className="y1">LKR 6,000</td><td className="y2">LKR 7,000</td><td className="y3">LKR 8,000</td><td className="ytot">LKR 2,52,000</td></tr>
                    <tr><td>LKR 5,00,000</td><td className="y1">LKR 15,000</td><td className="y2">LKR 17,500</td><td className="y3">LKR 20,000</td><td className="ytot">LKR 6,30,000</td></tr>
                    <tr><td>LKR 10,00,000</td><td className="y1">LKR 30,000</td><td className="y2">LKR 35,000</td><td className="y3">LKR 40,000</td><td className="ytot">LKR 12,60,000</td></tr>
                    <tr><td>LKR 20,00,000</td><td className="y1">LKR 60,000</td><td className="y2">LKR 70,000</td><td className="y3">LKR 80,000</td><td className="ytot">LKR 25,20,000</td></tr>
                    <tr><td>LKR 50,00,000</td><td className="y1">LKR 1,50,000</td><td className="y2">LKR 1,75,000</td><td className="y3">LKR 2,00,000</td><td className="ytot">LKR 63,00,000</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '1.5rem 1.75rem' }} className="reveal">
                <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '1rem' }}>Terms & Conditions</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: 'var(--mint)', flexShrink: 0, fontWeight: 700 }}>✓</span>Minimum investment: LKR 1,00,000</div>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: '#4db8f0', flexShrink: 0, fontWeight: 700 }}>✓</span>Investment period: 3 years (36 months)</div>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: 'var(--gold2)', flexShrink: 0, fontWeight: 700 }}>✓</span>Monthly returns credited on 1st of month</div>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: 'var(--mint)', flexShrink: 0, fontWeight: 700 }}>✓</span>Principal returned at end of 3-year tenure</div>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: '#4db8f0', flexShrink: 0, fontWeight: 700 }}>✓</span>All investments backed by plantation assets</div>
                  <div style={{ fontSize: '.77rem', color: 'rgba(255,255,255,.65)', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}><span style={{ color: 'var(--gold2)', flexShrink: 0, fontWeight: 700 }}>✓</span>Early withdrawal subject to agreement terms</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <h2>Start Earning <span className="grad-text">4% Monthly</span> Today</h2>
          <p>Join 5,000+ investors growing their wealth with Sri Lanka's most trusted plantation investment platform.</p>
          <div className="cta-strip-btns">
            <Link to="/company/nf-plantation/register" className="btn-gold">Open My Account →</Link>
            <button className="btn-ghost-white">Download Prospectus</button>
          </div>
        </div>
      </div>
      <NFFooter />
    </>
  );
};

export default InvestmentPlans;

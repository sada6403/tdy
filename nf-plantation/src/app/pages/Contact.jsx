import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';
import { PublicService } from '../../services/api';
const Contact = () => {
  const [btnText, setBtnText] = useState('Send Message →');
  const [btnStyle, setBtnStyle] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    investmentInterest: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

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
    
    // Fetch settings
    PublicService.getSettings()
      .then(res => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(err => console.error("Failed to load settings:", err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendForm = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    // Basic validation
    if (!formData.fullName || !formData.phoneNumber || !formData.message) {
      setError('Please fill in all required fields (Name, Phone, Message)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await PublicService.sendContact({
        name: formData.fullName,
        phone: formData.phoneNumber,
        email: formData.email,
        subject: `Investment Interest: ${formData.investmentInterest || 'General Inquiry'}`,
        message: formData.message,
        type: 'contact_page'
      });

      if (res.success) {
        setBtnText('✓ Message Sent Successfully!');
        setBtnStyle({ background: 'linear-gradient(135deg,var(--emerald),var(--green3))', color: 'var(--white)' });
        setFormData({ fullName: '', phoneNumber: '', email: '', investmentInterest: '', message: '' });
        
        setTimeout(() => {
          setBtnText('Send Message →');
          setBtnStyle({});
        }, 5000);
      } else {
        setError(res.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact error:', err);
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NFHeader />
      <div id="page-contact" className="page active" style={{ display: 'block' }}>
        <div className="contact-hero-bar">
          <div className="sec-chip" style={{ margin: '0 auto 1.25rem' }}>Get In Touch</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.1 }}>Nationwide <span className="grad-text">Network.</span></h1>
          <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>Access our services through our extensive network of branches and field officers available in your local district.</p>
        </div>

        <section className="sec" style={{ background: 'var(--dark2)' }}>
          <div className="contact-grid">
            <div className="reveal from-left">
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--white)', marginBottom: '.75rem' }}>Local Branch Accessibility, <span style={{ color: 'var(--mint)' }}>Nationwide.</span></h2>
              <p className="sec-body" style={{ marginBottom: '2rem' }}>Our strategically located branches ensure every investor has direct access to face-to-face support, maturity settlements, and account administration.</p>
              <div className="contact-info-cards">
                <div className="cic"><div className="cic-ico">📍</div><div className="cic-lbl">Headquarters</div><div className="cic-val">{settings?.contact?.address || 'No: 150, Housing Scheme, Kannakipuram West, Kilinochchi'}</div></div>
                <div className="cic"><div className="cic-ico">📞</div><div className="cic-lbl">Support Line</div><div className="cic-val">{settings?.contact?.phone || '024 4335099'}</div></div>
                <div className="cic"><div className="cic-ico">✉️</div><div className="cic-lbl">Official Email</div><div className="cic-val">{settings?.contact?.email || 'info@nfplantation.com'}</div></div>
                <div className="cic"><div className="cic-ico">🕐</div><div className="cic-lbl">Hours</div><div className="cic-val">{settings?.contact?.officeHours || 'Mon–Fri: 9AM–5PM'}</div></div>
              </div>
              <div className="reg-card">
                <div className="reg-card-top"><span style={{ fontSize: 20 }}>🏛️</span><span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--white)' }}>Registered Institution</span></div>
                <div className="reg-card-num">PV 00303425</div>
                <div className="reg-card-q">"<span className="notranslate" translate="no">NF Plantation</span> is fully authorized to provide sustainable investment and agricultural management services across Sri Lanka."</div>
              </div>
            </div>
            <div className="form-box reveal from-right">
              <div className="form-title">Send a Message</div>
              
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  {error}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-lbl">Full Name</label>
                  <input 
                    className="form-inp" 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-lbl">Phone Number</label>
                  <input 
                    className="form-inp" 
                    type="tel" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+94 7X XXX XXXX" 
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-lbl">Email Address</label>
                <input 
                  className="form-inp" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com" 
                />
              </div>
              <div className="form-group">
                <label className="form-lbl">Investment Interest</label>
                <input 
                  className="form-inp" 
                  type="text" 
                  name="investmentInterest"
                  value={formData.investmentInterest}
                  onChange={handleChange}
                  placeholder="e.g. LKR 5,00,000 for 36 months" 
                />
              </div>
              <div className="form-group">
                <label className="form-lbl">Message</label>
                <textarea 
                  className="form-inp" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>
              <button 
                className="form-submit" 
                onClick={sendForm} 
                style={btnStyle}
                disabled={loading}
              >
                {loading ? 'Sending...' : btnText}
              </button>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <a href={`tel:${settings?.contact?.phone || '0244335099'}`} style={{ flex: 1, textAlign: 'center', padding: '.7rem', borderRadius: 9, border: '1px solid rgba(37,168,94,.25)', color: 'var(--mint)', fontSize: '.76rem', fontWeight: 600, textDecoration: 'none', transition: 'all .2s', background: 'rgba(37,168,94,.05)' }}>📞 Call Now</a>
                <a href={`mailto:${settings?.contact?.email || 'info@nfplantation.com'}`} style={{ flex: 1, textAlign: 'center', padding: '.7rem', borderRadius: 9, border: '1px solid rgba(201,151,58,.25)', color: 'var(--gold2)', fontSize: '.76rem', fontWeight: 600, textDecoration: 'none', transition: 'all .2s', background: 'rgba(201,151,58,.05)' }}>✉️ Email Us</a>
              </div>
            </div>
          </div>
        </section>

        <section className="sec branches-sec">
          <div className="inner branches-grid">
            <div className="reveal from-left">
              <div className="sec-chip">Branch Network</div>
              <h2 className="sec-title" style={{ marginBottom: '.75rem' }}>Our Hubs in the <span className="g">North.</span></h2>
              <p className="sec-body" style={{ marginBottom: '.5rem' }}>Strategically located across Sri Lanka to ensure every investor has direct access to face-to-face support and maturity settlement.</p>
              <div className="branch-list">
                <div className="branch-item"><div className="branch-dot"></div><div><div className="branch-name">Kilinochchi HQ</div><div className="branch-addr">150, Housing Scheme, Kannakipuram West</div></div><div className="branch-tag">Main Office</div></div>
                <div className="branch-item"><div className="branch-dot"></div><div><div className="branch-name">Jaffna Branch</div><div className="branch-addr">Stafford Road, Jaffna</div></div></div>
                <div className="branch-item"><div className="branch-dot"></div><div><div className="branch-name">Colombo Office</div><div className="branch-addr">Galle Road, Colombo</div></div></div>
                <div className="branch-item" style={{ opacity: .5 }}><div className="branch-dot" style={{ background: 'var(--gray)' }}></div><div><div className="branch-name" style={{ color: 'var(--gray)' }}>More branches coming soon</div><div className="branch-addr">Expanding across Sri Lanka</div></div></div>
              </div>
            </div>
            <div className="reveal from-right">
              <div className="branch-map-img">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=700&q=80&fit=crop" alt="Map" onError={(e) => { e.target.style.background = 'var(--dark3)'; }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ background: 'rgba(37,168,94,.08)', border: '1px solid rgba(37,168,94,.18)', borderRadius: 12, padding: '1rem' }}><div style={{ fontSize: '1.3rem', marginBottom: '.4rem' }}>🌐</div><div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--white)' }}>Global Support</div><div style={{ fontSize: '.72rem', color: 'var(--gray)' }}>24/7 digital concierge</div></div>
                <div style={{ background: 'rgba(201,151,58,.08)', border: '1px solid rgba(201,151,58,.18)', borderRadius: 12, padding: '1rem' }}><div style={{ fontSize: '1.3rem', marginBottom: '.4rem' }}>🤝</div><div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--white)' }}>Human Dedicated</div><div style={{ fontSize: '.72rem', color: 'var(--gray)' }}>Expert field officers</div></div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-strip">
          <h2>Looking for More <span className="grad-text">Information?</span></h2>
          <p>Download our platform overview or speak directly with our investment directors today.</p>
          <div className="cta-strip-btns">
            <button className="btn-gold">Download Overview PDF</button>
            <Link to="/company/nf-plantation/investment-plans" className="btn-ghost-white">View Investment Plans →</Link>
          </div>
        </div>
      </div>
      <NFFooter />
    </>
  );
};

export default Contact;

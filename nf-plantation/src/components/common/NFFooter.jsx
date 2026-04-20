import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import logoImg from '../../assets/nf plantation logo.jpg';
import { PublicService } from '../../services/api';

const NFFooter = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await PublicService.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer>
      <div className="footer-grid">
        <div>
          <img src={logoImg} className="footer-brand-logo" alt="NF Logo" style={{objectFit: 'cover', background: 'none'}} />
          <div className="footer-brand-name notranslate" translate="no">{settings?.branding?.companyName || 'NF Plantation'}</div>
          <div className="footer-brand-desc">Sustainable plantation investment opportunities with government backing, structured monthly returns, and nationwide branch support since 2020.</div>
          <div className="footer-reg">Reg. No: PV 00303425</div>
          <div className="footer-socials" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            {settings?.social?.facebook && settings.social.facebook !== '#' && <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Facebook size={20} /></a>}
            {settings?.social?.instagram && settings.social.instagram !== '#' && <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Instagram size={20} /></a>}
            {settings?.social?.youtube && settings.social.youtube !== '#' && <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Youtube size={20} /></a>}
            {settings?.social?.twitter && settings.social.twitter !== '#' && <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Twitter size={20} /></a>}
            {settings?.social?.linkedin && settings.social.linkedin !== '#' && <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="footer-social-link"><Linkedin size={20} /></a>}
          </div>
        </div>
        <div>
          <div className="footer-heading">Quick Links</div>
          <ul className="footer-links">
            <li><Link to="/company/nf-plantation/about">About Us</Link></li>
            <li><Link to="/company/nf-plantation/services">Services</Link></li>
            <li><Link to="/company/nf-plantation/investment-plans">Investment Plans</Link></li>
            <li><Link to="/company/nf-plantation/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">Investment Info</div>
          <ul className="footer-links">
            <li><span>Min. Investment: LKR 1,00,000</span></li>
            <li><span>Tenure: 1, 2 & 3 Years</span></li>
            <li><span>Returns: 3% → 3.5% → 4%/mo</span></li>
            <li><span>Government Approved</span></li>
            <li><Link to="/company/nf-plantation/sample-agreement" style={{color: 'inherit', textDecoration: 'none'}}>Sample Agreement</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-heading">Contact Info</div>
          <div className="footer-contact-item"><span className="footer-ci-ico">📍</span><span className="footer-ci-val">{settings?.contact?.address || 'No: 150, Housing Scheme, Kannakipuram West, Kilinochchi'}</span></div>
          <div className="footer-contact-item"><span className="footer-ci-ico">📞</span><span className="footer-ci-val">{settings?.contact?.phone || '024 4335099'}</span></div>
          <div className="footer-contact-item"><span className="footer-ci-ico">✉️</span><span className="footer-ci-val">{settings?.contact?.email || 'info@nfplantation.com'}</span></div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">{settings?.branding?.copyrightText || '© 2026 NF Plantation (Pvt) Ltd. All rights reserved.'}</div>
        <div className="footer-legal">Licensed & regulated investment company · Sustainable agriculture specialists</div>
      </div>
    </footer>
  );
};

export default NFFooter;

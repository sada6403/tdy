import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';
import { PublicService } from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    PublicService.getEvents().then(res => {
      if (res.success) {
        setEvents(res.data);
      }
    }).catch(err => console.error('Failed to load events', err));

    const doReveal = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
          el.classList.add('visible');
        }
      });
    };
    doReveal();
    window.addEventListener('scroll', doReveal);
    return () => window.removeEventListener('scroll', doReveal);
  }, []);

  const videoEvents = events.filter(e => e.type === 'video');
  const achievementEvents = events.filter(e => e.type === 'achievement');
  const workEvents = events.filter(e => e.type === 'work');
  const testimonialEvents = events.filter(e => e.type === 'testimonial');

  const defaultAchievements = [
    { title: 'Best Agri-Investment Platform 2023', img: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80' },
    { title: 'Excellence in Sustainable Farming', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80' },
    { title: 'Top Regional Employer Award', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80' }
  ];

  const defaultWorks = [
    { title: 'Aloe Vera Cultivation', img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&fit=crop' },
    { title: 'Modern Irrigation Setup', img: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80' },
    { title: 'Coconut Harvesting', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80&fit=crop' },
    { title: 'Community Outreach', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80' }
  ];

  const defaultTestimonials = [
    { name: 'S. Kabilan', role: 'Investor since 2021', text: 'The monthly payouts have been incredibly consistent. Their field officers are very polite and keep me updated about the plantations.' },
    { name: 'M. Ramesh', role: 'Investor since 2022', text: 'I visited their Aloe Vera farm last month. It was a wonderful experience to see my investment literally growing. Highly recommended!' },
    { name: 'T. Vithya', role: 'Premium Investor', text: 'The transparency and digital dashboard makes it so easy to track everything. The annual awarding ceremony was spectacular!' }
  ];

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.length === 11) {
      videoId = url;
    }
    
    if (videoId && videoId.length >= 10) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    return url;
  };

  return (
    <>
      <NFHeader />
      <div id="page-events" className="page active" style={{ display: 'block' }}>
        
        {/* Page Header */}
        <div className="contact-hero-bar">
          <div className="sec-chip" style={{ margin: '0 auto 1.25rem' }}>Our Journey</div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.1, marginBottom: '1rem' }}>Events & <span className="grad-text">Highlights</span></h1>
          <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>Celebrating our milestones, recognizing our achievers, and showcasing the impact of <span className="notranslate" translate="no">NF Plantation</span> across Sri Lanka.</p>
        </div>

        {/* Videos Section */}
        <section className="sec" style={{ background: 'var(--dark2)' }}>
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Video Highlights</div>
              <h2 className="sec-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)' }}>Annual Awarding <span className="gold">Ceremony</span></h2>
              <p className="sec-body" style={{ maxWidth: 600, margin: '1rem auto 0' }}>Experience the grand celebrations of our company's success and investor community.</p>
            </div>
            
            <div className="events-video-grid">
              {videoEvents.length > 0 ? videoEvents.map((ev, i) => (
                <div key={i} className="event-video-card reveal">
                  <h3 className="ev-card-title">{ev.title}</h3>
                  <div className="ev-video-wrapper">
                    <iframe 
                      src={getYouTubeEmbedUrl(ev.url)} 
                      title={ev.title} 
                      className="ev-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                    </iframe>
                  </div>
                </div>
              )) : (
                <>
                  <div className="event-video-card">
                    <h3 className="ev-card-title"><span className="notranslate" translate="no">NF Plantation</span> Annual Awarding Ceremony</h3>
                    <div className="ev-video-wrapper">
                      <iframe 
                        src="https://www.youtube.com/embed/6WHjRI5y73I?autoplay=1&mute=1&loop=1&playlist=6WHjRI5y73I" 
                        title="Company Annual Awarding Ceremony" 
                        className="ev-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  </div>
                  <div className="event-video-card">
                    <h3 className="ev-card-title">Special Event Highlights</h3>
                    <div className="ev-video-wrapper">
                      <iframe 
                        src="https://www.youtube.com/embed/ohmmNRwHcpk?autoplay=1&mute=1&loop=1&playlist=ohmmNRwHcpk" 
                        title="Event Highlights" 
                        className="ev-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Awards & Achievements */}
        <section className="sec">
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Milestones</div>
              <h2 className="sec-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)' }}>Our Awards & <span className="g">Achievements</span></h2>
              <p className="sec-body" style={{ maxWidth: 600, margin: '1rem auto 0' }}>Recognized for excellence in sustainable agriculture and investment management.</p>
            </div>
            <div className="events-grid-standard">
              {(achievementEvents.length > 0 ? achievementEvents : defaultAchievements).map((item, i) => (
                <div key={i} className="reveal from-bottom event-item-card" style={{ transitionDelay: `${i * 100}ms` }}>
                  <img src={item.image || item.img} alt={item.title} className="ev-item-img" />
                  <div className="ev-item-content">
                    <h3 className="ev-item-title">{item.title}</h3>
                    <p className="ev-item-desc">{item.description || "Honored for our outstanding commitment to growth, transparency, and community building."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Works */}
        <section className="sec" style={{ background: 'var(--dark2)' }}>
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Gallery</div>
              <h2 className="sec-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)' }}>Our <span className="grad-text">Works</span></h2>
              <p className="sec-body" style={{ maxWidth: 600, margin: '1rem auto 0' }}>Witness the direct impact of your investments on the ground.</p>
            </div>
            <div className="events-grid-works">
              {(workEvents.length > 0 ? workEvents : defaultWorks).map((item, i) => (
                <div key={i} className="reveal from-bottom ev-work-card" style={{ transitionDelay: `${i * 100}ms` }}>
                  <img src={item.image || item.img} alt={item.title} className="ev-work-img" />
                  <div className="ev-work-overlay">
                    <span className="ev-work-label">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="sec">
          <div className="inner">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="reveal">
              <div className="sec-chip" style={{ margin: '0 auto 1rem' }}>Testimonials</div>
              <h2 className="sec-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)' }}>Customer <span className="gold">Reviews</span></h2>
              <p className="sec-body" style={{ maxWidth: 600, margin: '1rem auto 0' }}>What our community of 3,000+ investors say about us.</p>
            </div>
            <div className="events-grid-reviews">
              {(testimonialEvents.length > 0 ? testimonialEvents : defaultTestimonials).map((review, i) => (
                <div key={i} className="reveal from-bottom ev-review-card" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="ev-quote-ico">"</div>
                  <p className="ev-review-text">"{review.description || review.text}"</p>
                  <div className="ev-reviewer-info">
                    <div className="ev-reviewer-avatar">
                      {(review.author || review.name).charAt(0)}
                    </div>
                    <div>
                      <div className="ev-reviewer-name">{review.author || review.name}</div>
                      <div className="ev-reviewer-role">{review.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-strip">
          <div className="inner">
            <div className="cta-strip-card reveal from-bottom">
              <h2>Be Part of Our Next <span className="grad-text">Success Story</span></h2>
              <p>Join thousands of satisfied investors today.</p>
              <div className="cta-strip-btns">
                <Link to="/company/nf-plantation/register" className="btn-gold">Start Investing →</Link>
                <Link to="/company/nf-plantation/contact" className="btn-ghost-white">Contact Us</Link>
              </div>
            </div>
          </div>
        </section>

      </div>
      <NFFooter />
    </>
  );
};

export default Events;

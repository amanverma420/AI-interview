import React from 'react'
import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--cream-dark)', borderTop: '1px solid var(--sand)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', background: 'var(--ink)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="4.5" height="4.5" rx="0.8" fill="var(--amber)" />
                  <rect x="8.5" y="1" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.5" />
                  <rect x="1" y="8.5" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.3" />
                  <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.7" />
                </svg>
              </div>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                InterviewIQ<span style={{ color: 'var(--amber)' }}>.AI</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#9E8E78', lineHeight: 1.7, maxWidth: '220px' }}>
              AI-powered interview preparation. Practice smarter, perform better.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '16px', fontWeight: 500 }}>
              Product
            </h4>
            {[
              { label: 'Start Interview', path: '/interview' },
              { label: 'History', path: '/history' },
              { label: 'Pricing', path: '/pricing' },
            ].map((link, i) => (
              <button key={i} onClick={() => navigate(link.path)}
                style={{ display: 'block', padding: '5px 0', background: 'none', border: 'none', color: '#9E8E78', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = '#9E8E78'}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Features callout */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '16px', fontWeight: 500 }}>
              What's inside
            </h4>
            {['Voice-enabled AI interviewer', 'Resume PDF analysis', 'Performance scoring', 'Downloadable reports', 'Interview history'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px', color: '#9E8E78' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--sand)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#9E8E78', fontFamily: 'DM Mono, monospace' }}>
            © {year} InterviewIQ.AI — All rights reserved
          </p>
          <p style={{ fontSize: '12px', color: '#9E8E78' }}>
            Built with care for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
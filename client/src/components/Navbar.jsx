import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { BsCoin } from "react-icons/bs"
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi"
import { RiHistoryLine, RiPriceTag3Line } from "react-icons/ri"
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import AuthModel from './AuthModel'

function Navbar() {
  const { userData } = useSelector((state) => state.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/")
    } catch (e) { console.log(e) }
  }

  const navLinks = [
    { label: 'Interview', path: '/interview' },
    { label: 'History', path: '/history' },
    { label: 'Pricing', path: '/pricing' },
  ]

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(245,240,232,0.96)' : 'var(--cream)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--sand)' : 'transparent'}`,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--amber), var(--sage), var(--amber))', backgroundSize: '200% 100%' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--ink)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1" fill="var(--amber)" />
                  <rect x="10" y="2" width="6" height="6" rx="1" fill="var(--cream)" opacity="0.6" />
                  <rect x="2" y="10" width="6" height="6" rx="1" fill="var(--cream)" opacity="0.4" />
                  <rect x="10" y="10" width="6" height="6" rx="1" fill="var(--amber)" opacity="0.7" />
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '16px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                  InterviewIQ
                </span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--amber)', marginLeft: '3px', fontWeight: 500 }}>.AI</span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden md:flex">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => {
                    if (!userData && link.path !== '/pricing') { setShowAuth(true); return }
                    navigate(link.path)
                  }}
                  style={{
                    padding: '7px 16px',
                    background: location.pathname === link.path ? 'var(--cream-dark)' : 'transparent',
                    border: location.pathname === link.path ? '1px solid var(--sand)' : '1px solid transparent',
                    borderRadius: '4px',
                    color: location.pathname === link.path ? 'var(--ink)' : 'var(--ink-soft)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: location.pathname === link.path ? 600 : 400,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (location.pathname !== link.path) { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--cream-dark)' }}}
                  onMouseLeave={e => { if (location.pathname !== link.path) { e.currentTarget.style.color = 'var(--ink-soft)'; e.currentTarget.style.background = 'transparent' }}}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Credits */}
              {userData && (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px',
                    background: 'var(--amber-pale)',
                    border: '1px solid rgba(200,135,58,0.3)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/pricing')}
                >
                  <BsCoin size={13} style={{ color: 'var(--amber)' }} />
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500, color: '#8B5E20' }}>
                    {userData.credits}
                  </span>
                </div>
              )}

              {/* User / CTA */}
              {userData ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    style={{
                      width: '36px', height: '36px',
                      background: 'var(--ink)',
                      border: '2px solid var(--ink)',
                      borderRadius: '50%',
                      color: 'var(--cream)',
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.borderColor = 'var(--amber)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--ink)' }}
                  >
                    {userData.name.slice(0, 1).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          width: '220px',
                          background: 'var(--white)',
                          border: '1px solid var(--sand)',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-strong)',
                          overflow: 'hidden',
                          zIndex: 200,
                        }}
                      >
                        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--sand-light)' }}>
                          <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '2px' }}>
                            {userData.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#9E8E78', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userData.email}
                          </p>
                        </div>
                        <div style={{ padding: '8px' }}>
                          {[
                            { icon: <RiHistoryLine size={14} />, label: 'Interview History', action: () => navigate('/history') },
                            { icon: <RiPriceTag3Line size={14} />, label: 'Pricing & Credits', action: () => navigate('/pricing') },
                          ].map((item, i) => (
                            <button key={i} onClick={item.action}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', background: 'none', border: 'none', borderRadius: '5px', color: 'var(--ink-soft)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--ink)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ink-soft)' }}
                            >
                              {item.icon} {item.label}
                            </button>
                          ))}
                          <div style={{ height: '1px', background: 'var(--sand-light)', margin: '6px 0' }} />
                          <button onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', background: 'none', border: 'none', borderRadius: '5px', color: 'var(--rust)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FFF0ED' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                          >
                            <HiOutlineLogout size={14} /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => setShowAuth(true)}>
                  Sign in
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--ink)' }}
              >
                <div style={{ width: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'block', height: '1.5px', background: 'var(--ink)', borderRadius: '1px', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(5.5px)' : 'none' }} />
                  <span style={{ display: 'block', height: '1.5px', background: 'var(--ink)', borderRadius: '1px', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
                  <span style={{ display: 'block', height: '1.5px', background: 'var(--ink)', borderRadius: '1px', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-5.5px)' : 'none' }} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--sand-light)', background: 'var(--white)' }}
            >
              <div style={{ padding: '12px 24px 20px' }}>
                {navLinks.map(link => (
                  <button key={link.path} onClick={() => {
                    if (!userData && link.path !== '/pricing') { setShowAuth(true); setMenuOpen(false); return }
                    navigate(link.path)
                  }}
                    style={{ display: 'block', width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--sand-light)', color: 'var(--ink)', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default Navbar
import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { motion, useInView } from "motion/react"
import { useNavigate } from 'react-router-dom'
import { BsMic, BsArrowRight, BsCheckCircle, BsPlayCircle } from "react-icons/bs"
import { RiAiGenerate, RiBrainLine, RiFileChartLine } from "react-icons/ri"
import { HiOutlineSparkles } from "react-icons/hi"
import { FiUpload, FiTarget, FiTrendingUp } from "react-icons/fi"
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthModel from '../components/AuthModel'

// Counter animation hook
function useCounter(target, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView && startOnView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

// Ticker strip
const topics = ['Frontend Developer', 'System Design', 'Behavioral Interview', 'Backend Engineering', 'Product Manager', 'Data Science', 'UX Design', 'DevOps', 'Machine Learning', 'Full Stack']

function TickerStrip() {
  const doubled = [...topics, ...topics]
  return (
    <div style={{ overflow: 'hidden', background: 'var(--ink)', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="animate-ticker" style={{ display: 'flex', gap: 0, width: 'max-content' }}>
        {doubled.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '0 24px', fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {t}
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--amber)', display: 'inline-block', flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  )
}

function StatCard({ target, suffix = '', label, prefix = '' }) {
  const { count, ref } = useCounter(target)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '13px', color: '#9E8E78', marginTop: '6px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  )
}

export default function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const navigate = useNavigate()

  const steps = [
    { icon: <FiUpload size={18} />, num: '01', title: 'Configure', desc: 'Set your target role and experience level. Upload your resume for personalized questions based on your actual projects and skills.' },
    { icon: <BsMic size={18} />, num: '02', title: 'Interview', desc: 'Speak naturally to the AI interviewer. It listens, asks follow-ups, and adapts difficulty in real time — just like a real interview.' },
    { icon: <RiFileChartLine size={18} />, num: '03', title: 'Improve', desc: 'Receive a detailed performance report. Scores across confidence, communication, and correctness — with actionable feedback.' },
  ]

  const features = [
    {
      icon: <RiAiGenerate size={20} />,
      tag: 'AI Evaluation',
      title: 'Scored on what matters',
      desc: 'Every answer is evaluated across three dimensions: technical correctness, communication clarity, and confidence. No guesswork.',
      detail: 'Confidence · Communication · Correctness',
    },
    {
      icon: <FiUpload size={20} />,
      tag: 'Resume Intelligence',
      title: 'Questions from your actual experience',
      desc: 'Upload your resume and the AI extracts your projects, skills, and role history to craft hyper-relevant interview questions.',
      detail: 'PDF parsing · Skill extraction · Project analysis',
    },
    {
      icon: <FiTarget size={20} />,
      tag: 'Two Interview Modes',
      title: 'HR and Technical tracks',
      desc: 'Switch between behavioral HR interviews focused on soft skills and technical deep-dives based on your role and stack.',
      detail: 'HR Mode · Technical Mode · Adaptive difficulty',
    },
    {
      icon: <FiTrendingUp size={20} />,
      tag: 'Progress Tracking',
      title: 'Track your growth over time',
      desc: 'Full interview history with trend charts. See how your scores improve across sessions and identify weak areas fast.',
      detail: 'Score history · Performance charts · PDF export',
    },
  ]

  const go = (path) => {
    if (!userData) { setShowAuth(true); return }
    navigate(path)
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '72px 24px 64px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }} className="lg:grid-cols-[1fr_420px]">

          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <span className="tag tag-amber">
                  <HiOutlineSparkles size={10} /> AI-Powered Practice
                </span>
                <span style={{ fontSize: '12px', color: '#9E8E78' }}>v2.0 now available</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 900,
                color: 'var(--ink)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '24px',
              }}
            >
              Practice interviews.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>Get the job.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{ fontSize: '17px', color: '#6B5E4E', lineHeight: 1.7, maxWidth: '520px', marginBottom: '36px' }}
            >
              Role-based mock interviews with adaptive AI. Voice-enabled, resume-aware, and ruthlessly honest — so you're never caught off guard on the real day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '48px' }}
            >
              <button className="btn-primary" style={{ gap: '10px', padding: '14px 28px', fontSize: '15px' }} onClick={() => go('/interview')}>
                Start practicing <BsArrowRight size={16} />
              </button>
              <button className="btn-ghost" onClick={() => go('/history')}>
                <BsPlayCircle size={16} /> View my history
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}
            >
              {['No setup required', 'Voice-enabled AI', 'Detailed PDF reports', 'Resume analysis'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#6B5E4E' }}>
                  <BsCheckCircle size={13} style={{ color: 'var(--sage)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — interview card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div style={{
              background: 'var(--ink)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(26,22,18,0.3)',
              position: 'relative',
            }}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#A84B2F', '#C8873A', '#4A6741'].map((c, i) => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'rgba(245,240,232,0.35)', letterSpacing: '0.1em' }}>
                  LIVE SESSION
                </span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4A6741', boxShadow: '0 0 0 3px rgba(74,103,65,0.2)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
              </div>

              {/* Fake video area */}
              <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #1A1612 0%, #2A2218 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200,135,58,0.15)', border: '2px solid rgba(200,135,58,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }}>
                    <BsMic size={24} style={{ color: 'var(--amber)' }} />
                  </div>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.4)', letterSpacing: '0.08em' }}>LISTENING...</p>
                </div>
                {/* Waveform */}
                <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
                  {[6, 14, 10, 20, 8, 18, 12, 22, 7, 16, 9, 20, 11, 15, 7].map((h, i) => (
                    <div key={i} className="waveform-bar" style={{ height: `${h}px`, background: 'rgba(200,135,58,0.6)', animation: `float ${0.4 + i * 0.07}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
              </div>

              {/* Question bubble */}
              <div style={{ padding: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--amber)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    INTERVIEWER · Q2 of 5
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.85)', lineHeight: 1.6, fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                    "Can you walk me through how you approached scaling the backend system in your last project?"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, height: '38px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.3)', fontFamily: 'DM Mono, monospace' }}>Transcribing...</span>
                  </div>
                  <div style={{ width: '38px', height: '38px', background: 'var(--amber)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BsMic size={14} style={{ color: 'var(--white)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <TickerStrip />

      {/* Stats */}
      <section style={{ padding: '72px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px', padding: '48px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--sand-light)', boxShadow: 'var(--shadow-warm)' }}>
          <StatCard target={5000} suffix="+" label="interviews done" />
          <StatCard target={94} suffix="%" label="satisfaction rate" />
          <StatCard target={12} label="avg questions/session" />
          <StatCard target={3} label="scoring dimensions" />
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '40px 24px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '56px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <div className="divider" />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>How it works</span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15 }}>
              Three steps to<br />
              <em style={{ fontStyle: 'italic' }}>interview confidence.</em>
            </h2>
          </div>
          <button className="btn-ghost" style={{ marginTop: '8px' }} onClick={() => go('/interview')}>
            Try it now <BsArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              onClick={() => setActiveStep(i)}
              style={{
                padding: '40px 36px',
                background: activeStep === i ? 'var(--ink)' : 'var(--white)',
                border: '1px solid var(--sand-light)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: i === 0 ? '12px 0 0 12px' : i === 2 ? '0 12px 12px 0' : '0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: activeStep === i ? 'rgba(200,135,58,0.2)' : 'var(--cream)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: activeStep === i ? 'var(--amber)' : 'var(--ink-soft)',
                  border: `1px solid ${activeStep === i ? 'rgba(200,135,58,0.3)' : 'var(--sand-light)'}`,
                }}>
                  {step.icon}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '24px', fontWeight: 500, color: activeStep === i ? 'rgba(255,255,255,0.12)' : 'rgba(26,22,18,0.08)', letterSpacing: '-0.02em' }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: activeStep === i ? 'var(--cream)' : 'var(--ink)', marginBottom: '12px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: activeStep === i ? 'rgba(245,240,232,0.65)' : '#6B5E4E', lineHeight: 1.7 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '40px 24px 80px', background: 'var(--white)', borderTop: '1px solid var(--sand-light)', borderBottom: '1px solid var(--sand-light)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <div className="divider" />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>Features</span>
              <div className="divider" />
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15 }}>
              Built for serious<br />
              <em style={{ fontStyle: 'italic' }}>preparation.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card card-hover"
                style={{ padding: '32px 28px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', border: '1px solid var(--sand-light)' }}>
                    {f.icon}
                  </div>
                  <span className="tag tag-amber">{f.tag}</span>
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px', lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#6B5E4E', lineHeight: 1.7, marginBottom: '16px' }}>
                  {f.desc}
                </p>
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--sand-light)' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#9E8E78', letterSpacing: '0.05em' }}>
                    {f.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'var(--ink)',
            borderRadius: '16px',
            padding: 'clamp(40px, 6vw, 72px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* BG accent */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,135,58,0.15), transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,103,65,0.1), transparent 70%)' }} />

          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
            <div>
              <span className="tag" style={{ background: 'rgba(200,135,58,0.15)', color: 'var(--amber)', border: '1px solid rgba(200,135,58,0.25)', marginBottom: '20px' }}>
                Start for free
              </span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Your next interview<br />
                <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>starts here.</em>
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(245,240,232,0.55)', marginTop: '14px', maxWidth: '400px', lineHeight: 1.6 }}>
                100 free credits included. No credit card required. Start your first AI interview in under 2 minutes.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
              <button className="btn-amber" style={{ justifyContent: 'center', padding: '15px 32px', fontSize: '15px' }} onClick={() => go('/interview')}>
                Start your first interview
              </button>
              <button
                onClick={() => go('/pricing')}
                style={{ padding: '12px 24px', background: 'transparent', color: 'rgba(245,240,232,0.6)', border: '1px solid rgba(245,240,232,0.15)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--cream)'; e.currentTarget.style.borderColor = 'rgba(245,240,232,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.6)'; e.currentTarget.style.borderColor = 'rgba(245,240,232,0.15)' }}
              >
                View pricing plans →
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}
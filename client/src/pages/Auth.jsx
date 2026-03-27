import React, { useState } from 'react'
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../utils/firebase'
import axios from 'axios'
import { ServerUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const quotes = [
  { text: "Preparation is not the exception — it is the foundation.", attr: "Career wisdom" },
  { text: "The interview begins long before you walk in the door.", attr: "Interview philosophy" },
  { text: "Your words carry weight. Practice makes them carry intention.", attr: "Communication insight" },
]

function Auth({ isModel = false }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const quote = quotes[Math.floor(Date.now() / 10000) % quotes.length]

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await signInWithPopup(auth, provider)
      const { displayName: name, email } = response.user
      const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
      dispatch(setUserData(result.data))
    } catch (error) {
      console.log(error)
      setError('Sign-in failed. Please try again.')
      dispatch(setUserData(null))
    } finally {
      setLoading(false)
    }
  }

  if (isModel) {
    return (
      <div style={{
        background: 'var(--white)',
        borderRadius: '12px',
        border: '1px solid var(--sand)',
        boxShadow: 'var(--shadow-strong)',
        overflow: 'hidden',
        maxWidth: '420px',
        width: '100%',
      }}>
        {/* Top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--amber), var(--sage))' }} />
        
        <div style={{ padding: '36px 36px 32px' }}>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--amber)', borderRadius: '50%' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase', fontWeight: 500 }}>
                InterviewIQ.AI
              </span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25, marginBottom: '10px' }}>
              Start your interview<br />
              <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>preparation</em>
            </h2>
            <p style={{ fontSize: '13px', color: '#9E8E78', lineHeight: 1.6 }}>
              Sign in to access AI-powered mock interviews and track your progress.
            </p>
          </div>

          <blockquote style={{
            padding: '14px 16px',
            background: 'var(--cream)',
            borderLeft: '3px solid var(--amber)',
            borderRadius: '0 6px 6px 0',
            marginBottom: '24px',
          }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '4px' }}>
              "{quote.text}"
            </p>
            <span style={{ fontSize: '11px', color: '#9E8E78', fontFamily: 'DM Mono, monospace' }}>— {quote.attr}</span>
          </blockquote>

          <motion.button
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '13px 20px',
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: 'none', borderRadius: '6px',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(245,240,232,0.3)', borderTopColor: 'var(--cream)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle size={18} />
                Continue with Google
              </>
            )}
          </motion.button>

          {error && (
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--rust)', textAlign: 'center' }}>{error}</p>
          )}

          <p style={{ marginTop: '16px', fontSize: '11px', color: '#9E8E78', textAlign: 'center', lineHeight: 1.5 }}>
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex' }}>
      {/* Left — decorative panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          background: 'var(--ink)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 56px',
        }}
      >
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Amber circle accent */}
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-80px',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,135,58,0.2) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--amber)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" />
                <rect x="8.5" y="1" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.5" />
                <rect x="1" y="8.5" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.3" />
                <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="0.8" fill="var(--cream)" opacity="0.7" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '16px', color: 'var(--cream)' }}>
              InterviewIQ<span style={{ color: 'var(--amber)' }}>.AI</span>
            </span>
          </div>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '48px', fontWeight: 900, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            The AI that<br />
            <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>prepares</em><br />
            you to win.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, maxWidth: '300px' }}>
            Practice real interviews with adaptive AI. Get scored, get feedback, and get the job.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ position: 'relative', display: 'flex', gap: '32px' }}>
          {[
            { val: '5K+', label: 'Interviews' },
            { val: '94%', label: 'Satisfaction' },
            { val: '2 modes', label: 'HR + Tech' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '28px', color: 'var(--amber)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(245,240,232,0.45)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — sign-in form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '40px' }}>
            <span className="tag tag-amber" style={{ marginBottom: '20px' }}>Trusted by professionals</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '12px' }}>
              Welcome back.
            </h2>
            <p style={{ fontSize: '14px', color: '#9E8E78', lineHeight: 1.6 }}>
              Sign in to continue your interview preparation journey.
            </p>
          </div>

          <blockquote style={{
            padding: '16px 20px',
            background: 'var(--white)',
            borderLeft: '3px solid var(--amber)',
            borderRadius: '0 8px 8px 0',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-warm)',
          }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '6px' }}>
              "{quote.text}"
            </p>
            <span style={{ fontSize: '11px', color: '#9E8E78', fontFamily: 'DM Mono, monospace' }}>— {quote.attr}</span>
          </blockquote>

          <motion.button
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(26,22,18,0.15)' }}
            whileTap={{ scale: 0.99 }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '15px 24px',
              background: 'var(--ink)',
              color: 'var(--cream)',
              border: '1.5px solid var(--ink)',
              borderRadius: '6px',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '20px',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(245,240,232,0.3)', borderTopColor: 'var(--cream)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle size={20} />
                Continue with Google
              </>
            )}
          </motion.button>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FFF0ED', border: '1px solid rgba(168,75,47,0.2)', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--rust)' }}>{error}</p>
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#9E8E78', textAlign: 'center', lineHeight: 1.5 }}>
            By signing in, you agree to our Terms of Service<br />and Privacy Policy
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Auth
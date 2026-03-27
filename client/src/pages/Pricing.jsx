import React, { useState } from 'react'
import { FiArrowLeft, FiCheck, FiZap } from 'react-icons/fi'
import { BsArrowRight } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import axios from 'axios'
import { ServerUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import Navbar from '../components/Navbar.jsx'

const features = [
  'AI interview sessions',
  'Voice-enabled interviewer',
  'Resume PDF analysis',
  'Performance scoring',
  'Interview history',
  'PDF report download',
  'Skill trend charts',
  'Priority AI processing',
]

function Pricing() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [billingNote, setBillingNote] = useState('')

  const plans = [
    {
      id: "free",
      name: "Starter",
      price: "₹0",
      priceNum: 0,
      credits: 100,
      creditsPerSession: 50,
      sessions: 2,
      description: "Try the platform and get a feel for AI interviews.",
      features: [true, true, true, true, true, false, false, false],
      cta: 'Current plan',
      isDefault: true,
    },
    {
      id: "basic",
      name: "Growth",
      price: "₹100",
      priceNum: 100,
      credits: 150,
      creditsPerSession: 50,
      sessions: 3,
      description: "For focused job seekers who want consistent practice.",
      features: [true, true, true, true, true, true, true, false],
      cta: 'Get Growth',
      badge: null,
    },
    {
      id: "pro",
      name: "Professional",
      price: "₹500",
      priceNum: 500,
      credits: 650,
      creditsPerSession: 50,
      sessions: 13,
      description: "Maximum preparation for high-stakes interviews.",
      features: [true, true, true, true, true, true, true, true],
      cta: 'Get Professional',
      badge: 'Best value',
    },
  ]

  const handlePayment = async (plan) => {
    if (plan.isDefault) return
    try {
      setLoadingPlan(plan.id)
      const result = await axios.post(ServerUrl + "/api/payment/order", { planId: plan.id, amount: plan.priceNum, credits: plan.credits }, { withCredentials: true })
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} — ${plan.credits} Credits`,
        order_id: result.data.id,
        handler: async function (response) {
          const verifypay = await axios.post(ServerUrl + "/api/payment/verify", response, { withCredentials: true })
          dispatch(setUserData(verifypay.data.user))
          setBillingNote(`✓ ${plan.credits} credits added to your account!`)
          setTimeout(() => { setBillingNote(''); navigate('/') }, 3000)
        },
        theme: { color: '#C8873A' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) { console.log(error) }
    finally { setLoadingPlan(null) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 72px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>
            Simple pricing
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1, marginTop: '12px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Invest in your<br />
            <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>career growth.</em>
          </h1>
          <p style={{ fontSize: '16px', color: '#6B5E4E', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Credits never expire. One interview session uses 50 credits. Start free, upgrade when you're ready.
          </p>

          {userData && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '8px 16px', background: 'var(--amber-pale)', borderRadius: '20px', border: '1px solid rgba(200,135,58,0.25)' }}>
              <FiZap size={13} style={{ color: 'var(--amber)' }} />
              <span style={{ fontSize: '13px', color: '#8B5E20', fontWeight: 500 }}>
                You have <strong>{userData.credits}</strong> credits remaining ({Math.floor(userData.credits / 50)} interview{Math.floor(userData.credits / 50) !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {billingNote && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px', padding: '12px 24px', background: '#F0F6EE', border: '1px solid rgba(74,103,65,0.2)', borderRadius: '6px', display: 'inline-block' }}>
              <p style={{ color: 'var(--sage)', fontSize: '14px', fontWeight: 600 }}>{billingNote}</p>
            </motion.div>
          )}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '64px' }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: plan.id === 'pro' ? 'var(--ink)' : 'var(--white)',
                border: plan.id === 'pro' ? '2px solid var(--amber)' : '1px solid var(--sand-light)',
                borderRadius: '12px',
                padding: '32px',
                position: 'relative',
                boxShadow: plan.id === 'pro' ? '0 20px 60px rgba(26,22,18,0.25)' : 'var(--shadow-warm)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-12px', right: '24px', padding: '4px 14px', background: 'var(--amber)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: plan.id === 'pro' ? 'rgba(245,240,232,0.5)' : '#9E8E78', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', fontWeight: 900, color: plan.id === 'pro' ? 'var(--cream)' : 'var(--ink)', lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.priceNum > 0 && <span style={{ fontSize: '13px', color: plan.id === 'pro' ? 'rgba(245,240,232,0.5)' : '#9E8E78' }}>one-time</span>}
                </div>
                <p style={{ fontSize: '13px', color: plan.id === 'pro' ? 'rgba(245,240,232,0.6)' : '#6B5E4E', lineHeight: 1.6 }}>
                  {plan.description}
                </p>
              </div>

              {/* Credits highlight */}
              <div style={{ padding: '14px 16px', background: plan.id === 'pro' ? 'rgba(200,135,58,0.15)' : 'var(--cream)', borderRadius: '8px', border: `1px solid ${plan.id === 'pro' ? 'rgba(200,135,58,0.3)' : 'var(--sand-light)'}`, marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: plan.id === 'pro' ? 'rgba(245,240,232,0.7)' : '#6B5E4E' }}>Credits included</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: plan.id === 'pro' ? 'var(--amber)' : 'var(--ink)' }}>{plan.credits}</span>
                  <p style={{ fontSize: '10px', color: plan.id === 'pro' ? 'rgba(245,240,232,0.4)' : '#9E8E78', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>~{plan.sessions} sessions</p>
                </div>
              </div>

              {/* Feature list */}
              <div style={{ flex: 1, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {features.slice(0, 5).map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: plan.features[j] ? (plan.id === 'pro' ? 'rgba(245,240,232,0.85)' : 'var(--ink-soft)') : (plan.id === 'pro' ? 'rgba(245,240,232,0.25)' : '#C4B8A8') }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: plan.features[j] ? (plan.id === 'pro' ? 'rgba(74,103,65,0.3)' : 'rgba(74,103,65,0.1)') : 'transparent', border: `1px solid ${plan.features[j] ? 'rgba(74,103,65,0.3)' : 'var(--sand)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {plan.features[j] && <FiCheck size={10} style={{ color: plan.id === 'pro' ? '#7AB870' : 'var(--sage)' }} />}
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.isDefault ? null : handlePayment(plan)}
                disabled={plan.isDefault || loadingPlan === plan.id}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: plan.isDefault ? 'transparent' : plan.id === 'pro' ? 'var(--amber)' : 'var(--ink)',
                  color: plan.isDefault ? (plan.id === 'pro' ? 'rgba(245,240,232,0.5)' : '#9E8E78') : 'white',
                  border: plan.isDefault ? `1px solid ${plan.id === 'pro' ? 'rgba(245,240,232,0.15)' : 'var(--sand)'}` : 'none',
                  borderRadius: '6px',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px',
                  cursor: plan.isDefault ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                  opacity: plan.isDefault ? 0.6 : 1,
                }}
              >
                {loadingPlan === plan.id ? (
                  <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                ) : (
                  <>{plan.cta} {!plan.isDefault && <BsArrowRight size={14} />}</>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--sand-light)', overflow: 'hidden', boxShadow: 'var(--shadow-warm)' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--sand-light)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Feature comparison
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream)' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#9E8E78', letterSpacing: '0.08em', fontWeight: 500, borderBottom: '1px solid var(--sand-light)' }}>FEATURE</th>
                  {plans.map(p => (
                    <th key={p.id} style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '14px', color: 'var(--ink)', borderBottom: '1px solid var(--sand-light)', fontWeight: 700, minWidth: '100px' }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, fi) => (
                  <tr key={fi} style={{ borderBottom: '1px solid var(--sand-light)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 24px', fontSize: '13.5px', color: 'var(--ink-soft)' }}>{feature}</td>
                    {plans.map(p => (
                      <td key={p.id} style={{ padding: '12px 20px', textAlign: 'center' }}>
                        {p.features[fi] ? (
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(74,103,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiCheck size={12} style={{ color: 'var(--sage)' }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--sand)', fontSize: '18px' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ-style reassurance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '40px' }}>
          {[
            { q: 'Do credits expire?', a: 'No. Credits you purchase never expire. Use them at your own pace.' },
            { q: 'Can I try before buying?', a: 'Yes. You start with 100 free credits — enough for 2 full interview sessions.' },
            { q: 'How is payment handled?', a: 'Payments are processed securely through Razorpay. Your card details are never stored.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '20px 24px', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--sand-light)' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>{item.q}</p>
              <p style={{ fontSize: '13px', color: '#6B5E4E', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Pricing
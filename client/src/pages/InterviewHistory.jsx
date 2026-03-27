import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { FiArrowLeft, FiSearch, FiFilter, FiClock, FiAward } from 'react-icons/fi'
import { BsArrowRight } from 'react-icons/bs'
import { motion } from 'motion/react'
import Navbar from '../components/Navbar.jsx'

function InterviewHistory() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const navigate = useNavigate()

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true })
        setInterviews(result.data)
      } catch (error) { console.log(error) }
      finally { setLoading(false) }
    }
    getMyInterviews()
  }, [])

  const filtered = useMemo(() => {
    let list = [...interviews]
    if (search.trim()) list = list.filter(i => i.role.toLowerCase().includes(search.toLowerCase()))
    if (filterMode !== 'all') list = list.filter(i => i.mode === filterMode)
    if (filterStatus !== 'all') list = list.filter(i => i.status === filterStatus)
    if (sortBy === 'score') list.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    else if (sortBy === 'score-asc') list.sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0))
    return list
  }, [interviews, search, filterMode, filterStatus, sortBy])

  const avgScore = interviews.length ? (interviews.reduce((s, i) => s + (i.finalScore || 0), 0) / interviews.length).toFixed(1) : 0
  const completed = interviews.filter(i => i.status === 'completed').length
  const bestScore = interviews.length ? Math.max(...interviews.map(i => i.finalScore || 0)) : 0

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--sage)'
    if (score >= 6) return 'var(--amber)'
    if (score >= 4) return '#8B5E20'
    return 'var(--rust)'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          <div>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>
              Your sessions
            </span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1, marginTop: '8px', letterSpacing: '-0.02em' }}>
              Interview History
            </h1>
          </div>
          <button className="btn-primary" onClick={() => navigate('/interview')}>
            New interview <BsArrowRight size={14} />
          </button>
        </div>

        {/* Stats strip */}
        {interviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { icon: <FiAward size={16} />, label: 'Total sessions', value: interviews.length },
              { icon: <FiAward size={16} />, label: 'Completed', value: completed },
              { icon: <FiAward size={16} />, label: 'Avg score', value: `${avgScore}/10` },
              { icon: <FiAward size={16} />, label: 'Best score', value: `${bestScore}/10` },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ padding: '20px', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--sand-light)', boxShadow: 'var(--shadow-warm)' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#9E8E78', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
            <FiSearch size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9E8E78' }} />
            <input className="field" style={{ paddingLeft: '34px' }} placeholder="Search by role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { val: 'all', label: 'All modes' },
              { val: 'Technical', label: 'Technical' },
              { val: 'HR', label: 'HR' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilterMode(f.val)}
                style={{ padding: '8px 14px', background: filterMode === f.val ? 'var(--ink)' : 'var(--white)', border: `1px solid ${filterMode === f.val ? 'var(--ink)' : 'var(--sand)'}`, borderRadius: '4px', fontSize: '12px', fontFamily: 'DM Mono, monospace', color: filterMode === f.val ? 'var(--cream)' : '#9E8E78', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>

          <select className="field" style={{ width: 'auto', paddingRight: '32px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort by date</option>
            <option value="score">Highest score</option>
            <option value="score-asc">Lowest score</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer" style={{ height: '88px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--sand-light)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid var(--sand)' }}>
              <FiSearch size={22} style={{ color: '#9E8E78' }} />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              {interviews.length === 0 ? 'No interviews yet' : 'No results found'}
            </h3>
            <p style={{ fontSize: '14px', color: '#9E8E78', lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>
              {interviews.length === 0 ? 'Start your first AI-powered mock interview session.' : 'Try adjusting your search or filters.'}
            </p>
            {interviews.length === 0 && (
              <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/interview')}>
                Start your first interview
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                onClick={() => navigate(`/report/${item._id}`)}
                className="card card-hover"
                style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}
              >
                {/* Score circle */}
                <div style={{ width: '52px', height: '52px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--sand-light)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={getScoreColor(item.finalScore || 0)} strokeWidth="2.5"
                      strokeDasharray={`${((item.finalScore || 0) / 10) * 100} 100`} strokeLinecap="round" />
                    <text x="18" y="20.5" textAnchor="middle" fill="var(--ink)" fontSize="10" fontWeight="700" fontFamily="Playfair Display" style={{ transform: 'rotate(90deg)', transformOrigin: '18px 18px' }}>
                      {item.finalScore || 0}
                    </text>
                  </svg>
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                    {item.role}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '2px 8px', background: item.mode === 'Technical' ? 'rgba(200,135,58,0.1)' : 'rgba(74,103,65,0.1)', border: `1px solid ${item.mode === 'Technical' ? 'rgba(200,135,58,0.2)' : 'rgba(74,103,65,0.15)'}`, borderRadius: '2px', fontSize: '10px', fontFamily: 'DM Mono, monospace', color: item.mode === 'Technical' ? 'var(--amber)' : 'var(--sage)', letterSpacing: '0.06em' }}>
                      {item.mode}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9E8E78' }}>{item.experience}</span>
                  </div>
                </div>

                {/* Date + status */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                    <FiClock size={11} style={{ color: '#9E8E78' }} />
                    <span style={{ fontSize: '12px', color: '#9E8E78', fontFamily: 'DM Mono, monospace' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: item.status === 'completed' ? '#F0F6EE' : 'var(--amber-pale)',
                    color: item.status === 'completed' ? 'var(--sage)' : '#8B5E20',
                    border: `1px solid ${item.status === 'completed' ? 'rgba(74,103,65,0.2)' : 'rgba(200,135,58,0.2)'}`,
                  }}>
                    {item.status}
                  </span>
                </div>

                <BsArrowRight size={16} style={{ color: 'var(--sand)', flexShrink: 0 }} />
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9E8E78', marginTop: '24px', fontFamily: 'DM Mono, monospace' }}>
            Showing {filtered.length} of {interviews.length} sessions
          </p>
        )}
      </div>
    </div>
  )
}

export default InterviewHistory
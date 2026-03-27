import React, { useState } from 'react'
import { FiArrowLeft, FiDownload, FiTrendingUp, FiAward, FiMessageSquare } from 'react-icons/fi'
import { BsCheckCircle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: '6px', padding: '10px 14px', boxShadow: 'var(--shadow-warm)' }}>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#9E8E78', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: 'var(--amber)' }}>{payload[0].value}<span style={{ fontSize: '12px', color: '#9E8E78' }}>/10</span></p>
      </div>
    )
  }
  return null
}

function Step3Report({ report }) {
  const navigate = useNavigate()
  const [expandedQ, setExpandedQ] = useState(null)

  if (!report) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--sand)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#9E8E78', letterSpacing: '0.08em' }}>LOADING REPORT</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const { finalScore = 0, confidence = 0, communication = 0, correctness = 0, questionWiseScore = [] } = report

  const chartData = questionWiseScore.map((score, i) => ({ name: `Q${i + 1}`, score: score.score || 0 }))

  const getVerdict = (score) => {
    if (score >= 8) return { label: 'Excellent', color: 'var(--sage)', bg: '#F0F6EE', border: 'rgba(74,103,65,0.2)' }
    if (score >= 6) return { label: 'Good', color: 'var(--amber)', bg: 'var(--amber-pale)', border: 'rgba(200,135,58,0.25)' }
    if (score >= 4) return { label: 'Fair', color: '#8B5E20', bg: 'var(--cream)', border: 'var(--sand)' }
    return { label: 'Needs Work', color: 'var(--rust)', bg: '#FFF0ED', border: 'rgba(168,75,47,0.2)' }
  }

  const verdict = getVerdict(finalScore)

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 25
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(34, 197, 94)
    doc.text("AI Interview Performance Report", pageWidth / 2, y, { align: "center" })
    y += 12
    doc.setDrawColor(34, 197, 94); doc.line(margin, y, pageWidth - margin, y)
    y += 14
    doc.setFillColor(240, 253, 244); doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 4, 4, "F")
    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, y + 13, { align: "center" })
    y += 30
    doc.setFillColor(249, 250, 251); doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, "F")
    doc.setFontSize(12); doc.text(`Confidence: ${confidence}`, margin + 10, y + 10); doc.text(`Communication: ${communication}`, margin + 10, y + 18); doc.text(`Correctness: ${correctness}`, margin + 10, y + 26)
    y += 45
    autoTable(doc, { startY: y, margin: { left: margin, right: margin }, head: [["#", "Question", "Score", "Feedback"]], body: questionWiseScore.map((q, i) => [`${i + 1}`, q.question, `${q.score}/10`, q.feedback]), styles: { fontSize: 9, cellPadding: 5 }, headStyles: { fillColor: [200, 135, 58], textColor: 255 }, columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 55 }, 2: { cellWidth: 20 }, 3: { cellWidth: "auto" } } })
    doc.save("AI_Interview_Report.pdf")
  }

  const skills = [
    { label: 'Confidence', val: confidence, icon: <FiAward size={14} />, color: 'var(--amber)' },
    { label: 'Communication', val: communication, icon: <FiMessageSquare size={14} />, color: 'var(--sage)' },
    { label: 'Correctness', val: correctness, icon: <BsCheckCircle size={14} />, color: '#8B5E20' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--ink)', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate("/history")}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(245,240,232,0.65)', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.65)'}
        >
          <FiArrowLeft size={14} /> Back to history
        </button>
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '15px', color: 'var(--cream)' }}>
          InterviewIQ<span style={{ color: 'var(--amber)' }}>.AI</span>
        </span>
        <button onClick={downloadPDF} className="btn-amber" style={{ padding: '8px 16px', fontSize: '12px' }}>
          <FiDownload size={13} /> Export PDF
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>
            Session complete
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1, marginTop: '8px', letterSpacing: '-0.02em' }}>
            Interview Analytics
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

          {/* Score card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: '#9E8E78', textTransform: 'uppercase', marginBottom: '24px' }}>Overall Score</p>
            <div style={{ width: '120px', margin: '0 auto 24px' }}>
              <CircularProgressbar
                value={(finalScore / 10) * 100}
                text={`${finalScore}`}
                styles={buildStyles({ textSize: '28px', pathColor: verdict.color, textColor: 'var(--ink)', trailColor: 'var(--sand-light)', strokeLinecap: 'round' })}
              />
            </div>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: verdict.bg, border: `1px solid ${verdict.border}`, borderRadius: '20px', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: verdict.color }}>{verdict.label}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#6B5E4E', lineHeight: 1.6 }}>
              {finalScore >= 8 ? "Outstanding performance — you're job-ready." : finalScore >= 6 ? "Solid foundation — a few areas to polish." : finalScore >= 4 ? "Decent start — focused practice will help." : "Keep working at it — consistency builds confidence."}
            </p>
          </motion.div>

          {/* Skill bars */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="card" style={{ padding: '32px' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: '#9E8E78', textTransform: 'uppercase', marginBottom: '24px' }}>Skill Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {skills.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: s.color, fontSize: '13px', fontWeight: 600 }}>
                      {s.icon} {s.label}
                    </div>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: s.color }}>
                      {s.val}<span style={{ fontSize: '12px', color: '#9E8E78' }}>/10</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--sand-light)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.val * 10}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', background: s.color, borderRadius: '3px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trend chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="card" style={{ padding: '32px', gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: '#9E8E78', textTransform: 'uppercase' }}>Score Trend</p>
              <FiTrendingUp size={14} style={{ color: 'var(--amber)' }} />
            </div>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sand-light)" />
                  <XAxis dataKey="name" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10, fill: '#9E8E78' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10, fill: '#9E8E78' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="var(--amber)" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: 'var(--amber)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--ink)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Question breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="divider" />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              Question by question
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questionWiseScore.map((q, i) => {
              const qVerdict = getVerdict(q.score || 0)
              const isOpen = expandedQ === i
              return (
                <div key={i} className="card" style={{ overflow: 'hidden', transition: 'all 0.3s' }}>
                  <button onClick={() => setExpandedQ(isOpen ? null : i)}
                    style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, background: qVerdict.bg, border: `1px solid ${qVerdict.border}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 600, color: qVerdict.color }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isOpen ? 'normal' : 'nowrap' }}>
                        {q.question || 'Question not available'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9E8E78', fontFamily: 'DM Mono, monospace' }}>
                        {qVerdict.label} · {q.score || 0}/10
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <div style={{ width: '48px', height: '48px' }}>
                        <CircularProgressbar value={((q.score || 0) / 10) * 100} text={`${q.score || 0}`}
                          styles={buildStyles({ textSize: '30px', pathColor: qVerdict.color, textColor: 'var(--ink)', trailColor: 'var(--sand-light)', strokeLinecap: 'round' })} />
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                        <FiArrowLeft size={10} style={{ transform: 'rotate(180deg)', color: '#9E8E78' }} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--sand-light)', paddingTop: '16px' }}>
                          <div style={{ padding: '14px 16px', background: '#F0F6EE', borderLeft: '3px solid var(--sage)', borderRadius: '0 6px 6px 0' }}>
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.1em', marginBottom: '6px' }}>AI FEEDBACK</p>
                            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.7, fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                              "{q.feedback || 'No feedback available.'}"
                            </p>
                          </div>
                          {(q.confidence || q.communication || q.correctness) && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                              {[
                                { l: 'Confidence', v: q.confidence },
                                { l: 'Communication', v: q.communication },
                                { l: 'Correctness', v: q.correctness },
                              ].map((s, j) => (
                                <div key={j} style={{ flex: 1, padding: '10px 12px', background: 'var(--cream)', borderRadius: '6px', border: '1px solid var(--sand-light)', textAlign: 'center' }}>
                                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: 'var(--amber)' }}>{s.v || 0}</div>
                                  <div style={{ fontSize: '10px', color: '#9E8E78', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>{s.l}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/interview')}>
            Start another interview
          </button>
          <button className="btn-ghost" onClick={downloadPDF}>
            <FiDownload size={14} /> Download PDF report
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Step3Report
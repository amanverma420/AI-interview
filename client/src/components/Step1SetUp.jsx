import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { FiUpload, FiUser, FiBriefcase, FiCpu, FiUsers, FiVideo, FiVideoOff, FiChevronRight, FiCheck } from "react-icons/fi"
import { BsArrowRight } from "react-icons/bs"
import axios from "axios"
import { ServerUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")
  const [mode, setMode] = useState("Technical")
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState("")
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saveRecording, setSaveRecording] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const suggestedRoles = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'UX Designer']
  const expLevels = ['0–1 year', '1–3 years', '3–5 years', '5+ years']

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return
    setAnalyzing(true)
    const formdata = new FormData()
    formdata.append("resume", resumeFile)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })
      setRole(result.data.role || "")
      setExperience(result.data.experience || "")
      setProjects(result.data.projects || [])
      setSkills(result.data.skills || [])
      setResumeText(result.data.resumeText || "")
      setAnalysisDone(true)
    } catch (error) { console.log(error) }
    finally { setAnalyzing(false) }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions", {
        role, experience, mode, resumeText, projects, skills
      }, { withCredentials: true })
      if (userData) dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      setLoading(false)
      onStart({ ...result.data, saveRecording })
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') setResumeFile(file)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--ink)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--amber)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="0.5" y="0.5" width="4" height="4" rx="0.6" fill="var(--cream)" />
              <rect x="7.5" y="0.5" width="4" height="4" rx="0.6" fill="var(--cream)" opacity="0.5" />
              <rect x="0.5" y="7.5" width="4" height="4" rx="0.6" fill="var(--cream)" opacity="0.3" />
              <rect x="7.5" y="7.5" width="4" height="4" rx="0.6" fill="var(--cream)" opacity="0.7" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '15px', color: 'var(--cream)' }}>
            InterviewIQ<span style={{ color: 'var(--amber)' }}>.AI</span>
          </span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', animation: 'pulse-ring 2s ease-out infinite' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.08em' }}>SETUP SESSION</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', gap: '48px', flexWrap: 'wrap' }}>

        {/* LEFT — Info panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '340px', flexShrink: 0 }}
          className="hidden lg:block"
        >
          <div style={{ position: 'sticky', top: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', textTransform: 'uppercase' }}>
                What happens next
              </span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: 'var(--ink)', marginTop: '10px', lineHeight: 1.2 }}>
                Your interview<br />
                <em style={{ fontStyle: 'italic' }}>starts in minutes.</em>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { icon: <FiUser size={14} />, label: 'Role-based questions', desc: 'Tailored to your target position and seniority level' },
                { icon: <FiBriefcase size={14} />, label: 'Resume intelligence', desc: 'We read your PDF and generate project-specific questions' },
                { icon: <FiCpu size={14} />, label: 'Live AI evaluation', desc: 'Scored in real-time on 3 dimensions after each answer' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', padding: '20px 0', borderBottom: i < 2 ? '1px solid var(--sand-light)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--amber-pale)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', flexShrink: 0, border: '1px solid rgba(200,135,58,0.2)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>{item.label}</p>
                    <p style={{ fontSize: '12.5px', color: '#9E8E78', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {userData && (
              <div style={{ marginTop: '28px', padding: '16px 20px', background: 'var(--amber-pale)', borderRadius: '8px', border: '1px solid rgba(200,135,58,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#8B5E20', fontWeight: 500 }}>Credits remaining</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, color: '#8B5E20' }}>{userData.credits}</span>
                </div>
                <div style={{ marginTop: '8px', height: '4px', background: 'rgba(200,135,58,0.15)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${Math.min((userData.credits / 200) * 100, 100)}%`, background: 'var(--amber)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ fontSize: '11px', color: '#B8762A', marginTop: '6px', fontFamily: 'DM Mono, monospace' }}>50 credits used per interview session</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT — Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ width: '100%', maxWidth: '560px' }}
        >
          <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--sand-light)', boxShadow: 'var(--shadow-warm)', overflow: 'hidden' }}>

            {/* Form header */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--sand-light)', background: 'var(--cream)' }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                Interview Setup
              </h1>
              <p style={{ fontSize: '13.5px', color: '#9E8E78' }}>Configure your session before we begin</p>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Role */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px', letterSpacing: '0.01em' }}>
                  Target role <span style={{ color: 'var(--amber)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FiUser size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9E8E78' }} />
                  <input
                    type="text"
                    className="field"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. Frontend Developer"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  />
                </div>
                {/* Quick suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {suggestedRoles.slice(0, 4).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      style={{ padding: '4px 10px', background: role === r ? 'var(--amber-pale)' : 'var(--cream)', border: `1px solid ${role === r ? 'var(--amber)' : 'var(--sand)'}`, borderRadius: '3px', fontSize: '11px', color: role === r ? '#8B5E20' : '#9E8E78', cursor: 'pointer', fontFamily: 'DM Mono, monospace', transition: 'all 0.15s' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                  Experience level <span style={{ color: 'var(--amber)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {expLevels.map(lvl => (
                    <button key={lvl} onClick={() => setExperience(lvl)}
                      style={{ padding: '10px 8px', background: experience === lvl ? 'var(--ink)' : 'var(--cream)', border: `1.5px solid ${experience === lvl ? 'var(--ink)' : 'var(--sand)'}`, borderRadius: '6px', fontSize: '12px', color: experience === lvl ? 'var(--cream)' : '#9E8E78', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: experience === lvl ? 600 : 400, textAlign: 'center', transition: 'all 0.15s', lineHeight: 1.3 }}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                  Interview mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { val: 'Technical', icon: <FiCpu size={16} />, desc: 'Technical depth, system design, coding concepts' },
                    { val: 'HR', icon: <FiUsers size={16} />, desc: 'Behavioral, soft skills, culture fit questions' },
                  ].map(m => (
                    <button key={m.val} onClick={() => setMode(m.val)}
                      style={{ padding: '14px 16px', background: mode === m.val ? 'var(--ink)' : 'var(--cream)', border: `1.5px solid ${mode === m.val ? 'var(--ink)' : 'var(--sand)'}`, borderRadius: '8px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: mode === m.val ? 'var(--amber)' : '#9E8E78' }}>
                        {m.icon}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: mode === m.val ? 'var(--cream)' : 'var(--ink)' }}>{m.val}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: mode === m.val ? 'rgba(245,240,232,0.55)' : '#9E8E78', lineHeight: 1.4 }}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recording toggle */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={() => setSaveRecording(!saveRecording)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: saveRecording ? 'var(--cream)' : 'var(--cream)', border: `1.5px solid ${saveRecording ? 'var(--amber)' : 'var(--sand)'}`, borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: saveRecording ? 'var(--amber-pale)' : 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saveRecording ? 'var(--amber)' : '#9E8E78', flexShrink: 0, border: `1px solid ${saveRecording ? 'rgba(200,135,58,0.25)' : 'var(--sand)'}` }}>
                    {saveRecording ? <FiVideo size={15} /> : <FiVideoOff size={15} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Save interview recording</p>
                    <p style={{ fontSize: '11.5px', color: '#9E8E78', lineHeight: 1.4 }}>
                      {saveRecording ? 'Video will download to your device when session ends' : 'Camera on but not saved — enable to download afterward'}
                    </p>
                  </div>
                  {/* Toggle pill */}
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: saveRecording ? 'var(--amber)' : 'var(--sand)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '3px', left: saveRecording ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--white)', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                  </div>
                </button>
              </div>

              {/* Resume upload */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                  Resume <span style={{ color: '#9E8E78', fontWeight: 400 }}>(optional, PDF)</span>
                </label>

                <AnimatePresence mode="wait">
                  {!analysisDone ? (
                    <motion.div key="upload">
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('resumeInput').click()}
                        style={{
                          padding: '28px 24px',
                          border: `2px dashed ${dragOver ? 'var(--amber)' : resumeFile ? 'var(--sage)' : 'var(--sand)'}`,
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: dragOver ? 'var(--amber-pale)' : resumeFile ? '#F0F6EE' : 'var(--cream)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input type="file" accept="application/pdf" id="resumeInput" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
                        {resumeFile ? (
                          <div>
                            <div style={{ width: '36px', height: '36px', background: '#E8F0E5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--sage)' }}>
                              <FiCheck size={18} />
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)', marginBottom: '4px' }}>{resumeFile.name}</p>
                            <button
                              onClick={e => { e.stopPropagation(); handleUploadResume() }}
                              disabled={analyzing}
                              style={{ marginTop: '10px', padding: '8px 20px', background: 'var(--sage)', color: 'var(--white)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                            >
                              {analyzing ? 'Analyzing...' : 'Extract from resume →'}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FiUpload size={24} style={{ color: '#9E8E78', margin: '0 auto 10px' }} />
                            <p style={{ fontSize: '13px', color: '#9E8E78', marginBottom: '4px' }}>Drag & drop or click to upload</p>
                            <p style={{ fontSize: '11px', color: '#B8A898', fontFamily: 'DM Mono, monospace' }}>PDF only · max 5MB</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ padding: '20px', background: '#F0F6EE', borderRadius: '8px', border: '1.5px solid rgba(74,103,65,0.2)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <FiCheck size={14} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>Resume analyzed successfully</span>
                        <button onClick={() => { setAnalysisDone(false); setResumeFile(null) }} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '11px', color: 'var(--sage)', cursor: 'pointer', textDecoration: 'underline' }}>reset</button>
                      </div>
                      {skills.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--sage)', letterSpacing: '0.06em', marginBottom: '6px' }}>SKILLS DETECTED</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {skills.slice(0, 8).map((s, i) => (
                              <span key={i} style={{ padding: '3px 8px', background: 'rgba(74,103,65,0.1)', color: 'var(--sage)', border: '1px solid rgba(74,103,65,0.15)', borderRadius: '3px', fontSize: '11px', fontFamily: 'DM Mono, monospace' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {projects.length > 0 && (
                        <div>
                          <p style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--sage)', letterSpacing: '0.06em', marginBottom: '6px' }}>PROJECTS FOUND</p>
                          {projects.slice(0, 3).map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: '#4A6741', marginBottom: '3px' }}>
                              <FiChevronRight size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                              {p}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <button
                onClick={handleStart}
                disabled={!role || !experience || loading}
                style={{
                  width: '100%',
                  padding: '15px 28px',
                  background: role && experience ? 'var(--ink)' : 'var(--sand)',
                  color: role && experience ? 'var(--cream)' : '#9E8E78',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: role && experience && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => { if (role && experience && !loading) e.currentTarget.style.background = 'var(--ink-soft)' }}
                onMouseLeave={e => { if (role && experience && !loading) e.currentTarget.style.background = 'var(--ink)' }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(245,240,232,0.3)', borderTopColor: 'var(--cream)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Generating questions...
                  </>
                ) : (
                  <>
                    Begin interview <BsArrowRight size={16} />
                  </>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#9E8E78', marginTop: '12px', fontFamily: 'DM Mono, monospace' }}>
                Uses 50 credits · {userData?.credits || 0} remaining
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(200,135,58,0.4); } 100% { box-shadow: 0 0 0 8px rgba(200,135,58,0); } }`}</style>
    </div>
  )
}

export default Step1SetUp
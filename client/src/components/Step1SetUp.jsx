import React from 'react'
import { motion } from "motion/react"
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saveRecording, setSaveRecording] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true)
    const formdata = new FormData()
    formdata.append("resume", resumeFile)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })
      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
    } catch (error) {
      console.log(error)
    } finally {
      setAnalyzing(false);
    }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions", {
        role, experience, mode, resumeText, projects, skills
      }, { withCredentials: true })
      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      }
      setLoading(false)
      onStart({ ...result.data, saveRecording })
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen flex items-center justify-center px-4 py-10'
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d1f17 50%, #0f172a 100%)' }}
    >
      {/* grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

      <div className='w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60'>

        {/* LEFT */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className='relative flex flex-col justify-between p-10 overflow-hidden'
          style={{ background: 'linear-gradient(145deg, #064e35 0%, #0a3d28 60%, #052e1e 100%)' }}
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />

          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
                <HiSparkles size={14} className="text-emerald-400" />
              </div>
              <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">InterviewIQ.AI</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Your AI Interview<br />
              <span className="text-emerald-400">Starts Here</span>
            </h2>
            <p className="text-emerald-200/60 text-sm leading-relaxed mb-10">
              Practice real interview scenarios with adaptive AI. Build confidence, sharpen communication, and track your growth.
            </p>

            <div className='space-y-4'>
              {[
                { icon: <FaUserTie className="text-emerald-400" />, label: "Role-based questions", desc: "Tailored to your experience level" },
                { icon: <FaMicrophoneAlt className="text-emerald-400" />, label: "Voice + Camera Interview", desc: "Speak naturally, just like the real thing" },
                { icon: <FaChartLine className="text-emerald-400" />, label: "Performance Analytics", desc: "Detailed scores and improvement tips" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className='flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4'
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-10 flex flex-col gap-5 overflow-y-auto"
          style={{ background: '#0f1923' }}
        >
          <div>
            <h3 className='text-2xl font-bold text-white mb-1' style={{ fontFamily: "'Georgia', serif" }}>
              Interview Setup
            </h3>
            <p className="text-slate-500 text-sm">Configure your session before we begin</p>
          </div>

          {/* Role */}
          <div className='relative'>
            <FaUserTie className='absolute top-1/2 left-4 -translate-y-1/2 text-slate-500' size={13} />
            <input
              type='text'
              placeholder='Job role (e.g. Frontend Developer)'
              className='w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:border-emerald-500/60 focus:bg-white/8 outline-none transition text-sm'
              onChange={(e) => setRole(e.target.value)}
              value={role}
            />
          </div>

          {/* Experience */}
          <div className='relative'>
            <FaBriefcase className='absolute top-1/2 left-4 -translate-y-1/2 text-slate-500' size={13} />
            <input
              type='text'
              placeholder='Experience (e.g. 2 years)'
              className='w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:border-emerald-500/60 focus:bg-white/8 outline-none transition text-sm'
              onChange={(e) => setExperience(e.target.value)}
              value={experience}
            />
          </div>

          {/* Mode */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className='w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-500/60 outline-none transition text-sm cursor-pointer'
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', appearance: 'none' }}
          >
            <option value="Technical" style={{ background: '#0f1923' }}>Technical Interview</option>
            <option value="HR" style={{ background: '#0f1923' }}>HR Interview</option>
          </select>

          {/* ── RECORDING TOGGLE ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setSaveRecording(!saveRecording)}
            className={`cursor-pointer flex items-center gap-4 border rounded-2xl p-4 transition-all duration-200 select-none ${
              saveRecording
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${saveRecording ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
              {saveRecording
                ? <FaVideo className="text-emerald-400" size={15} />
                : <FaVideoSlash className="text-slate-500" size={15} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold transition-colors ${saveRecording ? 'text-emerald-400' : 'text-slate-300'}`}>
                Save Interview Recording
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {saveRecording
                  ? "Video will be downloaded to your device when interview ends"
                  : "Camera on but not saved — enable to download after interview"
                }
              </p>
            </div>
            {/* toggle pill */}
            <div className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 ${saveRecording ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <motion.div
                animate={{ x: saveRecording ? 20 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-md"
              />
            </div>
          </motion.div>

          {/* Resume Upload */}
          {!analysisDone ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => document.getElementById("resumeUpload").click()}
              className='border border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-200'
            >
              <FaFileUpload className='text-2xl mx-auto text-slate-600 mb-2' />
              <input
                type="file"
                accept="application/pdf"
                id="resumeUpload"
                className='hidden'
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              <p className='text-slate-500 text-sm'>
                {resumeFile ? resumeFile.name : "Upload resume PDF (optional)"}
              </p>
              {resumeFile && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleUploadResume(); }}
                  className='mt-3 bg-white/8 hover:bg-white/12 text-white text-xs px-5 py-2 rounded-lg transition border border-white/10'
                >
                  {analyzing ? "Analyzing…" : "Analyze Resume"}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4 space-y-3'
            >
              <p className='text-sm font-semibold text-emerald-400'>✓ Resume Analyzed</p>
              {projects.length > 0 && (
                <div>
                  <p className='text-[10px] text-slate-500 mb-1.5 uppercase tracking-widest'>Projects</p>
                  <ul className='text-slate-300 text-xs space-y-1'>
                    {projects.map((p, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">›</span>{p}</li>)}
                  </ul>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <p className='text-[10px] text-slate-500 mb-1.5 uppercase tracking-widest'>Skills</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {skills.map((s, i) => (
                      <span key={i} className='bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px]'>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Start */}
          <motion.button
            onClick={handleStart}
            disabled={!role || !experience || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='w-full disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-900/40 text-sm tracking-wide mt-auto'
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeLinecap="round" />
                </svg>
                Preparing Interview…
              </span>
            ) : "Start Interview →"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Step1SetUp
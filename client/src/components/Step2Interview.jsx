import React, { useState, useRef, useEffect, useCallback } from 'react'
import Timer from './Timer'
import { motion, AnimatePresence } from "motion/react"
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiSend, FiChevronRight } from "react-icons/fi"
import { BsArrowRight } from 'react-icons/bs'
import { HiSpeakerWave } from 'react-icons/hi2'
import axios from "axios"
import { ServerUrl } from '../App'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, saveRecording = false } = interviewData

  const [isIntroPhase, setIsIntroPhase]     = useState(true)
  const [isMicOn, setIsMicOn]               = useState(false)
  const [isCamOn, setIsCamOn]               = useState(true)
  const [isAISpeaking, setIsAISpeaking]     = useState(false)
  const [currentIndex, setCurrentIndex]     = useState(0)
  const [answer, setAnswer]                 = useState("")
  const [feedback, setFeedback]             = useState("")
  const [timeLeft, setTimeLeft]             = useState(questions[0]?.timeLimit || 60)
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [subtitle, setSubtitle]             = useState("")
  const [waveActive, setWaveActive]         = useState(false)
  const [selectedVoice, setSelectedVoice]   = useState(null)
  const [voiceReady, setVoiceReady]         = useState(false)
  const [micError, setMicError]             = useState("")
  const [interimText, setInterimText]       = useState("")
  const [recordingSaved, setRecordingSaved] = useState(false)

  const videoRef            = useRef(null)
  const cameraStreamRef     = useRef(null)
  const mediaRecorderRef    = useRef(null)
  const recordedChunks      = useRef([])
  const recognitionRef      = useRef(null)
  const recognitionActive   = useRef(false)
  const aiSpeakingRef       = useRef(false)
  const isMicOnRef          = useRef(false)
  const answerRef           = useRef("")
  const timerRef            = useRef(null)
  const currentIndexRef     = useRef(0)
  const submittedRef        = useRef(false)

  useEffect(() => { answerRef.current = answer }, [answer])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: true })
      cameraStreamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}) }
      if (saveRecording) {
        recordedChunks.current = []
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : ''
        try {
          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
          recorder.ondataavailable = (e) => { if (e.data?.size > 0) recordedChunks.current.push(e.data) }
          recorder.start(500)
          mediaRecorderRef.current = recorder
        } catch { const recorder = new MediaRecorder(stream); recorder.ondataavailable = (e) => { if (e.data?.size > 0) recordedChunks.current.push(e.data) }; recorder.start(500); mediaRecorderRef.current = recorder }
      }
      setIsCamOn(true)
    } catch (err) {
      try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); cameraStreamRef.current = s; if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}) }; setIsCamOn(true) } catch { setIsCamOn(false) }
    }
  }, [saveRecording])

  const stopCameraAndSave = useCallback(() => {
    const finishStop = () => { cameraStreamRef.current?.getTracks().forEach(t => t.stop()); cameraStreamRef.current = null }
    const recorder = mediaRecorderRef.current
    if (saveRecording && recorder && recorder.state !== 'inactive') {
      recorder.requestData()
      recorder.onstop = () => {
        const chunks = recordedChunks.current
        if (chunks.length > 0) {
          const mime = recorder.mimeType || 'video/webm'; const ext = mime.includes('mp4') ? 'mp4' : 'webm'
          const blob = new Blob(chunks, { type: mime }); const url = URL.createObjectURL(blob)
          const a = Object.assign(document.createElement('a'), { href: url, download: `interview-${Date.now()}.${ext}` })
          document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 1000)
          setRecordingSaved(true)
        }
        finishStop()
      }
      recorder.stop()
    } else { finishStop() }
  }, [saveRecording])

  useEffect(() => { startCamera(); return () => { cameraStreamRef.current?.getTracks().forEach(t => t.stop()) } }, [])

  const toggleCamera = () => {
    if (isCamOn) { cameraStreamRef.current?.getTracks().forEach(t => t.stop()); cameraStreamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; setIsCamOn(false) }
    else startCamera()
  }

  useEffect(() => {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices(); if (!voices.length) return
      const priority = ['Samantha','Karen','Moira','Google US English','Microsoft Aria Online','Microsoft Jenny Online']
      let chosen = null
      for (const name of priority) { const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en')); if (v) { chosen = v; break } }
      if (!chosen) chosen = voices.find(v => v.lang.startsWith('en-US')) || voices[0]
      setSelectedVoice(chosen); setVoiceReady(true)
    }
    if (window.speechSynthesis.getVoices().length > 0) pick()
    else { window.speechSynthesis.onvoiceschanged = pick; setTimeout(pick, 600) }
  }, [])

  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text?.trim()) { resolve(); return }
      window.speechSynthesis.cancel(); stopRecognitionInternal()
      const utt = new SpeechSynthesisUtterance(text)
      if (selectedVoice) utt.voice = selectedVoice
      utt.rate = 0.94; utt.pitch = 1.0; utt.volume = 1.0
      utt.onstart = () => { setIsAISpeaking(true); aiSpeakingRef.current = true; setWaveActive(true); setSubtitle(text) }
      const done = () => { setIsAISpeaking(false); aiSpeakingRef.current = false; setWaveActive(false); setTimeout(() => setSubtitle(""), 600); resolve() }
      utt.onend = done; utt.onerror = done
      setTimeout(() => window.speechSynthesis.resume(), 100); window.speechSynthesis.speak(utt)
    })
  }, [selectedVoice])

  const stopRecognitionInternal = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.abort() } catch {} recognitionRef.current = null }
    recognitionActive.current = false; setInterimText('')
  }, [])

  const startRecognition = useCallback(() => {
    if (aiSpeakingRef.current || recognitionActive.current || !isMicOnRef.current) return
    const SpeechRec = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRec) { setMicError("Speech recognition not supported. Please use Chrome or Edge."); return }
    const rec = new SpeechRec(); rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1
    recognitionRef.current = rec
    rec.onstart = () => { recognitionActive.current = true; setMicError("") }
    rec.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) final += t + ' '; else interim += t }
      if (final.trim()) { setAnswer(prev => { const u = (prev.trim() + ' ' + final.trim()).trim() + ' '; answerRef.current = u; return u }); setInterimText('') }
      else setInterimText(interim)
    }
    rec.onend = () => { recognitionActive.current = false; recognitionRef.current = null; setInterimText(''); if (isMicOnRef.current && !aiSpeakingRef.current) setTimeout(() => { if (isMicOnRef.current && !aiSpeakingRef.current) startRecognition() }, 200) }
    rec.onerror = (e) => {
      recognitionActive.current = false; recognitionRef.current = null; setInterimText('')
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { setMicError("Microphone permission denied."); isMicOnRef.current = false; setIsMicOn(false); return }
      if (e.error === 'aborted') return
      if (isMicOnRef.current && !aiSpeakingRef.current) setTimeout(() => { if (isMicOnRef.current && !aiSpeakingRef.current) startRecognition() }, 400)
    }
    try { rec.start() } catch { recognitionActive.current = false; recognitionRef.current = null; setTimeout(() => { if (isMicOnRef.current && !aiSpeakingRef.current) startRecognition() }, 600) }
  }, [])

  const enableMic = useCallback(() => { isMicOnRef.current = true; setIsMicOn(true); setMicError(""); startRecognition() }, [startRecognition])
  const disableMic = useCallback(() => { isMicOnRef.current = false; setIsMicOn(false); stopRecognitionInternal() }, [stopRecognitionInternal])
  const toggleMic = useCallback(() => { if (isMicOnRef.current) disableMic(); else enableMic() }, [enableMic, disableMic])

  useEffect(() => { if (!isAISpeaking && isMicOn && !isIntroPhase) { const t = setTimeout(() => { if (!aiSpeakingRef.current && isMicOnRef.current && !recognitionActive.current) startRecognition() }, 400); return () => clearTimeout(t) } }, [isAISpeaking])

  useEffect(() => {
    if (!voiceReady) return
    const run = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, great to meet you. I hope you're feeling confident today.`)
        await new Promise(r => setTimeout(r, 350))
        await speakText("I'll ask you a few questions. Just answer naturally and take your time. Let's begin.")
        await new Promise(r => setTimeout(r, 500)); setIsIntroPhase(false)
      } else {
        const q = questions[currentIndex]; if (!q) return
        await new Promise(r => setTimeout(r, 400))
        if (currentIndex === questions.length - 1) { await speakText("Alright, here's the final question."); await new Promise(r => setTimeout(r, 250)) }
        await speakText(q.question); enableMic()
      }
    }; run()
  }, [voiceReady, isIntroPhase, currentIndex])

  useEffect(() => {
    if (isIntroPhase || !questions[currentIndex]) return
    const limit = questions[currentIndex].timeLimit || 60; setTimeLeft(limit)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0 }; return prev - 1 }) }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isIntroPhase, currentIndex])

  const timeLeftRef = useRef(timeLeft)
  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])

  useEffect(() => { if (!isIntroPhase && timeLeft === 0 && !isSubmitting && !feedback && !submittedRef.current) { submittedRef.current = true; submitAnswer() } }, [timeLeft])

  const submitAnswer = async () => {
    if (isSubmitting) return; disableMic(); setIsSubmitting(true); setInterimText('')
    const q = questions[currentIndexRef.current]
    try {
      const res = await axios.post(ServerUrl + "/api/interview/submit-answer", { interviewId, questionIndex: currentIndexRef.current, answer: answerRef.current, timeTaken: (q?.timeLimit || 60) - timeLeftRef.current }, { withCredentials: true })
      setFeedback(res.data.feedback); await speakText(res.data.feedback)
    } catch (err) { console.log(err) }
    finally { setIsSubmitting(false) }
  }

  const handleNext = async () => {
    submittedRef.current = false; setAnswer(""); answerRef.current = ""; setFeedback(""); setInterimText(""); disableMic()
    if (currentIndex + 1 >= questions.length) { finishInterview(); return }
    await speakText("Great. Let's move on to the next question."); setCurrentIndex(prev => prev + 1)
  }

  const finishInterview = async () => {
    disableMic(); if (timerRef.current) clearInterval(timerRef.current)
    window.speechSynthesis.cancel(); stopCameraAndSave()
    try { const res = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true }); onFinish(res.data) }
    catch (err) { console.log(err) }
  }

  useEffect(() => () => { isMicOnRef.current = false; stopRecognitionInternal(); window.speechSynthesis.cancel(); if (timerRef.current) clearInterval(timerRef.current); cameraStreamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  const currentQuestion = questions[currentIndex]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Session bar */}
      <div style={{ background: 'var(--ink)', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>
            InterviewIQ<span style={{ color: 'var(--amber)' }}>.AI</span>
          </span>
          <span style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.45)', letterSpacing: '0.08em' }}>
            {isIntroPhase ? 'INTRO' : `Q${currentIndex + 1} / ${questions.length}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saveRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(168,75,47,0.15)', border: '1px solid rgba(168,75,47,0.25)', borderRadius: '20px', padding: '3px 10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rust)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'rgba(168,75,47,0.9)', letterSpacing: '0.06em' }}>REC</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAISpeaking ? 'var(--amber)' : isMicOn ? '#4A6741' : 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'rgba(245,240,232,0.45)', letterSpacing: '0.08em' }}>
              {isAISpeaking ? 'AI SPEAKING' : isMicOn ? 'LISTENING' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main interview area */}
      <div style={{ flex: 1, display: 'flex', gap: '0', overflow: 'hidden' }} className="flex-col lg:flex-row">

        {/* LEFT PANEL */}
        <div style={{ width: '100%', maxWidth: '380px', flexShrink: 0, borderRight: '1px solid var(--sand-light)', background: 'var(--white)', display: 'flex', flexDirection: 'column', padding: '20px' }} className="hidden lg:flex">

          {/* Camera */}
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: 'var(--ink)', aspectRatio: '4/3', marginBottom: '16px' }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCamOn ? 1 : 0, transition: 'opacity 0.3s' }}
            />
            {!isCamOn && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,240,232,0.25)' }}>
                <FiVideoOff size={28} />
                <p style={{ fontSize: '11px', marginTop: '8px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>CAMERA OFF</p>
              </div>
            )}
            {/* You label */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '4px 10px', background: 'rgba(26,22,18,0.65)', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'rgba(245,240,232,0.7)', letterSpacing: '0.06em' }}>
                {userName || 'You'}
              </span>
            </div>
            {/* Mic indicator */}
            {isMicOn && !isAISpeaking && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', background: 'rgba(74,103,65,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <FiMic size={12} style={{ color: 'white' }} />
              </div>
            )}
          </div>

          {/* AI Speaking */}
          <AnimatePresence>
            {isAISpeaking && subtitle && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '14px 16px', background: 'var(--cream)', border: '1px solid var(--sand-light)', borderLeft: '3px solid var(--amber)', borderRadius: '0 6px 6px 0', marginBottom: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <HiSpeakerWave size={11} style={{ color: 'var(--amber)' }} />
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Interviewer</span>
                  {/* Wave bars */}
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', marginLeft: 'auto', height: '12px' }}>
                    {[5,9,7,11,6,9,5,8].map((h, i) => (
                      <div key={i} className="waveform-bar" style={{ height: `${h}px`, background: 'var(--amber)', animation: `float ${0.4 + i * 0.07}s ease-in-out infinite alternate` }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.6, fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                  "{subtitle}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer + stats */}
          <div style={{ flex: 1, padding: '16px', background: 'var(--cream)', borderRadius: '8px', border: '1px solid var(--sand-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>
            <div style={{ height: '1px', background: 'var(--sand-light)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--sand-light)' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, color: 'var(--amber)' }}>{currentIndex + 1}</div>
                <div style={{ fontSize: '10px', color: '#9E8E78', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Current</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--sand-light)' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 700, color: 'var(--ink-soft)' }}>{questions.length}</div>
                <div style={{ fontSize: '10px', color: '#9E8E78', fontFamily: 'DM Mono, monospace', marginTop: '2px' }}>Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'auto' }}>

          {/* Intro state */}
          {isIntroPhase && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--amber-pale)', border: '2px solid rgba(200,135,58,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiSpeakerWave size={26} style={{ color: 'var(--amber)' }} />
              </motion.div>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  Preparing your session
                </h3>
                <p style={{ fontSize: '14px', color: '#9E8E78', lineHeight: 1.6 }}>
                  The interviewer will introduce themselves shortly...
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)' }}
                    animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
                ))}
              </div>
            </div>
          )}

          {/* Question */}
          {!isIntroPhase && (
            <>
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  style={{ padding: '24px', background: 'var(--white)', borderRadius: '10px', border: '1px solid var(--sand-light)', marginBottom: '16px', borderLeft: '4px solid var(--amber)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--amber)', letterSpacing: '0.08em' }}>
                      QUESTION {currentIndex + 1} OF {questions.length}
                    </span>
                    <span style={{ padding: '3px 10px', background: 'var(--cream)', border: '1px solid var(--sand)', borderRadius: '20px', fontSize: '11px', color: '#9E8E78', fontFamily: 'DM Mono, monospace', textTransform: 'capitalize' }}>
                      {currentQuestion?.difficulty}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5 }}>
                    {currentQuestion?.question}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Answer area */}
              <div style={{ position: 'relative', marginBottom: '12px', flex: 1 }}>
                <textarea
                  placeholder="Your spoken words will appear here automatically. You can also type your answer…"
                  onChange={e => { setAnswer(e.target.value); answerRef.current = e.target.value }}
                  value={answer}
                  disabled={isAISpeaking}
                  style={{ width: '100%', minHeight: '140px', height: '100%', padding: '16px', background: 'var(--white)', border: `1.5px solid ${answer ? 'var(--sand)' : 'var(--sand-light)'}`, borderRadius: '8px', color: 'var(--ink)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7, resize: 'vertical', outline: 'none', transition: 'border-color 0.2s', opacity: isAISpeaking ? 0.6 : 1 }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--amber)'}
                  onBlur={e => e.currentTarget.style.borderColor = answer ? 'var(--sand)' : 'var(--sand-light)'}
                />
                {interimText && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', pointerEvents: 'none' }}>
                    <span style={{ padding: '3px 10px', background: 'rgba(74,103,65,0.08)', border: '1px solid rgba(74,103,65,0.15)', borderRadius: '4px', fontSize: '12px', color: 'var(--sage)', fontStyle: 'italic' }}>
                      {interimText}…
                    </span>
                  </div>
                )}
              </div>

              {/* Mic error */}
              {micError && (
                <div style={{ padding: '10px 14px', background: '#FFF0ED', border: '1px solid rgba(168,75,47,0.2)', borderRadius: '6px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--rust)' }}>⚠ {micError}</p>
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ padding: '20px', background: '#F0F6EE', border: '1.5px solid rgba(74,103,65,0.2)', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--sage)', letterSpacing: '0.1em', marginBottom: '8px' }}>AI FEEDBACK</p>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.7, fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
                      "{feedback}"
                    </p>
                    <button onClick={handleNext}
                      style={{ marginTop: '16px', width: '100%', padding: '12px 20px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: '6px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}>
                      {currentIndex + 1 >= questions.length ? 'Finish interview' : 'Next question'}
                      <BsArrowRight size={15} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              {!feedback && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <motion.button onClick={toggleMic} disabled={isAISpeaking} whileTap={{ scale: 0.9 }}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', background: isMicOn ? 'var(--sage)' : 'var(--cream)', border: `1.5px solid ${isMicOn ? 'var(--sage)' : 'var(--sand)'}`, color: isMicOn ? 'white' : '#9E8E78', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isAISpeaking ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'all 0.2s', opacity: isAISpeaking ? 0.4 : 1, position: 'relative' }}>
                    {isMicOn ? <FiMic size={18} /> : <FiMicOff size={18} />}
                    {isMicOn && !isAISpeaking && (
                      <motion.div style={{ position: 'absolute', inset: -4, borderRadius: '10px', border: '2px solid var(--sage)' }} animate={{ opacity: [0.4, 0, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                  </motion.button>
                  <button onClick={toggleCamera}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--cream)', border: `1.5px solid ${isCamOn ? 'var(--sand)' : 'var(--rust)'}`, color: isCamOn ? '#9E8E78' : 'var(--rust)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                    {isCamOn ? <FiVideo size={16} /> : <FiVideoOff size={16} />}
                  </button>
                  <button onClick={submitAnswer} disabled={isSubmitting || isAISpeaking}
                    style={{ flex: 1, height: '48px', background: isSubmitting || isAISpeaking ? 'var(--sand)' : 'var(--ink)', color: isSubmitting || isAISpeaking ? '#9E8E78' : 'var(--cream)', border: 'none', borderRadius: '8px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', cursor: isSubmitting || isAISpeaking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    {isSubmitting ? (
                      <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(245,240,232,0.3)', borderTopColor: 'var(--cream)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Evaluating...</>
                    ) : (
                      <><FiSend size={14} /> Submit answer</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {recordingSaved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--sage)', marginTop: '12px', fontFamily: 'DM Mono, monospace' }}>
              ✓ Recording downloaded to your device
            </motion.p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(200,135,58,0.4); } 100% { box-shadow: 0 0 0 8px rgba(200,135,58,0); } }
        @keyframes float { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
      `}</style>
    </div>
  )
}

export default Step2Interview
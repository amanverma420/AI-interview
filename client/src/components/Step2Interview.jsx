import React, { useState, useRef, useEffect, useCallback } from 'react'
import Timer from './Timer'
import { motion, AnimatePresence } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight, BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { HiSpeakerWave } from 'react-icons/hi2';
import { MdFiberManualRecord } from 'react-icons/md';
import axios from "axios"
import { ServerUrl } from '../App'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, saveRecording = false } = interviewData;

  const [isIntroPhase, setIsIntroPhase]     = useState(true);
  const [isMicOn, setIsMicOn]               = useState(false);
  const [isCamOn, setIsCamOn]               = useState(true);
  const [isAISpeaking, setIsAISpeaking]     = useState(false);
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [answer, setAnswer]                 = useState("");
  const [feedback, setFeedback]             = useState("");
  const [timeLeft, setTimeLeft]             = useState(questions[0]?.timeLimit || 60);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [subtitle, setSubtitle]             = useState("");
  const [waveActive, setWaveActive]         = useState(false);
  const [selectedVoice, setSelectedVoice]   = useState(null);
  const [voiceReady, setVoiceReady]         = useState(false);
  const [micError, setMicError]             = useState("");
  const [interimText, setInterimText]       = useState("");
  const [recordingSaved, setRecordingSaved] = useState(false);

  // Refs
  const videoRef            = useRef(null);
  const cameraStreamRef     = useRef(null);
  const mediaRecorderRef    = useRef(null);
  const recordedChunks      = useRef([]);
  const recognitionRef      = useRef(null);
  const recognitionActive   = useRef(false);
  const aiSpeakingRef       = useRef(false);
  const isMicOnRef          = useRef(false);
  const answerRef           = useRef("");
  const timerRef            = useRef(null);
  const currentIndexRef     = useRef(0);
  const submittedRef        = useRef(false);

  // Keep refs in sync
  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // ─── CAMERA ────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true, // capture audio too so the video file has audio
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      if (saveRecording) {
        recordedChunks.current = [];

        // pick a supported mime type
        const mimeType =
          MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' :
          MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' :
          MediaRecorder.isTypeSupported('video/webm')                  ? 'video/webm' :
          MediaRecorder.isTypeSupported('video/mp4')                   ? 'video/mp4' :
          '';

        try {
          const recorderOptions = mimeType ? { mimeType } : {};
          const recorder = new MediaRecorder(stream, recorderOptions);

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunks.current.push(e.data);
            }
          };

          // timeslice of 500ms ensures we get frequent data chunks
          recorder.start(500);
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn('MediaRecorder init failed, trying without mimeType:', recErr);
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunks.current.push(e.data);
          };
          recorder.start(500);
          mediaRecorderRef.current = recorder;
        }
      }

      setIsCamOn(true);
    } catch (err) {
      console.warn("Camera/mic access error:", err);
      // try video-only fallback
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraStreamRef.current = videoOnlyStream;
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnlyStream;
          videoRef.current.play().catch(() => {});
        }
        setIsCamOn(true);
      } catch {
        setIsCamOn(false);
      }
    }
  }, [saveRecording]);

  const stopCameraAndSave = useCallback(() => {
    const finishStop = () => {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    };

    const recorder = mediaRecorderRef.current;
    if (saveRecording && recorder && recorder.state !== 'inactive') {
      // request any remaining data before stopping
      recorder.requestData();

      recorder.onstop = () => {
        const chunks = recordedChunks.current;
        if (chunks.length > 0) {
          const mime = recorder.mimeType || 'video/webm';
          const blob = new Blob(chunks, { type: mime });
          const ext  = mime.includes('mp4') ? 'mp4' : 'webm';
          const url  = URL.createObjectURL(blob);
          const a    = Object.assign(document.createElement('a'), {
            href: url,
            download: `interview-${Date.now()}.${ext}`,
          });
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            a.remove();
            URL.revokeObjectURL(url);
          }, 1000);
          setRecordingSaved(true);
        } else {
          console.warn('No recorded chunks available');
        }
        finishStop();
      };
      recorder.stop();
    } else {
      finishStop();
    }
  }, [saveRecording]);

  useEffect(() => {
    startCamera();
    return () => {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleCamera = () => {
    if (isCamOn) {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCamOn(false);
    } else {
      startCamera();
    }
  };

  // ─── VOICE SELECTION ───────────────────────────────────────────
  useEffect(() => {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const priority = [
        'Samantha','Karen','Moira','Tessa','Fiona',
        'Google US English','Google UK English Female',
        'Microsoft Aria Online','Microsoft Jenny Online',
        'Microsoft Natasha Online','Microsoft Zira',
      ];
      let chosen = null;
      for (const name of priority) {
        const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
        if (v) { chosen = v; break; }
      }
      if (!chosen) chosen = voices.find(v => v.lang.startsWith('en-US')) || voices[0];
      setSelectedVoice(chosen);
      setVoiceReady(true);
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      pick();
    } else {
      window.speechSynthesis.onvoiceschanged = pick;
      setTimeout(pick, 600);
    }
  }, []);

  // ─── SPEAK ─────────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text?.trim()) { resolve(); return; }
      window.speechSynthesis.cancel();
      // stop recognition while AI speaks
      stopRecognitionInternal();

      const utt = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utt.voice = selectedVoice;
      utt.rate   = 0.94;
      utt.pitch  = 1.0;
      utt.volume = 1.0;

      utt.onstart = () => {
        setIsAISpeaking(true);
        aiSpeakingRef.current = true;
        setWaveActive(true);
        setSubtitle(text);
      };

      const done = () => {
        setIsAISpeaking(false);
        aiSpeakingRef.current = false;
        setWaveActive(false);
        setTimeout(() => setSubtitle(""), 600);
        resolve();
      };
      utt.onend   = done;
      utt.onerror = done;

      setTimeout(() => window.speechSynthesis.resume(), 100);
      window.speechSynthesis.speak(utt);
    });
  }, [selectedVoice]);

  // ─── SPEECH RECOGNITION ────────────────────────────────────────
  // Internal stop — doesn't touch isMicOnRef so we can restart after AI finishes
  const stopRecognitionInternal = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    recognitionActive.current = false;
    setInterimText('');
  }, []);

  const startRecognition = useCallback(() => {
    if (aiSpeakingRef.current)     return;
    if (recognitionActive.current) return;
    if (!isMicOnRef.current)       return;

    const SpeechRec = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRec) {
      setMicError("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const rec = new SpeechRec();
    rec.lang            = 'en-US';
    rec.continuous      = true;   // keep listening without re-starting
    rec.interimResults  = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => {
      recognitionActive.current = true;
      setMicError("");
    };

    rec.onresult = (e) => {
      let interimStr = '';
      let finalStr   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalStr   += t + ' ';
        else                       interimStr += t;
      }
      if (finalStr.trim()) {
        setAnswer(prev => {
          const updated = (prev.trim() + ' ' + finalStr.trim()).trim() + ' ';
          answerRef.current = updated;
          return updated;
        });
        setInterimText('');
      } else {
        setInterimText(interimStr);
      }
    };

    rec.onend = () => {
      recognitionActive.current = false;
      recognitionRef.current    = null;
      setInterimText('');
      // auto-restart only if mic is still on and AI isn't speaking
      if (isMicOnRef.current && !aiSpeakingRef.current) {
        setTimeout(() => {
          if (isMicOnRef.current && !aiSpeakingRef.current) {
            startRecognition();
          }
        }, 200);
      }
    };

    rec.onerror = (e) => {
      recognitionActive.current = false;
      recognitionRef.current    = null;
      setInterimText('');

      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicError("Microphone permission denied. Please allow mic access in your browser settings.");
        isMicOnRef.current = false;
        setIsMicOn(false);
        return;
      }
      if (e.error === 'aborted') return;

      // restart on no-speech, network, audio-capture, etc.
      if (isMicOnRef.current && !aiSpeakingRef.current) {
        setTimeout(() => {
          if (isMicOnRef.current && !aiSpeakingRef.current) {
            startRecognition();
          }
        }, 400);
      }
    };

    try {
      rec.start();
    } catch (err) {
      console.warn('rec.start() failed:', err);
      recognitionActive.current = false;
      recognitionRef.current    = null;
      setTimeout(() => {
        if (isMicOnRef.current && !aiSpeakingRef.current) startRecognition();
      }, 600);
    }
  }, []); // no deps — uses refs only, so always fresh

  const enableMic = useCallback(() => {
    isMicOnRef.current = true;
    setIsMicOn(true);
    setMicError("");
    startRecognition();
  }, [startRecognition]);

  const disableMic = useCallback(() => {
    isMicOnRef.current = false;
    setIsMicOn(false);
    stopRecognitionInternal();
  }, [stopRecognitionInternal]);

  const toggleMic = useCallback(() => {
    if (isMicOnRef.current) disableMic();
    else enableMic();
  }, [enableMic, disableMic]);

  // restart recognition after AI finishes speaking (if mic was on)
  useEffect(() => {
    if (!isAISpeaking && isMicOn && !isIntroPhase) {
      // small delay to let speech synthesis fully settle
      const t = setTimeout(() => {
        if (!aiSpeakingRef.current && isMicOnRef.current && !recognitionActive.current) {
          startRecognition();
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isAISpeaking]);

  // ─── INTERVIEW FLOW ────────────────────────────────────────────
  useEffect(() => {
    if (!voiceReady) return;
    const run = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, great to meet you. I hope you're feeling confident today.`);
        await new Promise(r => setTimeout(r, 350));
        await speakText("I'll ask you a few questions. Just answer naturally and take your time. Let's begin.");
        await new Promise(r => setTimeout(r, 500));
        setIsIntroPhase(false);
      } else {
        const q = questions[currentIndex];
        if (!q) return;
        await new Promise(r => setTimeout(r, 400));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, here's the final question. It's a bit more challenging.");
          await new Promise(r => setTimeout(r, 250));
        }
        await speakText(q.question);
        // Enable mic AFTER AI finishes asking
        enableMic();
      }
    };
    run();
  }, [voiceReady, isIntroPhase, currentIndex]);

  // ─── TIMER ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isIntroPhase || !questions[currentIndex]) return;
    const limit = questions[currentIndex].timeLimit || 60;
    setTimeLeft(limit);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isIntroPhase, currentIndex]);

  // capture timeLeft in ref so submitAnswer can read it
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // Auto-submit on timeout
  useEffect(() => {
    if (!isIntroPhase && timeLeft === 0 && !isSubmitting && !feedback && !submittedRef.current) {
      submittedRef.current = true;
      submitAnswer();
    }
  }, [timeLeft]);

  // ─── SUBMIT ────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (isSubmitting) return;
    disableMic();
    setIsSubmitting(true);
    setInterimText('');
    const q = questions[currentIndexRef.current];

    try {
      const res = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndexRef.current,
        answer: answerRef.current,
        timeTaken: (q?.timeLimit || 60) - timeLeftRef.current,
      }, { withCredentials: true });
      setFeedback(res.data.feedback);
      await speakText(res.data.feedback);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    submittedRef.current = false;
    setAnswer("");
    answerRef.current = "";
    setFeedback("");
    setInterimText("");
    disableMic();

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakText("Great. Let's move on to the next question.");
    setCurrentIndex(prev => prev + 1);
  };

  const finishInterview = async () => {
    disableMic();
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    stopCameraAndSave();
    try {
      const res = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
      onFinish(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    return () => {
      isMicOnRef.current = false;
      stopRecognitionInternal();
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  // ─── WAVE BARS ─────────────────────────────────────────────────
  const WaveBars = ({ active, color = "bg-emerald-400", count = 10 }) => (
    <div className="flex items-end gap-[3px]" style={{ height: '24px' }}>
      {Array.from({ length: count }, (_, i) => {
        const h = [0.5,0.9,0.65,1,0.7,0.85,0.55,0.95,0.6,0.8][i % 10];
        return (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full ${color}`}
            animate={active
              ? { scaleY: [h*0.3, h, h*0.5, h*0.85, h*0.4, h], opacity:[0.5,1,0.7,1,0.6,0.9] }
              : { scaleY: 0.1, opacity: 0.2 }}
            transition={active
              ? { duration: 0.65+i*0.06, repeat: Infinity, ease:'easeInOut', delay: i*0.05 }
              : { duration: 0.2 }}
            style={{ height: `${Math.round(h*22)}px`, transformOrigin:'bottom' }}
          />
        );
      })}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-5"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d1f17 50%, #0f172a 100%)' }}
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.022]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)' }} />

      <div className="w-full max-w-6xl min-h-[88vh] rounded-3xl overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-2xl shadow-black/70">

        {/* ── LEFT ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[38%] flex flex-col p-4 sm:p-5 gap-4 border-r border-white/10"
          style={{ background: 'rgba(12,20,30,0.95)' }}>

          {/* Camera */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-800/80 aspect-video ring-1 ring-white/10 flex-shrink-0">
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isCamOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
                <BsCameraVideoOff size={32} /><p className="text-xs">Camera off</p>
              </div>
            )}

            {isCamOn && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm rounded-full px-2.5 py-1">
                <motion.div className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                <span className="text-[10px] text-white font-bold tracking-widest">
                  {saveRecording ? 'REC' : 'LIVE'}
                </span>
              </div>
            )}

            <AnimatePresence>
              {isMicOn && !isAISpeaking && (
                <motion.div
                  initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm border border-blue-500/40 rounded-full px-2.5 py-1"
                >
                  <WaveBars active={true} color="bg-blue-400" count={5} />
                  <span className="text-[10px] text-blue-300 font-medium ml-1">You</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isAISpeaking && (
                <motion.div
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                  className="absolute bottom-3 inset-x-3 flex items-center gap-2 bg-black/72 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-3 py-2"
                >
                  <HiSpeakerWave size={13} className="text-emerald-400 flex-shrink-0" />
                  <WaveBars active={waveActive} color="bg-emerald-400" count={10} />
                  <span className="text-[10px] text-emerald-300 ml-auto font-medium tracking-wide">Interviewer</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtitle */}
          <AnimatePresence>
            {subtitle && (
              <motion.div
                initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-shrink-0"
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Interviewer</p>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{subtitle}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer/status */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Session</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isAISpeaking ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                : isMicOn    ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                : 'bg-slate-700/30 text-slate-500 border-slate-600/30'
              }`}>
                {isAISpeaking ? '🎙 Interviewer' : isMicOn ? '🎤 Listening' : '⏸ Paused'}
              </span>
            </div>
            <div className="h-px bg-white/8" />
            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>
            <div className="h-px bg-white/8" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl py-3 text-center">
                <p className="text-xl font-bold text-emerald-400">{currentIndex + 1}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Current</p>
              </div>
              <div className="bg-white/5 rounded-xl py-3 text-center">
                <p className="text-xl font-bold text-slate-300">{questions.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-5 sm:p-7" style={{ background: 'rgba(9,16,24,0.97)' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily:"'Georgia',serif" }}>
                AI Smart Interview
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Speak naturally or type your answer</p>
            </div>
            <div className="flex items-center gap-2">
              {saveRecording && (
                <div className="flex items-center gap-1 text-[10px] bg-red-500/15 border border-red-500/25 text-red-400 px-2.5 py-1 rounded-full">
                  <MdFiberManualRecord size={9} className="animate-pulse" />Recording
                </div>
              )}
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-xl border transition-all text-xs ${
                  isCamOn ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  : 'bg-red-500/15 border-red-500/25 text-red-400'
                }`}
              >
                {isCamOn ? <BsCameraVideo size={13}/> : <BsCameraVideoOff size={13}/>}
              </button>
            </div>
          </div>

          {/* Intro placeholder */}
          {isIntroPhase && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="flex-1 flex flex-col items-center justify-center gap-5 text-center"
            >
              <motion.div
                animate={{ scale:[1,1.08,1] }} transition={{ duration:2.5, repeat:Infinity }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
              >
                <HiSpeakerWave size={26} className="text-emerald-400"/>
              </motion.div>
              <div>
                <p className="text-white font-semibold">Preparing your session…</p>
                <p className="text-slate-500 text-sm mt-1">The interviewer will introduce themselves shortly</p>
              </div>
              <div className="flex gap-2">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ opacity:[0.25,1,0.25] }}
                    transition={{ duration:1.2, repeat:Infinity, delay:i*0.3 }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Question */}
          {!isIntroPhase && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.3 }}
                className="mb-4 bg-white/5 border border-white/10 rounded-2xl p-5 flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    Q{currentIndex+1} of {questions.length}
                  </span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {currentQuestion?.difficulty}
                  </span>
                </div>
                <p className="text-white font-medium text-sm sm:text-base leading-relaxed">
                  {currentQuestion?.question}
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Answer */}
          {!isIntroPhase && (
            <div className="relative flex-1 min-h-[120px] mb-3">
              <textarea
                placeholder="Your spoken words will appear here automatically. You can also type directly…"
                onChange={(e) => {
                  setAnswer(e.target.value);
                  answerRef.current = e.target.value;
                }}
                value={answer}
                disabled={isAISpeaking}
                className="w-full h-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 resize-none outline-none text-slate-200 placeholder-slate-600 focus:border-emerald-500/40 transition-all text-sm leading-relaxed disabled:opacity-50"
              />
              {interimText && (
                <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                  <span className="bg-blue-500/15 border border-blue-500/20 rounded-lg px-2.5 py-1 text-blue-300/80 text-xs italic">
                    {interimText}…
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mic error */}
          {micError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3 flex-shrink-0">
              ⚠ {micError}
            </p>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="bg-emerald-950/60 border border-emerald-500/25 rounded-2xl p-5 flex-shrink-0"
              >
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2">AI Feedback</p>
                <p className="text-emerald-100 text-sm leading-relaxed">{feedback}</p>
                <button
                  onClick={handleNext}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {currentIndex+1 >= questions.length ? "Finish Interview" : "Next Question"}
                  <BsArrowRight size={14}/>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {!feedback && !isIntroPhase && (
            <div className="flex items-center gap-3 mt-3 flex-shrink-0">
              <motion.button
                onClick={toggleMic}
                disabled={isAISpeaking}
                whileTap={{ scale:0.9 }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0 disabled:opacity-30 ${
                  isMicOn
                    ? 'bg-white text-slate-900 shadow-lg shadow-white/15'
                    : 'bg-white/8 border border-white/12 text-slate-500 hover:bg-white/12'
                }`}
                title={isMicOn ? "Mute mic" : "Unmute mic"}
              >
                {isMicOn ? <FaMicrophone size={17}/> : <FaMicrophoneSlash size={17}/>}
                {isMicOn && !isAISpeaking && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/25"
                    animate={{ scale:[1,1.4], opacity:[0.4,0] }}
                    transition={{ duration:1.5, repeat:Infinity }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || isAISpeaking}
                whileTap={{ scale:0.98 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-white py-3.5 sm:py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate:360 }} transition={{ duration:0.7, repeat:Infinity, ease:'linear' }} />
                    Evaluating…
                  </span>
                ) : "Submit Answer"}
              </motion.button>
            </div>
          )}

          {recordingSaved && (
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="mt-3 text-xs text-center text-emerald-400">
              ✓ Recording downloaded to your device
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { HiX } from "react-icons/hi"
import Auth from '../pages/auth'

function AuthModel({ onClose }) {
  const { userData } = useSelector((state) => state.user)

  useEffect(() => {
    if (userData) onClose()
  }, [userData, onClose])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(26,22,18,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{ position: 'relative', width: '100%', maxWidth: '440px' }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '-12px', right: '-12px',
              width: '32px', height: '32px',
              background: 'var(--ink)',
              border: '2px solid var(--cream)',
              borderRadius: '50%',
              color: 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <HiX size={14} />
          </button>
          <Auth isModel={true} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModel
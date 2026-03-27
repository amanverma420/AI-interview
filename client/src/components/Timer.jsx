import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100
  const isUrgent = timeLeft <= 15
  const isCritical = timeLeft <= 5

  const pathColor = isCritical ? '#A84B2F' : isUrgent ? '#C8873A' : '#4A6741'
  const textColor = isCritical ? '#A84B2F' : isUrgent ? '#8B5E20' : 'var(--ink)'

  return (
    <div style={{ width: '80px', height: '80px', position: 'relative' }}>
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}`}
        styles={buildStyles({
          textSize: '26px',
          pathColor,
          textColor,
          trailColor: 'var(--sand-light)',
          strokeLinecap: 'round',
        })}
      />
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'DM Mono, monospace',
        fontSize: '9px',
        color: '#9E8E78',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        SECONDS LEFT
      </div>
    </div>
  )
}

export default Timer
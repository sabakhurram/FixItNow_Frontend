import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import './Loader.css';

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

const PARTICLES = [
  { left: '18%', delay: '0s', duration: '5.5s', size: 5 },
  { left: '34%', delay: '1.2s', duration: '6.4s', size: 4 },
  { left: '52%', delay: '0.6s', duration: '5.8s', size: 6 },
  { left: '68%', delay: '1.9s', duration: '6.8s', size: 4 },
  { left: '82%', delay: '0.9s', duration: '5.2s', size: 5 },
];

function Loader({ progress = 0, fadeExit = false }) {
  const reducedMotion = useReducedMotion();
  const [displayProgress, setDisplayProgress] = useState(0);
  const currentRef = useRef(0);

  // Smoothly interpolate displayed percentage toward real progress
  useEffect(() => {
    if (reducedMotion) {
      setDisplayProgress(progress);
      return undefined;
    }

    let rafId = null;
    const tick = () => {
      const diff = progress - currentRef.current;
      if (Math.abs(diff) < 0.35) {
        currentRef.current = progress;
        setDisplayProgress(Math.round(progress));
        return;
      }
      currentRef.current += diff * 0.16;
      setDisplayProgress(Math.round(currentRef.current));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [progress, reducedMotion]);

  const padded = String(Math.min(100, Math.max(0, displayProgress))).padStart(3, '0');

  return (
    <div
      className={`sc-loader${fadeExit ? ' sc-loader--exit' : ''}`}
      data-theme="light"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${padded} percent`}
    >
      {/* Subtle floating yellow light particles */}
      {!reducedMotion && (
        <div className="sc-loader__particles" aria-hidden="true">
          {PARTICLES.map((p, idx) => (
            <span
              key={idx}
              className="sc-loader__particle"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}

      <div className="sc-loader__inner">
        {/* Sun charging up SVG */}
        <div className="sc-loader__sun-wrap" aria-hidden="true">
          <svg className="sc-loader__sun" viewBox="0 0 120 120" fill="none">
            <g className="sc-loader__rays">
              {RAYS.map((deg, idx) => (
                <line
                  key={deg}
                  x1="60"
                  y1="14"
                  x2="60"
                  y2="28"
                  className="sc-loader__ray"
                  style={{
                    transform: `rotate(${deg}deg)`,
                    transformOrigin: '60px 60px',
                    animationDelay: `${idx * 0.06}s`,
                  }}
                />
              ))}
            </g>
            <circle cx="60" cy="60" r="20" className="sc-loader__core" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="sc-loader__wordmark">
          <span>Fix</span>
          <span className="sc-loader__wordmark-accent">It</span>
          <span>Now</span>
        </div>

        {/* Progress Bar */}
        <div className="sc-loader__bar-track" aria-hidden="true">
          <div
            className="sc-loader__bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Tabular percentage counter */}
        <span className="sc-loader__percent">{padded}%</span>
      </div>
    </div>
  );
}

export default Loader;

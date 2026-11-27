import { useMemo, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import './CurvedMarquee.css';

/* =====================================================
   TUNABLE CONSTANTS
   - MARQUEE_PHRASE: text content along the ribbon
   - BASE_SPEED_PCT_PER_SEC: base marquee speed (approx 28s per -50% loop)
   - DESKTOP_PATH / MOBILE_PATH: arch curve coordinates
   - TILT_RANGE: [-3, 3] degrees on scroll
   ===================================================== */

const MARQUEE_PHRASE =
  'SOLAR INSTALLATION • REPAIR & MAINTENANCE • SYSTEM INSPECTION • BATTERY STORAGE • FREE SITE ASSESSMENT • ONE TRUSTED TEAM • FIXITNOW • ';

const BASE_SPEED_PCT_PER_SEC = 0.9; // longer path, so lower % keeps the same visual speed
const DESKTOP_PATH = 'M -650,450 Q 650,-270 1950,450';
const MOBILE_PATH = 'M -450,310 Q 450,-170 1350,310';
const TILT_RANGE = [-2, 2];

function CurvedMarquee({ containerRef, visible }) {
  const reducedMotion = useReducedMotion();
  const desktopTextPathRef = useRef(null);
  const mobileTextPathRef = useRef(null);
  const offsetRef = useRef(0);
  const rootRef = useRef(null);


  const repeatedText = useMemo(() => MARQUEE_PHRASE.repeat(6), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Gentle scroll-linked tilt (-3deg to +3deg)
  const rawTilt = useTransform(scrollYProgress, [0.55, 1], TILT_RANGE);
  const smoothTilt = useSpring(rawTilt, { stiffness: 90, damping: 28 });

  // Scroll velocity boosts marquee speed temporarily, then eases back
  const scrollVel = useVelocity(scrollYProgress);
  const clampedVel = useTransform(scrollVel, [-1.5, 0, 1.5], [2.2, 0, 2.2]);
  const smoothBoost = useSpring(clampedVel, { stiffness: 90, damping: 28 });

  useAnimationFrame((_, delta) => {


    if (reducedMotion) return;
    const dt = Math.min(delta, 50) / 1000;
    const speed = BASE_SPEED_PCT_PER_SEC + Math.abs(smoothBoost.get());
    offsetRef.current -= speed * dt;
    if (offsetRef.current <= -50) {
      offsetRef.current += 50;
    }
    const val = `${offsetRef.current}%`;
    desktopTextPathRef.current?.setAttribute('startOffset', val);
    mobileTextPathRef.current?.setAttribute('startOffset', val);
  });

  return (
    <motion.div

      className="sc-marquee"
      initial={false}
      animate={
        reducedMotion || visible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 60 }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
            duration: 0.7,
            delay: visible ? 0.55 : 0,
            ease: [0.16, 1, 0.3, 1],
          }
      }
      aria-label="FixItNow Solar Services"
    >
      <motion.div
        className="sc-marquee__track"
        style={reducedMotion ? undefined : { rotate: smoothTilt }}
      >
        {/* Desktop SVG */}
        <svg
          className="sc-marquee__svg sc-marquee__svg--desktop"
          viewBox="0 0 1300 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            id="sc-marquee-curve-desktop"
            d={DESKTOP_PATH}
            className="sc-marquee__ribbon sc-marquee__ribbon--desktop"
            strokeLinecap="butt"
          />
          <text
            className="sc-marquee__text sc-marquee__text--desktop"
            dominantBaseline="central"
          >
            <textPath
              ref={desktopTextPathRef}
              href="#sc-marquee-curve-desktop"
              startOffset="0%"
            >
              {repeatedText}
            </textPath>
          </text>
        </svg>

        {/* Mobile SVG */}
        <svg
          className="sc-marquee__svg sc-marquee__svg--mobile"
          viewBox="0 0 900 180"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            id="sc-marquee-curve-mobile"
            d={MOBILE_PATH}
            className="sc-marquee__ribbon sc-marquee__ribbon--mobile"
            strokeLinecap="butt"
          />
          <text
            className="sc-marquee__text sc-marquee__text--mobile"
            dominantBaseline="central"
          >
            <textPath
              ref={mobileTextPathRef}
              href="#sc-marquee-curve-mobile"
              startOffset="0%"
            >
              {repeatedText}
            </textPath>
          </text>
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default CurvedMarquee;

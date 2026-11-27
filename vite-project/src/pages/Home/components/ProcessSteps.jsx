import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { MessageSquare, Compass, Wrench, ShieldCheck } from 'lucide-react';
import './ProcessSteps.css';

/* =====================================================
   TUNABLE CONSTANTS
   - Scroll runway height: see .steps in ProcessSteps.css (450vh desktop, 380vh mobile)
   - Spring smoothness: SPRING_CONFIG below
   - Node positions along path: NODE_T below (fractions 0..1)
   - Path shape: DESKTOP_SEGMENTS & MOBILE_SEGMENTS below
   ===================================================== */

const SPRING_CONFIG = {
  stiffness: 90,
  damping: 28,
  mass: 0.6,
  restDelta: 0.0005,
};

const NODE_T = [0.08, 0.32, 0.65, 0.90];

const STEPS_CONTENT = [
  {
    number: '01',
    title: 'Tell Us What You Need',
    subtitle: 'Start with a conversation',
    description:
      "Share your solar requirements with us. Whether it's a new installation, system inspection, repair, or maintenance, we'll understand your needs first.",
    Icon: MessageSquare,
    side: 'right',
    tilt: -2.5,
  },
  {
    number: '02',
    title: 'Get Your Solar Plan',
    subtitle: 'A solution designed around you',
    description:
      'Our experts assess your requirements and recommend the right solution, from system sizing and design to repairs and upgrades.',
    Icon: Compass,
    side: 'left',
    tilt: 2.5,
  },
  {
    number: '03',
    title: 'We Get to Work',
    subtitle: 'Professional service, every step',
    description:
      "Our technicians carry out the agreed work, whether it's installing a new solar system, repairing existing equipment, or performing maintenance.",
    Icon: Wrench,
    side: 'right',
    tilt: -2.5,
  },
  {
    number: '04',
    title: 'Enjoy Ongoing Support',
    subtitle: "We're here beyond installation",
    description:
      'Keep your solar system performing at its best with ongoing maintenance, inspections, upgrades, and battery storage solutions.',
    Icon: ShieldCheck,
    side: 'left',
    tilt: 2.5,
  },
];

/* Desktop viewBox: 0 0 1200 2800
   S-curves side to side, with one big loop between Step 02 (t=0.32) and Step 03 (t=0.65) */
const DESKTOP_VIEWBOX = { width: 1200, height: 2800 };
const DESKTOP_START = { x: 280, y: 120 };
const DESKTOP_SEGMENTS = [
  // Seg 1: Top-left down through Step 01 toward right-center
  { cp1: [280, 320], cp2: [480, 420], end: [420, 620] },
  // Seg 2: Sweep across to right side for Step 02
  { cp1: [360, 820], cp2: [900, 820], end: [880, 1080] },
  // Seg 3: Big loop out to the right, curving up and around
  { cp1: [860, 1340], cp2: [1080, 1540], end: [760, 1580] },
  { cp1: [440, 1620], cp2: [430, 1260], end: [700, 1320] },
  { cp1: [960, 1380], cp2: [780, 1740], end: [440, 1860] },
  // Seg 4: Sweep left-to-right for Step 03
  { cp1: [200, 1940], cp2: [220, 2120], end: [460, 2240] },
  // Seg 5: Glide down to right-center for Step 04
  { cp1: [720, 2360], cp2: [860, 2480], end: [760, 2680] },
];

/* Mobile viewBox: 0 0 400 2400
   Narrower path kept on the left so text blocks sit cleanly inside 320-430px viewports */
const MOBILE_VIEWBOX = { width: 400, height: 2400 };
const MOBILE_START = { x: 64, y: 90 };
const MOBILE_SEGMENTS = [
  { cp1: [64, 260], cp2: [80, 360], end: [68, 520] },
  { cp1: [56, 680], cp2: [88, 760], end: [76, 920] },
  // Compact loop between Step 02 and Step 03
  { cp1: [68, 1100], cp2: [280, 1220], end: [170, 1260] },
  { cp1: [68, 1295], cp2: [64, 1060], end: [165, 1095] },
  { cp1: [265, 1135], cp2: [140, 1440], end: [68, 1560] },
  // Step 03 -> Step 04
  { cp1: [44, 1680], cp2: [60, 1860], end: [74, 1980] },
  { cp1: [88, 2100], cp2: [96, 2200], end: [76, 2320] },
];

function buildSvgPath(start, segments) {
  const parts = [`M ${start.x} ${start.y}`];
  for (const seg of segments) {
    parts.push(
      `C ${seg.cp1[0]} ${seg.cp1[1]}, ${seg.cp2[0]} ${seg.cp2[1]}, ${seg.end[0]} ${seg.end[1]}`
    );
  }
  return parts.join(' ');
}

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}

function StepNode({
  step,
  index,
  t,
  point,
  viewBox,
  drawProgress,
  isRevealed,
  isMobile,
  reducedMotion,
}) {
  const rawScale = useTransform(
    drawProgress,
    [Math.max(0, t - 0.025), Math.min(1, t + 0.02)],
    [0, 1]
  );
  const popScale = useSpring(rawScale, {
    stiffness: 380,
    damping: 18,
    mass: 0.5,
  });

  const leftPct = (point.x / viewBox.width) * 100;
  const topPct = (point.y / viewBox.height) * 100;
  const Icon = step.Icon;

  const sideClass = isMobile
    ? leftPct > 45
      ? 'steps__node-group--left'
      : 'steps__node-group--right'
    : step.side === 'left'
      ? 'steps__node-group--left'
      : 'steps__node-group--right';

  const visible = reducedMotion || isRevealed;
  const tiltDeg = isMobile ? Math.max(-2, Math.min(2, step.tilt)) : step.tilt;

  return (
    <div
      className={`steps__node-group ${sideClass}`}
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        '--node-x': `${leftPct}%`,
      }}
    >
      {/* Pulse ring when node pops */}
      {!reducedMotion && isRevealed && (
        <span className="steps__node-pulse" aria-hidden="true" />
      )}

      {/* Circle Node */}
      <motion.div
        className="steps__node"
        style={reducedMotion ? undefined : { scale: popScale }}
      >
        <span className="steps__node-number">{step.number}</span>
        <span className="steps__node-sticker" aria-hidden="true">
          <Icon size={14} strokeWidth={2.2} />
        </span>
      </motion.div>

      {/* Connector gap / pointer */}
      <motion.span
        className="steps__connector"
        aria-hidden="true"
        initial={false}
        animate={visible ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Text + Speech Bubble */}
      <motion.div
        className="steps__content"
        initial={false}
        animate={visible ? 'visible' : 'hidden'}
      >
        <div className="steps__title-mask">
          <motion.h3
            className="steps__step-title"
            variants={{
              hidden: { y: '105%', opacity: 0 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {step.title}
          </motion.h3>
        </div>

        <motion.p
          className="steps__step-subtitle"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {step.subtitle}
        </motion.p>

        <motion.div
          className="steps__bubble"
          style={{ '--bubble-tilt': `${tiltDeg}deg` }}
          variants={{
            hidden: { opacity: 0, scale: 0.88, y: 12, rotate: tiltDeg * 1.4 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: tiltDeg,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.14,
              },
            },
          }}
        >
          <span className="steps__bubble-tail" aria-hidden="true" />
          <p className="steps__bubble-text">{step.description}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProcessSteps() {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const measurePathRef = useRef(null);

  const isMobile = useIsMobile(767);
  const reducedMotion = useReducedMotion();

  const viewBox = isMobile ? MOBILE_VIEWBOX : DESKTOP_VIEWBOX;
  const pathD = useMemo(
    () =>
      isMobile
        ? buildSvgPath(MOBILE_START, MOBILE_SEGMENTS)
        : buildSvgPath(DESKTOP_START, DESKTOP_SEGMENTS),
    [isMobile]
  );

  // Measure path length & exact node coordinates on mount / layout change
  const [nodePoints, setNodePoints] = useState(() =>
    NODE_T.map(() => ({ x: viewBox.width / 2, y: 0 }))
  );
  const totalLengthRef = useRef(1);

  useEffect(() => {
    const pathEl = measurePathRef.current;
    if (!pathEl) return;
    const len = pathEl.getTotalLength();
    totalLengthRef.current = len || 1;
    const pts = NODE_T.map((t) => {
      const p = pathEl.getPointAtLength(t * len);
      return { x: p.x, y: p.y };
    });
    setNodePoints(pts);
  }, [pathD]);

  // Measure canvas & viewport heights for pinned camera Y translation (throttled with rAF)
  const [scrollBounds, setScrollBounds] = useState({ startY: 40, endY: -1800 });

  useEffect(() => {
    let rafId = null;
    const measure = () => {
      if (!canvasRef.current) return;
      const vh = window.innerHeight || 800;
      const ch = canvasRef.current.offsetHeight || vh * 3.8;
      const startY = Math.round(vh * 0.08);
      const endY = -Math.max(0, ch - vh + Math.round(vh * 0.04));
      setScrollBounds({ startY, endY });
    };

    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // Scroll tracking & spring smoothing
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, SPRING_CONFIG);
  const canvasY = useTransform(smooth, [0, 1], [scrollBounds.startY, scrollBounds.endY]);
  const drawProgress = useTransform(smooth, [0.05, 0.95], [0, 1]);

  // Subtle parallax for decorative sparkles & radial glow
  const glowY = useTransform(smooth, [0, 1], ['-10%', '65%']);
  const decoSlowY = useTransform(smooth, [0, 1], [0, -140]);
  const decoFastY = useTransform(smooth, [0, 1], [0, -260]);

  // Track which steps have been reached (only updates React state when count changes)
  const [activeIndex, setActiveIndex] = useState(0);

  // Motion values for the glowing sun head (zero per-frame React re-renders)
  const headLeftPct = useMotionValue(
    ((isMobile ? MOBILE_START.x : DESKTOP_START.x) / viewBox.width) * 100
  );
  const headTopPct = useMotionValue(
    ((isMobile ? MOBILE_START.y : DESKTOP_START.y) / viewBox.height) * 100
  );
  const headAngle = useMotionValue(0);
  const headOpacity = useMotionValue(0);

  useMotionValueEvent(drawProgress, 'change', (v) => {
    // Update active step index only when crossing thresholds
    let nextActive = 0;
    for (let i = 0; i < NODE_T.length; i++) {
      if (v >= NODE_T[i] - 0.015) {
        nextActive = i + 1;
      }
    }
    setActiveIndex((prev) => (prev === nextActive ? prev : nextActive));

    // Update sun head position & tangent angle directly on motionValues
    const pathEl = measurePathRef.current;
    if (!pathEl) return;
    const len = totalLengthRef.current;
    const clamped = Math.max(0, Math.min(1, v));
    const dist = clamped * len;
    const pt = pathEl.getPointAtLength(dist);
    const ptAhead = pathEl.getPointAtLength(Math.min(len, dist + 6));
    const angleDeg =
      (Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * 180) / Math.PI;

    headLeftPct.set((pt.x / viewBox.width) * 100);
    headTopPct.set((pt.y / viewBox.height) * 100);
    headAngle.set(angleDeg * 0.25);

    if (clamped < 0.006 || clamped > 0.985) {
      headOpacity.set(0);
    } else if (clamped < 0.03) {
      headOpacity.set((clamped - 0.006) / 0.024);
    } else if (clamped > 0.955) {
      headOpacity.set((0.985 - clamped) / 0.03);
    } else {
      headOpacity.set(1);
    }
  });

  const headLeftStyle = useTransform(headLeftPct, (val) => `${val}%`);
  const headTopStyle = useTransform(headTopPct, (val) => `${val}%`);

  const displayStep = String(Math.max(1, activeIndex)).padStart(2, '0');

  return (
    <section
      ref={wrapperRef}
      className={`steps${reducedMotion ? ' steps--reduced' : ''}`}
      data-theme="light"
      aria-labelledby="steps-heading"
    >
      {/* Hidden SVG solely for exact path length / point measurement */}
      <svg className="steps__measure-svg" aria-hidden="true">
        <path ref={measurePathRef} d={pathD} />
      </svg>

      <div className="steps__sticky">
        {/* Scroll-reactive radial sun glow */}
        <motion.div
          className="steps__bg-glow"
          style={reducedMotion ? undefined : { top: glowY }}
          aria-hidden="true"
        />

        {/* Intro Header */}
        <header className="steps__header">
          <span className="steps__eyebrow">How it works</span>
          <h2 id="steps-heading" className="steps__heading">
            Your solar journey, step by step
          </h2>
        </header>

        {/* Corner Progress Indicator */}
        {!reducedMotion && (
          <div className="steps__counter" aria-live="polite">
            <span className="steps__counter-current">{displayStep}</span>
            <span className="steps__counter-sep">/</span>
            <span className="steps__counter-total">04</span>
          </div>
        )}

        {/* Subtle Floating Parallax Sparkles */}
        {!reducedMotion && (
          <div className="steps__decor" aria-hidden="true">
            <motion.span
              className="steps__sparkle steps__sparkle--1"
              style={{ y: decoSlowY }}
            />
            <motion.span
              className="steps__sparkle steps__sparkle--2"
              style={{ y: decoFastY }}
            />
            <motion.span
              className="steps__dot steps__dot--1"
              style={{ y: decoFastY }}
            />
            <motion.span
              className="steps__dot steps__dot--2"
              style={{ y: decoSlowY }}
            />
          </div>
        )}

        {/* Pinned Camera Canvas */}
        <motion.div
          ref={canvasRef}
          className="steps__canvas"
          style={reducedMotion ? undefined : { y: canvasY }}
        >
          <svg
            className="steps__svg"
            viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {/* Faded full-length track */}
            <path
              d={pathD}
              className="steps__track-path"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Solid sun-yellow drawn ribbon */}
            <motion.path
              d={pathD}
              className="steps__draw-path"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={reducedMotion ? undefined : 1}
              style={reducedMotion ? undefined : { pathLength: drawProgress }}
            />
          </svg>

          {/* HTML Overlay aligned 1:1 with SVG viewBox */}
          <div className="steps__overlay">
            {STEPS_CONTENT.map((step, i) => (
              <StepNode
                key={step.number}
                step={step}
                index={i}
                t={NODE_T[i]}
                point={nodePoints[i]}
                viewBox={viewBox}
                drawProgress={drawProgress}
                isRevealed={i < activeIndex}
                isMobile={isMobile}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}

            {/* Glowing Sun Leading Head */}
            {!reducedMotion && (
              <motion.div
                className="steps__head"
                aria-hidden="true"
                style={{
                  left: headLeftStyle,
                  top: headTopStyle,
                  opacity: headOpacity,
                  rotate: headAngle,
                }}
              >
                <svg
                  className="steps__head-svg"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <g className="steps__head-rays">
                    <line x1="24" y1="2" x2="24" y2="9" />
                    <line x1="24" y1="39" x2="24" y2="46" />
                    <line x1="2" y1="24" x2="9" y2="24" />
                    <line x1="39" y1="24" x2="46" y2="24" />
                    <line x1="8.4" y1="8.4" x2="13.4" y2="13.4" />
                    <line x1="34.6" y1="34.6" x2="39.6" y2="39.6" />
                    <line x1="39.6" y1="8.4" x2="34.6" y2="13.4" />
                    <line x1="13.4" y1="34.6" x2="8.4" y2="39.6" />
                  </g>
                  <circle cx="24" cy="24" r="9" className="steps__head-core" />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProcessSteps;


import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import {
  getFramePaths,
  preloadFrames,
  closeFrames,
} from './FrameLoader';

import Overlay from './Overlay';
import Loader from './Loader';
import CurvedMarquee from './CurvedMarquee';
import './ScrollCanvas.css';

const HOOK_LINE_1 = ['No', 'More', 'Searching', 'for', 'Solar', 'Experts.'];
const HOOK_LINE_2_HIGHLIGHT = ['Every', 'Solution', 'in', 'One', 'Place.'];

gsap.registerPlugin(ScrollTrigger);

const ScrollCanvas = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const transitionSurfaceRef = useRef(null);
  const transitionGlowRef = useRef(null);
  const transitionContentRef = useRef(null);
const [introVisible, setIntroVisible] = useState(false);
  const frameIndexRef = useRef(0);
  const imagesRef = useRef([]);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeExit, setFadeExit] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const reducedMotion = useReducedMotion();

  // Draw a frame while preserving its aspect ratio.
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    let img = null;

    for (let i = index; i >= 0 && !img; i -= 1) {
      img = imagesRef.current[i];
    }

    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imageRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > canvasRatio) {
      drawWidth = canvasHeight * imageRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      drawHeight = canvasWidth / imageRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Keep the canvas at the current viewport size.
 
const fitCanvas = () => {
  const canvas = canvasRef.current;

  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawFrame(frameIndexRef.current);
};


  const handleBookNow = () => {
    const contact = document.getElementById('contact');

    if (contact) {
      contact.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  // Start at the top when this hero mounts.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
  }, []);

  // Preload the image sequence.
  useEffect(() => {
    const controller = new AbortController();

    const { frames, promise } = preloadFrames({
      paths: getFramePaths(),
      signal: controller.signal,
      onProgress: setProgress,
      onPriorityReady: () => {
        setFadeExit(true);
        setImagesReady(true);
      },
    });

    imagesRef.current = frames;

    promise.catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Frame preload error:', error);
      }
    });

    return () => {
      controller.abort();
      closeFrames(frames);
      imagesRef.current = [];
    };
  }, []);

  // Paint the first frame underneath before the loader exits so there is no blank flash.
  useEffect(() => {
    if (!imagesReady) return;
    fitCanvas();
    frameIndexRef.current = 0;
    drawFrame(0);
  }, [imagesReady]);

  // Fade out the loader once the priority frames are ready.
  useEffect(() => {
    if (!fadeExit) return undefined;

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [fadeExit]);

  // Canvas animation and ivory-white handoff.
  useEffect(() => {
    if (!imagesReady || loading) return undefined;

    const container = containerRef.current;
    const scene = sceneRef.current;
    const surface = transitionSurfaceRef.current;
    const glow = transitionGlowRef.current;
    const content = transitionContentRef.current;

    if (!container || !scene || !surface || !glow || !content) {
      return undefined;
    }

    const totalFrames = imagesRef.current.length;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    fitCanvas();
    frameIndexRef.current = 0;
    drawFrame(0);

    const context = gsap.context(() => {
      // Initial states.
      gsap.set(surface, {
        autoAlpha: 1,
        clipPath: 'inset(50% 0% 50% 0%)',
      });

      gsap.set(glow, {
        autoAlpha: 0,
      });

      gsap.set(content, {
        autoAlpha: 0,
        y: 24,
      });

      if (!reduceMotion && totalFrames > 0) {
        /*
         * PHASE 1:
         * The solar image sequence plays across the first part
         * of the hero scroll.
         *
         * It reaches its final frame before the ivory reveal starts.
         */
        const frameObject = { index: 0 };

        gsap.to(frameObject, {
          index: totalFrames - 1,
          ease: 'none',

          scrollTrigger: {
            id: 'solar-frame-sequence',
            trigger: container,
            start: 'top top',

            // Finish the image sequence at 3.5 viewport heights.
            end: () => `top -${window.innerHeight * 3.5}px`,

            scrub: 0.25,
            invalidateOnRefresh: true,
          },

          onUpdate: () => {
            const nextFrame = Math.min(
              totalFrames - 1,
              Math.max(0, Math.round(frameObject.index))
            );

            if (frameIndexRef.current !== nextFrame) {
              frameIndexRef.current = nextFrame;
              drawFrame(nextFrame);
            }
          },
        });

        /*
         * PHASE 2:
         * A single ivory surface expands over the full-screen
         * solar image. No grid, tiles, or intermediate grey screen.
         */
        const transitionTimeline = gsap.timeline({
          scrollTrigger: {
            id: 'solar-ivory-handoff',
            trigger: container,

            // Starts exactly where the frame sequence finishes.
            start: () => `top -${window.innerHeight * 3.5}px`,
            end: 'bottom bottom',

            scrub: 0.65,
            invalidateOnRefresh: true,

            onUpdate: (self) => {
              document.documentElement.dataset.theme =
                self.progress >= 0.18 ? 'light' : 'dark';

                  setIntroVisible(self.progress >= 0.25);
            },

            onLeave: () => {
              document.documentElement.dataset.theme = 'light';
            },

            onLeaveBack: () => {
              document.documentElement.dataset.theme = 'dark';
            },
          },
        });

        // A soft golden-white glow appears over the solar image.
        transitionTimeline.to(
          glow,
          {
            autoAlpha: 1,
            duration: 0.22,
            ease: 'power1.out',
          },
          0
        );

        // The solar image gently brightens as the glow appears.
        transitionTimeline.to(
          scene,
          {
            filter: 'brightness(1.12) saturate(1.08)',
            duration: 0.28,
            ease: 'power1.out',
          },
          0
        );

        // The ivory surface expands from the centre to every edge.
        transitionTimeline.to(
          surface,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.72,
            ease: 'power2.inOut',
          },
          0.12
        );

        // The text starts appearing early, on the expanding surface.
        transitionTimeline.to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.24,
            ease: 'power2.out',
          },
          0.25
        );

        // The golden glow softly disappears into the ivory background.
        transitionTimeline.to(
          glow,
          {
            autoAlpha: 0,
            duration: 0.38,
            ease: 'power1.out',
          },
          0.48
        );

        // The solar image fades only after the ivory surface covers it.
        transitionTimeline.to(
          scene,
          {
            filter: 'brightness(1) saturate(1)',
            duration: 0.25,
            ease: 'none',
          },
          0.58
        );
      } else {
        // Reduced-motion users get a stable, readable ivory handoff.
        gsap.set(surface, {
          clipPath: 'inset(0% 0% 0% 0%)',
        });

        gsap.set(content, {
          autoAlpha: 1,
          y: 0,
        });

        document.documentElement.dataset.theme = 'light';
      }

      // Fade the original hero heading early in the scroll.
      gsap.to('.hero-heading', {
        opacity: 0,
        y: -40,
        ease: 'none',

        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'top -15%',
          scrub: true,
        },
      });

      // Fade the scroll indicator early as well.
      gsap.to('.scroll-indicator', {
        opacity: 0,
        ease: 'none',

        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'top -8%',
          scrub: true,
        },
      });
    }, container);

    if (reduceMotion) {
      container.classList.add('is-static');
    }

    let lastWidth = window.innerWidth;

    const handleResize = () => {
      if (window.innerWidth === lastWidth) return;

      lastWidth = window.innerWidth;

      fitCanvas();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('resize', handleResize);

      container.classList.remove('is-static');

      context.revert();
    };
  }, [imagesReady, loading]);

  return (
    <>
      {loading && <Loader progress={progress} fadeExit={fadeExit} />}

      <div
        className="scroll-animation-container"
        ref={containerRef}
      >
        <div className="canvas-sticky-wrapper">
          <div className="hero-tile-scene" ref={sceneRef}>
            {/* The solar canvas stays full-screen throughout. */}
            <div className="hero-solar-tile">
              <canvas
                className="scroll-canvas"
                ref={canvasRef}
              />
            </div>

            {/* Soft solar-gold light layer. */}
            <div
              className="hero-transition-glow"
              ref={transitionGlowRef}
            />

            {/* One expanding ivory-white surface. */}
            <div
              className="hero-transition-surface"
              ref={transitionSurfaceRef}
              data-theme="light"
            >
              <div
                className="hero-transition-content sc-hook"
                ref={transitionContentRef}
              >
                <div className="sc-hook__eyebrow">
                  <svg
                    className="sc-hook__sun-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                    <path
                      d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>ONE PLACE FOR SOLAR</span>
                </div>

                <h2 className="sc-hook__headline">
                  {HOOK_LINE_1.map((word, idx) => (
                    <span
                      key={`l1-${idx}`}
                      className={`sc-hook__word-mask${
                        idx === HOOK_LINE_1.length - 1
                          ? ' sc-hook__word-mask--last'
                          : ''
                      }`}
                    >
                      <motion.span
                        className="sc-hook__word"
                        initial={false}
                        animate={
                          reducedMotion || introVisible
                            ? { y: '0%' }
                            : { y: '110%' }
                        }
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.48,
                                delay: introVisible ? idx * 0.05 : 0,
                                ease: [0.16, 1, 0.3, 1],
                              }
                        }
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                  <br className="sc-hook__br" />
                  <span className="sc-hook__word-mask">
                    <motion.span
                      className="sc-hook__word"
                      initial={false}
                      animate={
                        reducedMotion || introVisible
                          ? { y: '0%' }
                          : { y: '110%' }
                      }
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.48,
                              delay: introVisible ? HOOK_LINE_1.length * 0.05 : 0,
                              ease: [0.16, 1, 0.3, 1],
                            }
                      }
                    >
                      Get
                    </motion.span>
                  </span>
                  <motion.span
                    className="sc-hook__highlight"
                    initial={false}
                    animate={
                      reducedMotion || introVisible
                        ? { backgroundSize: '100% 100%' }
                        : { backgroundSize: '0% 100%' }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.55,
                            delay: introVisible ? 0.55 : 0,
                            ease: [0.16, 1, 0.3, 1],
                          }
                    }
                  >
                    {HOOK_LINE_2_HIGHLIGHT.map((word, idx) => {
                      const wordIndex = HOOK_LINE_1.length + 1 + idx;
                      const isLast = idx === HOOK_LINE_2_HIGHLIGHT.length - 1;
                      return (
                        <span
                          key={`l2-${idx}`}
                          className={`sc-hook__word-mask${
                            isLast ? ' sc-hook__word-mask--last' : ''
                          }`}
                        >
                          <motion.span
                            className="sc-hook__word"
                            initial={false}
                            animate={
                              reducedMotion || introVisible
                                ? { y: '0%' }
                                : { y: '110%' }
                            }
                            transition={
                              reducedMotion
                                ? { duration: 0 }
                                : {
                                    duration: 0.48,
                                    delay: introVisible ? wordIndex * 0.05 : 0,
                                    ease: [0.16, 1, 0.3, 1],
                                  }
                            }
                          >
                            {word}
                          </motion.span>
                        </span>
                      );
                    })}
                  </motion.span>
                </h2>

                <CurvedMarquee
                  containerRef={containerRef}
                  visible={introVisible}
                />
              </div>
            </div>
          </div>

          {!loading && (
            <Overlay onBookNowClick={handleBookNow} />
          )}
        </div>
      </div>
    </>
  );
};

export default ScrollCanvas;

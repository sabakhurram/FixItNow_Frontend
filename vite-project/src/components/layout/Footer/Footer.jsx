
import { useEffect, useRef } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';
import logo from '../../../assets/FixItNow Logo.png';

// Simple SVG social icons
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0, edge1, x) => {
  const t = clamp(
    (x - edge0) / Math.max(Math.abs(edge1 - edge0), 0.0001) *
      (edge1 < edge0 ? -1 : 1),
    0,
    1
  );

  return t * t * (3 - 2 * t);
};

const Footer = () => {
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const footerRef = useRef(null);
  const revealBodyRef = useRef(null);
  const wordmarkWrapRef = useRef(null);
  const leftPartRef = useRef(null);
  const rightPartRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let rafId = null;

    let currentRevealProgress = 0;
    let currentWordProgress = 0;
    let currentParallax = 0;

    const resetStatic = () => {
      if (revealBodyRef.current) {
        revealBodyRef.current.style.setProperty(
          '--reveal-progress',
          '1'
        );

        revealBodyRef.current.style.transform = 'none';
        revealBodyRef.current.style.opacity = '1';
      }

      [leftPartRef, rightPartRef].forEach((ref) => {
        if (ref.current) {
          ref.current.style.transform = 'none';
          ref.current.style.opacity = '1';
        }
      });

      if (heroRef.current) {
        heroRef.current.style.setProperty('--hero-parallax-y', '0px');
        heroRef.current.style.setProperty('--hero-scale', '1');
      }
    };

    const tick = () => {
      rafId = null;

      const footer = footerRef.current;
      const hero = heroRef.current;
      const revealBody = revealBodyRef.current;
      const left = leftPartRef.current;
      const right = rightPartRef.current;
      const wordWrap = wordmarkWrapRef.current;

      if (!footer || !hero || !revealBody || !left || !right) {
        return;
      }

      if (reduceMotion) {
        resetStatic();
        return;
      }

      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;
      const isMobile = vw < 768;

      const footerRect = footer.getBoundingClientRect();
      const wordRect = wordWrap
        ? wordWrap.getBoundingClientRect()
        : footerRect;

      // Footer content reveals as the footer rises behind the image.
      const targetReveal = smoothstep(
        vh * 0.95,
        vh * 0.22,
        footerRect.top
      );

      // Wordmark animation starts later than the main footer reveal.
      const targetWord = smoothstep(
        vh * 1.05,
        vh * 0.55,
        wordRect.top
      );

      // Image parallax
      const totalSpan = vh + footerRect.height;
      const footerRatio = clamp(
        (vh - footerRect.top) / Math.max(totalSpan, 1),
        0,
        1
      );

      const targetParallax =
        (0.5 - footerRatio) * (isMobile ? 24 : 42);

      // Smooth interpolation
      const damping = 0.13;

      currentRevealProgress +=
        (targetReveal - currentRevealProgress) * damping;

      currentWordProgress +=
        (targetWord - currentWordProgress) * damping;

      currentParallax +=
        (targetParallax - currentParallax) * damping;

      // Snap when close to the target
      if (Math.abs(targetReveal - currentRevealProgress) < 0.001) {
        currentRevealProgress = targetReveal;
      }

      if (Math.abs(targetWord - currentWordProgress) < 0.001) {
        currentWordProgress = targetWord;
      }

      if (Math.abs(targetParallax - currentParallax) < 0.05) {
        currentParallax = targetParallax;
      }

     // Smooth footer content reveal as the image scrolls away
const riseY = (1 - currentRevealProgress) * (isMobile ? 25 : 45);

revealBody.style.transform =
  `translate3d(0, ${riseY}px, 0)`;

revealBody.style.opacity =
  `${currentRevealProgress}`;
      

      // Image parallax + zoom
      const imageScale = 1.04 + currentRevealProgress * 0.045;

      hero.style.setProperty(
        '--hero-parallax-y',
        `${currentParallax}px`
      );

      hero.style.setProperty(
        '--hero-scale',
        imageScale.toFixed(3)
      );

      // Continue animation only while values are still changing
      const stillMoving =
        Math.abs(targetReveal - currentRevealProgress) > 0.001 ||
        Math.abs(targetWord - currentWordProgress) > 0.001 ||
        Math.abs(targetParallax - currentParallax) > 0.05;

      if (stillMoving && rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick);
      }
    };

    tick();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    window.addEventListener('resize', handleScroll, {
      passive: true,
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div ref={stageRef} className="footer-stage">

      {/* Foreground image section */}
      <section
        ref={heroRef}
        className="footer__hero"
        aria-label="Footer feature"
      >
        <div className="footer__hero-content">
          <p className="footer__tagline">
            Pakistan&apos;s #1 premium solar energy partner.
            Powering homes and businesses with clean,
            reliable solar solutions since 2009.
          </p>

          <a href="#contact" className="footer__cta">
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer revealed from underneath the image */}
      <footer
        ref={footerRef}
        id="contact"
        className="footer"
        data-theme="light"
      >
        <div className="footer__inner">

          <div
            ref={revealBodyRef}
            className="footer__reveal-body"
          >
            <div className="footer__grid">

              {/* Brand */}
              <div className="footer__col">
                <a href="#home" className="footer__logo">
                  <img
                    src={logo}
                    alt="FixItNow Logo"
                    className="footer__logo-img"
                  />
                </a>

                <div className="footer__socials">
                  <a href="#" aria-label="Facebook">
                    <FacebookIcon />
                  </a>

                  <a href="#" aria-label="Instagram">
                    <InstagramIcon />
                  </a>

                  <a href="#" aria-label="LinkedIn">
                    <LinkedinIcon />
                  </a>

                  <a href="#" aria-label="YouTube">
                    <YoutubeIcon />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="footer__col">
                <h4>Quick Links</h4>

                <ul>
                  <li><a href="#home">Home</a></li>
                  <li><a href="#services">Services</a></li>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#testimonials">Testimonials</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>

              {/* Services */}
              <div className="footer__col">
                <h4>Our Services</h4>

                <ul>
                  <li><a href="#services">Residential Solar</a></li>
                  <li><a href="#services">Commercial Farms</a></li>
                  <li><a href="#services">Battery Storage</a></li>
                  <li><a href="#services">Maintenance Plans</a></li>
                  <li><a href="#services">Energy Monitoring</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="footer__col">
                <h4>Contact Us</h4>

                <div className="footer__contact-item">
                  <MapPin size={16} />
                  <span>
                    45-B, Solar Avenue, Gulberg III, Lahore
                  </span>
                </div>

                <div className="footer__contact-item">
                  <Phone size={16} />
                  <span>+92 300 123 4567</span>
                </div>

                <div className="footer__contact-item">
                  <Mail size={16} />
                  <span>hello@fixitnow.pk</span>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="footer__bottom">
              <p>
                &copy; {new Date().getFullYear()} FixItNow.
                All rights reserved.
              </p>

              <p>Made with ☀️ by FixItNow</p>
            </div>
          </div>

          {/* Giant split wordmark */}
          <div
            ref={wordmarkWrapRef}
            className="footer__wordmark-wrap"
            aria-hidden="true"
          >
            <div className="footer__wordmark">
              <span
                ref={leftPartRef}
                className="footer__wordmark-part footer__wordmark-left"
              >
                FixIt
              </span>

              <span
                ref={rightPartRef}
                className="footer__wordmark-part footer__wordmark-right"
              >
                Now
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Footer;

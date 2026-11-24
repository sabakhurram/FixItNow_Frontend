import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const STATS = [
  { end: 12, suffix: 'K+', decimals: 0, label: 'Jobs completed' },
  { end: 4.9, suffix: '/5', decimals: 1, label: 'Average rating' },
];

/* Becomes true the first time the element scrolls into view */
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function CountUp({ end, suffix = '', decimals = 0, start, duration = 1600 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return undefined;
    }

    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      setValue(end * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, end, duration]);

  return (
    <>
      {value.toFixed(decimals)}
      {suffix}
    </>
  );
}

/**
 * Optional props: mainImage, detailImage (imported image assets).
 * Without them, soft placeholder blocks are shown.
 */
export default function About({ mainImage = 'https://images.pexels.com/photos/17842832/pexels-photo-17842832.jpeg', detailImage = 'https://images.pexels.com/photos/8853537/pexels-photo-8853537.jpeg' }) {
  const [ref, inView] = useInView();

  return (
    <section
      id="about"
      ref={ref}
      className={`about ${inView ? 'about--visible' : ''}`}
      aria-labelledby="about-heading"
    >
      <div className="about__container">
        {/* Left column */}
        <div className="about__content">
          <h2 id="about-heading" className="about__heading about__reveal">
            About Us
          </h2>

        <div className="about__columns">
  <p className="about__text about__reveal" style={{ '--delay': '120ms' }}>
    We specialize in reliable solar energy solutions for homes and
    businesses, providing expert solar panel installation, system
    design, and energy-efficient solutions tailored to your needs.
  </p>

  <p className="about__text about__reveal" style={{ '--delay': '200ms' }}>
    From installation to maintenance, our experienced team ensures
    your solar system performs at its best. We are committed to
    quality, long-term reliability, and helping you reduce electricity
    costs while embracing a cleaner, more sustainable future.
  </p>
</div>

          <div className="about__detail about__reveal" style={{ '--delay': '280ms' }}>
            {detailImage ? (
              <img src={detailImage} alt="Technician tools ready for a home repair" loading="lazy" />
            ) : (
              <div className="about__placeholder" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="about__visual about__reveal" style={{ '--delay': '160ms' }}>
          <div className="about__main">
            {mainImage ? (
              <img
                src={mainImage}
                alt="FixItNow technician inspecting a home electrical panel"
                loading="lazy"
              />
            ) : (
              <div className="about__placeholder" aria-hidden="true" />
            )}
            <div className="about__tint" aria-hidden="true" />
          </div>

          <div className="about__card">
            <h3 className="about__card-title">Repairs you can trust</h3>
            <p className="about__card-text">
              Verified professionals, transparent prices and a service
              guarantee on every visit.
            </p>

            <ul className="about__stats">
              {STATS.map((stat) => (
                <li key={stat.label}>
                  <strong className="about__stat-value">
                    <CountUp {...stat} start={inView} />
                  </strong>
                  <span className="about__stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>

            <Link to="/products" className="about__arrow" aria-label="Browse our products">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}